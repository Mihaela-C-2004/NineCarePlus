import { useEffect, useState } from 'react';
import MotherApp from './mother/MotherApp.jsx';
import ClinicApp from './clinic/ClinicApp.jsx';
import { Splash } from './components/ui.jsx';

// http://localhost:5173/          → aplicația mamei (telefon)
// http://localhost:5173/#clinica  → panoul clinicii (calculator)
const isClinic = () => window.location.hash.replace(/^#\/?/, '').startsWith('clinica');

export default function App() {
  const [clinic, setClinic] = useState(isClinic);
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onHash = () => setClinic(isClinic());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return (
    <>
      {splash && <Splash />}
      {clinic ? <ClinicApp /> : <MotherApp />}
    </>
  );
}
