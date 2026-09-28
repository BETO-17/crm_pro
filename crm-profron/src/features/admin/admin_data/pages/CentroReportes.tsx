import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Eye,
  Download,
  BarChart3,
  CheckCircle,
  X,
  Search,
  FileText,
} from 'lucide-react';
import type { ReportCategory, ExportFormat } from '../../../../core/types';

interface TrendMetric {
  label: string;
  value: string;
  direction: 'up' | 'down';
}

interface ReportItem {
  id: string;
  title: string;
  category: ReportCategory;
  categoryColor: string;
  period: string;
  description: string;
  exportFormat: ExportFormat;
  views: number;
  downloads: number;
}

const trendMetrics: TrendMetric[] = [
  { label: 'RETAIL CORE', value: '+4.2%', direction: 'up' },
  { label: 'SUPPLY CHAIN', value: '-1.8%', direction: 'down' },
  { label: 'TECH OPS', value: '+0.1%', direction: 'up' },
  { label: 'E-COMMERCE', value: '+8.7%', direction: 'up' },
];

const allReports: ReportItem[] = [
  {
    id: '1',
    title: 'Reporte Anual Retail 2023',
    category: 'RETAIL CORE',
    categoryColor: '#ef4444',
    period: 'Anual · 2023',
    description: 'Análisis consolidado de rendimiento de tiendas físicas vs. metas anuales, márgenes operativos y eficiencia de piso.',
    exportFormat: 'PDF',
    views: 342,
    downloads: 89,
  },
  {
    id: '2',
    title: 'Eficiencia de Sistemas Q1',
    category: 'TECH OPS',
    categoryColor: '#3b82f6',
    period: 'Trimestral · Q1 2024',
    description: 'Métricas de uptime, adopción de nuevas herramientas POS y costos de infraestructura en la nube.',
    exportFormat: 'CSV',
    views: 156,
    downloads: 45,
  },
  {
    id: '3',
    title: 'Cadena de Suministro: Marzo',
    category: 'LOGISTICS',
    categoryColor: '#f59e0b',
    period: 'Mensual · Mar 2024',
    description: 'Evaluación de tiempos de entrega, cuellos de botella en centros de distribución y costos de flete de última milla.',
    exportFormat: 'Excel',
    views: 98,
    downloads: 32,
  },
  {
    id: '4',
    title: 'Ventas E-Commerce Q2',
    category: 'E-COMMERCE',
    categoryColor: '#22c55e',
    period: 'Trimestral · Q2 2024',
    description: 'Análisis de conversión, tráfico orgánico vs. pagado, ticket promedio y abandono de carrito.',
    exportFormat: 'PDF',
    views: 210,
    downloads: 67,
  },
  {
    id: '5',
    title: 'Inventario Regional Norte',
    category: 'SUPPLY CHAIN',
    categoryColor: '#8b5cf6',
    period: 'Mensual · Abr 2024',
    description: 'Estado de inventario en las 12 tiendas de la región norte, rotación de productos y reabastecimiento.',
    exportFormat: 'Excel',
    views: 75,
    downloads: 21,
  },
  {
    id: '6',
    title: 'Performance POS Systems',
    category: 'TECH OPS',
    categoryColor: '#3b82f6',
    period: 'Mensual · May 2024',
    description: 'Latencia de terminales, transacciones por minuto, fallos por sucursal y plan de actualización.',
    exportFormat: 'CSV',
    views: 45,
    downloads: 12,
  },
];

const categoryOptions: ReportCategory[] = ['RETAIL CORE', 'TECH OPS', 'LOGISTICS', 'E-COMMERCE', 'SUPPLY CHAIN'];

export default function CentroReportes() {
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState(allReports);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (report: ReportItem) => {
    setReports((prev) =>
      prev.map((r) => r.id === report.id ? { ...r, downloads: r.downloads + 1 } : r)
    );
    showToast(`Descargando "${report.title}" como ${report.exportFormat}...`);
  };

  const handleView = (report: ReportItem) => {
    setReports((prev) =>
      prev.map((r) => r.id === report.id ? { ...r, views: r.views + 1 } : r)
    );
    setViewingReport(viewingReport === report.id ? null : report.id);
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterPeriod('');
    setSearchTerm('');
  };

  const filteredReports = reports.filter((r) => {
    const matchCategory = !filterCategory || r.category === filterCategory;
    const matchPeriod = !filterPeriod || r.period.toLowerCase().includes(filterPeriod.toLowerCase());
    const matchSearch = !searchTerm || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchPeriod && matchSearch;
  });

  const hasFilters = filterCategory || filterPeriod || searchTerm;

  return (
    <>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <CheckCircle size={16} aria-hidden="true" />
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Report Detail Modal */}
      {viewingReport && (
        <div className="modal-overlay" onClick={() => setViewingReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{reports.find((r) => r.id === viewingReport)?.title}</h3>
              <button className="modal-close" onClick={() => setViewingReport(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{reports.find((r) => r.id === viewingReport)?.description}</p>
              <div className="modal-stats">
                <div className="modal-stat">
                  <Eye size={14} />
                  <span>{reports.find((r) => r.id === viewingReport)?.views} vistas</span>
                </div>
                <div className="modal-stat">
                  <Download size={14} />
                  <span>{reports.find((r) => r.id === viewingReport)?.downloads} descargas</span>
                </div>
              </div>
              <div className="modal-preview">
                <div className="mock-chart">
                  <div className="mock-chart-bar" style={{ height: '60%', background: '#4f8cff' }} />
                  <div className="mock-chart-bar" style={{ height: '85%', background: '#22c55e' }} />
                  <div className="mock-chart-bar" style={{ height: '45%', background: '#f59e0b' }} />
                  <div className="mock-chart-bar" style={{ height: '70%', background: '#a855f7' }} />
                  <div className="mock-chart-bar" style={{ height: '55%', background: '#ef4444' }} />
                  <div className="mock-chart-bar" style={{ height: '90%', background: '#06b6d4' }} />
                </div>
                <p className="mock-chart-label">Vista previa de datos — Q3 2024</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="page-title">Centro de Reportes Ejecutivos</h1>
      <p className="page-subtitle">
        Análisis exhaustivo y documentación estratégica por sector.
      </p>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-chip">
          <span className="stat-chip-number">{reports.length}</span>
          <span className="stat-chip-label">Reportes totales</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{reports.reduce((a, r) => a + r.views, 0)}</span>
          <span className="stat-chip-label">Vistas totales</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{reports.reduce((a, r) => a + r.downloads, 0)}</span>
          <span className="stat-chip-label">Descargas totales</span>
        </div>
      </div>

      {/* ---- Trends Bar ---- */}
      <div className="trends-bar">
        <div className="trends-bar-header">
          <span className="trends-bar-title">
            <BarChart3 size={16} aria-hidden="true" />
            Barra de Tendencias Interactiva
          </span>
          <span className="trends-bar-updated">Actualizado: Hoy, 08:38 AM</span>
        </div>

        <div className="trends-metrics">
          {trendMetrics.map((metric) => (
            <div key={metric.label} className="trend-metric-card">
              <span className="trend-metric-label">{metric.label}</span>
              <div className="trend-metric-value">
                <span className="trend-metric-number">{metric.value}</span>
                <span className={`trend-metric-arrow ${metric.direction}`}>
                  {metric.direction === 'up' ? (
                    <TrendingUp size={16} aria-hidden="true" />
                  ) : (
                    <TrendingDown size={16} aria-hidden="true" />
                  )}
                </span>
              </div>
              <svg className="trend-sparkline" viewBox="0 0 60 24" aria-hidden="true">
                {metric.direction === 'up' ? (
                  <polyline
                    points="0,20 10,18 20,15 30,16 40,10 50,8 60,4"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <polyline
                    points="0,4 10,8 20,6 30,12 40,14 50,18 60,20"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Filters ---- */}
      <div className="filters-bar">
        <SlidersHorizontal size={16} className="filter-icon" aria-hidden="true" />
        <select
          className="filter-select"
          aria-label="Filtrar por rubro"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Rubro: Todos</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          className="filter-select"
          aria-label="Filtrar por temporalidad"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
        >
          <option value="">Temporalidad: Todas</option>
          <option value="anual">Anual</option>
          <option value="trimestral">Trimestral</option>
          <option value="mensual">Mensual</option>
        </select>
        <div className="filter-search-inline">
          <Search size={14} aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar reporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar reporte"
          />
        </div>
        {hasFilters && (
          <button className="filter-clear" onClick={clearFilters}>
            Limpiar Filtros
          </button>
        )}
        <span className="filter-count">{filteredReports.length} de {reports.length}</span>
      </div>

      {/* ---- Report Cards ---- */}
      <h2 className="reports-section-title">Organizador de Reportes</h2>
      <div className="reports-grid">
        {filteredReports.map((report) => (
          <article key={report.id} className="report-card">
            <div className="report-card-header">
              <span
                className="report-category-badge"
                style={{ background: report.categoryColor }}
              >
                {report.category}
              </span>
              <span className="report-period">{report.period}</span>
            </div>
            <h3 className="report-title">{report.title}</h3>
            <p className="report-desc">{report.description}</p>
            <div className="report-stats-inline">
              <span><Eye size={12} /> {report.views}</span>
              <span><Download size={12} /> {report.downloads}</span>
            </div>
            <div className="report-actions">
              <button className="report-btn report-btn-view" onClick={() => handleView(report)}>
                <Eye size={14} aria-hidden="true" />
                Ver
              </button>
              <button className="report-btn report-btn-export" onClick={() => handleExport(report)}>
                <Download size={14} aria-hidden="true" />
                {report.exportFormat}
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <FileText size={40} />
          <p>No se encontraron reportes con los filtros seleccionados.</p>
          <button className="filter-clear" onClick={clearFilters} style={{ marginTop: 8 }}>
            Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
