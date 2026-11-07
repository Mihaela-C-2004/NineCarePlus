import { useState } from 'react';
import { api } from '../lib/api.js';
import { localDate, longDate } from '../lib/dates.js';

export default function Profile({ data, refresh, onSignOut }) {
  const { me, clinic } = data;
  const [birthDate, setBirthDate] = useState(localDate());
  const [babyName, setBabyName] = useState(me.babyName || '');
  const [babySex, setBabySex] = useState(me.babySex || 'nespecificat');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const update = async (body) => {
    setError('');
    try {
      await api.updateMe(body);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const download = async () => {
    const blob = new Blob([JSON.stringify(await api.exportMe(), null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'datele-mele-9careplus.json' });
    a.click();
  };

  const remove = async () => {
    await api.deleteMe();
    onSignOut();
  };

  return (
    <section className="stack">
      <div className="card">
        <dl className="details">
          <dt>Nume</dt><dd>{me.firstName}</dd>
          <dt>E-mail</dt><dd>{me.email}</dd>
          <dt>Clinica</dt><dd>{clinic.name}</dd>
          <dt>{me.status === 'nascut' ? 'Data nașterii' : 'Data estimată'}</dt><dd>{longDate(me.birthDate || me.dueDate)}</dd>
          {me.accessUntil && (<><dt>Acces complet până la</dt><dd>{longDate(me.accessUntil)}</dd></>)}
        </dl>
        {me.minor && <p className="note">Ai sub 18 ani: {me.minorConfirmed ? 'clinica a confirmat înscrierea.' : 'clinica urmează să confirme înscrierea.'}</p>}
      </div>

      <div className="card form">
        <h2 className="card-title">Acordurile tale</h2>
        <Toggle checked={me.consents.health} onChange={(v) => update({ consents: { health: v } })} title="Trimiterea datelor de sănătate către clinică" hint={me.consents.health ? 'Clinica vede check-in-urile, cererile și analizele tale.' : 'Clinica nu primește datele tale și nu poți trimite cereri.'} />
        <Toggle checked={me.consents.notifications} onChange={(v) => update({ consents: { notifications: v } })} title="Notificări" hint="Maximum două pe zi." />
        {me.consents.notifications && (
          <label className="field inline-field">
            <span>Ora mementoului zilnic</span>
            <input type="time" value={me.reminderTime} onChange={(e) => update({ reminderTime: e.target.value })} />
          </label>
        )}
        {!me.minor && me.status !== 'incheiata' && <Toggle checked={me.consents.offers} onChange={(v) => update({ consents: { offers: v } })} title="Ofertele partenerilor" hint="Aceleași pentru toate mamele. Nu folosim datele de sănătate." />}
      </div>

      {me.status === 'activa' && (
        <div className="card form">
          <h2 className="card-title">Ai născut?</h2>
          <p className="muted">Aplicația trece pe recuperare, somn și starea ta, și te însoțește încă 12 luni.</p>
          <label className="field"><span>Data nașterii</span><input type="date" value={birthDate} max={localDate()} onChange={(e) => setBirthDate(e.target.value)} /></label>
          <BabyFields name={babyName} setName={setBabyName} sex={babySex} setSex={setBabySex} />
          <button className="btn btn-primary" onClick={() => update({ status: 'nascut', birthDate, babyName, babySex })}>Am născut</button>
        </div>
      )}

      {me.status === 'nascut' && (
        <div className="card form">
          <h2 className="card-title">Bebelușul</h2>
          <BabyFields name={babyName} setName={setBabyName} sex={babySex} setSex={setBabySex} />
          <button className="btn btn-soft" onClick={() => update({ babyName, babySex })}>Salvează</button>
        </div>
      )}

      {me.status === 'activa' && (
        <div className="card">
          {confirmEnd ? (
            <>
              <p>Ne pare foarte rău. Oprim imediat fructul săptămânii, notificările, cursurile despre sarcină și ofertele. Datele rămân ale tale, iar clinica ta e aici dacă vrei să vorbești.</p>
              <div className="row-buttons">
                <button className="btn btn-primary" onClick={() => update({ status: 'incheiata' })}>Da, oprește conținutul</button>
                <button className="btn btn-soft" onClick={() => setConfirmEnd(false)}>Renunță</button>
              </div>
            </>
          ) : (
            <button className="link-btn" onClick={() => setConfirmEnd(true)}>Sarcina s-a încheiat</button>
          )}
        </div>
      )}

      <div className="card form">
        <h2 className="card-title">Datele tale</h2>
        <p className="muted">Nu vindem date și nu facem reclame pe baza lor.</p>
        <button className="btn btn-soft" onClick={download}>Descarcă datele mele</button>
        {confirmDelete ? (
          <div className="row-buttons">
            <button className="btn btn-alert" onClick={remove}>Da, șterge definitiv contul</button>
            <button className="btn btn-soft" onClick={() => setConfirmDelete(false)}>Renunță</button>
          </div>
        ) : (
          <button className="link-btn danger" onClick={() => setConfirmDelete(true)}>Șterge contul și toate datele</button>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-soft btn-wide" onClick={async () => { await api.logout().catch(() => {}); onSignOut(); }}>Ieși din cont</button>
    </section>
  );
}

function BabyFields({ name, setName, sex, setSex }) {
  const options = [['fata', 'Fetiță'], ['baiat', 'Băiețel'], ['nespecificat', 'Prefer să nu spun']];
  return (
    <>
      <label className="field"><span>Numele bebelușului</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="de exemplu Sofia" /></label>
      <div className="field">
        <span>Fetiță sau băiețel?</span>
        <div className="chips">
          {options.map(([k, l]) => <button key={k} type="button" className={`chip ${sex === k ? 'on' : ''}`} onClick={() => setSex(k)} aria-pressed={sex === k}>{l}</button>)}
        </div>
        <small className="muted">Culorile aplicației devin roz sau albastre.</small>
      </div>
    </>
  );
}

function Toggle({ checked, onChange, title, hint }) {
  return (
    <label className="switch-row">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><strong>{title}</strong><small className="muted">{hint}</small></span>
    </label>
  );
}
