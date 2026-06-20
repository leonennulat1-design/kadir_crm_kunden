import { ShieldCheck } from 'lucide-react';

export default function Header({ title, subtitle }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>

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
      </div>
    </header>
  );
}
