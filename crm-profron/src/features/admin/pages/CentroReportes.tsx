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
  Plus,
  ChevronDown,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';
import type { ReportCategory, ExportFormat } from '../../../types';

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
  availableFormats: ExportFormat[];
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
    availableFormats: ['PDF', 'CSV', 'Excel'],
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
    availableFormats: ['PDF', 'CSV', 'Excel'],
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
    availableFormats: ['PDF', 'CSV', 'Excel'],
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
    availableFormats: ['PDF', 'CSV', 'Excel'],
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
    availableFormats: ['PDF', 'CSV', 'Excel'],
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
    availableFormats: ['PDF', 'CSV', 'Excel'],
    views: 45,
    downloads: 12,
  },
];

const categoryOptions: ReportCategory[] = ['RETAIL CORE', 'TECH OPS', 'LOGISTICS', 'E-COMMERCE', 'SUPPLY CHAIN'];

export default function CentroReportes() {
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<ReportItem[]>(allReports);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [viewingReport, setViewingReport] = useState<ReportItem | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newReportForm, setNewReportForm] = useState({
    title: '',
    category: 'RETAIL CORE' as ReportCategory,
    period: 'Trimestral · Q3 2024',
    description: '',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (report: ReportItem, format: ExportFormat) => {
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, downloads: r.downloads + 1 } : r))
    );
    setOpenDropdownId(null);
    showToast(`Descargando "${report.title}" en formato ${format}... ✓`);
  };

  const handleExportAll = () => {
    showToast(`Exportando todos los ${filteredReports.length} reportes filtrados en archivo ZIP... ✓`);
  };

  const handleView = (report: ReportItem) => {
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, views: r.views + 1 } : r))
    );
    setViewingReport(report);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportForm.title.trim()) {
      showToast('Por favor introduce el título del reporte', 'info');
      return;
    }

    const colors: Record<ReportCategory, string> = {
      'RETAIL CORE': '#ef4444',
      'TECH OPS': '#3b82f6',
      'LOGISTICS': '#f59e0b',
      'E-COMMERCE': '#22c55e',
      'SUPPLY CHAIN': '#8b5cf6',
    };

    const newReport: ReportItem = {
      id: Date.now().toString(),
      title: newReportForm.title.trim(),
      category: newReportForm.category,
      categoryColor: colors[newReportForm.category] || '#4f8cff',
      period: newReportForm.period,
      description: newReportForm.description.trim() || 'Reporte ejecutivo generado automáticamente con métricas consolidadas.',
      availableFormats: ['PDF', 'CSV', 'Excel'],
      views: 1,
      downloads: 0,
    };

    setReports((prev) => [newReport, ...prev]);
    setIsGenerateModalOpen(false);
    setNewReportForm({ title: '', category: 'RETAIL CORE', period: 'Trimestral · Q3 2024', description: '' });
    showToast(`Reporte "${newReport.title}" generado exitosamente ✓`);
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterPeriod('');
    setSearchTerm('');
  };

  const filteredReports = reports.filter((r) => {
    const matchCategory = !filterCategory || r.category === filterCategory;
    const matchPeriod = !filterPeriod || r.period.toLowerCase().includes(filterPeriod.toLowerCase());
    const matchSearch =
      !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchPeriod && matchSearch;
  });

  const hasFilters = filterCategory || filterPeriod || searchTerm;

  return (
    <div className="centro-reportes-page" onClick={() => setOpenDropdownId(null)}>
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

      {/* Detail Preview Modal */}
      {viewingReport && (
        <div className="modal-overlay" onClick={() => setViewingReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="report-category-badge" style={{ background: viewingReport.categoryColor }}>
                  {viewingReport.category}
                </span>
                <h3 style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>{viewingReport.title}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{viewingReport.period}</span>
              </div>
              <button className="modal-close" onClick={() => setViewingReport(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{viewingReport.description}</p>
              <div className="modal-stats">
                <div className="modal-stat">
                  <Eye size={14} />
                  <span>{viewingReport.views} visualizaciones</span>
                </div>
                <div className="modal-stat">
                  <Download size={14} />
                  <span>{viewingReport.downloads} descargas</span>
                </div>
              </div>

              {/* Data Preview */}
              <div className="modal-preview">
                <div className="mock-chart">
                  <div className="mock-chart-bar" style={{ height: '60%', background: '#4f8cff' }} />
                  <div className="mock-chart-bar" style={{ height: '85%', background: '#22c55e' }} />
                  <div className="mock-chart-bar" style={{ height: '45%', background: '#f59e0b' }} />
                  <div className="mock-chart-bar" style={{ height: '70%', background: '#a855f7' }} />
                  <div className="mock-chart-bar" style={{ height: '55%', background: '#ef4444' }} />
                  <div className="mock-chart-bar" style={{ height: '90%', background: '#06b6d4' }} />
                </div>
                <p className="mock-chart-label">Vista previa consolidada — Datos de telemetría y POS</p>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  className="report-btn report-btn-export"
                  onClick={() => handleExport(viewingReport, 'PDF')}
                >
                  <FileText size={14} /> Descargar PDF
                </button>
                <button
                  className="report-btn report-btn-export"
                  onClick={() => handleExport(viewingReport, 'Excel')}
                >
                  <FileSpreadsheet size={14} /> Descargar Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGenerateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Generar Nuevo Reporte Ejecutivo</h3>
              <button className="modal-close" onClick={() => setIsGenerateModalOpen(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateReport} className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="rep-title">Título del Reporte</label>
                <input
                  id="rep-title"
                  type="text"
                  className="form-input"
                  placeholder="Ej. Rendimiento Operativo Q3"
                  value={newReportForm.title}
                  onChange={(e) => setNewReportForm({ ...newReportForm, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="rep-cat">Rubro / Sector</label>
                  <select
                    id="rep-cat"
                    className="form-select"
                    value={newReportForm.category}
                    onChange={(e) => setNewReportForm({ ...newReportForm, category: e.target.value as ReportCategory })}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="rep-per">Temporalidad</label>
                  <select
                    id="rep-per"
                    className="form-select"
                    value={newReportForm.period}
                    onChange={(e) => setNewReportForm({ ...newReportForm, period: e.target.value })}
                  >
                    <option value="Anual · 2024">Anual · 2024</option>
                    <option value="Trimestral · Q3 2024">Trimestral · Q3 2024</option>
                    <option value="Mensual · Sep 2024">Mensual · Sep 2024</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rep-desc">Descripción del Alcance</label>
                <textarea
                  id="rep-desc"
                  className="form-input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                  placeholder="Describe las metas y métricas del reporte..."
                  value={newReportForm.description}
                  onChange={(e) => setNewReportForm({ ...newReportForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsGenerateModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={16} /> Generar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Header with Action Buttons in Top Right */}
      <div className="page-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Centro de Reportes Ejecutivos</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Catálogo consolidado de reportes, métricas operativas por sector y descargas multi-formato.
          </p>
        </div>

        {/* Action Buttons in Top Right of Content */}
        <div className="header-actions-group">
          <button
            className="btn-export-all-header"
            onClick={handleExportAll}
            title="Exportar todos los reportes filtrados"
          >
            <Download size={15} aria-hidden="true" />
            Exportar Todo
          </button>
          <button
            className="btn-generate-report-header"
            onClick={() => setIsGenerateModalOpen(true)}
            title="Crear un nuevo reporte ejecutivo"
          >
            <Plus size={16} aria-hidden="true" />
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row" style={{ marginTop: 24 }}>
        <div className="stat-chip">
          <span className="stat-chip-number">{reports.length}</span>
          <span className="stat-chip-label">Reportes disponibles</span>
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

      {/* ---- Interactive Trends Bar ---- */}
      <div className="trends-bar">
        <div className="trends-bar-header">
          <span className="trends-bar-title">
            <BarChart3 size={16} aria-hidden="true" />
            Tendencias de Rendimiento por Sector
          </span>
          <span className="trends-bar-updated">Actualizado en tiempo real</span>
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

      {/* ---- Integrated Filters Bar ---- */}
      <div className="filters-bar">
        <SlidersHorizontal size={16} className="filter-icon" aria-hidden="true" />

        {/* Rubro Selector */}
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

        {/* Temporalidad Selector */}
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

        {/* Single Integrated Search Input */}
        <div className="filter-search-inline">
          <Search size={14} aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
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

      {/* ---- Standardized Report Cards Grid ---- */}
      <h2 className="reports-section-title">Catálogo de Reportes</h2>
      <div className="reports-grid">
        {filteredReports.map((report) => {
          const isDropdownOpen = openDropdownId === report.id;

          return (
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
                <span><Eye size={12} /> {report.views} vistas</span>
                <span><Download size={12} /> {report.downloads} descargas</span>
              </div>

              {/* Standardized Actions: Ver + Download Dropdown */}
              <div className="report-actions">
                <button
                  type="button"
                  className="report-btn report-btn-view"
                  onClick={() => handleView(report)}
                  title={`Ver detalle de ${report.title}`}
                >
                  <Eye size={14} aria-hidden="true" />
                  Ver
                </button>

                {/* Unified Multi-Format Download Dropdown */}
                <div
                  className="report-download-dropdown-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="report-btn report-btn-export dropdown-trigger"
                    onClick={() => setOpenDropdownId(isDropdownOpen ? null : report.id)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                    title="Descargar reporte en varios formatos"
                  >
                    <Download size={14} aria-hidden="true" />
                    Descargar
                    <ChevronDown size={12} />
                  </button>

                  {isDropdownOpen && (
                    <div className="report-dropdown-menu">
                      <button
                        type="button"
                        className="report-dropdown-item"
                        onClick={() => handleExport(report, 'PDF')}
                      >
                        <FileText size={13} style={{ color: '#ef4444' }} />
                        Descargar como PDF
                      </button>
                      <button
                        type="button"
                        className="report-dropdown-item"
                        onClick={() => handleExport(report, 'CSV')}
                      >
                        <FileDown size={13} style={{ color: '#3b82f6' }} />
                        Descargar como CSV
                      </button>
                      <button
                        type="button"
                        className="report-dropdown-item"
                        onClick={() => handleExport(report, 'Excel')}
                      >
                        <FileSpreadsheet size={13} style={{ color: '#22c55e' }} />
                        Descargar como Excel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <FileText size={40} />
          <p>No se encontraron reportes con los criterios especificados.</p>
          <button className="filter-clear" onClick={clearFilters} style={{ marginTop: 8 }}>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
