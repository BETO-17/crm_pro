import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ArrowRight,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
  CloudCog,
  UserPlus,
  KeyRound,
  User,
  Mail,
  Lock,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  calculateFaceMeasurements,
  registerFaceWithAmazonRekognition,
  verifyFaceWithAmazonRekognition,
  DEFAULT_REKOGNITION_CONFIG,
  type FaceMeasurements,
  type RegisterFaceResult,
} from '../services/amazonRekognitionService';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AzureLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: AuthMode;
  initialUser?: {
    nombre?: string;
    correo?: string;
  };
}

type AuthMode = 'login' | 'register';
type ModalStep = 'form' | 'face';
type CameraState = 'prompt' | 'requesting' | 'active' | 'denied';
type FaceState = 'idle' | 'scanning' | 'verified' | 'failed';

// ─────────────────────────────────────────────────────────────────────────────
// CAPTURA DE FOTOGRAMAS FACIALES (AMAZON REKOGNITION)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AzureLoginModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  initialUser,
}: AzureLoginModalProps) {
  // ── Mode & Step ───────────────────────────────────────────────────────────
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<ModalStep>('form');

  // ── Login form state ──────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Register form state ───────────────────────────────────────────────────
  const [regFullName, setRegFullName] = useState(initialUser?.nombre ?? '');
  const [regEmail, setRegEmail] = useState(initialUser?.correo ?? '');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // ── Camera / Face Recognition State ───────────────────────────────────────
  const [cameraState, setCameraState] = useState<CameraState>('prompt');
  const [faceState, setFaceState] = useState<FaceState>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [faceError, setFaceError] = useState('');

  // ── Amazon Rekognition Measurements & Results ─────────────────────────────
  const [faceMeasurements, setFaceMeasurements] = useState<FaceMeasurements | null>(null);
  const [registeredResult, setRegisteredResult] = useState<RegisterFaceResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const regNameRef = useRef<HTMLInputElement | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helper: Detener cámara ────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('prompt');
  }, []);

  const resetAll = useCallback(() => {
    stopCamera();
    setMode(initialMode);
    setStep('form');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setLoginLoading(false);
    setLoginError('');

    setRegFullName(initialUser?.nombre ?? '');
    setRegEmail(initialUser?.correo ?? '');
    setRegPassword('');
    setRegShowPassword(false);
    setRegLoading(false);
    setRegError('');

    setCameraState('prompt');
    setFaceState('idle');
    setScanProgress(0);
    setFaceError('');
    setFaceMeasurements(null);
    setRegisteredResult(null);
  }, [stopCamera, initialMode, initialUser]);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  // Sync on open/close
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        resetAll();
        setTimeout(() => emailRef.current?.focus(), 200);
      }, 0);
      return () => clearTimeout(t);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, resetAll, stopCamera]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  // Attach stream to video element when camera becomes active
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraState, step]);

  // Polling de medidas faciales en tiempo real mientras la cámara está activa
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (cameraState === 'active' && step === 'face') {
      interval = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          try {
            const m = calculateFaceMeasurements(videoRef.current);
            setFaceMeasurements(m);
          } catch {
            // ignore frame read errors during initial sync
          }
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameraState, step]);

  // ── Switch tab mode (Login vs Registrar) ──────────────────────────────────
  const switchMode = (newMode: AuthMode) => {
    stopCamera();
    setMode(newMode);
    setStep('form');
    setFaceState('idle');
    setScanProgress(0);
    setFaceError('');
    setLoginError('');
    setRegError('');
    setRegisteredResult(null);

    setTimeout(() => {
      if (newMode === 'login') {
        emailRef.current?.focus();
      } else {
        regNameRef.current?.focus();
      }
    }, 150);
  };

  // ── Login submit ──────────────────────────────────────────────────────────
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!email.trim()) {
      setLoginError('Ingresa tu correo corporativo de Azure.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!password.trim()) {
      setLoginError('Ingresa tu contraseña de Azure.');
      return;
    }

    setLoginLoading(true);

    setTimeout(() => {
      setLoginLoading(false);
      setStep('face');
    }, 600);
  };

  // ── Register submit (Step 1 -> Step 2) ────────────────────────────────────
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim()) {
      setRegError('Ingresa tu nombre completo.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Ingresa tu correo corporativo.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError('Ingresa un correo corporativo válido.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setRegLoading(true);
    setTimeout(() => {
      setRegLoading(false);
      setStep('face');
    }, 500);
  };

  // ── Iniciar cámara ────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('denied');
      return;
    }
    try {
      setCameraState('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraState('active');
    } catch {
      setCameraState('denied');
    }
  }, []);

  // ── Verificación Facial (Login Biométrico AWS Rekognition) ─────────────────
  const startFaceScan = useCallback(async () => {
    if (!videoRef.current || cameraState !== 'active') return;

    setFaceState('scanning');
    setScanProgress(0);
    setFaceError('');

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 2;
      setScanProgress((prev) => Math.min(prev + 2, 95));
      if (progress >= 95 && scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }, 40);

    try {
      const authResult = await verifyFaceWithAmazonRekognition({
        videoEl: videoRef.current,
        similarityThreshold: 85.0,
      });

      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

      if (authResult.matched) {
        setScanProgress(100);
        setFaceState('verified');

        if (authResult.accessToken) {
          localStorage.setItem('token', authResult.accessToken);
        }

        const userStr = localStorage.getItem('user');
        const existingUser = userStr ? JSON.parse(userStr) : {};
        const azureUser = {
          ...existingUser,
          email: authResult.userEmail || email.trim() || existingUser.email,
          name: authResult.userName || existingUser.name,
          face_enrolled: true,
          rekognition_face_id: authResult.faceId,
          biometric_provider: 'Amazon Rekognition',
          azure_verified: true,
          azure_verified_at: new Date().toISOString(),
        };
        localStorage.setItem('user', JSON.stringify(azureUser));

        setTimeout(() => {
          stopCamera();
          onSuccess();
        }, 1400);
      } else {
        setScanProgress(0);
        setFaceState('failed');
        setFaceError(authResult.message || 'Rostro no coincide con ningún registro en la colección de Amazon Rekognition.');
      }
    } catch (err) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setScanProgress(0);
      setFaceState('failed');
      setFaceError(
        err instanceof Error
          ? err.message
          : 'No se pudo verificar el rostro. Intenta de nuevo.'
      );
    }
  }, [cameraState, email, stopCamera, onSuccess]);

  // ── Tomar Medidas y Registrar con Amazon Rekognition ───────────────────────
  const handleRegisterFaceRekognition = useCallback(async () => {
    if (!videoRef.current || cameraState !== 'active') return;

    setFaceState('scanning');
    setScanProgress(0);
    setFaceError('');

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 2;
      setScanProgress((prev) => Math.min(prev + 2, 95));
      if (progress >= 95 && scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }, 40);

    try {
      // 1. Extraer medidas en tiempo de captura
      const liveMeasurements = calculateFaceMeasurements(videoRef.current);
      setFaceMeasurements(liveMeasurements);

      // 2. Ejecutar servicio de enrolamiento en Amazon Rekognition
      const result = await registerFaceWithAmazonRekognition({
        userFullName: regFullName.trim(),
        userEmail: regEmail.trim(),
        videoEl: videoRef.current,
        collectionId: DEFAULT_REKOGNITION_CONFIG.collectionId,
      });

      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setScanProgress(100);
      setFaceState('verified');
      setRegisteredResult(result);
    } catch (err) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setScanProgress(0);
      setFaceState('failed');
      setFaceError(
        err instanceof Error
          ? err.message
          : 'Error al registrar el rostro con Amazon Rekognition.'
      );
    }
  }, [cameraState, regFullName, regEmail]);

  if (!isOpen) return null;

  return (
    <div
      className="azure-login-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Acceso y Biometría Facial"
    >
      <div className="azure-login-container">

        {/* ── Botón cerrar ─────────────────────────────────────────── */}
        <button
          className="azure-login-close"
          onClick={handleClose}
          aria-label="Cerrar modal"
          type="button"
        >
          <X size={18} />
        </button>

        {/* ── PANEL IZQUIERDO: Branding y Características ──────────── */}
        <div className="azure-login-brand-panel">
          <div className="azure-brand-glow" />
          <div className="azure-brand-rings" />

          <div className="azure-brand-logo-row">
            <div className="azure-brand-icon">
              <CloudCog size={26} />
            </div>
            <div>
              <div className="azure-brand-name">Microsoft Azure</div>
              <div className="azure-brand-sub">Cloud Platform — CRM Pro</div>
            </div>
          </div>

          <div className="azure-brand-hero">
            <h2 className="azure-brand-title">
              Accede a tu{' '}
              <span className="azure-brand-highlight">entorno cloud</span>{' '}
              seguro
            </h2>
            <p className="azure-brand-desc">
              Infraestructura escalable, Blob Storage y pipelines ETL,
              protegidos por autenticación biométrica y análisis facial con
              Amazon Rekognition & Azure Face API.
            </p>
          </div>

          <div className="azure-brand-security-badge">
            <Shield size={14} />
            <span>Biometría Facial con Amazon Rekognition & Azure</span>
          </div>

          <ul className="azure-brand-features" aria-label="Características">
            {[
              'Infraestructura Cloud escalable',
              'Blob Storage enterprise',
              'Pipelines ETL en tiempo real',
              'Toma de medidas biométricas y Rekognition IndexFaces',
            ].map((f) => (
              <li key={f} className="azure-brand-feature-item">
                <span className="azure-brand-feature-dot" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* ── PANEL DERECHO: Formulario y Flujos ────────────────────── */}
        <div className="azure-login-form-panel">
          <div className="azure-login-form-inner">

            {/* Pestañas de modo: Inicio de Sesión vs Registrar Rostro */}
            <div className="azure-auth-tabs" role="tablist" aria-label="Modo de autenticación">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={`azure-auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                <KeyRound size={14} />
                <span>Inicio de Sesión</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={`azure-auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => switchMode('register')}
              >
                <UserPlus size={14} />
                <span>Registrar Rostro</span>
                <span className="azure-auth-tab-badge">Rekognition</span>
              </button>
            </div>

            {/* Indicador de pasos */}
            <div className="azure-step-indicator" aria-label="Pasos del proceso">
              <div className={`azure-step-dot ${step === 'face' ? 'done' : 'active'}`}>
                {step === 'face' ? <CheckCircle2 size={11} /> : '1'}
              </div>
              <div className={`azure-step-line ${step === 'face' ? 'done' : ''}`} />
              <div className={`azure-step-dot ${step === 'face' ? 'active' : ''}`}>
                2
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* FLUJO 1: INICIO DE SESIÓN                                 */}
            {/* ══════════════════════════════════════════════════════════ */}
            {mode === 'login' && step === 'form' && (
              <>
                <div className="azure-form-header">
                  <span className="azure-form-eyebrow">MICROSOFT AZURE — ACCESO SEGURO</span>
                  <h1 className="azure-form-title">Inicio de Sesión</h1>
                  <p className="azure-form-subtitle">
                    Ingresa tus credenciales corporativas de Azure para continuar
                    con la verificación biométrica.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="azure-form" noValidate>
                  <div className="azure-field">
                    <label className="azure-label" htmlFor="azure-email">
                      Correo corporativo
                    </label>
                    <input
                      id="azure-email"
                      ref={emailRef}
                      type="email"
                      className="azure-input"
                      placeholder="usuario@empresa.onmicrosoft.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="azure-field">
                    <label className="azure-label" htmlFor="azure-password">
                      Contraseña de Azure
                    </label>
                    <div className="azure-password-wrapper">
                      <input
                        id="azure-password"
                        type={showPassword ? 'text' : 'password'}
                        className="azure-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="azure-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="azure-error-msg" role="alert">
                      <AlertTriangle size={14} />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="azure-submit-btn"
                    disabled={loginLoading}
                    id="azure-login-submit"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 size={16} className="azure-spin" />
                        <span>Verificando credenciales...</span>
                      </>
                    ) : (
                      <>
                        <span>Continuar a verificación facial</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="rekog-switch-link"
                    onClick={() => switchMode('register')}
                  >
                    ¿No tienes tu rostro registrado? Registrar rostro con Amazon Rekognition
                  </button>

                  <p className="azure-terms">
                    Al acceder aceptas las{' '}
                    <a href="#politica" onClick={(e) => e.preventDefault()}>
                      Políticas de seguridad corporativa
                    </a>{' '}
                    y el uso de datos biométricos para autenticación.
                  </p>
                </form>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* FLUJO 2: REGISTRO DE ROSTRO (DATOS DEL USUARIO)           */}
            {/* ══════════════════════════════════════════════════════════ */}
            {mode === 'register' && step === 'form' && (
              <>
                <div className="azure-form-header">
                  <span className="azure-form-eyebrow">
                    AMAZON REKOGNITION — ENROLAMIENTO FACIAL
                  </span>
                  <h1 className="azure-form-title">Registrar Rostro</h1>
                  <p className="azure-form-subtitle">
                    Ingresa tus datos corporativos para iniciar la toma de medidas
                    biométricas y enrolamiento con Amazon Rekognition.
                  </p>
                </div>

                <div className="rekog-provider-badge">
                  <span className="rekog-provider-dot" />
                  <span>Amazon Rekognition Collection: {DEFAULT_REKOGNITION_CONFIG.collectionId}</span>
                </div>

                <form onSubmit={handleRegisterSubmit} className="azure-form" noValidate>
                  <div className="azure-field">
                    <label className="azure-label" htmlFor="reg-fullname">
                      <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Nombre completo
                    </label>
                    <input
                      id="reg-fullname"
                      ref={regNameRef}
                      type="text"
                      className="azure-input"
                      placeholder="Ej. Carlos Rodríguez Gómez"
                      value={regFullName}
                      onChange={(e) => { setRegFullName(e.target.value); setRegError(''); }}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="azure-field">
                    <label className="azure-label" htmlFor="reg-email">
                      <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Correo corporativo
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className="azure-input"
                      placeholder="c.rodriguez@empresa.com"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setRegError(''); }}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="azure-field">
                    <label className="azure-label" htmlFor="reg-password">
                      <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Contraseña / PIN de seguridad
                    </label>
                    <div className="azure-password-wrapper">
                      <input
                        id="reg-password"
                        type={regShowPassword ? 'text' : 'password'}
                        className="azure-input"
                        placeholder="Mínimo 6 caracteres"
                        value={regPassword}
                        onChange={(e) => { setRegPassword(e.target.value); setRegError(''); }}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="azure-password-toggle"
                        onClick={() => setRegShowPassword((v) => !v)}
                        aria-label={regShowPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {regShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {regError && (
                    <div className="azure-error-msg" role="alert">
                      <AlertTriangle size={14} />
                      <span>{regError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="azure-submit-btn"
                    disabled={regLoading}
                    id="azure-register-submit"
                  >
                    {regLoading ? (
                      <>
                        <Loader2 size={16} className="azure-spin" />
                        <span>Preparando cámara...</span>
                      </>
                    ) : (
                      <>
                        <span>Continuar a captura y medidas faciales</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="rekog-switch-link"
                    onClick={() => switchMode('login')}
                  >
                    ¿Ya tienes tu rostro registrado? Iniciar sesión con biometría
                  </button>
                </form>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* PASO 2: CÁMARA / BIOMETRÍA (VERIFICACIÓN O REGISTRO)       */}
            {/* ══════════════════════════════════════════════════════════ */}
            {step === 'face' && (
              <>
                <div className="azure-form-header">
                  <span className="azure-form-eyebrow">
                    {mode === 'register'
                      ? 'PASO 2 DE 2 — TOMA DE MEDIDAS BIOMÉTRICAS'
                      : 'PASO 2 DE 2 — BIOMETRÍA'}
                  </span>
                  <h1 className="azure-form-title">
                    {mode === 'register'
                      ? 'Medición Facial y Registro'
                      : 'Verificación Facial'}
                  </h1>
                  <p className="azure-form-subtitle">
                    {mode === 'register'
                      ? 'Amazon Rekognition medirá los parámetros de tu rostro (distancia interocular, simetría y pose) para enrolarte.'
                      : 'Azure Face API analizará tu rostro para confirmar tu identidad antes de conceder acceso al entorno cloud.'}
                  </p>
                </div>

                <div className="azure-face-viewport" aria-label="Área de reconocimiento facial">

                  {/* Estado: Solicitar activación de cámara */}
                  {cameraState === 'prompt' && (
                    <div className="azure-face-prompt">
                      <div className="azure-face-prompt-icon">
                        <Camera size={28} />
                      </div>
                      <p className="azure-face-prompt-text">
                        {mode === 'register'
                          ? 'Necesitamos acceso a tu cámara para capturar y medir los vectores biométricos de tu rostro'
                          : 'Necesitamos acceso a tu cámara para verificar tu identidad'}
                      </p>
                      <button
                        type="button"
                        className="azure-face-start-btn"
                        onClick={startCamera}
                        id="azure-face-start"
                      >
                        <Camera size={15} />
                        Activar cámara para {mode === 'register' ? 'toma de medidas' : 'verificación'}
                      </button>
                    </div>
                  )}

                  {/* Estado: Solicitando permisos */}
                  {cameraState === 'requesting' && (
                    <div className="azure-face-prompt">
                      <Loader2 size={28} className="azure-spin azure-face-loader" />
                      <p className="azure-face-prompt-text">Solicitando acceso a la cámara…</p>
                    </div>
                  )}

                  {/* Estado: Permiso denegado */}
                  {cameraState === 'denied' && (
                    <div className="azure-face-prompt azure-face-denied">
                      <div className="azure-face-prompt-icon">
                        <AlertTriangle size={28} />
                      </div>
                      <p className="azure-face-prompt-text">
                        No se pudo acceder a la cámara. Permite el acceso en tu navegador e intenta de nuevo.
                      </p>
                      <button
                        type="button"
                        className="azure-face-retry-btn"
                        onClick={startCamera}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {/* Estado: Cámara Activa */}
                  {cameraState === 'active' && (
                    <div className="azure-face-active">
                      <div className="azure-face-video-wrapper">
                        <video
                          ref={videoRef}
                          className="azure-face-video"
                          autoPlay
                          playsInline
                          muted
                          aria-label="Vista de la cámara"
                        />

                        {/* HUD biométrico superpuesto (Amazon Rekognition & Reticles) */}
                        <div
                          className={`azure-face-scan-frame ${
                            faceState === 'verified'
                              ? 'verified'
                              : faceState === 'failed'
                              ? 'failed'
                              : faceState === 'scanning'
                              ? 'scanning'
                              : ''
                          }`}
                        >
                          <span className="scan-corner tl" />
                          <span className="scan-corner tr" />
                          <span className="scan-corner bl" />
                          <span className="scan-corner br" />

                          {/* Láser de barrido durante escaneo */}
                          {faceState === 'scanning' && (
                            <div className="azure-scan-beam" />
                          )}
                        </div>

                        {/* HUD SVG interactivo con landmarks y regla de distancia interocular */}
                        <div className="rekog-hud-overlay" aria-hidden="true">
                          <svg className="rekog-hud-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Óvalo facial de calibración */}
                            <ellipse
                              cx="50"
                              cy="50"
                              rx="22"
                              ry="31"
                              fill="none"
                              stroke={faceState === 'verified' ? '#10b981' : faceState === 'scanning' ? '#00bcf2' : 'rgba(255, 153, 0, 0.6)'}
                              strokeWidth="0.8"
                              strokeDasharray="2, 1"
                              className={faceState === 'scanning' ? 'rekog-scan-pulse' : ''}
                            />

                            {/* Eje de simetría facial vertical */}
                            <line
                              x1="50"
                              y1="22"
                              x2="50"
                              y2="78"
                              stroke="rgba(255, 255, 255, 0.25)"
                              strokeWidth="0.4"
                              strokeDasharray="1, 1"
                            />

                            {/* Línea de Distancia Interocular (IOD) */}
                            <line
                              x1="39"
                              y1="44"
                              x2="61"
                              y2="44"
                              stroke="#00bcf2"
                              strokeWidth="0.9"
                            />

                            {/* Puntos / Landmarks faciales */}
                            <circle cx="39" cy="44" r="1.5" fill="#00bcf2" /> {/* Ojo Izq */}
                            <circle cx="61" cy="44" r="1.5" fill="#00bcf2" /> {/* Ojo Der */}
                            <circle cx="50" cy="54" r="1.2" fill="#ff9900" /> {/* Nariz */}
                            <circle cx="42" cy="65" r="1.1" fill="#10b981" /> {/* Boca Izq */}
                            <circle cx="58" cy="65" r="1.1" fill="#10b981" /> {/* Boca Der */}
                            <circle cx="50" cy="76" r="1.3" fill="#a855f7" /> {/* Mentón */}
                          </svg>
                        </div>

                        {/* Overlay Verificado */}
                        {faceState === 'verified' && (
                          <div className="azure-face-verified-overlay">
                            <CheckCircle2 size={40} />
                            <span>
                              {mode === 'register'
                                ? 'Rostro y Medidas Registradas'
                                : 'Identidad Verificada'}
                            </span>
                          </div>
                        )}

                        {/* Overlay Fallido */}
                        {faceState === 'failed' && (
                          <div className="azure-face-failed-overlay">
                            <AlertTriangle size={32} />
                            <span>Proceso no completado</span>
                          </div>
                        )}
                      </div>

                      {/* Panel de Medidas Biométricas en Tiempo Real (Amazon Rekognition) */}
                      <div className="rekog-measurements-panel">
                        <div className="rekog-panel-header">
                          <span className="rekog-panel-title">
                            <Layers size={13} style={{ color: '#0078d4' }} />
                            Medidas Biométricas (Amazon Rekognition)
                          </span>
                          <span className="rekog-panel-status">
                            <span className="rekog-provider-dot" />
                            {faceMeasurements?.quality.isOptimal ? 'Óptimo' : 'Alineando'}
                          </span>
                        </div>

                        <div className="rekog-grid-metrics">
                          <div className="rekog-metric-card">
                            <span className="rekog-metric-label">
                              Distancia Interocular (IOD)
                              <Sparkles size={11} />
                            </span>
                            <span className="rekog-metric-val">
                              {faceMeasurements?.interocularDistanceMm ?? 64.2} mm
                            </span>
                            <span className="rekog-metric-sub">Rango estándar humano</span>
                          </div>

                          <div className="rekog-metric-card">
                            <span className="rekog-metric-label">Simetría Bilateral</span>
                            <span className="rekog-metric-val">
                              {faceMeasurements?.facialSymmetryScore ?? 97.8}%
                            </span>
                            <span className="rekog-metric-sub">Alta correlación</span>
                          </div>

                          <div className="rekog-metric-card">
                            <span className="rekog-metric-label">Ángulo de Pose</span>
                            <span className="rekog-metric-val">
                              P: {faceMeasurements?.pose.Pitch ?? 0.4}° | Y: {faceMeasurements?.pose.Yaw ?? -0.8}°
                            </span>
                            <span className="rekog-metric-sub">Frontal centrado</span>
                          </div>

                          <div className="rekog-metric-card">
                            <span className="rekog-metric-label">Calidad & Nitidez</span>
                            <span className="rekog-metric-val">
                              {faceMeasurements?.quality.Brightness ?? 82}% / {faceMeasurements?.quality.Sharpness ?? 89}%
                            </span>
                            <span className="rekog-metric-sub">Cumple estándar AWS</span>
                          </div>
                        </div>
                      </div>

                      {/* Progreso de escaneo */}
                      {faceState === 'scanning' && (
                        <div className="azure-face-progress-row">
                          <div className="azure-face-progress-ring-wrapper">
                            <svg viewBox="0 0 40 40" className="azure-ring-svg" aria-hidden="true">
                              <circle cx="20" cy="20" r="16" className="azure-ring-track" />
                              <circle
                                cx="20" cy="20" r="16"
                                className="azure-ring-fill"
                                strokeDasharray={`${(scanProgress / 100) * 100.53} 100.53`}
                              />
                            </svg>
                            <span className="azure-ring-pct">{scanProgress}%</span>
                          </div>
                          <span className="azure-face-status-text">
                            {mode === 'register'
                              ? 'Calculando medidas y enrolando en Amazon Rekognition…'
                              : 'Analizando con Azure Face API…'}
                          </span>
                        </div>
                      )}

                      {/* Error */}
                      {faceError && (
                        <div className="azure-error-msg" role="alert" style={{ marginTop: 8 }}>
                          <AlertTriangle size={14} />
                          <span>{faceError}</span>
                        </div>
                      )}

                      {/* Acciones: Botón de Toma de Medidas / Registro */}
                      {faceState === 'idle' && mode === 'register' && (
                        <button
                          type="button"
                          className="azure-submit-btn"
                          onClick={handleRegisterFaceRekognition}
                          id="rekog-face-register-btn"
                          style={{
                            background: 'linear-gradient(135deg, #ff9900, #d97706)',
                            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                          }}
                        >
                          <Camera size={16} />
                          <span>Tomar medidas y registrar con Amazon Rekognition</span>
                        </button>
                      )}

                      {/* Acciones: Botón de Verificación (Login) */}
                      {faceState === 'idle' && mode === 'login' && (
                        <button
                          type="button"
                          className="azure-submit-btn"
                          onClick={startFaceScan}
                          id="azure-face-scan"
                        >
                          <Camera size={16} />
                          <span>Iniciar verificación facial</span>
                        </button>
                      )}

                      {/* Botón Reintentar */}
                      {faceState === 'failed' && (
                        <button
                          type="button"
                          className="azure-face-retry-btn"
                          onClick={() => {
                            setFaceState('idle');
                            setFaceError('');
                            setScanProgress(0);
                          }}
                        >
                          Intentar de nuevo
                        </button>
                      )}

                      {/* Tarjeta de Éxito en Registro */}
                      {faceState === 'verified' && mode === 'register' && registeredResult && (
                        <div className="rekog-success-card">
                          <div className="rekog-success-header">
                            <div className="rekog-success-icon-wrap">
                              <CheckCircle2 size={20} />
                            </div>
                            <div>
                              <h4 className="rekog-success-title">
                                ¡Rostro registrado exitosamente!
                              </h4>
                              <p className="rekog-success-desc">
                                Las medidas biométricas han sido indexadas en Amazon Rekognition.
                              </p>
                            </div>
                          </div>

                          <div className="rekog-data-rows">
                            <div className="rekog-data-row">
                              <span>Amazon Face ID:</span>
                              <span className="rekog-data-val">{registeredResult.faceId}</span>
                            </div>
                            <div className="rekog-data-row">
                              <span>Colección AWS:</span>
                              <span className="rekog-data-val">{registeredResult.collectionId}</span>
                            </div>
                            <div className="rekog-data-row">
                              <span>Distancia Interocular:</span>
                              <span className="rekog-data-val">
                                {registeredResult.measurements.interocularDistanceMm} mm
                              </span>
                            </div>
                            <div className="rekog-data-row">
                              <span>Simetría Facial:</span>
                              <span className="rekog-data-val">
                                {registeredResult.measurements.facialSymmetryScore}%
                              </span>
                            </div>
                            <div className="rekog-data-row">
                              <span>Confianza Rekognition:</span>
                              <span className="rekog-data-val" style={{ color: '#059669' }}>
                                {registeredResult.measurements.confidence}%
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              className="azure-submit-btn"
                              style={{ flex: 1, padding: '10px 14px', fontSize: '12px' }}
                              onClick={() => {
                                setEmail(regEmail);
                                switchMode('login');
                              }}
                            >
                              <KeyRound size={14} />
                              <span>Iniciar sesión ahora</span>
                            </button>
                            <button
                              type="button"
                              className="azure-face-retry-btn"
                              style={{ flex: 1, margin: 0, padding: '10px 14px', fontSize: '12px' }}
                              onClick={() => {
                                stopCamera();
                                onSuccess();
                              }}
                            >
                              <span>Finalizar y acceder</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Éxito de Verificación (Login) */}
                      {faceState === 'verified' && mode === 'login' && (
                        <div className="azure-face-success-msg">
                          <CheckCircle2 size={16} />
                          <span>Acceso concedido — Redirigiendo al entorno Azure…</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {faceState !== 'verified' && (
                  <button
                    type="button"
                    className="azure-back-link"
                    onClick={() => {
                      stopCamera();
                      setStep('form');
                      setFaceState('idle');
                    }}
                  >
                    ← Volver a datos del usuario
                  </button>
                )}
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
