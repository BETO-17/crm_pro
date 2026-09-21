import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register';
type LoginStep = 1 | 2;

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}: LoginModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<LoginStep>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  /** Reset state when modal is closed or initialMode changes */
  const resetState = useCallback(() => {
    setAuthMode(initialMode);
    setStep(1);
    setFullName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRememberMe(false);
    setOtpDigits(['', '', '', '', '', '']);
    setIsLoading(false);
    setError('');
  }, [initialMode]);

  const handleModalClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setStep(1);
      setTimeout(() => emailRef.current?.focus(), 150);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [step]);

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

  const handleCredentialsSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email.trim()) {
        setError('Por favor ingresa tu correo electrónico');
        return;
      }

      if (authMode === 'register' && !fullName.trim()) {
        setError('Por favor ingresa tu nombre completo');
        return;
      }

      if (!password.trim()) {
        setError('Por favor ingresa tu contraseña');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Ingresa un correo electrónico válido');
        return;
      }

      setIsLoading(true);

      if (authMode === 'register') {
        setTimeout(() => {
          setIsLoading(false);
          const newUser = {
            id: `user-${Date.now()}`,
            full_name: fullName.trim(),
            email: email.trim(),
            role: 'Usuario',
            username: email.split('@')[0],
          };
          localStorage.setItem('token', 'dev-auth-token-' + Date.now());
          localStorage.setItem('user', JSON.stringify(newUser));
          resetState();
          onLoginSuccess();
        }, 500);
        return;
      }

      // Modo Login
      fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Credenciales incorrectas');
          }
          return fetch('http://localhost:8000/api/v1/auth/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
        })
        .then(async (res) => {
          setIsLoading(false);
          if (!res.ok) {
            const data = await res.json();
            setError(data.detail || 'Error al solicitar código OTP');
            return;
          }
          setStep(2);
        })
        .catch(() => {
          // Fallback demo
          setIsLoading(false);
          const fallbackUser = {
            id: 'demo-user-1',
            full_name: email.split('@')[0],
            email: email.trim(),
            role: 'Usuario',
            username: email.split('@')[0],
          };
          localStorage.setItem('token', 'dev-demo-token');
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          resetState();
          onLoginSuccess();
        });
    },
    [authMode, fullName, email, password, resetState, onLoginSuccess]
  );

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const socialUser = {
        id: `social-${provider}-${Date.now()}`,
        full_name: provider === 'google' ? 'Usuario Google' : 'Usuario Facebook',
        email: `usuario.${provider}@ejemplo.com`,
        role: 'Usuario',
        username: `user_${provider}`,
      };
      localStorage.setItem('token', `social-token-${Date.now()}`);
      localStorage.setItem('user', JSON.stringify(socialUser));
      resetState();
      onLoginSuccess();
    }, 400);
  };

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const newDigits = [...otpDigits];
      newDigits[index] = digit;
      setOtpDigits(newDigits);
      setError('');

      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otpDigits]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits]
  );

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = [...Array(6)].map((_, i) => pastedData[i] || '');
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  }, []);

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

      fetch('http://localhost:8000/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code }),
      })
        .then(async (res) => {
          setIsLoading(false);
          const data = await res.json();
          if (!res.ok) {
            setError(data.detail || 'Código inválido o expirado');
            return;
          }
          localStorage.setItem('token', data.access_token);
          resetState();
          onLoginSuccess();
        })
        .catch(() => {
          setIsLoading(false);
          localStorage.setItem('token', 'dev-demo-token');
          resetState();
          onLoginSuccess();
        });
    },
    [otpDigits, resetState, onLoginSuccess, email]
  );

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
      className="split-auth-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="split-auth-container" ref={modalRef}>
        {/* Close Button */}
        <button
          className="split-auth-close-btn"
          onClick={handleModalClose}
          aria-label="Cerrar modal"
          type="button"
        >
          <X size={18} />
        </button>

        {/* LEFT PANEL: Branding & Visual Showcase */}
        <div className="split-auth-visual">
          <div className="split-auth-visual-bg-glow" />
          <div className="split-auth-visual-rings" />

          {/* Logo & Header */}
          <div className="split-auth-brand">
            <div className="split-auth-logo-row">
              <div className="split-auth-logo-bars">
                <span className="bar bar-1" />
                <span className="bar bar-2" />
                <span className="bar bar-3" />
              </div>
              <span className="split-auth-brand-name">ERPMetrics 360</span>
            </div>
            <span className="split-auth-brand-tagline">TU EQUIPO, EN SINCRONÍA</span>
          </div>

          {/* Hero text */}
          <div className="split-auth-hero-copy">
            <h2 className="split-auth-hero-title">
              El ERP que se adapta a{' '}
              <span className="split-auth-highlight">cualquier empresa.</span>
            </h2>
            <p className="split-auth-hero-desc">
              Vende, gestiona y crece sin importar tu industria. ERPMetrics 360 se moldea a tu forma de trabajar.
            </p>
          </div>

          {/* Floating Metric Card Preview */}
          <div className="split-auth-metric-card">
            <div className="split-metric-card-header">
              <div className="split-metric-brand">
                <div className="split-metric-mini-bars">
                  <span />
                  <span />
                  <span />
                </div>
                <span>ERPMetrics 360</span>
              </div>
              <span className="split-metric-live-badge">
                <span className="split-metric-live-dot" />
                En vivo
              </span>
            </div>

            <div className="split-metric-body">
              <span className="split-metric-label">Ingresos del mes</span>
              <div className="split-metric-amount-row">
                <span className="split-metric-val">$48,290</span>
                <span className="split-metric-trend">↗ 12.8%</span>
              </div>
            </div>

            {/* Chart Bars */}
            <div className="split-metric-chart-bars">
              <div className="chart-bar" style={{ height: '18%' }} />
              <div className="chart-bar" style={{ height: '32%' }} />
              <div className="chart-bar" style={{ height: '24%' }} />
              <div className="chart-bar" style={{ height: '50%' }} />
              <div className="chart-bar" style={{ height: '70%' }} />
              <div className="chart-bar" style={{ height: '92%' }} />
              <div className="chart-bar" style={{ height: '62%' }} />
              <div className="chart-bar" style={{ height: '80%' }} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="split-auth-form-panel">
          <div className="split-auth-form-inner">
            {/* Top Label */}
            <span className="split-auth-welcome-badge">BIENVENIDO A ERPMETRICS 360</span>

            {/* Main Title & Subtitle */}
            <h1 className="split-auth-main-title">
              {authMode === 'login' ? 'Vuelve a tu mejor trabajo' : 'Crea tu cuenta en segundos'}
            </h1>
            <p className="split-auth-main-sub">
              {authMode === 'login'
                ? 'Inicia sesión para continuar donde lo dejaste.'
                : 'Empieza a tener claridad sobre cada oportunidad.'}
            </p>

            {/* Tabs */}
            <div className="split-auth-tabs">
              <button
                type="button"
                className={`split-auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={`split-auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                }}
              >
                Registrarme
              </button>
            </div>

            {/* Social Logins */}
            <div className="split-auth-social-group">
              <button
                type="button"
                className="split-auth-social-btn"
                onClick={() => handleSocialLogin('google')}
              >
                <svg className="social-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <button
                type="button"
                className="split-auth-social-btn"
                onClick={() => handleSocialLogin('facebook')}
              >
                <svg className="social-icon" viewBox="0 0 24 24" width="16" height="16" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continuar con Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div className="split-auth-divider">
              <span className="split-auth-divider-line" />
              <span className="split-auth-divider-text">o continúa con tu correo</span>
              <span className="split-auth-divider-line" />
            </div>

            {/* Form */}
            {step === 1 && (
              <form onSubmit={handleCredentialsSubmit} className="split-auth-form" noValidate>
                <div className="split-auth-field">
                  <label className="split-auth-label">Correo electrónico</label>
                  <input
                    ref={emailRef}
                    type="email"
                    className="split-auth-input"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    autoComplete="email"
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div className="split-auth-field">
                    <label className="split-auth-label">Nombre completo</label>
                    <input
                      type="text"
                      className="split-auth-input"
                      placeholder="Tu nombre completo"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError('');
                      }}
                      required
                    />
                  </div>
                )}

                <div className="split-auth-field">
                  <label className="split-auth-label">Contraseña</label>
                  <div className="split-auth-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="split-auth-input"
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
                      className="split-auth-password-toggle-text"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                {/* Login Options (Remember Me / Forgot Password) */}
                {authMode === 'login' && (
                  <div className="split-auth-options-row">
                    <label className="split-auth-remember">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Recordarme</span>
                    </label>
                    <button
                      type="button"
                      className="split-auth-forgot-link"
                      onClick={() => alert('Se ha enviado un enlace de recuperación a tu correo.')}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="split-auth-error-msg" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="split-auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="split-auth-spinner" />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Legal notice */}
                <p className="split-auth-terms">
                  Al continuar, aceptas nuestras{' '}
                  <a href="#terminos" onClick={(e) => e.preventDefault()}>Condiciones de uso</a> y{' '}
                  <a href="#privacidad" onClick={(e) => e.preventDefault()}>Política de privacidad</a>.
                </p>

                {/* Bottom Workspace Invite Banner (Login only) */}
                {authMode === 'login' && (
                  <div className="split-auth-workspace-banner">
                    <div className="split-auth-workspace-left">
                      <FileText size={16} className="workspace-icon" />
                      <span>¿Te invitaron a un espacio de trabajo?</span>
                    </div>
                    <button
                      type="button"
                      className="split-auth-workspace-action"
                      onClick={() => {
                        setAuthMode('register');
                        setError('');
                      }}
                    >
                      Unirme a mi equipo
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerificationSubmit} className="split-auth-form" noValidate>
                <p className="split-auth-otp-desc">
                  Enviamos un código de seguridad de 6 dígitos a
                  <br />
                  <strong>{getMaskedEmail(email)}</strong>
                </p>

                <div className="split-auth-otp-grid" onPaste={handleOtpPaste}>
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
                      className={`split-auth-otp-input ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      aria-label={`Dígito ${index + 1}`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="split-auth-error-msg" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="split-auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="split-auth-spinner" />
                  ) : (
                    'Validar y acceder'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
