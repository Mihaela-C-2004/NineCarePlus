import { id, hashPassword, dueDateFor, localDate, addDays, daysAgoISO } from './util.js';
import { ruleSummary } from './assistant.js';

/**
 * Date FICTIVE pentru demonstrație. Conturi demo (parola pentru toate: demo1234):
 *   ana@demo.ro    – săptămâna 28, durerea crește în ultimele zile
 *   ioana@demo.ro  – săptămâna 34, are o cerere văzută
 *   maria@demo.ro  – după naștere, fetița Sofia (3 luni)
 *   bianca@demo.ro – 17 ani, săptămâna 20 (exemplu de pacientă minoră)
 */
export function createSeed() {
  const clinic = {
    id: 'clinic-demo',
    code: 'DEMO',
    name: 'Clinica Demo Timișoara',
    responseHours: 24,
    phone: '0256 000 000',
    schedule: 'Luni–Vineri, 8:00–20:00',
  };
  const year = new Date().getFullYear();
  const mother = (firstName, lastName, email, birthYear, extra) => {
    const { salt, hash } = hashPassword('demo1234');
    return {
      id: id(),
      email,
      salt,
      hash,
      firstName,
      lastName,
      birthYear,
      clinicId: clinic.id,
      status: 'activa',
      birthDate: null,
      consents: { terms: true, health: true, notifications: true, offers: true },
      minorConfirmed: false,
      reminderTime: '20:00',
      createdAt: daysAgoISO(90),
      lastSeenAt: daysAgoISO(0),
      ...extra,
    };
  };

  const ana = mother('Ana', 'Popescu', 'ana@demo.ro', year - 29, { dueDate: dueDateFor(28, 3) });
  const ioana = mother('Ioana', 'Marin', 'ioana@demo.ro', year - 33, { dueDate: dueDateFor(34, 1) });
  const maria = mother('Maria', 'Dumitru', 'maria@demo.ro', year - 31, {
    dueDate: addDays(localDate(), -93),
    birthDate: addDays(localDate(), -95),
    status: 'nascut',
    babyName: 'Sofia',
    babySex: 'fata',
  });
  const bianca = mother('Bianca', 'Ilie', 'bianca@demo.ro', year - 17, {
    dueDate: dueDateFor(20, 2),
    consents: { terms: true, health: true, notifications: true, offers: false },
  });

  const series = (m, pains, moods, sleeps, notes = {}) =>
    pains.map((pain, i) => {
      const ago = pains.length - i; // ultima zi completată: ieri, ca demo-ul să poată face check-in azi
      return {
        id: id(),
        motherId: m.id,
        date: addDays(localDate(), -ago),
        mood: moods[i],
        pain,
        sleep: sleeps[i],
        note: notes[ago] || '',
        updatedAt: daysAgoISO(ago, 20),
      };
    });

  const checkins = [
    ...series(
      ana,
      [1, 1, 2, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6, 6],
      [4, 4, 4, 5, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2],
      [3, 3, 3, 3, 2, 3, 3, 2, 2, 2, 2, 1, 1, 1],
      { 1: 'Mă doare spatele mai tare seara.', 3: 'Am dormit foarte puțin.' }
    ),
    ...series(ioana, [2, 2, 1, 2, 2, 3, 2, 2, 2, 3, 2, 2], [4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 4, 4], [2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2, 2]),
    ...series(
      maria,
      [4, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
      [3, 2, 3, 2, 2, 3, 2, 2, 2, 2, 3, 2, 2, 2],
      [1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1],
      { 2: 'Mă simt copleșită și obosită.' }
    ),
    ...series(bianca, [1, 2, 1, 1, 2, 1, 1], [4, 3, 4, 4, 3, 4, 4], [3, 2, 3, 3, 2, 3, 3]),
  ];

  const requests = [];
  const messages = [];
  const addRequest = (m, type, text, status, createdAgoH, reply) => {
    const created = new Date(Date.now() - createdAgoH * 3600 * 1000).toISOString();
    const r = {
      id: id(),
      motherId: m.id,
      clinicId: clinic.id,
      type,
      includeEvolution: true,
      status,
      createdAt: created,
      updatedAt: created,
      respondedAt: null,
      summary: '',
      summaryAi: false,
    };
    const last14 = checkins.filter((c) => c.motherId === m.id).slice(-14);
    r.summary = ruleSummary(last14, r);
    requests.push(r);
    messages.push({ id: id(), requestId: r.id, author: 'mama', text, createdAt: created });
    if (reply) {
      const at = new Date(Date.now() - (createdAgoH - 3) * 3600 * 1000).toISOString();
      messages.push({ id: id(), requestId: r.id, author: 'clinica', text: reply, createdAt: at });
      r.respondedAt = at;
      r.updatedAt = at;
    }
  };
  addRequest(ioana, 'Întrebare', 'Am un drum lung cu mașina săptămâna viitoare. E ceva la care trebuie să fiu atentă?', 'vazuta', 5);
  addRequest(maria, 'Întrebare', 'Sofia doarme foarte puțin ziua. E ceva ce ar trebui să discut cu pediatrul?', 'rezolvata', 30, 'Mulțumim că ne-ați scris. Discutați la următorul control la pediatru; dacă vă îngrijorează ceva între timp, sunați-ne.');
  addRequest(ana, 'Întrebare', 'Trebuie să vin nemâncată la testul de glucoză?', 'rezolvata', 200, 'Da, veniți dimineața, fără să mâncați. Vă așteptăm!');

  const appointments = []; // programările se fac telefonic, nu din aplicație

  const labs = [
    {
      id: id(),
      motherId: ioana.id,
      createdAt: daysAgoISO(6, 12),
      source: 'foto',
      values: [
        { key: 'hemoglobina', name: 'Hemoglobină', value: 10.6, unit: 'g/dL', refMin: 11.5, refMax: 15.5 },
        { key: 'feritina', name: 'Feritină', value: 12, unit: 'ng/mL', refMin: 15, refMax: 150 },
        { key: 'glicemie', name: 'Glicemie', value: 88, unit: 'mg/dL', refMin: 70, refMax: 105 },
      ],
    },
  ];

  return {
    clinics: [clinic],
    mothers: [ana, ioana, maria, bianca],
    sessions: [],
    checkins,
    requests,
    messages,
    appointments,
    labs,
    progress: [{ motherId: ana.id, lessonId: 'n1', at: daysAgoISO(3) }],
    questions: [{ id: id(), motherId: ana.id, text: 'Ce pot face pentru durerea de spate seara?', createdAt: daysAgoISO(1) }],
  };
}

