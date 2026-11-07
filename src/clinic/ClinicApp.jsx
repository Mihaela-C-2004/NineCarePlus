import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { api, subscribe } from '../lib/api.js';
import { longDate, shortDate, timeAgo, weeksSince } from '../lib/dates.js';
import { EvolutionChart, Logo, Segmented, STATUS, ThemeToggle } from '../components/ui.jsx';
import { flagOf } from '../lib/ocr.js';

const CODE = 'DEMO';
const stage = (p) =>
  p.status === 'nascut' ? `După naștere${p.babyName ? ` (${p.babyName})` : ''}, ${weeksSince(p.birthDate)} săpt.` : p.status === 'incheiata' ? 'Sarcina s-a încheiat' : `Săptămâna ${p.week}`;

export default function ClinicApp() {
  const [ov, setOv] = useState(null);
  const [tab, setTab] = useState('requests');
  const [requestId, setRequestId] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [flash, setFlash] = useState(null);
  const [error, setError] = useState('');
  const sel = useRef({});
  sel.current = { requestId, patientId };
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    try {
      setOv(await api.overview(CODE));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    document.title = '9Care+ – panoul clinicii';
    delete document.documentElement.dataset.baby;
    load();
  }, [load]);

  useEffect(
    () =>
      subscribe((ev) => {
        if (ev.type === 'reset') {
          setRequestId(null);
          setPatientId(null);
        }
        load();
        setVersion((v) => v + 1);
        if (ev.type === 'request') {
          setFlash(ev.requestId);
          setTimeout(() => setFlash(null), 3000);
        }
      }),
    [load]
  );

  const reset = async () => {
    if (confirm('Readuci datele demo la starea inițială? Conturile create acum se șterg.')) await api.reset();
  };

  const newCount = ov?.requests.filter((r) => r.status === 'trimisa').length || 0;

  return (
    <div className="c-shell">
      <header className="c-header">
        <Logo size={38} />
        <div className="c-clinic">
          <strong>{ov?.clinic.name || 'Panoul clinicii'}</strong>
          <span className="muted">Panoul personalului medical</span>
        </div>
        <Segmented
          label="Secțiuni"
          value={tab}
          onChange={setTab}
          options={[
            ['requests', `Cereri${newCount ? ` (${newCount} noi)` : ''}`],
            ['patients', 'Paciente'],
            ['admin', 'Administrare'],
          ]}
        />
        <div className="header-actions">
          <ThemeToggle />
          <button className="btn btn-soft" onClick={reset}>Resetează demo</button>
        </div>
      </header>
      {error && <p className="error pad">{error}</p>}
      {!ov ? (
        <p className="muted pad">Se încarcă…</p>
      ) : tab === 'requests' ? (
        <div className="c-split">
          <aside className="c-list">
            {ov.requests.length === 0 && <p className="muted">Nicio cerere încă.</p>}
            {ov.requests.map((r) => (
              <button key={r.id} className={`c-row ${r.id === requestId ? 'on' : ''} ${r.id === flash ? 'flash' : ''}`} onClick={() => setRequestId(r.id)}>
                <span className="c-row-top"><strong>{r.motherName}</strong><span className={`status-pill s-${r.status}`}>{STATUS[r.status]}</span></span>
                <span>{r.type}</span>
                <span className="muted clamp">{r.preview}</span>
                <small className="muted">{timeAgo(r.createdAt)}</small>
              </button>
            ))}
          </aside>
          <main className="c-detail">
            {requestId ? (
              <RequestView key={requestId} requestId={requestId} overview={ov} version={version} onPatient={(id) => { setPatientId(id); setTab('patients'); }} />
            ) : (
              <p className="muted">Alege o cerere din listă. Cererile noi apar sus, fără refresh.</p>
            )}
          </main>
        </div>
      ) : tab === 'patients' ? (
        <Patients ov={ov} patientId={patientId} setPatientId={setPatientId} version={version} />
      ) : (
        <Admin ov={ov} reload={load} />
      )}
    </div>
  );
}

function usePatient(id, version) {
  const [b, setB] = useState(null);
  useEffect(() => {
    if (id) api.patient(id).then(setB).catch(() => setB(null));
  }, [id, version]);
  return b;
}

function RequestView({ requestId, overview, version, onPatient }) {
  const req = overview.requests.find((r) => r.id === requestId);
  const bundle = usePatient(req?.motherId, version);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  // Medicul deschide cererea: mama vede statusul „Văzută”.
  useEffect(() => {
    if (req?.status === 'trimisa') api.setRequestStatus(req.id, 'vazuta');
  }, [req?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!req) return <p className="muted">Cererea nu mai există.</p>;
  if (!bundle) return <p className="muted">Se încarcă…</p>;
  const full = bundle.requests.find((r) => r.id === requestId);
  const p = bundle.me;

  const send = async (resolve) => {
    if (!text.trim()) return;
    setBusy(true);
    await api.reply(req.id, text, resolve);
    setText('');
    setBusy(false);
  };
  return (
    <div className="stack">
      <div className="detail-head">
        <div>
          <h2>{full.type}</h2>
          <p className="muted">
            <button className="link-btn" onClick={() => onPatient(p.id)}>{p.firstName} {p.lastName}</button>, {stage(p)}. Trimisă {timeAgo(full.createdAt)}.
          </p>
        </div>
        <span className={`status-pill s-${full.status}`}>{STATUS[full.status]}</span>
      </div>

      <section className="panel ai-summary">
        <h3>Rezumat</h3>
        <p className="pre">{full.summary}</p>
        <p className="fine-print">Generat automat{full.summaryAi ? ' cu AI' : ' din datele raportate'}. Verifică datele.</p>
      </section>

      <section className="panel">
        <h3>Conversația</h3>
        <div className="thread">
          {full.messages.map((m) => (
            <div key={m.id} className={`bubble ${m.author === 'clinica' ? 'me' : 'bot'}`}>
              <small className="from">{m.author === 'clinica' ? 'Clinica' : p.firstName}</small>
              <p>{m.text}</p>
              <small className="time">{timeAgo(m.createdAt)}</small>
            </div>
          ))}
        </div>
        <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrie răspunsul pentru pacientă" aria-label="Răspuns" />
        <div className="row-buttons">
          <button className="btn btn-soft" disabled={busy || !text.trim()} onClick={() => send(false)}>Trimite răspunsul</button>
          <button className="btn btn-primary" disabled={busy || !text.trim()} onClick={() => send(true)}>Trimite și marchează rezolvată</button>
          {!text.trim() && full.status !== 'rezolvata' && (
            <button className="link-btn" onClick={() => api.setRequestStatus(full.id, 'rezolvata')}>Marchează rezolvată fără răspuns</button>
          )}
        </div>
      </section>

      <section className="panel">
        <h3>Evoluția ultimelor 14 zile</h3>
        {full.includeEvolution ? <EvolutionChart checkins={bundle.checkins} days={14} /> : <p className="muted">Pacienta nu a atașat evoluția la această cerere.</p>}
      </section>
    </div>
  );
}

function Patients({ ov, patientId, setPatientId, version }) {
  const [sort, setSort] = useState('open');
  const sorted = [...ov.patients].sort((a, b) =>
    sort === 'open' ? b.openRequests - a.openRequests || (b.maxPain7d ?? -1) - (a.maxPain7d ?? -1)
      : sort === 'pain' ? (b.maxPain7d ?? -1) - (a.maxPain7d ?? -1)
        : (b.lastCheckin || '').localeCompare(a.lastCheckin || '')
  );
  return (
    <div className="c-split">
      <aside className="c-list">
        <label className="field">
          <span>Ordonează după</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="open">Cereri deschise</option>
            <option value="pain">Durerea maximă din 7 zile</option>
            <option value="recent">Ultimul check-in</option>
          </select>
        </label>
        <p className="fine-print">Ordonarea doar afișează datele. Nu e o alertă automată.</p>
        {sorted.map((p) => (
          <button key={p.id} className={`c-row ${p.id === patientId ? 'on' : ''}`} onClick={() => setPatientId(p.id)}>
            <span className="c-row-top"><strong>{p.firstName} {p.lastName}</strong>{p.minor && <span className="status-pill s-minor">Minoră</span>}</span>
            <span className="muted">{stage(p)}</span>
            <span className="muted small">Ultimul check-in: {p.lastCheckin ? shortDate(p.lastCheckin) : '–'}. Durere maximă (7 zile): {p.maxPain7d ?? '–'}/10. Cereri deschise: {p.openRequests}.</span>
          </button>
        ))}
      </aside>
      <main className="c-detail">
        {patientId ? <PatientView id={patientId} version={version} /> : <p className="muted">Alege o pacientă din listă.</p>}
      </main>
    </div>
  );
}

function PatientView({ id, version }) {
  const b = usePatient(id, version);
  const [days, setDays] = useState(14);
  if (!b) return <p className="muted">Se încarcă…</p>;
  const p = b.me;
  const lab = b.labs[0];
  return (
    <div className="stack">
      <div className="detail-head">
        <div>
          <h2>{p.firstName} {p.lastName}</h2>
          <p className="muted">{stage(p)}. {p.status === 'nascut' ? `Născut pe ${longDate(p.birthDate)}` : `Data estimată: ${longDate(p.dueDate)}`}.</p>
        </div>
      </div>
      {p.minor && (
        <div className="note row-between">
          <span>Pacientă minoră. {p.minorConfirmed ? 'Acordul a fost confirmat de clinică.' : 'Confirmă acordul cerut de lege (inclusiv al reprezentantului legal, unde e necesar).'}</span>
          {!p.minorConfirmed && <button className="btn btn-soft" onClick={() => api.updatePatient(p.id, { minorConfirmed: true })}>Confirmă acordul</button>}
        </div>
      )}
      {b.noConsent && <p className="note">Pacienta și-a retras acordul pentru trimiterea datelor de sănătate. Nu vezi check-in-urile și analizele ei.</p>}

      <section className="panel">
        <div className="card-head">
          <h3>Starea, durerea și somnul</h3>
          <Segmented label="Perioada" value={days} onChange={setDays} options={[[14, '14 zile'], [30, '30 de zile']]} />
        </div>
        <EvolutionChart checkins={b.checkins} days={days} height={240} />
      </section>

      <div className="panel-grid">
        <section className="panel">
          <h3>Cereri</h3>
          {b.requests.length === 0 && <p className="muted">Nicio cerere.</p>}
          <ul className="plain-list">
            {b.requests.map((r) => (
              <li key={r.id}><span>{r.type}, {shortDate(r.createdAt)}</span><span className={`status-pill s-${r.status}`}>{STATUS[r.status]}</span></li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h3>Programări</h3>
          <p className="muted">Programările se fac telefonic, nu din aplicație.</p>
        </section>
      </div>

      <section className="panel">
        <h3>Analize</h3>
        {!lab ? <p className="muted">Pacienta nu a trimis analize.</p> : (
          <div className="table-wrap">
            <p className="muted">Trimise {timeAgo(lab.createdAt)}</p>
            <table className="lab-table">
              <thead><tr><th>Analiza</th><th>Valoare</th><th>Interval</th></tr></thead>
              <tbody>
                {lab.values.map((v) => {
                  const f = flagOf(v);
                  return (
                    <tr key={v.key} className={f !== 'ok' ? 'out' : ''}>
                      <th scope="row">{v.name}</th>
                      <td>{String(v.value).replace('.', ',')} {v.unit}{f !== 'ok' && <span className="flag">{f === 'sub' ? 'sub interval' : 'peste interval'}</span>}</td>
                      <td className="muted">{v.refMin != null ? `${v.refMin}–${v.refMax}` : '–'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h3>Cursuri</h3>
        <p className="muted">{b.progress.length ? `${b.progress.length} lecții terminate.` : 'Nicio lecție terminată încă.'}</p>
      </section>
    </div>
  );
}

function Admin({ ov, reload }) {
  const [qr, setQr] = useState({ url: '', img: '' });
  const [hours, setHours] = useState(ov.clinic.responseHours);
  const [saved, setSaved] = useState(false);
  const [ai, setAi] = useState(null);
  useEffect(() => {
    api.info().then(({ ips, ai }) => {
      setAi(ai);
      const host = ['localhost', '127.0.0.1'].includes(location.hostname) && ips[0] ? ips[0] : location.hostname;
      const url = `${location.protocol}//${host}${location.port ? `:${location.port}` : ''}/?clinica=${ov.clinic.code}`;
      QRCode.toDataURL(url, { margin: 1, width: 360 }).then((img) => setQr({ url, img }));
    });
  }, [ov.clinic.code]);
  const s = ov.stats;
  return (
    <div className="admin">
      <section className="panel qr-panel">
        <h3>Înscrierea mamelor</h3>
        {qr.img && <img src={qr.img} alt={`Cod QR pentru înscriere: ${qr.url}`} />}
        <p>Codul clinicii: <strong className="code">{ov.clinic.code}</strong></p>
        <small className="muted break">{qr.url}</small>
      </section>
      <div className="stack">
        <div className="stats">
          <div className="stat"><strong>{s.activeThisMonth}</strong><span>paciente active luna aceasta</span></div>
          <div className="stat"><strong>{s.requestsLast7d}</strong><span>cereri în ultimele 7 zile</span></div>
          <div className="stat"><strong>{s.avgResponseHours == null ? '–' : `${s.avgResponseHours.toLocaleString('ro-RO', { maximumFractionDigits: 1 })} h`}</strong><span>timp mediu de răspuns</span></div>
        </div>
        <section className="panel">
          <h3>Facturare (estimare)</h3>
          <p>{s.activeThisMonth} paciente active × {s.pricePerPatient} lei = <strong>{s.activeThisMonth * s.pricePerPatient} lei</strong> luna aceasta.</p>
          <p className="fine-print">O pacientă e activă dacă a deschis aplicația cel puțin o dată în lună. Prețul e o ipoteză de testat.</p>
        </section>
        <section className="panel">
          <h3>Timpul de răspuns afișat mamelor</h3>
          <form className="row-buttons" onSubmit={async (e) => { e.preventDefault(); await api.updateClinic(ov.clinic.code, { responseHours: Number(hours) }); setSaved(true); reload(); }}>
            <input type="number" min="1" max="168" value={hours} onChange={(e) => { setHours(e.target.value); setSaved(false); }} aria-label="Ore" className="short-input" />
            <span>ore</span>
            <button className="btn btn-soft">Salvează</button>
            {saved && <span className="success-text">Salvat</span>}
          </form>
        </section>
        <section className="panel">
          <h3>Asistentul AI</h3>
          <p>{ai ? 'Activ: răspunde cu AI din articolele aprobate.' : 'Mod demo: fără cheie API, răspunde cu rezumatul articolului potrivit. Vezi README pentru activare.'}</p>
        </section>
      </div>
    </div>
  );
}
