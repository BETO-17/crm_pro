import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Send,
  MoreHorizontal,
  Bot,
  UserCircle,
  X,
  Download,
  RefreshCw,
  Database,
  TrendingUp,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export interface DatasetOption {
  tableName: string;
  displayName: string;
  totalRows?: number;
  totalColumns?: number;
  sector?: string;
}

export type CompTab = 'precios' | 'ventas' | 'ofertas' | 'estrategias' | 'todos';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

type RowData = Record<string, unknown>;

const cleanColumnName = (colName: string): string => {
  let cleanName = colName.replace(/[^a-zA-Z0-9_]/g, '_').trim().toLowerCase();
  if (cleanName && /^[0-9]/.test(cleanName)) {
    cleanName = 'col_' + cleanName;
  }
  return cleanName;
};

const getTableNameFromFilename = (filename: string): string => {
  const baseName = cleanColumnName(filename.replace(/\.csv$/i, ''));
  return `dataset_${baseName}`;
};

const defaultDatasetOptions: DatasetOption[] = [
  { tableName: 'dataset_gadgetcorp_ventas', displayName: 'GadgetCorp_Ventas.csv', totalRows: 3200, sector: 'Retail' },
  { tableName: 'dataset_ventas_tienda_tech_4000', displayName: 'ventas_tienda_tech_4000.csv', totalRows: 4000, sector: 'Tecnología' },
  { tableName: 'dataset_ventas_tecnologia_limpio', displayName: 'ventas_tecnologia_limpio.csv', totalRows: 1813, sector: 'Tecnología' },
  { tableName: 'dataset_fetch_california_housing', displayName: 'fetch_california_housing.csv', totalRows: 20640, sector: 'Finanzas' },
  { tableName: 'dataset_train', displayName: 'train.csv', totalRows: 891, sector: 'Logística' },
];

const sectors = ['Todos los rubros', 'Retail', 'Tecnología', 'Logística', 'Finanzas'];

export default function ComparacionAnalisis() {
  const [datasetsList, setDatasetsList] = useState<DatasetOption[]>(defaultDatasetOptions);
  const [tableA, setTableA] = useState<string>('dataset_gadgetcorp_ventas');
  const [tableB, setTableB] = useState<string>('dataset_ventas_tienda_tech_4000');
  const [activeTab, setActiveTab] = useState<CompTab>('precios');
  const [sectorFilter, setSectorFilter] = useState<string>('Todos los rubros');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Data loaded directly from Supabase
  const [rowsA, setRowsA] = useState<RowData[]>([]);
  const [rowsB, setRowsB] = useState<RowData[]>([]);
  const [loadingA, setLoadingA] = useState<boolean>(false);
  const [loadingB, setLoadingB] = useState<boolean>(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modal selector state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTargetPanel, setModalTargetPanel] = useState<'A' | 'B'>('B');
  const [modalSearch, setModalSearch] = useState<string>('');

  // AI Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola! He conectado las tablas de Supabase en tiempo real.\n\nPuedes comparar Precios, Ventas, Ofertas y Estrategias comerciales entre ambos datasets. Hazme cualquier pregunta o haz clic en las sugerencias abajo.',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [strategicAiSummary, setStrategicAiSummary] = useState<string | null>(null);

  // Load available datasets from Supabase and localStorage
  useEffect(() => {
    let isMounted = true;
    const fetchDatasets = async () => {
      try {
        const mergedList = [...defaultDatasetOptions];

        // Local storage saved datasets
        const localSavedStr = localStorage.getItem('analyst_saved_datasets');
        if (localSavedStr) {
          try {
            const localParsed = JSON.parse(localSavedStr) as Array<{
              tableName?: string;
              name?: string;
              rows?: number;
              columnsCount?: number;
              sector?: string;
            }>;
            localParsed.forEach((item) => {
              if (item.tableName && !mergedList.some((d) => d.tableName === item.tableName)) {
                mergedList.unshift({
                  tableName: item.tableName,
                  displayName: item.name || item.tableName,
                  totalRows: item.rows,
                  totalColumns: item.columnsCount,
                  sector: item.sector || 'Retail',
                });
              }
            });
          } catch {
            // ignore
          }
        }

        // Supabase datasets table
        const { data, error } = await supabase
          .from('datasets')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          (data as Array<{ filename?: string; name?: string; total_rows?: number; total_columns?: number; tags?: string[] }>).forEach((d) => {
            const tName = getTableNameFromFilename(d.filename || d.name || '');
            if (!mergedList.some((item) => item.tableName === tName)) {
              mergedList.unshift({
                tableName: tName,
                displayName: d.name || d.filename || tName,
                totalRows: d.total_rows,
                totalColumns: d.total_columns,
                sector: d.tags && d.tags.length > 0 ? d.tags[0] : 'Retail',
              });
            }
          });
        }

        if (isMounted) {
          setDatasetsList(mergedList);
        }
      } catch (err) {
        console.error('Error cargando datasets desde Supabase:', err);
      }
    };

    void fetchDatasets();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Table A directly from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchTableA = async () => {
      if (!tableA) return;
      setLoadingA(true);
      setErrorA(null);
      try {
        const { data, error } = await supabase
          .from(tableA)
          .select('*')
          .limit(30);

        if (!isMounted) return;
        if (error) {
          setErrorA(error.message);
          setRowsA([]);
        } else {
          setRowsA((data as RowData[]) || []);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setErrorA(err instanceof Error ? err.message : 'Error al conectar con Supabase');
        setRowsA([]);
      } finally {
        if (isMounted) setLoadingA(false);
      }
    };

    void fetchTableA();
    return () => {
      isMounted = false;
    };
  }, [tableA, refreshTrigger]);

  // Fetch Table B directly from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchTableB = async () => {
      if (!tableB) return;
      setLoadingB(true);
      setErrorB(null);
      try {
        const { data, error } = await supabase
          .from(tableB)
          .select('*')
          .limit(30);

        if (!isMounted) return;
        if (error) {
          setErrorB(error.message);
          setRowsB([]);
        } else {
          setRowsB((data as RowData[]) || []);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setErrorB(err instanceof Error ? err.message : 'Error al conectar con Supabase');
        setRowsB([]);
      } finally {
        if (isMounted) setLoadingB(false);
      }
    };

    void fetchTableB();
    return () => {
      isMounted = false;
    };
  }, [tableB, refreshTrigger]);

  // Find column helper
  const findColumn = (rows: RowData[], patterns: string[]): string | null => {
    if (!rows || rows.length === 0) return null;
    const cols = Object.keys(rows[0]);
    for (const p of patterns) {
      const found = cols.find((c) => c.toLowerCase().includes(p.toLowerCase()));
      if (found) return found;
    }
    return null;
  };

  // Detect key metric columns for each table
  const metricsA = useMemo(() => {
    const priceCol = findColumn(rowsA, ['precio', 'price', 'unit_price', 'precio_final', 'precio_base', 'sales']);
    const discountCol = findColumn(rowsA, ['descuento', 'discount', 'rebaja', 'porcentaje']);
    const salesCol = findColumn(rowsA, ['total_facturado', 'total_usd', 'sales', 'total', 'monto']);
    const productCol = findColumn(rowsA, ['articulo', 'product_name', 'modelo', 'marca', 'categoria', 'sku', 'product_id']);
    const quantityCol = findColumn(rowsA, ['cantidad', 'quantity', 'unidades', 'cant']);

    let avgPrice = 0;
    if (priceCol && rowsA.length > 0) {
      const vals = rowsA.map((r) => Number(r[priceCol])).filter((v) => !isNaN(v) && v > 0);
      if (vals.length > 0) avgPrice = vals.reduce((a, b) => a + b, 0) / vals.length;
    }

    let avgDiscount = 0;
    if (discountCol && rowsA.length > 0) {
      const vals = rowsA.map((r) => Number(r[discountCol])).filter((v) => !isNaN(v) && v >= 0);
      if (vals.length > 0) avgDiscount = vals.reduce((a, b) => a + b, 0) / vals.length;
    }

    let totalSales = 0;
    if (salesCol && rowsA.length > 0) {
      const vals = rowsA.map((r) => Number(r[salesCol])).filter((v) => !isNaN(v));
      if (vals.length > 0) totalSales = vals.reduce((a, b) => a + b, 0);
    }

    return { priceCol, discountCol, salesCol, productCol, quantityCol, avgPrice, avgDiscount, totalSales };
  }, [rowsA]);

  const metricsB = useMemo(() => {
    const priceCol = findColumn(rowsB, ['precio', 'price', 'unit_price', 'precio_final', 'precio_base', 'sales']);
    const discountCol = findColumn(rowsB, ['descuento', 'discount', 'rebaja', 'porcentaje']);
    const salesCol = findColumn(rowsB, ['total_facturado', 'total_usd', 'sales', 'total', 'monto']);
    const productCol = findColumn(rowsB, ['articulo', 'product_name', 'modelo', 'marca', 'categoria', 'sku', 'product_id']);
    const quantityCol = findColumn(rowsB, ['cantidad', 'quantity', 'unidades', 'cant']);

    let avgPrice = 0;
    if (priceCol && rowsB.length > 0) {
      const vals = rowsB.map((r) => Number(r[priceCol])).filter((v) => !isNaN(v) && v > 0);
      if (vals.length > 0) avgPrice = vals.reduce((a, b) => a + b, 0) / vals.length;
    }

    let avgDiscount = 0;
    if (discountCol && rowsB.length > 0) {
      const vals = rowsB.map((r) => Number(r[discountCol])).filter((v) => !isNaN(v) && v >= 0);
      if (vals.length > 0) avgDiscount = vals.reduce((a, b) => a + b, 0) / vals.length;
    }

    let totalSales = 0;
    if (salesCol && rowsB.length > 0) {
      const vals = rowsB.map((r) => Number(r[salesCol])).filter((v) => !isNaN(v));
      if (vals.length > 0) totalSales = vals.reduce((a, b) => a + b, 0);
    }

    return { priceCol, discountCol, salesCol, productCol, quantityCol, avgPrice, avgDiscount, totalSales };
  }, [rowsB]);

  // Display names for active tables
  const displayNameA = datasetsList.find((d) => d.tableName === tableA)?.displayName || tableA;
  const displayNameB = datasetsList.find((d) => d.tableName === tableB)?.displayName || tableB;

  // Filtered rows by search term
  const filteredRowsA = useMemo(() => {
    if (!searchTerm.trim()) return rowsA;
    const term = searchTerm.toLowerCase();
    return rowsA.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [rowsA, searchTerm]);

  const filteredRowsB = useMemo(() => {
    if (!searchTerm.trim()) return rowsB;
    const term = searchTerm.toLowerCase();
    return rowsB.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [rowsB, searchTerm]);

  // Columns to display according to activeTab
  const getVisibleColumns = useCallback((rows: RowData[]) => {
    if (!rows || rows.length === 0) return [];
    const allCols = Object.keys(rows[0]).filter((c) => c !== 'id');

    if (activeTab === 'precios') {
      const relevant = allCols.filter((c) =>
        ['precio', 'price', 'final', 'base', 'costo', 'cost', 'articulo', 'producto', 'product', 'sku', 'categoria', 'brand'].some(
          (k) => c.toLowerCase().includes(k)
        )
      );
      return relevant.length > 0 ? relevant.slice(0, 5) : allCols.slice(0, 5);
    }

    if (activeTab === 'ventas') {
      const relevant = allCols.filter((c) =>
        ['venta', 'sales', 'total', 'cantidad', 'facturado', 'articulo', 'product', 'vendedor', 'cliente'].some((k) =>
          c.toLowerCase().includes(k)
        )
      );
      return relevant.length > 0 ? relevant.slice(0, 5) : allCols.slice(0, 5);
    }

    if (activeTab === 'ofertas') {
      const relevant = allCols.filter((c) =>
        ['descuento', 'discount', 'oferta', 'promo', 'porcentaje', 'precio', 'articulo', 'product'].some((k) =>
          c.toLowerCase().includes(k)
        )
      );
      return relevant.length > 0 ? relevant.slice(0, 5) : allCols.slice(0, 5);
    }

    if (activeTab === 'estrategias') {
      const relevant = allCols.filter((c) =>
        ['categoria', 'segment', 'articulo', 'familia', 'marca', 'costo', 'precio', 'total', 'descuento'].some((k) =>
          c.toLowerCase().includes(k)
        )
      );
      return relevant.length > 0 ? relevant.slice(0, 5) : allCols.slice(0, 5);
    }

    return allCols.slice(0, 6);
  }, [activeTab]);

  const colsA = useMemo(() => getVisibleColumns(rowsA), [rowsA, getVisibleColumns]);
  const colsB = useMemo(() => getVisibleColumns(rowsB), [rowsB, getVisibleColumns]);

  // AI Compare Request
  const callAiCompare = useCallback(async (questionText: string, focus: string = activeTab) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/analytics/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_a: tableA,
          table_b: tableB,
          focus,
          question: questionText,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { ai_analysis?: string };
        return data.ai_analysis;
      }
    } catch {
      // Backend not reached, client-side intelligent fallback
    } finally {
      setIsAiLoading(false);
    }

    // Client fallback analysis with real calculated metrics
    const priceDiff = metricsA.avgPrice && metricsB.avgPrice
      ? (((metricsA.avgPrice - metricsB.avgPrice) / metricsB.avgPrice) * 100).toFixed(1)
      : null;
    const discountDiff = metricsA.avgDiscount && metricsB.avgDiscount
      ? (metricsA.avgDiscount - metricsB.avgDiscount).toFixed(1)
      : null;

    return `📊 **Análisis Comparativo Directo:**
- **Tabla A (${displayNameA}):** Precio promedio: $${metricsA.avgPrice.toFixed(2)} | Descuento promedio: ${metricsA.avgDiscount.toFixed(1)}% | Filas: ${rowsA.length}
- **Tabla B (${displayNameB}):** Precio promedio: $${metricsB.avgPrice.toFixed(2)} | Descuento promedio: ${metricsB.avgDiscount.toFixed(1)}% | Filas: ${rowsB.length}

${priceDiff !== null ? `* **Diferencia de Precio:** ${displayNameA} es un **${Math.abs(Number(priceDiff))}% ${Number(priceDiff) > 0 ? 'más alto' : 'más competitivo'}** en comparación con ${displayNameB}.` : ''}
${discountDiff !== null ? `* **Estrategia Promocional:** La diferencia de descuento medio es de ${Math.abs(Number(discountDiff))}% ${Number(discountDiff) > 0 ? `a favor de ${displayNameA}` : `con mayor agresividad en ${displayNameB}`}.` : ''}

💡 **Recomendación Estratégica:**
Ajustar los márgenes en categorías clave para capitalizar la elasticidad de precio observada en los datos.`;
  }, [tableA, tableB, activeTab, metricsA, metricsB, displayNameA, displayNameB, rowsA.length, rowsB.length]);

  const handleSendChat = async (presetQuestion?: string) => {
    const textToSend = presetQuestion || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!presetQuestion) setChatInput('');

    const aiResponse = await callAiCompare(textToSend);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: aiResponse || 'Análisis completado.',
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // Trigger strategic summary when switching to 'estrategias' tab
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'estrategias' && !strategicAiSummary && tableA && tableB) {
      const timer = setTimeout(() => {
        if (!isMounted) return;
        setIsAiLoading(true);
        fetch('http://localhost:8000/api/v1/analytics/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table_a: tableA,
            table_b: tableB,
            focus: 'estrategias',
            question: 'Analiza las diferencias estratégicas entre ambos datasets considerando precios, ventas, volumen y márgenes.',
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: { ai_analysis?: string } | null) => {
            if (isMounted && data?.ai_analysis) {
              setStrategicAiSummary(data.ai_analysis);
            }
          })
          .catch(() => {
            // ignore error
          })
          .finally(() => {
            if (isMounted) setIsAiLoading(false);
          });
      }, 0);

      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, tableA, tableB, strategicAiSummary]);

  // Export report to CSV
  const handleExportReport = () => {
    const headers = ['Dataset', 'Total Filas Muestreadas', 'Precio Promedio USD', 'Descuento Promedio %', 'Total Ventas USD'];
    const row1 = [displayNameA, rowsA.length, metricsA.avgPrice.toFixed(2), metricsA.avgDiscount.toFixed(2), metricsA.totalSales.toFixed(2)];
    const row2 = [displayNameB, rowsB.length, metricsB.avgPrice.toFixed(2), metricsB.avgDiscount.toFixed(2), metricsB.totalSales.toFixed(2)];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row1.join(','), row2.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Comparacion_${cleanColumnName(displayNameA)}_vs_${cleanColumnName(displayNameB)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs: Array<{ id: CompTab; label: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = [
    { id: 'precios', label: 'Precios', icon: DollarSign },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'ofertas', label: 'Ofertas y Descuentos', icon: Tag },
    { id: 'estrategias', label: 'Estrategias de Mercado', icon: Sparkles },
    { id: 'todos', label: 'Todos los datos', icon: Layers },
  ];

  const filteredModalDatasets = datasetsList.filter((d) => {
    const matchSearch =
      d.displayName.toLowerCase().includes(modalSearch.toLowerCase()) ||
      d.tableName.toLowerCase().includes(modalSearch.toLowerCase());
    const matchSector =
      sectorFilter === 'Todos los rubros' || d.sector === sectorFilter;
    return matchSearch && matchSector;
  });

  return (
    <>
      {/* Topbar */}
      <div className="comp-topbar">
        <div className="obs-topbar" style={{ marginBottom: 0, gap: 10 }}>
          <h1 className="page-title" style={{ fontSize: 22, marginBottom: 0 }}>Comparación y Análisis</h1>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Database size={13} color="var(--accent-blue)" /> Datos en tiempo real desde Supabase
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <div className="topbar-search" style={{ minWidth: 180 }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar registro en tablas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn-filter"
            title="Recargar datos de Supabase"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
          >
            <RefreshCw size={13} className={loadingA || loadingB ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic', display: 'block', marginBottom: 4 }}>
            Rubro
          </label>
          <select
            className="form-select"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            style={{ width: 160 }}
          >
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          className="btn-filter"
          style={{ marginTop: 18 }}
          onClick={() => {
            setModalTargetPanel('B');
            setIsModalOpen(true);
          }}
        >
          <Plus size={14} /> Añadir / Cambiar Archivo a Comparar
        </button>

        <button
          className="btn-save-view"
          style={{ marginTop: 18, marginLeft: 'auto' }}
          onClick={handleExportReport}
        >
          <Download size={14} /> Exportar Comparación
        </button>
      </div>

      {/* KPI Comparison Cards */}
      <div className="comp-kpi-grid">
        <div className="comp-kpi-card">
          <span className="comp-kpi-title">Precio Promedio Unitario</span>
          <div className="comp-kpi-values">
            <span className="comp-kpi-val val-a">${metricsA.avgPrice.toFixed(2)}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>vs</span>
            <span className="comp-kpi-val val-b">${metricsB.avgPrice.toFixed(2)}</span>
            {metricsA.avgPrice > 0 && metricsB.avgPrice > 0 && (
              <span
                className={`comp-kpi-diff ${
                  metricsA.avgPrice > metricsB.avgPrice ? 'diff-neg' : 'diff-pos'
                }`}
              >
                {metricsA.avgPrice > metricsB.avgPrice
                  ? `+${(((metricsA.avgPrice - metricsB.avgPrice) / metricsB.avgPrice) * 100).toFixed(1)}%`
                  : `-${(((metricsB.avgPrice - metricsA.avgPrice) / metricsA.avgPrice) * 100).toFixed(1)}%`}
              </span>
            )}
          </div>
        </div>

        <div className="comp-kpi-card">
          <span className="comp-kpi-title">Descuento Promedio</span>
          <div className="comp-kpi-values">
            <span className="comp-kpi-val val-a">{metricsA.avgDiscount.toFixed(1)}%</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>vs</span>
            <span className="comp-kpi-val val-b">{metricsB.avgDiscount.toFixed(1)}%</span>
            <span
              className={`comp-kpi-diff ${
                metricsA.avgDiscount > metricsB.avgDiscount ? 'diff-pos' : 'diff-neutral'
              }`}
            >
              {metricsA.avgDiscount >= metricsB.avgDiscount
                ? `+${(metricsA.avgDiscount - metricsB.avgDiscount).toFixed(1)}%`
                : `-${(metricsB.avgDiscount - metricsA.avgDiscount).toFixed(1)}%`}
            </span>
          </div>
        </div>

        <div className="comp-kpi-card">
          <span className="comp-kpi-title">Muestra de Filas (Supabase)</span>
          <div className="comp-kpi-values">
            <span className="comp-kpi-val val-a">{rowsA.length} reg.</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>vs</span>
            <span className="comp-kpi-val val-b">{rowsB.length} reg.</span>
            <span className="comp-kpi-diff diff-neutral">Activo</span>
          </div>
        </div>

        <div className="comp-kpi-card">
          <span className="comp-kpi-title">Total Facturado Estimado</span>
          <div className="comp-kpi-values">
            <span className="comp-kpi-val val-a">
              ${metricsA.totalSales > 0 ? metricsA.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'N/D'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>vs</span>
            <span className="comp-kpi-val val-b">
              ${metricsB.totalSales > 0 ? metricsB.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'N/D'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="comp-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`comp-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent size={13} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Strategy Highlights Box if on Estrategias tab */}
      {activeTab === 'estrategias' && (
        <div className="strategy-box">
          <div className="strategy-title">
            <Sparkles size={16} color="#8b5cf6" />
            <span>Síntesis Estratégica con Inteligencia Artificial (Gemini)</span>
            {isAiLoading && <RefreshCw size={13} className="spin" style={{ marginLeft: 'auto' }} />}
          </div>
          <div style={{ fontSize: 13, lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
            {strategicAiSummary ||
              'Cargando análisis estratégico comparativo entre ambos conjuntos de datos... Por favor espera un momento.'}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="comp-layout">
        {/* Tables side by side */}
        <div className="comp-tables">
          {/* Table Panel A */}
          <div className="comp-table-panel">
            <div className="comp-table-header">
              <div className="comp-table-selector-wrap">
                <FileSpreadsheet size={15} color="#3b82f6" />
                <select
                  className="comp-table-selector"
                  value={tableA}
                  onChange={(e) => {
                    setTableA(e.target.value);
                    setStrategicAiSummary(null);
                  }}
                  title="Cambiar tabla de Supabase"
                >
                  {datasetsList.map((d) => (
                    <option key={d.tableName} value={d.tableName}>
                      {d.displayName} ({d.totalRows || '3k+'} f.)
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-filter"
                style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={() => {
                  setModalTargetPanel('A');
                  setIsModalOpen(true);
                }}
              >
                Cambiar
              </button>
            </div>

            <div className="comp-table-container">
              {loadingA ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                  Cargando datos desde Supabase...
                </div>
              ) : errorA ? (
                <div style={{ padding: 30, textAlign: 'center', color: '#ef4444', fontSize: 12 }}>
                  Error al cargar tabla: {errorA}
                </div>
              ) : filteredRowsA.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron registros en {displayNameA}.
                </div>
              ) : (
                <table className="comp-table">
                  <thead>
                    <tr>
                      {colsA.map((col) => (
                        <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRowsA.map((row, idx) => {
                      const isHighDiscount =
                        metricsA.discountCol && Number(row[metricsA.discountCol]) >= 15;
                      return (
                        <tr key={idx}>
                          {colsA.map((col) => {
                            const val = row[col];
                            const isNumeric = typeof val === 'number';
                            const isDiscountCol = col === metricsA.discountCol;
                            const isPriceCol = col === metricsA.priceCol;

                            return (
                              <td
                                key={col}
                                className={
                                  isDiscountCol && isHighDiscount
                                    ? 'highlight-yellow'
                                    : isPriceCol && metricsA.avgPrice > 0 && typeof val === 'number' && val > metricsA.avgPrice * 1.2
                                    ? 'highlight-green'
                                    : ''
                                }
                              >
                                {val === null || val === undefined
                                  ? '-'
                                  : isPriceCol && isNumeric
                                  ? `$${val.toFixed(2)}`
                                  : isDiscountCol && isNumeric
                                  ? `${val}%`
                                  : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Table Panel B */}
          <div className="comp-table-panel">
            <div className="comp-table-header">
              <div className="comp-table-selector-wrap">
                <FileSpreadsheet size={15} color="#8b5cf6" />
                <select
                  className="comp-table-selector"
                  value={tableB}
                  onChange={(e) => {
                    setTableB(e.target.value);
                    setStrategicAiSummary(null);
                  }}
                  title="Cambiar tabla de Supabase"
                >
                  {datasetsList.map((d) => (
                    <option key={d.tableName} value={d.tableName}>
                      {d.displayName} ({d.totalRows || '3k+'} f.)
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-filter"
                style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={() => {
                  setModalTargetPanel('B');
                  setIsModalOpen(true);
                }}
              >
                Cambiar
              </button>
            </div>

            <div className="comp-table-container">
              {loadingB ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                  Cargando datos desde Supabase...
                </div>
              ) : errorB ? (
                <div style={{ padding: 30, textAlign: 'center', color: '#ef4444', fontSize: 12 }}>
                  Error al cargar tabla: {errorB}
                </div>
              ) : filteredRowsB.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron registros en {displayNameB}.
                </div>
              ) : (
                <table className="comp-table">
                  <thead>
                    <tr>
                      {colsB.map((col) => (
                        <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRowsB.map((row, idx) => {
                      const isHighDiscount =
                        metricsB.discountCol && Number(row[metricsB.discountCol]) >= 15;
                      return (
                        <tr key={idx}>
                          {colsB.map((col) => {
                            const val = row[col];
                            const isNumeric = typeof val === 'number';
                            const isDiscountCol = col === metricsB.discountCol;
                            const isPriceCol = col === metricsB.priceCol;

                            return (
                              <td
                                key={col}
                                className={
                                  isDiscountCol && isHighDiscount
                                    ? 'highlight-yellow'
                                    : isPriceCol && metricsB.avgPrice > 0 && typeof val === 'number' && val > metricsB.avgPrice * 1.2
                                    ? 'highlight-green'
                                    : ''
                                }
                              >
                                {val === null || val === undefined
                                  ? '-'
                                  : isPriceCol && isNumeric
                                  ? `$${val.toFixed(2)}`
                                  : isDiscountCol && isNumeric
                                  ? `${val}%`
                                  : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="ai-chat">
          <div className="ai-chat-header">
            <span className="ai-chat-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bot size={16} color="var(--accent-blue)" /> Asistente AI (Gemini)
            </span>
            <button className="topbar-icon-btn" style={{ width: 28, height: 28, border: 'none' }}>
              <MoreHorizontal size={14} />
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ai-message-${msg.sender === 'bot' ? 'bot' : 'user'}`}>
                <div className="ai-message-avatar">
                  {msg.sender === 'bot' ? <Bot size={16} /> : <UserCircle size={16} />}
                </div>
                <div className="ai-message-bubble" style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="ai-message ai-message-bot">
                <div className="ai-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="ai-message-bubble" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={13} className="spin" /> Analizando datasets con Gemini...
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestion pills */}
          <div className="ai-quick-pills">
            <button
              className="ai-pill"
              onClick={() => handleSendChat('¿Cuál tabla ofrece precios más competitivos y por qué?')}
            >
              🏷️ Precios competitivos
            </button>
            <button
              className="ai-pill"
              onClick={() => handleSendChat('Compara las ofertas y políticas de descuento entre ambas tablas.')}
            >
              🔥 Comparar ofertas
            </button>
            <button
              className="ai-pill"
              onClick={() => handleSendChat('¿Qué estrategias de ventas recomiendas según los datos?')}
            >
              📈 Estrategia comercial
            </button>
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Pregunta sobre precios, ofertas, ventas..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              disabled={isAiLoading}
            />
            <button
              className="ai-chat-send"
              onClick={() => handleSendChat()}
              aria-label="Enviar mensaje"
              disabled={isAiLoading || !chatInput.trim()}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Picker Modal */}
      {isModalOpen && (
        <div className="comp-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="comp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="comp-modal-header">
              <h3>
                Seleccionar Tabla para Panel {modalTargetPanel} (Supabase)
              </h3>
              <button
                className="comp-table-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="comp-modal-body">
              <div className="topbar-search" style={{ width: '100%', marginBottom: 6 }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Buscar tabla o archivo por nombre..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
                {filteredModalDatasets.map((d) => {
                  const isCurrent =
                    modalTargetPanel === 'A' ? tableA === d.tableName : tableB === d.tableName;
                  return (
                    <div
                      key={d.tableName}
                      className={`comp-dataset-card ${isCurrent ? 'selected' : ''}`}
                      onClick={() => {
                        if (modalTargetPanel === 'A') {
                          setTableA(d.tableName);
                        } else {
                          setTableB(d.tableName);
                        }
                        setStrategicAiSummary(null);
                        setIsModalOpen(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Database size={16} color="var(--accent-blue)" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {d.displayName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            Tabla: <code>{d.tableName}</code> • {d.totalRows ? `${d.totalRows} filas` : 'Supabase Table'}
                          </div>
                        </div>
                      </div>
                      <span className="badge-diff diff-neutral" style={{ fontSize: 11 }}>
                        {d.sector || 'Retail'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
