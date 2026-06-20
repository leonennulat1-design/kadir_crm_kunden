import { useMemo } from 'react';
import { Users, FolderOpen, CalendarDays, Layers, Euro, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, usePatternUsage } from '../store/StoreProvider.jsx';
import { REVENUE_STAGES, formatEur, stageLabel } from '../lib/format.js';

const CASE_TARGET = 30;

export default function Dashboard() {
  const { state } = useStore();
  const usage = usePatternUsage();

  const totals = useMemo(() => {
    const byStage = {};
    let total = 0;
    for (const s of REVENUE_STAGES) byStage[s.value] = 0;
    for (const r of state.revenue) {
      const v = Number(r.amount) || 0;
      total += v;
      if (byStage[r.stage] != null) byStage[r.stage] += v;
    }
    return { total, byStage };
  }, [state.revenue]);

  const topPatterns = useMemo(() => {
    return [...state.patterns]
      .map((p) => ({ ...p, count: usage.get(p.id) ?? 0 }))
      .filter((p) => p.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [state.patterns, usage]);

  const progress = Math.min(state.cases.length / CASE_TARGET, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section className="card fade-up" style={{ animationDelay: '0ms' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Target size={13} strokeWidth={2} /> Fortschritt zur Methode
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 22,
                fontWeight: 700,
                marginTop: 4,
                letterSpacing: '-0.01em',
              }}
            >
              {state.cases.length} von {CASE_TARGET} Fällen dokumentiert
            </div>
          </div>
          <Link to="/faelle" className="btn-ghost" style={{ fontSize: 12.5 }}>
            Fälle ansehen
          </Link>
        </div>
        <div
          style={{
            height: 12,
            borderRadius: 999,
            background: 'var(--surface-2)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff9b26, #ee4c27)',
              transition: 'width 400ms ease',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 12.5,
            color: 'var(--muted)',
          }}
        >
          Aus diesen Fällen werden die wiederkehrenden Muster sichtbar.
        </div>
      </section>

      <section
        className="fade-up"
        style={{
          animationDelay: '80ms',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        <Stat
          icon={Users}
          label="Kunden"
          value={state.customers.length}
          iconColor="#ff9b26"
          accent="rgba(255,155,38,0.18)"
        />
        <Stat
          icon={FolderOpen}
          label="Fälle"
          value={state.cases.length}
          iconColor="#ee4c27"
          accent="rgba(238,76,39,0.18)"
        />
        <Stat
          icon={CalendarDays}
          label="Sessions"
          value={state.sessions.length}
          iconColor="#60a5fa"
          accent="rgba(96,165,250,0.16)"
        />
        <Stat
          icon={Layers}
          label="Muster"
          value={state.patterns.length}
          iconColor="#4ade80"
          accent="rgba(74,222,128,0.16)"
        />
      </section>

      <section
        className="fade-up"
        style={{
          animationDelay: '160ms',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Layers size={16} strokeWidth={1.75} color="var(--orange)" />
              Häufigste Muster
            </h2>
            <Link to="/muster" style={{ fontSize: 12, color: 'var(--muted)' }}>
              Alle Muster →
            </Link>
          </div>
          {topPatterns.length === 0 ? (
            <div
              style={{
                padding: 24,
                color: 'var(--muted)',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              Noch keine Muster mit Fall-Verknüpfung. Verknüpfe Fälle mit Mustern, dann erscheint
              hier das, was sich häuft.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topPatterns.map((p) => {
                const pct = topPatterns[0].count
                  ? (p.count / topPatterns[0].count) * 100
                  : 0;
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 600,
                          fontSize: 13.5,
                        }}
                      >
                        {p.name}
                      </div>
                      <span
                        className={`pill ${
                          p.status === 'Bestätigt' ? 'pill-success' : 'pill-warning'
                        }`}
                      >
                        {p.count}× · {p.status}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ff9b26, #ee4c27)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Euro size={16} strokeWidth={1.75} color="var(--orange)" />
              Umsatz
            </h2>
            <Link to="/umsatz" style={{ fontSize: 12, color: 'var(--muted)' }}>
              Details →
            </Link>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: '-0.02em',
              marginBottom: 14,
            }}
          >
            {formatEur(totals.total)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REVENUE_STAGES.map((s) => (
              <div
                key={s.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{stageLabel(s.value)}</span>
                <strong style={{ fontFamily: 'var(--font-heading)' }}>
                  {formatEur(totals.byStage[s.value] ?? 0)}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, iconColor, accent }) {
  return (
    <div className="card">
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: accent,
          color: iconColor,
          display: 'grid',
          placeItems: 'center',
          marginBottom: 14,
        }}
      >
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
    </div>
  );
}
