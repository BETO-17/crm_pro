import { type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Globe,
  ShieldCheck,
  Layers,
  Cpu,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import '../../../admin/admin_data/layout/AdminLayout.css';
import './AwsLayout.css';

interface AwsLayoutProps {
  topBar?: ReactNode;
}

const navItems = [
  { id: 'dashboard', label: '1. Dashboard Cloud', icon: LayoutDashboard },
  { id: 'planning', label: '2. Planificación Cloud', icon: FileText },
  { id: 'costs', label: '3. Costos & Economía', icon: DollarSign },
  { id: 'infrastructure', label: '4. Infraestructura Global', icon: Globe },
  { id: 'security', label: '5. Seguridad & IAM', icon: ShieldCheck },
  { id: 'network', label: '6. Arquitectura de Red', icon: Layers },
  { id: 'services', label: '7. Catálogo de Servicios', icon: Cpu },
];

import AwsCloudShell from '../components/AwsCloudShell';

export default function AwsLayout({ topBar }: AwsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  let activeView = 'dashboard';
  if (path.includes('/planning')) activeView = 'planning';
  if (path.includes('/costs')) activeView = 'costs';
  if (path.includes('/infrastructure')) activeView = 'infrastructure';
  if (path.includes('/security')) activeView = 'security';
  if (path.includes('/network')) activeView = 'network';
  if (path.includes('/services')) activeView = 'services';

  return (
    <div className="admin-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar aws-sidebar" aria-label="Sidebar de navegación AWS">
        <div className="sidebar-header" style={{ padding: '20px 16px' }}>
          <div className="sidebar-profile" style={{ margin: 0 }}>
            <div
              className="sidebar-avatar"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #b45309)' }}
              aria-hidden="true"
            >
              AW
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">AWS Cloud Analyst</span>
              <span className="sidebar-user-role">Cloud Practitioner</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal AWS">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => navigate(`/modules/aws/${item.id}`)}
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
          </div>
          <div className="sidebar-version">V1.0.0 • AWS Cloud Suite</div>
        </div>
      </aside>

      {/* ---- Content Area (Topbar directly at the top limit) ---- */}
      <div className="admin-content">
        {topBar && <header className="admin-topbar">{topBar}</header>}
        <main className="admin-main" style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* ---- Interactive AWS CloudShell Terminal Drawer ---- */}
      <AwsCloudShell />
    </div>
  );
}
