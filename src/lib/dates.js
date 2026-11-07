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
  if (minutes < 1) return 'chiar acum';
  if (minutes < 60) return `acum ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? 'acum o oră' : `acum ${hours} ore`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'ieri' : `acum ${days} zile`;
}
export const shortDate = (s) => new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
export const longDate = (s) => new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
export const weekdayDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
