import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  ChevronDown,
  Zap,
  Moon,
  Bell,
  LogOut,
  FileText,
  Menu,
} from 'lucide-react';
import { useAws } from '../context/AwsContext';
import { awsRegionsList } from '../data/awsRegionsData';
import { AWS_NAV_ITEMS } from './AwsSidebar';

interface AwsHeaderProps {
  activeView: string;
  isAiAdvisorOpen: boolean;
  setIsAiAdvisorOpen: (open: boolean) => void;
  onLogout?: () => void;
  onToast: (msg: string) => void;
  onOpenMobileMenu?: () => void;
}

export default function AwsHeader({
  activeView,
  isAiAdvisorOpen,
  setIsAiAdvisorOpen,
  onLogout,
  onToast,
  onOpenMobileMenu,
}: AwsHeaderProps) {
  const navigate = useNavigate();
  const { proposal, selectedRegion, setSelectedRegion } = useAws();

  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Notifications start empty (no fake count in empty state per requirement 7)
  const [notifications, setNotifications] = useState<
    { id: string; title: string; desc: string; time: string; unread: boolean }[]
  >([]);

  const regionRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRegionCode = (fullRegion: string) => {
    if (!proposal || !fullRegion || fullRegion === 'Sin región') return 'Sin región';
    return fullRegion.split(' ')[0] || 'Sin región';
  };

  const currentNav = AWS_NAV_ITEMS.find((n) => n.id === activeView);
  const currentTitle = currentNav?.label || 'Dashboard';

  return (
    <header
      className="admin-topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        height: 58,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      {/* Topbar Left: Hamburger Button (mobile) + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onOpenMobileMenu && (
          <button
            type="button"
            className="aws-hamburger-btn"
            onClick={onOpenMobileMenu}
            title="Abrir menú"
            aria-label="Abrir menú"
          >
            <Menu size={20} color="#1e293b" />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="aws-hide-mobile" style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            CloudOps
          </span>
          <span className="aws-hide-mobile" style={{ color: '#cbd5e1', fontSize: 12 }}>
            /
          </span>
          <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 700 }}>
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Topbar Right: Controls cluster */}
      <div className="cloudops-topbar-right">
        {/* 1. Region Selector */}
        <div className="topbar-region-wrap" ref={regionRef}>
          <button
            type="button"
            className="topbar-region-btn"
            onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
            title="Cambiar Región AWS"
            aria-expanded={regionDropdownOpen}
          >
            <Globe size={18} strokeWidth={1.8} color="#1e293b" />
            <span className="topbar-region-code aws-hide-mobile">{getRegionCode(selectedRegion)}</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              color="#1e293b"
              className="aws-hide-mobile"
              style={{
                transform: regionDropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* Region Selector Dropdown */}
          {regionDropdownOpen && (
            <div className="topbar-region-menu">
              {!proposal ? (
                <div style={{ padding: '16px 18px', textAlign: 'center', minWidth: 220 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                    Sin región
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px', lineHeight: 1.4 }}>
                    Crea una propuesta para elegir región
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegionDropdownOpen(false);
                      navigate('/modules/aws/planning');
                    }}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <FileText size={13} />
                    Ir a Planificación
                  </button>
                </div>
              ) : (
                <>
                  <div className="topbar-region-menu-title">Regiones AWS Globales</div>
                  <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                    {awsRegionsList.map((reg) => {
                      const isSel = selectedRegion.includes(reg.code);
                      return (
                        <div
                          key={reg.code}
                          className={`topbar-region-item ${isSel ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedRegion(`${reg.code} (${reg.name.split(' ')[0]})`);
                            setRegionDropdownOpen(false);
                            onToast(`Región cambiada a ${reg.code}`);
                          }}
                        >
                          <div className="topbar-region-item-left">
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Globe size={13} color="#2563eb" />
                            </div>
                            <div>
                              <div className="topbar-region-item-code">{reg.code}</div>
                              <div className="topbar-region-item-name">{reg.name}</div>
                            </div>
                          </div>
                          <span className="topbar-region-item-latency">~{reg.latencyMs}ms</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 2. AI Assistant Button [IA] */}
        <button
          type="button"
          className={`topbar-ai-pill-btn ${isAiAdvisorOpen ? 'active' : ''}`}
          onClick={() => setIsAiAdvisorOpen(!isAiAdvisorOpen)}
          title="Abrir Asistente IA de Arquitectura Cloud"
        >
          <Zap size={16} strokeWidth={2.4} color={isAiAdvisorOpen ? '#ffffff' : '#2563eb'} />
          <span>IA</span>
        </button>

        {/* 3. Theme Toggle */}
        <button
          type="button"
          className="topbar-icon-action-btn"
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            onToast(isDarkMode ? 'Modo Claro activado' : 'Modo Oscuro simulado');
          }}
          title="Cambiar tema (Claro / Oscuro)"
          aria-label="Cambiar tema"
        >
          <Moon size={18} strokeWidth={1.8} color="#475569" />
        </button>

        {/* 4. Notification Bell (Only shows badge if unread notifications exist) */}
        <div style={{ position: 'relative' }} ref={bellRef}>
          <button
            type="button"
            className="topbar-icon-action-btn"
            onClick={() => setBellOpen(!bellOpen)}
            title="Notificaciones de CloudOps"
            aria-label="Notificaciones"
          >
            <Bell size={18} strokeWidth={1.8} color="#475569" />
            {notifications.some((n) => n.unread) && (
              <span className="topbar-bell-badge">
                {notifications.filter((n) => n.unread).length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 290,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                zIndex: 1000,
                padding: '12px 14px',
                animation: 'dropdownFadeIn 0.15s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Notificaciones
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={() =>
                      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Marcar leídas
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px 8px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                    Sin notificaciones pendientes
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: item.unread ? '#eff6ff' : '#f8fafc',
                        border: item.unread ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: '#64748b', fontSize: 11.5, marginBottom: 4 }}>{item.desc}</div>
                      <div style={{ color: '#94a3b8', fontSize: 10 }}>{item.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. User Avatar [JM] */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <div
            className="topbar-avatar-jm-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title="Usuario Jair Morales (JM)"
            role="button"
            tabIndex={0}
          >
            <span>JM</span>
          </div>

          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 210,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                zIndex: 1000,
                padding: 8,
                animation: 'dropdownFadeIn 0.15s ease-out',
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Jair Morales</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>CloudOps Administrator</div>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/portal-cursos');
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: 12.5,
                  color: '#334155',
                  cursor: 'pointer',
                  borderRadius: 6,
                }}
              >
                Portal de Cursos
              </button>
              {onLogout && (
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: 12.5,
                    color: '#dc2626',
                    cursor: 'pointer',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <LogOut size={13} /> Cerrar Sesión
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
