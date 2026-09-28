import { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  Save,
  Send,
  MoreHorizontal,
  Bot,
  UserCircle,
  ArrowDown,
  RefreshCw,
  Database,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { supabase } from '../../../../core/lib/supabaseClient';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

interface DatasetOption {
  tableName: string;
  displayName: string;
  totalRows?: number;
  totalColumns?: number;
}

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

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Hola. Estoy conectado a la base de datos de Supabase. Puedes consultarme sobre los datos de tus datasets.',
  },
];

export default function ObservacionDatos() {
  const [datasetsList, setDatasetsList] = useState<DatasetOption[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>(
    localStorage.getItem('lastUploadedTable') || 'dataset_ventas_tecnologia_limpio'
  );
  const [isManualInput, setIsManualInput] = useState(false);
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load available datasets from Supabase directly & localStorage
  const loadDatasets = async () => {
    try {
      const defaultOptions: DatasetOption[] = [
        { tableName: 'dataset_ventas_tecnologia_limpio', displayName: 'ventas_tecnologia_limpio.csv', totalRows: 1813 },
        { tableName: 'dataset_ventas_tienda_tech_4000', displayName: 'ventas_tienda_tech_4000.csv', totalRows: 4000 },
        { tableName: 'dataset_fetch_california_housing', displayName: 'fetch_california_housing.csv', totalRows: 20640 },
        { tableName: 'dataset_train', displayName: 'train.csv', totalRows: 891 },
      ];

      // Read persistent datasets from localStorage
      const localSavedStr = localStorage.getItem('analyst_saved_datasets');
      if (localSavedStr) {
        try {
          const localParsed = JSON.parse(localSavedStr);
          localParsed.forEach((item: any) => {
            if (item.tableName && !defaultOptions.some((d) => d.tableName === item.tableName)) {
              defaultOptions.unshift({
                tableName: item.tableName,
                displayName: item.name || item.tableName,
                totalRows: item.rows,
                totalColumns: item.columnsCount,
              });
            }
          });
        } catch {
          // ignore
        }
      }

      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading datasets list from Supabase:', error);
      }

      if (data && data.length > 0) {
        const mapped: DatasetOption[] = data.map((d: any) => ({
          tableName: getTableNameFromFilename(d.filename || d.name),
          displayName: d.name || d.filename,
          totalRows: d.total_rows,
          totalColumns: d.total_columns,
        }));

        // Merge with defaults to ensure all exist
        const all = [...mapped];
        defaultOptions.forEach((def) => {
          if (!all.some((item) => item.tableName === def.tableName)) {
            all.push(def);
          }
        });
        setDatasetsList(all);
      } else {
        setDatasetsList(defaultOptions);
      }
    } catch (err) {
      console.error('Error in loadDatasets:', err);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const fetchData = async (tableName: string) => {
    if (!tableName) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Query table directly from Supabase via anon key (15 registros)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(15);

      if (error) {
        console.error('Error fetching data directly from Supabase:', error);
        setErrorMsg(error.message || 'Error al consultar la tabla en Supabase.');
        setDataRows([]);
      } else if (data) {
        setDataRows(data);
        if (data.length > 0) {
          const cols = Object.keys(data[0]);
          if (!selectedColumn || !cols.includes(selectedColumn)) {
            setSelectedColumn(cols[0]);
          }
          if (!sortCol || !cols.includes(sortCol)) {
            setSortCol(cols[0]);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error inesperado al conectar con Supabase.');
      setDataRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDataset);
  }, [selectedDataset]);

  const sortedRows = useMemo(() => {
    const list = [...dataRows].sort((a, b) => {
      if (!sortCol) return 0;
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal ?? '').localeCompare(String(bVal ?? ''))
        : String(bVal ?? '').localeCompare(String(aVal ?? ''));
    });
    return list.slice(0, 15);
  }, [dataRows, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  // Column analytics calculations
  const columnStats = useMemo(() => {
    if (!selectedColumn || dataRows.length === 0) return null;
    const values = dataRows.map((r) => r[selectedColumn]);
    const validValues = values.filter((v) => v !== null && v !== undefined && v !== '');
    const validPercent = Math.round((validValues.length / values.length) * 100);
    const uniqueValues = Array.from(new Set(validValues));

    const numericValues = validValues
      .map((v) => Number(v))
      .filter((v) => !isNaN(v));
    const isNumeric = numericValues.length === validValues.length && validValues.length > 0;

    let min = 0;
    let max = 0;
    let avg = 0;
    if (isNumeric) {
      min = Math.min(...numericValues);
      max = Math.max(...numericValues);
      avg = Math.round((numericValues.reduce((a, b) => a + b, 0) / numericValues.length) * 100) / 100;
    }

    // Top categories for distribution
    const counts: Record<string, number> = {};
    validValues.forEach((v) => {
      const key = String(v);
      counts[key] = (counts[key] || 0) + 1;
    });
    const sortedCategories = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total: values.length,
      validPercent,
      uniqueCount: uniqueValues.length,
      nullCount: values.length - validValues.length,
      isNumeric,
      min,
      max,
      avg,
      topCategories: sortedCategories,
    };
  }, [selectedColumn, dataRows]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/analytics/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_name: selectedDataset,
          question: userText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: result.explanation || 'Análisis completado.',
        };
        setMessages((prev) => [...prev, botMsg]);
        if (result.data && result.data.length > 0) {
          setDataRows(result.data.slice(0, 15));
        }
        return;
      }
    } catch {
      // Backend not responding or error - fallback to local analysis from Supabase dataRows
    }

    // Client-side smart assistant fallback
    let reply = `He analizado la tabla actual "${selectedDataset}" con ${dataRows.length} registros cargados directamente desde Supabase.`;
    const qLower = userText.toLowerCase();

    if (qLower.includes('filas') || qLower.includes('registros') || qLower.includes('cuant')) {
      reply += `\nActualmente hay ${dataRows.length} filas en la vista previa.`;
    } else if (qLower.includes('columna') || qLower.includes('campos')) {
      const cols = dataRows.length > 0 ? Object.keys(dataRows[0]) : [];
      reply += `\nLas columnas disponibles son: ${cols.join(', ')}.`;
    } else if (columnStats) {
      reply += `\nSobre la columna seleccionada "${selectedColumn}":\n- Registros válidos: ${columnStats.validPercent}%\n- Valores únicos: ${columnStats.uniqueCount}\n${
        columnStats.isNumeric ? `- Promedio: ${columnStats.avg} (Mín: ${columnStats.min}, Máx: ${columnStats.max})` : ''
      }`;
    }

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: reply,
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  const columns = dataRows.length > 0 ? Object.keys(dataRows[0]) : [];

  return (
    <>
      {/* Top Bar */}
      <div className="obs-topbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={13} style={{ color: 'var(--accent-primary, #3b82f6)' }} />
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Dataset de Supabase
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!isManualInput ? (
              <select
                className="obs-dataset-select"
                value={selectedDataset}
                onChange={(e) => {
                  setSelectedDataset(e.target.value);
                  localStorage.setItem('lastUploadedTable', e.target.value);
                }}
                style={{ minWidth: 260 }}
              >
                {datasetsList.map((ds) => (
                  <option key={ds.tableName} value={ds.tableName}>
                    {ds.displayName} ({ds.tableName}) {ds.totalRows ? `• ${ds.totalRows} filas` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="obs-dataset-select"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                onBlur={() => {
                  localStorage.setItem('lastUploadedTable', selectedDataset);
                  fetchData(selectedDataset);
                }}
                placeholder="Ej. dataset_train"
                style={{ minWidth: 260 }}
              />
            )}

            <button
              className="btn-filter"
              style={{ padding: '7px 10px' }}
              title={isManualInput ? 'Elegir de lista' : 'Escribir nombre manual'}
              onClick={() => setIsManualInput(!isManualInput)}
            >
              <Edit3 size={13} />
            </button>

            <button
              className="btn-filter"
              style={{ padding: '7px 10px' }}
              title="Recargar datos de Supabase"
              onClick={() => {
                loadDatasets();
                fetchData(selectedDataset);
              }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <span className="obs-info-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={13} style={{ color: '#10b981' }} />
          <span>{sortedRows.length} Registros (Directo Supabase)</span>
        </span>

        <div className="obs-actions">
          <button className="btn-filter">
            <Filter size={14} /> Filtrar
          </button>
          <button className="btn-save-view">
            <Save size={14} /> Guardar Vista
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="obs-layout">
        {/* Left: Column Analysis */}
        <div className="col-analysis">
          <h3 className="col-analysis-title">Análisis de Columna</h3>
          <p className="col-analysis-sub">Selecciona una columna para inspeccionar métricas.</p>

          <div style={{ marginBottom: 14 }}>
            <select
              className="obs-dataset-select"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              style={{ width: '100%', fontSize: 12 }}
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  # {c}
                </option>
              ))}
            </select>
          </div>

          {selectedColumn && columnStats && (
            <>
              <div className="col-selected">
                <div className="col-selected-name"># {selectedColumn}</div>
                <div className="col-selected-badges">
                  <span className="col-badge col-badge-valid">
                    {columnStats.validPercent}% VÁLIDO
                  </span>
                  <span className="col-badge col-badge-type">
                    {columnStats.isNumeric ? 'NUMÉRICO' : 'TEXTO'}
                  </span>
                </div>
              </div>

              <div className="col-stats">
                <div className="col-stat">
                  <div className="col-stat-label">ÚNICOS</div>
                  <div className="col-stat-value">{columnStats.uniqueCount}</div>
                </div>
                <div className="col-stat">
                  <div className="col-stat-label">NULOS</div>
                  <div className="col-stat-value">{columnStats.nullCount}</div>
                </div>
                {columnStats.isNumeric && (
                  <>
                    <div className="col-stat">
                      <div className="col-stat-label">PROMEDIO</div>
                      <div className="col-stat-value">{columnStats.avg}</div>
                    </div>
                    <div className="col-stat">
                      <div className="col-stat-label">MÍN / MÁX</div>
                      <div className="col-stat-value" style={{ fontSize: 11 }}>
                        {columnStats.min} / {columnStats.max}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {columnStats.topCategories.length > 0 && (
                <div className="col-distribution">
                  <div className="col-dist-title">Valores Frecuentes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {columnStats.topCategories.map(([val, cnt]) => {
                      const pct = Math.round((cnt / columnStats.total) * 100);
                      return (
                        <div key={val} style={{ fontSize: 11 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ color: 'var(--text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {val || '(vacío)'}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {cnt} ({pct}%)
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-primary, #3b82f6)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Center: Data Table */}
        <div className="data-table-container" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: 8 }} />
              <div>Consultando tabla "{selectedDataset}" en Supabase...</div>
            </div>
          ) : errorMsg ? (
            <div style={{ padding: 30, display: 'flex', alignItems: 'center', gap: 12, color: '#dc2626' }}>
              <AlertCircle size={24} />
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Error al cargar desde Supabase:</strong>
                <span style={{ fontSize: 13 }}>{errorMsg}</span>
              </div>
            </div>
          ) : dataRows.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Database size={32} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p>No hay datos disponibles en la tabla <strong>{selectedDataset}</strong> en Supabase.</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>Verifica haber subido el archivo o selecciona otro dataset.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>#</th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className={sortCol === col ? 'sorted' : ''}
                      onClick={() => handleSort(col)}
                      style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {col}
                      {sortCol === col && (
                        <ArrowDown
                          size={12}
                          style={{
                            marginLeft: 4,
                            transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => (
                  <tr key={row.id ?? idx}>
                    <td className="row-num" style={{ textAlign: 'center' }}>{idx + 1}</td>
                    {columns.map((col) => (
                      <td key={col} style={{ whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <em style={{ opacity: 0.4 }}>null</em>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: AI Assistant */}
        <div className="ai-chat">
          <div className="ai-chat-header">
            <span className="ai-chat-title">Asistente AI Gemini</span>
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
                <div className="ai-message-bubble">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Ej. 'Muestra las ventas mayores a 1000'"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            />
            <button className="ai-chat-send" onClick={handleSendChat} aria-label="Enviar mensaje">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
