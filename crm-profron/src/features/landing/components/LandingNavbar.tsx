import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface LandingNavbarProps {
  onLogin: () => void;
}

export default function LandingNavbar({ onLogin }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="landing-navbar-left">
        <div className="landing-logo">
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
        <button className="landing-btn-login" onClick={onLogin}>
          Iniciar Sesión
        </button>
        <button className="landing-btn-demo">
          Solicitar Demo Gratuita
          <ExternalLink size={12} style={{ marginLeft: 4 }} />
        </button>
      </div>
    </nav>
  );
}
