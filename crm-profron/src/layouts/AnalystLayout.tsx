import { type ReactNode } from 'react';
import {
  User,
  Upload,
  Table2,
  GitCompare,
  FolderOpen,
  FileText,
  Settings,
  HelpCircle,
  Plus,
} from 'lucide-react';
import './AdminLayout.css';
import './AnalystLayout.css';

interface AnalystLayoutProps {
  children: ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
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

export default function AnalystLayout({
  children,
  activeView,
  onNavigate,
  topBar,
}: AnalystLayoutProps) {
  return (
    <div className="admin-layout">
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar analyst-sidebar" aria-label="Sidebar de navegación">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">RM</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">RetailMetrics 360</span>
              <span className="sidebar-brand-sub">Executive Analytics</span>
            </div>
          </div>
          <div className="sidebar-profile">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #4f8cff, #6366f1)' }} aria-hidden="true">CR</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Carlos Ruiz</span>
              <span className="sidebar-user-role">Usuario Analista</span>
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
                onClick={() => onNavigate(item.id)}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <Icon className="nav-icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-newload-btn" onClick={() => onNavigate('carga')}>
            <Plus size={16} aria-hidden="true" />
            New Load
          </button>
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
          {children}
        </main>
      </div>
    </div>
  );
}
