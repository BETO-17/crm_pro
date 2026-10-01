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
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AzureLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 'login' | 'face';
type CameraState = 'prompt' | 'requesting' | 'active' | 'denied';
type FaceState = 'idle' | 'scanning' | 'verified' | 'failed';

// ─────────────────────────────────────────────────────────────────────────────
// AZURE FACE API SERVICE LAYER
// Preparado para conectar con backend. Reemplaza las funciones stub con
// llamadas reales cuando el backend esté disponible.
// ─────────────────────────────────────────────────────────────────────────────

interface AzureFaceApiConfig {
  endpoint: string;      // e.g. "https://<region>.api.cognitive.microsoft.com"
  apiKey: string;        // Azure Cognitive Services key
  personGroupId: string; // Grupo de personas registradas
}

// TODO: Descomenta y configura con variables de entorno cuando el backend esté listo
// const AZURE_FACE_CONFIG: AzureFaceApiConfig = {
//   endpoint:      import.meta.env.VITE_AZURE_FACE_ENDPOINT ?? '',
//   apiKey:        import.meta.env.VITE_AZURE_FACE_API_KEY ?? '',
//   personGroupId: import.meta.env.VITE_AZURE_FACE_PERSON_GROUP ?? 'crm-users',
// };

/**
 * Captura un frame del elemento <video> y lo convierte a Blob (JPEG).
 * Reutilizable para enviar a Azure Face API.
 */
async function captureFrameAsBlob(videoEl: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth || 640;
  canvas.height = videoEl.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to capture frame'))),
      'image/jpeg',
      0.92
    );
  });
}

/**
 * STUB: Detecta un rostro en el frame y devuelve el faceId.
 *
 * ── CUANDO EL BACKEND ESTÉ LISTO reemplaza el cuerpo por: ──────────────────
 *
 *   const blob = await captureFrameAsBlob(videoEl);
 *   const res = await fetch(
 *     `${config.endpoint}/face/v1.0/detect?returnFaceId=true&detectionModel=detection_03`,
 *     {
 *       method: 'POST',
 *       headers: {
 *         'Ocp-Apim-Subscription-Key': config.apiKey,
 *         'Content-Type': 'application/octet-stream',
 *       },
 *       body: blob,
 *     }
 *   );
 *   if (!res.ok) throw new Error('Error en la API de Azure Face');
 *   const faces: { faceId: string }[] = await res.json();
 *   if (!faces.length) throw new Error('No se detectó ningún rostro. Asegúrate de estar frente a la cámara.');
 *   return faces[0].faceId;
 *
 * ───────────────────────────────────────────────────────────────────────────
 */
async function azureDetectFace(
  videoEl: HTMLVideoElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config?: AzureFaceApiConfig
): Promise<string> {
  await captureFrameAsBlob(videoEl); // mantiene el pipeline activo
  await new Promise((r) => setTimeout(r, 800));
  return `demo-face-id-${Date.now()}`;
}

/**
 * STUB: Identifica el faceId contra el PersonGroup de usuarios en Azure.
 *
 * ── CUANDO EL BACKEND ESTÉ LISTO reemplaza el cuerpo por: ──────────────────
 *
 *   const res = await fetch(`${config.endpoint}/face/v1.0/identify`, {
 *     method: 'POST',
 *     headers: {
 *       'Ocp-Apim-Subscription-Key': config.apiKey,
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify({
 *       faceIds: [faceId],
 *       personGroupId: config.personGroupId,
 *       maxNumOfCandidatesReturned: 1,
 *       confidenceThreshold: 0.8,
 *     }),
 *   });
 *   if (!res.ok) throw new Error('Error al identificar el rostro');
 *   const result = await res.json();
 *   const topCandidate = result[0]?.candidates?.[0];
 *   if (!topCandidate || topCandidate.confidence < 0.8)
 *     throw new Error('Rostro no reconocido. Verifica que estés correctamente registrado.');
 *   return topCandidate.personId as string;
 *
 * ───────────────────────────────────────────────────────────────────────────
 */
async function azureIdentifyFace(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _faceId?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config?: AzureFaceApiConfig
): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  return `demo-person-id-${Date.now()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AzureLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: AzureLoginModalProps) {
  // ── Step ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<ModalStep>('login');

  // ── Login form ────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Camera / Face ─────────────────────────────────────────────────────────
  const [cameraState, setCameraState] = useState<CameraState>('prompt');
  const [faceState, setFaceState] = useState<FaceState>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [faceError, setFaceError] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
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
    setStep('login');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setLoginLoading(false);
    setLoginError('');
    setCameraState('prompt');
    setFaceState('idle');
    setScanProgress(0);
    setFaceError('');
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  // Sync on open/close
  useEffect(() => {
    if (isOpen) {
      // Defer state resets out of the synchronous effect body
      const t = setTimeout(() => {
        resetAll();
        setTimeout(() => emailRef.current?.focus(), 200);
      }, 0);
      return () => clearTimeout(t);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      stopCamera();
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Escape key
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

    // ── BACKEND HOOK ────────────────────────────────────────────────────────
    // Cuando el backend esté listo, reemplaza este setTimeout por:
    //
    //   fetch('http://localhost:8000/api/v1/auth/azure/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    //   })
    //     .then(async (res) => {
    //       if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
    //       return res.json();
    //     })
    //     .then(() => { setLoginLoading(false); setStep('face'); })
    //     .catch((err) => {
    //       setLoginLoading(false);
    //       setLoginError(err.message || 'Credenciales incorrectas.');
    //     });
    //
    // ───────────────────────────────────────────────────────────────────────
    setTimeout(() => {
      setLoginLoading(false);
      setStep('face');
    }, 700);
  };

  // ── Camera start ──────────────────────────────────────────────────────────
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

  // ── Face scan ─────────────────────────────────────────────────────────────
  const startFaceScan = useCallback(async () => {
    if (!videoRef.current || cameraState !== 'active') return;

    setFaceState('scanning');
    setScanProgress(0);
    setFaceError('');

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 1;
      setScanProgress(progress);
      if (progress >= 100 && scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }, 60); // ~6 segundos totales

    try {
      // STUB config — reemplaza con import.meta.env.VITE_AZURE_FACE_* al conectar el backend
      const stubConfig: AzureFaceApiConfig = {
        endpoint: '',
        apiKey: '',
        personGroupId: 'crm-users',
      };

      const faceId = await azureDetectFace(videoRef.current, stubConfig);
      await azureIdentifyFace(faceId, stubConfig);

      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setScanProgress(100);
      setFaceState('verified');

      // ── BACKEND HOOK ────────────────────────────────────────────────────
      // Al conectar el backend puedes verificar el personId contra sesión:
      //
      //   await fetch('http://localhost:8000/api/v1/auth/azure/face-verify', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     },
      //     body: JSON.stringify({ personId }),
      //   });
      //
      // ───────────────────────────────────────────────────────────────────

      // Guardar flags de verificación en sesión (reemplazar con data real del backend)
      const userStr = localStorage.getItem('user');
      const existingUser = userStr ? JSON.parse(userStr) : {};
      const azureUser = {
        ...existingUser,
        email: email.trim() || existingUser.email,
        azure_verified: true,
        azure_verified_at: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(azureUser));
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', `azure-session-${Date.now()}`);
      }

      // Esperar 1.5s para mostrar el estado "Verificado" antes de navegar
      setTimeout(() => {
        stopCamera();
        onSuccess();
      }, 1500);
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

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="azure-login-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Inicio de sesión Microsoft Azure"
    >
      <div className="azure-login-container">

        {/* ── Close button ─────────────────────────────────────────── */}
        <button
          className="azure-login-close"
          onClick={handleClose}
          aria-label="Cerrar modal de Azure"
          type="button"
        >
          <X size={18} />
        </button>

        {/* ── LEFT: Azure branding panel ───────────────────────────── */}
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
              protegidos por autenticación biométrica con Azure Face API.
            </p>
          </div>

          <div className="azure-brand-security-badge">
            <Shield size={14} />
            <span>Verificación biométrica Azure Face API</span>
          </div>

          <ul className="azure-brand-features" aria-label="Características">
            {[
              'Infraestructura Cloud escalable',
              'Blob Storage enterprise',
              'Pipelines ETL en tiempo real',
              'Monitoreo de cómputo',
            ].map((f) => (
              <li key={f} className="azure-brand-feature-item">
                <span className="azure-brand-feature-dot" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT: Form panel ─────────────────────────────────────── */}
        <div className="azure-login-form-panel">
          <div className="azure-login-form-inner">

            {/* Step indicator */}
            <div className="azure-step-indicator" aria-label="Pasos de verificación">
              <div className={`azure-step-dot ${step === 'face' ? 'done' : 'active'}`}>
                {step === 'face' ? <CheckCircle2 size={11} /> : '1'}
              </div>
              <div className={`azure-step-line ${step === 'face' ? 'done' : ''}`} />
              <div className={`azure-step-dot ${step === 'face' ? 'active' : ''}`}>
                2
              </div>
            </div>

            {/* ── STEP 1: Login ───────────────────────────────────── */}
            {step === 'login' && (
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

            {/* ── STEP 2: Face Recognition ────────────────────────── */}
            {step === 'face' && (
              <>
                <div className="azure-form-header">
                  <span className="azure-form-eyebrow">PASO 2 DE 2 — BIOMETRÍA</span>
                  <h1 className="azure-form-title">Verificación Facial</h1>
                  <p className="azure-form-subtitle">
                    Azure Face API analizará tu rostro para confirmar tu identidad
                    antes de conceder acceso al entorno cloud.
                  </p>
                </div>

                <div className="azure-face-viewport" aria-label="Área de reconocimiento facial">

                  {/* Prompt */}
                  {cameraState === 'prompt' && (
                    <div className="azure-face-prompt">
                      <div className="azure-face-prompt-icon">
                        <Camera size={28} />
                      </div>
                      <p className="azure-face-prompt-text">
                        Necesitamos acceso a tu cámara para verificar tu identidad
                      </p>
                      <button
                        type="button"
                        className="azure-face-start-btn"
                        onClick={startCamera}
                        id="azure-face-start"
                      >
                        <Camera size={15} />
                        Activar cámara
                      </button>
                    </div>
                  )}

                  {/* Requesting */}
                  {cameraState === 'requesting' && (
                    <div className="azure-face-prompt">
                      <Loader2 size={28} className="azure-spin azure-face-loader" />
                      <p className="azure-face-prompt-text">Solicitando acceso a la cámara…</p>
                    </div>
                  )}

                  {/* Denied */}
                  {cameraState === 'denied' && (
                    <div className="azure-face-prompt azure-face-denied">
                      <AlertTriangle size={28} />
                      <p className="azure-face-prompt-text">
                        Acceso a la cámara denegado. Habilita los permisos en tu
                        navegador e intenta de nuevo.
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

                  {/* Active / scanning */}
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

                        {/* Overlay scan frame */}
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
                          {faceState === 'scanning' && (
                            <div className="azure-scan-beam" />
                          )}
                        </div>

                        {faceState === 'verified' && (
                          <div className="azure-face-verified-overlay">
                            <CheckCircle2 size={40} />
                            <span>Identidad verificada</span>
                          </div>
                        )}

                        {faceState === 'failed' && (
                          <div className="azure-face-failed-overlay">
                            <AlertTriangle size={32} />
                            <span>Verificación fallida</span>
                          </div>
                        )}
                      </div>

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
                            Analizando con Azure Face API…
                          </span>
                        </div>
                      )}

                      {faceError && (
                        <div className="azure-error-msg" role="alert" style={{ marginTop: 10 }}>
                          <AlertTriangle size={14} />
                          <span>{faceError}</span>
                        </div>
                      )}

                      {faceState === 'idle' && (
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

                      {faceState === 'verified' && (
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
                      setStep('login');
                      setFaceState('idle');
                    }}
                  >
                    ← Volver al inicio de sesión
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
