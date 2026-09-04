import { useState } from 'react';
import {
  Search,
  Plus,
  Send,
  MoreHorizontal,
  Bot,
  UserCircle,
  X,
  Download,
} from 'lucide-react';

/* ---- Simulated Comparison Data ---- */
interface CompRow {
  sku: string;
  precioBase: number;
  descuento: number;
}

const competitorData: CompRow[] = [
  { sku: 'SKU-1829', precioBase: 45.00, descuento: 5 },
  { sku: 'SKU-3321', precioBase: 120.50, descuento: 18 },
  { sku: 'SKU-8842', precioBase: 12.99, descuento: 8 },
  { sku: 'SKU-5510', precioBase: 89.90, descuento: 15 },
  { sku: 'SKU-1029', precioBase: 210.00, descuento: 22 },
  { sku: 'SKU-7744', precioBase: 55.50, descuento: 3 },
  { sku: 'SKU-6091', precioBase: 34.20, descuento: 10 },
];

const ownData: CompRow[] = [
  { sku: 'SKU-1829', precioBase: 48.00, descuento: 0 },
  { sku: 'SKU-3321', precioBase: 115.00, descuento: 5 },
  { sku: 'SKU-8842', precioBase: 12.99, descuento: 8 },
  { sku: 'SKU-5510', precioBase: 95.00, descuento: 10 },
  { sku: 'SKU-1029', precioBase: 234.00, descuento: 12 },
  { sku: 'SKU-7744', precioBase: 52.00, descuento: 5 },
  { sku: 'SKU-6091', precioBase: 36.80, descuento: 8 },
];

type CompTab = 'precios' | 'ofertas' | 'articulos';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'He analizado los archivos Precios_Competidor_A.csv y Precios_Propios_Q3.xlsx.\n\nHe encontrado 45 SKUs coincidentes. En promedio, nuestros precios base son un 3.2% más altos, pero nuestro competidor está aplicando descuentos más agresivos (12% vs nuestro 5%).\n\n¿Te gustaría ver los SKUs con mayor diferencia de precio final?',
  },
  {
    id: '2',
    sender: 'user',
    text: 'Sí, muéstrame el top 5 de mayor diferencia donde somos más caros.',
  },
  {
    id: '3',
    sender: 'bot',
    text: 'Aquí tienes:\n1. SKU-5510 (+18% de dif.)\n2. SKU-3321 (+12% de dif.)\n3. SKU-1029 (+11.5% de dif.)\n\nHe resaltado estos ítems en la tabla de la izquierda para tu revisión.',
  },
];

const sectors = ['Retail', 'Tecnología', 'Logística', 'Finanzas'];

export default function ComparacionAnalisis() {
  const [activeTab, setActiveTab] = useState<CompTab>('precios');
  const [sector, setSector] = useState('Retail');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState('');

  const highlightSkus = new Set(['SKU-5510', 'SKU-3321', 'SKU-1029']);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'He actualizado el análisis comparativo con los nuevos filtros. Los resultados muestran una tendencia de pricing competitivo en el segmento seleccionado. ¿Deseas exportar este informe?',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const tabs: { id: CompTab; label: string }[] = [
    { id: 'precios', label: 'Precios' },
    { id: 'ofertas', label: 'Ofertas' },
    { id: 'articulos', label: 'Artículos' },
  ];

  return (
    <>
      {/* Top controls */}
      <div className="comp-topbar">
        <div className="obs-topbar" style={{ marginBottom: 0, gap: 10 }}>
          <h1 className="page-title" style={{ fontSize: 22, marginBottom: 0 }}>Comparación y Análisis</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <div className="topbar-search" style={{ minWidth: 160 }}>
            <Search size={14} />
            <input type="text" placeholder="Buscar en base de datos..." />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic', display: 'block', marginBottom: 4 }}>Rubro</label>
          <select className="form-select" value={sector} onChange={(e) => setSector(e.target.value)} style={{ width: 140 }}>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button className="btn-filter" style={{ marginTop: 18 }}>
          <Plus size={14} /> Añadir Archivo a Comparar
        </button>
        <button className="btn-save-view" style={{ marginTop: 18, marginLeft: 'auto' }}>
          <Download size={14} /> Guardar Análisis
        </button>
      </div>

      {/* Tabs */}
      <div className="comp-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`comp-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="comp-layout">
        {/* Tables side by side */}
        <div className="comp-tables">
          {/* Competitor Table */}
          <div className="comp-table-panel">
            <div className="comp-table-header">
              <span>📄 Precios_Competidor_A.csv</span>
              <button className="comp-table-close"><X size={12} /></button>
            </div>
            <table className="comp-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Precio Base</th>
                  <th>Descuento</th>
                </tr>
              </thead>
              <tbody>
                {competitorData.map((row) => (
                  <tr key={row.sku}>
                    <td>{row.sku}</td>
                    <td className={highlightSkus.has(row.sku) ? 'highlight-yellow' : ''}>
                      ${row.precioBase.toFixed(2)}
                    </td>
                    <td>{row.descuento}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Own Table */}
          <div className="comp-table-panel">
            <div className="comp-table-header">
              <span>📊 Precios_Propios_Q3.xlsx</span>
              <button className="comp-table-close"><X size={12} /></button>
            </div>
            <table className="comp-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Precio Base</th>
                  <th>Descuento</th>
                </tr>
              </thead>
              <tbody>
                {ownData.map((row) => (
                  <tr key={row.sku}>
                    <td>{row.sku}</td>
                    <td className={highlightSkus.has(row.sku) ? 'highlight-yellow' : ''}>
                      ${row.precioBase.toFixed(2)}
                    </td>
                    <td>{row.descuento}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Chat */}
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
                <div className="ai-message-bubble" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Pregunta al asistente sobre la compara..."
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

      {/* Footer action */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 20 }}>
        <button className="btn-save-db" style={{ background: 'var(--accent-blue)' }}>
          <Download size={14} /> Download Report
        </button>
      </div>
    </>
  );
}
