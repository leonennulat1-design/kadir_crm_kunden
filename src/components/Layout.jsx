import { Outlet, useLocation, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useStore } from '../store/StoreProvider.jsx';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Fortschritt, Muster und Umsatz im Überblick' },
  '/kunden': { title: 'Kunden', subtitle: 'Zahlende Coaching-Kunden, pseudonymisiert geführt' },
  '/faelle': { title: 'Fälle', subtitle: 'Dokumentierte Konfliktfälle für die Musteranalyse' },
  '/sessions': { title: 'Sessions', subtitle: 'Session-Dokumentation mit Einverständnis' },
  '/muster': { title: 'Muster', subtitle: 'Methoden-Bibliothek aus wiederkehrenden Dynamiken' },
  '/content': { title: 'Content', subtitle: 'Ideen aus deinen Sessions, sortiert und bewertbar' },
  '/umsatz': { title: 'Umsatz', subtitle: 'Erlöse nach Stufe' },
  '/auswertung': { title: 'Auswertung', subtitle: 'Kennzahlen und Export für externe KI-Analyse' },
  '/feedback': { title: 'Feedback', subtitle: 'Notizen zur App, lokal gespeichert' },
  '/einstellungen': { title: 'Einstellungen', subtitle: 'Datenschutz und Backup' },
};

export default function Layout() {
  const { pathname } = useLocation();
  const { saveError } = useStore();
  const meta = PAGE_META[pathname] ?? { title: 'CRM', subtitle: '' };

  return (
    <>
      <Sidebar />
      <div className="app-shell">
        {saveError && (
          <div
            role="alert"
            style={{
              background: 'rgba(238,76,39,0.16)',
              borderBottom: '1px solid rgba(238,76,39,0.4)',
              color: '#ffb3a3',
              padding: '12px 32px',
              fontSize: 13,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <AlertTriangle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ fontFamily: 'var(--font-heading)' }}>
                Speichern fehlgeschlagen.
              </strong>{' '}
              {saveError}{' '}
              <Link
                to="/einstellungen"
                style={{ color: '#ffd6cc', textDecoration: 'underline' }}
              >
                Zu den Einstellungen
              </Link>
            </span>
          </div>
        )}
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
