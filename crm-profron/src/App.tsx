import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './core/components/ProtectedRoute';
import ModuleGuard from './core/components/ModuleGuard';
import NotificationBell from './core/components/NotificationBell';
import LogoutConfirmModal from './core/components/LogoutConfirmModal';
import {
  Settings,
  UserCircle,
  Search,
  Calendar,
  Download,
  FileDown,
  LogOut,
} from 'lucide-react';

// Landing & Portal
import LandingPage from './features/landing/LandingPage';
import PortalCursosPage from './features/portal-cursos/PortalCursosPage';

// Admin Module
import AdminLayout from './features/admin/admin_data/layout/AdminLayout';
import GestionUsuarios from './features/admin/admin_data/pages/GestionUsuarios';
import AsignacionModulos from './features/admin/admin_data/pages/AsignacionModulos';
import Tendencias from './features/admin/admin_data/pages/Tendencias';
import CentroReportes from './features/admin/admin_data/pages/CentroReportes';
import Workspaces from './features/admin/admin_data/pages/Workspaces';

// Big Data Module
import BigDataLayout from './features/modules/big-data/layout/BigDataLayout';
import PerfilUsuario from './features/modules/big-data/pages/PerfilUsuario';
import CargaDatos from './features/modules/big-data/pages/CargaDatos';
import ObservacionDatos from './features/modules/big-data/pages/ObservacionDatos';
import ComparacionAnalisis from './features/modules/big-data/pages/ComparacionAnalisis';
import AnalystWorkspaces from './features/modules/big-data/pages/AnalystWorkspaces';
import Informes from './features/modules/big-data/pages/Informes';

// Módulo de Visión Artificial & Emociones (AWS Rekognition)
import AzureLayout from './features/modules/microsoft-azure/layout/AzureLayout';
import VisualizadorEmociones from './features/modules/microsoft-azure/pages/VisualizadorEmociones';

// Azure Admin Module
import AzureAdminLayout from './features/admin/admin_microsoft_azure/layout/AzureAdminLayout';
import AzureAdminDashboard from './features/admin/admin_microsoft_azure/pages/AzureAdminDashboard';
import AzureRecursosAdmin from './features/admin/admin_microsoft_azure/pages/AzureRecursosAdmin';
import AzureStorageAdmin from './features/admin/admin_microsoft_azure/pages/AzureStorageAdmin';
import AzurePipelinesAdmin from './features/admin/admin_microsoft_azure/pages/AzurePipelinesAdmin';
import AzureCostosAdmin from './features/admin/admin_microsoft_azure/pages/AzureCostosAdmin';
import AzureSeguridadAdmin from './features/admin/admin_microsoft_azure/pages/AzureSeguridadAdmin';

// Stylesheets
import './features/admin/admin_data/admin.css';
import './features/admin/admin_microsoft_azure/azure_admin.css';
import './features/modules/big-data/bigdata.css';

/** Sub-views within the Usuarios tab */
type UsuariosSubView = 'gestion' | 'asignacion' | 'workspaces';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuariosSubView, setUsuariosSubView] = useState<UsuariosSubView>('gestion');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
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
            <span className="topbar-title">analytics ERPMetrics 360</span>
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
            <NotificationBell module="admin" />
            <button className="topbar-icon-btn" aria-label="Configuración">
              <Settings size={16} />
            </button>
            <div className="topbar-avatar-small" aria-hidden="true">RA</div>
            <button className="topbar-logout" onClick={handleLogoutClick}>
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
            <span className="topbar-title">ERPMetrics 360</span>
            <div className="topbar-tabs">
              <button className="topbar-tab active">Overview</button>
              <button className="topbar-tab">Regional</button>
              <button className="topbar-tab">Stores</button>
            </div>
          </div>
          <div className="topbar-right">
            <NotificationBell module="admin" />
            <button className="topbar-icon-btn" aria-label="Configuración">
              <Settings size={16} />
            </button>
            <button className="topbar-icon-btn" aria-label="Perfil">
              <UserCircle size={16} />
            </button>
            <button className="topbar-logout" onClick={handleLogoutClick}>
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
            <NotificationBell module="admin" />
            <button className="topbar-icon-btn" aria-label="Configuración">
              <Settings size={16} />
            </button>
            <div className="topbar-avatar-small" aria-hidden="true">RA</div>
            <button className="topbar-logout" onClick={handleLogoutClick}>
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </>
      );
    }

    return null;
  };

  /* ===== BIG DATA TOP BAR ===== */
  const renderBigDataTopBar = () => {
    return (
      <>
        <div className="topbar-left">
          <span className="topbar-title">Big Data Analytics Suite</span>
        </div>
        <div className="topbar-right">
          <button
            className="topbar-logout"
            onClick={() => navigate('/portal-cursos')}
            style={{ marginRight: 6 }}
          >
            ← Volver al Portal
          </button>
          <NotificationBell module="big-data" />
          <div className="topbar-avatar-small" aria-hidden="true">CR</div>
          <button className="topbar-logout" onClick={handleLogoutClick}>
            <LogOut size={14} />
            Salir
          </button>
        </div>
      </>
    );
  };

  /* ===== AZURE TOP BAR ===== */
  const renderAzureTopBar = () => {
    return (
      <>
        <div className="topbar-left">
          <span className="topbar-title">AWS Rekognition — Visualizador de Emociones</span>
        </div>
        <div className="topbar-right">
          <button
            className="topbar-logout"
            onClick={() => navigate('/portal-cursos')}
            style={{ marginRight: 6 }}
          >
            ← Volver al Portal
          </button>
          <NotificationBell module="azure" />
          <div className="topbar-avatar-small" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #10b981, #0078d4)' }}>AI</div>
          <button className="topbar-logout" onClick={handleLogoutClick}>
            <LogOut size={14} />
            Salir
          </button>
        </div>
      </>
    );
  };

  /* ===== AZURE ADMIN TOP BAR ===== */
  const renderAzureAdminTopBar = () => {
    return (
      <>
        <div className="topbar-left">
          <span className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0078d4' }} />
            Azure Cloud Management Console
          </span>
        </div>
        <div className="topbar-right">
          <button
            className="topbar-logout"
            onClick={() => navigate('/portal-cursos')}
            style={{ marginRight: 6 }}
          >
            ← Volver al Portal
          </button>
          <NotificationBell module="azure" />
          <button className="topbar-icon-btn" aria-label="Configuración">
            <Settings size={16} />
          </button>
          <div className="topbar-avatar-small" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #0078d4, #002050)' }}>AZ</div>
          <button className="topbar-logout" onClick={handleLogoutClick}>
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
    <>
      <Routes>
        {/* 1. Landing Page Pública */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Portal de Selección de Cursos (Gift Cards) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/portal-cursos" element={<PortalCursosPage />} />
        <Route path="/cursos" element={<Navigate to="/portal-cursos" replace />} />
      </Route>

      {/* 3. Módulo Dedicado: BIG DATA (Analyst / Especialidad) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/modules/big-data/*"
          element={
            <ModuleGuard moduleKey="bigData">
              <BigDataLayout topBar={renderBigDataTopBar()} />
            </ModuleGuard>
          }
        >
          <Route path="perfil" element={<PerfilUsuario />} />
          <Route path="carga" element={<CargaDatos />} />
          <Route path="observacion" element={<ObservacionDatos />} />
          <Route path="comparacion" element={<ComparacionAnalisis />} />
          <Route path="workspace" element={<AnalystWorkspaces />} />
          <Route path="informes" element={<Informes />} />
          <Route path="*" element={<Navigate to="perfil" replace />} />
        </Route>
      </Route>

      {/* Compatibilidad para rutas previas /analyst */}
      <Route element={<ProtectedRoute />}>
        <Route path="/analyst/*" element={<BigDataLayout topBar={renderBigDataTopBar()} />}>
          <Route path="perfil" element={<PerfilUsuario />} />
          <Route path="carga" element={<CargaDatos />} />
          <Route path="observacion" element={<ObservacionDatos />} />
          <Route path="comparacion" element={<ComparacionAnalisis />} />
          <Route path="workspace" element={<AnalystWorkspaces />} />
          <Route path="informes" element={<Informes />} />
          <Route path="*" element={<Navigate to="perfil" replace />} />
        </Route>
      </Route>

      {/* 4. Módulo Dedicado: VISUALIZADOR DE EMOCIONES (AWS REKOGNITION) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/modules/azure/*"
          element={
            <ModuleGuard moduleKey="microsoftAzure">
              <AzureLayout topBar={renderAzureTopBar()} />
            </ModuleGuard>
          }
        >
          <Route path="emociones" element={<VisualizadorEmociones />} />
          <Route path="*" element={<Navigate to="emociones" replace />} />
        </Route>
      </Route>

      {/* 5. Panel de Administrador: BIG DATA & GESTIÓN */}
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

      {/* 6. Panel de Administrador Dedicado: MICROSOFT AZURE */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route
          path="/admin/azure/*"
          element={<AzureAdminLayout topBar={renderAzureAdminTopBar()} />}
        >
          <Route path="dashboard" element={<AzureAdminDashboard />} />
          <Route path="recursos" element={<AzureRecursosAdmin />} />
          <Route path="storage" element={<AzureStorageAdmin />} />
          <Route path="pipelines" element={<AzurePipelinesAdmin />} />
          <Route path="costos" element={<AzureCostosAdmin />} />
          <Route path="seguridad" element={<AzureSeguridadAdmin />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* Fallback general */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* Modal de confirmación de cierre de sesión */}
    <LogoutConfirmModal
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleConfirmLogout}
    />
  </>
  );
}

export default App;
