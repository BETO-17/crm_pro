import { useNavigate } from 'react-router-dom';
import {
  Server,
  Database,
  Layers,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Plus,
} from 'lucide-react';
import '../azure_admin.css';

export default function AzureAdminDashboard() {
  const navigate = useNavigate();

  const kpis = [
    {
      title: 'Instancias VM Activas',
      val: '6 / 8',
      sub: '2 detenidas por ahorro',
      icon: Server,
      color: '#0078d4',
      badge: '+12% este mes',
    },
    {
      title: 'Blob Storage & Lake',
      val: '3.8 TB',
      sub: '4 cuentas de almacenamiento',
      icon: Database,
      color: '#00bcf2',
      badge: '99.99% SLA',
    },
    {
      title: 'Pipelines Data Factory',
      val: '12 Activos',
      sub: '98.5% tasa de éxito ETL',
      icon: Layers,
      color: '#10b981',
      badge: '4 ejecuciones hoy',
    },
    {
      title: 'Consumo Mensual Cloud',
      val: '$1,420 USD',
      sub: 'De $2,500 USD de presupuesto',
      icon: DollarSign,
      color: '#f59e0b',
      badge: '56.8% utilizado',
    },
  ];

  const recentPipelines = [
    {
      name: 'Ingest_Retail_SQL_to_ADLS',
      service: 'Azure Data Factory',
      status: 'Éxito',
      duration: '8m 42s',
      time: 'Hace 15 min',
    },
    {
      name: 'Spark_Cleanse_Transacciones',
      service: 'Databricks Cluster',
      status: 'Éxito',
      duration: '14m 10s',
      time: 'Hace 1 hora',
    },
    {
      name: 'Synapse_Analytics_Aggregator',
      service: 'Synapse Analytics',
      status: 'En ejecución',
      duration: '3m 22s',
      time: 'Ahora',
    },
    {
      name: 'Backup_Daily_Blob_Storage',
      service: 'Azure Backup Vault',
      status: 'Éxito',
      duration: '22m 05s',
      time: 'Hoy 04:00 AM',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Centro de Control Microsoft Azure</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Supervisión y administración centralizada de infraestructura cloud, almacenamiento y canalizaciones.
          </p>
        </div>
        <button
          className="azure-action-btn-small azure-action-btn-primary"
          onClick={() => navigate('/admin/azure/recursos')}
        >
          <Plus size={14} /> Desplegar Recurso
        </button>
      </div>

      {/* KPI Cards */}
      <div className="azure-admin-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="azure-admin-card">
              <div className="azure-card-header-flex">
                <span className="azure-card-stat-label">{kpi.title}</span>
                <div className="azure-card-icon-pill" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="azure-card-stat-val">{kpi.val}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.sub}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: kpi.color, background: `${kpi.color}15`, padding: '2px 8px', borderRadius: 12 }}>
                  {kpi.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Cluster & Resource Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="azure-table-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="azure-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="#0078d4" />
              Telemetría de Cómputo & Clúster en Tiempo Real
            </h3>
            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={13} /> Sistema Óptimo
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Utilización CPU Media</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>42.6%</div>
              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: '42.6%', height: '100%', background: '#0078d4' }} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Memoria RAM Asignada</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>68.2 GB</div>
              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: '58%', height: '100%', background: '#00bcf2' }} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Throughput de Red</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>1.2 Gbps</div>
              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: '#10b981' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Cloud Shortcuts */}
        <div className="azure-table-card" style={{ padding: 20 }}>
          <h3 className="azure-table-title" style={{ marginBottom: 14 }}>Accesos Rápidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="azure-action-btn-small"
              onClick={() => navigate('/admin/azure/recursos')}
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span>🖥️ Gestionar Máquinas Virtuales</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="azure-action-btn-small"
              onClick={() => navigate('/admin/azure/storage')}
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span>🗄️ Explorar Blob Storage</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="azure-action-btn-small"
              onClick={() => navigate('/admin/azure/pipelines')}
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span>🔄 Ejecutar Pipeline Data Factory</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="azure-action-btn-small"
              onClick={() => navigate('/admin/azure/costos')}
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span>💰 Reporte de Presupuesto</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Pipeline Activity Table */}
      <div className="azure-table-card">
        <div className="azure-table-header">
          <h3 className="azure-table-title">Canalizaciones & Actividad Reciente en Azure</h3>
          <button
            className="azure-action-btn-small"
            onClick={() => navigate('/admin/azure/pipelines')}
          >
            Ver Todas <ArrowRight size={13} />
          </button>
        </div>
        <table className="azure-admin-table">
          <thead>
            <tr>
              <th>Nombre de la Canalización</th>
              <th>Servicio Azure</th>
              <th>Estado</th>
              <th>Duración</th>
              <th>Ejecución</th>
            </tr>
          </thead>
          <tbody>
            {recentPipelines.map((p, i) => (
              <tr key={i}>
                <td>
                  <strong style={{ color: '#0078d4' }}>{p.name}</strong>
                </td>
                <td>{p.service}</td>
                <td>
                  <span className={`azure-status-pill ${p.status === 'Éxito' ? 'running' : 'updating'}`}>
                    ● {p.status}
                  </span>
                </td>
                <td>{p.duration}</td>
                <td style={{ color: '#64748b', fontSize: 12 }}>{p.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
