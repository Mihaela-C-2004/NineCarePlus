import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useTheme } from '../lib/theme.js';
import { addDays, localDate, shortDate } from '../lib/dates.js';

export function LogoMark({ size = 36 }) {
  // Mama (bucla albă a cifrei 9) care își ține bebelușul (cercul roz din mijloc), plus semnul „+”.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="nc-bg" x1="6" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9A6BDB" />
          <stop offset="0.55" stopColor="#C774B8" />
          <stop offset="1" stopColor="#F29AA9" />
        </linearGradient>
        <radialGradient id="nc-shine" cx="18" cy="10" r="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nc-baby" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF6F8" />
          <stop offset="1" stopColor="#FFD3DD" />
        </linearGradient>
      </defs>
      <path d="M32 2C52.5 2 62 11.5 62 32S52.5 62 32 62 2 52.5 2 32 11.5 2 32 2Z" fill="url(#nc-bg)" />
      <path d="M32 2C52.5 2 62 11.5 62 32S52.5 62 32 62 2 52.5 2 32 11.5 2 32 2Z" fill="url(#nc-shine)" />
      <g transform="translate(0 1.6)" opacity="0.18" stroke="#4A1E6E" strokeWidth="6.5" fill="none" strokeLinecap="round">
        <circle cx="30" cy="26" r="11" />
        <path d="M41 26c0 14-7 23-18 26" />
      </g>
      <g stroke="#fff" strokeWidth="6.5" fill="none" strokeLinecap="round">
        <circle cx="30" cy="26" r="11" />
        <path d="M41 26c0 14-7 23-18 26" />
      </g>
      <circle cx="30" cy="26" r="5.2" fill="url(#nc-baby)" />
      <circle cx="28.3" cy="24.3" r="1.5" fill="#fff" opacity="0.9" />
      <path d="M50.5 9.5v8M46.5 13.5h8" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0.95" />
    </svg>
  );
}

/** Ecranul de pornire: logoul apare, apoi se deschide aplicația. */
export function Splash() {
  return (
    <div className="splash" role="status" aria-label="Se deschide 9Care+">
      <div className="splash-inner">
        <LogoMark size={104} />
        <span className="splash-word">
          9Care<span className="logo-plus">+</span>
        </span>
        <span className="splash-tag">9 luni și tot ce urmează</span>
      </div>
    </div>
  );
}

export function Logo({ size = 36, tagline = false }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-text">
        <span className="logo-word">
          9Care<span className="logo-plus">+</span>
        </span>
        {tagline && <span className="logo-tagline">9 luni și tot ce urmează</span>}
      </span>
    </span>
  );
}

const PATHS = {
  home: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'],
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z'],
  chat: ['M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z'],
  book: ['M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z', 'M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'],
  clinic: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M12 8v8M8 12h8'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
  sun: ['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'],
  mic: ['M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z', 'M19 10v2a7 7 0 0 1-14 0v-2M12 19v3'],
  send: ['M22 2 11 13', 'M22 2 15 22l-4-9-9-4z'],
  back: ['M15 18l-6-6 6-6'],
  check: ['M20 6 9 17l-5-5'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
};

export function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';
  return (
    <button className="icon-btn theme-toggle" onClick={toggle} aria-label={dark ? 'Treci pe modul de zi' : 'Treci pe modul de noapte'} title={dark ? 'Mod de zi' : 'Mod de noapte'}>
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}

export function Banner112({ text = 'Dacă te îngrijorează ceva, trimite o cerere clinicii. Pentru urgențe, sună la ' }) {
  return (
    <p className="banner-112" role="note">
      {text}
      <a href="tel:112">112</a>.
    </p>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map(([key, text]) => (
        <button key={key} role="tab" aria-selected={value === key} className={value === key ? 'on' : ''} onClick={() => onChange(key)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export const STATUS = { trimisa: 'Trimisă', vazuta: 'Văzută', rezolvata: 'Rezolvată' };
export const SLEEP_TEXT = { 1: 'prost', 2: 'așa și așa', 3: 'bine' };
export const MOOD_TEXT = { 1: 'foarte rău', 2: 'rău', 3: 'așa și așa', 4: 'bine', 5: 'foarte bine' };

/** Graficul stării, durerii și somnului pe ultimele `days` zile. */
export function EvolutionChart({ checkins, days = 14, height = 220 }) {
  const byDate = Object.fromEntries(checkins.map((c) => [c.date, c]));
  const data = Array.from({ length: days }, (_, i) => {
    const date = addDays(localDate(), i - days + 1);
    const c = byDate[date];
    return { zi: shortDate(date), Durere: c?.pain ?? null, Stare: c?.mood ?? null, Somn: c ? [null, 1, 3, 5][c.sleep] : null };
  });
  if (!checkins.length) return <p className="muted">Încă nu există check-in-uri.</p>;
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
          <XAxis dataKey="zi" tick={{ fontSize: 11, fill: 'var(--muted)' }} padding={{ left: 8, right: 8 }} interval="preserveStartEnd" minTickGap={18} />
          <YAxis yAxisId="p" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: 'var(--alert)' }} />
          <YAxis yAxisId="m" orientation="right" domain={[1, 5]} ticks={[1, 3, 5]} tick={{ fontSize: 11, fill: 'var(--primary)' }} />
          <Tooltip
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--ink)' }}
            formatter={(v, name) =>
              name === 'Durere' ? `${v} din 10` : name === 'Stare' ? MOOD_TEXT[v] : { 1: 'prost', 3: 'așa și așa', 5: 'bine' }[v]
            }
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line yAxisId="p" dataKey="Durere" stroke="var(--alert)" strokeWidth={2.5} dot={{ r: 2.5 }} connectNulls />
          <Line yAxisId="m" dataKey="Stare" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 2.5 }} connectNulls />
          <Line yAxisId="m" dataKey="Somn" stroke="var(--mint)" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 2 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <p className="fine-print">Durerea pe axa din stânga (0–10). Starea și somnul pe axa din dreapta: mai sus înseamnă mai bine.</p>
    </div>
  );
}
