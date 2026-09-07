import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  PieChart,
  BarChart3,
  Download,
  Eye,
  Share2,
  ChevronDown,
  Search,
  CheckCircle,
  X,
} from 'lucide-react';

interface Informe {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  iconBg: string;
  icon: 'file' | 'trend' | 'pie' | 'bar';
}

const informesData: Informe[] = [
  {
    id: '1',
    title: 'Reporte de Ventas Q3 2023',
    date: 'Generado: 15 Oct, 2023',
    description: 'Análisis completo de ventas del tercer trimestre incluyendo métricas por región, categoría y canal de distribución.',
    tags: ['RETAIL', 'TRIMESTRAL', 'VENTAS'],
    iconBg: 'linear-gradient(135deg, #4f8cff, #6366f1)',
    icon: 'trend',
  },
  {
    id: '2',
    title: 'Análisis de Inventario Regional',
    date: 'Generado: 02 Oct, 2023',
    description: 'Estado del inventario por región con alertas de stock bajo, rotación de productos y proyecciones de demanda.',
    tags: ['LOGÍSTICA', 'INVENTARIO', 'MENSUAL'],
    iconBg: 'linear-gradient(135deg, #22c55e, #16a34a)',
    icon: 'bar',
  },
  {
    id: '3',
    title: 'Comparativa de Precios vs Competencia',
    date: 'Generado: 28 Sep, 2023',
    description: 'Benchmark de precios contra los 3 principales competidores del sector con análisis de elasticidad y margen.',
    tags: ['RETAIL', 'PRICING', 'COMPETENCIA'],
    iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: 'pie',
  },
  {
    id: '4',
    title: 'KPIs Dashboard Ejecutivo',
    date: 'Generado: 15 Sep, 2023',
    description: 'Resumen ejecutivo con los KPIs clave del negocio: revenue, CAC, LTV, NPS, y métricas operacionales.',
    tags: ['EJECUTIVO', 'KPI', 'MENSUAL'],
    iconBg: 'linear-gradient(135deg, #ec4899, #db2777)',
    icon: 'file',
  },
  {
    id: '5',
    title: 'Segmentación de Clientes RFM',
    date: 'Generado: 01 Sep, 2023',
    description: 'Análisis de segmentación por Recencia, Frecuencia y Monto con recomendaciones de campañas personalizadas.',
    tags: ['CLIENTES', 'SEGMENTACIÓN', 'ANALÍTICA'],
    iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    icon: 'pie',
  },
  {
    id: '6',
    title: 'Forecast de Ventas Q4 2023',
    date: 'Generado: 25 Aug, 2023',
    description: 'Modelo predictivo de ventas para el cuarto trimestre con escenarios optimista, base y conservador.',
    tags: ['FORECAST', 'MODELADO', 'TRIMESTRAL'],
    iconBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    icon: 'trend',
  },
];

const availableTags = ['TODOS', 'RETAIL', 'LOGÍSTICA', 'PRICING', 'EJECUTIVO', 'CLIENTES', 'FORECAST'];

const iconMap = {
  file: FileText,
  trend: TrendingUp,
  pie: PieChart,
  bar: BarChart3,
};

export default function Informes() {
  const [informes] = useState<Informe[]>(informesData);
  const [selectedTag, setSelectedTag] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [viewingInforme, setViewingInforme] = useState<Informe | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownload = (inf: Informe) => {
    setOpenDropdownId(null);
    showToast(`Descargando "${inf.title}" en formato PDF... ✓`);
  };

  const handleShare = (inf: Informe) => {
    setOpenDropdownId(null);
    showToast(`Enlace de acceso a "${inf.title}" copiado al portapapeles ✓`);
  };

  const filteredInformes = informes.filter((inf) => {
    const matchTag =
      selectedTag === 'TODOS' ||
      inf.tags.some((t) => t.toUpperCase() === selectedTag.toUpperCase());
    const matchSearch =
      !searchQuery.trim() ||
      inf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="analyst-informes-page" onClick={() => setOpenDropdownId(null)}>
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

      {/* View Detail Modal */}
      {viewingInforme && (
        <div className="modal-overlay" onClick={() => setViewingInforme(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{viewingInforme.title}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{viewingInforme.date}</span>
              </div>
              <button className="modal-close" onClick={() => setViewingInforme(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{viewingInforme.description}</p>

              <div className="informe-tags" style={{ margin: '14px 0' }}>
                {viewingInforme.tags.map((tag) => (
                  <span key={tag} className="informe-tag">{tag}</span>
                ))}
              </div>

              <div className="modal-preview">
                <div className="mock-chart">
                  <div className="mock-chart-bar" style={{ height: '65%', background: '#4f8cff' }} />
                  <div className="mock-chart-bar" style={{ height: '85%', background: '#22c55e' }} />
                  <div className="mock-chart-bar" style={{ height: '45%', background: '#f59e0b' }} />
                  <div className="mock-chart-bar" style={{ height: '75%', background: '#8b5cf6' }} />
                </div>
                <p className="mock-chart-label">Vista consolidada del informe</p>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleShare(viewingInforme)}
                >
                  <Share2 size={13} /> Compartir
                </button>
                <button
                  className="btn-primary"
                  onClick={() => { handleDownload(viewingInforme); setViewingInforme(null); }}
                >
                  <Download size={13} /> Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <h1 className="page-title">Biblioteca de Informes y Reportes</h1>
      <p className="page-subtitle">
        Consulta, visualiza, descarga y comparte los informes generados a partir de tus análisis de datos.
      </p>

      {/* Top Search and Tag Filters Bar */}
      <div className="informes-filter-bar" style={{ marginTop: 20 }}>
        <div className="table-search-inline" style={{ minWidth: 280 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar por nombre o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tag Filter Chips */}
        <div className="informes-tag-chips">
          {availableTags.map((tag) => (
            <button
              key={tag}
              className={`informe-filter-chip ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Informes Grid */}
      <div className="informes-grid" style={{ marginTop: 20 }}>
        {filteredInformes.map((inf) => {
          const Icon = iconMap[inf.icon];
          const isDropdownOpen = openDropdownId === inf.id;

          return (
            <div key={inf.id} className="informe-card">
              <div className="informe-card-header">
                <div className="informe-icon" style={{ background: inf.iconBg }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="informe-title">{inf.title}</div>
                  <div className="informe-date">{inf.date}</div>
                </div>
              </div>

              <p className="informe-desc">{inf.description}</p>

              <div className="informe-tags">
                {inf.tags.map((tag) => (
                  <span key={tag} className="informe-tag">{tag}</span>
                ))}
              </div>

              {/* Reduced button clutter: Clean "Ver" + Compact "Opciones ▾" Dropdown */}
              <div className="informe-actions-compact">
                <button
                  className="btn-informe-view"
                  onClick={() => setViewingInforme(inf)}
                  title="Ver detalle del informe"
                >
                  <Eye size={13} /> Ver
                </button>

                <div
                  className="informe-dropdown-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn-informe-options"
                    onClick={() => setOpenDropdownId(isDropdownOpen ? null : inf.id)}
                    aria-expanded={isDropdownOpen}
                    title="Más opciones de reporte"
                  >
                    Opciones <ChevronDown size={12} />
                  </button>

                  {isDropdownOpen && (
                    <div className="informe-dropdown-menu">
                      <button
                        className="informe-dropdown-item"
                        onClick={() => handleDownload(inf)}
                      >
                        <Download size={13} style={{ color: '#22c55e' }} />
                        Descargar PDF
                      </button>
                      <button
                        className="informe-dropdown-item"
                        onClick={() => handleShare(inf)}
                      >
                        <Share2 size={13} style={{ color: '#4f8cff' }} />
                        Compartir Enlace
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInformes.length === 0 && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <FileText size={36} />
          <p>No se encontraron informes con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
