import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import LoginModal from './LoginModal';
import AdminLoginModal from './AdminLoginModal';

interface LandingNavbarProps {
  onLogin: () => void;
  onAdminLogin: () => void;
}

export default function LandingNavbar({ onLogin, onAdminLogin }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminBtn, setShowAdminBtn] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      setShowAdminBtn(true);
      setClickCount(0);
    } else {
      setClickCount(nextCount);
      // Reset if no clicks within 3 seconds
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);
    }
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  return (
    <>
      <nav
        className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="landing-navbar-left">
          <div
            className="landing-logo"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            role="button"
            tabIndex={0}
            onClick={handleLogoClick}
            aria-label="ERPMetrics 360"
            title="ERPMetrics 360"
          >
            <div className="landing-logo-icon" aria-hidden="true">M</div>
            <div>
              <span>ERPMetrics 360</span>
              <span className="landing-logo-sub">Executive Analytics</span>
            </div>
          </div>
          <span className="landing-badge-suite">EXECUTIVE SUITE</span>

          <ul className="landing-nav-links">
            <li><a href="#solucion">Solución</a></li>
            <li><a href="#modulos">Módulos</a></li>
            <li><a href="#estrategias">Estrategias</a></li>
            <li><a href="#casos">Casos de Éxito</a></li>
            <li><a href="#precios">Precios</a></li>
          </ul>
        </div>

        <div className="landing-navbar-right">
          {showAdminBtn && (
            <button
              className="landing-btn-admin-login"
              onClick={onAdminLogin}
              aria-label="Panel Admin"
            >
              <ShieldAlert size={14} />
              Panel Admin
            </button>
          )}

          <button className="landing-btn-login" onClick={openLogin}>
            Iniciar sesión
          </button>

          <button
            className="landing-btn-demo"
            onClick={openRegister}
            aria-label="Comenzar gratis"
          >
            <span>Comenzar gratis</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      <LoginModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => {
          setShowAuthModal(false);
          onLogin();
        }}
      />

      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={() => {
          setShowAdminLogin(false);
          onAdminLogin();
        }}
      />
    </>
  );
}
