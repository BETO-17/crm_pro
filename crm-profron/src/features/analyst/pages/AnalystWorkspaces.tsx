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
  title: 'Análisis de Ventas Q3 - Región Norte',
  modifiedAgo: 'Modificado hace 2 horas',
  files: ['ventas_q3.csv', 'objetivos.xlsx'],
  status: 'En progreso' as const,
};

const allWorkspaces: WorkspaceItem[] = [
  {
    id: 'ws-1',
    title: 'Comparativa Competencia',
    description: 'Análisis de precios y stock frente al principal competidor en el sector Retail.',
    files: ['precios_compA.csv', 'stock_interno.csv'],
    modifiedLabel: 'Modificado:',
    modifiedDate: 'Ayer',
    status: 'Completo',
    statusColor: '#22c55e',
  },
  {
    id: 'ws-2',
    title: 'Proyección Q4',
    description: 'Modelado predictivo para la campaña de fin de año basad en histórico.',
    files: ['hist_2022_2023.parquet'],
    modifiedLabel: 'Modificado:',
    modifiedDate: '12 Oct',
    status: 'En progreso',
    statusColor: '#f59e0b',
  },
  {
    id: 'ws-3',
    title: 'Análisis Churn...',
    description: 'Identificación de patrones de abandono en clientes suscritos.',
    files: ['usuarios_act.csv', 'bajas_ytd.csv'],
    modifiedLabel: 'Modificado:',
    modifiedDate: '05 Oct',
    status: 'Completo',
    statusColor: '#22c55e',
  },
  {
    id: 'ws-4',
    title: 'Market Basket Analysis',
    description: 'Análisis de asociación de productos para optimizar cross-sell.',
    files: ['transactions_2023.csv'],
    modifiedLabel: 'Modificado:',
    modifiedDate: '01 Oct',
    status: 'Completo',
    statusColor: '#22c55e',
  },
  {
    id: 'ws-5',
    title: 'Segmentación RFM',
    description: 'Segmentación de clientes por Recencia, Frecuencia y Monto.',
    files: ['clientes_rfm.xlsx', 'pedidos_2023.csv'],
    modifiedLabel: 'Modificado:',
    modifiedDate: '28 Sep',
    status: 'En progreso',
    statusColor: '#f59e0b',
  },
  {
    id: 'ws-6',
    title: 'KPIs Regionales',
    description: 'Dashboard de KPIs por región para el reporte trimestral.',
    files: ['kpis_regional.xlsx'],
    modifiedLabel: 'Modificado:',
    modifiedDate: '22 Sep',
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
