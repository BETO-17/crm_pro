import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

type LoginStep = 1 | 2;

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [step, setStep] = useState<LoginStep>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  const DEMO_OTP = '208600';

  const resetState = useCallback(() => {
    setStep(1);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRememberMe(true);
    setOtpDigits(['', '', '', '', '', '']);
    setIsLoading(false);
    setError('');
    setResendMessage('');
  }, []);

  const handleModalClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  useEffect(() => {
    if (isOpen && step === 1) {
      setTimeout(() => emailRef.current?.focus(), 150);
    }
  }, [isOpen, step]);

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

  // Step 1: Submit credentials -> Advance to Step 2 (Verification)
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 250);
  };

  // Step 2: Handle individual digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
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

  // Autocomplete demo OTP (208600)
  const handleAutocomplete = () => {
    const digits = DEMO_OTP.split('');
    setOtpDigits(digits);
    setError('');
    setTimeout(() => {
      otpRefs.current[5]?.focus();
    }, 100);
  };

  // Step 2: Verification Submit -> Complete Admin Login -> Redirect to Modules
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Por favor ingresa los 6 dígitos del código de verificación');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem('token', 'admin-token-verified');
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'admin-main',
          email: email.trim() || 'admin@erpmetrics360.com',
          full_name: 'Administrador Principal',
          role: 'admin',
        })
      );
      setIsLoading(false);
      resetState();
      onLoginSuccess();
    }, 350);
  };

  const handleResendCode = () => {
    setResendMessage('Nuevo código 208600 generado.');
    setTimeout(() => setResendMessage(''), 4000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="split-auth-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 10, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: 16,
      }}
    >
      <div
        className="split-auth-container"
        ref={modalRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 900,
          minHeight: 520,
          maxHeight: '92vh',
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          background: '#ffffff',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          aria-label="Cerrar modal"
          type="button"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 20,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: '#f1f5f9',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* LEFT PANEL: Branding & Visual Showcase */}
        <div
          style={{
            position: 'relative',
            background: '#040d21',
            padding: '36px 32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            color: '#ffffff',
          }}
        >
          {/* Logo & Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 22 }}>
                <span style={{ width: 4, height: 14, background: '#f59e0b', borderRadius: 2 }} />
                <span style={{ width: 4, height: 22, background: '#f97316', borderRadius: 2 }} />
                <span style={{ width: 4, height: 17, background: '#38bdf8', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                ERPMetrics 360
              </span>
            </div>
            <span
              style={{
                display: 'block',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: '#38bdf8',
                marginTop: 4,
                marginLeft: 22,
              }}
            >
              TU EQUIPO, EN SINCRONÍA
            </span>
          </div>

          {/* Hero text */}
          <div style={{ margin: '20px 0 24px' }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.25,
                color: '#ffffff',
                margin: '0 0 12px 0',
                letterSpacing: '-0.5px',
              }}
            >
              El ERP que se adapta a{' '}
              <span style={{ color: '#38bdf8', display: 'block' }}>cualquier empresa.</span>
            </h2>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: '#94a3b8',
                margin: 0,
                maxWidth: 320,
              }}
            >
              Vende, gestiona y crece sin importar tu industria. ERPMetrics 360 se moldea a tu forma de trabajar.
            </p>
          </div>

          {/* Floating Metric Card Preview */}
          <div
            style={{
              background: '#071530',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: 16,
              padding: '16px 18px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                  <span style={{ width: 2.5, height: 8, background: '#f59e0b', borderRadius: 1 }} />
                  <span style={{ width: 2.5, height: 12, background: '#f97316', borderRadius: 1 }} />
                  <span style={{ width: 2.5, height: 9, background: '#38bdf8', borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>ERPMetrics 360</span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#4ade80',
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 20,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px #22c55e',
                  }}
                />
                En vivo
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 2 }}>
                Ingresos del mes
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                  $48,290
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>↗ 12.8%</span>
              </div>
            </div>

            {/* 7 Chart Bars */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 6,
                height: 42,
              }}
            >
              {[22, 38, 26, 56, 88, 64, 76].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                    borderRadius: '4px 4px 2px 2px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div
          style={{
            padding: '36px 42px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowY: 'auto',
            background: '#ffffff',
          }}
        >
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto' }}>
            {/* Top Label */}
            <span
              style={{
                display: 'inline-block',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: 0.8,
                color: '#2563eb',
                marginBottom: 6,
                textTransform: 'uppercase',
              }}
            >
              BIENVENIDO A ERPMETRICS 360
            </span>

            {/* Main Title & Subtitle */}
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.4px',
                margin: '0 0 6px 0',
              }}
            >
              Vuelve a tu mejor trabajo
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0' }}>
              Inicia sesión para continuar donde lo dejaste.
            </p>

            {/* Step flow / indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '0 0 24px 0',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  color: step === 1 ? '#2563eb' : '#64748b',
                  borderBottom: step === 1 ? '2.5px solid #2563eb' : 'none',
                  paddingBottom: 4,
                  cursor: step === 2 ? 'pointer' : 'default',
                  fontWeight: step === 1 ? 700 : 500,
                }}
                onClick={() => {
                  if (step === 2) setStep(1);
                }}
              >
                Iniciar sesión
              </span>
              <span style={{ color: '#cbd5e1', letterSpacing: 2 }}>--------------------&gt;</span>
              <span
                style={{
                  color: step === 2 ? '#2563eb' : '#94a3b8',
                  borderBottom: step === 2 ? '2.5px solid #2563eb' : 'none',
                  paddingBottom: 4,
                  fontWeight: step === 2 ? 700 : 500,
                }}
              >
                Verificacion
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}

            {/* STEP 1: CREDENTIALS (Email & Password) */}
            {step === 1 && (
              <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label
                    htmlFor="admin-email"
                    style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="admin-email"
                    ref={emailRef}
                    type="email"
                    placeholder="correo electronico"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    autoComplete="email"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px',
                      fontSize: 14,
                      color: '#0f172a',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 10,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label
                    htmlFor="admin-password"
                    style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}
                  >
                    Contraseña
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      autoComplete="current-password"
                      style={{
                        width: '100%',
                        height: 44,
                        padding: '0 44px 0 14px',
                        fontSize: 14,
                        color: '#0f172a',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 10,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      style={{
                        position: 'absolute',
                        right: 12,
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 2,
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#64748b',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                    />
                    <span>Recordarme</span>
                  </label>

                  <a
                    href="#recuperar"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Instrucciones enviadas.');
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0f172a',
                      textDecoration: 'none',
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Submit Button: Iniciar sesión -> */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    height: 46,
                    background: '#0a0f1d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: 4,
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                >
                  {isLoading ? (
                    <span>Iniciando sesión...</span>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Footer Notice */}
                <p style={{ fontSize: 11.5, color: '#64748b', textAlign: 'center', margin: '14px 0 0 0' }}>
                  Al continuar, aceptas nuestras{' '}
                  <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Condiciones de uso</span>{' '}
                  y{' '}
                  <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Politica de privacidad</span>.
                </p>
              </form>
            )}

            {/* STEP 2: VERIFICATION OTP (Image 2) */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column' }} noValidate>
                {/* Security Code Demo Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 12,
                    padding: '10px 14px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} color="#2563eb" />
                    <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
                      Código de seguridad (Demo):
                    </span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 16,
                        letterSpacing: 2,
                        color: '#0f172a',
                        marginLeft: 4,
                      }}
                    >
                      {DEMO_OTP}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutocomplete}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Autocompletar
                  </button>
                </div>

                {/* Text prompt */}
                <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                  Ingresa el código OTP de 6 dígitos para validar tu acceso a{' '}
                  <strong style={{ color: '#0f172a' }}>Big Data & Analytics Suite</strong>:
                </p>

                {/* 6 Square Digits */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '48px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '20px',
                        fontWeight: 700,
                        border: digit ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        background: '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: digit ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
                      }}
                    />
                  ))}
                </div>

                {resendMessage && (
                  <p style={{ fontSize: 12, color: '#16a34a', margin: '0 0 12px 0', textAlign: 'center' }}>
                    {resendMessage}
                  </p>
                )}

                {/* Submit button: Ingresar -> */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    height: 46,
                    background: '#0a0f1d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {isLoading ? (
                    <span>Verificando...</span>
                  ) : (
                    <>
                      <span>Ingresar</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Bottom Back & Resend Links */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 18,
                    fontSize: 13,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <ArrowLeft size={14} /> Volver a Iniciar sesión
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
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
