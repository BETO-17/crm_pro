import { useState } from 'react';
import {
  Plus,
  BarChart3,
  MoreVertical,
  ArrowRight,
} from 'lucide-react';

/* ---- Simulated Workspace Data ---- */
interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  files: string[];
  modifiedLabel: string;
  modifiedDate: string;
  status: 'Completo' | 'En progreso';
  statusColor: string;
}

const featuredWorkspace = {
  id: 'ws-featured',
  title: 'Ventas Tecnología y Rendimiento Q3',
  modifiedAgo: 'Modificado hace 10 minutos',
  files: ['ventas_tecnologia_limpio.csv', 'dataset_ventas_tecnologia_limpio'],
  status: 'Completo' as const,
};

const allWorkspaces: WorkspaceItem[] = [
  {
    id: 'ws-1',
    title: 'Análisis Retail & Tiendas Tech',
    description: 'Exploración de ventas y comportamiento de productos con 4,000 registros procesados.',
    files: ['ventas_tienda_tech_4000.csv', 'dataset_ventas_tienda_tech_4000'],
    modifiedLabel: 'Modificado:',
    modifiedDate: 'Hoy',
    status: 'Completo',
    statusColor: '#22c55e',
  },
  {
    id: 'ws-2',
    title: 'Precios & Métricas Inmobiliarias',
    description: 'Dataset de California Housing con 20,640 registros importados a Supabase.',
    files: ['fetch_california_housing.csv', 'dataset_fetch_california_housing'],
    modifiedLabel: 'Modificado:',
    modifiedDate: 'Hoy',
    status: 'Completo',
    statusColor: '#22c55e',
  },
  {
    id: 'ws-3',
    title: 'Tendencias Tecnología Limpio',
    description: 'Análisis de tickets de venta tecnológica depurado y conectado al asistente AI.',
    files: ['ventas_tecnologia_limpio.csv', 'dataset_ventas_tecnologia_limpio'],
    modifiedLabel: 'Modificado:',
    modifiedDate: 'Hoy',
    status: 'Completo',
    statusColor: '#22c55e',
  },
  {
    id: 'ws-4',
    title: 'Modelo Predictivo de Clientes',
    description: 'Dataset de entrenamiento con validación de churn y perfiles de compra.',
    files: ['train.csv', 'dataset_train'],
    modifiedLabel: 'Modificado:',
    modifiedDate: 'Ayer',
    status: 'Completo',
    statusColor: '#22c55e',
  },
  {
    id: 'ws-5',
    title: 'Segmentación de Ventas por Canal',
    description: 'Cruce multivariable de ventas retail y ticket promedio por sucursal.',
    files: ['ventas_tienda_tech_4000.csv'],
    modifiedLabel: 'Modificado:',
    modifiedDate: 'Ayer',
    status: 'En progreso',
    statusColor: '#f59e0b',
  },
  {
    id: 'ws-6',
    title: 'Auditoría y Calidad de Datos',
    description: 'Validación de nulos y tipos de datos en esquemas dinámicos de Supabase.',
    files: ['ventas_tecnologia_limpio.csv'],
    modifiedLabel: 'Modificado:',
    modifiedDate: '2 días',
    status: 'Completo',
    statusColor: '#22c55e',
  },
];

const sectorFilters = ['Retail', 'Tecnología', 'Finanzas'];
const dateOptions = ['Últimos 7 días', 'Últimos 30 días', 'Este trimestre', 'Todo'];

export default function AnalystWorkspaces() {
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set(['Retail']));
  const [dateRange, setDateRange] = useState('Últimos 7 días');

  const toggleSector = (s: string) => {
    setSelectedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 className="page-title">Mis Workspaces de Análisis</h1>
          <p className="page-subtitle">Retoma tus análisis guardados o crea uno nuevo.</p>
        </div>
        <button className="btn-save-view">
          <Plus size={14} /> Nuevo Workspace
        </button>
      </div>

      <div className="aws-layout">
        {/* Filters */}
        <div className="aws-filters">
          <h3 className="aws-filters-title">Filtros</h3>

          <div className="aws-filter-group">
            <span className="aws-filter-label">Sector</span>
            {sectorFilters.map((s) => (
              <label key={s} className="aws-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedSectors.has(s)}
                  onChange={() => toggleSector(s)}
                />
                {s}
              </label>
            ))}
          </div>

          <div className="aws-filter-group">
            <span className="aws-filter-label">Fecha</span>
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: '100%', fontSize: 13 }}
            >
              {dateOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="aws-main">
          {/* Featured / Recent */}
          <div className="aws-featured">
            <h3 className="aws-featured-header">Análisis Reciente</h3>
            <div className="aws-featured-card">
              <div className="aws-featured-icon">
                <BarChart3 size={24} />
              </div>
              <div className="aws-featured-info">
                <div className="aws-featured-title">{featuredWorkspace.title}</div>
                <div className="aws-featured-meta">{featuredWorkspace.modifiedAgo}</div>
                <div className="aws-featured-files">
                  {featuredWorkspace.files.map((f) => (
                    <span key={f} className="aws-file-chip">{f}</span>
                  ))}
                </div>
              </div>
              <div className="aws-featured-action">
                <span className="file-status file-status-validating" style={{ animation: 'none', background: '#fef3c7', color: '#92400e', fontSize: 11 }}>
                  {featuredWorkspace.status}
                </span>
                <button className="btn-continue">
                  Continuar Análisis <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* All Workspaces */}
          <div>
            <h3 className="aws-all-title">Todos los Workspaces</h3>
            <div className="aws-grid">
              {allWorkspaces.map((ws) => (
                <div key={ws.id} className="aws-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div className="aws-card-icon">
                      <BarChart3 size={18} />
                    </div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 2 }}>
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  <div className="aws-card-title">{ws.title}</div>
                  <div className="aws-card-desc">{ws.description}</div>
                  <div className="aws-card-files">
                    {ws.files.map((f) => (
                      <span key={f} className="aws-card-file">{f}</span>
                    ))}
                  </div>
                  <div className="aws-card-footer">
                    <span className="aws-card-date">{ws.modifiedLabel} {ws.modifiedDate}</span>
                    <span
                      className="file-status"
                      style={{
                        background: ws.status === 'Completo' ? '#d1fae5' : '#fef3c7',
                        color: ws.status === 'Completo' ? '#065f46' : '#92400e',
                        fontSize: 11,
                      }}
                    >
                      {ws.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
