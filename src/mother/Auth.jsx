import { useState } from 'react';
import { api } from '../lib/api.js';
import { Logo, ThemeToggle, Segmented } from '../components/ui.jsx';
import { LangToggle } from '../i18n/index.jsx';

const thisYear = new Date().getFullYear();

export default function Auth({ onDone }) {
  const [mode, setMode] = useState('register');
  const [f, setF] = useState({
    firstName: '',
    email: '',
    password: '',
    birthYear: '',
    dateType: 'due',
    date: '',
    clinicCode: new URLSearchParams(window.location.search).get('clinica') || '',
    consents: { terms: false, health: false, notifications: true, offers: false },
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const setConsent = (k, v) => setF((x) => ({ ...x, consents: { ...x.consents, [k]: v } }));
  const minor = f.birthYear && thisYear - Number(f.birthYear) < 18;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onDone(mode === 'login' ? await api.login({ email: f.email, password: f.password }) : await api.register(f));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="m-shell auth">
      <div className="auth-top">
        <LangToggle />
        <ThemeToggle />
      </div>
      <div className="auth-hero">
        <Logo size={64} tagline />
        <p className="lead">Nu ești singură între consultații.</p>
      </div>

      <Segmented label="Cont" value={mode} onChange={(m) => { setMode(m); setError(''); }} options={[['register', 'Cont nou'], ['login', 'Am deja cont']]} />

      <form className="card form" onSubmit={submit}>
        {mode === 'register' && (
          <label className="field">
            <span>Prenumele tău</span>
            <input value={f.firstName} onChange={(e) => set('firstName', e.target.value)} autoComplete="given-name" required />
          </label>
        )}
        <label className="field">
          <span>E-mail</span>
          <input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          <span>Parolă</span>
          <input type="password" value={f.password} onChange={(e) => set('password', e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required />
        </label>

        {mode === 'register' && (
          <>
            <label className="field">
              <span>Anul tău de naștere</span>
              <input inputMode="numeric" value={f.birthYear} onChange={(e) => set('birthYear', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="de exemplu 1996" required />
            </label>
            {minor && <p className="note">Ai sub 18 ani. Clinica ta va confirma înscrierea și acordul necesar. Ofertele de la parteneri nu sunt disponibile.</p>}

            <div className="field">
              <span>Ce dată știi?</span>
              <Segmented label="Tipul datei" value={f.dateType} onChange={(v) => set('dateType', v)} options={[['due', 'Data estimată a nașterii'], ['lmp', 'Ultima menstruație']]} />
            </div>
            <label className="field">
              <span>{f.dateType === 'due' ? 'Când se naște bebelușul? (data estimată)' : 'Prima zi a ultimei menstruații'}</span>
              <input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} required />
              {f.dateType === 'lmp' && <small className="muted">Calculăm data estimată adăugând 280 de zile.</small>}
            </label>
            <label className="field">
              <span>Codul clinicii</span>
              <input value={f.clinicCode} onChange={(e) => set('clinicCode', e.target.value.toUpperCase())} placeholder="Îl primești la control" autoCapitalize="characters" required />
              <small className="muted">9Care+ funcționează doar prin clinicile partenere. Pentru demonstrație: DEMO.</small>
            </label>

            <fieldset className="consents">
              <legend>Acordurile tale</legend>
              <label className="check">
                <input type="checkbox" checked={f.consents.terms} onChange={(e) => setConsent('terms', e.target.checked)} />
                <span>Accept termenii de utilizare. Înțeleg că 9Care+ nu pune diagnostic și nu e pentru urgențe.</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={f.consents.health} onChange={(e) => setConsent('health', e.target.checked)} />
                <span>Sunt de acord ca datele mele de sănătate (check-in-uri, cereri, analize) să fie trimise clinicii mele. Pot retrage acordul oricând.</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={f.consents.notifications} onChange={(e) => setConsent('notifications', e.target.checked)} />
                <span>Vreau notificări: mementoul zilnic și răspunsurile clinicii. (opțional)</span>
              </label>
              {!minor && (
                <label className="check">
                  <input type="checkbox" checked={f.consents.offers} onChange={(e) => setConsent('offers', e.target.checked)} />
                  <span>Vreau să văd ofertele partenerilor. Nu folosim datele de sănătate pentru oferte. (opțional)</span>
                </label>
              )}
            </fieldset>
          </>
        )}

        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-wide" disabled={busy}>
          {busy ? 'Un moment…' : mode === 'login' ? 'Intră în cont' : 'Creează contul'}
        </button>
        {mode === 'login' && <p className="fine-print">Cont demo: ana@demo.ro, parola demo1234.</p>}
      </form>
      <p className="fine-print center">Prototip demonstrativ. Folosește doar date fictive.</p>
    </main>
  );
}
