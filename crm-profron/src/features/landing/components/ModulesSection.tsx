import { Upload, BarChart3, MessageCircle, FolderOpen, Zap } from 'lucide-react';

export default function ModulesSection() {
  return (
    <section className="landing-modules" id="modulos" aria-labelledby="modules-title">
      <div className="landing-modules-header landing-section-inner">
        <p className="landing-section-eyebrow">Tecnología de Grado Corporativo</p>
        <h2 className="landing-section-title" id="modules-title">
          Módulos integrados diseñados para analistas y líderes ejecutivos.
        </h2>
        <p className="landing-section-desc">
          Ingeniería de datos de alta velocidad que convierte hojas de cálculo dispersas en un
          centro de mando operativo unificado.
        </p>
      </div>

      <div className="landing-modules-grid landing-animate-stagger">
        {/* Module 1: Carga Masiva */}
        <article className="landing-module-card">
          <h3 className="landing-module-card-title">
            <Upload size={18} />
            Carga Masiva Inteligente
          </h3>
          <p>
            Arrastra archivos CSV y Excel de cualquier sucursal, ERP o TPV. Nuestro parser inteligente
            normaliza campos divergentes, valida esquemas e infiere tipos de datos en cuestión de
            milisegundos.
          </p>

          <div className="landing-upload-sim" aria-label="Simulación de carga de archivo">
            <Upload size={24} className="landing-upload-icon" />
            <p className="landing-upload-filename">ventas_consolidadas_septiembre.xlsx</p>
            <p className="landing-upload-meta">124,500 registros verificados • Cero errores de tipado</p>
            <div className="landing-upload-badges">
              <span className="landing-upload-badge green">100% Parseado</span>
              <span className="landing-upload-badge gray">32 Columnas</span>
            </div>
          </div>

          <div className="landing-module-footer">
            <span>Soporta SAP, Oracle, Shopify, WooCommerce y archivos planos</span>
            <strong>Zero-Configuration</strong>
          </div>
        </article>

        {/* Module 2: Comparación & Tendencias */}
        <article className="landing-module-card">
          <h3 className="landing-module-card-title">
            <BarChart3 size={18} />
            Comparación &amp; Tendencias de Mercado
          </h3>
          <p>
            Compara tu catálogo, velocidad de rotación y penetración de categorías frente a índices
            consolidados de la industria retail en tu región geográfica.
          </p>

          <div style={{ marginBottom: 16 }}>
            <div className="landing-bench-row">
              <div className="landing-bench-info">
                <span className="landing-bench-label">Tu Empresa (Margen promedio)</span>
                <span className="landing-bench-val">32.8%</span>
              </div>
              <div className="landing-bench-bar">
                <div className="landing-bench-fill primary" style={{ width: '76%' }} />
              </div>
            </div>

            <div className="landing-bench-row">
              <div className="landing-bench-info">
                <span className="landing-bench-label">Benchmark Industria (Sector Retail)</span>
                <span className="landing-bench-val">26.2%</span>
              </div>
              <div className="landing-bench-bar">
                <div className="landing-bench-fill secondary" style={{ width: '58%' }} />
              </div>
            </div>

            <div className="landing-bench-advantage">
              <span>Diferencial competitivo generado</span>
              <strong>+6.6% ventaja</strong>
            </div>
          </div>

          <div className="landing-module-footer">
            <span>Actualización periódica de cohortes de mercado</span>
            <strong>Índices Auditados</strong>
          </div>
        </article>

        {/* Module 3: Asistente IA */}
        <article className="landing-module-card">
          <h3 className="landing-module-card-title">
            <MessageCircle size={18} />
            Asistente de IA Integrado
          </h3>
          <p>
            Pregunta en lenguaje natural: "¿Por qué cayó el ticket promedio en la sucursal del Norte
            el fin de semana pasado?". La IA consulta los datos, genera el desglose analítico y
            redacta la respuesta ejecutiva.
          </p>

          <div className="landing-ai-chat">
            <div className="landing-ai-chat-msg user">
              <strong>Analista:</strong> "¿Cuáles 5 SKUs de calzado generaron menor margen y por qué?"
            </div>
            <div className="landing-ai-chat-msg ai">
              <strong>RetailAI:</strong> SKU #402, #415 y #889 sufrieron 3 promociones no coordinadas
              con compras, erosionando el margen en un 14.3%. Sugiero pausar el descuento automático
              para recuperar $18.4k.
            </div>
          </div>

          <div className="landing-module-footer">
            <span>Motor LLM privado en infraestructura dedicada</span>
            <strong>Zero Data Leak</strong>
          </div>
        </article>

        {/* Module 4: Workspaces */}
        <article className="landing-module-card">
          <h3 className="landing-module-card-title">
            <FolderOpen size={18} />
            Workspaces Persistentes
          </h3>
          <p>
            Guarda tus hipótesis, filtros cruzados, tablas dinámicas y notas ejecutivas exactamente
            en el punto donde las dejaste. Comparte accesos en vivo con directores o auditores externos.
          </p>

          <div className="landing-ws-cards">
            <div className="landing-ws-card">
              <div className="landing-ws-card-header">
                <span className="landing-ws-card-name">Campaña Hot Sale</span>
                <span className="landing-ws-card-dot active" />
              </div>
              <span className="landing-ws-card-meta active">Activo • 14 tablas enlazadas</span>
            </div>
            <div className="landing-ws-card">
              <div className="landing-ws-card-header">
                <span className="landing-ws-card-name">Liquidación Stock Q3</span>
                <span className="landing-ws-card-dot archived" />
              </div>
              <span className="landing-ws-card-meta archived">Archivado • Listo para reporte</span>
            </div>
          </div>

          <div className="landing-ws-collab">
            <span className="landing-ws-collab-text">
              <Zap size={12} />
              Colaboración simultánea activa (6 analistas)
            </span>
            <span className="landing-ws-collab-badge">Sincronizado</span>
          </div>

          <div className="landing-module-footer">
            <span>Historial de cambios inmutable con auditoría de versión</span>
            <strong>Version Control</strong>
          </div>
        </article>
      </div>
    </section>
  );
}
