import { useState } from 'react';
import {
  Plus,
  BarChart3,
  ArrowRight,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  CheckCircle,
  X,
  Clock,
} from 'lucide-react';

/* ---- Workspace Item Model ---- */
interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  files: string[];
  sector: string;
  modifiedDate: string;
  status: 'Completo' | 'En progreso';
}

const allWorkspaces: WorkspaceItem[] = [
  {
    id: 'ws-featured',
    title: 'Análisis de Ventas Q3 - Región Norte',
    description: 'Consolidación de transacciones y metas de piso de venta para tiendas del norte.',
    files: ['ventas_q3.csv', 'objetivos.xlsx'],
    sector: 'Retail',
    modifiedDate: 'Hace 2 horas',
    status: 'En progreso',
  },
  {
    id: 'ws-1',
    title: 'Comparativa de Precios vs. Competencia',
    description: 'Análisis de elasticidad y descuentos frente al principal competidor en Retail.',
    files: ['precios_compA.csv', 'stock_interno.csv'],
    sector: 'Retail',
    modifiedDate: 'Ayer',
    status: 'Completo',
  },
  {
    id: 'ws-2',
    title: 'Proyección de Demanda Q4',
    description: 'Modelado predictivo estacional para la campaña de fin de año basado en histórico.',
    files: ['hist_2022_2023.parquet', 'demanda_estimada.xlsx'],
    sector: 'Tecnología',
    modifiedDate: '12 Oct',
    status: 'En progreso',
  },
  {
    id: 'ws-3',
    title: 'Análisis de Churn y Retención',
    description: 'Identificación de patrones de abandono en cuentas suscritas y comportamiento.',
    files: ['usuarios_act.csv', 'bajas_ytd.csv'],
    sector: 'Finanzas',
    modifiedDate: '05 Oct',
    status: 'Completo',
  },
  {
    id: 'ws-4',
    title: 'Market Basket & Cross-Selling',
    description: 'Reglas de asociación de productos para optimizar ventas cruzadas en POS.',
    files: ['transactions_2023.csv'],
    sector: 'Retail',
    modifiedDate: '01 Oct',
    status: 'Completo',
  },
  {
    id: 'ws-5',
    title: 'Segmentación de Clientes RFM',
    description: 'Clasificación de base de clientes por Recencia, Frecuencia y Valor Monetario.',
    files: ['clientes_rfm.xlsx', 'pedidos_2023.csv'],
    sector: 'Retail',
    modifiedDate: '28 Sep',
    status: 'En progreso',
  },
  {
    id: 'ws-6',
    title: 'KPIs Regionales de Logística',
    description: 'Dashboard de tiempos de entrega y rotación de stock por centro de distribución.',
    files: ['kpis_regional.xlsx'],
    sector: 'Logística',
    modifiedDate: '22 Sep',
    status: 'Completo',
  },
];

const sectorOptions = ['Todos', 'Retail', 'Tecnología', 'Finanzas', 'Logística'];
const dateOptions = ['Cualquier Fecha', 'Últimos 7 días', 'Últimos 30 días', 'Este trimestre'];

interface AnalystWorkspacesProps {
  onNavigate?: (view: string) => void;
}

export default function AnalystWorkspaces({ onNavigate }: AnalystWorkspacesProps) {
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState('Cualquier Fecha');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenWorkspace = (ws: WorkspaceItem) => {
    showToast(`Abriendo workspace "${ws.title}" en el visor de datos...`, 'info');
    if (onNavigate) {
      onNavigate('observacion');
    }
  };

  const handleNewWorkspace = () => {
    showToast('Creando nuevo espacio de trabajo analítico...', 'info');
  };

  const filteredWorkspaces = allWorkspaces.filter((ws) => {
    const matchSector = selectedSector === 'Todos' || ws.sector === selectedSector;
    const matchSearch =
      !searchQuery.trim() ||
      ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSector && matchSearch;
  });

  return (
    <div className="analyst-workspaces-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <CheckCircle size={16} aria-hidden="true" />
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="page-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Mis Workspaces de Análisis</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Accede a tus proyectos, tableros colaborativos y retoma análisis de datasets guardados.
          </p>
        </div>

        <button className="btn-primary" onClick={handleNewWorkspace}>
          <Plus size={16} /> Nuevo Workspace
        </button>
      </div>

      {/* Horizontal Top Toolbar for Filters (Full Width Grid) */}
      <div className="workspaces-top-filter-bar" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Sector:
            </span>
            <select
              className="form-select"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{ minWidth: 140, fontSize: 13 }}
            >
              {sectorOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Período:
            </span>
            <select
              className="form-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ minWidth: 150, fontSize: 13 }}
            >
              {dateOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="table-search-inline" style={{ minWidth: 260 }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar workspace o dataset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {filteredWorkspaces.length} de {allWorkspaces.length} proyectos
        </span>
      </div>

      {/* Featured Card (Top banner) */}
      <div
        className="ws-featured-banner"
        onClick={() => handleOpenWorkspace(allWorkspaces[0])}
        role="button"
        tabIndex={0}
      >
        <div className="ws-featured-icon">
          <BarChart3 size={24} />
        </div>
        <div className="ws-featured-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-active" style={{ fontSize: 11 }}>
              Proyecto Reciente
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {allWorkspaces[0].modifiedDate}
            </span>
          </div>
          <h3 className="ws-featured-title">{allWorkspaces[0].title}</h3>
          <p className="ws-featured-desc">{allWorkspaces[0].description}</p>
          <div className="ws-files-row">
            {allWorkspaces[0].files.map((f) => (
              <span key={f} className="ws-file-chip">
                <FileSpreadsheet size={12} /> {f}
              </span>
            ))}
          </div>
        </div>
        <div className="ws-featured-action-wrapper">
          <button className="btn-continue-ws" onClick={(e) => { e.stopPropagation(); handleOpenWorkspace(allWorkspaces[0]); }}>
            Abrir Workspace <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Full-Width Grid of Workspace Cards */}
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 16px', color: 'var(--text-primary)' }}>
        Todos los Proyectos
      </h2>

      <div className="workspaces-grid-full">
        {filteredWorkspaces.map((ws) => (
          <div
            key={ws.id}
            className="workspace-card-item"
            onClick={() => handleOpenWorkspace(ws)}
            role="button"
            tabIndex={0}
          >
            <div className="ws-card-header">
              <div className="ws-card-icon-wrapper">
                <Layers size={18} />
              </div>
              <span
                className="badge"
                style={{
                  background: ws.status === 'Completo' ? '#dcfce7' : '#fef3c7',
                  color: ws.status === 'Completo' ? '#15803d' : '#b45309',
                  fontSize: 11,
                }}
              >
                {ws.status}
              </span>
            </div>

            <h3 className="ws-card-title">{ws.title}</h3>
            <p className="ws-card-description">{ws.description}</p>

            <div className="ws-card-files">
              {ws.files.map((file) => (
                <span key={file} className="ws-file-chip-small">
                  <FileSpreadsheet size={11} /> {file}
                </span>
              ))}
            </div>

            <div className="ws-card-footer">
              <span className="ws-card-meta">
                <span className="ws-sector-tag">{ws.sector}</span> • {ws.modifiedDate}
              </span>
              <button
                className="ws-open-btn-icon"
                title={`Abrir ${ws.title}`}
                aria-label={`Abrir ${ws.title}`}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkspaces.length === 0 && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <Layers size={36} />
          <p>No se encontraron workspaces con los filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
