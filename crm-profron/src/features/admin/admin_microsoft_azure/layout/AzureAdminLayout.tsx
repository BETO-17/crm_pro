import { type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Database,
  Layers,
  DollarSign,
  ShieldCheck,
  Plus,
  ArrowLeft,
  Cloud,
} from 'lucide-react';
import '../../admin_data/layout/AdminLayout.css';
import './AzureAdminLayout.css';
import '../azure_admin.css';

interface AzureAdminLayoutProps {
  topBar?: ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard Cloud', icon: LayoutDashboard },
  { id: 'recursos', label: 'Recursos & VMs', icon: Server },
  { id: 'storage', label: 'Blob Storage & Lake', icon: Database },
  { id: 'pipelines', label: 'Data Factory ETL', icon: Layers },
  { id: 'costos', label: 'Costos & Presupuesto', icon: DollarSign },
  { id: 'seguridad', label: 'Seguridad & IAM', icon: ShieldCheck },
];

export default function AzureAdminLayout({ topBar }: AzureAdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  let activeView = 'dashboard';
  if (path.includes('/admin/azure/recursos')) activeView = 'recursos';
  if (path.includes('/admin/azure/storage')) activeView = 'storage';
  if (path.includes('/admin/azure/pipelines')) activeView = 'pipelines';
  if (path.includes('/admin/azure/costos')) activeView = 'costos';
  if (path.includes('/admin/azure/seguridad')) activeView = 'seguridad';

  return (
    <div className="admin-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar azure-admin-sidebar" aria-label="Sidebar de administración Azure">
        <div className="sidebar-header">
          <div
            className="sidebar-brand"
            onClick={() => navigate('/portal-cursos')}
            style={{ cursor: 'pointer' }}
            title="Volver al portal de especialidades"
          >
            <div className="sidebar-brand-icon azure-admin-brand-icon">
              <Cloud size={18} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Azure Cloud Center</span>
              <span className="sidebar-brand-sub">Admin Console</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación Azure Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => navigate(`/admin/azure/${item.id}`)}
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
            className="azure-admin-new-btn"
            onClick={() => navigate('/admin/azure/recursos')}
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo Despliegue
          </button>

          <button
            className="sidebar-footer-btn"
            style={{ marginTop: 6 }}
            onClick={() => navigate('/portal-cursos')}
          >
            <ArrowLeft size={16} />
            Portal de Cursos
          </button>

          <div className="sidebar-version">V1.2.0 • Azure Admin</div>
        </div>
      </aside>

      {/* ---- Content Area (Topbar flush at the top limit) ---- */}
      <div className="admin-content">
        {topBar && <header className="admin-topbar">{topBar}</header>}
        <main className="admin-main" style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
