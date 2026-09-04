import { ArrowUpRight, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-hero-inner">
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" aria-hidden="true" />
          Potenciado por Inteligencia Artificial &amp; Análisis Predictivo
        </div>

        <h1 id="hero-title">
          Transforma los datos de tu empresa en ventas récord y decisiones operativas infalibles.
        </h1>

        <p className="landing-hero-subtitle">
          Analizamos tus ventas, márgenes, inventario y rendimiento por sector (CSV/XLSX) con IA
          en tiempo real. Optimiza estrategias de precios, remates y marketing desde un único
          entorno analítico.
        </p>

        <div className="landing-hero-ctas">
          <button className="landing-cta-primary">
            Comenzar Prueba Gratis (14 días)
            <ArrowUpRight size={16} />
          </button>
          <button className="landing-cta-secondary">
            <span className="landing-cta-play-icon" aria-hidden="true">
              <Play size={8} fill="currentColor" />
            </span>
            Ver Video Demostrativo
          </button>
        </div>

        <div className="landing-logos-band">
          <p className="landing-logos-label">
            Más de 450+ cadenas minoristas y empresas optimizan sus operaciones con nosotros
          </p>
          <div className="landing-logos-row" aria-label="Empresas que confían en nosotros">
            <span>NEXUS<strong style={{ color: '#9ca3af' }}>RETAIL</strong></span>
            <span>VANGUARD</span>
            <span style={{ fontWeight: 800, letterSpacing: 2 }}>DISTRIB_CO</span>
            <span>AURORA<strong style={{ color: '#9ca3af' }}>MALLS</strong></span>
            <span>METROSTORE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
