import { type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Cloud,
  Server,
  Database,
  Layers,
  Settings,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import '../../../admin/admin_data/layout/AdminLayout.css';
import './AzureLayout.css';

interface AzureLayoutProps {
  topBar?: ReactNode;
}

const navItems = [
  { id: 'overview', label: 'Azure Overview', icon: Cloud },
  { id: 'recursos', label: 'Recursos Cloud', icon: Server },
  { id: 'storage', label: 'Blob Storage', icon: Database },
  { id: 'pipelines', label: 'Data Factory', icon: Layers },
];

export default function AzureLayout({
  topBar,
}: AzureLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  let activeView = 'overview';
  if (path.includes('/recursos')) activeView = 'recursos';
  if (path.includes('/storage')) activeView = 'storage';
  if (path.includes('/pipelines')) activeView = 'pipelines';

  return (
    <div className="admin-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar azure-sidebar" aria-label="Sidebar de navegación Azure">
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => navigate('/portal-cursos')} style={{ cursor: 'pointer' }} title="Volver al portal de cursos">
            <div className="sidebar-brand-icon azure-brand-icon">
              <Cloud size={18} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Microsoft Azure</span>
              <span className="sidebar-brand-sub">Cloud Computing</span>
            </div>
          </div>
          <div className="sidebar-profile">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #0078d4, #00bcf2)' }} aria-hidden="true">AZ</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Azure Lab User</span>
              <span className="sidebar-user-role">Cloud Architect</span>
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
                onClick={() => navigate(`/modules/azure/${item.id}`)}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <Icon className="nav-icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-footer-btn"
            style={{ marginTop: 6 }}
            onClick={() => navigate('/portal-cursos')}
          >
            <ArrowLeft size={16} />
            Portal de Cursos
          </button>

          <div className="sidebar-footer-actions">
            <button className="sidebar-footer-btn">
              <Settings className="nav-icon" aria-hidden="true" />
              Configuración
            </button>
            <button className="sidebar-footer-btn">
              <HelpCircle className="nav-icon" aria-hidden="true" />
              Soporte
            </button>
          </div>
          <div className="sidebar-version">V1.0.0 • Microsoft Azure</div>
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
