import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Übersicht deiner Pipeline und Aktivitäten' },
  '/leads': { title: 'Leads', subtitle: 'Verwalte deine eingehenden Interessenten' },
  '/contacts': { title: 'Kontakte', subtitle: 'Dein Kontaktverzeichnis' },
  '/deals': { title: 'Deals', subtitle: 'Aktuelle Verkaufschancen' },
  '/meetings': { title: 'Meetings', subtitle: 'Termine und Kalender' },
  '/email': { title: 'E-Mail', subtitle: 'Posteingang und Konversationen' },
  '/settings': { title: 'Einstellungen', subtitle: 'Konto und Workspace' },
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
