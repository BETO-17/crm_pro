import { useState, useRef, useId } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Database,
  Eye,
  CheckCircle,
  X,
  Layers,
  ArrowRight,
  Info,
  Save,
  Search,
  Check,
} from 'lucide-react';

export interface DatasetItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  rowCount: number;
  colCount: number;
  headers: string[];
  sampleData: Record<string, string>[];
  isNew?: boolean;
  themeColor?: 'blue' | 'purple' | 'emerald';
}

const initialDatasets: DatasetItem[] = [
  {
    id: 'ds-1',
    name: 'export_export_ventas_tienda_tech_q3.csv',
    size: '12.4 MB',
    uploadedAt: '07 set. 2026, 12:08 a. m.',
    rowCount: 4000,
    colCount: 14,
    headers: ['ID_Venta', 'Fecha', 'Categoria', 'Tipo', 'Cliente', 'Monto_USD', 'Descuento', 'Tienda', 'Vendedor', 'Margen', 'Metodo_Pago', 'Estado', 'Rating', 'Region'],
    themeColor: 'blue',
    sampleData: [
      { ID_Venta: 'VTA-1001', Fecha: '2026-09-01', Categoria: 'Hardware', Tipo: 'Laptop Pro 16', Cliente: 'Tech Corp', Monto_USD: '$2,450.00', Descuento: '5%', Tienda: 'Mall Central', Vendedor: 'Carlos R.', Margen: '24%', Metodo_Pago: 'Transferencia', Estado: 'Completado', Rating: '4.8', Region: 'Norte' },
      { ID_Venta: 'VTA-1002', Fecha: '2026-09-01', Categoria: 'Accesorios', Tipo: 'Monitor 4K', Cliente: 'Soluciones IT', Monto_USD: '$680.00', Descuento: '0%', Tienda: 'Online Express', Vendedor: 'Ana M.', Margen: '31%', Metodo_Pago: 'Tarjeta Crédito', Estado: 'Completado', Rating: '4.9', Region: 'Centro' },
      { ID_Venta: 'VTA-1003', Fecha: '2026-09-02', Categoria: 'Audio', Tipo: 'Headset Pro ANC', Cliente: 'Gamer Zone', Monto_USD: '$299.00', Descuento: '10%', Tienda: 'Mall Central', Vendedor: 'Luis G.', Margen: '42%', Metodo_Pago: 'PayPal', Estado: 'Completado', Rating: '4.6', Region: 'Norte' },
      { ID_Venta: 'VTA-1004', Fecha: '2026-09-02', Categoria: 'Software', Tipo: 'Licencia Cloud Anual', Cliente: 'Innovatech', Monto_USD: '$1,200.00', Descuento: '15%', Tienda: 'B2B Portal', Vendedor: 'Carlos R.', Margen: '68%', Metodo_Pago: 'Factura 30d', Estado: 'Completado', Rating: '5.0', Region: 'Sur' },
      { ID_Venta: 'VTA-1005', Fecha: '2026-09-03', Categoria: 'Periféricos', Tipo: 'Teclado Mecánico RGB', Cliente: 'Consumidor Final', Monto_USD: '$145.00', Descuento: '0%', Tienda: 'Online Express', Vendedor: 'Ana M.', Margen: '35%', Metodo_Pago: 'Tarjeta Débito', Estado: 'Completado', Rating: '4.7', Region: 'Centro' },
      { ID_Venta: 'VTA-1006', Fecha: '2026-09-03', Categoria: 'Hardware', Tipo: 'Servidor Rack 2U', Cliente: 'DataHost SAC', Monto_USD: '$5,890.00', Descuento: '8%', Tienda: 'B2B Portal', Vendedor: 'Carlos R.', Margen: '19%', Metodo_Pago: 'Transferencia', Estado: 'Completado', Rating: '4.9', Region: 'Norte' },
      { ID_Venta: 'VTA-1007', Fecha: '2026-09-04', Categoria: 'Movilidad', Tipo: 'Tablet 12" OLED', Cliente: 'Diseño Creativo', Monto_USD: '$890.00', Descuento: '5%', Tienda: 'Mall Central', Vendedor: 'Luis G.', Margen: '28%', Metodo_Pago: 'Tarjeta Crédito', Estado: 'Completado', Rating: '4.5', Region: 'Sur' },
    ],
  },
  {
    id: 'ds-2',
    name: 'export_ventas_tienda_tech_competencia.csv',
    size: '9.8 MB',
    uploadedAt: '07 set. 2026, 12:08 a. m.',
    rowCount: 4000,
    colCount: 14,
    headers: ['ID_Venta', 'Fecha', 'Categoria', 'Tipo', 'Competidor', 'Precio_Competidor', 'Diferencia_Pct', 'Canal', 'Ciudad', 'Stock', 'Garantia', 'Envio', 'Promo', 'SKU'],
    themeColor: 'purple',
    sampleData: [
      { ID_Venta: 'CMP-501', Fecha: '2026-09-01', Categoria: 'Hardware', Tipo: 'Laptop Pro 16', Competidor: 'TechRival', Precio_Competidor: '$2,380.00', Diferencia_Pct: '-2.9%', Canal: 'Marketplace', Ciudad: 'Lima', Stock: '24', Garantia: '12 meses', Envio: 'Gratis 24h', Promo: 'CyberDay', SKU: 'SKU-5510' },
      { ID_Venta: 'CMP-502', Fecha: '2026-09-01', Categoria: 'Accesorios', Tipo: 'Monitor 4K', Competidor: 'MegaStore Tech', Precio_Competidor: '$710.00', Diferencia_Pct: '+4.4%', Canal: 'Tienda Física', Ciudad: 'Arequipa', Stock: '12', Garantia: '24 meses', Envio: 'Estándar', Promo: 'Regular', SKU: 'SKU-1029' },
      { ID_Venta: 'CMP-503', Fecha: '2026-09-02', Categoria: 'Audio', Tipo: 'Headset Pro ANC', Competidor: 'AudioWorld', Precio_Competidor: '$285.00', Diferencia_Pct: '-4.6%', Canal: 'E-Commerce', Ciudad: 'Lima', Stock: '50', Garantia: '12 meses', Envio: 'Gratis 48h', Promo: 'Descuento App', SKU: 'SKU-3321' },
      { ID_Venta: 'CMP-504', Fecha: '2026-09-02', Categoria: 'Software', Tipo: 'Licencia Cloud Anual', Competidor: 'CloudPartners', Precio_Competidor: '$1,250.00', Diferencia_Pct: '+4.1%', Canal: 'B2B Directo', Ciudad: 'Trujillo', Stock: '999', Garantia: 'Soporte 24/7', Envio: 'Digital', Promo: 'Plan Anual', SKU: 'SKU-7801' },
      { ID_Venta: 'CMP-505', Fecha: '2026-09-03', Categoria: 'Periféricos', Tipo: 'Teclado Mecánico RGB', Competidor: 'TechRival', Precio_Competidor: '$139.00', Diferencia_Pct: '-4.1%', Canal: 'Marketplace', Ciudad: 'Lima', Stock: '35', Garantia: '6 meses', Envio: 'Estándar', Promo: 'Flash Sale', SKU: 'SKU-9902' },
      { ID_Venta: 'CMP-506', Fecha: '2026-09-03', Categoria: 'Hardware', Tipo: 'Servidor Rack 2U', Competidor: 'Enterprise IT', Precio_Competidor: '$6,100.00', Diferencia_Pct: '+3.5%', Canal: 'B2B Directo', Ciudad: 'Lima', Stock: '5', Garantia: '36 meses', Envio: 'Especializado', Promo: 'Cotización', SKU: 'SKU-1140' },
      { ID_Venta: 'CMP-507', Fecha: '2026-09-04', Categoria: 'Movilidad', Tipo: 'Tablet 12" OLED', Competidor: 'ElectroGlobal', Precio_Competidor: '$875.00', Diferencia_Pct: '-1.6%', Canal: 'Tienda Física', Ciudad: 'Cusco', Stock: '18', Garantia: '12 meses', Envio: 'Recojo Tienda', Promo: 'Cupón 5%', SKU: 'SKU-4409' },
    ],
  },
];

interface DatasetsProps {
  onNavigate?: (view: string) => void;
}

export default function Datasets({ onNavigate }: DatasetsProps) {
  const [datasets, setDatasets] = useState<DatasetItem[]>(initialDatasets);
  const [selectedIds, setSelectedIds] = useState<string[]>(['ds-1', 'ds-2']);
  const [dragOver, setDragOver] = useState(false);
  const [previewDataset, setPreviewDataset] = useState<DatasetItem | null>(null);
  const [previewSearch, setPreviewSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputId = useId();

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Parse CSV File Client-side
  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          showToast(`El archivo ${file.name} está vacío.`, 'error');
          return;
        }

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
          showToast(`El archivo ${file.name} no contiene registros válidos.`, 'error');
          return;
        }

        // Detect delimiter: comma, semicolon, tab
        const headerLine = lines[0];
        let delimiter = ',';
        if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';
        else if (headerLine.includes('\t')) delimiter = '\t';

        const rawHeaders = headerLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const headers = rawHeaders.filter(Boolean);
        const rowCount = Math.max(lines.length - 1, 1);
        const colCount = headers.length;

        // Extract first 15 sample rows for preview
        const sampleData: Record<string, string>[] = [];
        for (let i = 1; i < Math.min(lines.length, 16); i++) {
          const rowValues = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = rowValues[idx] ?? '-';
          });
          sampleData.push(rowObj);
        }

        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + `, ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

        const newDataset: DatasetItem = {
          id: `ds-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: `${sizeMB} MB`,
          uploadedAt: formattedDate,
          rowCount,
          colCount,
          headers,
          sampleData,
          isNew: true,
          themeColor: datasets.length % 2 === 0 ? 'blue' : 'purple',
        };

        setDatasets((prev) => [newDataset, ...prev]);

        // Auto select if space available
        setSelectedIds((prev) => {
          if (prev.length < 2) return [...prev, newDataset.id];
          return prev;
        });

        showToast(`Dataset "${file.name}" cargado con éxito: ${rowCount.toLocaleString()} filas, ${colCount} columnas`, 'success');
      } catch (err) {
        console.error(err);
        showToast(`Error al procesar el archivo CSV "${file.name}".`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFiles = droppedFiles.filter((f) => f.name.toLowerCase().endsWith('.csv'));

    if (csvFiles.length === 0) {
      showToast('Por favor sube archivos en formato .CSV', 'error');
      return;
    }

    csvFiles.forEach((file) => {
      parseCSVFile(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach((file) => {
      parseCSVFile(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSelectCard = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        // Replace second selection
        return [prev[0], id];
      }
      return [...prev, id];
    });
  };

  const handleDeleteDataset = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    showToast(`Dataset "${name}" eliminado`, 'info');
  };

  const handleOpenPreview = (e: React.MouseEvent, dataset: DatasetItem) => {
    e.stopPropagation();
    setPreviewDataset(dataset);
    setPreviewSearch('');
  };

  const handleSaveToDatabase = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setDatasets((prev) => prev.map((d) => ({ ...d, isNew: false })));
      showToast(`Todos los datasets (${datasets.length}) se han sincronizado con la Base de Datos ✓`, 'success');
    }, 1200);
  };

  const handleGoToDetailedObservation = (datasetName: string) => {
    setPreviewDataset(null);
    showToast(`Cargando dataset "${datasetName}" en Observación de Datos...`, 'info');
    if (onNavigate) {
      onNavigate('observacion');
    }
  };

  const handleGoToComparison = () => {
    showToast('Iniciando comparación entre los 2 datasets seleccionados...', 'info');
    if (onNavigate) {
      onNavigate('comparacion');
    }
  };

  // Filtered preview data
  const filteredRows = previewDataset?.sampleData.filter((row) => {
    if (!previewSearch.trim()) return true;
    const q = previewSearch.toLowerCase();
    return Object.values(row).some((val) => val.toLowerCase().includes(q));
  }) || [];

  return (
    <div className="datasets-page-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          <CheckCircle size={16} aria-hidden="true" />
          <span>{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main View Header */}
      <div className="datasets-view-header">
        <div>
          <h1 className="datasets-main-title">Dataset</h1>
          <p className="datasets-main-subtitle">Carga, gestión y salud de tus datos</p>
        </div>
      </div>

      {/* Ingestion & Catalog Section */}
      <div className="datasets-catalog-card">
        {/* Section Title & Description */}
        <div className="datasets-section-topbar">
          <div>
            <h2 className="datasets-section-title">Datasets CSV</h2>
            <p className="datasets-section-desc">
              Sube archivos CSV para almacenarlos, visualizarlos y comparar sus datos. Selecciona dos datasets para activar la comparativa.
            </p>
          </div>
          <div className="datasets-count-badge">
            {datasets.length} {datasets.length === 1 ? 'dataset cargado' : 'datasets cargados'}
          </div>
        </div>

        {/* Clean Dropzone */}
        <div
          className={`datasets-clean-dropzone ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de archivos CSV"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <div className="dropzone-cloud-icon-box">
            <UploadCloud size={28} className="cloud-icon" />
          </div>
          <div className="dropzone-primary-text">
            {dragOver ? '¡Suelta tu archivo CSV aquí!' : 'Arrastra un CSV o haz click para seleccionar'}
          </div>
          <div className="dropzone-secondary-text">
            Soporta delimitadores , y · Máx 50 MB
          </div>
        </div>

        {/* Mis Datasets Subheader & Actions */}
        <div className="mis-datasets-header">
          <div className="mis-datasets-title-group">
            <div className="mis-datasets-heading">
              <Layers size={18} className="heading-icon" />
              <span>Mis Datasets</span>
            </div>
            <div className="mis-datasets-hint">
              <Info size={14} className="hint-icon" />
              <span>Haz click en las cards para seleccionarlas (máx. 2) y luego compara</span>
            </div>
          </div>

          <div className="mis-datasets-actions">
            <button
              className={`btn-save-db-primary ${isSaving ? 'saving' : ''}`}
              onClick={handleSaveToDatabase}
              disabled={isSaving || datasets.length === 0}
              title="Sincronizar y persistir datasets en la base de datos"
            >
              {isSaving ? <Save size={15} className="spin-icon" /> : <Database size={15} />}
              <span>{isSaving ? 'Guardando...' : 'Guardar Archivo(s) en BD'}</span>
            </button>
          </div>
        </div>

        {/* Selected Benchmark Comparison Action Bar */}
        {selectedIds.length > 0 && (
          <div className="datasets-selection-bar">
            <div className="selection-bar-info">
              <span className="selection-pill">{selectedIds.length} / 2 seleccionados</span>
              <span className="selection-names">
                {selectedIds
                  .map((id) => datasets.find((d) => d.id === id)?.name || id)
                  .join('  ⚡ vs ⚡  ')}
              </span>
            </div>
            <div className="selection-bar-actions">
              {selectedIds.length === 2 ? (
                <button
                  className="btn-launch-comparison"
                  onClick={handleGoToComparison}
                >
                  <span>Comparar Datasets Seleccionados</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <span className="selection-tip">Selecciona 1 dataset más para habilitar la comparativa</span>
              )}
            </div>
          </div>
        )}

        {/* Datasets Cards Grid */}
        <div className="datasets-grid">
          {datasets.map((dataset) => {
            const isSelected = selectedIds.includes(dataset.id);
            const isPurpleTheme = dataset.themeColor === 'purple';
            const visibleHeaders = dataset.headers.slice(0, 4);
            const remainingHeadersCount = Math.max(dataset.headers.length - 4, 0);

            return (
              <div
                key={dataset.id}
                className={`dataset-card ${isSelected ? 'selected' : ''} ${isPurpleTheme ? 'theme-purple' : 'theme-blue'}`}
                onClick={() => toggleSelectCard(dataset.id)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSelectCard(dataset.id);
                  }
                }}
              >
                {/* Selection Check Badge */}
                {isSelected && (
                  <div className="dataset-selected-indicator" title="Dataset seleccionado">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Card Header: Icon + Truncated Name + Date */}
                <div className="dataset-card-header">
                  <div className={`dataset-file-icon-box ${isPurpleTheme ? 'icon-purple' : 'icon-blue'}`}>
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="dataset-card-meta">
                    <h3 className="dataset-card-filename" title={dataset.name}>
                      {dataset.name}
                    </h3>
                    <span className="dataset-card-date">{dataset.uploadedAt}</span>
                  </div>
                </div>

                {/* Quick Metrics (Rows & Cols) */}
                <div className="dataset-metrics-row">
                  <span className="dataset-metric-badge">
                    <span className="metric-icon-box">⊞</span>
                    <strong>{dataset.rowCount.toLocaleString()}</strong> filas
                  </span>
                  <span className="dataset-metric-badge">
                    <span className="metric-icon-box">▥</span>
                    <strong>{dataset.colCount}</strong> columnas
                  </span>
                </div>

                {/* Headers Chips */}
                <div className="dataset-chips-row">
                  {visibleHeaders.map((header) => (
                    <span key={header} className="dataset-chip" title={header}>
                      {header}
                    </span>
                  ))}
                  {remainingHeadersCount > 0 && (
                    <span className="dataset-chip chip-more" title={`${remainingHeadersCount} columnas más`}>
                      +{remainingHeadersCount}
                    </span>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="dataset-card-footer">
                  <button
                    type="button"
                    className="btn-card-view-data"
                    onClick={(e) => handleOpenPreview(e, dataset)}
                    title="Previsualizar registros tabulares"
                  >
                    <Eye size={15} />
                    <span>Ver datos</span>
                  </button>
                  <button
                    type="button"
                    className="btn-card-delete"
                    onClick={(e) => handleDeleteDataset(e, dataset.id, dataset.name)}
                    aria-label={`Eliminar dataset ${dataset.name}`}
                    title="Eliminar dataset"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          TABULAR PREVIEW MODAL ("VER DATOS")
          ========================================================= */}
      {previewDataset && (
        <div
          className="dataset-modal-backdrop"
          onClick={() => setPreviewDataset(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
        >
          <div
            className="dataset-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="dataset-modal-header">
              <div className="modal-header-left">
                <div className="modal-header-icon-box">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h2 id="preview-modal-title" className="modal-title">
                    {previewDataset.name}
                  </h2>
                  <div className="modal-subtitle-badges">
                    <span className="modal-badge">{previewDataset.rowCount.toLocaleString()} filas registradas</span>
                    <span className="modal-badge">{previewDataset.colCount} columnas</span>
                    <span className="modal-badge badge-size">{previewDataset.size}</span>
                  </div>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setPreviewDataset(null)}
                aria-label="Cerrar vista previa"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Sub-bar: Search in sample */}
            <div className="dataset-modal-toolbar">
              <div className="modal-search-wrapper">
                <label htmlFor={searchInputId} className="visually-hidden">
                  Buscar en registros
                </label>
                <Search size={14} className="search-icon" aria-hidden="true" />
                <input
                  id={searchInputId}
                  type="text"
                  placeholder="Buscar en registros de muestra..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                />
                {previewSearch && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setPreviewSearch('')}
                    aria-label="Limpiar búsqueda"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <span className="modal-sample-hint">
                Mostrando {filteredRows.length} de {previewDataset.sampleData.length} filas de vista previa
              </span>
            </div>

            {/* Table Area with scroll */}
            <div className="dataset-modal-table-wrapper">
              <table className="dataset-preview-table">
                <thead>
                  <tr>
                    <th style={{ width: 48, textAlign: 'center' }}>#</th>
                    {previewDataset.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="row-index-cell">{idx + 1}</td>
                        {previewDataset.headers.map((h) => (
                          <td key={h} className="row-data-cell">
                            {row[h] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={previewDataset.headers.length + 1}
                        style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}
                      >
                        No se encontraron registros que coincidan con &quot;{previewSearch}&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer Actions */}
            <div className="dataset-modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setPreviewDataset(null)}
              >
                Cerrar Vista Previa
              </button>
              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => handleGoToDetailedObservation(previewDataset.name)}
              >
                <span>Ir a Análisis Detallado</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
