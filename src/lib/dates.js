import { getLang } from '../i18n/index.jsx';

const loc = () => (getLang() === 'en' ? 'en-GB' : 'ro-RO');
const DAY = 86400000;

export function localDate(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
export const addDays = (dateStr, n) => localDate(new Date(new Date(`${dateStr}T12:00:00`).getTime() + n * DAY));

export function daysUntil(dateStr) {
  return Math.round((new Date(`${dateStr}T12:00:00`) - new Date(`${localDate()}T12:00:00`)) / DAY);
}
export function weeksSince(dateStr) {
  return Math.max(0, Math.floor(-daysUntil(dateStr) / 7));
}
export function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const en = getLang() === 'en';
  if (minutes < 1) return en ? 'just now' : 'chiar acum';
  if (minutes < 60) return en ? `${minutes} min ago` : `acum ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return en ? (hours === 1 ? '1 hour ago' : `${hours} hours ago`) : hours === 1 ? 'acum o oră' : `acum ${hours} ore`;
  const days = Math.round(hours / 24);
  return en ? (days === 1 ? 'yesterday' : `${days} days ago`) : days === 1 ? 'ieri' : `acum ${days} zile`;
}
export const shortDate = (s) => new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString(loc(), { day: 'numeric', month: 'short' });
export const longDate = (s) => new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' });
export const weekdayDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' });
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
