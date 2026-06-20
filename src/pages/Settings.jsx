import { Settings as SettingsIcon, ShieldCheck, Database } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';

export default function Settings() {
  const { state } = useStore();

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kadir-crm-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Datenhaltung</h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 14 }}>
          Alle Daten werden lokal in deinem Browser (LocalStorage) gehalten. Nichts geht an
          einen Server. Du kannst jederzeit einen JSON-Export ziehen.
        </p>
        <button className="btn-primary" onClick={exportJson}>
          JSON-Export herunterladen
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
