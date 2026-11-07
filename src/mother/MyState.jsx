import { useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { localDate, longDate } from '../lib/dates.js';
import { Banner112, EvolutionChart, Icon, Segmented } from '../components/ui.jsx';
import { readImage, parseLabText, flagOf } from '../lib/ocr.js';
import { ANALYTES } from '../data/analytes.js';

const MOODS = [
  [1, '😣', 'Foarte rău'],
  [2, '🙁', 'Rău'],
  [3, '😐', 'Așa și așa'],
  [4, '🙂', 'Bine'],
  [5, '😊', 'Foarte bine'],
];
const SLEEP = [
  [3, 'Bine'],
  [2, 'Așa și așa'],
  [1, 'Prost'],
];
const Speech = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

/** Dictare în română (Chrome, Edge). Returnează un buton sau nimic, dacă browserul nu suportă. */
export function DictateButton({ onText }) {
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  if (!Speech) return null;
  const toggle = () => {
    if (on) return ref.current?.stop();
    const r = new Speech();
    r.lang = 'ro-RO';
    r.onresult = (e) => onText(Array.from(e.results).map((x) => x[0].transcript).join(' '));
    r.onend = () => setOn(false);
    ref.current = r;
    r.start();
    setOn(true);
  };
  return (
    <button type="button" className={`btn btn-soft ${on ? 'recording' : ''}`} onClick={toggle}>
      <Icon name="mic" size={18} /> {on ? 'Te ascult… apasă ca să oprești' : 'Dictează'}
    </button>
  );
}

export default function MyState(props) {
  const [view, setView] = useState('checkin');
  return (
    <section className="stack">
      <h1 className="screen-title">Starea mea</h1>
      <Segmented label="Starea mea" value={view} onChange={setView} options={[['checkin', 'Check-in'], ['labs', 'Analize']]} />
      {view === 'checkin' ? <CheckIn {...props} /> : <Labs {...props} />}
    </section>
  );
}

function CheckIn({ data, refresh, go }) {
  const today = data.checkins.find((c) => c.date === localDate());
  const [mood, setMood] = useState(today?.mood ?? null);
  const [pain, setPain] = useState(today?.pain ?? 0);
  const [sleep, setSleep] = useState(today?.sleep ?? null);
  const [note, setNote] = useState(today?.note ?? '');
  const [days, setDays] = useState(14);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!mood || !sleep) return setError('Alege cum te simți și cum ai dormit.');
    setBusy(true);
    setError('');
    try {
      await api.saveCheckin({ mood, pain, sleep, note });
      await refresh();
      setMsg(today ? 'Check-in-ul de azi a fost actualizat.' : 'Mulțumim! Clinica ta vede cum te-ai simțit.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Banner112 />
      {today && !msg && <p className="note">Ai completat azi. Poți modifica răspunsurile până la miezul nopții.</p>}

      <fieldset className="card">
        <legend>Cum te simți azi?</legend>
        <div className="mood-row">
          {MOODS.map(([v, emoji, label]) => (
            <button key={v} type="button" className={`mood ${mood === v ? 'on' : ''}`} onClick={() => setMood(v)} aria-pressed={mood === v}>
              <span aria-hidden="true">{emoji}</span>
              <small>{label}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="card">
        <label className="field-label" htmlFor="pain">Ai dureri?</label>
        <div className="pain-row">
          <input id="pain" type="range" min="0" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))} aria-valuetext={`${pain} din 10`} />
          <output className="pain-value">{pain}</output>
        </div>
        <div className="scale-labels muted"><span>0, fără durere</span><span>10</span></div>
      </div>

      <fieldset className="card">
        <legend>Cum ai dormit?</legend>
        <div className="chips">
          {SLEEP.map(([v, label]) => (
            <button key={v} type="button" className={`chip ${sleep === v ? 'on' : ''}`} onClick={() => setSleep(v)} aria-pressed={sleep === v}>{label}</button>
          ))}
        </div>
      </fieldset>

      <div className="card form">
        <label className="field">
          <span>Vrei să adaugi ceva? (opțional)</span>
          <textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <DictateButton onText={(t) => setNote((n) => (n ? `${n} ${t}` : t))} />
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {msg && <p className="success-text">{msg}</p>}
      <button className="btn btn-primary btn-wide" onClick={save} disabled={busy}>
        {busy ? 'Se salvează…' : today ? 'Actualizează check-in-ul' : 'Salvează check-in-ul'}
      </button>
      {msg && (
        <button className="btn btn-soft btn-wide" onClick={() => go('clinic', { clinicIntent: 'new' })}>Trimite o cerere clinicii</button>
      )}

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Evoluția ta</h2>
          <Segmented label="Perioada" value={days} onChange={setDays} options={[[14, '14 zile'], [30, '30 de zile']]} />
        </div>
        <EvolutionChart checkins={data.checkins} days={days} />
      </div>
    </>
  );
}

const FLAG = { sub: 'sub interval', peste: 'peste interval' };
const num = (x) => (x === '' || x == null ? null : Number(String(x).replace(',', '.')));

function Labs({ data, refresh }) {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [values, setValues] = useState(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const analyze = async (source, preview) => {
    setImage(preview);
    setValues(null);
    setSent(false);
    setError('');
    setProgress(0);
    try {
      const found = parseLabText(await readImage(source, setProgress));
      setValues(found);
      if (!found.length) setError('Nu am recunoscut nicio valoare. Fă o poză mai clară sau adaugă valorile de mână.');
    } catch {
      setValues([]);
      setError('Nu am putut citi poza. Prima citire are nevoie de internet, ca să descarce modelul de limbă.');
    } finally {
      setProgress(null);
    }
  };

  const addRow = () => {
    const next = ANALYTES.find((a) => !(values || []).some((v) => v.key === a.key)) || ANALYTES[0];
    setValues((l) => [...(l || []), { key: next.key, name: next.name, unit: next.unit, value: '', refMin: null, refMax: null }]);
  };
  const update = (i, patch) => setValues((l) => l.map((v, k) => (k === i ? { ...v, ...patch } : v)));

  const send = async () => {
    setError('');
    try {
      const clean = values.map((v) => ({ ...v, value: num(v.value), refMin: num(v.refMin), refMax: num(v.refMax) })).filter((v) => Number.isFinite(v.value));
      await api.addLab({ values: clean, source: image ? 'foto' : 'manual' });
      setSent(true);
      setValues(null);
      setImage(null);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="card">
        <p>Fotografiază buletinul de analize. Valorile ajung la medicul tău, organizate. Aplicația nu le interpretează.</p>
        <div className="row-buttons">
          <label className="btn btn-primary file-btn">
            📷 Fotografiază buletinul
            <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) analyze(f, URL.createObjectURL(f)); e.target.value = ''; }} />
          </label>
          <button className="btn btn-soft" onClick={() => analyze('/demo/buletin-demo.png', '/demo/buletin-demo.png')}>Buletinul demo</button>
        </div>
        <button className="link-btn" onClick={addRow}>Sau adaugă valorile de mână</button>
      </div>

      {image && <img className="lab-preview" src={image} alt="Buletinul de analize" />}
      {progress !== null && (
        <div className="card">
          <p>Citesc analizele… {Math.round(progress * 100)}%</p>
          <progress max="1" value={progress} />
        </div>
      )}

      {values?.length > 0 && (
        <div className="card">
          <h2 className="card-title">Verifică valorile înainte să le trimiți</h2>
          <div className="lab-edit">
            {values.map((v, i) => {
              const flag = flagOf({ ...v, value: num(v.value), refMin: num(v.refMin), refMax: num(v.refMax) });
              return (
                <div key={i} className="lab-row">
                  <select value={v.key} aria-label="Analiza" onChange={(e) => { const a = ANALYTES.find((x) => x.key === e.target.value); update(i, { key: a.key, name: a.name, unit: a.unit }); }}>
                    {ANALYTES.map((a) => <option key={a.key} value={a.key}>{a.name}</option>)}
                  </select>
                  <input inputMode="decimal" value={v.value} aria-label={`Valoare ${v.name}`} onChange={(e) => update(i, { value: e.target.value })} />
                  <span className="muted small">{v.unit}</span>
                  <span className="muted small right">{v.refMin != null ? `${v.refMin}–${v.refMax}` : 'fără interval'}</span>
                  {flag !== 'ok' && <span className="flag">{FLAG[flag]}</span>}
                </div>
              );
            })}
          </div>
          <p className="fine-print">Marcăm doar valorile din afara intervalului tipărit pe buletin. Rezultatele le discuți cu medicul.</p>
          <button className="btn btn-primary btn-wide" onClick={send}>Trimite analizele clinicii</button>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {sent && <p className="success-text">Analizele au ajuns la clinică.</p>}

      {data.labs.map((lab) => (
        <article key={lab.id} className="card">
          <strong>{longDate(lab.createdAt)}</strong>
          <ul className="lab-list">
            {lab.values.map((v) => (
              <li key={v.key}>
                {v.name}: {String(v.value).replace('.', ',')} {v.unit}
                {flagOf(v) !== 'ok' && <span className="flag">{FLAG[flagOf(v)]}</span>}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </>
  );
}
