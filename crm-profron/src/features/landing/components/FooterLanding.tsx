export default function FooterLanding() {
  return (
    <footer className="landing-footer" role="contentinfo">
      <div className="landing-footer-inner">
        <div className="landing-footer-grid">
          {/* Brand */}
          <div className="landing-footer-brand">
            <div className="landing-logo">
              <div className="landing-logo-icon" aria-hidden="true">M</div>
              <div>
                <span>RetailMetrics 360</span>
                <span className="landing-logo-sub">Executive Analytics</span>
              </div>
            </div>
            <p>
              Plataforma de análisis predictivo y gestión operativa diseñada exclusivamente
              para cadenas minoristas y empresas de distribución en Latinoamérica.
            </p>
          </div>

          {/* Producto */}
          <div className="landing-footer-col">
            <h4>Producto</h4>
            <ul>
              <li><a href="#solucion">Solución</a></li>
              <li><a href="#modulos">Módulos</a></li>
              <li><a href="#precios">Precios</a></li>
              <li><a href="#casos">Casos de Éxito</a></li>
              <li><a href="#changelog">Changelog</a></li>
            </ul>
          </div>

          {/* Recursos */}
          <div className="landing-footer-col">
            <h4>Recursos</h4>
            <ul>
              <li><a href="#docs">Documentación</a></li>
              <li><a href="#api">API Reference</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#webinars">Webinars</a></li>
              <li><a href="#soporte">Soporte</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="landing-footer-col">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#about">Acerca de</a></li>
              <li><a href="#careers">Carreras</a></li>
              <li><a href="#partners">Partners</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <p>© 2026 RetailMetrics 360. Todos los derechos reservados.</p>
          <div className="landing-footer-bottom-links">
            <a href="#privacy">Privacidad</a>
            <a href="#terms">Términos de Servicio</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
