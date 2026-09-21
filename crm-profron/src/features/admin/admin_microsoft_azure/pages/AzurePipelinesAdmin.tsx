import { useState } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  RotateCw,
  Search,
  Activity,
  Layers,
} from 'lucide-react';
import '../azure_admin.css';

interface PipelineJob {
  id: string;
  name: string;
  source: string;
  target: string;
  lastRun: string;
  duration: string;
  status: 'Succeeded' | 'Running' | 'Failed' | 'Queued';
  recordsProcessed: number;
}

const initialPipelines: PipelineJob[] = [
  {
    id: 'pipe-1',
    name: 'pl_sync_telemetry_to_synapse',
    source: 'Azure Blob: raw-telemetry-data',
    target: 'Azure Synapse: dwh_telemetry',
    lastRun: '2026-09-21 01:25:00',
    duration: '4m 12s',
    status: 'Succeeded',
    recordsProcessed: 350000,
  },
  {
    id: 'pipe-2',
    name: 'pl_daily_aggregates_financial',
    source: 'PostgreSQL OLTP',
    target: 'Data Lake Gen2: analytics/parquet',
    lastRun: '2026-09-21 00:00:00',
    duration: '12m 45s',
    status: 'Succeeded',
    recordsProcessed: 1240000,
  },
  {
    id: 'pipe-3',
    name: 'pl_stream_iot_sensors_eventhub',
    source: 'Azure Event Hubs',
    target: 'Stream Analytics Job',
    lastRun: 'En ejecución continua',
    duration: 'En curso',
    status: 'Running',
    recordsProcessed: 8900140,
  },
  {
    id: 'pipe-4',
    name: 'pl_export_customer_churn_features',
    source: 'Azure Synapse Analytics',
    target: 'Machine Learning Feature Store',
    lastRun: '2026-09-20 23:15:00',
    duration: '1m 20s',
    status: 'Failed',
    recordsProcessed: 0,
  },
];

export default function AzurePipelinesAdmin() {
  const [pipelines, setPipelines] = useState<PipelineJob[]>(initialPipelines);
  const [searchTerm, setSearchTerm] = useState('');

  const runPipelineNow = (id: string) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'Running', lastRun: 'Iniciado hace unos segundos', duration: 'Ejecutando...' }
          : p
      )
    );

    setTimeout(() => {
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: 'Succeeded',
                duration: '3m 15s',
                lastRun: 'Hace 1 minuto',
                recordsProcessed: p.recordsProcessed + 15400,
              }
            : p
        )
      );
    }, 2500);
  };

  const filtered = pipelines.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Azure Data Factory & Pipelines ETL</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Monitoreo, orquestación y triggers de integración de datos en Azure Data Factory.
          </p>
        </div>
        <button
          className="azure-action-btn-small azure-action-btn-primary"
          onClick={() => {
            const newId = `pipe-${Date.now()}`;
            setPipelines((prev) => [
              ...prev,
              {
                id: newId,
                name: `pl_custom_sync_job_${prev.length + 1}`,
                source: 'Azure Blob Storage',
                target: 'Synapse Data Warehouse',
                lastRun: 'Sin ejecutar aún',
                duration: '-',
                status: 'Queued',
                recordsProcessed: 0,
              },
            ]);
          }}
        >
          <GitBranch size={14} /> Nuevo Pipeline ETL
        </button>
      </div>

      {/* KPI Cards */}
      <div className="azure-kpi-grid">
        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Pipelines Totales</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#0078d4' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">{pipelines.length}</div>
          <div className="azure-kpi-delta positive">
            <Activity size={12} /> 100% de triggers programados
          </div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Ejecuciones Exitosas (24h)</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">98.4%</div>
          <div className="azure-kpi-delta positive">
            <Clock size={12} /> Promedio de respuesta: 4.2 min
          </div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Registros Procesados Hoy</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <RotateCw size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">
            {pipelines.reduce((acc, p) => acc + p.recordsProcessed, 0).toLocaleString()}
          </div>
          <div className="azure-kpi-delta positive">Flujo de datos activo</div>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div className="topbar-search" style={{ minWidth: 280 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar pipeline por nombre, origen o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Pipeline Runs Table */}
      <div className="azure-table-card">
        <div className="azure-table-header">
          <h3 className="azure-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitBranch size={18} color="#0078d4" />
            Pipelines Orquestados ({filtered.length})
          </h3>
        </div>

        <table className="azure-admin-table">
          <thead>
            <tr>
              <th>Nombre del Pipeline</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Última Ejecución</th>
              <th>Duración</th>
              <th>Filas Procesadas</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Trigger Manual</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong style={{ color: '#0078d4', fontFamily: 'monospace' }}>{p.name}</strong>
                </td>
                <td style={{ fontSize: 12 }}>{p.source}</td>
                <td style={{ fontSize: 12 }}>{p.target}</td>
                <td style={{ fontSize: 12, color: '#64748b' }}>{p.lastRun}</td>
                <td>
                  <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{p.duration}</span>
                </td>
                <td>
                  <strong>{p.recordsProcessed.toLocaleString()}</strong>
                </td>
                <td>
                  <span
                    className={`azure-status-pill ${
                      p.status === 'Succeeded'
                        ? 'running'
                        : p.status === 'Running'
                        ? 'updating'
                        : p.status === 'Failed'
                        ? 'stopped'
                        : 'updating'
                    }`}
                  >
                    ● {p.status === 'Succeeded' ? 'Exitoso' : p.status === 'Running' ? 'En ejecución' : p.status === 'Failed' ? 'Fallido' : 'En cola'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="azure-action-btn-small azure-action-btn-primary"
                    onClick={() => runPipelineNow(p.id)}
                    disabled={p.status === 'Running'}
                    title="Ejecutar trigger ahora"
                  >
                    {p.status === 'Running' ? <RotateCw size={12} className="spin" /> : <Play size={12} />} Ejecutar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
