import { useEffect, useRef } from 'react';
import { Icon } from '../components/ui.jsx';
import { useLang } from '../i18n/index.jsx';

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const SUGGESTIONS = { ro: ['greață', 'bagaj', 'alăptare', 'analize', 'somn', 'cerere'], en: ['nausea', 'bag', 'breastfeeding', 'lab', 'sleep', 'baby'] };

function buildIndex(data, content) {
  const items = [
    { kind: 'Secțiune', title: 'Check-in zilnic', body: 'stare durere somn cum ma simt', go: ['state'] },
    { kind: 'Secțiune', title: 'Analizele mele', body: 'analize buletin poza laborator', go: ['state'] },
    { kind: 'Secțiune', title: 'Asistentul', body: 'intrebari raspunsuri chat', go: ['assistant'] },
    { kind: 'Secțiune', title: 'Cursuri și ghiduri', body: 'lectii articole invat', go: ['courses'] },
    { kind: 'Secțiune', title: 'Trimite o cerere clinicii', body: 'medic intrebare simptom clinica mesaj', go: ['clinic', { clinicIntent: 'new' }] },
    { kind: 'Secțiune', title: 'Profilul meu', body: 'cont acorduri notificari date stergere am nascut', go: [null, { page: 'profile' }] },
    { kind: 'Secțiune', title: 'Ghidul pentru acte', body: 'certificat nastere alocatie indemnizatie acte', go: [null, { page: 'documents' }] },
  ];
  if (data.me.status === 'activa') items.push({ kind: 'Secțiune', title: 'Bagajul pentru maternitate', body: 'bagaj maternitate lista pregatire nastere', go: [null, { page: 'birth' }] });
  if (content.offers.length) items.push({ kind: 'Secțiune', title: 'Oferte de la parteneri', body: 'reduceri cupoane magazin foto sport', go: [null, { page: 'offers' }] });
  for (const a of content.articles) items.push({ kind: `Ghid · ${a.categorie}`, title: a.titlu, body: a.text, go: ['courses', { coursesIntent: { articleId: a.id } }] });
  for (const c of content.courses) {
    items.push({ kind: 'Curs', title: c.titlu, body: c.lectii.map((l) => l.titlu).join(' '), go: ['courses', { coursesIntent: { courseId: c.id } }] });
    for (const l of c.lectii) items.push({ kind: `Lecție · ${c.titlu}`, title: l.titlu, body: l.text, go: ['courses', { coursesIntent: { courseId: c.id, lessonId: l.id } }] });
  }
  for (const r of data.requests) items.push({ kind: 'Cererea ta', title: r.type, body: r.messages.map((m) => m.text).join(' '), go: ['clinic', { clinicIntent: r.id }] });
  return items.map((it) => ({ ...it, nTitle: norm(it.title), nBody: norm(it.body) }));
}

function snippet(body, term) {
  const i = norm(body).indexOf(term);
  if (i < 0) return body.slice(0, 90) + (body.length > 90 ? '…' : '');
  const start = Math.max(0, i - 35);
  return (start ? '…' : '') + body.slice(start, start + 110) + (start + 110 < body.length ? '…' : '');
}

export default function Search({ data, content, query, setQuery, go, autoFocus }) {
  const input = useRef(null);
  const lang = useLang();
  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  const terms = norm(query).split(/\s+/).filter((t) => t.length > 1);
  const results = terms.length
    ? buildIndex(data, content)
        .filter((it) => terms.every((t) => it.nTitle.includes(t) || it.nBody.includes(t)))
        .sort((a, b) => terms.filter((t) => b.nTitle.includes(t)).length - terms.filter((t) => a.nTitle.includes(t)).length)
        .slice(0, 20)
    : [];

  return (
    <section className="stack search-page">
      <div className="search-field big">
        <Icon name="search" size={20} />
        <input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută ghiduri, lecții, secțiuni…" aria-label="Caută în aplicație" />
        {query && <button className="icon-plain" onClick={() => setQuery('')} aria-label="Șterge căutarea"><Icon name="close" size={18} /></button>}
      </div>

      {!terms.length && (
        <div className="chips">
          {SUGGESTIONS[lang].map((s) => <button key={s} data-i18n-skip className="chip" onClick={() => setQuery(s)}>{s}</button>)}
        </div>
      )}

      {terms.length > 0 && (
        <>
          <button className="card ask-card" onClick={() => go('assistant', { assistantIntent: query })}>
            <Icon name="chat" size={20} />
            <span>Întreabă asistentul: <strong>„{query}”</strong></span>
          </button>
          {results.length === 0 && <p className="muted">Nu am găsit nimic. Încearcă alt cuvânt sau întreabă asistentul.</p>}
          <ul className="results">
            {results.map((r, i) => (
              <li key={i}>
                <button className="result" onClick={() => go(...r.go)}>
                  <small className="muted">{r.kind}</small>
                  <strong>{r.title}</strong>
                  {r.kind !== 'Secțiune' && <span className="muted small">{snippet(r.body, terms[0])}</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
