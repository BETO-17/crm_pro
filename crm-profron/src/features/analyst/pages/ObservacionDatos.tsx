import { useState } from 'react';
import {
  Filter,
  Save,
  Send,
  MoreHorizontal,
  Bot,
  UserCircle,
  ArrowDown,
} from 'lucide-react';

/* ---- Simulated Data ---- */
interface DataRow {
  rowNum: number;
  transaction_id: string;
  store_code: string;
  revenue_usd: number;
  date: string;
  category: string;
  units: number;
  discount_pct: number;
}

const simulatedRows: DataRow[] = [
  { rowNum: 1, transaction_id: 'TRX-9981', store_code: 'NY-01', revenue_usd: 4520.00, date: '2023-09-01', category: 'Electronics', units: 12, discount_pct: 5 },
  { rowNum: 2, transaction_id: 'TRX-9982', store_code: 'LA-04', revenue_usd: 1248.50, date: '2023-09-01', category: 'Apparel', units: 34, discount_pct: 10 },
  { rowNum: 3, transaction_id: 'TRX-9983', store_code: 'CHI-02', revenue_usd: 89.99, date: '2023-09-02', category: 'Groceries', units: 5, discount_pct: 0 },
  { rowNum: 4, transaction_id: 'TRX-9984', store_code: 'MIA-01', revenue_usd: 560.25, date: '2023-09-02', category: 'Home', units: 8, discount_pct: 15 },
  { rowNum: 5, transaction_id: 'TRX-9985', store_code: 'SF-03', revenue_usd: 3200.00, date: '2023-09-03', category: 'Electronics', units: 6, discount_pct: 8 },
  { rowNum: 6, transaction_id: 'TRX-9986', store_code: 'NY-01', revenue_usd: 780.30, date: '2023-09-03', category: 'Apparel', units: 22, discount_pct: 12 },
  { rowNum: 7, transaction_id: 'TRX-9987', store_code: 'DAL-02', revenue_usd: 1890.00, date: '2023-09-04', category: 'Electronics', units: 4, discount_pct: 3 },
  { rowNum: 8, transaction_id: 'TRX-9988', store_code: 'BOS-01', revenue_usd: 245.75, date: '2023-09-04', category: 'Groceries', units: 15, discount_pct: 0 },
  { rowNum: 9, transaction_id: 'TRX-9989', store_code: 'LA-04', revenue_usd: 5100.00, date: '2023-09-05', category: 'Electronics', units: 10, discount_pct: 7 },
  { rowNum: 10, transaction_id: 'TRX-9990', store_code: 'CHI-02', revenue_usd: 67.50, date: '2023-09-05', category: 'Groceries', units: 3, discount_pct: 0 },
  { rowNum: 11, transaction_id: 'TRX-9991', store_code: 'MIA-01', revenue_usd: 2340.80, date: '2023-09-06', category: 'Home', units: 18, discount_pct: 20 },
  { rowNum: 12, transaction_id: 'TRX-9992', store_code: 'SF-03', revenue_usd: 920.00, date: '2023-09-06', category: 'Apparel', units: 28, discount_pct: 5 },
];

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Hola. Estoy analizando el dataset Q3_Ventas_Nacionales.csv. Noté que la columna \'revenue_usd\' tiene un sesgo hacia la derecha. ¿Quieres que aplique una transformación logarítmica para normalizarla?',
  },
  {
    id: '2',
    sender: 'user',
    text: 'No, por ahora solo muéstrame las tiendas con revenue > $1,000.',
  },
  {
    id: '3',
    sender: 'bot',
    text: 'Entendido. He filtrado las filas donde revenue_usd > $1,000. Se encontraron 7 registros que cumplen el criterio. Las tiendas NY-01, LA-04, SF-03, DAL-02 y MIA-01 superan ese umbral.',
  },
];

const distributionBars = [
  { height: 65, color: '#4f8cff' },
  { height: 85, color: '#4f8cff' },
  { height: 45, color: '#4f8cff' },
  { height: 30, color: '#94a3b8' },
  { height: 20, color: '#94a3b8' },
];

const datasets = [
  'Q3_Ventas_Nacionales.csv',
  'Inventario_Regional.xlsx',
  'Precios_Competencia.csv',
  'Forecast_Q4.xlsx',
];

export default function ObservacionDatos() {
  const [selectedDataset, setSelectedDataset] = useState(datasets[0]);
  const [sortCol, setSortCol] = useState<string>('revenue_usd');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('revenue_usd');

  const sortedRows = [...simulatedRows].sort((a, b) => {
    const aVal = a[sortCol as keyof DataRow];
    const bVal = b[sortCol as keyof DataRow];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulated bot response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'He procesado tu solicitud. Los resultados se actualizaron en la tabla principal. ¿Necesitas algún análisis adicional sobre estas métricas?',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  // Stats for selected column
  const revenues = simulatedRows.map((r) => r.revenue_usd);
  const minVal = Math.min(...revenues);
  const maxVal = Math.max(...revenues);
  const avgVal = revenues.reduce((a, b) => a + b, 0) / revenues.length;

  const columns = ['transaction_id', 'store_code', 'revenue_usd', 'date', 'category', 'units', 'discount_pct'];

  return (
    <>
      {/* Top bar */}
      <div className="obs-topbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Selector de Dataset</label>
          <select
            className="obs-dataset-select"
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
          >
            {datasets.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <span className="obs-info-badge">1.4M Rows • 24 Columns</span>
        <div className="obs-actions">
          <button className="btn-filter">
            <Filter size={14} /> Filtrar
          </button>
          <button className="btn-save-view">
            <Save size={14} /> Guardar Vista
          </button>
        </div>
      </div>

      {/* 3 Column Layout */}
      <div className="obs-layout">
        {/* Left: Column Analysis */}
        <div className="col-analysis">
          <h3 className="col-analysis-title">Análisis de Columna</h3>
          <p className="col-analysis-sub">Selecciona una columna en la tabla para ver métricas.</p>

          <div style={{ marginBottom: 12 }}>
            <select
              className="obs-dataset-select"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              style={{ width: '100%', fontSize: 12 }}
            >
              {columns.map((c) => (
                <option key={c} value={c}># {c}</option>
              ))}
            </select>
          </div>

          <div className="col-selected">
            <div className="col-selected-name"># {selectedColumn}</div>
            <div className="col-selected-badges">
              <span className="col-badge col-badge-type">
                {selectedColumn === 'revenue_usd' || selectedColumn === 'units' || selectedColumn === 'discount_pct' ? 'NUMERIC' : 'STRING'}
              </span>
              <span className="col-badge col-badge-valid">100% VALID</span>
            </div>
          </div>

          {(selectedColumn === 'revenue_usd' || selectedColumn === 'units' || selectedColumn === 'discount_pct') && (
            <>
              <div className="col-stats">
                <div className="col-stat">
                  <div className="col-stat-label">Mínimo</div>
                  <div className="col-stat-value">${minVal.toFixed(2)}</div>
                </div>
                <div className="col-stat">
                  <div className="col-stat-label">Máximo</div>
                  <div className="col-stat-value">${maxVal.toFixed(2)}</div>
                </div>
                <div className="col-stat">
                  <div className="col-stat-label">Promedio</div>
                  <div className="col-stat-value">${avgVal.toFixed(2)}</div>
                </div>
                <div className="col-stat">
                  <div className="col-stat-label">Valores Nulos</div>
                  <div className="col-stat-value">0</div>
                </div>
              </div>

              <div className="col-distribution">
                <div className="col-dist-title">Distribución</div>
                <div className="col-dist-bars">
                  {distributionBars.map((bar, i) => (
                    <div
                      key={i}
                      className="col-dist-bar"
                      style={{ height: `${bar.height}%`, background: bar.color }}
                      title={`Bin ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: Data Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 30 }}>#</th>
                {['transaction_id', 'store_code', 'revenue_usd', 'date'].map((col) => (
                  <th
                    key={col}
                    className={sortCol === col ? 'sorted' : ''}
                    onClick={() => handleSort(col)}
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
              {sortedRows.map((row) => (
                <tr key={row.rowNum}>
                  <td className="row-num">{row.rowNum}</td>
                  <td>{row.transaction_id}</td>
                  <td>{row.store_code}</td>
                  <td className={row.revenue_usd > 1000 ? 'cell-highlight' : ''}>
                    ${row.revenue_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: AI Assistant */}
        <div className="ai-chat">
          <div className="ai-chat-header">
            <span className="ai-chat-title">Asistente AI</span>
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
              placeholder="Pregunta sobre los datos..."
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
