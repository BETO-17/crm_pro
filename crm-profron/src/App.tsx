import { useState } from 'react';
import {
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import LandingPage from './features/landing/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import AnalystLayout from './layouts/AnalystLayout';
import Dashboard from './features/admin/pages/Dashboard';
import GestionUsuarios from './features/admin/pages/GestionUsuarios';
import Tendencias from './features/admin/pages/Tendencias';
import CentroReportes from './features/admin/pages/CentroReportes';
import PerfilUsuario from './features/analyst/pages/PerfilUsuario';
import Datasets from './features/analyst/pages/Datasets';
import ObservacionDatos from './features/analyst/pages/ObservacionDatos';
import ComparacionAnalisis from './features/analyst/pages/ComparacionAnalisis';
import AnalystWorkspaces from './features/analyst/pages/AnalystWorkspaces';
import Informes from './features/analyst/pages/Informes';
import './features/admin/admin.css';
import './features/analyst/analyst.css';

type AppRole = 'landing' | 'admin' | 'analyst';
type AdminView = 'dashboard' | 'usuarios' | 'tendencias' | 'reportes';
type AnalystView = 'perfil' | 'carga' | 'observacion' | 'comparacion' | 'workspace' | 'informes';

function App() {
  const [role, setRole] = useState<AppRole>('landing');
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [analystView, setAnalystView] = useState<AnalystView>('perfil');

  const handleNavigate = (view: string) => {
    setActiveView(view as AdminView);
  };

  const handleAnalystNavigate = (view: string) => {
    setAnalystView(view as AnalystView);
  };

  /* ===== UNIFIED ADMIN TOP BAR ===== */
  const renderAdminTopBar = () => {
    return (
      <>
        <div className="topbar-left" />
        <div className="topbar-right">
          <button className="topbar-icon-btn" aria-label="Notificaciones" title="3 nuevas notificaciones">
            <Bell size={16} />
            <span className="topbar-badge-dot" />
          </button>
          <button className="topbar-icon-btn" aria-label="Configuración" title="Configuración del sistema">
            <Settings size={16} />
          </button>
          <div className="topbar-avatar-small" aria-hidden="true" title="Retail Admin">RA</div>
          <button className="topbar-logout" onClick={() => setRole('landing')}>
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </>
    );
  };

  /* ===== ADMIN CONTENT ===== */
  const renderAdminContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'usuarios':
        return <GestionUsuarios />;
      case 'tendencias':
        return <Tendencias />;
      case 'reportes':
        return <CentroReportes />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  /** Render analyst content */
  const renderAnalystContent = () => {
    switch (analystView) {
      case 'perfil':
        return <PerfilUsuario />;
      case 'carga':
        return <Datasets onNavigate={handleAnalystNavigate} />;
      case 'observacion':
        return <ObservacionDatos onNavigate={handleAnalystNavigate} />;
      case 'comparacion':
        return <ComparacionAnalisis onNavigate={handleAnalystNavigate} />;
      case 'workspace':
        return <AnalystWorkspaces onNavigate={handleAnalystNavigate} />;
      case 'informes':
        return <Informes />;
      default:
        return <PerfilUsuario />;
    }
  };

  /* ===== RENDER ===== */
  if (role === 'landing') {
    return <LandingPage onLogin={() => setRole('analyst')} onAdminLogin={() => setRole('admin')} />;
  }

  if (role === 'analyst') {
    return (
      <AnalystLayout
        activeView={analystView}
        onNavigate={handleAnalystNavigate}
        onLogout={() => setRole('landing')}
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
    >
      {renderAdminContent()}
    </AdminLayout>
  );
}

export default App;
