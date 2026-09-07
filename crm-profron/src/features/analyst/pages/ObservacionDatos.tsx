import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Database,
  Search,
  ChevronDown,
  X,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Check,
  Filter,
  Download,
  RotateCcw,
} from 'lucide-react';

/* ---- Compact Number Formatter Helper ---- */
function formatCompactNumber(num: number, isCurrency = false): string {
  let formatted: string;
  const abs = Math.abs(num);
  if (abs >= 1_000_000) {
    formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (abs >= 1_000) {
    formatted = (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    formatted = num % 1 === 0 ? num.toString() : num.toFixed(1);
  }
  return isCurrency ? `$${formatted}` : formatted;
}

/* ---- Types for Datasets & Records ---- */
export interface DatasetOption {
  id: string;
  name: string;
  rowCount: number;
  colCount: number;
  validPct: number;
  nullPct: number;
  dateStart: string;
  dateEnd: string;
  dateDesc: string;
  totalRevenue: number;
  avgTicket: number;
  numericColName: string;
  categoryDistribution: { label: string; value: number; count: number; pct: number }[];
  timeTrend: { month: string; value: number; units: number }[];
  records: DatasetRow[];
}

export interface DatasetRow {
  id: string;
  fecha: string;
  tienda: string;
  categoria: string;
  sku: string;
  producto: string;
  unidades: number;
  ticket: number;
  ingreso: number;
  margenPct: number;
}

/* ---- Mock Datasets Catalog ---- */
const availableDatasets: DatasetOption[] = [
  {
    id: 'ds-retail-sales',
    name: 'retail_sales_q3_q4.csv',
    rowCount: 12450,
    colCount: 8,
    validPct: 99.2,
    nullPct: 0.8,
    dateStart: '01 Jul 2026',
    dateEnd: '31 Dic 2026',
    dateDesc: '6 meses de historial continuo',
    totalRevenue: 310740,
    avgTicket: 104.80,
    numericColName: 'ingreso_usd',
    categoryDistribution: [
      { label: 'Calzado Deportivo', value: 98500, count: 850, pct: 31.7 },
      { label: 'Electrónica & Audio', value: 89200, count: 620, pct: 28.7 },
      { label: 'Ropa & Accesorios', value: 76400, count: 1100, pct: 24.6 },
      { label: 'Hogar & Confort', value: 46640, count: 540, pct: 15.0 },
    ],
    timeTrend: [
      { month: 'Jul 2026', value: 42500, units: 240 },
      { month: 'Ago 2026', value: 48200, units: 280 },
      { month: 'Sep 2026', value: 51800, units: 310 },
      { month: 'Oct 2026', value: 55400, units: 335 },
      { month: 'Nov 2026', value: 58600, units: 360 },
      { month: 'Dic 2026', value: 54240, units: 390 },
    ],
    records: [
      { id: 'TRX-1001', fecha: '2026-11-04', tienda: 'Tienda Norte', categoria: 'Calzado', sku: 'SKU-CAL-991', producto: 'Zapatilla Running Pro X', unidades: 24, ticket: 110.0, ingreso: 2640.0, margenPct: 36.5 },
      { id: 'TRX-1002', fecha: '2026-11-04', tienda: 'Canal Online', categoria: 'Electrónica', sku: 'SKU-ELE-402', producto: 'Smartwatch V3 Titanio', unidades: 18, ticket: 240.0, ingreso: 4320.0, margenPct: 28.0 },
      { id: 'TRX-1003', fecha: '2026-11-03', tienda: 'Tienda Centro', categoria: 'Ropa', sku: 'SKU-ROP-105', producto: 'Chaqueta Impermeable Tech', unidades: 32, ticket: 85.0, ingreso: 2720.0, margenPct: 42.0 },
      { id: 'TRX-1004', fecha: '2026-11-03', tienda: 'Tienda Sur', categoria: 'Hogar', sku: 'SKU-HOG-881', producto: 'Lámpara LED Nórdica', unidades: 15, ticket: 65.0, ingreso: 975.0, margenPct: 22.5 },
      { id: 'TRX-1005', fecha: '2026-11-02', tienda: 'Tienda Norte', categoria: 'Electrónica', sku: 'SKU-ELE-301', producto: 'Auriculares ANC Wireless', unidades: 40, ticket: 130.0, ingreso: 5200.0, margenPct: 34.0 },
      { id: 'TRX-1006', fecha: '2026-11-02', tienda: 'Canal Online', categoria: 'Calzado', sku: 'SKU-CAL-804', producto: 'Bota Trekking GoreTex', unidades: 12, ticket: 160.0, ingreso: 1920.0, margenPct: 38.0 },
      { id: 'TRX-1007', fecha: '2026-11-01', tienda: 'Tienda Centro', categoria: 'Hogar', sku: 'SKU-HOG-912', producto: 'Set Cubiertos Premium 24pz', unidades: 20, ticket: 95.0, ingreso: 1900.0, margenPct: 18.5 },
      { id: 'TRX-1008', fecha: '2026-11-01', tienda: 'Tienda Sur', categoria: 'Ropa', sku: 'SKU-ROP-330', producto: 'Pantalón Cargo Stretch', unidades: 45, ticket: 55.0, ingreso: 2475.0, margenPct: 31.0 },
      { id: 'TRX-1009', fecha: '2026-10-28', tienda: 'Canal Online', categoria: 'Electrónica', sku: 'SKU-ELE-772', producto: 'Teclado Mecánico RGB 75%', unidades: 28, ticket: 115.0, ingreso: 3220.0, margenPct: 29.5 },
      { id: 'TRX-1010', fecha: '2026-10-27', tienda: 'Tienda Norte', categoria: 'Ropa', sku: 'SKU-ROP-512', producto: 'Sudadera Algodón Orgánico', unidades: 50, ticket: 48.0, ingreso: 2400.0, margenPct: 45.0 },
      { id: 'TRX-1011', fecha: '2026-10-26', tienda: 'Tienda Sur', categoria: 'Calzado', sku: 'SKU-CAL-119', producto: 'Sneakers Urban Casual', unidades: 35, ticket: 75.0, ingreso: 2625.0, margenPct: 27.0 },
      { id: 'TRX-1012', fecha: '2026-10-25', tienda: 'Tienda Centro', categoria: 'Electrónica', sku: 'SKU-ELE-990', producto: 'Monitor 27" QHD 165Hz', unidades: 8, ticket: 310.0, ingreso: 2480.0, margenPct: 14.5 },
      { id: 'TRX-1013', fecha: '2026-10-24', tienda: 'Canal Online', categoria: 'Hogar', sku: 'SKU-HOG-410', producto: 'Difusor Aromático Smart', unidades: 60, ticket: 35.0, ingreso: 2100.0, margenPct: 40.0 },
      { id: 'TRX-1014', fecha: '2026-10-22', tienda: 'Tienda Norte', categoria: 'Hogar', sku: 'SKU-HOG-205', producto: 'Edredón Térmico King', unidades: 14, ticket: 140.0, ingreso: 1960.0, margenPct: 25.0 },
      { id: 'TRX-1015', fecha: '2026-10-20', tienda: 'Tienda Sur', categoria: 'Electrónica', sku: 'SKU-ELE-105', producto: 'Power Bank 20,000mAh', unidades: 55, ticket: 42.0, ingreso: 2310.0, margenPct: 33.0 },
    ],
  },
  {
    id: 'ds-tech-hardware',
    name: 'export_ventas_tienda_tech_q3.csv',
    rowCount: 4000,
    colCount: 14,
    validPct: 98.7,
    nullPct: 1.3,
    dateStart: '01 Jul 2026',
    dateEnd: '30 Sep 2026',
    dateDesc: 'Trimestre Q3 Hardware B2B',
    totalRevenue: 184200,
    avgTicket: 142.50,
    numericColName: 'monto_usd',
    categoryDistribution: [
      { label: 'Laptops Pro & Ultrabooks', value: 82000, count: 42, pct: 44.5 },
      { label: 'Monitores 4K / QHD', value: 38500, count: 85, pct: 20.9 },
      { label: 'Periféricos & Teclados', value: 34300, count: 240, pct: 18.6 },
      { label: 'Audio Pro Wireless', value: 29400, count: 110, pct: 16.0 },
    ],
    timeTrend: [
      { month: 'Jul 2026', value: 54000, units: 140 },
      { month: 'Ago 2026', value: 62200, units: 165 },
      { month: 'Sep 2026', value: 68000, units: 190 },
    ],
    records: [
      { id: 'TECH-501', fecha: '2026-09-28', tienda: 'Tech Hub Norte', categoria: 'Laptops', sku: 'SKU-LAP-16', producto: 'MacBook Pro 16" M3', unidades: 6, ticket: 2450.0, ingreso: 14700.0, margenPct: 24.0 },
      { id: 'TECH-502', fecha: '2026-09-25', tienda: 'Tech Hub Central', categoria: 'Monitores', sku: 'SKU-MON-27', producto: 'Monitor Dell UltraSharp 27"', unidades: 14, ticket: 680.0, ingreso: 9520.0, margenPct: 31.0 },
      { id: 'TECH-503', fecha: '2026-09-20', tienda: 'Online Direct', categoria: 'Audio', sku: 'SKU-AUD-80', producto: 'Sony WH-1000XM5 ANC', unidades: 22, ticket: 340.0, ingreso: 7480.0, margenPct: 35.0 },
      { id: 'TECH-504', fecha: '2026-09-15', tienda: 'Tech Hub Sur', categoria: 'Periféricos', sku: 'SKU-KEY-99', producto: 'Keychron Q1 Pro Wireless', unidades: 30, ticket: 195.0, ingreso: 5850.0, margenPct: 42.0 },
      { id: 'TECH-505', fecha: '2026-09-10', tienda: 'Tech Hub Norte', categoria: 'Laptops', sku: 'SKU-LAP-14', producto: 'ThinkPad X1 Carbon Gen 12', unidades: 8, ticket: 1890.0, ingreso: 15120.0, margenPct: 28.5 },
    ],
  },
  {
    id: 'ds-inventory-regional',
    name: 'inventario_regional_2026.xlsx',
    rowCount: 8200,
    colCount: 10,
    validPct: 100.0,
    nullPct: 0.0,
    dateStart: '01 Ene 2026',
    dateEnd: '30 Nov 2026',
    dateDesc: 'Auditoría Anual de Almacenes',
    totalRevenue: 845000,
    avgTicket: 85.00,
    numericColName: 'valor_stock',
    categoryDistribution: [
      { label: 'Almacén Central (Lima)', value: 380000, count: 3200, pct: 45.0 },
      { label: 'Almacén Norte (Trujillo)', value: 265000, count: 2800, pct: 31.4 },
      { label: 'Almacén Sur (Arequipa)', value: 200000, count: 2200, pct: 23.6 },
    ],
    timeTrend: [
      { month: 'Ene 2026', value: 120000, units: 1200 },
      { month: 'Abr 2026', value: 135000, units: 1350 },
      { month: 'Jul 2026', value: 140000, units: 1400 },
      { month: 'Oct 2026', value: 150000, units: 1520 },
      { month: 'Nov 2026', value: 160000, units: 1610 },
    ],
    records: [
      { id: 'STK-901', fecha: '2026-11-15', tienda: 'Almacén Central', categoria: 'Electrónica', sku: 'SKU-STK-01', producto: 'Stock Tablets 12" OLED', unidades: 120, ticket: 450.0, ingreso: 54000.0, margenPct: 32.0 },
      { id: 'STK-902', fecha: '2026-11-10', tienda: 'Almacén Norte', categoria: 'Calzado', sku: 'SKU-STK-02', producto: 'Lote Running Elite 500pz', unidades: 500, ticket: 65.0, ingreso: 32500.0, margenPct: 40.0 },
      { id: 'STK-903', fecha: '2026-11-05', tienda: 'Almacén Sur', categoria: 'Hogar', sku: 'SKU-STK-03', producto: 'Sets Climatización Smart', unidades: 80, ticket: 180.0, ingreso: 14400.0, margenPct: 25.0 },
    ],
  },
  {
    id: 'ds-competitor-benchmark',
    name: 'precios_competencia_benchmark.csv',
    rowCount: 3500,
    colCount: 12,
    validPct: 97.8,
    nullPct: 2.2,
    dateStart: '01 Ago 2026',
    dateEnd: '31 Dic 2026',
    dateDesc: 'Monitoreo de Precios Rivales',
    totalRevenue: 245000,
    avgTicket: 118.00,
    numericColName: 'precio_competidor',
    categoryDistribution: [
      { label: 'Smartphones & Accesorios', value: 95000, count: 180, pct: 38.8 },
      { label: 'Cómputo & Servidores', value: 85000, count: 95, pct: 34.7 },
      { label: 'Smart Home & IoT', value: 65000, count: 210, pct: 26.5 },
    ],
    timeTrend: [
      { month: 'Ago 2026', value: 45000, units: 180 },
      { month: 'Sep 2026', value: 48000, units: 195 },
      { month: 'Oct 2026', value: 52000, units: 210 },
      { month: 'Nov 2026', value: 58000, units: 240 },
      { month: 'Dic 2026', value: 42000, units: 160 },
    ],
    records: [
      { id: 'CMP-701', fecha: '2026-11-02', tienda: 'E-Commerce Rival', categoria: 'Smartphones', sku: 'SKU-RIV-01', producto: 'Galaxy S26 Ultra 512GB', unidades: 15, ticket: 1250.0, ingreso: 18750.0, margenPct: 18.0 },
      { id: 'CMP-702', fecha: '2026-11-01', tienda: 'Retail Direct Rival', categoria: 'Cómputo', sku: 'SKU-RIV-02', producto: 'ASUS ROG Zephyrus G16', unidades: 8, ticket: 2100.0, ingreso: 16800.0, margenPct: 22.0 },
    ],
  },
];

type SortField = 'fecha' | 'tienda' | 'categoria' | 'producto' | 'unidades' | 'ticket' | 'ingreso' | 'margenPct';

interface ObservacionDatosProps {
  onNavigate?: (view: string) => void;
}

export default function ObservacionDatos({ onNavigate }: ObservacionDatosProps) {
  // Selected Dataset state (null for initial empty state, or default dataset)
  const [selectedDataset, setSelectedDataset] = useState<DatasetOption | null>(availableDatasets[0]);

  // Searchable Combobox State
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Table Search & Filtering State
  const [tableSearch, setTableSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [metricMode, setMetricMode] = useState<'Promedio' | 'Suma' | 'Mediana'>('Promedio');

  // Close combobox when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered dataset options in combobox
  const filteredDatasetOptions = availableDatasets.filter((d) =>
    d.name.toLowerCase().includes(comboboxSearch.toLowerCase()) ||
    d.dateDesc.toLowerCase().includes(comboboxSearch.toLowerCase())
  );

  const handleSelectDataset = (ds: DatasetOption) => {
    setSelectedDataset(ds);
    setIsComboboxOpen(false);
    setComboboxSearch('');
    setTableSearch('');
    setFilterCategory('Todas');
    setCurrentPage(1);
  };

  const handleClearDataset = () => {
    setSelectedDataset(null);
    setComboboxSearch('');
    setIsComboboxOpen(false);
  };

  // Table filtering & sorting
  const tableRows = useMemo(() => {
    if (!selectedDataset) return [];

    return selectedDataset.records.filter((row) => {
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchSku = row.sku.toLowerCase().includes(q);
        const matchProd = row.producto.toLowerCase().includes(q);
        const matchTienda = row.tienda.toLowerCase().includes(q);
        const matchCat = row.categoria.toLowerCase().includes(q);
        if (!matchSku && !matchProd && !matchTienda && !matchCat) return false;
      }

      if (filterCategory !== 'Todas' && row.categoria !== filterCategory) {
        return false;
      }

      return true;
    });
  }, [selectedDataset, tableSearch, filterCategory]);

  const sortedRows = useMemo(() => {
    return [...tableRows].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [tableRows, sortField, sortOrder]);

  const totalRecords = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Categories list for active dataset
  const availableCategories = useMemo(() => {
    if (!selectedDataset) return [];
    const cats = new Set(selectedDataset.records.map((r) => r.categoria));
    return Array.from(cats);
  }, [selectedDataset]);

  // Dynamic KPI 3 Central Metric value calculation
  const kpi3Value = useMemo(() => {
    if (!selectedDataset) return '$0';
    if (metricMode === 'Suma') {
      return formatCompactNumber(selectedDataset.totalRevenue, true);
    } else if (metricMode === 'Mediana') {
      return formatCompactNumber(selectedDataset.avgTicket * 0.95, true);
    } else {
      return formatCompactNumber(selectedDataset.avgTicket, true);
    }
  }, [selectedDataset, metricMode]);

  // Max value calculation for Trend graph
  const maxTrendVal = useMemo(() => {
    if (!selectedDataset) return 1;
    return Math.max(...selectedDataset.timeTrend.map((t) => t.value));
  }, [selectedDataset]);

  return (
    <div className="observacion-dashboard-root">
      {/* =========================================================
          1. CABECERA Y SELECTOR INTELIGENTE (COMBOBOX)
          ========================================================= */}
      <div className="obs-header-card">
        <div className="obs-header-left">
          <div className="obs-combobox-wrapper" ref={comboboxRef}>
            <label className="obs-combobox-label" htmlFor="dataset-combobox-input">
              <Database size={15} className="text-blue" />
              <span>Dataset Activo</span>
            </label>

            <div
              className={`obs-combobox-input-box ${isComboboxOpen ? 'focused' : ''}`}
              onClick={() => setIsComboboxOpen(true)}
            >
              <Search size={14} className="combobox-search-icon" />
              <input
                id="dataset-combobox-input"
                type="text"
                placeholder="Buscar dataset por nombre..."
                value={isComboboxOpen ? comboboxSearch : selectedDataset ? selectedDataset.name : ''}
                onChange={(e) => {
                  setComboboxSearch(e.target.value);
                  setIsComboboxOpen(true);
                }}
                onFocus={() => setIsComboboxOpen(true)}
              />

              {selectedDataset && (
                <button
                  type="button"
                  className="combobox-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearDataset();
                  }}
                  title="Deseleccionar dataset"
                  aria-label="Deseleccionar dataset"
                >
                  <X size={13} />
                </button>
              )}

              <div className="combobox-chevron-icon">
                <ChevronDown size={15} />
              </div>
            </div>

            {/* Combobox Dropdown Menu */}
            {isComboboxOpen && (
              <div className="obs-combobox-dropdown-menu">
                <div className="combobox-dropdown-header">
                  <span>Datasets disponibles ({filteredDatasetOptions.length})</span>
                </div>
                <div className="combobox-options-list">
                  {filteredDatasetOptions.length > 0 ? (
                    filteredDatasetOptions.map((ds) => {
                      const isSelected = selectedDataset?.id === ds.id;
                      return (
                        <div
                          key={ds.id}
                          className={`combobox-option-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectDataset(ds)}
                        >
                          <div className="option-icon-box">
                            <FileSpreadsheet size={16} />
                          </div>
                          <div className="option-info">
                            <strong className="option-name">{ds.name}</strong>
                            <span className="option-sub">
                              {ds.rowCount.toLocaleString()} filas • {ds.colCount} columnas • {ds.dateDesc}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="option-check-icon">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="combobox-no-results">
                      No se encontraron datasets que coincidan con &quot;{comboboxSearch}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Dataset Meta Badge */}
          {selectedDataset && (
            <div className="dataset-quick-status-chip">
              <span className="status-live-dot" />
              <span>{selectedDataset.rowCount.toLocaleString()} filas cargadas</span>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="obs-header-right">
          <button
            type="button"
            className="btn-switch-tab-outline"
            onClick={() => onNavigate?.('comparacion')}
            title="Ir a Comparación y Análisis"
          >
            <span>Comparación y Análisis</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* =========================================================
          EMPTY STATE (Cuando NO hay dataset seleccionado)
          ========================================================= */}
      {!selectedDataset ? (
        <div className="obs-central-empty-state">
          <div className="empty-state-glowing-icon-box">
            <Database size={48} />
          </div>
          <h2 className="empty-state-main-title">
            Selecciona un dataset para visualizar sus métricas
          </h2>
          <p className="empty-state-main-desc">
            Utiliza el buscador superior para seleccionar un archivo CSV o XLSX cargado. El dashboard desplegará de forma automática las tarjetas de salud, exploración visual de tendencias y la tabla exploratoria de registros.
          </p>

          <div className="empty-state-quick-picker">
            <span className="quick-picker-label">O selecciona uno de los datasets precargados:</span>
            <div className="quick-picker-chips">
              {availableDatasets.map((ds) => (
                <button
                  key={ds.id}
                  className="quick-dataset-chip"
                  onClick={() => handleSelectDataset(ds)}
                >
                  <FileSpreadsheet size={14} />
                  <span>{ds.name}</span>
                  <strong className="chip-count">({ds.rowCount.toLocaleString()} filas)</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================
           2. ESTRUCTURA DEL DASHBOARD (Tabla primero, luego KPIs y Gráficos)
           ========================================================= */
        <div className="obs-dashboard-content-flow">
          {/* -----------------------------------------------------
              1. SECCIÓN SUPERIOR: VISOR DE DATOS (TABLA - MÁX 8 FILAS)
              ----------------------------------------------------- */}
          <div className="obs-data-table-full-card">
            {/* Table Header Controls */}
            <div className="data-table-topbar">
              <div className="table-topbar-left">
                <div className="table-search-box">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar registros por SKU, producto, tienda o categoría..."
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {tableSearch && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setTableSearch('')}
                      aria-label="Limpiar búsqueda"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Quick Category Filter */}
                <div className="table-category-filter">
                  <Filter size={13} className="filter-icon" />
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="Todas">Todas las categorías</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {(tableSearch || filterCategory !== 'Todas') && (
                  <button
                    className="btn-clear-table-filters"
                    onClick={() => {
                      setTableSearch('');
                      setFilterCategory('Todas');
                      setCurrentPage(1);
                    }}
                    title="Restablecer filtros"
                  >
                    <RotateCcw size={12} />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              <div className="table-topbar-right">
                <span className="table-records-counter">
                  Mostrando <strong>{paginatedRows.length}</strong> de <strong>{totalRecords}</strong> registros
                </span>
                <button
                  className="btn-export-records"
                  onClick={() => alert(`Exportando ${totalRecords} registros del dataset "${selectedDataset.name}"`)}
                >
                  <Download size={13} />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="obs-responsive-table-wrapper">
              <table className="obs-clean-data-table">
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: 'center' }}>#</th>
                    <th
                      className={`sortable-th ${sortField === 'fecha' ? 'sorted' : ''}`}
                      onClick={() => handleSort('fecha')}
                    >
                      <span>Fecha</span>
                      {sortField === 'fecha' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                    <th
                      className={`sortable-th ${sortField === 'tienda' ? 'sorted' : ''}`}
                      onClick={() => handleSort('tienda')}
                    >
                      <span>Tienda / Sucursal</span>
                      {sortField === 'tienda' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                    <th
                      className={`sortable-th ${sortField === 'categoria' ? 'sorted' : ''}`}
                      onClick={() => handleSort('categoria')}
                    >
                      <span>Categoría</span>
                      {sortField === 'categoria' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                    <th
                      className={`sortable-th ${sortField === 'producto' ? 'sorted' : ''}`}
                      onClick={() => handleSort('producto')}
                    >
                      <span>SKU / Producto</span>
                      {sortField === 'producto' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                    <th
                      className={`sortable-th text-right ${sortField === 'unidades' ? 'sorted' : ''}`}
                      onClick={() => handleSort('unidades')}
                    >
                      <span>Unidades</span>
                      {sortField === 'unidades' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                    <th
                      className={`sortable-th text-right ${sortField === 'ticket' ? 'sorted' : ''}`}
                      onClick={() => handleSort('ticket')}
                    >
                      <span>Ticket Prom.</span>
                      {sortField === 'ticket' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                    <th
                      className={`sortable-th text-right ${sortField === 'ingreso' ? 'sorted' : ''}`}
                      onClick={() => handleSort('ingreso')}
                    >
                      <span>Ingreso</span>
                      {sortField === 'ingreso' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                    <th
                      className={`sortable-th text-center ${sortField === 'margenPct' ? 'sorted' : ''}`}
                      onClick={() => handleSort('margenPct')}
                    >
                      <span>Margen (%)</span>
                      {sortField === 'margenPct' ? (
                        sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, idx) => {
                      const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                      const isHighMargin = row.margenPct >= 30;
                      const isLowMargin = row.margenPct < 15;

                      return (
                        <tr key={row.id}>
                          <td className="row-index-cell">{globalIndex}</td>
                          <td className="row-date-cell">{row.fecha}</td>
                          <td>
                            <span className="store-pill-tag">{row.tienda}</span>
                          </td>
                          <td>
                            <span className="category-pill-tag">{row.categoria}</span>
                          </td>
                          <td>
                            <div className="product-meta-cell">
                              <span className="sku-tag">{row.sku}</span>
                              <strong className="product-title">{row.producto}</strong>
                            </div>
                          </td>
                          <td className="text-right num-data-cell">
                            <strong>{row.unidades}</strong> u.
                          </td>
                          <td className="text-right num-data-cell">
                            ${row.ticket.toFixed(2)}
                          </td>
                          <td className="text-right num-data-cell revenue-highlight">
                            ${row.ingreso.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-center">
                            <span
                              className={`margin-status-pill ${
                                isHighMargin
                                  ? 'margin-high'
                                  : isLowMargin
                                  ? 'margin-low'
                                  : 'margin-mid'
                              }`}
                            >
                              {row.margenPct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="table-no-data-cell">
                        No se encontraron registros que coincidan con &quot;{tableSearch}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Max 8 filas) */}
            {totalRecords > 0 && (
              <div className="table-footer-pagination">
                <div className="page-size-selector-group">
                  <label htmlFor="obs-page-size">Filas por página:</label>
                  <select
                    id="obs-page-size"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={24}>24</option>
                  </select>
                </div>

                <div className="pagination-pages-badge">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </div>

                <div className="pagination-buttons-row">
                  <button
                    className="btn-pagination-nav"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={16} />
                    <span>Anterior</span>
                  </button>

                  <div className="pagination-number-buttons">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-num-btn ${p === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    className="btn-pagination-nav"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                  >
                    <span>Siguiente</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* -----------------------------------------------------
              2. SECCIÓN MEDIA: TARJETAS DE SALUD (4 KPIS DINÁMICOS)
              ----------------------------------------------------- */}
          <div className="obs-kpis-grid-row">
            {/* KPI 1: Volumen */}
            <div className="obs-kpi-card-clean card-theme-blue">
              <div className="obs-kpi-accent-bar bar-blue" />
              <div key={`vol-${selectedDataset.id}`} className="obs-kpi-big-number kpi-num-animated">
                {formatCompactNumber(selectedDataset.rowCount)}
              </div>
              <div className="obs-kpi-keyword">
                <span className="obs-kpi-keyword-text">Registros</span>
                <span className="obs-kpi-live-badge">Live</span>
              </div>
            </div>

            {/* KPI 2: Salud e Integridad */}
            <div className="obs-kpi-card-clean card-theme-emerald">
              <div className="obs-kpi-accent-bar bar-emerald" />
              <div
                key={`health-${selectedDataset.id}`}
                className={`obs-kpi-big-number kpi-num-animated ${
                  selectedDataset.validPct >= 95
                    ? 'kpi-color-success'
                    : selectedDataset.validPct >= 80
                    ? 'kpi-color-warning'
                    : 'kpi-color-danger'
                }`}
              >
                {selectedDataset.validPct}%
              </div>
              <div className="obs-kpi-keyword">
                <span className="obs-kpi-status-dot pulse-emerald" />
                <span className="obs-kpi-keyword-text">Válidos</span>
              </div>
            </div>

            {/* KPI 3: Métrica Central */}
            <div className="obs-kpi-card-clean card-theme-purple">
              <div className="obs-kpi-accent-bar bar-purple" />
              <div key={`metric-${selectedDataset.id}-${metricMode}`} className="obs-kpi-big-number kpi-num-animated">
                {kpi3Value}
              </div>
              <div className="obs-kpi-segmented-toggle">
                {(['Promedio', 'Suma', 'Mediana'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`obs-kpi-seg-btn ${metricMode === mode ? 'active' : ''}`}
                    onClick={() => setMetricMode(mode)}
                    title={`Ver ${mode}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI 4: Dispersión/Cardinalidad */}
            <div className="obs-kpi-card-clean card-theme-amber">
              <div className="obs-kpi-accent-bar bar-amber" />
              <div key={`cat-${selectedDataset.id}`} className="obs-kpi-big-number kpi-num-animated">
                {formatCompactNumber(selectedDataset.categoryDistribution.length)}
              </div>
              <div className="obs-kpi-keyword">
                <span className="obs-kpi-keyword-text">Categorías</span>
                <span className="obs-kpi-micro-bars">
                  <span className="mini-bar bar-1" />
                  <span className="mini-bar bar-2" />
                  <span className="mini-bar bar-3" />
                </span>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------
              3. SECCIÓN INFERIOR: EXPLORACIÓN VISUAL (GRÁFICOS 50% / 50%)
              ----------------------------------------------------- */}
          <div className="obs-visual-charts-row">
            {/* Gráfico 1: Distribución (Barras Proporcionales) */}
            <div className="obs-chart-container-card">
              <div className="chart-header-row">
                <div>
                  <h3 className="chart-title">Distribución por Categoría</h3>
                  <span className="chart-subtitle">
                    Aportación volumétrica y monto acumulado
                  </span>
                </div>
                <span className="chart-badge-tag">
                  {selectedDataset.categoryDistribution.length} Categorías
                </span>
              </div>

              <div className="chart-proportional-bars-list">
                {selectedDataset.categoryDistribution.map((item, idx) => (
                  <div key={idx} className="prop-bar-item">
                    <div className="prop-bar-meta">
                      <strong className="prop-bar-name">{item.label}</strong>
                      <div className="prop-bar-figures">
                        <span className="prop-bar-amount">
                          ${item.value.toLocaleString()}
                        </span>
                        <span className="prop-bar-pct">{item.pct}%</span>
                      </div>
                    </div>

                    <div className="prop-bar-track">
                      <div
                        className={`prop-bar-fill fill-gradient-${idx % 4}`}
                        style={{ width: `${item.pct}%` }}
                        title={`${item.label}: $${item.value.toLocaleString()} (${item.pct}%)`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico 2: Tendencia (Evolución Temporal con SVG interactivo) */}
            <div className="obs-chart-container-card">
              <div className="chart-header-row">
                <div>
                  <h3 className="chart-title">Tendencia de Ventas (Evolución Temporal)</h3>
                  <span className="chart-subtitle">
                    Comportamiento cronológico de facturación
                  </span>
                </div>
                <span className="chart-badge-tag trend-tag">
                  <TrendingUp size={12} />
                  <span>Serie Temporal</span>
                </span>
              </div>

              <div className="chart-temporal-svg-wrapper">
                <div className="temporal-bars-grid">
                  {selectedDataset.timeTrend.map((point, idx) => {
                    const heightPct = Math.max(16, Math.round((point.value / maxTrendVal) * 100));
                    return (
                      <div key={idx} className="temporal-col-item">
                        <div className="temporal-bar-track">
                          <div
                            className="temporal-bar-pillar"
                            style={{ height: `${heightPct}%` }}
                          >
                            <span className="temporal-hover-tooltip">
                              ${point.value.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="temporal-x-label">
                          <span>{point.month.split(' ')[0]}</span>
                          <small>{point.units} u.</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

