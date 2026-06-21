import { MessageSquare, Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';

const TS = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function Feedback() {
  const { state, deleteFeedback } = useStore();

  const rows = [...state.feedback].sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  if (!rows.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Noch kein Feedback erfasst"
        description="Über den Button oben rechts kannst du jederzeit Notizen zur App festhalten. Sie landen alle hier, mit Zeitstempel und Seite."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: 'rgba(96,165,250,0.06)',
          border: '1px solid rgba(96,165,250,0.18)',
          fontSize: 12.5,
          color: 'var(--muted)',
        }}
      >
        Lokal gespeichert. Nichts wird nach außen versendet.
      </div>

      <DataTable
        columns={[
          {
            key: 'createdAt',
            label: 'Datum',
            width: 160,
            render: (f) => (f.createdAt ? TS.format(new Date(f.createdAt)) : '–'),
          },
          {
            key: 'page',
            label: 'Seite',
            width: 180,
            render: (f) =>
              f.page ? (
                <code
                  style={{
                    fontSize: 12,
                    background: 'var(--surface-2)',
                    padding: '2px 6px',
                    borderRadius: 6,
                    color: 'var(--muted)',
                  }}
                >
                  {f.page}
                </code>
              ) : (
                '–'
              ),
          },
          {
            key: 'text',
            label: 'Feedback',
            render: (f) => (
              <span style={{ whiteSpace: 'pre-wrap' }}>{f.text}</span>
            ),
          },
          {
            key: 'actions',
            label: '',
            width: 60,
            render: (f) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Eintrag löschen?')) deleteFeedback(f.id);
                }}
                aria-label="Löschen"
                style={{ color: 'var(--muted)', padding: 4 }}
              >
                <Trash2 size={15} strokeWidth={1.75} />
              </button>
            ),
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
