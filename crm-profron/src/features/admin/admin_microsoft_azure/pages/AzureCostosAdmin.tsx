import {
  DollarSign,
  TrendingDown,
  CreditCard,
  PieChart,
  AlertCircle,
  Zap,
} from 'lucide-react';
import '../azure_admin.css';

const costBreakdown = [
  { service: 'Azure Virtual Machines (Compute)', cost: '$1,450.20', pct: '42%', trend: '+3.2%' },
  { service: 'Azure Synapse Analytics DW', cost: '$980.50', pct: '28%', trend: '-1.5%' },
  { service: 'Blob Storage & Data Lake Gen2', cost: '$420.00', pct: '12%', trend: '+0.8%' },
  { service: 'Azure Data Factory Pipelines', cost: '$310.80', pct: '9%', trend: '+5.0%' },
  { service: 'Bandwidth & Data Egress', cost: '$180.10', pct: '5%', trend: '-0.2%' },
  { service: 'Azure Key Vault & Security Center', cost: '$138.40', pct: '4%', trend: '0.0%' },
];

export default function AzureCostosAdmin() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Gestión de Costos & Presupuestos Cloud</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Azure Cost Management, proyección de facturación mensual y optimización FinOps.
          </p>
        </div>
        <button className="azure-action-btn-small azure-action-btn-primary">
          <Zap size={14} /> Recomendaciones de Ahorro
        </button>
      </div>

      {/* KPI Cards */}
      <div className="azure-kpi-grid">
        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Gasto Acumulado del Mes</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#0078d4' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">$3,480.00</div>
          <div className="azure-kpi-delta positive">
            <TrendingDown size={12} /> -8.4% vs mes anterior
          </div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Presupuesto Asignado (Cap)</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">$5,000.00</div>
          <div className="azure-kpi-delta positive">69.6% consumido</div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Proyección Fin de Mes</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <PieChart size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">$4,220.00</div>
          <div className="azure-kpi-delta positive">
            <AlertCircle size={12} /> Dentro del límite presupuestario
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="azure-table-card">
        <div className="azure-table-header">
          <h3 className="azure-table-title">Desglose por Servicio de Azure</h3>
        </div>

        <table className="azure-admin-table">
          <thead>
            <tr>
              <th>Servicio Cloud</th>
              <th>Gasto Mensual</th>
              <th>% del Total</th>
              <th>Variación MoM</th>
              <th>Distribución</th>
            </tr>
          </thead>
          <tbody>
            {costBreakdown.map((item, i) => (
              <tr key={i}>
                <td>
                  <strong>{item.service}</strong>
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.cost}</td>
                <td>{item.pct}</td>
                <td style={{ color: item.trend.startsWith('+') ? '#ea580c' : '#16a34a', fontWeight: 600 }}>
                  {item.trend}
                </td>
                <td style={{ minWidth: 160 }}>
                  <div style={{ background: '#e2e8f0', height: 8, borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        background: '#0078d4',
                        height: '100%',
                        width: item.pct,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
