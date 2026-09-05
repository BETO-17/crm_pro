import { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import LoginModal from './LoginModal';
import AdminLoginModal from './AdminLoginModal';

interface LandingNavbarProps {
  onLogin: () => void;
  onAdminLogin: () => void;
}

/** Number of clicks on the logo required to reveal admin access */
const ADMIN_CLICK_THRESHOLD = 10;
/** Time window (ms) to complete the click sequence */
const ADMIN_CLICK_TIMEOUT = 5000;

export default function LandingNavbar({ onLogin, onAdminLogin }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminAccessRevealed, setAdminAccessRevealed] = useState(false);

  /** Track clicks for hidden admin access */
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** Clean up timer on unmount */
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  /** Handle click on logo/brand name to reveal admin access */
  const handleLogoClick = useCallback(() => {
    if (adminAccessRevealed) return;

    clickCountRef.current += 1;

    // Reset timer on each click
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= ADMIN_CLICK_THRESHOLD) {
      setAdminAccessRevealed(true);
      clickCountRef.current = 0;
    } else {
      // Reset click count if no more clicks within timeout
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, ADMIN_CLICK_TIMEOUT);
    }
  }, [adminAccessRevealed]);

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
            onClick={handleLogoClick}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            role="button"
            tabIndex={0}
            aria-label="RetailMetrics 360"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
          >
            <div className="landing-logo-icon" aria-hidden="true">M</div>
            <div>
              <span>RetailMetrics 360</span>
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
          {adminAccessRevealed && (
            <button
              className="landing-btn-admin-login"
              onClick={() => setShowAdminLogin(true)}
              aria-label="Inicio sesión Admin"
            >
              <ShieldAlert size={14} />
              Inicio Sesión Admin
            </button>
          )}
          <button className="landing-btn-login" onClick={() => setShowLogin(true)}>
            Iniciar Sesión
          </button>
          <button className="landing-btn-demo">
            Solicitar Demo Gratuita
            <ExternalLink size={12} style={{ marginLeft: 4 }} />
          </button>
        </div>
      </nav>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          setShowLogin(false);
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
