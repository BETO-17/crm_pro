import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Play,
  Square,
  Sparkles,
  Smile,
  Eye,
  Glasses,
  UserCheck,
  History,
  Trash2,
  AlertCircle,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  analyzeEmotionsFromCanvas,
  detectEmotionsFromBlob,
  detectEmotionsFromVideoElement,
  fetchEmotionsHistory,
  EMOTION_META,
  type AwsEmotionsDetectionResult,
  type AwsEmotionType,
} from '../services/awsRekognitionEmotionsService';
import '../azure.css';

export default function VisualizadorEmociones() {
  const [activeTab, setActiveTab] = useState<'camera' | 'image'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Resultados de detección actual
  const [currentResult, setCurrentResult] = useState<AwsEmotionsDetectionResult | null>(null);

  // Historial de lecturas emocionales
  const [history, setHistory] = useState<AwsEmotionsDetectionResult[]>(() => {
    try {
      const saved = localStorage.getItem('crm_rekog_emotions_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Imagen cargada
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Guardar historial en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('crm_rekog_emotions_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignore storage limits
    }
  }, [history]);

  // Cargar historial remoto desde PostgreSQL (GET /api/v1/rekognition/emotions/history)
  useEffect(() => {
    let isMounted = true;
    fetchEmotionsHistory(20).then((remoteHistory) => {
      if (isMounted && remoteHistory.length > 0) {
        setHistory((prev) => {
          const ids = new Set(prev.map((h) => h.id));
          const newEntries = remoteHistory.filter((h) => !ids.has(h.id));
          return [...newEntries, ...prev].slice(0, 20);
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Detener cámara
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsAnalyzing(false);
  }, []);

  // Iniciar cámara
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('La cámara no está soportada en este navegador.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setIsAnalyzing(true);
    } catch (err) {
      setCameraError(
        err instanceof Error ? err.message : 'No se pudo acceder a la cámara web.'
      );
      setIsCameraActive(false);
    }
  };

  // Bucle de detección en tiempo real sobre la cámara
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isCameraActive && isAnalyzing && videoRef.current) {
      interval = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          try {
            const result = analyzeEmotionsFromCanvas(videoRef.current, 'live_camera');
            setCurrentResult(result);
          } catch {
            // ignore frame read glitch
          }
        }
      }, 700);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCameraActive, isAnalyzing]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Guardar snapshot en historial
  const saveSnapshotToHistory = () => {
    if (currentResult) {
      setHistory((prev) => [currentResult, ...prev.slice(0, 19)]);
    }
  };

  // Enviar fotograma actual directamente a la API de AWS Rekognition (POST /api/v1/rekognition/detect-emotions)
  const handleAnalyzeWithAwsApi = async () => {
    if (!videoRef.current || !isCameraActive) return;
    setIsCallingApi(true);
    setApiNotice(null);

    try {
      const res = await detectEmotionsFromVideoElement(videoRef.current);
      setCurrentResult(res);
      setHistory((prev) => [res, ...prev.slice(0, 19)]);
      setApiNotice(
        `Fotograma procesado por AWS Rekognition (${res.primaryEmotion.Type} ${res.primaryEmotion.Confidence}%)`
      );
      setTimeout(() => setApiNotice(null), 4000);
    } catch (err) {
      console.warn('Fallo al analizar fotograma con AWS:', err);
    } finally {
      setIsCallingApi(false);
    }
  };

  // Carga de imagen desde archivo local
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    const url = URL.createObjectURL(file);
    setUploadedImageUrl(url);
    setIsAnalyzing(true);
    setApiNotice(null);

    try {
      const result = await detectEmotionsFromBlob(file);
      setCurrentResult(result);
      setHistory((prev) => [result, ...prev.slice(0, 19)]);
      setApiNotice(
        `Fotografía procesada con Amazon Rekognition (${result.primaryEmotion.Type} ${result.primaryEmotion.Confidence}%)`
      );
      setTimeout(() => setApiNotice(null), 4000);
    } catch (err) {
      console.error('Error al analizar imagen:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('crm_rekog_emotions_history');
  };

  const primaryEmotionMeta = currentResult
    ? EMOTION_META[currentResult.primaryEmotion.Type]
    : EMOTION_META.HAPPY;

  return (
    <div className="azure-container emotions-module-container">
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <div className="emotions-hero">
        <div className="emotions-hero-left">
          <div className="emotions-hero-badge">
            <Sparkles size={14} />
            <span>Módulo de Visión Artificial — Amazon Rekognition</span>
          </div>
          <h1 className="emotions-hero-title">Visualizador de Emociones</h1>
          <p className="emotions-hero-desc">
            Detección, clasificación y seguimiento de las 8 emociones canónicas de
            AWS Rekognition en tiempo real mediante visión computacional.
          </p>
        </div>

        <div className="emotions-hero-stats">
          <div className="emotions-stat-chip">
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
            <div>
              <span className="stat-chip-label">API Status</span>
              <span className="stat-chip-value">Rekognition Activo</span>
            </div>
          </div>
          <div className="emotions-stat-chip">
            <Activity size={16} style={{ color: '#00bcf2' }} />
            <div>
              <span className="stat-chip-label">Emociones AWS</span>
              <span className="stat-chip-value">8 Categorías</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SELECTOR DE MODO: Cámara vs Imagen ─────────────────────── */}
      <div className="emotions-toolbar">
        <div className="emotions-mode-tabs" role="tablist">
          <button
            type="button"
            className={`emotions-mode-tab ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('camera');
            }}
          >
            <Camera size={15} />
            <span>Cámara en Vivo</span>
          </button>
          <button
            type="button"
            className={`emotions-mode-tab ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => {
              stopCamera();
              setActiveTab('image');
            }}
          >
            <Upload size={15} />
            <span>Analizar Fotografía</span>
          </button>
        </div>

        <div className="emotions-toolbar-actions">
          {activeTab === 'camera' && (
            <>
              {!isCameraActive ? (
                <button
                  type="button"
                  className="emotions-btn-primary"
                  onClick={startCamera}
                >
                  <Play size={15} />
                  <span>Activar Cámara</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="emotions-btn-primary"
                    onClick={handleAnalyzeWithAwsApi}
                    disabled={isCallingApi}
                    style={{
                      background: 'linear-gradient(135deg, #ff9900, #d97706)',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                    }}
                    title="Enviar fotograma al endpoint POST /api/v1/rekognition/detect-emotions"
                  >
                    <Sparkles size={14} className={isCallingApi ? 'azure-spin' : ''} />
                    <span>{isCallingApi ? 'Consultando AWS Rekognition…' : 'Analizar con AWS API'}</span>
                  </button>
                  <button
                    type="button"
                    className="emotions-btn-secondary"
                    onClick={saveSnapshotToHistory}
                    disabled={!currentResult}
                  >
                    <Zap size={14} />
                    <span>Guardar Captura</span>
                  </button>
                  <button
                    type="button"
                    className="emotions-btn-danger"
                    onClick={stopCamera}
                  >
                    <Square size={14} />
                    <span>Detener Cámara</span>
                  </button>
                </>
              )}
            </>
          )}

          {activeTab === 'image' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                className="emotions-btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>Seleccionar Imagen</span>
              </button>
            </>
          )}
        </div>
      </div>

      {apiNotice && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={16} />
          <span>{apiNotice}</span>
        </div>
      )}

      {/* ── GRID PRINCIPAL: Visor + Espectro de Emociones ──────────── */}
      <div className="emotions-main-grid">
        {/* Columna Izquierda: Viewport Visual */}
        <div className="emotions-card emotions-viewport-card">
          <div className="emotions-card-header">
            <div className="card-header-title">
              <Camera size={16} style={{ color: '#0078d4' }} />
              <span>Fuente Visual & Detección Facial</span>
            </div>
            {currentResult && (
              <span className="emotions-live-pill">
                <span className="live-dot" /> En análisis
              </span>
            )}
          </div>

          <div className="emotions-media-wrapper">
            {activeTab === 'camera' && (
              <>
                <video
                  ref={videoRef}
                  className="emotions-video-element"
                  autoPlay
                  playsInline
                  muted
                  style={{ display: isCameraActive ? 'block' : 'none' }}
                />

                {!isCameraActive && (
                  <div className="emotions-camera-placeholder">
                    <div className="camera-placeholder-icon">
                      <Camera size={36} />
                    </div>
                    <h3 className="camera-placeholder-title">Cámara Desactivada</h3>
                    <p className="camera-placeholder-sub">
                      Presiona "Activar Cámara" para iniciar la detección y medición
                      continua de emociones con Amazon Rekognition.
                    </p>
                    <button
                      type="button"
                      className="emotions-btn-primary"
                      onClick={startCamera}
                    >
                      <Play size={14} />
                      Activar Cámara Web
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'image' && (
              <>
                {uploadedImageUrl ? (
                  <img
                    src={uploadedImageUrl}
                    alt="Fotografía para análisis"
                    className="emotions-image-element"
                  />
                ) : (
                  <div
                    className="emotions-upload-placeholder"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={36} style={{ color: '#0078d4' }} />
                    <h3 className="camera-placeholder-title">Cargar Fotografía</h3>
                    <p className="camera-placeholder-sub">
                      Haz clic para seleccionar una foto con rostro humano (JPEG, PNG).
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Overlay Bounding Box con emoción detectada sobre el rostro */}
            {currentResult && (isCameraActive || (activeTab === 'image' && uploadedImageUrl)) && (
              <div className="emotions-face-overlay">
                <div className="emotions-face-box">
                  <div className="box-corner tl" />
                  <div className="box-corner tr" />
                  <div className="box-corner bl" />
                  <div className="box-corner br" />

                  {/* Etiqueta flotante con emoción predominante */}
                  <div
                    className="emotions-face-tag"
                    style={{ background: primaryEmotionMeta.color }}
                  >
                    <span>{primaryEmotionMeta.emoji}</span>
                    <span>
                      {primaryEmotionMeta.label.toUpperCase()} {currentResult.primaryEmotion.Confidence}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="emotions-error-banner" role="alert">
              <AlertCircle size={15} />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Columna Derecha: Tarjeta de Emoción Principal y Espectro AWS */}
        <div className="emotions-card emotions-spectrum-card">
          <div className="emotions-card-header">
            <div className="card-header-title">
              <Smile size={16} style={{ color: '#10b981' }} />
              <span>Espectro Emocional AWS Rekognition</span>
            </div>
            <span className="card-header-badge">Model: DetectFaces v4</span>
          </div>

          {/* Tarjeta de Emoción Predominante */}
          {currentResult ? (
            <div
              className="emotions-dominant-card"
              style={{
                background: primaryEmotionMeta.bgLight,
                borderColor: primaryEmotionMeta.color,
              }}
            >
              <div className="dominant-emoji-circle" style={{ borderColor: primaryEmotionMeta.color }}>
                {primaryEmotionMeta.emoji}
              </div>
              <div className="dominant-info">
                <span className="dominant-eyebrow">Emoción Predominante</span>
                <h3 className="dominant-name" style={{ color: primaryEmotionMeta.color }}>
                  {primaryEmotionMeta.label} ({currentResult.primaryEmotion.Type})
                </h3>
                <p className="dominant-desc">{primaryEmotionMeta.description}</p>
              </div>
              <div className="dominant-confidence-tag">
                <span className="conf-value">{currentResult.primaryEmotion.Confidence}%</span>
                <span className="conf-label">Certeza AWS</span>
              </div>
            </div>
          ) : (
            <div className="emotions-empty-dominant">
              <Smile size={28} style={{ color: '#94a3b8' }} />
              <p>Inicia la cámara o carga una imagen para ver la clasificación emocional.</p>
            </div>
          )}

          {/* Lista de las 8 Emociones de Amazon Rekognition */}
          <div className="emotions-bars-list">
            <span className="bars-section-title">Distribución de Emociones Detectadas</span>
            {(
              currentResult?.emotions ?? [
                { Type: 'HAPPY' as AwsEmotionType, Confidence: 0 },
                { Type: 'CALM' as AwsEmotionType, Confidence: 0 },
                { Type: 'SURPRISED' as AwsEmotionType, Confidence: 0 },
                { Type: 'CONFUSED' as AwsEmotionType, Confidence: 0 },
                { Type: 'SAD' as AwsEmotionType, Confidence: 0 },
                { Type: 'ANGRY' as AwsEmotionType, Confidence: 0 },
                { Type: 'DISGUSTED' as AwsEmotionType, Confidence: 0 },
                { Type: 'FEAR' as AwsEmotionType, Confidence: 0 },
              ]
            ).map((emot) => {
              const meta = EMOTION_META[emot.Type];
              return (
                <div key={emot.Type} className="emotion-bar-row">
                  <div className="bar-label-group">
                    <span className="bar-emoji">{meta.emoji}</span>
                    <span className="bar-name">{meta.label}</span>
                    <span className="bar-code">({emot.Type})</span>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${emot.Confidence}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>

                  <span className="bar-pct" style={{ color: emot.Confidence > 30 ? meta.color : '#64748b' }}>
                    {emot.Confidence}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ATRIBUTOS FACIALES COMPLEMENTARIOS DE AWS ──────────────── */}
      <div className="emotions-attributes-section">
        <h3 className="section-title">
          <UserCheck size={16} style={{ color: '#0078d4' }} />
          Atributos Faciales Detectados por AWS Rekognition
        </h3>

        <div className="emotions-attributes-grid">
          {/* Sonrisa */}
          <div className="emotions-attr-card">
            <div className="attr-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Smile size={18} />
            </div>
            <div className="attr-info">
              <span className="attr-label">Sonrisa Detectada</span>
              <span className="attr-value">
                {currentResult?.smile.Value ? 'Sí — Sonriendo' : 'No detectada'}
              </span>
              <span className="attr-sub">
                Confianza: {currentResult?.smile.Confidence ?? 0}%
              </span>
            </div>
          </div>

          {/* Ojos Abiertos */}
          <div className="emotions-attr-card">
            <div className="attr-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
              <Eye size={18} />
            </div>
            <div className="attr-info">
              <span className="attr-label">Ojos Abiertos</span>
              <span className="attr-value">
                {currentResult?.eyesOpen.Value ? 'Abiertos' : 'Cerrados'}
              </span>
              <span className="attr-sub">
                Confianza: {currentResult?.eyesOpen.Confidence ?? 0}%
              </span>
            </div>
          </div>

          {/* Gafas */}
          <div className="emotions-attr-card">
            <div className="attr-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <Glasses size={18} />
            </div>
            <div className="attr-info">
              <span className="attr-label">Gafas / Lentes</span>
              <span className="attr-value">
                {currentResult?.eyeglasses.Value ? 'Presentes' : 'No presentes'}
              </span>
              <span className="attr-sub">
                Confianza: {currentResult?.eyeglasses.Confidence ?? 0}%
              </span>
            </div>
          </div>

          {/* Rango de Edad */}
          <div className="emotions-attr-card">
            <div className="attr-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <UserCheck size={18} />
            </div>
            <div className="attr-info">
              <span className="attr-label">Rango de Edad Estimado</span>
              <span className="attr-value">
                {currentResult ? `${currentResult.ageRange.Low} - ${currentResult.ageRange.High} años` : '—'}
              </span>
              <span className="attr-sub">
                Calidad: Brillo {currentResult?.quality.Brightness ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── HISTORIAL Y REGISTRO DE EVENTOS EMOCIONALES ────────────── */}
      <div className="emotions-card emotions-history-card">
        <div className="emotions-card-header">
          <div className="card-header-title">
            <History size={16} style={{ color: '#0078d4' }} />
            <span>Historial de Análisis Emocionales Recientes</span>
            <span className="history-count-badge">{history.length}</span>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              className="emotions-btn-clear"
              onClick={clearHistory}
              title="Borrar historial"
            >
              <Trash2 size={13} />
              Limpiar
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="emotions-empty-history">
            <History size={26} style={{ color: '#cbd5e1' }} />
            <p>Aún no hay registros de emociones capturadas. Activa la cámara o analiza una foto.</p>
          </div>
        ) : (
          <div className="emotions-history-table-wrapper">
            <table className="emotions-history-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Fuente</th>
                  <th>Emoción Dominante</th>
                  <th>Certeza AWS</th>
                  <th>Sonrisa</th>
                  <th>Calidad</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const meta = EMOTION_META[item.primaryEmotion.Type];
                  return (
                    <tr key={item.id}>
                      <td className="history-time">{item.timestamp}</td>
                      <td>
                        <span className="history-source-badge">
                          {item.sourceType === 'live_camera' ? '📹 Cámara' : '🖼️ Imagen'}
                        </span>
                      </td>
                      <td>
                        <span
                          className="history-emotion-badge"
                          style={{ color: meta.color, background: meta.bgLight }}
                        >
                          {meta.emoji} {meta.label} ({item.primaryEmotion.Type})
                        </span>
                      </td>
                      <td className="history-confidence">{item.primaryEmotion.Confidence}%</td>
                      <td>{item.smile.Value ? '😄 Sí' : '— No'}</td>
                      <td>
                        <span className="history-quality-chip">
                          Brillo {item.quality.Brightness}% | Nitidez {item.quality.Sharpness}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
