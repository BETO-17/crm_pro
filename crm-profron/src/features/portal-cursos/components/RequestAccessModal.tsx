import { useState } from 'react';
import { Lock, X, Send, CheckCircle2 } from 'lucide-react';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onRequestSubmitted: () => void;
}

export default function RequestAccessModal({
  isOpen,
  onClose,
  courseTitle,
  onRequestSubmitted,
}: RequestAccessModalProps) {
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onRequestSubmitted();
      onClose();
    }, 1200);
  };

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="otp-modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={16} />
        </button>

        <div className="otp-header-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <Lock size={24} />
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.4px' }}>
          Solicitar Aprobación de Acceso
        </h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px', lineHeight: 1.5 }}>
          El módulo <strong>{courseTitle}</strong> requiere validación previa del Administrador.
          Envía tu solicitud para que sea habilitado en tu cuenta.
        </p>

        {sent ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '16px', borderRadius: 12, textAlign: 'center' }}>
            <CheckCircle2 size={28} color="#34d399" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 700, color: '#a7f3d0', fontSize: 14 }}>
              ¡Solicitud enviada con éxito!
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              El administrador revisará tu petición y activará el módulo.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#e2e8f0' }}>
                Motivo / Proyecto asociado (Opcional)
              </label>
              <textarea
                className="otp-input-field"
                rows={3}
                placeholder="Indica el laboratorio o tarea académica a desarrollar..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button type="submit" className="otp-btn-submit" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Send size={16} /> Enviar Solicitud al Admin
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
