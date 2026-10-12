import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  ExternalLink,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAws } from '../context/AwsContext';
import { awsServicesCatalog } from '../data/awsServicesData';
import { downloadFossflowDiagram } from '../utils/fossflowExport';
import { detectServiceFromFossflowItem } from '../data/fossflowIconMap';
import StatusBadge from './StatusBadge';

interface DiagramAnalysis {
  inBoth: string[];
  inDiagramOnly: string[];
  inProposalOnly: string[];
  unrecognizedCount: number;
  fileName: string;
}

export default function AwsArchitectureEditor() {
  const { proposal, addService } = useAws();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Guía colapsable recordada en localStorage (clave: 'aws:fossflowGuide')
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aws:fossflowGuide');
      return saved !== 'collapsed';
    } catch {
      return true;
    }
  });

  // Estado del análisis de diagrama importado
  const [analysis, setAnalysis] = useState<DiagramAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedToAdd, setSelectedToAdd] = useState<Record<string, boolean>>({});
  const [addedSuccessMsg, setAddedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleGuide = () => {
    setIsGuideOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aws:fossflowGuide', next ? 'expanded' : 'collapsed');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleDownloadActiveProposal = () => {
    if (!proposal) return;
    downloadFossflowDiagram(proposal, awsServicesCatalog);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnalysisError(null);
    setAddedSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación: Tamaño máximo 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setAnalysisError('El archivo excede el tamaño máximo permitido de 5 MB.');
      return;
    }

    // Validación: Extensión .json
    if (!file.name.toLowerCase().endsWith('.json')) {
      setAnalysisError('Solo se permiten archivos en formato .json.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Validar estructura de FossFLOW
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          (!Array.isArray(parsed.items) && !Array.isArray(parsed.views))
        ) {
          setAnalysisError('El archivo no tiene el formato de FossFLOW.');
          return;
        }

        // Catálogo de servicios válidos
        const catalogSet = new Set(awsServicesCatalog.map((s) => s.codeName));
        const rawProposalServices: string[] =
          proposal?.selectedServices || proposal?.services || [];
        const proposalSet = new Set(rawProposalServices);

        // Detectar servicios en el diagrama
        const detectedServicesSet = new Set<string>();
        let unrecognized = 0;

        const diagramItems: Array<{ id?: string; name?: string; icon?: string }> =
          parsed.items || [];

        for (const item of diagramItems) {
          // Ignorar nodo de usuarios/internet
          if (item.icon === 'user' || item.name?.toLowerCase().includes('usuario')) {
            continue;
          }

          const detected = detectServiceFromFossflowItem(item.icon, item.name);
          if (detected) {
            detectedServicesSet.add(detected);
          } else {
            unrecognized++;
          }
        }

        const detectedList = Array.from(detectedServicesSet);

        // Categorizar
        const inBoth = detectedList.filter((s) => proposalSet.has(s));
        const inDiagramOnly = detectedList.filter(
          (s) => !proposalSet.has(s) && catalogSet.has(s)
        );
        const inProposalOnly = rawProposalServices.filter(
          (s) => !detectedServicesSet.has(s)
        );

        // Preseleccionar todos los servicios nuevos a agregar
        const initialSelected: Record<string, boolean> = {};
        inDiagramOnly.forEach((s) => {
          initialSelected[s] = true;
        });
        setSelectedToAdd(initialSelected);

        setAnalysis({
          inBoth,
          inDiagramOnly,
          inProposalOnly,
          unrecognizedCount: unrecognized,
          fileName: file.name,
        });
      } catch {
        setAnalysisError('El archivo no tiene el formato de FossFLOW.');
      }
    };

    reader.onerror = () => {
      setAnalysisError('Error al leer el archivo. Intenta nuevamente.');
    };

    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleToggleSelectToAdd = (codeName: string) => {
    setSelectedToAdd((prev) => ({
      ...prev,
      [codeName]: !prev[codeName],
    }));
  };

  const handleApplyAddedServices = () => {
    if (!analysis) return;
    const servicesToAdd = analysis.inDiagramOnly.filter((s) => selectedToAdd[s]);
    if (servicesToAdd.length === 0) return;

    servicesToAdd.forEach((svc) => {
      addService(svc);
    });

    setAddedSuccessMsg(
      `Se agregaron ${servicesToAdd.length} servicio(s) a tu propuesta: ${servicesToAdd.join(', ')}`
    );

    // Actualizar vista del análisis
    setAnalysis((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        inBoth: [...prev.inBoth, ...servicesToAdd],
        inDiagramOnly: prev.inDiagramOnly.filter((s) => !selectedToAdd[s]),
      };
    });
  };

  if (!isDesktop) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '56px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}
        >
          <Monitor size={30} />
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
            El editor de diagramas está disponible en pantallas de 1024px o más
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 460 }}>
            Para una experiencia óptima de diseño e interacción con topologías isométricas, por favor accede desde una pantalla de escritorio o maximiza tu navegador.
          </p>
        </div>
        <a
          href="https://www.icewolfsoft.com/fossflow/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            padding: '10px 18px',
            borderRadius: 10,
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
          }}
        >
          <ExternalLink size={15} />
          Abrir en pestaña nueva
        </a>
      </div>
    );
  }

  const hasProposal = Boolean(proposal && proposal.solutionName);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Card de Guía de 3 pasos numerados */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 18,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isGuideOpen ? '1px solid #f1f5f9' : 'none',
            paddingBottom: isGuideOpen ? 14 : 0,
            marginBottom: isGuideOpen ? 14 : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              i
            </span>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              Guía de Diseño en FossFLOW
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="https://www.icewolfsoft.com/fossflow/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontWeight: 600,
                fontSize: 12,
                padding: '6px 12px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={13} />
              Abrir en pestaña nueva
            </a>

            <button
              type="button"
              onClick={toggleGuide}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 8px',
                borderRadius: 6,
              }}
            >
              {isGuideOpen ? (
                <>
                  <ChevronUp size={15} /> Ocultar guía
                </>
              ) : (
                <>
                  <ChevronDown size={15} /> Mostrar guía
                </>
              )}
            </button>
          </div>
        </div>

        {isGuideOpen && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 14,
                marginBottom: 14,
              }}
            >
              {/* Paso 1 */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    1
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    Descarga el diagrama de tu propuesta
                  </span>
                </div>

                {hasProposal ? (
                  <div>
                    <button
                      type="button"
                      onClick={handleDownloadActiveProposal}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 5px rgba(37,99,235,0.25)',
                      }}
                    >
                      <Download size={14} />
                      Descargar diagrama (.json)
                    </button>
                    <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Propuesta activa: <strong>{proposal?.solutionName}</strong>
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Primero crea una propuesta</span>
                    <button
                      type="button"
                      onClick={() => navigate('/modules/aws/planning')}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #2563eb',
                        color: '#2563eb',
                        borderRadius: 6,
                        padding: '5px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Ir a Planificación <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Paso 2 */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Importa en el editor
                  </span>
                  <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
                    En el editor, pulsa <strong>Import File</strong> y selecciona el archivo descargado.
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  3
                </span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Guarda tus cambios
                  </span>
                  <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
                    Edita tu arquitectura y pulsa <strong>Export File</strong> para guardar tus cambios en tu equipo.
                  </p>
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 11.5, color: '#94a3b8', fontStyle: 'italic' }}>
              El editor se ejecuta en un sitio externo (FossFLOW, licencia MIT). Tus cambios en el editor no se guardan en CloudOps: expórtalos como JSON.
            </p>
          </div>
        )}
      </div>

      {/* Contenedor del Editor FossFLOW (iframe) */}
      <div
        style={{
          height: '70vh',
          width: '100%',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <iframe
          src="https://www.icewolfsoft.com/fossflow/"
          title="Editor FossFLOW"
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="clipboard-read; clipboard-write"
        />
      </div>

      {/* PASO 4 — Card de Comparación del Diagrama Editado */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: analysis || analysisError ? 16 : 0,
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              ¿Editaste tu diagrama? Compáralo con tu propuesta
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              Sube el archivo .json exportado desde FossFLOW para verificar consistencia con tu propuesta registrada.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#ffffff',
                border: '1.5px solid #2563eb',
                color: '#2563eb',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <Upload size={15} />
              Subir diagrama (.json)
            </button>
          </div>
        </div>

        {/* Error de validación */}
        {analysisError && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{analysisError}</span>
          </div>
        )}

        {/* Éxito al agregar servicios */}
        {addedSuccessMsg && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{addedSuccessMsg}</span>
          </div>
        )}

        {/* Resultados de la Comparación */}
        {analysis && (
          <div
            style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Archivo analizado: <strong>{analysis.fileName}</strong>
              </span>
              {analysis.unrecognizedCount > 0 && (
                <span
                  style={{
                    fontSize: 11.5,
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <HelpCircle size={13} /> Elementos no reconocidos: {analysis.unrecognizedCount}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 14,
              }}
            >
              {/* 1. En el diagrama y en tu propuesta (success) */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    En el diagrama y en tu propuesta
                  </span>
                  <StatusBadge variant="success" size="sm">
                    {analysis.inBoth.length}
                  </StatusBadge>
                </div>
                {analysis.inBoth.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysis.inBoth.map((svc) => (
                      <StatusBadge key={svc} variant="success">
                        {svc}
                      </StatusBadge>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Ningún servicio coincidente</span>
                )}
              </div>

              {/* 2. En el diagrama pero NO en tu propuesta (warning) */}
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                      En el diagrama pero NO en tu propuesta
                    </span>
                    <StatusBadge variant="warning" size="sm">
                      {analysis.inDiagramOnly.length}
                    </StatusBadge>
                  </div>

                  {analysis.inDiagramOnly.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {analysis.inDiagramOnly.map((svc) => (
                        <label
                          key={svc}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: '#78350f',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedToAdd[svc]}
                            onChange={() => handleToggleSelectToAdd(svc)}
                            style={{ accentColor: '#2563eb' }}
                          />
                          <StatusBadge variant="warning">{svc}</StatusBadge>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>No hay servicios adicionales</span>
                  )}
                </div>

                {analysis.inDiagramOnly.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyAddedServices}
                    disabled={!Object.values(selectedToAdd).some(Boolean)}
                    style={{
                      marginTop: 12,
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '7px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: Object.values(selectedToAdd).some(Boolean) ? 'pointer' : 'not-allowed',
                      opacity: Object.values(selectedToAdd).some(Boolean) ? 1 : 0.5,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Plus size={14} />
                    Agregar a la propuesta
                  </button>
                )}
              </div>

              {/* 3. En tu propuesta pero NO en el diagrama (neutral) */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    En tu propuesta pero NO en el diagrama
                  </span>
                  <StatusBadge variant="neutral" size="sm">
                    {analysis.inProposalOnly.length}
                  </StatusBadge>
                </div>
                {analysis.inProposalOnly.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysis.inProposalOnly.map((svc) => (
                      <StatusBadge key={svc} variant="neutral">
                        {svc}
                      </StatusBadge>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Todos los servicios están en el diagrama</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Créditos de autoría y licencia */}
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Editor de diagramas:{' '}
          <a
            href="https://github.com/stan-smith/FossFLOW"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
          >
            FossFLOW (licencia MIT)
          </a>
        </span>
      </div>
    </div>
  );
}
