import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Brain, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal' },
  { to: '/payments', icon: CreditCard, label: 'Control Pagos', section: 'Principal' },
  { to: '/mlops', icon: Brain, label: 'MLOps & IA', section: 'Principal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', section: 'Analytics' },
];

export default function Sidebar({ open, health }) {
  const statusClass = health.status === 'online' ? '' : 'offline';
  const statusText = health.status === 'online'
    ? `API v${health.version} · OK`
    : health.status === 'offline'
      ? 'OFFLINE'
      : 'Verificando...';

  let currentSection = '';

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src="logo.png" alt="Logo" className="logo-icon" />
        <div>
          <div className="logo-text">BitFlow</div>
        </div>
      </div>

      <nav>
        <ul className="nav-links">
          {navItems.map((item) => {
            const showSection = item.section !== currentSection;
            if (showSection) currentSection = item.section;

            return (
              <li key={item.to}>
                {showSection && (
                  <p className="nav-section-title">{item.section}</p>
                )}
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={20} className="nav-icon" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="server-status">
        <div className="server-status-label">Estado del Servidor</div>
        <div className="server-status-indicator">
          <div className={`status-dot ${statusClass}`} />
          <span className="status-text">{statusText}</span>
        </div>
      </div>
    </aside>
  );
}
