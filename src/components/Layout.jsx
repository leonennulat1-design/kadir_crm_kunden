import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Fortschritt, Muster und Umsatz im Überblick' },
  '/kunden': { title: 'Kunden', subtitle: 'Zahlende Coaching-Kunden, pseudonymisiert geführt' },
  '/faelle': { title: 'Fälle', subtitle: 'Dokumentierte Konfliktfälle für die Musteranalyse' },
  '/sessions': { title: 'Sessions', subtitle: 'Session-Dokumentation mit Einverständnis' },
  '/muster': { title: 'Muster', subtitle: 'Methoden-Bibliothek aus wiederkehrenden Dynamiken' },
  '/umsatz': { title: 'Umsatz', subtitle: 'Erlöse nach Stufe' },
  '/einstellungen': { title: 'Einstellungen', subtitle: 'Workspace' },
};

export default function Layout() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { title: 'CRM', subtitle: '' };

  return (
    <>
      <Sidebar />
      <div className="app-shell">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="app-content">
          <div className="app-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
