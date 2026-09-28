import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  Video,
  CheckCircle2,
  Loader2,
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
  courseKey,
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

  // Azure Facial Verification state
  const [scanProgress, setScanProgress] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [cameraState, setCameraState] = useState<'prompt' | 'requesting' | 'active' | 'denied'>('prompt');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera helper (stable ref, never causes re-renders)
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('prompt');
  }, []);

  const handleModalClose = useCallback(() => {
    stopCameraStream();
    onClose();
  }, [stopCameraStream, onClose]);

  // Reset only when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setShowPassword(false);
      setOtpDigits(['', '', '', '', '', '']);
      setScanProgress(0);
      setIsVerified(false);
      setCameraState('prompt');

      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email) setEmail(user.email);
        } catch {
          // ignore
        }
      }
    } else {
      stopCameraStream();
    }
  }, [isOpen, stopCameraStream]);

  // Request & Start real camera
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('denied');
      return;
    }

    try {
      setCameraState('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraState('active');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraState('denied');
    }
  }, []);

  // Handle 7-second recognition progression on Step 2 (Azure)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isOpen && step === 2 && courseKey === 'microsoftAzure') {
      startCamera();
      setScanProgress(0);
      setIsVerified(false);

      // Total 7 seconds (7000ms): 100 steps * 70ms = 7000ms
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            if (interval) clearInterval(interval);
            setIsVerified(true);
            return 100;
          }
          const next = prev + 1;
          if (next >= 100) {
            setIsVerified(true);
          }
          return next;
        });
      }, 70);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, step, courseKey, startCamera]);

  // Attach video stream when video element mounts or cameraState becomes active
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraState, step]);

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
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoCode(generated);
      setStep(2);
      if (courseKey === 'bigData') {
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      }
    }, 300);
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

    if (courseKey === 'microsoftAzure' && !isVerified) {
      return;
    }

    if (courseKey === 'bigData') {
      const entered = otpDigits.join('');
      if (entered.length < 6) {
        setError('Por favor ingresa el código OTP de 6 dígitos completo.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      stopCameraStream();
      onSuccess();
    }, 350);
  };

  const handleResendCode = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoCode(generated);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  // Total measurement bars (42 segments)
  const TOTAL_BARS = 42;
  const activeBarsCount = Math.round((scanProgress / 100) * TOTAL_BARS);

  // Status message during the 7 seconds
  const getScanStatusText = () => {
    if (isVerified || scanProgress >= 100) return 'Identidad Confirmada';
    if (scanProgress < 30) return 'Iniciando escaneo...';
    if (scanProgress < 65) return 'Analizando biometría...';
    return 'Validando rasgos...';
  };

  return (
    <div className="crm-auth-overlay" onClick={handleModalClose}>
      <div
        className="crm-auth-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button className="crm-auth-close-btn" onClick={handleModalClose} aria-label="Cerrar modal">
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

        {/* RIGHT PANEL (Auth & Verification) */}
        <div className="crm-auth-right-panel">
          <div className="crm-auth-right-content">
            <span className="crm-auth-welcome-badge">BIENVENIDO A ERPMETRICS 360</span>
            <h1 className="crm-auth-title">Vuelve a tu mejor trabajo</h1>
            <p className="crm-auth-subtitle">Inicia sesión para continuar donde lo dejaste.</p>

            {/* Step Navigation Indicator */}
            <div className="crm-auth-stepper-bar">
              <div
                className={`crm-step-item ${step === 1 ? 'step-active' : 'step-completed'}`}
                onClick={() => {
                  stopCameraStream();
                  setStep(1);
                }}
              >
                <span>Iniciar sesión</span>
                {step === 1 && <div className="crm-step-active-underline" />}
              </div>
              <span className="crm-step-arrow">-----------------&gt;</span>
              <div className={`crm-step-item ${step === 2 ? 'step-active' : 'step-inactive'}`}>
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
                  Al continuar, aceptas nuestras <span className="legal-link">Condiciones de uso</span> y{' '}
                  <span className="legal-link">Politica de privacidad</span>.
                </p>
              </form>
            )}

            {/* STEP 2 (AZURE): Facial Camera Verification */}
            {step === 2 && courseKey === 'microsoftAzure' && (
              <form onSubmit={handleStep2Submit} className="crm-auth-form">
                {/* Facial Instruction */}
                <p style={{ fontSize: 13, color: '#334155', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  <strong>Verificación Facial:</strong> Autentique su identidad mirando a la cámara.
                </p>

                {/* Camera Viewfinder Box (Enlarged) */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 250,
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#0a0f1d',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Real Live Camera Video Feed */}
                  {cameraState === 'active' ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)', // Mirror effect
                        display: 'block',
                      }}
                    />
                  ) : cameraState === 'requesting' ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                        color: '#94a3b8',
                      }}
                    >
                      <Camera size={36} color="#38bdf8" />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Activando cámara web...</span>
                    </div>
                  ) : (
                    /* Fallback image if camera permission pending or denied */
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=650&q=80"
                        alt="Verificación Facial"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center 20%',
                          filter: 'contrast(1.05) brightness(0.95)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={startCamera}
                        style={{
                          position: 'absolute',
                          bottom: 14,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(15, 23, 42, 0.88)',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid #38bdf8',
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '6px 16px',
                          borderRadius: 20,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                          zIndex: 15,
                        }}
                      >
                        <Video size={14} color="#38bdf8" />
                        <span>Permitir y Prender mi Cámara</span>
                      </button>
                    </div>
                  )}

                  {/* Top-Right Badge: 📹 Cámara Activada */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: isVerified ? 'rgba(22, 163, 74, 0.85)' : 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 20,
                      padding: '4px 11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 600,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isVerified ? '#22c55e' : '#38bdf8',
                        boxShadow: `0 0 6px ${isVerified ? '#22c55e' : '#38bdf8'}`,
                      }}
                    />
                    <span>{isVerified ? 'Rostro Verificado' : cameraState === 'active' ? 'Cámara en Vivo' : 'Cámara Activada'}</span>
                  </div>

                  {/* 4 Corner Viewfinder Brackets */}
                  {/* Top Left */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      width: 22,
                      height: 22,
                      borderTop: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderLeft: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderTopLeftRadius: 5,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Top Right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 22,
                      height: 22,
                      borderTop: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderRight: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderTopRightRadius: 5,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Bottom Left */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      left: 14,
                      width: 22,
                      height: 22,
                      borderBottom: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderLeft: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderBottomLeftRadius: 5,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Bottom Right */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      right: 14,
                      width: 22,
                      height: 22,
                      borderBottom: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderRight: isVerified ? '2.5px solid #22c55e' : '2.5px solid rgba(255, 255, 255, 0.85)',
                      borderBottomRightRadius: 5,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Full-width scanning laser line while scanning */}
                  {!isVerified && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2.5,
                        background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.95), transparent)',
                        boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
                        animation: 'facialScanLoop 2.2s ease-in-out infinite',
                        zIndex: 9,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>

                {/* Measurement Segmented LED Bar & Percentage Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    margin: '10px 0 8px',
                  }}
                >
                  {/* Segmented green bars */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2.5,
                      flex: 1,
                    }}
                  >
                    {Array.from({ length: TOTAL_BARS }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          height: 14,
                          borderRadius: 2,
                          background: idx < activeBarsCount ? '#22c55e' : '#e2e8f0',
                          transition: 'background 0.08s ease',
                        }}
                      />
                    ))}
                  </div>

                  {/* Percentage badge */}
                  <span
                    style={{
                      background: isVerified ? '#16a34a' : '#22c55e',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      minWidth: 34,
                      textAlign: 'center',
                    }}
                  >
                    {scanProgress}%
                  </span>

                  {/* Status text */}
                  <span
                    style={{
                      fontSize: 12,
                      color: isVerified ? '#16a34a' : '#64748b',
                      fontWeight: 600,
                      minWidth: 100,
                      textAlign: 'right',
                    }}
                  >
                    {getScanStatusText()}
                  </span>
                </div>

                {/* SUCCESS NOTIFICATION: Appears only after 7s completion */}
                {isVerified && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(16, 185, 129, 0.18))',
                      border: '1px solid #86efac',
                      borderRadius: 10,
                      padding: '9px 14px',
                      color: '#15803d',
                      fontSize: 12.5,
                      fontWeight: 600,
                      margin: '6px 0 10px',
                      animation: 'modalPopIn 0.3s ease-out',
                    }}
                  >
                    <CheckCircle2 size={17} color="#16a34a" />
                    <span>Verificación válida: Identidad facial confirmada con éxito</span>
                  </div>
                )}

                {error && <div className="crm-auth-error-box">{error}</div>}

                {/* Action Submit Button (Locked until 7s verification completes) */}
                <button
                  type="submit"
                  className="crm-btn-primary"
                  disabled={!isVerified || loading}
                  style={{
                    opacity: !isVerified ? 0.65 : 1,
                    cursor: !isVerified ? 'not-allowed' : 'pointer',
                    background: isVerified ? '#0a0f1d' : '#334155',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? (
                    'Iniciando sistema...'
                  ) : !isVerified ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Loader2 size={16} className="spin" />
                      <span>Reconociendo rostro ({scanProgress}%)...</span>
                    </span>
                  ) : (
                    <>
                      <span>Ingresar</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {/* Return link */}
                <div style={{ marginTop: 10, textAlign: 'left' }}>
                  <button
                    type="button"
                    className="crm-btn-back-step"
                    onClick={() => {
                      stopCameraStream();
                      setStep(1);
                    }}
                  >
                    <ArrowLeft size={14} /> Volver a Iniciar sesión
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2 (BIG DATA): OTP Code Verification */}
            {step === 2 && courseKey === 'bigData' && (
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
