import { TrendingUp, LayoutGrid, BarChart3 } from 'lucide-react';

export default function PillarsSection() {
  return (
    <section className="landing-pillars" id="estrategias" aria-labelledby="pillars-title">
      <div className="landing-section-inner">
        <p className="landing-section-eyebrow">Arquitectura de Decisión</p>
        <h2 className="landing-section-title" id="pillars-title">
          Tres pilares diseñados para el liderazgo del retail contemporáneo.
        </h2>
        <p className="landing-section-desc">
          Elimina la intuición en las salas de juntas. Respaldamos cada una de tus acciones con
          correlaciones matemáticas rigurosas y procesamiento inmediato.
        </p>

        <div className="landing-pillars-grid landing-animate-stagger">
          {/* Pillar 1 */}
          <article className="landing-pillar-card">
            <div className="landing-pillar-icon-wrap blue" aria-hidden="true">
              <TrendingUp size={22} />
            </div>
            <h3>Multiplica tus Ventas</h3>
            <p>
              Detección automática de precios óptimos con curvas de elasticidad real. Identifica qué
              productos admiten aumentos de margen y mide con certeza el ROAS directo de cada canal comercial.
            </p>
            <ul className="landing-pillar-features">
              <li>Modelado de elasticidad precio-demanda</li>
              <li>Cálculo de ROAS por campaña y SKU</li>
              <li>Alineación automática de promociones Flash</li>
            </ul>
          </article>

          {/* Pillar 2 */}
          <article className="landing-pillar-card">
            <div className="landing-pillar-icon-wrap purple" aria-hidden="true">
              <LayoutGrid size={22} />
            </div>
            <h3>Organización y Trabajo Eficiente</h3>
            <p>
              Workspaces colaborativos para cada analista, director y comprador. Sinergia total entre
              inventarios, compras y finanzas con generación de informes ejecutivos exportables en un clic.
            </p>
            <ul className="landing-pillar-features">
              <li>Espacios de trabajo por categoría comercial</li>
              <li>Reportes listos para Directorio en formato PDF/XLSX</li>
              <li>Gestión granular de roles de analista y directivos</li>
            </ul>
          </article>

          {/* Pillar 3 */}
          <article className="landing-pillar-card">
            <div className="landing-pillar-icon-wrap amber" aria-hidden="true">
              <BarChart3 size={22} />
            </div>
            <h3>Estrategias Basadas en Datos</h3>
            <p>
              Diagnóstico inmediato para liquidaciones y remates de stock lento sin dañar el posicionamiento
              de marca. Benchmarking continuo comparando tus indicadores contra promedios del sector.
            </p>
            <ul className="landing-pillar-features">
              <li>Simulador de impacto de remates y liquidación</li>
              <li>Benchmarking de ticket promedio contra el mercado</li>
              <li>Detección proactiva de fuga de clientes recurrentes</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
