import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
  ShieldAlert,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

type LoginStep = 1 | 2;

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [step, setStep] = useState<LoginStep>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  /** Reset all form state */
  const resetState = useCallback(() => {
    setStep(1);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setOtpDigits(['', '', '', '', '', '']);
    setIsLoading(false);
    setError('');
    setResendMessage('');
  }, []);

  /** Wrapped close handler that resets state */
  const handleModalClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  /** Focus email input on open */
  useEffect(() => {
    if (isOpen && step === 1) {
      setTimeout(() => emailRef.current?.focus(), 150);
    }
  }, [isOpen, step]);

  /** Focus first OTP input on step 2 */
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  /** Close on Escape */
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleModalClose]);

  /** Prevent body scroll when modal is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /** Handle credentials submission */
  const handleCredentialsSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email.trim()) {
        setError('Ingresa tu correo de administrador');
        return;
      }

      if (!password.trim()) {
        setError('Ingresa tu contraseña de administrador');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Ingresa un correo electrónico válido');
        return;
      }

      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
      }, 800);
    },
    [email, password]
  );

  /** Handle OTP input */
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      // Allow only digits
      const digit = value.replace(/\D/g, '').slice(-1);
      const newDigits = [...otpDigits];
      newDigits[index] = digit;
      setOtpDigits(newDigits);
      setError('');

      // Auto-focus next input
      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otpDigits]
  );

  /** Handle OTP keydown for backspace navigation */
  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits]
  );

  /** Handle OTP paste */
  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = [...Array(6)].map((_, i) => pastedData[i] || '');
      setOtpDigits(newDigits);
      // Focus last filled input or the next empty one
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  }, []);

  /** Handle verification submission */
  const handleVerificationSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const code = otpDigits.join('');
      if (code.length < 6) {
        setError('Ingresa el código completo de 6 dígitos');
        return;
      }

      setIsLoading(true);

      // Simulate OTP verification
      setTimeout(() => {
        setIsLoading(false);
        resetState();
        onLoginSuccess();
      }, 1000);
    },
    [otpDigits, resetState, onLoginSuccess]
  );

  /** Handle resend code */
  const handleResendCode = useCallback(() => {
    setResendMessage('Código reenviado exitosamente');
    setOtpDigits(['', '', '', '', '', '']);
    otpRefs.current[0]?.focus();

    setTimeout(() => {
      setResendMessage('');
    }, 3000);
  }, []);

  /** Go back to step 1 */
  const handleGoBack = useCallback(() => {
    setStep(1);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setResendMessage('');
  }, []);

  /** Mask email for display */
  function getMaskedEmail(emailStr: string): string {
    if (!emailStr) return '';
    const [localPart, domain] = emailStr.split('@');
    if (!domain) return emailStr;
    const visibleChars = Math.min(3, localPart.length);
    const masked = localPart.slice(0, visibleChars) + '***';
    return `${masked}@${domain}`;
  }

  if (!isOpen) return null;

  return (
    <div
      className="login-modal-overlay admin-login-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Iniciar sesión como administrador"
    >
      <div className="login-modal-card admin-login-card" ref={modalRef}>
        {/* Close button */}
        <button
          className="login-modal-close"
          onClick={handleModalClose}
          aria-label="Cerrar"
          type="button"
        >
          <X size={18} />
        </button>

        {/* Admin Header */}
        <div className="login-modal-header">
          <div className="login-modal-shield admin-shield">
            <ShieldAlert size={16} />
          </div>
          <span className="login-modal-label admin-label">ACCESO ADMINISTRADOR</span>
          <h2 className="login-modal-title">Inicio sesión Admin</h2>
          <p className="admin-login-subtitle">Panel de control privilegiado</p>
        </div>

        {/* Stepper */}
        <div className="login-modal-stepper admin-stepper">
          <div className={`login-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="login-step-number">
              {step > 1 ? <CheckCircle2 size={16} /> : '1'}
            </span>
            <span className="login-step-text">Credenciales</span>
          </div>
          <div className="login-step-divider" />
          <div className={`login-step-item ${step >= 2 ? 'active' : ''}`}>
            <span className="login-step-number">2</span>
            <span className="login-step-text">Verificación OTP</span>
          </div>
        </div>

        {/* Step 1: Credentials */}
        {step === 1 && (
          <form className="login-modal-form" onSubmit={handleCredentialsSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="admin-login-email" className="login-field-label">
                Correo de administrador
              </label>
              <div className="login-input-wrapper">
                <Mail size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  id="admin-login-email"
                  ref={emailRef}
                  type="email"
                  className="login-modal-input"
                  placeholder="admin@retailmetrics360.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="admin-login-password" className="login-field-label">
                Contraseña
              </label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-modal-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-modal-btn login-modal-btn-primary admin-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="login-spinner" aria-label="Procesando" />
              ) : (
                <>
                  Continuar
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form className="login-modal-form" onSubmit={handleVerificationSubmit} noValidate>
            <p className="login-otp-desc">
              Enviamos un código de 6 dígitos a
              <br />
              <strong>{getMaskedEmail(email)}</strong>
            </p>

            <div className="login-otp-grid" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  className={`login-otp-input admin-otp-input ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  aria-label={`Dígito ${index + 1} del código`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {resendMessage && (
              <div className="login-success-msg" role="status">
                {resendMessage}
              </div>
            )}

            <div className="login-otp-actions">
              <button
                type="button"
                className="login-otp-back"
                onClick={handleGoBack}
              >
                <ArrowLeft size={14} />
                Volver
              </button>
              <button
                type="button"
                className="login-otp-resend"
                onClick={handleResendCode}
              >
                <RefreshCw size={14} />
                Reenviar código
              </button>
            </div>

            <button
              type="submit"
              className="login-modal-btn login-modal-btn-primary admin-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="login-spinner" aria-label="Verificando" />
              ) : (
                <>
                  <Shield size={16} />
                  Validar y acceder como Admin
                </>
              )}
            </button>
          </form>
        )}

        {/* Admin security notice */}
        <div className="admin-login-notice">
          <Lock size={12} />
          <span>Acceso restringido. Actividad monitoreada.</span>
        </div>
      </div>
    </div>
  );
}
