import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Sparkles, ExternalLink, CheckCheck } from 'lucide-react';

interface WhatsAppBubbleProps {
  /** Phone number in international format without symbols, e.g. '573001234567' */
  phoneNumber?: string;
  /** Company or support team name */
  companyName?: string;
  /** Default message when opening WhatsApp */
  defaultMessage?: string;
}

const QUICK_OPTIONS = [
  '🚀 Solicitar demo guiada de RetailMetrics 360',
  '📊 Consultar planes para mi cadena retail',
  '💬 Hablar con un especialista comercial',
];

export default function WhatsAppBubble({
  phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '573001234567',
  companyName = 'RetailMetrics 360',
  defaultMessage = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hola, me gustaría recibir más información y una demo sobre RetailMetrics 360',
}: WhatsAppBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [showPill, setShowPill] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opening card
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close card when pressing Escape or clicking outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /** Open WhatsApp in new tab with the given message */
  const handleOpenWhatsApp = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : (customMessage.trim() || defaultMessage));
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuickOptionClick = (option: string) => {
    setCustomMessage(option);
    handleOpenWhatsApp(option);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleOpenWhatsApp();
  };

  return (
    <div className="whatsapp-floating-container" ref={cardRef}>
      {/* Pop-up Chat Card */}
      {isOpen && (
        <div 
          className="whatsapp-chat-card" 
          role="dialog" 
          aria-labelledby="whatsapp-card-title"
          aria-modal="true"
        >
          {/* Card Header */}
          <div className="whatsapp-card-header">
            <div className="whatsapp-header-info">
              <div className="whatsapp-avatar-wrapper">
                <div className="whatsapp-avatar-brand">RM</div>
                <span className="whatsapp-status-dot" title="En línea ahora" />
              </div>
              <div>
                <h4 id="whatsapp-card-title" className="whatsapp-header-title">
                  {companyName}
                </h4>
                <p className="whatsapp-header-status">
                  <span className="whatsapp-pulse-dot" /> En línea • Soporte B2B
                </p>
              </div>
            </div>
            <button
              className="whatsapp-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat de WhatsApp"
            >
              <X size={18} />
            </button>
          </div>

          {/* Card Body / Messages */}
          <div className="whatsapp-card-body">
            <div className="whatsapp-message-bubble">
              <div className="whatsapp-bubble-author">
                <span>Equipo Comercial</span>
                <span className="whatsapp-bubble-time">Ahora</span>
              </div>
              <p className="whatsapp-bubble-text">
                ¡Hola! 👋 Bienvenido a <strong>{companyName}</strong>.
              </p>
              <p className="whatsapp-bubble-text">
                ¿Te interesa optimizar el análisis predictivo y el control de inventario de tu negocio? Escríbenos directamente o elige una opción:
              </p>
              <span className="whatsapp-bubble-checks" aria-hidden="true">
                <CheckCheck size={14} />
              </span>
            </div>

            {/* Quick Option Pills */}
            <div className="whatsapp-quick-options">
              <span className="whatsapp-quick-label">
                <Sparkles size={12} /> Sugerencias rápidas:
              </span>
              {QUICK_OPTIONS.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="whatsapp-quick-btn"
                  onClick={() => handleQuickOptionClick(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Card Footer / Input form */}
          <form className="whatsapp-card-footer" onSubmit={handleSubmit}>
            <div className="whatsapp-input-group">
              <input
                ref={inputRef}
                type="text"
                className="whatsapp-input"
                placeholder="Escribe tu mensaje..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                aria-label="Mensaje para WhatsApp"
              />
              <button
                type="submit"
                className="whatsapp-send-btn"
                title="Enviar a WhatsApp"
                aria-label="Enviar mensaje a WhatsApp"
              >
                <Send size={15} />
              </button>
            </div>

            <button
              type="button"
              className="whatsapp-direct-btn"
              onClick={() => handleOpenWhatsApp()}
            >
              {/* WhatsApp SVG Icon */}
              <svg 
                className="whatsapp-btn-icon" 
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.476-.15-.676.15-.2.3-.777.98-.952 1.18-.175.2-.351.226-.652.075-.3-.15-1.268-.467-2.416-1.491-.894-.798-1.498-1.784-1.674-2.085-.175-.3-.019-.462.132-.612.135-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.238-.244-.59-.493-.51-.677-.52l-.577-.01c-.2 0-.527.075-.802.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.2 2.122 3.24 5.14 4.544.718.31 1.278.495 1.716.634.721.23 1.377.197 1.896.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                <path d="M12.004 0C5.374 0 0 5.374 0 12.004c0 2.115.551 4.179 1.6 6L.06 24l6.196-1.508a11.96 11.96 0 0 0 5.748 1.488h.005c6.627 0 12.004-5.374 12.004-12.004C24.013 5.374 18.636 0 12.004 0zm0 22.012h-.004a10.02 10.02 0 0 1-5.11-1.4l-.366-.217-3.794.924.939-3.7-.238-.378a10.007 10.007 0 0 1-1.536-5.237c0-5.52 4.49-10.01 10.013-10.01 2.673 0 5.187 1.042 7.077 2.934 1.89 1.892 2.93 4.407 2.928 7.085 0 5.52-4.49 10.004-10.008 10.004z"/>
              </svg>
              <span>Abrir WhatsApp Web / App</span>
              <ExternalLink size={13} style={{ opacity: 0.8 }} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Elements (Pill + Main Circular Button) */}
      <div className="whatsapp-button-row">
        {/* Helper Notification Pill */}
        {!isOpen && showPill && (
          <div 
            className="whatsapp-help-pill"
            role="status"
            aria-live="polite"
          >
            <button 
              className="whatsapp-pill-content"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir asesoría por WhatsApp"
            >
              <MessageCircle size={15} className="whatsapp-pill-icon" />
              <span className="whatsapp-pill-text">¿Dudas? Chatea con nosotros</span>
            </button>
            <button
              className="whatsapp-pill-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowPill(false);
              }}
              title="Descartar"
              aria-label="Descartar aviso"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Floating WhatsApp Main Button */}
        <button
          className={`whatsapp-trigger-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar ventana de WhatsApp' : 'Abrir chat de WhatsApp'}
          title="Contactar por WhatsApp"
        >
          {/* Subtle pulse wave behind button */}
          <span className="whatsapp-pulse-ring" aria-hidden="true" />

          {/* Active status indicator badge */}
          <span className="whatsapp-online-badge" title="Operador disponible">
            <span className="whatsapp-online-inner" />
          </span>

          {isOpen ? (
            <X size={26} className="whatsapp-icon-close" />
          ) : (
            <svg 
              className="whatsapp-main-icon" 
              viewBox="0 0 24 24" 
              width="30" 
              height="30" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.476-.15-.676.15-.2.3-.777.98-.952 1.18-.175.2-.351.226-.652.075-.3-.15-1.268-.467-2.416-1.491-.894-.798-1.498-1.784-1.674-2.085-.175-.3-.019-.462.132-.612.135-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.238-.244-.59-.493-.51-.677-.52l-.577-.01c-.2 0-.527.075-.802.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.2 2.122 3.24 5.14 4.544.718.31 1.278.495 1.716.634.721.23 1.377.197 1.896.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
              <path d="M12.004 0C5.374 0 0 5.374 0 12.004c0 2.115.551 4.179 1.6 6L.06 24l6.196-1.508a11.96 11.96 0 0 0 5.748 1.488h.005c6.627 0 12.004-5.374 12.004-12.004C24.013 5.374 18.636 0 12.004 0zm0 22.012h-.004a10.02 10.02 0 0 1-5.11-1.4l-.366-.217-3.794.924.939-3.7-.238-.378a10.007 10.007 0 0 1-1.536-5.237c0-5.52 4.49-10.01 10.013-10.01 2.673 0 5.187 1.042 7.077 2.934 1.89 1.892 2.93 4.407 2.928 7.085 0 5.52-4.49 10.004-10.008 10.004z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
