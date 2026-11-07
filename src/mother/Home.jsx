import { fruitForWeek } from '../data/fruits.js';
import { babyStage } from '../data/baby.js';
import { PREGNANCY_TIPS, POSTPARTUM_TIPS, tipOfTheDay } from '../data/tips.js';
import { daysUntil, localDate, longDate, plural } from '../lib/dates.js';
import { STATUS } from '../components/ui.jsx';

export default function Home({ data, content, go }) {
  const { me, checkins, requests, clinic } = data;

  if (me.status === 'incheiata') {
    return (
      <section className="stack narrow">
        <h1 className="hello">Bună, {me.firstName}</h1>
        <div className="card calm">
          <h2>Suntem aici pentru tine</h2>
          <p>Am oprit conținutul despre sarcină și notificările. Echipa {clinic.name} e aici dacă vrei să vorbești cu cineva.</p>
          <button className="btn btn-primary" onClick={() => go('clinic', { clinicIntent: 'new' })}>Scrie clinicii</button>
        </div>
      </section>
    );
  }

  const postpartum = me.status === 'nascut';
  const checkedIn = checkins.some((c) => c.date === localDate());
  const openReq = requests.find((r) => r.status !== 'rezolvata');
  const ring = 2 * Math.PI * 118;

  let hero;
  if (postpartum) {
    const b = babyStage(me.birthDate);
    const name = me.babyName || 'Bebelușul tău';
    hero = (
      <div className="hero" style={{ '--fruit': 'var(--accent)' }}>
        <div className="orb">
          <svg className="orb-ring" viewBox="0 0 256 256" aria-hidden="true">
            <circle cx="128" cy="128" r="118" className="ring-track" />
            <circle cx="128" cy="128" r="118" className="ring-fill" strokeDasharray={ring} strokeDashoffset={ring * (1 - Math.min(1, b.months / 12))} />
          </svg>
          <img className="baby-img" src={b.img} alt={`${name}, ${b.age}`} style={{ '--s': b.scale }} />
          <img className="toy-img" src={b.toy} alt="" />
        </div>
        <p className="baby-name">{name}</p>
        <p className="hero-line">are {b.age}.</p>
        <p className="hero-sub">{b.text} Fiecare copil are ritmul lui.</p>
      </div>
    );
  } else {
    const fruit = fruitForWeek(me.week);
    const daysLeft = daysUntil(me.dueDate);
    hero = (
      <div className="hero" style={{ '--fruit': fruit.color }}>
        <div className="orb">
          <svg className="orb-ring" viewBox="0 0 256 256" aria-hidden="true">
            <circle cx="128" cy="128" r="118" className="ring-track" />
            <circle cx="128" cy="128" r="118" className="ring-fill" strokeDasharray={ring} strokeDashoffset={ring * (1 - Math.min(1, (me.week * 7 + me.weekDay) / 280))} />
          </svg>
          <img key={fruit.img} className="fruit-img" src={fruit.img} alt={fruit.name} />
        </div>
        <p className="hero-line">Bebelușul tău e cât {fruit.name}.</p>
        <p className="hero-sub">
          Aproximativ {fruit.size} și {fruit.weight}.{' '}
          {daysLeft > 0 ? `Mai sunt ${plural(daysLeft, 'zi', 'zile')} până la data estimată.` : 'Ai ajuns la data estimată.'}
        </p>
      </div>
    );
  }

  return (
    <section className="home">
      <div className="home-top">
        <h1 className="hello">Bună, {me.firstName}</h1>
        <p className="today">{postpartum ? `Te însoțim până pe ${longDate(me.accessUntil)}` : `Săptămâna ${me.week}, ziua ${me.weekDay}`}</p>
      </div>

      <div className="home-grid">
        <div className="home-hero">{hero}</div>

        <div className="stack">
          {!checkedIn && (
            <button className="card cta-card" onClick={() => go('state')}>
              <img src={postpartum ? '/img/teddy.png' : '/img/strawberry.png'} alt="" className="cta-img" />
              <span>
                <strong>Cum te simți azi?</strong>
                <span className="muted">Check-in-ul durează 20 de secunde.</span>
              </span>
            </button>
          )}

          {openReq && (
            <button className="card small-card" onClick={() => go('clinic', { clinicIntent: openReq.id })}>
              <span className="muted">Cererea ta către clinică</span>
              <strong>{openReq.type}</strong>
              <span className={`status-pill s-${openReq.status}`}>{STATUS[openReq.status]}</span>
            </button>
          )}

          <article className="tip">
            <h2>Sfatul zilei</h2>
            <p>{tipOfTheDay(postpartum ? POSTPARTUM_TIPS : PREGNANCY_TIPS)}</p>
          </article>

          <div className="shortcuts">
            {!postpartum && (
              <button className="shortcut" onClick={() => go(null, { page: 'birth' })}>
                <img src="/img/bottle.png" alt="" />Pregătirea pentru naștere
              </button>
            )}
            <button className="shortcut" onClick={() => go(null, { page: 'documents' })}>
              <img src="/img/balloon.png" alt="" />Ghidul pentru acte
            </button>
            {content.offers.length > 0 && (
              <button className="shortcut" onClick={() => go(null, { page: 'offers' })}>
                <img src="/img/teddy.png" alt="" />Oferte
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
