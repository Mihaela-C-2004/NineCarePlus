import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { timeAgo } from '../lib/dates.js';
import { Banner112, Icon, STATUS } from '../components/ui.jsx';
import { DictateButton } from './MyState.jsx';

const TYPES = ['Întrebare', 'Simptom sau durere', 'Problemă administrativă'];

export default function ClinicTab({ data, refresh, intent, clearIntent }) {
  const [view, setView] = useState('list'); // list | new | <id cerere>
  useEffect(() => {
    if (intent) {
      setView(intent);
      clearIntent();
    }
  }, [intent, clearIntent]);

  const { me, clinic } = data;
  const blocked = !me.consents.health ? 'Ai retras acordul pentru trimiterea datelor, așa că nu poți trimite cereri. Îl poți reactiva din profil.'
    : me.accessExpired ? 'Perioada de urmărire de 12 luni după naștere s-a încheiat. Pentru programări, sună la clinică.' : '';

  if (view === 'new') return <NewRequest data={data} refresh={refresh} onDone={(id) => setView(id || 'list')} />;
  const open = data.requests.find((r) => r.id === view);
  if (open) return <Conversation request={open} clinic={clinic} refresh={refresh} onBack={() => setView('list')} />;

  return (
    <section className="stack">
      <h1 className="screen-title">{clinic.name}</h1>
      <div className="card clinic-card">
        <p>Clinica răspunde de obicei în {clinic.responseHours} de ore.</p>
        <p className="muted">{clinic.schedule}. Programările se fac telefonic.</p>
        <a className="btn btn-soft" href={`tel:${clinic.phone.replace(/\s/g, '')}`}>Sună la clinică: {clinic.phone}</a>
      </div>
      <Banner112 text="Cererile nu sunt pentru urgențe. Pentru urgențe, sună la " />
      {blocked ? <p className="note">{blocked}</p> : (
        <button className="btn btn-primary btn-wide" onClick={() => setView('new')}>Trimite o cerere</button>
      )}

      <Questions data={data} refresh={refresh} />

      {data.requests.length > 0 && <h2 className="group-title">Cererile tale</h2>}
      {data.requests.map((r) => {
        const last = r.messages.at(-1);
        return (
          <button key={r.id} className="card request-row" onClick={() => setView(r.id)}>
            <span className="request-top">
              <strong>{r.type}</strong>
              <span className={`status-pill s-${r.status}`}>{STATUS[r.status]}</span>
            </span>
            <span className="muted clamp">{last.author === 'clinica' ? 'Clinica: ' : ''}{last.text}</span>
            <small className="muted">{timeAgo(r.updatedAt)}</small>
          </button>
        );
      })}
    </section>
  );
}

function NewRequest({ data, refresh, onDone }) {
  const [type, setType] = useState(TYPES[0]);
  const [message, setMessage] = useState('');
  const [includeEvolution, setInclude] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.sendRequest({ type, message, includeEvolution });
      await refresh();
      onDone(r.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="stack">
      <button className="link-btn" onClick={() => onDone()}>‹ Înapoi</button>
      <h1 className="screen-title">Cerere nouă</h1>
      <Banner112 text="Cererile nu sunt pentru urgențe. Pentru urgențe, sună la " />
      <form className="card form" onSubmit={send}>
        <span className="field-label">Despre ce e vorba?</span>
        <div className="chips">
          {TYPES.map((t) => <button key={t} type="button" className={`chip ${type === t ? 'on' : ''}`} onClick={() => setType(t)} aria-pressed={type === t}>{t}</button>)}
        </div>
        <label className="field">
          <span>Mesajul tău</span>
          <textarea rows="4" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Scrie ce simți sau ce vrei să întrebi." />
        </label>
        <DictateButton onText={(t) => setMessage((m) => (m ? `${m} ${t}` : t))} />
        <label className="switch-row">
          <input type="checkbox" role="switch" checked={includeEvolution} onChange={(e) => setInclude(e.target.checked)} />
          <span>
            <strong>Atașează evoluția ultimelor 14 zile</strong>
            <small className="muted">Medicul vede graficul stării, durerii și somnului tău.</small>
          </span>
        </label>
        <p className="fine-print">Clinica {data.clinic.name} răspunde de obicei în {data.clinic.responseHours} de ore.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-wide" disabled={busy || !message.trim()}>{busy ? 'Se trimite…' : 'Trimite cererea'}</button>
      </form>
    </section>
  );
}

function Conversation({ request, clinic, refresh, onBack }) {
  const [text, setText] = useState('');
  const steps = ['trimisa', 'vazuta', 'rezolvata'];
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.sendMessage(request.id, text);
    setText('');
    refresh();
  };
  return (
    <section className="stack">
      <button className="link-btn" onClick={onBack}>‹ Toate cererile</button>
      <h1 className="screen-title">{request.type}</h1>
      <ol className="status-track" aria-label={`Status: ${STATUS[request.status]}`}>
        {steps.map((s) => <li key={s} className={steps.indexOf(s) <= steps.indexOf(request.status) ? 'reached' : ''}>{STATUS[s]}</li>)}
      </ol>
      {request.includeEvolution && <p className="fine-print">Ai atașat evoluția ultimelor 14 zile.</p>}
      <div className="thread">
        {request.messages.map((m) => (
          <div key={m.id} className={`bubble ${m.author === 'mama' ? 'me' : 'bot'}`}>
            {m.author === 'clinica' && <small className="from">{clinic.name}</small>}
            <p>{m.text}</p>
            <small className="time">{timeAgo(m.createdAt)}</small>
          </div>
        ))}
      </div>
      <form className="chat-input inline" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Adaugă un mesaj" aria-label="Mesaj" />
        <button className="icon-btn send" disabled={!text.trim()} aria-label="Trimite"><Icon name="send" size={20} /></button>
      </form>
      <Banner112 text="Pentru urgențe, sună la " />
    </section>
  );
}

/** Pregătirea pentru control: întrebările notate de mamă, rămân doar la ea. */
function Questions({ data, refresh }) {
  const [text, setText] = useState('');
  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.addQuestion(text);
    setText('');
    refresh();
  };
  return (
    <div className="card">
      <h2 className="card-title">
        {'Întrebări pentru următorul control: '}
        {data.questions.length} {data.questions.length === 1 ? 'întrebare' : 'întrebări'}
      </h2>
      <ul className="question-list">
        {data.questions.map((q) => (
          <li key={q.id}>
            <span>{q.text}</span>
            <button className="link-btn small" onClick={async () => { await api.deleteQuestion(q.id); refresh(); }} aria-label={`Șterge: ${q.text}`}>Șterge</button>
          </li>
        ))}
      </ul>
      <form className="chat-input inline" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Notează o întrebare" aria-label="Întrebare nouă" />
        <button className="icon-btn send" disabled={!text.trim()} aria-label="Adaugă întrebarea"><Icon name="check" size={20} /></button>
      </form>
    </div>
  );
}
