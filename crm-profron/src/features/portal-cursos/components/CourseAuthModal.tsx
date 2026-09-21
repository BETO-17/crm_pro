import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface CourseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseKey: 'bigData' | 'microsoftAzure';
  onSuccess: () => void;
}

export default function CourseAuthModal({
  isOpen,
  onClose,
  courseTitle,
  onSuccess,
}: CourseAuthModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState('749210');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setShowPassword(false);
      setOtpDigits(['', '', '', '', '', '']);
      // Pre-fill user email if present
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email) setEmail(user.email);
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Generate demo 6-digit code
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoCode(generated);
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);
    const nextIdx = Math.min(pasteData.length, 5);
    otpRefs.current[nextIdx]?.focus();
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');

    if (entered.length < 6) {
      setError('Por favor ingresa el código OTP de 6 dígitos completo.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 600);
  };

  const handleResendCode = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoCode(generated);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  return (
    <div className="crm-auth-overlay" onClick={onClose}>
      <div
        className="crm-auth-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button className="crm-auth-close-btn" onClick={onClose} aria-label="Cerrar modal">
          <X size={18} />
        </button>

        {/* LEFT PANEL (Dark Branding & Live Stat Card) */}
        <div className="crm-auth-left-panel">
          <div className="crm-auth-left-glow" />
          
          {/* Logo Bar */}
          <div className="crm-auth-brand-header">
            <div className="crm-auth-logo-bars">
              <span className="bar bar-orange" />
              <span className="bar bar-amber" />
              <span className="bar bar-cyan" />
            </div>
            <div className="crm-auth-brand-text">
              <span className="crm-auth-brand-name">ERPMetrics 360</span>
              <span className="crm-auth-brand-tagline">TU EQUIPO, EN SINCRONÍA</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="crm-auth-hero-copy">
            <h2 className="crm-auth-hero-title">
              El ERP que se adapta a{' '}
              <span className="crm-auth-highlight">cualquier empresa.</span>
            </h2>
            <p className="crm-auth-hero-desc">
              Vende, gestiona y crece sin importar tu industria. ERPMetrics 360 se moldea a tu forma de trabajar.
            </p>
          </div>

          {/* Mini Live Stat Card */}
          <div className="crm-auth-stat-card">
            <div className="crm-auth-stat-top">
              <div className="crm-auth-stat-title-group">
                <div className="crm-auth-logo-bars mini">
                  <span className="bar bar-orange" />
                  <span className="bar bar-amber" />
                  <span className="bar bar-cyan" />
                </div>
                <span className="crm-auth-stat-app-name">ERPMetrics 360</span>
              </div>
              <span className="crm-auth-live-badge">
                <span className="live-dot" /> En vivo
              </span>
            </div>

            <div className="crm-auth-stat-body">
              <span className="crm-auth-stat-label">Ingresos del mes</span>
              <div className="crm-auth-stat-value-row">
                <span className="crm-auth-stat-amount">$48,290</span>
                <span className="crm-auth-stat-growth">↗ 12.8%</span>
              </div>
            </div>

            {/* Stylized Bar Chart */}
            <div className="crm-auth-bar-chart">
              <div className="crm-chart-bar" style={{ height: '22%' }} />
              <div className="crm-chart-bar" style={{ height: '36%' }} />
              <div className="crm-chart-bar" style={{ height: '26%' }} />
              <div className="crm-chart-bar" style={{ height: '52%' }} />
              <div className="crm-chart-bar" style={{ height: '82%' }} />
              <div className="crm-chart-bar" style={{ height: '62%' }} />
              <div className="crm-chart-bar" style={{ height: '74%' }} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Auth & OTP Verification) */}
        <div className="crm-auth-right-panel">
          <div className="crm-auth-right-content">
            <span className="crm-auth-welcome-badge">BIENVENIDO A ERPMETRICS 360</span>
            <h1 className="crm-auth-title">Vuelve a tu mejor trabajo</h1>
            <p className="crm-auth-subtitle">Inicia sesión para continuar donde lo dejaste.</p>

            {/* Step Navigation Indicator */}
            <div className="crm-auth-stepper-bar">
              <div
                className={`crm-step-item ${step === 1 ? 'step-active' : 'step-completed'}`}
                onClick={() => setStep(1)}
              >
                <span>Iniciar sesión</span>
                {step === 1 && <div className="crm-step-active-underline" />}
              </div>
              <span className="crm-step-arrow">-----------------&gt;</span>
              <div
                className={`crm-step-item ${step === 2 ? 'step-active' : 'step-inactive'}`}
              >
                <span>Verificacion</span>
                {step === 2 && <div className="crm-step-active-underline" />}
              </div>
            </div>

            {/* STEP 1: Email & Password */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="crm-auth-form">
                <div className="crm-form-group">
                  <label className="crm-form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="crm-input-field"
                    placeholder="correo electronico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="crm-form-group">
                  <label className="crm-form-label">Contraseña</label>
                  <div className="crm-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="crm-input-field crm-password-input"
                      placeholder="••••••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="crm-password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="crm-form-options-row">
                  <label className="crm-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="crm-checkbox-input"
                    />
                    <span>Recordarme</span>
                  </label>
                  <a
                    href="#olvidaste"
                    onClick={(e) => {
                      e.preventDefault();
                      setError('Función de recuperación: Usa tu correo institucional.');
                    }}
                    className="crm-forgot-link"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {error && <div className="crm-auth-error-box">{error}</div>}

                <button type="submit" className="crm-btn-primary" disabled={loading}>
                  {loading ? (
                    'Iniciando sesión...'
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="crm-auth-legal-text">
                  Al continuar, aceptas nuestras <span className="legal-link">Condiciones de uso</span> y <span className="legal-link">Politica de privacidad</span>.
                </p>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="crm-auth-form">
                <div className="crm-otp-demo-hint">
                  <div className="crm-otp-hint-title">
                    <Sparkles size={14} /> Código de seguridad (Demo):
                  </div>
                  <div className="crm-otp-hint-code-row">
                    <span className="crm-otp-code-display">{demoCode}</span>
                    <button
                      type="button"
                      className="crm-btn-autocomplete"
                      onClick={() => setOtpDigits(demoCode.split(''))}
                    >
                      Autocompletar
                    </button>
                  </div>
                </div>

                <p className="crm-otp-instruction">
                  Ingresa el código OTP de 6 dígitos para validar tu acceso a <strong>{courseTitle}</strong>:
                </p>

                <div className="crm-otp-boxes-container" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={`crm-otp-box ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    />
                  ))}
                </div>

                {error && <div className="crm-auth-error-box">{error}</div>}

                <button type="submit" className="crm-btn-primary" disabled={loading}>
                  {loading ? (
                    'Verificando código...'
                  ) : (
                    <>
                      <span>Ingresar</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="crm-otp-actions-row">
                  <button
                    type="button"
                    className="crm-btn-back-step"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={14} /> Volver a Iniciar sesión
                  </button>
                  <button
                    type="button"
                    className="crm-btn-resend"
                    onClick={handleResendCode}
                  >
                    Reenviar código OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
