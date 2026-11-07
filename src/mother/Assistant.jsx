import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { Icon } from '../components/ui.jsx';

const SUGGESTIONS = ['Ce ajută la greață?', 'Ce iau în bagajul pentru maternitate?', 'Cum arată primele zile de alăptare?', 'Am dureri de spate, e normal?'];

export default function Assistant({ content, go, chat, setChat, intent, clearIntent }) {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [article, setArticle] = useState(null);
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat, busy]);

  useEffect(() => {
    if (intent) {
      clearIntent();
      ask(intent);
    }
  }, [intent]); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    setQ('');
    setChat((c) => [...c, { from: 'me', text: question }]);
    setBusy(true);
    try {
      const res = await api.ask(question);
      setChat((c) => [...c, { from: 'bot', ...res }]);
    } catch (e) {
      setChat((c) => [...c, { from: 'bot', type: 'error', text: e.message }]);
    } finally {
      setBusy(false);
    }
  };

  if (article) {
    const a = content.articles.find((x) => x.id === article);
    return (
      <section className="stack">
        <button className="link-btn" onClick={() => setArticle(null)}>‹ Înapoi la asistent</button>
        <ArticleView article={a} />
      </section>
    );
  }

  return (
    <section className="chat-screen">
      <h1 className="screen-title">Asistent</h1>
      <div className="chat-log" aria-live="polite">
        <div className="bubble bot">
          <p>
            Bună! Răspund doar din articole verificate de medici. Nu pun diagnostic și nu interpretez simptome. Pentru urgențe, sună la <a href="tel:112">112</a>.
          </p>
        </div>
        {chat.length === 0 && (
          <div className="chips suggestions">
            {SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>)}
          </div>
        )}
        {chat.map((m, i) =>
          m.from === 'me' ? (
            <div key={i} className="bubble me">{m.text}</div>
          ) : (
            <div key={i} className="bubble bot">
              {m.type === 'answer' && (
                <>
                  <p>{m.text}</p>
                  <div className="sources">
                    {m.sources.map((s) => (
                      <button key={s.id} className="source" onClick={() => setArticle(s.id)}>📖 {s.titlu}</button>
                    ))}
                  </div>
                  {!m.ai && <small className="muted">Rezumat din articolul aprobat.</small>}
                </>
              )}
              {m.type === 'refer' && (
                <>
                  <p>Nu pot evalua simptomele tale. Medicul tău e persoana potrivită: trimite-i o cerere și el decide ce urmează. Dacă e o urgență, sună acum la 112.</p>
                  <div className="row-buttons">
                    <button className="btn btn-primary" onClick={() => go('clinic', { clinicIntent: 'new' })}>Trimite o cerere clinicii</button>
                    <a className="btn btn-alert" href="tel:112">Urgență: sună la 112</a>
                  </div>
                </>
              )}
              {m.type === 'none' && (
                <>
                  <p>Nu am găsit un articol aprobat despre asta. Poți întreba direct clinica ta.</p>
                  <button className="btn btn-soft" onClick={() => go('clinic', { clinicIntent: 'new' })}>Întreabă clinica</button>
                </>
              )}
              {m.type === 'error' && <p className="error">{m.text}</p>}
            </div>
          )
        )}
        {busy && <div className="bubble bot typing" aria-label="Asistentul scrie"><span /><span /><span /></div>}
        <div ref={end} />
      </div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Scrie o întrebare" aria-label="Întrebarea ta" />
        <button className="icon-btn send" disabled={!q.trim() || busy} aria-label="Trimite"><Icon name="send" size={20} /></button>
      </form>
      <p className="fine-print center">Conversațiile cu asistentul nu ajung la clinică.</p>
    </section>
  );
}

export function ArticleView({ article }) {
  return (
    <article className="card article">
      <span className="tag">{article.categorie}</span>
      <h2>{article.titlu}</h2>
      <p>{article.text}</p>
      <p className="fine-print">
        Autor: {article.autor}. {article.verificatLa ? `Verificat medical pe ${article.verificatLa}.` : 'Verificarea medicală e în așteptare.'}
      </p>
    </article>
  );
}
