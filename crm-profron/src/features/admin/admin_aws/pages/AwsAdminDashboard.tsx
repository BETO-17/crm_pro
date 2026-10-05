import { useState } from 'react';
import {
  Server,
  Database,
  Zap,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import '../aws_admin.css';

export default function AwsAdminDashboard() {
  const [regionFilter, setRegionFilter] = useState('Global (Todas las Regiones)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            Consola Global de Administración AWS
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Supervisa el inventario de clústeres EC2, almacenamiento S3, microservicios Lambda y consumo presupuestario.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 12.5,
              fontWeight: 600,
              background: '#ffffff',
              color: '#334155',
            }}
          >
            <option value="Global (Todas las Regiones)">Global (Todas las Regiones)</option>
            <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
            <option value="us-west-2 (Oregon)">us-west-2 (Oregon)</option>
            <option value="sa-east-1 (São Paulo)">sa-east-1 (São Paulo)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="aws-admin-grid">
        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Instancias EC2 Activas</span>
            <div className="aws-card-icon-pill">
              <Server size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">12 Instancias</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={13} /> +2 aprovisionadas este mes
          </span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Capacidad S3 Almacenada</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              <Database size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">3.8 TB</div>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>8 Buckets con réplica multi-AZ</span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Invocaciones Lambda / Día</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">245,800</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Tasa de error &lt; 0.01%</span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Gasto Mensual Estimado</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">$1,840.50</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>-14% vs presupuesto límite</span>
        </div>
      </div>

      {/* Health & Status Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              AWS Security Hub & Well-Architected Score: 96 / 100
            </h4>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Cifrado en reposo activo (SSE-KMS), MFA obligatorio en cuentas IAM y VPC Flow Logs habilitados.
            </p>
          </div>
        </div>
        <span className="aws-badge-admin aws-badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
          <CheckCircle size={14} /> Cumplimiento Normativo ISO 27001
        </span>
      </div>

      {/* Cluster Table */}
      <div className="aws-table-card">
        <div className="aws-table-header">
          <div>
            <h3 className="aws-table-title">Clústeres y Servicios Principales de Producción</h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>Despliegues críticos de la infraestructura ERP</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>● 6 Servicios Monitoreados</span>
        </div>

        <table className="aws-admin-table">
          <thead>
            <tr>
              <th>Nombre del Despliegue</th>
              <th>Servicio Principal</th>
              <th>Región</th>
              <th>Capacidad / Tamaño</th>
              <th>Estado Operativo</th>
              <th>Costo Diario</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>erp-core-app-cluster</strong>
                <div style={{ fontSize: 11, color: '#64748b' }}>Auto Scaling Group (min 2, max 6)</div>
              </td>
              <td>Amazon EC2 + ALB</td>
              <td>us-east-1</td>
              <td>4x t3.xlarge</td>
              <td><span className="aws-badge-admin aws-badge-success">● Saludable</span></td>
              <td>$28.40 / día</td>
            </tr>
            <tr>
              <td>
                <strong>erp-lakehouse-raw-store</strong>
                <div style={{ fontSize: 11, color: '#64748b' }}>Data Lake ingestion layer</div>
              </td>
              <td>Amazon S3 + Athena</td>
              <td>us-east-1</td>
              <td>2.4 TB (SSE-KMS)</td>
              <td><span className="aws-badge-admin aws-badge-success">● Activo</span></td>
              <td>$14.20 / día</td>
            </tr>
            <tr>
              <td>
                <strong>erp-async-event-processor</strong>
                <div style={{ fontSize: 11, color: '#64748b' }}>Event-driven microservices</div>
              </td>
              <td>AWS Lambda + SQS</td>
              <td>us-east-1</td>
              <td>12 Funciones</td>
              <td><span className="aws-badge-admin aws-badge-success">● Óptimo</span></td>
              <td>$3.80 / día</td>
            </tr>
            <tr>
              <td>
                <strong>erp-relational-db-prod</strong>
                <div style={{ fontSize: 11, color: '#64748b' }}>PostgreSQL Multi-AZ</div>
              </td>
              <td>Amazon RDS</td>
              <td>sa-east-1</td>
              <td>db.r5.large (32 GB)</td>
              <td><span className="aws-badge-admin aws-badge-success">● Conectado</span></td>
              <td>$18.90 / día</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
