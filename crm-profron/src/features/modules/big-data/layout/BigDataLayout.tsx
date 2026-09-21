import { type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Upload,
  Table2,
  GitCompare,
  FolderOpen,
  FileText,
  Plus,
  ArrowLeft,
  Database,
} from 'lucide-react';
import '../../../admin/admin_data/layout/AdminLayout.css';
import './BigDataLayout.css';

interface BigDataLayoutProps {
  topBar?: ReactNode;
}

const navItems = [
  { id: 'perfil', label: 'Mi Perfil', icon: User },
  { id: 'carga', label: 'Carga de Datos', icon: Upload },
  { id: 'observacion', label: 'Observacion de Datos', icon: Table2 },
  { id: 'comparacion', label: 'Comparacion y Analisis', icon: GitCompare },
  { id: 'workspace', label: 'Workspace', icon: FolderOpen },
  { id: 'informes', label: 'Informes', icon: FileText },
];

export default function BigDataLayout({
  topBar,
}: BigDataLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active view from URL path
  const path = location.pathname;
  let activeView = 'perfil';
  if (path.includes('/carga')) activeView = 'carga';
  if (path.includes('/observacion')) activeView = 'observacion';
  if (path.includes('/comparacion')) activeView = 'comparacion';
  if (path.includes('/workspace')) activeView = 'workspace';
  if (path.includes('/informes')) activeView = 'informes';

  const basePath = path.startsWith('/modules/big-data') ? '/modules/big-data' : '/analyst';

  return (
    <div className="admin-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar analyst-sidebar" aria-label="Sidebar de navegación Big Data">
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => navigate('/portal-cursos')} style={{ cursor: 'pointer' }} title="Volver al portal de cursos">
            <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
              <Database size={18} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Big Data Lab</span>
              <span className="sidebar-brand-sub">ERPMetrics 360</span>
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
                onClick={() => navigate(`${basePath}/${item.id}`)}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <Icon className="nav-icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-newload-btn" onClick={() => navigate(`${basePath}/carga`)}>
            <Plus size={16} aria-hidden="true" />
            Nueva Carga
          </button>

          <button
            className="sidebar-footer-btn"
            style={{ marginTop: 6 }}
            onClick={() => navigate('/portal-cursos')}
          >
            <ArrowLeft size={16} />
            Portal de Cursos
          </button>

          <div className="sidebar-version">V1.2.0 • Big Data</div>
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
