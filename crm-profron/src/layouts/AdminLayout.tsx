import { type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import './AdminLayout.css';

interface AdminLayoutProps {
  topBar?: ReactNode;
  sidebarFooter?: ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'tendencias', label: 'Tendencias', icon: TrendingUp },
  { id: 'reportes', label: 'Reportes', icon: FileText },
];

export default function AdminLayout({
  topBar,
  sidebarFooter,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active view from URL path
  const path = location.pathname;
  let activeView = 'dashboard';
  if (path.includes('/usuarios')) activeView = 'usuarios';
  if (path.includes('/tendencias')) activeView = 'tendencias';
  if (path.includes('/reportes')) activeView = 'reportes';
  return (
    <div className="admin-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar" aria-label="Sidebar de navegación">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">RM</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">RetailMetrics 360</span>
              <span className="sidebar-brand-sub">Executive Analytics</span>
            </div>
          </div>
          <div className="sidebar-profile">
            <div className="sidebar-avatar" aria-hidden="true">RA</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Retail Admin</span>
              <span className="sidebar-user-role">Administrator Role</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => navigate(`/admin/${item.id}`)}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <Icon className="nav-icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {sidebarFooter}
          <div className="sidebar-footer-actions">
            <button className="sidebar-footer-btn">
              <Settings className="nav-icon" aria-hidden="true" />
              Settings
            </button>
            <button className="sidebar-footer-btn">
              <HelpCircle className="nav-icon" aria-hidden="true" />
              Support
            </button>
          </div>
          <div className="sidebar-version">V1.2.0</div>
        </div>
      </aside>

      {/* ---- Content Area ---- */}
      <div className="admin-content">
        {topBar && (
          <header className="admin-topbar">
            {topBar}
          </header>
        )}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
