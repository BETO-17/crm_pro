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
    <div className="admin-layout aws-theme-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar aws-admin-sidebar" aria-label="Sidebar de administración AWS">
        {/* CloudOps Brand matching Image 2 */}
        <div className="sidebar-header cloudops-sidebar-header">
          <div
            className="cloudops-brand"
            onClick={() => navigate('/portal-cursos')}
            style={{ cursor: 'pointer' }}
            title="CloudOps — Cloud Management Console"
          >
            <div className="cloudops-icon-container">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cloudops-icon"
              >
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>
            <div className="cloudops-text-group">
              <div className="cloudops-title">
                CloudOps<span className="cloudops-dot">.</span>
              </div>
              <div className="cloudops-subtitle">CLOUD MANAGEMENT</div>
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
