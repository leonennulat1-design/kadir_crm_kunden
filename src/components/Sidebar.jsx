import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CalendarDays,
  Layers,
  Euro,
  Settings as SettingsIcon,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/kunden', label: 'Kunden', icon: Users },
  { to: '/faelle', label: 'Fälle', icon: FolderOpen },
  { to: '/sessions', label: 'Sessions', icon: CalendarDays },
  { to: '/muster', label: 'Muster', icon: Layers },
  { to: '/umsatz', label: 'Umsatz', icon: Euro },
  { to: '/einstellungen', label: 'Einstellungen', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">K</div>
        <div>
          <div className="sidebar-brand-name">Kadir CRM</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            Kunden-Workspace
          </div>
        </div>
      </div>

      <div className="sidebar-section-label">Menü</div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-item-icon">
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            fontSize: 11.5,
            color: 'var(--muted)',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--orange)', fontFamily: 'var(--font-heading)' }}>
            Datenschutz
          </strong>
          <br />
          Keine Klarnamen, keine Mails, keine Telefonnummern. Nur Kundennummern.
        </div>
      </div>
    </aside>
  );
}
