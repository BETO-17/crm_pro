import { type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Database,
  Zap,
  DollarSign,
  ShieldCheck,
  Plus,
  ArrowLeft,
  Cpu,
} from 'lucide-react';
import '../../admin_data/layout/AdminLayout.css';
import './AwsAdminLayout.css';
import '../aws_admin.css';

interface AwsAdminLayoutProps {
  topBar?: ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard Cloud AWS', icon: LayoutDashboard },
  { id: 'recursos', label: 'EC2 & Clústeres', icon: Server },
  { id: 'storage', label: 'S3 & Data Lakehouse', icon: Database },
  { id: 'serverless', label: 'Lambda & Microservicios', icon: Zap },
  { id: 'costos', label: 'Costos & Presupuesto', icon: DollarSign },
  { id: 'seguridad', label: 'Seguridad, IAM & VPC', icon: ShieldCheck },
];

export default function AwsAdminLayout({ topBar }: AwsAdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  let activeView = 'dashboard';
  if (path.includes('/admin/aws/recursos')) activeView = 'recursos';
  if (path.includes('/admin/aws/storage')) activeView = 'storage';
  if (path.includes('/admin/aws/serverless')) activeView = 'serverless';
  if (path.includes('/admin/aws/costos')) activeView = 'costos';
  if (path.includes('/admin/aws/seguridad')) activeView = 'seguridad';

  return (
    <div className="admin-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar aws-admin-sidebar" aria-label="Sidebar de administración AWS">
        <div className="sidebar-header">
          <div
            className="sidebar-brand"
            onClick={() => navigate('/portal-cursos')}
            style={{ cursor: 'pointer' }}
            title="Volver al portal de especialidades"
          >
            <div className="sidebar-brand-icon aws-admin-brand-icon">
              <Cpu size={18} color="#ffffff" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">AWS Management</span>
              <span className="sidebar-brand-sub">Admin Console</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación AWS Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => navigate(`/admin/aws/${item.id}`)}
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
            className="aws-admin-new-btn"
            onClick={() => navigate('/admin/aws/recursos')}
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo Despliegue AWS
          </button>

          <button
            className="sidebar-footer-btn"
            style={{ marginTop: 6 }}
            onClick={() => navigate('/portal-cursos')}
          >
            <ArrowLeft size={16} />
            Portal de Cursos
          </button>

          <div className="sidebar-version">V1.2.0 • AWS Admin Console</div>
        </div>
      </aside>

      {/* ---- Content Area (Topbar directly flush at the top limit) ---- */}
      <div className="admin-content">
        {topBar && <header className="admin-topbar">{topBar}</header>}
        <main className="admin-main" style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
