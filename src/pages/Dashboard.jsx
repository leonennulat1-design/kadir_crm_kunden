import {
  Users,
  Briefcase,
  DollarSign,
  CalendarDays,
  TrendingUp,
  Activity,
} from 'lucide-react';

const STATS = [
  {
    label: 'Total Leads',
    value: '0',
    delta: '+0%',
    icon: Users,
    accent: 'rgba(255, 155, 38, 0.18)',
    iconColor: '#ff9b26',
  },
  {
    label: 'Active Deals',
    value: '0',
    delta: '+0%',
    icon: Briefcase,
    accent: 'rgba(74, 222, 128, 0.16)',
    iconColor: '#4ade80',
  },
  {
    label: 'Umsatz',
    value: '€0',
    delta: '+0%',
    icon: DollarSign,
    accent: 'rgba(96, 165, 250, 0.16)',
    iconColor: '#60a5fa',
  },
  {
    label: 'Meetings diese Woche',
    value: '0',
    delta: '+0',
    icon: CalendarDays,
    accent: 'rgba(238, 76, 39, 0.18)',
    iconColor: '#ee4c27',
  },
];

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <section
        className="fade-up"
        style={{ animationDelay: '0ms' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card fade-up"
                style={{ animationDelay: `${80 + i * 80}ms` }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: stat.accent,
                      display: 'grid',
                      placeItems: 'center',
                      color: stat.iconColor,
                    }}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <span className="pill pill-neutral">
                    <TrendingUp size={11} strokeWidth={2} />
                    {stat.delta}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--muted)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 28,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className="fade-up"
        style={{ animationDelay: '420ms' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            Recent Activity
          </h2>
          <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 12.5 }}>
            Alle ansehen
          </button>
        </div>

        <div
          className="card"
          style={{
            padding: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background:
                'linear-gradient(135deg, rgba(255,155,38,0.15), rgba(238,76,39,0.1))',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--orange)',
              border: '1px solid rgba(255, 155, 38, 0.25)',
            }}
          >
            <Activity size={22} strokeWidth={1.75} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              Noch keine Aktivität
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13.5, maxWidth: 360 }}>
              Sobald du Leads anlegst oder Deals bewegst, erscheinen die Ereignisse hier.
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: 6 }}>
            Ersten Lead anlegen
          </button>
        </div>
      </section>
    </div>
  );
}
