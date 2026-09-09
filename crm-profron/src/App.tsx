import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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

/** Sub-views within the Usuarios tab */
type UsuariosSubView = 'gestion' | 'asignacion' | 'workspaces';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuariosSubView, setUsuariosSubView] = useState<UsuariosSubView>('gestion');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  /* ===== ADMIN TOP BAR ===== */
  const renderAdminTopBar = () => {
    const path = location.pathname;
    
    if (path.includes('/admin/dashboard') || path.includes('/admin/usuarios')) {
      const isUsuarios = path.includes('/admin/usuarios');
      return (
        <>
          <div className="topbar-left">
            <span className="topbar-title">analytics RetailMetrics 360</span>
            {isUsuarios && (
              <div className="topbar-tabs">
                <button
                  className={`topbar-tab ${usuariosSubView === 'gestion' ? 'active' : ''}`}
                  onClick={() => { setUsuariosSubView('gestion'); navigate('/admin/usuarios/gestion'); }}
                >
                  Gestión
                </button>
                <button
                  className={`topbar-tab ${usuariosSubView === 'asignacion' ? 'active' : ''}`}
                  onClick={() => { setUsuariosSubView('asignacion'); navigate('/admin/usuarios/asignacion'); }}
                >
                  Asignación
                </button>
                <button
                  className={`topbar-tab ${usuariosSubView === 'workspaces' ? 'active' : ''}`}
                  onClick={() => { setUsuariosSubView('workspaces'); navigate('/admin/usuarios/workspaces'); }}
                >
                  Workspaces
                </button>
              </div>
            )}
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Notificaciones">
              <Bell size={16} />
            </button>
            <button className="topbar-icon-btn" aria-label="Configuración">
              <Settings size={16} />
            </button>
            <div className="topbar-avatar-small" aria-hidden="true">RA</div>
            <button className="topbar-logout" onClick={handleLogout}>
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </>
      );
    }

    if (path.includes('/admin/tendencias')) {
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
              <button className="topbar-icon-btn" aria-label="Notificaciones">
                <Bell size={16} />
              </button>
              <button className="topbar-icon-btn" aria-label="Configuración">
                <Settings size={16} />
              </button>
              <button className="topbar-icon-btn" aria-label="Perfil">
                <UserCircle size={16} />
              </button>
              <button className="topbar-logout" onClick={handleLogout}>
                <LogOut size={14} />
                Cerrar Sesión
              </button>
            </div>
          </>
        );
    }

    if (path.includes('/admin/reportes')) {
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
              <button className="topbar-icon-btn" aria-label="Notificaciones">
                <Bell size={16} />
              </button>
              <button className="topbar-icon-btn" aria-label="Configuración">
                <Settings size={16} />
              </button>
              <div className="topbar-avatar-small" aria-hidden="true">RA</div>
              <button className="topbar-logout" onClick={handleLogout}>
                <LogOut size={14} />
                Cerrar Sesión
              </button>
            </div>
          </>
        );
    }

    return null;
  };

  /* ===== ANALYST TOP BAR ===== */
  const renderAnalystTopBar = () => {
    return (
      <>
        <div className="topbar-left">
          <span className="topbar-title">analytics  RetailMetrics 360</span>
        </div>
        <div className="topbar-right">
          <div className="topbar-avatar-small" aria-hidden="true">RA</div>
          <button className="topbar-logout" onClick={handleLogout}>
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </>
    );
  };

  /** Render sidebar footer based on view */
  const renderSidebarFooter = () => {
    const path = location.pathname;
    if (path.includes('/admin/tendencias')) {
      return (
        <button className="sidebar-export-btn">
          <FileDown size={16} aria-hidden="true" />
          Export Report
        </button>
      );
    }
    if (path.includes('/admin/reportes')) {
      return (
        <button className="sidebar-generate-btn">
          + Generate Report
        </button>
      );
    }
    return null;
  };

  /* ===== RENDER ===== */
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Rutas para Analista */}
      <Route element={<ProtectedRoute allowedRoles={['analyst', 'admin', 'manager']} />}>
        <Route path="/analyst/*" element={<AnalystLayout topBar={renderAnalystTopBar()} />}>
          <Route path="perfil" element={<PerfilUsuario />} />
          <Route path="carga" element={<CargaDatos />} />
          <Route path="observacion" element={<ObservacionDatos />} />
          <Route path="comparacion" element={<ComparacionAnalisis />} />
          <Route path="workspace" element={<AnalystWorkspaces />} />
          <Route path="informes" element={<Informes />} />
          <Route path="*" element={<Navigate to="perfil" replace />} />
        </Route>
      </Route>

      {/* Rutas para Administrador */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/*" element={<AdminLayout topBar={renderAdminTopBar()} sidebarFooter={renderSidebarFooter()} />}>
          <Route path="dashboard" element={
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
          } />
          
          <Route path="usuarios">
            <Route path="gestion" element={<GestionUsuarios />} />
            <Route path="asignacion" element={<AsignacionModulos />} />
            <Route path="workspaces" element={<Workspaces />} />
            <Route index element={<Navigate to="gestion" replace />} />
          </Route>
          
          <Route path="tendencias" element={<Tendencias />} />
          <Route path="reportes" element={<CentroReportes />} />
          <Route path="*" element={<Navigate to="usuarios/gestion" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
