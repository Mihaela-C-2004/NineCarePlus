import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeed } from './seed.js';
import { ARTICLES, COURSES, OFFERS } from './content.js';
import { answer, summarize, ruleSummary } from './assistant.js';
import { ARTICLES_EN, COURSES_EN, OFFERS_EN } from './content.en.js';
import {
  id, token, localDate, addDays, pregnancyDay, hashPassword, checkPassword,
  isMinor, accessUntil, accessExpired,
} from './util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 3001;

// Cheia AI (opțională) poate sta într-un fișier .env în rădăcina proiectului: ANTHROPIC_API_KEY=...
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// ---------- "Baza de date": un fișier JSON, suficient pentru prototip ----------
const save = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};
let db;
try {
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!db.mothers) throw new Error('format vechi');
} catch {
  db = createSeed();
  save();
}

// ---------- Actualizări live (Server-Sent Events) ----------
const clients = new Set();
const commit = (event) => {
  save();
  const msg = `data: ${JSON.stringify({ ...event, at: Date.now() })}\n\n`;
  for (const res of clients) res.write(msg);
};

const app = express();
app.use(express.json({ limit: '2mb' }));
const fail = (res, status, error) => res.status(status).json({ error });

// ---------- Ajutoare ----------
const clinicOf = (m) => db.clinics.find((c) => c.id === m.clinicId);
const publicMother = (m) => {
  const { salt, hash, ...rest } = m;
  const day = pregnancyDay(m.dueDate);
  return {
    ...rest,
    minor: isMinor(m.birthYear),
    week: Math.floor(day / 7),
    weekDay: (day % 7) + 1,
    accessUntil: accessUntil(m),
    accessExpired: accessExpired(m),
  };
};
const checkinsOf = (motherId, days = 365) => {
  const from = addDays(localDate(), -days);
  return db.checkins.filter((c) => c.motherId === motherId && c.date > from).sort((a, b) => a.date.localeCompare(b.date));
};
const requestsOf = (motherId) =>
  db.requests
    .filter((r) => r.motherId === motherId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({ ...r, messages: db.messages.filter((x) => x.requestId === r.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) }));
const byDate = (a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));

function motherBundle(m) {
  return {
    me: publicMother(m),
    clinic: clinicOf(m),
    checkins: checkinsOf(m.id),
    requests: requestsOf(m.id),
    appointments: db.appointments.filter((a) => a.motherId === m.id).sort(byDate),
    labs: db.labs.filter((l) => l.motherId === m.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    progress: db.progress.filter((p) => p.motherId === m.id).map((p) => p.lessonId),
    questions: db.questions.filter((q) => q.motherId === m.id),
  };
}

function auth(req, res, next) {
  const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = db.sessions.find((s) => s.token === t);
  const mother = session && db.mothers.find((m) => m.id === session.motherId);
  if (!mother) return fail(res, 401, 'Sesiunea a expirat. Intră din nou în cont.');
  req.mother = mother;
  next();
}

const canContactClinic = (m) => m.consents.health && !accessExpired(m);

// ---------- Live ----------
app.get('/api/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders();
  res.write('retry: 2000\n\n');
  clients.add(res);
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(ping);
    clients.delete(res);
  });
});

app.get('/api/info', (_req, res) => {
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => n.address);
  res.json({ ips, ai: Boolean(process.env.ANTHROPIC_API_KEY) });
});

// ---------- Cont ----------
app.post('/api/auth/register', (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  if (!b.firstName?.trim()) return fail(res, 400, 'Scrie-ți prenumele.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, 'Adresa de e-mail nu pare corectă.');
  if (String(b.password || '').length < 6) return fail(res, 400, 'Parola trebuie să aibă cel puțin 6 caractere.');
  if (db.mothers.some((m) => m.email === email)) return fail(res, 409, 'Există deja un cont cu acest e-mail. Intră în cont.');
  const birthYear = Number(b.birthYear);
  const thisYear = new Date().getFullYear();
  if (!(birthYear > thisYear - 60 && birthYear < thisYear - 10)) return fail(res, 400, 'Verifică anul nașterii tale.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) return fail(res, 400, 'Alege data.');
  const dueDate = b.dateType === 'lmp' ? addDays(b.date, 280) : b.date;
  const week = Math.floor(pregnancyDay(dueDate) / 7);
  if (week < 2 || week > 42)
    return fail(res, 400, b.dateType === 'lmp' ? 'Verifică data ultimei menstruații.' : 'Data estimată trebuie să fie în următoarele 9 luni.');
  const clinic = db.clinics.find((c) => c.code.toUpperCase() === String(b.clinicCode || '').trim().toUpperCase());
  if (!clinic) return fail(res, 404, 'Codul nu corespunde niciunei clinici partenere. Îl găsești pe afișul sau pe biletul primit la control.');
  const c = b.consents || {};
  if (!c.terms) return fail(res, 400, 'Ai nevoie să accepți termenii de utilizare.');
  if (!c.health) return fail(res, 400, 'Ai nevoie să fii de acord cu trimiterea datelor către clinica ta. Fără acest acord, clinica nu te poate urmări.');

  const { salt, hash } = hashPassword(String(b.password));
  const mother = {
    id: id(), email, salt, hash,
    firstName: b.firstName.trim(), lastName: String(b.lastName || '').trim(),
    birthYear, clinicId: clinic.id, dueDate, status: 'activa', birthDate: null,
    consents: { terms: true, health: true, notifications: Boolean(c.notifications), offers: Boolean(c.offers) && !isMinor(birthYear) },
    minorConfirmed: false, reminderTime: '20:00',
    createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(),
  };
  db.mothers.push(mother);
  const t = token();
  db.sessions.push({ token: t, motherId: mother.id });
  commit({ type: 'mother', motherId: mother.id });
  res.status(201).json({ token: t, ...motherBundle(mother) });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const m = db.mothers.find((x) => x.email === email);
  if (!m || !checkPassword(String(req.body?.password || ''), m.salt, m.hash)) return fail(res, 401, 'E-mailul sau parola nu sunt corecte.');
  const t = token();
  db.sessions.push({ token: t, motherId: m.id });
  save();
  res.json({ token: t, ...motherBundle(m) });
});

app.post('/api/auth/logout', auth, (req, res) => {
  const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  db.sessions = db.sessions.filter((s) => s.token !== t);
  save();
  res.json({ ok: true });
});

// ---------- Mama ----------
app.get('/api/me', auth, (req, res) => {
  req.mother.lastSeenAt = new Date().toISOString();
  save();
  res.json(motherBundle(req.mother));
});

app.patch('/api/me', auth, (req, res) => {
  const m = req.mother;
  const b = req.body || {};
  if (typeof b.reminderTime === 'string') m.reminderTime = b.reminderTime;
  if (b.consents) {
    for (const k of ['health', 'notifications', 'offers']) if (k in b.consents) m.consents[k] = Boolean(b.consents[k]);
    if (isMinor(m.birthYear)) m.consents.offers = false;
  }
  if (b.status === 'nascut') {
    m.status = 'nascut';
    m.birthDate = b.birthDate || localDate();
  }
  if (typeof b.babyName === 'string') m.babyName = b.babyName.trim().slice(0, 40);
  if (['fata', 'baiat', 'nespecificat'].includes(b.babySex)) m.babySex = b.babySex;
  if (b.status === 'nascut') {
    /* deja tratat mai sus */
  } else if (b.status === 'incheiata') {
    m.status = 'incheiata';
    m.consents.offers = false;
  }
  commit({ type: 'mother', motherId: m.id });
  res.json(motherBundle(m));
});

function removeMother(mid) {
  const reqIds = new Set(db.requests.filter((r) => r.motherId === mid).map((r) => r.id));
  for (const key of ['checkins', 'requests', 'appointments', 'labs', 'progress', 'questions', 'sessions'])
    db[key] = db[key].filter((x) => x.motherId !== mid);
  db.messages = db.messages.filter((x) => !reqIds.has(x.requestId));
  db.mothers = db.mothers.filter((m) => m.id !== mid);
}

app.delete('/api/me', auth, (req, res) => {
  removeMother(req.mother.id);
  commit({ type: 'mother', motherId: req.mother.id });
  res.json({ ok: true });
});

/**
 * Demo fără cont: fiecare vizitator primește propria copie a Anei (săptămâna 28, cu 14 zile de istoric).
 * Așa, ce face un vizitator nu le strică demo-ul celorlalți. Copiile mai vechi de 24 de ore se șterg singure.
 */
app.post('/api/auth/demo', (_req, res) => {
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  db.mothers.filter((m) => m.demoClone && new Date(m.createdAt).getTime() < dayAgo).forEach((m) => removeMother(m.id));
  if (db.mothers.filter((m) => m.demoClone).length >= 300) return fail(res, 429, 'Demo-ul e plin acum. Încearcă din nou peste câteva minute.');

  const seed = createSeed();
  const ana = seed.mothers.find((m) => m.email === 'ana@demo.ro');
  const newId = id();
  const mine = (x) => x.motherId === ana.id;
  const requests = seed.requests.filter(mine);
  const reqIds = new Set(requests.map((r) => r.id));
  const clone = { ...ana, id: newId, email: `demo-${newId.slice(0, 8)}@demo.ro`, demoClone: true, createdAt: new Date().toISOString() };
  db.mothers.push(clone);
  for (const key of ['checkins', 'requests', 'labs', 'progress', 'questions'])
    db[key].push(...seed[key].filter(mine).map((x) => ({ ...x, motherId: newId })));
  db.messages.push(...seed.messages.filter((m) => reqIds.has(m.requestId)));
  const t = token();
  db.sessions.push({ token: t, motherId: newId });
  commit({ type: 'mother', motherId: newId });
  res.status(201).json({ token: t, ...motherBundle(clone) });
});

app.get('/api/me/export', auth, (req, res) => {
  res.set('Content-Disposition', 'attachment; filename="datele-mele-9careplus.json"');
  res.json(motherBundle(req.mother));
});

/** Un singur check-in pe zi; se poate modifica în aceeași zi. */
app.put('/api/me/checkins/today', auth, (req, res) => {
  const { mood, pain, sleep, note } = req.body || {};
  if (![1, 2, 3, 4, 5].includes(mood)) return fail(res, 400, 'Alege cum te simți.');
  if (!(Number.isInteger(pain) && pain >= 0 && pain <= 10)) return fail(res, 400, 'Durerea trebuie să fie între 0 și 10.');
  if (![1, 2, 3].includes(sleep)) return fail(res, 400, 'Alege cum ai dormit.');
  const today = localDate();
  let c = db.checkins.find((x) => x.motherId === req.mother.id && x.date === today);
  if (!c) {
    c = { id: id(), motherId: req.mother.id, date: today };
    db.checkins.push(c);
  }
  Object.assign(c, { mood, pain, sleep, note: String(note || '').slice(0, 1000), updatedAt: new Date().toISOString() });
  commit({ type: 'checkin', motherId: req.mother.id });
  res.json(c);
});

app.post('/api/me/requests', auth, async (req, res) => {
  const m = req.mother;
  if (!canContactClinic(m)) return fail(res, 403, 'Nu poți trimite cereri: verifică acordul pentru date sau perioada de acces.');
  const { type, message, includeEvolution } = req.body || {};
  if (!message?.trim()) return fail(res, 400, 'Scrie mesajul pentru clinică.');
  const now = new Date().toISOString();
  const r = {
    id: id(), motherId: m.id, clinicId: m.clinicId, type: type || 'Întrebare',
    includeEvolution: includeEvolution !== false, status: 'trimisa',
    createdAt: now, updatedAt: now, respondedAt: null, summary: 'Se pregătește rezumatul…', summaryAi: false,
  };
  db.requests.push(r);
  db.messages.push({ id: id(), requestId: r.id, author: 'mama', text: message.trim().slice(0, 2000), createdAt: now });
  commit({ type: 'request', motherId: m.id, requestId: r.id });
  res.status(201).json(r);
  const s = await summarize(r.includeEvolution ? checkinsOf(m.id, 14) : [], r, message);
  r.summary = s.text;
  r.summaryAi = s.ai;
  commit({ type: 'request-update', motherId: m.id, requestId: r.id });
});

app.post('/api/me/requests/:id/messages', auth, (req, res) => {
  const r = db.requests.find((x) => x.id === req.params.id && x.motherId === req.mother.id);
  if (!r) return fail(res, 404, 'Cererea nu a fost găsită.');
  if (!req.body?.text?.trim()) return fail(res, 400, 'Scrie mesajul.');
  db.messages.push({ id: id(), requestId: r.id, author: 'mama', text: req.body.text.trim().slice(0, 2000), createdAt: new Date().toISOString() });
  r.status = 'trimisa';
  r.updatedAt = new Date().toISOString();
  commit({ type: 'request', motherId: r.motherId, requestId: r.id });
  res.json({ ok: true });
});

app.post('/api/me/labs', auth, (req, res) => {
  if (!canContactClinic(req.mother)) return fail(res, 403, 'Nu poți trimite analize fără acordul pentru date.');
  const values = (req.body?.values || []).filter((v) => v && v.name && Number.isFinite(Number(v.value)));
  if (!values.length) return fail(res, 400, 'Adaugă cel puțin o valoare înainte să trimiți.');
  const lab = { id: id(), motherId: req.mother.id, source: req.body.source || 'foto', values, createdAt: new Date().toISOString() };
  db.labs.push(lab);
  commit({ type: 'lab', motherId: req.mother.id });
  res.status(201).json(lab);
});

app.post('/api/me/progress', auth, (req, res) => {
  const { lessonId } = req.body || {};
  const exists = db.progress.some((p) => p.motherId === req.mother.id && p.lessonId === lessonId);
  if (exists) db.progress = db.progress.filter((p) => !(p.motherId === req.mother.id && p.lessonId === lessonId));
  else db.progress.push({ motherId: req.mother.id, lessonId, at: new Date().toISOString() });
  commit({ type: 'progress', motherId: req.mother.id });
  res.json({ ok: true });
});

app.post('/api/me/questions', auth, (req, res) => {
  if (!req.body?.text?.trim()) return fail(res, 400, 'Scrie întrebarea.');
  db.questions.push({ id: id(), motherId: req.mother.id, text: req.body.text.trim().slice(0, 500), createdAt: new Date().toISOString() });
  commit({ type: 'question', motherId: req.mother.id });
  res.status(201).json({ ok: true });
});

app.delete('/api/me/questions/:id', auth, (req, res) => {
  db.questions = db.questions.filter((q) => !(q.id === req.params.id && q.motherId === req.mother.id));
  commit({ type: 'question', motherId: req.mother.id });
  res.json({ ok: true });
});

app.post('/api/assistant', auth, async (req, res) => {
  const q = String(req.body?.question || '').trim();
  if (!q) return fail(res, 400, 'Scrie întrebarea.');
  res.json(await answer(q.slice(0, 800), req.body?.lang === 'en' ? 'en' : 'ro'));
});

/** Cursurile, ghidurile și ofertele. Conversațiile cu asistentul NU se salvează și nu ajung la clinică. */
app.get('/api/content', auth, (req, res) => {
  const m = req.mother;
  const ended = m.status === 'incheiata';
  const en = req.query.lang === 'en';
  res.json({
    courses: (en ? COURSES_EN : COURSES).filter((c) => !(ended && c.sarcina)),
    articles: (en ? ARTICLES_EN : ARTICLES).map(({ cuvinte, ...a }) => a),
    offers: m.consents.offers && !isMinor(m.birthYear) && !ended ? (en ? OFFERS_EN : OFFERS) : [],
  });
});

// ---------- Clinica (în prototip, fără autentificare) ----------
const findClinic = (code) => db.clinics.find((c) => c.code.toUpperCase() === String(code).toUpperCase());

app.get('/api/clinic/:code/overview', (req, res) => {
  const clinic = findClinic(req.params.code);
  if (!clinic) return fail(res, 404, 'Clinica nu există.');
  const mothers = db.mothers.filter((m) => m.clinicId === clinic.id);
  const weekAgo = addDays(localDate(), -7);
  const patients = mothers.map((m) => {
    const cs = m.consents.health ? checkinsOf(m.id, 7) : [];
    const reqs = db.requests.filter((r) => r.motherId === m.id);
    return {
      ...publicMother(m),
      lastCheckin: m.consents.health ? checkinsOf(m.id).at(-1)?.date ?? null : null,
      maxPain7d: cs.length ? Math.max(...cs.map((c) => c.pain)) : null,
      openRequests: reqs.filter((r) => r.status !== 'rezolvata').length,
    };
  });
  const names = Object.fromEntries(mothers.map((m) => [m.id, `${m.firstName} ${m.lastName || ''}`.trim()]));
  const requests = db.requests
    .filter((r) => r.clinicId === clinic.id)
    .map((r) => ({ ...r, motherName: names[r.motherId], preview: db.messages.find((x) => x.requestId === r.id)?.text || '' }))
    .sort((a, b) => (a.status === 'trimisa' ? 0 : 1) - (b.status === 'trimisa' ? 0 : 1) || b.updatedAt.localeCompare(a.updatedAt));
  const monthStart = localDate().slice(0, 8) + '01';
  const responded = db.requests.filter((r) => r.clinicId === clinic.id && r.respondedAt);
  const avgHours = responded.length
    ? responded.reduce((s, r) => s + (new Date(r.respondedAt) - new Date(r.createdAt)) / 3600000, 0) / responded.length
    : null;
  res.json({
    clinic,
    patients,
    requests,
    stats: {
      activeThisMonth: mothers.filter((m) => (m.lastSeenAt || '').slice(0, 10) >= monthStart).length,
      requestsLast7d: requests.filter((r) => r.createdAt.slice(0, 10) > weekAgo).length,
      avgResponseHours: avgHours,
      pricePerPatient: 15,
    },
  });
});

app.patch('/api/clinic/:code', (req, res) => {
  const clinic = findClinic(req.params.code);
  if (!clinic) return fail(res, 404, 'Clinica nu există.');
  const h = Number(req.body?.responseHours);
  if (!(h >= 1 && h <= 168)) return fail(res, 400, 'Timpul de răspuns trebuie să fie între 1 și 168 de ore.');
  clinic.responseHours = h;
  commit({ type: 'clinic' });
  res.json(clinic);
});

app.get('/api/clinic/patients/:id', (req, res) => {
  const m = db.mothers.find((x) => x.id === req.params.id);
  if (!m) return fail(res, 404, 'Pacienta nu a fost găsită.');
  const b = motherBundle(m);
  if (!m.consents.health) {
    b.checkins = [];
    b.labs = [];
    b.noConsent = true;
  }
  delete b.questions; // întrebările pentru control sunt notițele mamei
  // Rezumatele făcute după reguli se refac în limba panoului; cele scrise de AI rămân cum sunt.
  if (req.query.lang === 'en') {
    b.requests = b.requests.map((r) =>
      r.summaryAi ? r : { ...r, summary: ruleSummary(r.includeEvolution ? checkinsOf(m.id, 14) : [], r, 'en') }
    );
  }
  res.json(b);
});

app.patch('/api/clinic/patients/:id', (req, res) => {
  const m = db.mothers.find((x) => x.id === req.params.id);
  if (!m) return fail(res, 404, 'Pacienta nu a fost găsită.');
  if ('minorConfirmed' in (req.body || {})) m.minorConfirmed = Boolean(req.body.minorConfirmed);
  if (req.body?.status === 'nascut') {
    m.status = 'nascut';
    m.birthDate = req.body.birthDate || localDate();
  }
  commit({ type: 'mother', motherId: m.id });
  res.json(publicMother(m));
});

// Programările NU se fac din aplicație: clinica le face telefonic, ca până acum.

app.patch('/api/clinic/requests/:id', (req, res) => {
  const r = db.requests.find((x) => x.id === req.params.id);
  if (!r) return fail(res, 404, 'Cererea nu a fost găsită.');
  if (!['trimisa', 'vazuta', 'rezolvata'].includes(req.body?.status)) return fail(res, 400, 'Status necunoscut.');
  r.status = req.body.status;
  r.updatedAt = new Date().toISOString();
  commit({ type: 'request-update', motherId: r.motherId, requestId: r.id });
  res.json(r);
});

app.post('/api/clinic/requests/:id/messages', (req, res) => {
  const r = db.requests.find((x) => x.id === req.params.id);
  if (!r) return fail(res, 404, 'Cererea nu a fost găsită.');
  const text = String(req.body?.text || '').trim();
  if (!text) return fail(res, 400, 'Scrie răspunsul.');
  const now = new Date().toISOString();
  db.messages.push({ id: id(), requestId: r.id, author: 'clinica', text: text.slice(0, 2000), createdAt: now });
  r.status = req.body.resolve ? 'rezolvata' : 'vazuta';
  r.respondedAt = r.respondedAt || now;
  r.updatedAt = now;
  commit({ type: 'reply', motherId: r.motherId, requestId: r.id });
  res.json({ ok: true });
});

app.post('/api/reset', (_req, res) => {
  db = createSeed();
  commit({ type: 'reset' });
  res.json({ ok: true });
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Serverul 9Care+ rulează pe http://localhost:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'Asistentul AI: activ.' : 'Asistentul AI: mod demo (fără cheie API; răspunde cu rezumatul articolului).');
});
