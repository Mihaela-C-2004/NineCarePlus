import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const DAY = 24 * 60 * 60 * 1000;
export const id = () => randomUUID();
export const token = () => randomBytes(24).toString('hex');

/** Data locală în format AAAA-LL-ZZ (nu UTC), ca check-in-ul de azi să fie chiar de azi. */
export function localDate(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

export const addDays = (dateStr, n) => localDate(new Date(new Date(`${dateStr}T12:00:00`).getTime() + n * DAY));

export function addMonths(dateStr, n) {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setMonth(d.getMonth() + n);
  return localDate(d);
}

/** Zilele de sarcină: zilele trecute de la (data estimată − 280 de zile). */
export function pregnancyDay(dueDate, now = new Date()) {
  const start = new Date(`${dueDate}T00:00:00`).getTime() - 280 * DAY;
  return Math.floor((now.getTime() - start) / DAY);
}

/** Data estimată a nașterii pentru o sarcină aflată acum în săptămâna `week`, ziua `day`. */
export const dueDateFor = (week, day = 0) => addDays(localDate(), 280 - (week * 7 + day));

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: scryptSync(password, salt, 32).toString('hex') };
}

export function checkPassword(password, salt, hash) {
  const a = scryptSync(password, salt, 32);
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export const isMinor = (birthYear) => new Date().getFullYear() - Number(birthYear) < 18;

/** Accesul complet ține până la 12 luni după naștere. */
export const accessUntil = (mother) => (mother.birthDate ? addMonths(mother.birthDate, 12) : null);
export const accessExpired = (mother) => {
  const until = accessUntil(mother);
  return Boolean(until && localDate() > until);
};

export const daysAgoISO = (n, hour = 9) => {
  const d = new Date(Date.now() - n * DAY);
  d.setHours(hour, 0, 0, 0);
  return new Date(Math.min(d.getTime(), Date.now() - 40 * 60 * 1000)).toISOString();
};
