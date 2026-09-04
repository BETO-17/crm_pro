import { useState } from 'react';
import {
  Bell,
  Settings,
  UserCircle,
  Search,
  Calendar,
  Download,
  FileDown,
  LogOut,
} from 'lucide-react';
import LandingPage from './features/landing/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import AnalystLayout from './layouts/AnalystLayout';
import GestionUsuarios from './features/admin/pages/GestionUsuarios';
import AsignacionModulos from './features/admin/pages/AsignacionModulos';
import Tendencias from './features/admin/pages/Tendencias';
import CentroReportes from './features/admin/pages/CentroReportes';
import Workspaces from './features/admin/pages/Workspaces';
import PerfilUsuario from './features/analyst/pages/PerfilUsuario';
import CargaDatos from './features/analyst/pages/CargaDatos';
import ObservacionDatos from './features/analyst/pages/ObservacionDatos';
import ComparacionAnalisis from './features/analyst/pages/ComparacionAnalisis';
import AnalystWorkspaces from './features/analyst/pages/AnalystWorkspaces';
import Informes from './features/analyst/pages/Informes';
import './features/admin/admin.css';
import './features/analyst/analyst.css';

type AppRole = 'landing' | 'admin' | 'analyst';
type AdminView = 'dashboard' | 'usuarios' | 'tendencias' | 'reportes';
type AnalystView = 'perfil' | 'carga' | 'observacion' | 'comparacion' | 'workspace' | 'informes';

/** Sub-views within the Usuarios tab */
type UsuariosSubView = 'gestion' | 'asignacion' | 'workspaces';

function App() {
  const [role, setRole] = useState<AppRole>('landing');
  const [activeView, setActiveView] = useState<AdminView>('usuarios');
  const [analystView, setAnalystView] = useState<AnalystView>('perfil');
  const [usuariosSubView, setUsuariosSubView] = useState<UsuariosSubView>('gestion');

  const handleNavigate = (view: string) => {
    setActiveView(view as AdminView);
    if (view === 'usuarios') {
      setUsuariosSubView('gestion');
    }
  };

  const handleAnalystNavigate = (view: string) => {
    setAnalystView(view as AnalystView);
  };

  /* ===== ADMIN TOP BAR ===== */
  const renderAdminTopBar = () => {
    switch (activeView) {
      case 'dashboard':
      case 'usuarios':
        return (
          <>
            <div className="topbar-left">
              <span className="topbar-title">analytics RetailMetrics 360</span>
              {activeView === 'usuarios' && (
                <div className="topbar-tabs">
                  <button
                    className={`topbar-tab ${usuariosSubView === 'gestion' ? 'active' : ''}`}
                    onClick={() => setUsuariosSubView('gestion')}
                  >
                    Gestión
                  </button>
                  <button
                    className={`topbar-tab ${usuariosSubView === 'asignacion' ? 'active' : ''}`}
                    onClick={() => setUsuariosSubView('asignacion')}
                  >
                    Asignación
                  </button>
                  <button
                    className={`topbar-tab ${usuariosSubView === 'workspaces' ? 'active' : ''}`}
                    onClick={() => setUsuariosSubView('workspaces')}
                  >
                    Workspaces
                  </button>
                </div>
              )}
            </div>
            <div className="topbar-right">
              <div className="role-switcher">
                <button
                  className={`role-switcher-btn ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
                <button
                  className={`role-switcher-btn ${role === 'analyst' ? 'active' : ''}`}
                  onClick={() => setRole('analyst')}
                >
                  Analista
                </button>
              </div>
              <button className="topbar-icon-btn" aria-label="Notificaciones">
                <Bell size={16} />
              </button>
              <button className="topbar-icon-btn" aria-label="Configuración">
                <Settings size={16} />
              </button>
              <div className="topbar-avatar-small" aria-hidden="true">RA</div>
            </div>
          </>
        );

      case 'tendencias':
        return (
          <>
            <div className="topbar-left">
              <span className="topbar-title">RetailMetrics 360</span>
              <div className="topbar-tabs">
                <button className="topbar-tab active">Overview</button>
                <button className="topbar-tab">Regional</button>
                <button className="topbar-tab">Stores</button>
              </div>
            </div>
            <div className="topbar-right">
              <div className="role-switcher">
                <button
                  className={`role-switcher-btn ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
                <button
                  className={`role-switcher-btn ${role === 'analyst' ? 'active' : ''}`}
                  onClick={() => setRole('analyst')}
                >
                  Analista
                </button>
              </div>
              <button className="topbar-icon-btn" aria-label="Notificaciones">
                <Bell size={16} />
              </button>
              <button className="topbar-icon-btn" aria-label="Configuración">
                <Settings size={16} />
              </button>
              <button className="topbar-icon-btn" aria-label="Perfil">
                <UserCircle size={16} />
              </button>
            </div>
          </>
        );

      case 'reportes':
        return (
          <>
            <div className="topbar-left">
              <div className="topbar-search">
                <Search size={14} aria-hidden="true" />
                <input type="text" placeholder="Search reports..." aria-label="Buscar reportes" />
              </div>
            </div>
            <div className="topbar-right">
              <div className="topbar-date-range">
                <Calendar size={14} aria-hidden="true" />
                2023 - 2024
              </div>
              <button className="topbar-export-all">
                <Download size={14} aria-hidden="true" />
                Exportar Todo
              </button>
              <div className="role-switcher">
                <button
                  className={`role-switcher-btn ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
                <button
                  className={`role-switcher-btn ${role === 'analyst' ? 'active' : ''}`}
                  onClick={() => setRole('analyst')}
                >
                  Analista
                </button>
              </div>
              <button className="topbar-icon-btn" aria-label="Notificaciones">
                <Bell size={16} />
              </button>
              <button className="topbar-icon-btn" aria-label="Configuración">
                <Settings size={16} />
              </button>
              <div className="topbar-avatar-small" aria-hidden="true">RA</div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  /* ===== ANALYST TOP BAR ===== */
  const renderAnalystTopBar = () => {
    return (
      <>
        <div className="topbar-left">
          <span className="topbar-title">analytics  RetailMetrics 360</span>
        </div>
        <div className="topbar-right">
          <div className="role-switcher">
            <button
              className={`role-switcher-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
            <button
              className={`role-switcher-btn ${role === 'analyst' ? 'active' : ''}`}
              onClick={() => setRole('analyst')}
            >
              Analista
            </button>
          </div>
          <div className="topbar-avatar-small" aria-hidden="true">RA</div>
          <button className="topbar-logout" onClick={() => setRole('admin')}>
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </>
    );
  };

  /** Render sidebar footer based on view */
  const renderSidebarFooter = () => {
    switch (activeView) {
      case 'tendencias':
        return (
          <button className="sidebar-export-btn">
            <FileDown size={16} aria-hidden="true" />
            Export Report
          </button>
        );
      case 'reportes':
        return (
          <button className="sidebar-generate-btn">
            + Generate Report
          </button>
        );
      default:
        return null;
    }
  };

  /** Render admin content */
  const renderAdminContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Vista general del panel de administración.</p>
            <div className="admin-panels">
              <div className="admin-card" style={{ gridColumn: '1 / -1', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                  Panel de control principal — Selecciona una sección del menú lateral.
                </p>
              </div>
            </div>
          </>
        );
      case 'usuarios':
        switch (usuariosSubView) {
          case 'gestion':
            return <GestionUsuarios />;
          case 'asignacion':
            return <AsignacionModulos />;
          case 'workspaces':
            return <Workspaces />;
          default:
            return <GestionUsuarios />;
        }
      case 'tendencias':
        return <Tendencias />;
      case 'reportes':
        return <CentroReportes />;
      default:
        return <GestionUsuarios />;
    }
  };

  /** Render analyst content */
  const renderAnalystContent = () => {
    switch (analystView) {
      case 'perfil':
        return <PerfilUsuario />;
      case 'carga':
        return <CargaDatos />;
      case 'observacion':
        return <ObservacionDatos />;
      case 'comparacion':
        return <ComparacionAnalisis />;
      case 'workspace':
        return <AnalystWorkspaces />;
      case 'informes':
        return <Informes />;
      default:
        return <PerfilUsuario />;
    }
  };

  /* ===== RENDER ===== */
  if (role === 'landing') {
    return <LandingPage onLogin={() => setRole('admin')} />;
  }

  if (role === 'analyst') {
    return (
      <AnalystLayout
        activeView={analystView}
        onNavigate={handleAnalystNavigate}
        topBar={renderAnalystTopBar()}
      >
        {renderAnalystContent()}
      </AnalystLayout>
    );
  }

  return (
    <AdminLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      topBar={renderAdminTopBar()}
      sidebarFooter={renderSidebarFooter()}
    >
      {renderAdminContent()}
    </AdminLayout>
  );
}

export default App;
