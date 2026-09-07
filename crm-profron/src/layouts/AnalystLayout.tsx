import { useState, type ReactNode } from 'react';
import {
  User,
  Database,
  Table2,
  GitCompare,
  FolderOpen,
  FileText,
  Sparkles,
  Bot,
  Send,
  X,
  ChevronRight,
  LogOut,
  UserCircle,
  Lightbulb,
} from 'lucide-react';
import './AdminLayout.css';
import './AnalystLayout.css';

interface AnalystLayoutProps {
  children: ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

const navItems = [
  { id: 'perfil', label: 'Mi Perfil', icon: User },
  { id: 'carga', label: 'Datasets', icon: Database },
  { id: 'observacion', label: 'Observación de Datos', icon: Table2 },
  { id: 'comparacion', label: 'Comparación y Análisis', icon: GitCompare },
  { id: 'workspace', label: 'Workspaces', icon: FolderOpen },
  { id: 'informes', label: 'Informes', icon: FileText },
];

const viewLabels: Record<string, string> = {
  perfil: 'Mi Perfil',
  carga: 'Datasets',
  observacion: 'Observación de Datos',
  comparacion: 'Comparación y Análisis',
  workspace: 'Workspaces',
  informes: 'Informes y Reportes',
};

const moduleContextHints: Record<string, { desc: string; prompts: string[] }> = {
  perfil: {
    desc: 'Asistente listo para ayudarte con la configuración de tu cuenta y auditoría de actividades.',
    prompts: ['Resumen de mi actividad reciente', '¿Cómo configurar alertas de datasets?'],
  },
  carga: {
    desc: 'Contexto: Catálogo de Datasets. Carga, gestiona, inspecciona y selecciona datasets para comparativas.',
    prompts: ['¿Cómo comparar 2 datasets?', 'Estructura recomendada de CSV', 'Guardar datasets en BD'],
  },
  observacion: {
    desc: 'Contexto: Dataset Q3_Ventas_Nacionales.csv (1.4M Filas, 24 Columnas).',
    prompts: ['Filtrar tiendas con revenue > $1,000', 'Detectar valores atípicos', 'Calcular ticket promedio'],
  },
  comparacion: {
    desc: 'Contexto: Benchmark Precios Propios vs. Competidor A.',
    prompts: ['Top 5 SKUs con mayor diferencia', '¿Dónde somos más caros?', 'Resumen de descuentos'],
  },
  workspace: {
    desc: 'Contexto: Gestión de Proyectos y Tableros Analíticos.',
    prompts: ['Resumir proyectos pendientes', 'Buscar workspaces de Retail', 'Crear nuevo tablero'],
  },
  informes: {
    desc: 'Contexto: Biblioteca de Informes y KPIs.',
    prompts: ['Resumen de ventas Q3', 'Comparar KPIs trimestrales', 'Exportar métricas'],
  },
};

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const initialDrawerMessages: Record<string, ChatMessage[]> = {
  observacion: [
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola Carlos! Estoy analizando el dataset "Q3_Ventas_Nacionales.csv". He detectado 7 registros con ingresos superiores a $1,000 USD y un sesgo moderado en la columna revenue_usd. ¿Qué consulta deseas realizar?',
      timestamp: 'Ahora',
    },
  ],
  comparacion: [
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola Carlos! He cargado la comparativa entre "Precios_Competidor_A.csv" y "Precios_Propios_Q3.xlsx". Encontramos 45 SKUs coincidentes donde nuestro competidor tiene un descuento promedio 7% más agresivo.',
      timestamp: 'Ahora',
    },
  ],
  default: [
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola Carlos! Soy tu Copiloto IA en RetailMetrics 360. Estoy sincronizado con tu sesión activa. ¿En qué puedo asistirte hoy?',
      timestamp: 'Ahora',
    },
  ],
};

let messageCounter = 100;
function generateMessageId() {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

export default function AnalystLayout({
  children,
  activeView,
  onNavigate,
  onLogout,
}: AnalystLayoutProps) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return initialDrawerMessages[activeView] || initialDrawerMessages.default;
  });

  const currentHint = moduleContextHints[activeView] || moduleContextHints.perfil;
  const currentViewLabel = viewLabels[activeView] || 'Espacio de Trabajo';

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      sender: 'user',
      text,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    // Generate smart context-aware response
    setTimeout(() => {
      let replyText = 'He procesado tu instrucción sobre el módulo actual. Los indicadores y visualizaciones se han sincronizado correctamente.';
      if (text.toLowerCase().includes('revenue') || text.toLowerCase().includes('1,000') || text.toLowerCase().includes('filtrar')) {
        replyText = 'He aplicado el filtro para registros con revenue > $1,000. Tiendas destacadas: NY-01 ($4,520), LA-04 ($5,100), SF-03 ($3,200) y MIA-01 ($2,340).';
      } else if (text.toLowerCase().includes('diferencia') || text.toLowerCase().includes('caros') || text.toLowerCase().includes('sku')) {
        replyText = 'Top SKUs con mayor discrepancia detectados:\n• SKU-5510 (+18% vs competidor)\n• SKU-1029 (+11.4% vs competidor)\n• SKU-3321 (-4.6% a nuestro favor).';
      } else if (text.toLowerCase().includes('formato') || text.toLowerCase().includes('compatible')) {
        replyText = 'Soportamos archivos .CSV y .XLSX hasta 500MB por archivo. El motor de ingesta valida tipos de datos y nulos automáticamente.';
      } else if (text.toLowerCase().includes('resumen') || text.toLowerCase().includes('actividad')) {
        replyText = 'Tienes 12 reportes generados en el mes, 8 datasets procesados y tu última sesión colaborativa fue en el workspace "Análisis Q3".';
      }

      const botMsg: ChatMessage = {
        id: generateMessageId(),
        sender: 'bot',
        text: replyText,
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  return (
    <div className={`admin-layout analyst-layout-root ${isAiOpen ? 'ai-drawer-open' : ''}`}>
      {/* ---- Sidebar ---- */}
      <aside className="admin-sidebar analyst-sidebar" aria-label="Sidebar de navegación del analista">
        {/* Platform Branding Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">RM</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">RetailMetrics 360</span>
              <span className="sidebar-brand-sub">Analyst Workspace</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="nav-icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer: Carlos Ruiz (CR) User Profile + Version */}
        <div className="sidebar-footer">
          <div className="sidebar-profile" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #4f8cff, #6366f1)' }} aria-hidden="true">
              CR
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Carlos Ruiz</span>
              <span className="sidebar-user-role">Usuario Analista</span>
            </div>
          </div>
          <div className="sidebar-version">V1.2.0</div>
        </div>
      </aside>

      {/* ---- Content Area ---- */}
      <div className="admin-content analyst-content-wrapper">
        {/* Dynamic TopBar */}
        <header className="admin-topbar analyst-topbar">
          {/* Dynamic Breadcrumb: Workspace / [Módulo Activo] */}
          <div className="analyst-breadcrumb-bar">
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-leaf">{currentViewLabel}</span>
          </div>

          {/* Right Controls: Copiloto IA + Avatar CR + Logout */}
          <div className="topbar-right">
            {(activeView === 'observacion' || activeView === 'comparacion') && (
              <button
                className={`copilot-toggle-btn ${isAiOpen ? 'active' : ''}`}
                onClick={() => setIsAiOpen(!isAiOpen)}
                title={isAiOpen ? 'Ocultar Copiloto IA' : 'Abrir Copiloto IA'}
                aria-expanded={isAiOpen}
              >
                <Sparkles size={15} className="copilot-icon" />
                <span>Copiloto IA</span>
                <span className="copilot-pulse-dot" />
              </button>
            )}

            <div className="topbar-avatar-small" title="Carlos Ruiz (Analista)" aria-hidden="true">
              CR
            </div>

            <button
              className="topbar-logout"
              onClick={onLogout}
              title="Cerrar sesión de analista"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="admin-main analyst-main-area">
          {children}
        </main>
      </div>

      {/* =========================================================
          CENTRALIZED AI COPILOT DRAWER (LATERAL 380px)
          ========================================================= */}
      <aside className={`ai-copilot-drawer ${isAiOpen ? 'open' : ''}`} aria-label="Panel lateral Asistente Copiloto IA">
        <div className="ai-drawer-header">
          <div className="ai-drawer-title-group">
            <div className="ai-drawer-icon-badge">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="ai-drawer-title">Copiloto IA</h3>
              <span className="ai-drawer-subtitle">{currentViewLabel}</span>
            </div>
          </div>
          <button
            className="ai-drawer-close-btn"
            onClick={() => setIsAiOpen(false)}
            aria-label="Cerrar asistente IA"
          >
            <X size={16} />
          </button>
        </div>

        {/* Module Context Banner */}
        <div className="ai-drawer-context-banner">
          <p className="ai-context-desc">{currentHint.desc}</p>
        </div>

        {/* Quick Prompts */}
        <div className="ai-drawer-prompts">
          <span className="ai-prompts-label">
            <Lightbulb size={12} /> Sugerencias rápidas:
          </span>
          <div className="ai-prompts-chips">
            {currentHint.prompts.map((prompt) => (
              <button
                key={prompt}
                className="ai-prompt-chip"
                onClick={() => handleSendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="ai-drawer-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-drawer-msg ${msg.sender === 'bot' ? 'msg-bot' : 'msg-user'}`}
            >
              <div className="ai-msg-avatar">
                {msg.sender === 'bot' ? <Bot size={14} /> : <UserCircle size={14} />}
              </div>
              <div className="ai-msg-bubble">
                <p className="ai-msg-text">{msg.text}</p>
                <span className="ai-msg-time">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="ai-drawer-input-area">
          <div className="ai-drawer-input-wrapper">
            <input
              type="text"
              placeholder={`Pregunta sobre ${currentViewLabel.toLowerCase()}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="ai-drawer-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim()}
              aria-label="Enviar pregunta a Copiloto IA"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
