import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Contact,
  Briefcase,
  CalendarDays,
  Mail,
  Settings as SettingsIcon,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/contacts', label: 'Kontakte', icon: Contact },
  { to: '/deals', label: 'Deals', icon: Briefcase },
  { to: '/meetings', label: 'Meetings', icon: CalendarDays },
  { to: '/email', label: 'E-Mail', icon: Mail },
  { to: '/settings', label: 'Einstellungen', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">K</div>
        <div>
          <div className="sidebar-brand-name">Kadir CRM</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            Workspace
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
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9b26, #ee4c27)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            K
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 13,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Kadir
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
