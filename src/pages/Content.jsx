import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { formatDate } from '../lib/format.js';
import EmptyState from '../components/EmptyState.jsx';

const STATUS_OPTIONS = ['Idee', 'In Arbeit', 'Veröffentlicht'];

const STATUS_STYLES = {
  Idee: 'pill-neutral',
  'In Arbeit': 'pill-warning',
  Veröffentlicht: 'pill-success',
};

export default function Content() {
  const { state, updateSession } = useStore();

  const items = useMemo(() => {
    const caseByNum = Object.fromEntries(state.cases.map((c) => [c.id, c.number]));
    return state.sessions
      .filter((s) => (s.contentIdea ?? '').trim().length > 0)
      .map((s) => ({
        id: s.id,
        idea: s.contentIdea,
        caseNumber: caseByNum[s.caseId] ?? '–',
        date: s.date,
        angle: s.contentAngle ?? '',
        status: s.contentStatus || 'Idee',
      }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [state.sessions, state.cases]);

  if (!items.length) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Noch keine Content-Ideen"
        description={'Sobald du in einer Session etwas in das Feld „Content-Idee" einträgst, erscheint es hier zur Weiterverarbeitung.'}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: 'rgba(255,155,38,0.06)',
          border: '1px solid rgba(255,155,38,0.18)',
          fontSize: 12.5,
          color: 'var(--muted)',
        }}
      >
        Alle Content-Ideen aus deinen Sessions an einem Ort. Winkel/Hook und Status bleiben hier
        editierbar, die Idee selbst kommt aus der Session und wird dort gepflegt.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div key={item.id} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11.5,
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  <span>Fall {item.caseNumber}</span>
                  <span>·</span>
                  <span>{formatDate(item.date)}</span>
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {item.idea}
                </div>
              </div>
              <span className={`pill ${STATUS_STYLES[item.status]}`}>{item.status}</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 200px',
                gap: 12,
                marginTop: 8,
              }}
            >
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: 11.5,
                    color: 'var(--muted)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Winkel / Hook
                </span>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Welcher Aufhänger? Welche Perspektive?"
                  value={item.angle}
                  onChange={(e) => updateSession(item.id, { contentAngle: e.target.value })}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: 11.5,
                    color: 'var(--muted)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Status
                </span>
                <select
                  className="input"
                  value={item.status}
                  onChange={(e) => updateSession(item.id, { contentStatus: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
