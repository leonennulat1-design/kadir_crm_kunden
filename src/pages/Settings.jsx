import { Settings as SettingsIcon, ShieldCheck, Database, Download } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';

export default function Settings() {
  const { state } = useStore();

  const downloadBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: state.version,
      customers: state.customers,
      cases: state.cases,
      sessions: state.sessions,
      patterns: state.patterns,
      revenue: state.revenue,
      feedback: state.feedback,
      vocab: state.vocab,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kadir-crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const totals = {
    customers: state.customers.length,
    cases: state.cases.length,
    sessions: state.sessions.length,
    patterns: state.patterns.length,
    revenue: state.revenue.length,
    feedback: state.feedback.length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(74,222,128,0.14)',
              color: '#4ade80',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ShieldCheck size={18} strokeWidth={1.75} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Datenschutz</h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          In diesem CRM werden bewusst keine Klarnamen, E-Mail-Adressen oder Telefonnummern
          gespeichert. Kunden werden über Kundennummern (K001, K002, …), Fälle über
          Fallnummern (F001, F002, …) geführt. Jede Session erfordert das Pflicht-Häkchen
          „Einverständnis liegt vor".
        </p>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255,155,38,0.16)',
              color: 'var(--orange)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Database size={18} strokeWidth={1.75} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Backup</h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 14 }}>
          Alle Daten werden lokal in deinem Browser (LocalStorage) gehalten. Mit dem Backup
          ziehst du die komplette Datenbank als eine einzelne JSON-Datei – alle Tabellen,
          nur pseudonymisierte Daten.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            ['Kunden', totals.customers],
            ['Fälle', totals.cases],
            ['Sessions', totals.sessions],
            ['Muster', totals.patterns],
            ['Umsatzeinträge', totals.revenue],
            ['Feedback', totals.feedback],
          ].map(([label, n]) => (
            <div
              key={label}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: '-0.01em',
                }}
              >
                {n}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={downloadBackup}>
          <Download size={16} strokeWidth={2} />
          Vollständiges Backup herunterladen
        </button>
      </div>

      <div className="card" style={{ opacity: 0.6 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--muted)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <SettingsIcon size={18} strokeWidth={1.75} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Workspace</h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Weitere Workspace-Einstellungen folgen, sobald sie aus der echten Arbeit heraus
          notwendig werden.
        </p>
      </div>
    </div>
  );
}
