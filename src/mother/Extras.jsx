import { useState } from 'react';
import { longDate } from '../lib/dates.js';

const CATEGORY = { magazin: '🛍️ Magazin', foto: '📸 Ședințe foto', sport: '🏊 Sport' };

export function Offers({ content }) {
  const [copied, setCopied] = useState(null);
  const copy = async (o) => {
    try {
      await navigator.clipboard.writeText(o.cod);
    } catch {
      /* clipboard indisponibil pe http; codul rămâne vizibil */
    }
    setCopied(o.id);
  };
  return (
    <section className="stack">
      <p className="muted">Ofertele sunt aceleași pentru toate mamele. Nu folosim datele tale de sănătate ca să le alegem.</p>
      {content.offers.map((o) => (
        <article key={o.id} className="card offer">
          <span className="tag">{CATEGORY[o.categorie]}</span>
          <div className="offer-head"><strong>{o.partener}</strong><span className="discount">−{o.reducere}</span></div>
          <p>{o.descriere}</p>
          {o.categorie === 'sport' && <p className="note">Întreabă-ți medicul ce activitate fizică ți se potrivește.</p>}
          <div className="offer-code">
            <code>{o.cod}</code>
            <button className="btn btn-soft" onClick={() => copy(o)}>{copied === o.id ? 'Copiat' : 'Copiază codul'}</button>
          </div>
          <small className="muted">Valabil până pe {longDate(o.valabilPana)}</small>
        </article>
      ))}
      <p className="fine-print">Parteneri fictivi, pentru demonstrație.</p>
    </section>
  );
}

const DOCS = [
  ['Certificatul de naștere', 'Se obține de la serviciul de stare civilă al primăriei, pe baza documentelor eliberate de maternitate. Află din timp ce acte îți trebuie și în ce termen.'],
  ['Alocația de stat pentru copii', 'Se solicită pentru fiecare copil, după obținerea certificatului de naștere. Verifică unde depui cererea și ce acte sunt necesare.'],
  ['Indemnizația pentru creșterea copilului', 'Se solicită de unul dintre părinți, dacă îndeplinește condițiile legale. Verifică din timp condițiile, actele și termenul de depunere.'],
];

export function Documents() {
  return (
    <section className="stack">
      <p className="note">Conținut demonstrativ. Termenele, actele și instituțiile se verifică pe sursele oficiale înainte de publicare.</p>
      <ol className="doc-steps">
        {DOCS.map(([t, d]) => (
          <li key={t} className="card"><strong>{t}</strong><p>{d}</p></li>
        ))}
      </ol>
    </section>
  );
}

const BAG = ['Actul de identitate', 'Analizele și documentele medicale', 'Haine comode și papuci', 'Articole de igienă', 'Hăinuțe și căciuliță pentru bebeluș', 'Scutece pentru nou-născut', 'Încărcătorul de telefon'];

export function BirthPrep({ data }) {
  const key = `9care.bag.${data.me.id}`;
  const [checked, setChecked] = useState(() => JSON.parse(localStorage.getItem(key) || '[]'));
  const toggle = (item) => {
    const next = checked.includes(item) ? checked.filter((x) => x !== item) : [...checked, item];
    setChecked(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  return (
    <section className="stack">
      <div className="card">
        <h2 className="card-title">Bagajul pentru maternitate</h2>
        <p className="muted">Lista de la {data.clinic.name}. {checked.length} din {BAG.length} pregătite.</p>
        <ul className="bag-list">
          {BAG.map((item) => (
            <li key={item}>
              <label className="check"><input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} /><span>{item}</span></label>
            </li>
          ))}
        </ul>
      </div>
      <p className="fine-print">Planul de naștere și cronometrul de contracții vin după concurs.</p>
    </section>
  );
}
