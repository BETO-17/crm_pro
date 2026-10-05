import {
  Zap,
  Cpu,
  Activity,
} from 'lucide-react';
import '../aws_admin.css';

export default function AwsServerlessAdmin() {
  const concurrencyLimit = 1000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
          Administración de AWS Lambda & Serverless
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Supervisa límites de concurrencia no reservada, orquestación de eventos y rendimiento de microservicios.
        </p>
      </div>

      {/* Stats */}
      <div className="aws-admin-grid">
        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Concurrencia Máxima Asignada</span>
            <div className="aws-card-icon-pill">
              <Zap size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">{concurrencyLimit} Instancias</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Pico actual: 142 concurrentes</span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Duración Promedio Facturada</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">58 ms</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Optimizado con AWS Graviton2</span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Provisioned Concurrency (Warm)</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <Cpu size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">10 Warm Pools</div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Cero latencia de Cold Start</span>
        </div>
      </div>

      {/* Functions Audit Table */}
      <div className="aws-table-card">
        <div className="aws-table-header">
          <h3 className="aws-table-title">Auditoría de Microservicios Serverless en Producción</h3>
        </div>

        <table className="aws-admin-table">
          <thead>
            <tr>
              <th>Función Lambda</th>
              <th>Arquitectura</th>
              <th>Trigger de Activación</th>
              <th>Invocaciones / Mes</th>
              <th>Tasa de Éxito</th>
              <th>Costo Mensual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>erp-process-order-event</strong></td>
              <td>arm64 (Graviton)</td>
              <td>Amazon API Gateway (REST)</td>
              <td>540,000</td>
              <td><span className="aws-badge-admin aws-badge-success">99.99%</span></td>
              <td>$4.80</td>
            </tr>
            <tr>
              <td><strong>erp-sync-retail-inventory</strong></td>
              <td>x86_64</td>
              <td>Amazon EventBridge (Cron)</td>
              <td>72,000</td>
              <td><span className="aws-badge-admin aws-badge-success">100.00%</span></td>
              <td>$2.40</td>
            </tr>
            <tr>
              <td><strong>erp-generate-pdf-invoice</strong></td>
              <td>arm64 (Graviton)</td>
              <td>Amazon SQS Queue</td>
              <td>24,500</td>
              <td><span className="aws-badge-admin aws-badge-success">99.90%</span></td>
              <td>$1.85</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
