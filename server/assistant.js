import { ARTICLES } from './content.js';
import { ARTICLES_EN } from './content.en.js';

/**
 * Asistentul răspunde DOAR din articolele aprobate.
 * 1. Dacă mama descrie un simptom personal, nu răspunde: trimite spre clinică sau 112.
 * 2. Caută cele mai potrivite 3 articole.
 * 3. Dacă există cheia ANTHROPIC_API_KEY, cere modelului un răspuns scurt doar din aceste articole.
 *    Fără cheie, întoarce rezumatul articolului cel mai potrivit (mod demo, fără AI).
 */
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const STOP = new Set(
  'the and for with what how when why are is was can should does this that have has your you my me am its about care este sunt pentru sau dar cum cand unde din despre mai foarte acum asta acest aceasta poate pot trebuie normal fie imi mie meu mea eu tu ai am are nu da cat cate ceva bine rau zile azi'.split(' ')
);
const words = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w));
const stem = (w) => w.slice(0, 5);

export function findArticles(question, n = 3, list = ARTICLES) {
  const q = new Set(words(question).map(stem));
  return list.map((a) => {
    const title = new Set(words(a.titlu).map(stem));
    const keys = new Set(a.cuvinte.flatMap((k) => words(k)).map(stem));
    const body = new Set(words(a.text).map(stem));
    let score = 0;
    for (const w of q) {
      if (title.has(w)) score += 3;
      if (keys.has(w)) score += 3;
      if (body.has(w)) score += 1;
    }
    return { a, score };
  })
    .filter((x) => x.score >= 3)
    .sort((x, y) => y.score - x.score)
    .slice(0, n)
    .map((x) => x.a);
}

const PERSONAL = /\b(am|ma|imi|mi|simt|doare|eu|mie|meu|mea|sunt|bebelusul meu|copilul meu)\b/;
const SYMPTOM =
  /(durer|doare|dureri|sanger|febr|cramp|contracti|ameti|amete|varsat|vomit|umfl|vedere|nu (mai )?simt|se misca mai putin|lichid|pierderi|mancarim|arsur|lesin|tensiun|cazut|lovit|sufoc|respir)/;

const PERSONAL_EN = /\b(i|i'm|im|my|me|i've|ive|baby is|my baby)\b/;
const SYMPTOM_EN = /(pain|hurt|ache|bleed|fever|cramp|contraction|dizz|vomit|swell|vision|not moving|moving less|fluid|leak|itch|burn|faint|blood pressure|fell|fall|breath)/;

export const isPersonalSymptom = (q, lang = 'ro') => {
  const n = norm(q);
  return lang === 'en' ? SYMPTOM_EN.test(n) && PERSONAL_EN.test(n) : SYMPTOM.test(n) && PERSONAL.test(n);
};

const ASSISTANT_RULES = `Ești asistentul aplicației 9Care+ pentru gravide și mame. Răspunzi în limba română, pe scurt (maximum 5 propoziții), DOAR pe baza articolelor primite.
Reguli:
- Nu pui diagnostic, nu recomanzi tratamente, nu dai doze de medicamente.
- Nu interpretezi simptomele sau analizele utilizatoarei.
- Dacă utilizatoarea descrie un simptom sau o îngrijorare personală, răspunzi exact: TRIMITE_CLINICII
- Dacă articolele nu conțin răspunsul, răspunzi exact: NU_GASESC
- Nu inventa informații și nu adăuga surse în afara articolelor.`;

async function callModel(system, content, maxTokens = 500) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-haiku-5-5',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content }],
    }),
  });
  if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim();
}

export async function answer(question, lang = 'ro') {
  if (isPersonalSymptom(question, lang)) return { type: 'refer' };
  const found = findArticles(question, 3, lang === 'en' ? ARTICLES_EN : ARTICLES);
  if (!found.length) return { type: 'none' };
  const sources = found.map((a) => ({ id: a.id, titlu: a.titlu }));
  try {
    const text = await callModel(
      lang === 'en' ? ASSISTANT_RULES.replace('Răspunzi în limba română', 'Răspunzi în limba engleză') : ASSISTANT_RULES,
      `Articole aprobate:\n\n${found.map((a) => `[${a.titlu}]\n${a.text}`).join('\n\n')}\n\nÎntrebarea: ${question}`
    );
    if (text) {
      if (text.includes('TRIMITE_CLINICII')) return { type: 'refer' };
      if (text.includes('NU_GASESC')) return { type: 'none' };
      return { type: 'answer', text, sources, ai: true };
    }
  } catch (e) {
    console.warn('Asistentul AI nu a răspuns, folosesc rezumatul articolului:', e.message);
  }
  return { type: 'answer', text: found[0].rezumat, sources: sources.slice(0, 1), ai: false };
}

// ---------- Rezumatul pentru clinică ----------
const SLEEP = { 1: 'prost', 2: 'așa și așa', 3: 'bine' };
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const f = (n) => n.toLocaleString('ro-RO', { maximumFractionDigits: 1 });

/** Rezumat calculat după reguli simple, folosit când nu există cheie AI. Doar fapte raportate, fără interpretări. */
export function ruleSummary(checkins, request, lang = 'ro') {
  if (lang === 'en') return ruleSummaryEn(checkins, request);
  const lines = [];
  if (!request.includeEvolution) {
    lines.push('Pacienta nu a atașat evoluția ultimelor 14 zile.');
  } else if (!checkins.length) {
    lines.push('Niciun check-in în ultimele 14 zile.');
  } else {
    const pains = checkins.map((c) => c.pain);
    const max = Math.max(...pains);
    const maxDay = checkins.find((c) => c.pain === max).date.slice(5).split('-').reverse().join('.');
    const last3 = checkins.slice(-3);
    const earlier = checkins.slice(0, -3);
    lines.push(
      `${checkins.length === 1 ? 'Un check-in' : `${checkins.length} check-in-uri`} în 14 zile. Durere medie ${f(avg(pains))}/10, maximă ${max}/10 (${maxDay}).`
    );
    if (earlier.length)
      lines.push(
        `Ultimele 3 zile: durere medie ${f(avg(last3.map((c) => c.pain)))}/10, față de ${f(avg(earlier.map((c) => c.pain)))}/10 înainte.`
      );
    const badSleep = checkins.filter((c) => c.sleep === 1).length;
    lines.push(
      `Stare medie în ultimele 3 zile: ${f(avg(last3.map((c) => c.mood)))} din 5. Somn raportat „prost” în ${badSleep} ${badSleep === 1 ? 'zi' : 'zile'}.`
    );
    const note = [...checkins].reverse().find((c) => c.note);
    if (note) lines.push(`Ultima notă: „${note.note}”`);
  }
  return lines.join('\n');
}

function ruleSummaryEn(checkins, request) {
  const n = (x) => x.toLocaleString('en-GB', { maximumFractionDigits: 1 });
  if (!request.includeEvolution) return 'The patient did not attach her last 14 days.';
  if (!checkins.length) return 'No check-ins in the last 14 days.';
  const lines = [];
  const pains = checkins.map((c) => c.pain);
  const max = Math.max(...pains);
  const maxDay = checkins.find((c) => c.pain === max).date.slice(5).split('-').reverse().join('/');
  const last3 = checkins.slice(-3);
  const earlier = checkins.slice(0, -3);
  lines.push(`${checkins.length === 1 ? '1 check-in' : `${checkins.length} check-ins`} in 14 days. Average pain ${n(avg(pains))}/10, highest ${max}/10 (${maxDay}).`);
  if (earlier.length) lines.push(`Last 3 days: average pain ${n(avg(last3.map((c) => c.pain)))}/10, compared with ${n(avg(earlier.map((c) => c.pain)))}/10 before.`);
  const bad = checkins.filter((c) => c.sleep === 1).length;
  lines.push(`Average mood over the last 3 days: ${n(avg(last3.map((c) => c.mood)))} out of 5. Sleep reported as “bad” on ${bad} ${bad === 1 ? 'day' : 'days'}.`);
  const note = [...checkins].reverse().find((c) => c.note);
  if (note) lines.push(`Latest note: “${note.note}”`);
  return lines.join('\n');
}

const SUMMARY_RULES = `Scrii pentru medicul unei clinici un rezumat de 3–4 rânduri, în română, al datelor raportate de o pacientă: check-in-urile din ultimele 14 zile și mesajul ei.
Reguli: doar fapte raportate (valori, tendințe, note); fără diagnostic, fără interpretări medicale, fără recomandări. Nu inventa date.`;

export async function summarize(checkins, request, message) {
  const fallback = ruleSummary(checkins, request);
  try {
    const data = request.includeEvolution
      ? checkins.map((c) => `${c.date}: stare ${c.mood}/5, durere ${c.pain}/10, somn ${SLEEP[c.sleep]}${c.note ? `, notă: ${c.note}` : ''}`).join('\n')
      : 'Pacienta nu a atașat evoluția.';
    const text = await callModel(SUMMARY_RULES, `Tipul cererii: ${request.type}\nMesaj: ${message}\n\nCheck-in-uri:\n${data}`, 300);
    if (text) return { text, ai: true };
  } catch (e) {
    console.warn('Rezumatul AI nu a mers, folosesc rezumatul după reguli:', e.message);
  }
  return { text: fallback, ai: false };
}
