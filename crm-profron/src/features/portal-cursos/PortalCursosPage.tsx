import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LogOut,
  Sparkles,
} from 'lucide-react';
import CourseGiftCard, { type CourseCardData } from './components/CourseGiftCard';
import CourseAuthModal from './components/CourseAuthModal';
import RequestAccessModal from './components/RequestAccessModal';
import LogoutConfirmModal from '../../core/components/LogoutConfirmModal';
import './portal-cursos.css';

export default function PortalCursosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);

  // Modals state
  const [authModalCard, setAuthModalCard] = useState<CourseCardData | null>(null);
  const [requestModalCard, setRequestModalCard] = useState<CourseCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Module permissions state in localStorage
  const [permissions, setPermissions] = useState<{ bigData: 'approved' | 'pending' | 'locked'; microsoftAzure: 'approved' | 'pending' | 'locked' }>(() => {
    try {
      const saved = localStorage.getItem('course_access_permissions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { bigData: 'approved', microsoftAzure: 'locked' };
  });

  useEffect(() => {
    try {
      localStorage.setItem('course_access_permissions', JSON.stringify(permissions));
    } catch {
      // ignore
    }
  }, [permissions]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }

    // Check if redirected because of a blocked module
    const blocked = searchParams.get('blocked');
    if (blocked) {
      setToastMessage('Acceso restringido: Este módulo requiere aprobación previa del administrador.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  }, [searchParams]);

  const isAdmin = user?.role === 'admin';

  const cards: CourseCardData[] = [
    {
      id: 'card-big-data',
      key: 'bigData',
      code: 'BDS-001',
      title: 'Big Data & Analytics Suite',
      route: isAdmin ? '/admin/dashboard' : '/modules/big-data',
      summary: isAdmin
        ? 'Consola de administración, analítica global y gestión de retail'
        : 'Suite integral de análisis de datos para retail',
      category: 'Ciencia de Datos & Retail Analytics',
      badge: isAdmin ? 'ADMINISTRADOR BIG DATA' : 'ESPECIALIDAD 1',
      description:
        'Entorno dedicado para carga masiva de datasets, observación estadística, limpieza de datos, algoritmos comparativos y generación de reportes ejecutivos.',
      theme: 'navy',
      featureItems: [
        {
          title: 'Carga de Datos',
          desc: 'Subida y procesamiento de archivos masivos CSV / XLSX con ventas, inventario y sucursales',
          iconType: 'upload',
        },
        {
          title: 'Observación de Datos',
          desc: 'Vista tabular con filtros avanzados, análisis estadístico y gráficos automáticos',
          iconType: 'table',
        },
        {
          title: 'Comparación y Análisis',
          desc: 'Modelos comparativos de margen, elasticidad de precios y rendimiento por sector',
          iconType: 'compare',
        },
        {
          title: 'Workspaces & Informes',
          desc: 'Espacios de trabajo colaborativos y generación de reportes ejecutivos',
          iconType: 'users',
        },
      ],
      status: isAdmin ? 'approved' : permissions.bigData,
    },
    {
      id: 'card-azure',
      key: 'microsoftAzure',
      code: 'AZC-002',
      title: 'Microsoft Azure Cloud Platform',
      route: isAdmin ? '/admin/azure/dashboard' : '/modules/azure',
      summary: isAdmin
        ? 'Consola de gestión de infraestructura en la nube, VMs y data factory'
        : 'Entorno de infraestructura en la nube y pipelines',
      category: 'Infraestructura Cloud & Data Factory',
      badge: isAdmin ? 'ADMINISTRADOR AZURE' : 'ESPECIALIDAD 2',
      description:
        'Laboratorio en la nube para aprovisionamiento de recursos computacionales, almacenamiento Blob Storage y canalizaciones de orquestación de datos.',
      theme: 'slate',
      featureItems: [
        {
          title: 'Infraestructura Cloud',
          desc: 'Gestión de máquinas virtuales, redes y recursos escalables',
          iconType: 'server',
        },
        {
          title: 'Blob Storage',
          desc: 'Almacenamiento de objetos para archivos masivos y backups',
          iconType: 'storage',
        },
        {
          title: 'Pipelines de Datos',
          desc: 'Orquestación de flujos ETL con monitoreo en tiempo real',
          iconType: 'pipeline',
        },
        {
          title: 'Monitoreo de Cómputo',
          desc: 'Métricas de rendimiento, alertas y análisis de capacidad',
          iconType: 'activity',
        },
      ],
      status: isAdmin ? 'approved' : permissions.microsoftAzure,
    },
  ];

  const handleEnterClick = (card: CourseCardData) => {
    if (isAdmin) {
      if (card.key === 'bigData') {
        navigate('/admin/dashboard');
        return;
      }
      if (card.key === 'microsoftAzure') {
        navigate('/admin/azure/dashboard');
        return;
      }
    }
    setAuthModalCard(card);
  };

  const handleRequestClick = (card: CourseCardData) => {
    setRequestModalCard(card);
  };

  const handleAuthSuccess = () => {
    if (!authModalCard) return;
    if (isAdmin) {
      const targetAdmin = authModalCard.key === 'bigData' ? '/admin/dashboard' : '/admin/azure/dashboard';
      setAuthModalCard(null);
      navigate(targetAdmin);
    } else {
      const targetRoute = authModalCard.route;
      setAuthModalCard(null);
      navigate(targetRoute);
    }
  };

  const handleRequestSubmitted = () => {
    if (!requestModalCard) return;
    setPermissions((prev) => ({
      ...prev,
      [requestModalCard.key]: 'pending',
    }));
    setToastMessage(`Solicitud para "${requestModalCard.title}" enviada al administrador.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="portal-wrapper">
      <div className="portal-glow-1" />
      <div className="portal-glow-2" />

      {/* ---- Navigation Bar ---- */}
      <nav className="portal-navbar">
        <div className="portal-logo-group" onClick={() => navigate('/')}>
          <div className="portal-logo-icon">M</div>
          <div>
            <div className="portal-brand-title">ERPMetrics 360</div>
            <div className="portal-brand-sub">Portal de Especialidades</div>
          </div>
        </div>

        <div className="portal-nav-actions">
          <div className="portal-user-pill">
            <div className="portal-avatar">
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {user?.full_name || 'Usuario Suscrito'}
            </span>
          </div>

          <button className="portal-btn-logout" onClick={handleLogoutClick} title="Cerrar Sesión">
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </nav>

      {/* ---- Toast Alert ---- */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #3b82f6',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: 30,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={16} color="#60a5fa" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---- Main Hero & Cards ---- */}
      <main className="portal-main-content">
        <div className="portal-hero-text">
          <span className="portal-badge">
            <Sparkles size={14} /> Entornos de Aprendizaje y Especialización
          </span>
          <h1 className="portal-title">Selecciona tu Laboratorio</h1>
          <p className="portal-subtitle">
            Ingresa a los sistemas dedicados de tu plan de formación. Si requieres acceso a un nuevo
            laboratorio, solicítalo al administrador y valida tus credenciales de seguridad.
          </p>
        </div>

        {/* Gift Cards Grid */}
        <div className="portal-cards-grid">
          {cards.map((card) => (
            <CourseGiftCard
              key={card.id}
              data={card}
              onEnter={handleEnterClick}
              onRequest={handleRequestClick}
            />
          ))}
        </div>

        {/* Quick Simulator Bar for Demo/Testing */}
        <div
          style={{
            marginTop: 20,
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          <span>
            🛠️ <strong>Simulador de Permisos (Admin):</strong> Cambia el estado de aprobación para probar el comportamiento de las Gift Cards:
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setPermissions({ bigData: 'approved', microsoftAzure: 'approved' })}
              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '4px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              Aprobar Ambos
            </button>
            <button
              onClick={() => setPermissions({ bigData: 'approved', microsoftAzure: 'locked' })}
              style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '4px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              Big Data Activo / Azure Bloqueado
            </button>
            <button
              onClick={() => setPermissions({ bigData: 'locked', microsoftAzure: 'locked' })}
              style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fca5a5', border: '1px solid rgba(244, 63, 94, 0.4)', padding: '4px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              Bloquear Ambos
            </button>
          </div>
        </div>
      </main>

      {/* ---- OTP & Credential Verification Modal ---- */}
      {authModalCard && (
        <CourseAuthModal
          isOpen={true}
          onClose={() => setAuthModalCard(null)}
          courseTitle={authModalCard.title}
          courseKey={authModalCard.key}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* ---- Request Access Modal ---- */}
      {requestModalCard && (
        <RequestAccessModal
          isOpen={true}
          onClose={() => setRequestModalCard(null)}
          courseTitle={requestModalCard.title}
          onRequestSubmitted={handleRequestSubmitted}
        />
      )}

      {/* ---- Logout Confirmation Modal ---- */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
