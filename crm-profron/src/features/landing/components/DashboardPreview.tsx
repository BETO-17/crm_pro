import { Copy, BarChart3, Zap } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <section className="landing-dashboard-section" aria-label="Vista previa del dashboard">
      <div className="landing-dashboard-wrapper landing-animate">
        {/* Browser chrome */}
        <div className="landing-dash-chrome">
          <div className="landing-dash-dots" aria-hidden="true">
            <div className="landing-dash-dot" />
            <div className="landing-dash-dot" />
            <div className="landing-dash-dot" />
          </div>
          <div className="landing-dash-url">
            erpmetrics360.internal/workspace-q3-consolidated
          </div>
          <div className="landing-dash-badges">
            <span className="landing-dash-badge-live">
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#10b981', display: 'inline-block'
              }} />
              Live Sync: XLSX 48,200 rows
            </span>
            <span className="landing-dash-badge-mode">Modo: Multi-Sucursal</span>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="landing-dash-body">
          {/* KPI Cards */}
          <div className="landing-dash-kpis">
            {/* Ventas Netas */}
            <div className="landing-kpi-card">
              <div className="landing-kpi-header">
                <span className="landing-kpi-label">Ventas Netas Consolidadas</span>
                <Copy size={14} className="landing-kpi-icon" />
              </div>
              <div>
                <span className="landing-kpi-value">$3,842,910</span>
                <span className="landing-kpi-change">+34.2%</span>
              </div>
              <div className="landing-kpi-sub">
                Objetivo Q3: <strong>$3.4M superado</strong> &nbsp;&nbsp; <strong>112%</strong> cuota
              </div>
            </div>

            {/* Margen Bruto */}
            <div className="landing-kpi-card">
              <div className="landing-kpi-header">
                <span className="landing-kpi-label">Margen Bruto Ponderado</span>
              </div>
              <div>
                <span className="landing-kpi-value">28.4%</span>
                <span className="landing-kpi-change">+4.6 pts</span>
              </div>
              <div className="landing-kpi-sub">
                Detección de remates dinámicos &nbsp;&nbsp; <strong>98.2% precisión</strong>
              </div>
            </div>

            {/* Eficiencia Inventario */}
            <div className="landing-kpi-card">
              <div className="landing-kpi-header">
                <span className="landing-kpi-label">Eficiencia de Inventario</span>
                <Copy size={14} className="landing-kpi-icon" />
              </div>
              <div>
                <span className="landing-kpi-value">94.1%</span>
                <span style={{
                  fontSize: 12, color: '#9ca3af', marginLeft: 8, fontWeight: 500
                }}>
                  Rotación x4.2
                </span>
              </div>
              <div className="landing-kpi-sub">
                Quiebres evitados este mes &nbsp;&nbsp; <strong>412 SKUs</strong>
              </div>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="landing-dash-panels">
            {/* Predictive */}
            <div className="landing-dash-panel">
              <div className="landing-panel-header">
                <span className="landing-panel-title">
                  <BarChart3 size={16} /> Diagnóstico Predictivo de Ventas y Remates
                </span>
                <span className="landing-panel-subtitle">Semana 38 vs Semana 37</span>
              </div>

              {/* Row 1 */}
              <div className="landing-pred-row">
                <div className="landing-pred-info">
                  <span className="landing-pred-label">
                    Electrónica &amp; Hogar <small>(Precio Óptimo Sugerido)</small>
                  </span>
                  <span className="landing-pred-value">
                    $1,420,000 <span>(+18.4%)</span>
                  </span>
                </div>
                <div className="landing-pred-bar">
                  <div className="landing-pred-fill" style={{ width: '82%' }} />
                </div>
              </div>

              {/* Row 2 */}
              <div className="landing-pred-row">
                <div className="landing-pred-info">
                  <span className="landing-pred-label">
                    Moda &amp; Calzado <small>(Liquidación de Temporada)</small>
                  </span>
                  <span className="landing-pred-value">
                    $980,500 <span>(+26.1%)</span>
                  </span>
                </div>
                <div className="landing-pred-bar">
                  <div className="landing-pred-fill" style={{ width: '58%' }} />
                </div>
              </div>

              {/* Row 3 */}
              <div className="landing-pred-row">
                <div className="landing-pred-info">
                  <span className="landing-pred-label">Consumo Masivo / Alimentos</span>
                  <span className="landing-pred-value">
                    $1,442,410 <span>(+8.2%)</span>
                  </span>
                </div>
                <div className="landing-pred-bar">
                  <div className="landing-pred-fill" style={{ width: '90%' }} />
                </div>
              </div>

              {/* AI Tip */}
              <div className="landing-ai-tip">
                <Zap size={14} className="landing-ai-tip-icon" />
                <p>
                  <strong>Recomendación IA en tiempo real:</strong> Si ajustas el descuento del 15% al 11.5%
                  en la categoría calzado de invierno, la tasa de absorción de inventario se mantendrá en 88%
                  salvando $43,200 de margen bruto antes del viernes.
                </p>
              </div>
            </div>

            {/* Consultant */}
            <div className="landing-dash-panel">
              <div className="landing-panel-header">
                <span className="landing-panel-title">
                  <Zap size={16} /> Consultor Autónomo
                </span>
              </div>
              <div className="landing-consultant-quote">
                "Detectamos 3 sucursales con descalce de inventario en SKU #9021.
                Se generó automáticamente la orden de rebalanceo entre almacén Central y Norte."
              </div>
              <div className="landing-consultant-meta">
                <div className="landing-consultant-meta-row">
                  <span className="landing-consultant-meta-label">Tiempo análisis:</span>
                  <span className="landing-consultant-meta-value">1.4 segundos</span>
                </div>
                <div className="landing-consultant-meta-row">
                  <span className="landing-consultant-meta-label">Dataset vinculado:</span>
                  <span className="landing-consultant-meta-value">sucursales_latam.csv</span>
                </div>
              </div>
              <button className="landing-consultant-action">
                <Zap size={14} />
                Aplicar sugerencia en ERP
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
