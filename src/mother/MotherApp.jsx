import { useCallback, useEffect, useState } from 'react';
import { api, getToken, setToken, subscribe } from '../lib/api.js';
import { Icon, Logo, ThemeToggle } from '../components/ui.jsx';
import { LangToggle, useLang } from '../i18n/index.jsx';
import Auth from './Auth.jsx';
import Home from './Home.jsx';
import MyState from './MyState.jsx';
import Assistant from './Assistant.jsx';
import Courses from './Courses.jsx';
import ClinicTab from './ClinicTab.jsx';
import Profile from './Profile.jsx';
import Search from './Search.jsx';
import { Offers, Documents, BirthPrep } from './Extras.jsx';

const TABS = [
  ['home', 'Acasă', 'home'],
  ['state', 'Starea mea', 'heart'],
  ['assistant', 'Asistent', 'chat'],
  ['courses', 'Cursuri', 'book'],
  ['clinic', 'Clinica', 'clinic'],
];
const PAGES = { profile: 'Profilul meu', offers: 'Oferte', documents: 'Ghidul pentru acte', birth: 'Pregătirea pentru naștere', search: 'Caută' };

/** Tema roz sau albastră, după genul bebelușului (după naștere). */
function useBabyTheme(me) {
  useEffect(() => {
    const root = document.documentElement;
    if (me?.status === 'nascut' && me.babySex === 'fata') root.dataset.baby = 'girl';
    else if (me?.status === 'nascut' && me.babySex === 'baiat') root.dataset.baby = 'boy';
    else delete root.dataset.baby;
  }, [me?.status, me?.babySex]);
}

export default function MotherApp() {
  const [hasToken, setHasToken] = useState(Boolean(getToken()));
  const [data, setData] = useState(null);
  const [content, setContent] = useState(null);
  const [tab, setTab] = useState('home');
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  const [chat, setChat] = useState([]); // conversația cu asistentul rămâne doar pe dispozitiv
  const [query, setQuery] = useState('');
  const [intents, setIntents] = useState({});
  useBabyTheme(data?.me);
  const lang = useLang();

  const signOut = useCallback(() => {
    setToken(null);
    setHasToken(false);
    setData(null);
    setContent(null);
    setChat([]);
    setTab('home');
    setPage(null);
    delete document.documentElement.dataset.baby;
  }, []);

  const refresh = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [bundle, c] = await Promise.all([api.me(), api.content()]);
      setData(bundle);
      setContent(c);
      setError('');
    } catch (e) {
      if (e.status === 401) signOut();
      else setError(e.message);
    }
  }, [signOut]);

  useEffect(() => {
    if (hasToken) refresh();
  }, [hasToken, refresh, lang]);

  useEffect(
    () =>
      subscribe((ev) => {
        if (ev.type === 'reset') return signOut();
        if (data && ev.motherId === data.me.id) refresh();
      }),
    [data, refresh, signOut]
  );

  const go = (nextTab, options = {}) => {
    const { page: nextPage = null, ...rest } = options;
    setPage(nextPage);
    if (nextTab) setTab(nextTab);
    if (Object.keys(rest).length) setIntents((x) => ({ ...x, ...rest }));
    window.scrollTo(0, 0);
  };
  const clearIntent = useCallback((key) => setIntents((x) => ({ ...x, [key]: null })), []);

  const onAuth = (res) => {
    setToken(res.token);
    const { token, ...bundle } = res;
    setData(bundle);
    setHasToken(true);
    setTab('home');
  };

  if (!hasToken) return <Auth onDone={onAuth} />;

  if (!data || !content) {
    return (
      <main className="m-shell center-screen">
        <Logo size={48} />
        <p className="muted">{error || 'Se încarcă…'}</p>
        {error && <button className="btn btn-soft" onClick={refresh}>Încearcă din nou</button>}
      </main>
    );
  }

  const shared = { data, content, refresh, go };

  return (
    <div className="m-shell">
      <header className="m-header">
        {page && page !== 'search' ? (
          <button className="back-btn" onClick={() => setPage(null)}>
            <Icon name="back" size={20} /> Înapoi
          </button>
        ) : (
          <button className="logo-btn" onClick={() => go('home')} aria-label="Acasă">
            <Logo size={34} />
          </button>
        )}
        {page && page !== 'search' && <h1 className="page-title">{PAGES[page]}</h1>}
        <div className="header-actions">
          <div className="search-field inline">
            <Icon name="search" size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (page !== 'search') setPage('search');
              }}
              placeholder="Caută…"
              aria-label="Caută în aplicație"
            />
          </div>
          <button className="icon-btn search-icon" onClick={() => setPage(page === 'search' ? null : 'search')} aria-label={page === 'search' ? 'Închide căutarea' : 'Caută'}>
            <Icon name={page === 'search' ? 'close' : 'search'} />
          </button>
          <LangToggle />
          <ThemeToggle />
          <button className="icon-btn avatar" onClick={() => setPage('profile')} aria-label="Profilul meu">
            {data.me.firstName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="m-main">
        {page === 'search' && <Search {...shared} query={query} setQuery={setQuery} autoFocus={window.innerWidth < 1100} />}
        {page === 'profile' && <Profile {...shared} onSignOut={signOut} />}
        {page === 'offers' && <Offers {...shared} />}
        {page === 'documents' && <Documents />}
        {page === 'birth' && <BirthPrep {...shared} />}
        {!page && tab === 'home' && <Home {...shared} />}
        {!page && tab === 'state' && <MyState {...shared} />}
        {!page && tab === 'assistant' && (
          <Assistant {...shared} chat={chat} setChat={setChat} intent={intents.assistantIntent} clearIntent={() => clearIntent('assistantIntent')} />
        )}
        {!page && tab === 'courses' && <Courses {...shared} intent={intents.coursesIntent} clearIntent={() => clearIntent('coursesIntent')} />}
        {!page && tab === 'clinic' && <ClinicTab {...shared} intent={intents.clinicIntent} clearIntent={() => clearIntent('clinicIntent')} />}
      </main>

      {/* Pe telefon: bara de jos. Pe calculator: aceeași bară, mutată sus prin CSS. */}
      <nav className="tabbar" aria-label="Secțiuni">
        {TABS.map(([key, label, icon]) => {
          const unread = key === 'clinic' && data.requests.some((r) => r.messages.at(-1)?.author === 'clinica' && Date.now() - new Date(r.updatedAt) < 48 * 3600e3);
          const on = !page && tab === key;
          return (
            <button key={key} className={`tab ${on ? 'on' : ''}`} onClick={() => go(key)} aria-current={on ? 'page' : undefined}>
              <span className="tab-icon">
                <Icon name={icon} />
                {unread && <span className="dot" aria-label="Răspuns nou" />}
              </span>
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
