import { ShieldCheck, RefreshCcw, LogOut } from 'lucide-react';
import FeedbackButton from './FeedbackButton.jsx';
import { useAuth } from './AuthProvider.jsx';
import { useStore } from '../store/StoreProvider.jsx';

export default function Header({ title, subtitle }) {
  const { user, signOut } = useAuth();
  const { reload } = useStore();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => reload()}
            title="Daten neu von Supabase laden"
            style={{ padding: '8px 12px', fontSize: 12.5 }}
          >
            <RefreshCcw size={14} strokeWidth={1.75} />
            Aktualisieren
          </button>

          <FeedbackButton />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.22)',
              color: '#4ade80',
              fontFamily: 'var(--font-heading)',
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
            title="Es werden keine Klarnamen, E-Mails oder Telefonnummern gespeichert."
          >
            <ShieldCheck size={13} strokeWidth={2} />
            Pseudonymisiert
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => signOut()}
            title={user?.email ? `Abmelden (${user.email})` : 'Abmelden'}
            style={{ padding: '8px 12px', fontSize: 12.5 }}
          >
            <LogOut size={14} strokeWidth={1.75} />
            Abmelden
          </button>
        </div>
      </div>
    </header>
  );
}
