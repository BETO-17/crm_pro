import { useState, useMemo } from 'react';
import {
  Target,
  Table2,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Download,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
  MoreVertical,
  Layers,
  LineChart as LineChartIcon,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';

/* ---- Data Types ---- */
export interface BenchmarkDatasetOption {
  id: string;
  name: string;
  label: string;
  totalRegistros: number;
  ventasTotalesUSD: number;
  margenPromedioPct: number;
  metrics: {
    cantidad: number;
    precioUnitario: number;
    descuentoPct: number;
    totalUSD: number;
    ticketPromedio: number;
    margenPct: number;
  };
  monthlySales: {
    mes: string;
    label: string;
    ventaUSD: number;
    unidades: number;
  }[];
  categories: {
    categoria: string;
    ingreso: number;
    unidades: number;
    margen: number;
  }[];
}

/* ---- Dataset Catalog for Benchmarking ---- */
const availableBenchmarkDatasets: Record<string, BenchmarkDatasetOption> = {
  'export_export_ventas_tienda_tech_4000': {
    id: 'export_export_ventas_tienda_tech_4000',
    name: 'Ventas Retail 2023 (Mi Negocio)',
    label: 'Ventas Retail 2023 (Mi Negocio)',
    totalRegistros: 154230,
    ventasTotalesUSD: 2100000,
    margenPromedioPct: 31.2,
    metrics: {
      cantidad: 1.82,
      precioUnitario: 842.78,
      descuentoPct: 5.41,
      totalUSD: 1458.3,
      ticketPromedio: 142.5,
      margenPct: 31.2,
    },
    monthlySales: [
      { mes: 'Jan', label: 'Enero', ventaUSD: 480000, unidades: 1250 },
      { mes: 'Feb', label: 'Febrero', ventaUSD: 990000, unidades: 2100 },
      { mes: 'Mar', label: 'Marzo', ventaUSD: 850000, unidades: 1800 },
      { mes: 'Abr', label: 'Abril', ventaUSD: 820000, unidades: 1750 },
      { mes: 'May', label: 'Mayo', ventaUSD: 1350000, unidades: 2600 },
      { mes: 'Jun', label: 'Junio', ventaUSD: 1150000, unidades: 2300 },
      { mes: 'Jul', label: 'Julio', ventaUSD: 1540000, unidades: 2900 },
      { mes: 'Nov', label: 'Noviembre', ventaUSD: 1210000, unidades: 2450 },
      { mes: 'Dec', label: 'Diciembre', ventaUSD: 1780000, unidades: 3400 },
    ],
    categories: [
      { categoria: 'Electrónica', ingreso: 2080, unidades: 1850, margen: 32.5 },
      { categoria: 'Ropa', ingreso: 1300, unidades: 2400, margen: 36.0 },
      { categoria: 'Hogar', ingreso: 1050, unidades: 1100, margen: 28.0 },
    ],
  },
  'export_export_export_ventas_tienda_tech_4000': {
    id: 'export_export_export_ventas_tienda_tech_4000',
    name: 'Ventas Retail 2024 (Competencia / Benchmark)',
    label: 'Ventas Retail 2024 (Competencia)',
    totalRegistros: 168915,
    ventasTotalesUSD: 2500000,
    margenPromedioPct: 32.5,
    metrics: {
      cantidad: 1.95,
      precioUnitario: 890.15,
      descuentoPct: 4.85,
      totalUSD: 1620.4,
      ticketPromedio: 155.8,
      margenPct: 32.5,
    },
    monthlySales: [
      { mes: 'Jan', label: 'Enero', ventaUSD: 640000, unidades: 1420 },
      { mes: 'Feb', label: 'Febrero', ventaUSD: 1210000, unidades: 2450 },
      { mes: 'Mar', label: 'Marzo', ventaUSD: 1090000, unidades: 2200 },
      { mes: 'Abr', label: 'Abril', ventaUSD: 1320000, unidades: 2600 },
      { mes: 'May', label: 'Mayo', ventaUSD: 1830000, unidades: 3300 },
      { mes: 'Jun', label: 'Junio', ventaUSD: 1560000, unidades: 2950 },
      { mes: 'Jul', label: 'Julio', ventaUSD: 2210000, unidades: 3800 },
      { mes: 'Nov', label: 'Noviembre', ventaUSD: 1880000, unidades: 3350 },
      { mes: 'Dec', label: 'Diciembre', ventaUSD: 2420000, unidades: 4200 },
    ],
    categories: [
      { categoria: 'Electrónica', ingreso: 2310, unidades: 1980, margen: 34.0 },
      { categoria: 'Ropa', ingreso: 1550, unidades: 2750, margen: 37.5 },
      { categoria: 'Hogar', ingreso: 1120, unidades: 1250, margen: 29.5 },
    ],
  },
  'retail_sales_q3_q4': {
    id: 'retail_sales_q3_q4',
    name: 'retail_sales_q3_q4.csv (Retail Multicategoría)',
    label: 'retail_sales_q3_q4.csv (Retail Multicategoría)',
    totalRegistros: 182400,
    ventasTotalesUSD: 2850000,
    margenPromedioPct: 34.8,
    metrics: {
      cantidad: 2.15,
      precioUnitario: 620.4,
      descuentoPct: 8.2,
      totalUSD: 1285.5,
      ticketPromedio: 104.8,
      margenPct: 34.8,
    },
    monthlySales: [
      { mes: 'Jan', label: 'Enero', ventaUSD: 720000, unidades: 1600 },
      { mes: 'Feb', label: 'Febrero', ventaUSD: 1350000, unidades: 2700 },
      { mes: 'Mar', label: 'Marzo', ventaUSD: 1200000, unidades: 2400 },
      { mes: 'Abr', label: 'Abril', ventaUSD: 1450000, unidades: 2900 },
      { mes: 'May', label: 'Mayo', ventaUSD: 1950000, unidades: 3500 },
      { mes: 'Jun', label: 'Junio', ventaUSD: 1720000, unidades: 3100 },
      { mes: 'Jul', label: 'Julio', ventaUSD: 2350000, unidades: 4100 },
      { mes: 'Nov', label: 'Noviembre', ventaUSD: 2050000, unidades: 3600 },
      { mes: 'Dec', label: 'Diciembre', ventaUSD: 2600000, unidades: 4500 },
    ],
    categories: [
      { categoria: 'Electrónica', ingreso: 2450, unidades: 2100, margen: 35.0 },
      { categoria: 'Ropa', ingreso: 1680, unidades: 2900, margen: 39.0 },
      { categoria: 'Hogar', ingreso: 1250, unidades: 1350, margen: 31.0 },
    ],
  },
  'precios_competencia_benchmark': {
    id: 'precios_competencia_benchmark',
    name: 'precios_competencia_benchmark.csv (Líderes de Mercado)',
    label: 'precios_competencia_benchmark.csv (Líderes de Mercado)',
    totalRegistros: 142100,
    ventasTotalesUSD: 1950000,
    margenPromedioPct: 29.4,
    metrics: {
      cantidad: 1.65,
      precioUnitario: 895.1,
      descuentoPct: 4.8,
      totalUSD: 1390.2,
      ticketPromedio: 118.0,
      margenPct: 29.4,
    },
    monthlySales: [
      { mes: 'Jan', label: 'Enero', ventaUSD: 420000, unidades: 1100 },
      { mes: 'Feb', label: 'Febrero', ventaUSD: 880000, unidades: 1900 },
      { mes: 'Mar', label: 'Marzo', ventaUSD: 790000, unidades: 1700 },
      { mes: 'Abr', label: 'Abril', ventaUSD: 750000, unidades: 1600 },
      { mes: 'May', label: 'Mayo', ventaUSD: 1220000, unidades: 2300 },
      { mes: 'Jun', label: 'Junio', ventaUSD: 1040000, unidades: 2100 },
      { mes: 'Jul', label: 'Julio', ventaUSD: 1410000, unidades: 2700 },
      { mes: 'Nov', label: 'Noviembre', ventaUSD: 1150000, unidades: 2200 },
      { mes: 'Dec', label: 'Diciembre', ventaUSD: 1620000, unidades: 3100 },
    ],
    categories: [
      { categoria: 'Electrónica', ingreso: 1920, unidades: 1650, margen: 30.0 },
      { categoria: 'Ropa', ingreso: 1180, unidades: 2150, margen: 33.5 },
      { categoria: 'Hogar', ingreso: 980, unidades: 1020, margen: 27.0 },
    ],
  },
  'inventario_regional_2026': {
    id: 'inventario_regional_2026',
    name: 'inventario_regional_2026.xlsx (Almacenes B2B)',
    label: 'inventario_regional_2026.xlsx (Almacenes B2B)',
    totalRegistros: 198500,
    ventasTotalesUSD: 2980000,
    margenPromedioPct: 36.2,
    metrics: {
      cantidad: 3.4,
      precioUnitario: 450.0,
      descuentoPct: 6.5,
      totalUSD: 1530.0,
      ticketPromedio: 85.0,
      margenPct: 36.2,
    },
    monthlySales: [
      { mes: 'Jan', label: 'Enero', ventaUSD: 810000, unidades: 1750 },
      { mes: 'Feb', label: 'Febrero', ventaUSD: 1420000, unidades: 2900 },
      { mes: 'Mar', label: 'Marzo', ventaUSD: 1280000, unidades: 2600 },
      { mes: 'Abr', label: 'Abril', ventaUSD: 1520000, unidades: 3050 },
      { mes: 'May', label: 'Mayo', ventaUSD: 2050000, unidades: 3700 },
      { mes: 'Jun', label: 'Junio', ventaUSD: 1850000, unidades: 3350 },
      { mes: 'Jul', label: 'Julio', ventaUSD: 2450000, unidades: 4300 },
      { mes: 'Nov', label: 'Noviembre', ventaUSD: 2180000, unidades: 3850 },
      { mes: 'Dec', label: 'Diciembre', ventaUSD: 2750000, unidades: 4800 },
    ],
    categories: [
      { categoria: 'Electrónica', ingreso: 2580, unidades: 2250, margen: 36.5 },
      { categoria: 'Ropa', ingreso: 1750, unidades: 3100, margen: 40.0 },
      { categoria: 'Hogar', ingreso: 1320, unidades: 1450, margen: 32.5 },
    ],
  },
};

type MetricCategoryType = 'ingreso' | 'unidades' | 'margen';

interface ComparacionAnalisisProps {
  onNavigate?: (view: string) => void;
}

export default function ComparacionAnalisis({ onNavigate }: ComparacionAnalisisProps) {
  // Dual Selectors State (Dataset A vs Dataset B)
  const [selectedDatasetA, setSelectedDatasetA] = useState<string>(
    'export_export_ventas_tienda_tech_4000'
  );
  const [selectedDatasetB, setSelectedDatasetB] = useState<string>(
    'export_export_export_ventas_tienda_tech_4000'
  );

  const [activeCategoryMetric, setActiveCategoryMetric] = useState<MetricCategoryType>('ingreso');
  const [chartVisualMode, setChartVisualMode] = useState<'line' | 'area'>('line');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentDatasetA =
    availableBenchmarkDatasets[selectedDatasetA] ||
    availableBenchmarkDatasets['export_export_ventas_tienda_tech_4000'];
  const currentDatasetB =
    availableBenchmarkDatasets[selectedDatasetB] ||
    availableBenchmarkDatasets['export_export_export_ventas_tienda_tech_4000'];

  // Calculate comparison deltas for Top KPI Banner
  const kpiDeltas = useMemo(() => {
    const calcPct = (a: number, b: number) => {
      if (a === 0) return 0;
      return ((b - a) / a) * 100;
    };

    const deltaRegistros = calcPct(currentDatasetA.totalRegistros, currentDatasetB.totalRegistros);
    const deltaVentas = calcPct(currentDatasetA.ventasTotalesUSD, currentDatasetB.ventasTotalesUSD);
    const deltaMargen = currentDatasetB.margenPromedioPct - currentDatasetA.margenPromedioPct;

    const formatMillions = (val: number) => {
      return `$${(val / 1000000).toFixed(1)}M`;
    };

    return {
      registros: {
        valA: currentDatasetA.totalRegistros.toLocaleString(),
        valB: currentDatasetB.totalRegistros.toLocaleString(),
        delta: deltaRegistros,
        formattedDelta: `${deltaRegistros >= 0 ? '+' : ''}${deltaRegistros.toFixed(1)}%`,
      },
      ventas: {
        valA: formatMillions(currentDatasetA.ventasTotalesUSD),
        valB: formatMillions(currentDatasetB.ventasTotalesUSD),
        delta: deltaVentas,
        formattedDelta: `${deltaVentas >= 0 ? '+' : ''}${deltaVentas.toFixed(1)}%`,
      },
      margen: {
        valA: `${currentDatasetA.margenPromedioPct.toFixed(1)}%`,
        valB: `${currentDatasetB.margenPromedioPct.toFixed(1)}%`,
        delta: deltaMargen,
        formattedDelta: `${deltaMargen >= 0 ? '+' : ''}${deltaMargen.toFixed(1)}%`,
      },
    };
  }, [currentDatasetA, currentDatasetB]);

  // Numerical metrics row calculation
  const numericalMetrics = useMemo(() => {
    const calcPctDiff = (valA: number, valB: number) => {
      if (valB === 0) return 0;
      return ((valA - valB) / valB) * 100;
    };

    return [
      {
        key: 'cantidad',
        label: 'Cantidad promedio por ticket',
        valA: currentDatasetA.metrics.cantidad.toFixed(2),
        valB: currentDatasetB.metrics.cantidad.toFixed(2),
        diffPct: calcPctDiff(
          currentDatasetA.metrics.cantidad,
          currentDatasetB.metrics.cantidad
        ),
      },
      {
        key: 'precio_unitario',
        label: 'Precio Unitario USD',
        valA: `$${currentDatasetA.metrics.precioUnitario.toFixed(2)}`,
        valB: `$${currentDatasetB.metrics.precioUnitario.toFixed(2)}`,
        diffPct: calcPctDiff(
          currentDatasetA.metrics.precioUnitario,
          currentDatasetB.metrics.precioUnitario
        ),
      },
      {
        key: 'descuento',
        label: 'Descuento Promedio %',
        valA: `${currentDatasetA.metrics.descuentoPct.toFixed(2)}%`,
        valB: `${currentDatasetB.metrics.descuentoPct.toFixed(2)}%`,
        diffPct: currentDatasetA.metrics.descuentoPct - currentDatasetB.metrics.descuentoPct,
      },
      {
        key: 'ticket_promedio',
        label: 'Ticket Promedio USD',
        valA: `$${currentDatasetA.metrics.ticketPromedio.toFixed(2)}`,
        valB: `$${currentDatasetB.metrics.ticketPromedio.toFixed(2)}`,
        diffPct: calcPctDiff(
          currentDatasetA.metrics.ticketPromedio,
          currentDatasetB.metrics.ticketPromedio
        ),
      },
      {
        key: 'margen_operativo',
        label: 'Margen Operativo Promedio',
        valA: `${currentDatasetA.metrics.margenPct.toFixed(1)}%`,
        valB: `${currentDatasetB.metrics.margenPct.toFixed(1)}%`,
        diffPct: currentDatasetA.metrics.margenPct - currentDatasetB.metrics.margenPct,
      },
    ];
  }, [currentDatasetA, currentDatasetB]);

  // Months data synchronization
  const monthsData = useMemo(() => {
    const months = currentDatasetA.monthlySales.map((m, idx) => {
      const matchB = currentDatasetB.monthlySales[idx] || m;
      return {
        mes: m.mes,
        label: m.label,
        valA: m.ventaUSD,
        valB: matchB.ventaUSD,
      };
    });
    return months;
  }, [currentDatasetA, currentDatasetB]);

  // SVG Line Chart Coordinate calculation
  const maxMonthlyVal = 2500000;
  const svgWidth = 560;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (monthsData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (monthsData.length - 1)) * chartInnerWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxMonthlyVal));
    return paddingTop + chartInnerHeight - (clamped / maxMonthlyVal) * chartInnerHeight;
  };

  // Build SVG Path strings
  const pathA = useMemo(() => {
    return monthsData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.valA)}`)
      .join(' ');
  }, [monthsData]);

  const pathB = useMemo(() => {
    return monthsData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.valB)}`)
      .join(' ');
  }, [monthsData]);

  const areaA = useMemo(() => {
    if (monthsData.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(monthsData.length - 1);
    const bottomY = paddingTop + chartInnerHeight;
    return `${pathA} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathA, monthsData]);

  const areaB = useMemo(() => {
    if (monthsData.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(monthsData.length - 1);
    const bottomY = paddingTop + chartInnerHeight;
    return `${pathB} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathB, monthsData]);

  // Category comparison data
  const maxCategoryScale = 2500;
  const categoriesData = useMemo(() => {
    return currentDatasetA.categories.map((catA, idx) => {
      const catB = currentDatasetB.categories[idx] || catA;
      let valA = catA.ingreso;
      let valB = catB.ingreso;

      if (activeCategoryMetric === 'unidades') {
        valA = catA.unidades;
        valB = catB.unidades;
      } else if (activeCategoryMetric === 'margen') {
        valA = catA.margen;
        valB = catB.margen;
      }

      return {
        categoria: catA.categoria,
        valA,
        valB,
        rawA: catA,
        rawB: catB,
      };
    });
  }, [currentDatasetA, currentDatasetB, activeCategoryMetric]);

  const handleExportBenchmarking = () => {
    showToast(
      `Generando informe comparativo "${currentDatasetA.name} vs ${currentDatasetB.name}"... ✓`
    );
  };

  return (
    <div className="analyst-view-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="analyst-toast-banner" role="alert">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          1. SUB-TABS NAVEGACIÓN SUPERIOR
          ========================================================= */}
      <div className="analyst-nav-subtabs-bar">
        <div className="subtabs-left">
          <button
            className="subtab-item"
            onClick={() => onNavigate?.('observacion')}
          >
            <Table2 size={16} />
            <span>Observación de Datos</span>
          </button>
          <button
            className="subtab-item active"
            onClick={() => onNavigate?.('comparacion')}
            aria-current="page"
          >
            <GitCompare size={16} />
            <span>Comparación y Análisis</span>
          </button>
        </div>

        <div className="subtabs-right">
          <button
            type="button"
            className="btn-export-benchmarking"
            onClick={handleExportBenchmarking}
            title="Exportar informe de benchmarking"
          >
            <Download size={13} />
            <span>Exportar Informe</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. DUAL DATASET SELECTORS (A vs B)
          ========================================================= */}
      <div className="benchmark-dual-selectors-row">
        {/* Dataset A Selector (Blue Theme) */}
        <div className="benchmark-selector-card card-theme-dataset-a">
          <div className="selector-card-header">
            <span className="selector-card-label text-dataset-a">
              <span className="selector-dot dot-dataset-a" />
              Dataset A (Mi Negocio / Base)
            </span>
          </div>
          <div className="selector-input-container">
            <select
              className="benchmark-custom-select select-dataset-a"
              value={selectedDatasetA}
              onChange={(e) => setSelectedDatasetA(e.target.value)}
              aria-label="Seleccionar dataset A"
            >
              {Object.values(availableBenchmarkDatasets).map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="selector-select-arrow" />
          </div>
        </div>

        {/* Dataset B Selector (Orange Theme) */}
        <div className="benchmark-selector-card card-theme-dataset-b">
          <div className="selector-card-header">
            <span className="selector-card-label text-dataset-b">
              <span className="selector-dot dot-dataset-b" />
              Dataset B (Competencia / Comparativa)
            </span>
          </div>
          <div className="selector-input-container">
            <select
              className="benchmark-custom-select select-dataset-b"
              value={selectedDatasetB}
              onChange={(e) => setSelectedDatasetB(e.target.value)}
              aria-label="Seleccionar dataset B"
            >
              {Object.values(availableBenchmarkDatasets).map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="selector-select-arrow" />
          </div>
        </div>
      </div>

      {/* =========================================================
          3. TOP SUMMARY BANNER (EXACT TO REFERENCE IMAGE)
          ========================================================= */}
      <div className="comp-top-summary-card">
        <div className="comp-summary-header-row">
          <h2 className="comp-summary-title">
            Comparación: {currentDatasetA.name} vs {currentDatasetB.name}
          </h2>
        </div>

        <div className="comp-kpi-summary-grid">
          {/* KPI 1: Total Registros */}
          <div className="comp-kpi-summary-col">
            <span className="comp-kpi-metric-label">Total Registros</span>
            <div className="comp-kpi-figures-row">
              <span className="comp-kpi-val-a">
                <span className="label-letter">A:</span> {kpiDeltas.registros.valA}
              </span>
              <span className="comp-kpi-divider">|</span>
              <span className="comp-kpi-val-b">
                <span className="label-letter">B:</span> {kpiDeltas.registros.valB}
              </span>
              <span
                className={`comp-kpi-delta-pill ${
                  kpiDeltas.registros.delta >= 0 ? 'delta-pos' : 'delta-neg'
                }`}
              >
                Δ:{kpiDeltas.registros.formattedDelta}
              </span>
            </div>
          </div>

          {/* KPI 2: Ventas Totales */}
          <div className="comp-kpi-summary-col">
            <span className="comp-kpi-metric-label">Ventas Totales</span>
            <div className="comp-kpi-figures-row">
              <span className="comp-kpi-val-a">
                <span className="label-letter">A:</span> {kpiDeltas.ventas.valA}
              </span>
              <span className="comp-kpi-divider">|</span>
              <span className="comp-kpi-val-b">
                <span className="label-letter">B:</span> {kpiDeltas.ventas.valB}
              </span>
              <span
                className={`comp-kpi-delta-pill ${
                  kpiDeltas.ventas.delta >= 0 ? 'delta-pos' : 'delta-neg'
                }`}
              >
                Δ:{kpiDeltas.ventas.formattedDelta}
              </span>
            </div>
          </div>

          {/* KPI 3: Margen Promedio */}
          <div className="comp-kpi-summary-col">
            <span className="comp-kpi-metric-label">Margen Promedio</span>
            <div className="comp-kpi-figures-row">
              <span className="comp-kpi-val-a">
                <span className="label-letter">A:</span> {kpiDeltas.margen.valA}
              </span>
              <span className="comp-kpi-divider">|</span>
              <span className="comp-kpi-val-b">
                <span className="label-letter">B:</span> {kpiDeltas.margen.valB}
              </span>
              <span
                className={`comp-kpi-delta-pill ${
                  kpiDeltas.margen.delta >= 0 ? 'delta-pos' : 'delta-neg'
                }`}
              >
                Δ:{kpiDeltas.margen.formattedDelta}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          4. DASHBOARD SECTION (2 CHARTS SIDE BY SIDE)
          ========================================================= */}
      <div className="comp-dashboard-section">
        <div className="comp-dashboard-heading-row">
          <h3 className="comp-dashboard-section-title">Dashboard:</h3>
        </div>

        <div className="comp-charts-dual-grid">
          {/* -------------------------------------------------------
              CHART 1: Tendencia de Ventas Mensuales (Línea A vs B)
              ------------------------------------------------------- */}
          <div className="comp-chart-card">
            <div className="comp-chart-card-header">
              <div className="comp-chart-title-group">
                <h4 className="comp-chart-title">
                  Tendencia de Ventas Mensuales ({selectedDatasetA === selectedDatasetB ? 'A vs B' : 'A vs B'})
                </h4>
              </div>

              <div className="comp-chart-header-actions">
                <button
                  type="button"
                  className="comp-icon-btn"
                  title="Opciones de visualización"
                  onClick={() => setChartVisualMode(m => (m === 'line' ? 'area' : 'line'))}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="comp-chart-legend-row">
              <div className="comp-legend-pill">
                <span className="legend-marker marker-blue" />
                <span className="legend-label">A (Azul)</span>
              </div>
              <div className="comp-legend-pill">
                <span className="legend-marker marker-orange" />
                <span className="legend-label">B (Naranja)</span>
              </div>
            </div>

            {/* SVG Interactive Line / Area Chart */}
            <div className="comp-svg-chart-container">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="comp-responsive-svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis labels */}
                {[0, 500000, 1000000, 1500000, 2000000, 2500000].map((tick) => {
                  const y = getY(tick);
                  const formattedTick = tick === 0 ? '0' : tick.toLocaleString();
                  return (
                    <g key={tick} className="svg-grid-group">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        className="svg-grid-line"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="svg-y-axis-text"
                      >
                        {formattedTick}
                      </text>
                    </g>
                  );
                })}

                {/* Area Fills if enabled */}
                {chartVisualMode === 'area' && (
                  <>
                    <path d={areaB} fill="url(#orangeGradient)" />
                    <path d={areaA} fill="url(#blueGradient)" />
                  </>
                )}

                {/* Line A (Blue) */}
                <path
                  d={pathA}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="svg-chart-path-a"
                />

                {/* Line B (Orange) */}
                <path
                  d={pathB}
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="svg-chart-path-b"
                />

                {/* Month Points & Interactive Columns */}
                {monthsData.map((d, idx) => {
                  const x = getX(idx);
                  const yA = getY(d.valA);
                  const yB = getY(d.valB);
                  const isHovered = hoveredMonthIndex === idx;

                  return (
                    <g key={d.mes} className="svg-point-column">
                      {/* Vertical Indicator Line on Hover */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={paddingTop}
                          x2={x}
                          y2={paddingTop + chartInnerHeight}
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Dot for Line A */}
                      <circle
                        cx={x}
                        cy={yA}
                        r={isHovered ? 6 : 4}
                        fill="#38bdf8"
                        stroke="#0f172a"
                        strokeWidth={2}
                        className="svg-data-dot dot-a"
                      />

                      {/* Dot for Line B */}
                      <circle
                        cx={x}
                        cy={yB}
                        r={isHovered ? 6 : 4}
                        fill="#fb923c"
                        stroke="#0f172a"
                        strokeWidth={2}
                        className="svg-data-dot dot-b"
                      />

                      {/* X-Axis Month Label */}
                      <text
                        x={x}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        className={`svg-x-axis-text ${isHovered ? 'active' : ''}`}
                      >
                        {d.mes}
                      </text>

                      {/* Invisible Hover Target Rect */}
                      <rect
                        x={x - 20}
                        y={paddingTop}
                        width={40}
                        height={chartInnerHeight + 25}
                        fill="transparent"
                        className="svg-hover-target"
                        onMouseEnter={() => setHoveredMonthIndex(idx)}
                        onMouseLeave={() => setHoveredMonthIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip on Point Hover */}
              {hoveredMonthIndex !== null && (
                <div
                  className="comp-chart-floating-tooltip"
                  style={{
                    left: `${(getX(hoveredMonthIndex) / svgWidth) * 100}%`,
                    top: '20px',
                  }}
                >
                  <div className="tooltip-month-title">
                    {monthsData[hoveredMonthIndex].label}
                  </div>
                  <div className="tooltip-val-row text-blue">
                    <span>A:</span>
                    <strong>${monthsData[hoveredMonthIndex].valA.toLocaleString()}</strong>
                  </div>
                  <div className="tooltip-val-row text-orange">
                    <span>B:</span>
                    <strong>${monthsData[hoveredMonthIndex].valB.toLocaleString()}</strong>
                  </div>
                  <div className="tooltip-delta-footer">
                    <span>Δ Variación:</span>
                    <strong
                      className={
                        monthsData[hoveredMonthIndex].valB >= monthsData[hoveredMonthIndex].valA
                          ? 'delta-pos'
                          : 'delta-neg'
                      }
                    >
                      {monthsData[hoveredMonthIndex].valA !== 0
                        ? `${(
                            ((monthsData[hoveredMonthIndex].valB -
                              monthsData[hoveredMonthIndex].valA) /
                              monthsData[hoveredMonthIndex].valA) *
                            100
                          ).toFixed(1)}%`
                        : '0%'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------
              CHART 2: Distribución por Categoría de Producto (Barras)
              ------------------------------------------------------- */}
          <div className="comp-chart-card">
            <div className="comp-chart-card-header">
              <div className="comp-chart-title-group">
                <h4 className="comp-chart-title">Distribución por Categoría de Producto</h4>
              </div>

              {/* Metric filter buttons */}
              <div className="comp-category-metric-pills">
                <button
                  type="button"
                  className={`metric-pill-btn ${activeCategoryMetric === 'ingreso' ? 'active' : ''}`}
                  onClick={() => setActiveCategoryMetric('ingreso')}
                >
                  Ingresos
                </button>
                <button
                  type="button"
                  className={`metric-pill-btn ${activeCategoryMetric === 'unidades' ? 'active' : ''}`}
                  onClick={() => setActiveCategoryMetric('unidades')}
                >
                  Unidades
                </button>
                <button
                  type="button"
                  className={`metric-pill-btn ${activeCategoryMetric === 'margen' ? 'active' : ''}`}
                  onClick={() => setActiveCategoryMetric('margen')}
                >
                  Margen
                </button>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="comp-chart-legend-row">
              <div className="comp-legend-pill">
                <span className="legend-rect rect-blue" />
                <span className="legend-label">A & B (Azul = A)</span>
              </div>
              <div className="comp-legend-pill">
                <span className="legend-rect rect-orange" />
                <span className="legend-label">A & B (Naranja = B)</span>
              </div>
            </div>

            {/* Grouped Dual Bar Visual Container */}
            <div className="comp-grouped-bars-container">
              {/* Y Axis Grid Ticks */}
              <div className="comp-bars-y-axis">
                {[2500, 2000, 1500, 1000, 500, 0].map((tick) => (
                  <div key={tick} className="y-axis-tick">
                    <span>{tick}</span>
                  </div>
                ))}
              </div>

              {/* Bars Grid */}
              <div className="comp-bars-stage">
                {/* Horizontal Gridlines */}
                <div className="comp-bars-gridlines">
                  <div className="gridline" />
                  <div className="gridline" />
                  <div className="gridline" />
                  <div className="gridline" />
                  <div className="gridline" />
                  <div className="gridline baseline" />
                </div>

                {/* Category Column Pairs */}
                <div className="comp-bar-columns-row">
                  {categoriesData.map((cat, idx) => {
                    const heightA = Math.min(100, (cat.valA / maxCategoryScale) * 100);
                    const heightB = Math.min(100, (cat.valB / maxCategoryScale) * 100);
                    const isHovered = hoveredCategoryIndex === idx;

                    return (
                      <div
                        key={cat.categoria}
                        className={`comp-category-pair ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredCategoryIndex(idx)}
                        onMouseLeave={() => setHoveredCategoryIndex(null)}
                      >
                        {/* Dual Vertical Bars */}
                        <div className="comp-bars-pair-track">
                          {/* Bar A (Blue) */}
                          <div
                            className="comp-single-bar bar-a-blue"
                            style={{ height: `${heightA}%` }}
                          >
                            <span className="bar-hover-val">{cat.valA}</span>
                          </div>

                          {/* Bar B (Orange) */}
                          <div
                            className="comp-single-bar bar-b-orange"
                            style={{ height: `${heightB}%` }}
                          >
                            <span className="bar-hover-val">{cat.valB}</span>
                          </div>
                        </div>

                        {/* X-Axis Category Label */}
                        <div className="comp-category-label">{cat.categoria}</div>

                        {/* Hover Category Delta Tooltip */}
                        {isHovered && (
                          <div className="comp-bar-floating-tooltip">
                            <div className="tooltip-cat-name">{cat.categoria}</div>
                            <div className="tooltip-cat-row text-blue">
                              <span>A:</span>
                              <strong>{cat.valA.toLocaleString()}</strong>
                            </div>
                            <div className="tooltip-cat-row text-orange">
                              <span>B:</span>
                              <strong>{cat.valB.toLocaleString()}</strong>
                            </div>
                            <div className="tooltip-cat-delta">
                              <span>Δ Diferencia:</span>
                              <strong
                                className={cat.valB >= cat.valA ? 'delta-pos' : 'delta-neg'}
                              >
                                {cat.valA !== 0
                                  ? `${(((cat.valB - cat.valA) / cat.valA) * 100).toFixed(1)}%`
                                  : '0%'}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          5. DETAILED NUMERICAL METRICS TABLE
          ========================================================= */}
      <div className="benchmark-section-card">
        <div className="benchmark-section-header">
          <div className="benchmark-section-title-group">
            <Layers size={18} className="text-blue" />
            <h3 className="benchmark-section-title">Detalle de Métricas y Factores de Rendimiento</h3>
          </div>
          <span className="benchmark-section-badge">Contraste de valores promedio</span>
        </div>

        <div className="benchmark-table-wrapper">
          <table className="benchmark-clean-table">
            <thead>
              <tr>
                <th className="th-metric">Métrica (promedio)</th>
                <th className="th-mine">Dataset A (Mi negocio)</th>
                <th className="th-rival">Dataset B (Competencia)</th>
                <th className="th-diff">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {numericalMetrics.map((row) => {
                const isZero = Math.abs(row.diffPct) < 0.001;
                const isPos = row.diffPct > 0;
                let deltaText = '+0.0%';
                if (!isZero) {
                  deltaText = `${isPos ? '+' : ''}${row.diffPct.toFixed(1)}%`;
                }

                return (
                  <tr key={row.key} className="benchmark-table-row">
                    <td className="td-metric">
                      <span className="metric-name-text">{row.label}</span>
                    </td>
                    <td className="td-mine">
                      <span className="val-text-mine">{row.valA}</span>
                    </td>
                    <td className="td-rival">
                      <span className="val-text-rival">{row.valB}</span>
                    </td>
                    <td className="td-diff">
                      <span
                        className={`diff-pill ${
                          isZero
                            ? 'diff-neutral'
                            : isPos
                            ? 'diff-positive'
                            : 'diff-negative'
                        }`}
                      >
                        {isZero ? (
                          <span>+0.0%</span>
                        ) : isPos ? (
                          <>
                            <TrendingUp size={12} />
                            <span>{deltaText}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown size={12} />
                            <span>{deltaText}</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          6. INSIGHTS & RECOMENDACIONES DE BENCHMARKING
          ========================================================= */}
      <div className="benchmark-insights-grid">
        <div className="benchmark-insight-card">
          <div className="insight-card-top">
            <div className="insight-icon-circle icon-emerald">
              <Lightbulb size={16} />
            </div>
            <h4 className="insight-header-title">Oportunidad de Volumen de Ventas</h4>
          </div>
          <p className="insight-card-body">
            Dataset B muestra un crecimiento acumulado de <strong>+{kpiDeltas.ventas.formattedDelta}</strong> en
            ventas totales, impulsado especialmente por los picos en <strong>Julio y Diciembre</strong>.
          </p>
          <div className="insight-card-badge badge-emerald">
            <span>Optimizar campañas de temporada alta</span>
          </div>
        </div>

        <div className="benchmark-insight-card">
          <div className="insight-card-top">
            <div className="insight-icon-circle icon-amber">
              <AlertTriangle size={16} />
            </div>
            <h4 className="insight-header-title">Margen y Competitividad</h4>
          </div>
          <p className="insight-card-body">
            En la categoría <strong>Electrónica</strong>, la brecha de distribución es de{' '}
            <strong>+{(((categoriesData[0].valB - categoriesData[0].valA) / (categoriesData[0].valA || 1)) * 100).toFixed(1)}%</strong> a favor de B.
            Evaluar estrategias de bundling y promociones por volumen.
          </p>
          <div className="insight-card-badge badge-amber">
            <span>Acción sugerida: Paquetes combinados</span>
          </div>
        </div>

        <div className="benchmark-insight-card">
          <div className="insight-card-top">
            <div className="insight-icon-circle icon-blue">
              <Sparkles size={16} />
            </div>
            <h4 className="insight-header-title">Ticket Promedio y Fidelización</h4>
          </div>
          <p className="insight-card-body">
            El ticket promedio se sitúa en <strong>${currentDatasetA.metrics.ticketPromedio.toFixed(2)}</strong> vs{' '}
            <strong>${currentDatasetB.metrics.ticketPromedio.toFixed(2)}</strong>. Implementar incentivos de cross-selling
            puede equilibrar la brecha de ingresos.
          </p>
          <div className="insight-card-badge badge-blue">
            <span>Estrategia de Cross-selling activa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
