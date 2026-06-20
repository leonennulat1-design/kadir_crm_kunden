import { Search, Bell, Plus } from 'lucide-react';

export default function Header({ title, subtitle }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={15}
              strokeWidth={1.75}
              style={{
                position: 'absolute',
                left: 12,
                color: 'var(--muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              className="input"
              placeholder="Suchen..."
              style={{ paddingLeft: 36, width: 240 }}
            />
          </div>

          <button
            className="btn-ghost"
            aria-label="Benachrichtigungen"
            style={{ padding: 9 }}
          >
            <Bell size={16} strokeWidth={1.75} />
          </button>

          <button className="btn-primary">
            <Plus size={16} strokeWidth={2} />
            <span>Neu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
