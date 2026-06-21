import { Settings as SettingsIcon, ShieldCheck, Database, MessageSquare, Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';

const TS = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function Settings() {
  const { state, deleteFeedback } = useStore();

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

  const feedback = [...state.feedback].sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );

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
          „Einverständnis liegt vor". Hochgeladene Einverständnis-Dateien liegen lokal in
          deinem Browser (IndexedDB) und sind nicht öffentlich erreichbar.
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
          Alle Daten werden lokal in deinem Browser (LocalStorage + IndexedDB für Dateien)
          gehalten. Nichts geht an einen Server. Du kannst jederzeit einen JSON-Export ziehen.
        </p>
        <button className="btn-primary" onClick={exportJson}>
          JSON-Export herunterladen
        </button>
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
              background: 'rgba(96,165,250,0.16)',
              color: '#60a5fa',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <MessageSquare size={18} strokeWidth={1.75} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Feedback</h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 14 }}>
          Alle Feedback-Einträge aus dem Button oben rechts. Zeitstempel und Seite werden
          automatisch mitgespeichert.
        </p>

        {feedback.length === 0 ? (
          <div
            style={{
              padding: 18,
              borderRadius: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              fontSize: 13,
              color: 'var(--muted)',
              textAlign: 'center',
            }}
          >
            Noch keine Feedback-Einträge.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feedback.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      fontSize: 11.5,
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    <span>{f.createdAt ? TS.format(new Date(f.createdAt)) : '–'}</span>
                    {f.page && (
                      <>
                        <span>·</span>
                        <code style={{ fontFamily: 'inherit' }}>{f.page}</code>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 13.5, whiteSpace: 'pre-wrap' }}>{f.text}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Eintrag löschen?')) deleteFeedback(f.id);
                  }}
                  aria-label="Eintrag löschen"
                  style={{ color: 'var(--muted)', padding: 4 }}
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}
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
