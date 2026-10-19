import { useState, useRef, useId } from 'react';
import {
  FileArchive,
  FolderGit2,
  FileText,
  UploadCloud,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Layers,
  Info,
} from 'lucide-react';
import ProjectAnalysisReport from './ProjectAnalysisReport';
import { analyzerService } from '../services/analyzerService';
import { useAws } from '../context/AwsContext';
import type {
  AnalyzerInput,
  ProjectAnalysis,
  CloudProposal,
  CostSimulationItem,
} from '../types/awsTypes';

interface AwsProjectAnalyzerProps {
  onApplyToProposal: (draft: {
    projectName?: string;
    appType: CloudProposal['appType'];
    description: string;
    selectedServices: string[];
    analysisId?: string;
    costItems?: CostSimulationItem[];
  }) => void;
}

type TabType = 'zip' | 'github' | 'document';

// Ejemplos de repositorios públicos reales para pruebas rápidas
const GITHUB_EXAMPLES = [
  {
    label: 'React + Node (Redux Essentials)',
    url: 'https://github.com/reduxjs/redux-essentials-counter-example',
  },
  {
    label: 'Django (Simple Signup)',
    url: 'https://github.com/sibtc/simple-django-signup',
  },
  {
    label: 'FastAPI (Microservicio)',
    url: 'https://github.com/tiangolo/fastapi',
  },
];

export default function AwsProjectAnalyzer({ onApplyToProposal }: AwsProjectAnalyzerProps) {
  const fileInputId = useId();
  const { addAnalysis } = useAws();
  const [activeTab, setActiveTab] = useState<TabType>('zip');

  // Estado para entrada ZIP
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Estado para entrada GitHub
  const [githubUrl, setGithubUrl] = useState('');

  // Estado para entrada Documento
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docText, setDocText] = useState('');

  // Estado de ejecución del análisis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ProjectAnalysis | null>(null);

  // Control de cancelación
  const cancelRequestedRef = useRef(false);

  // Manejo de drag & drop para ZIP
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setAnalysisError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setAnalysisError('Formato no válido. Solo se admiten archivos con extensión .zip.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setAnalysisError('El archivo ZIP excede el tamaño máximo permitido de 20 MB.');
        return;
      }
      setZipFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnalysisError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (activeTab === 'zip') {
        if (!file.name.toLowerCase().endsWith('.zip')) {
          setAnalysisError('Formato no válido. Solo se admiten archivos .zip.');
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          setAnalysisError('El archivo ZIP excede el tamaño máximo de 20 MB.');
          return;
        }
        setZipFile(file);
      } else if (activeTab === 'document') {
        if (file.size > 1 * 1024 * 1024) {
          setAnalysisError('El documento supera el tamaño máximo permitido de 1 MB.');
          return;
        }
        setDocFile(file);
      }
    }
  };

  // Validar si hay entrada lista para analizar
  const isInputReady = (): boolean => {
    if (isAnalyzing) return false;
    if (activeTab === 'zip') return zipFile !== null;
    if (activeTab === 'github') return githubUrl.trim().length > 0;
    if (activeTab === 'document') return docFile !== null || docText.trim().length > 0;
    return false;
  };

  // Ejecución del análisis con etapas pausadas para lectura visual
  const handleStartAnalysis = async () => {
    setAnalysisError(null);
    setAnalysisResult(null);
    cancelRequestedRef.current = false;
    setIsAnalyzing(true);

    try {
      // 1. Etapa: Lectura de archivos
      setAnalysisStep('Leyendo archivos…');
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (cancelRequestedRef.current) return;

      let input: AnalyzerInput;
      if (activeTab === 'zip') {
        if (!zipFile) throw new Error('Selecciona un archivo ZIP para continuar.');
        input = { kind: 'zip', file: zipFile };
      } else if (activeTab === 'github') {
        const url = githubUrl.trim();
        if (!url.startsWith('https://github.com/')) {
          throw new Error('La URL debe comenzar con https://github.com/usuario/repositorio');
        }
        input = { kind: 'github', url };
      } else {
        if (docFile) {
          input = { kind: 'document', file: docFile };
        } else if (docText.trim()) {
          input = {
            kind: 'document',
            file: { name: 'especificacion.txt', text: docText.trim() },
          };
        } else {
          throw new Error('Adjunta un archivo .md/.txt o escribe la descripción técnica.');
        }
      }

      // 2. Etapa: Detección de tecnologías
      setAnalysisStep('Detectando tecnologías…');
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (cancelRequestedRef.current) return;

      // 3. Etapa: Evaluación de preparación cloud
      setAnalysisStep('Evaluando preparación cloud…');
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (cancelRequestedRef.current) return;

      // 4. Etapa: Búsqueda de credenciales expuestas
      setAnalysisStep('Buscando credenciales expuestas…');
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (cancelRequestedRef.current) return;

      // 5. Etapa: Generando recomendaciones
      setAnalysisStep('Generando recomendaciones…');
      const result = await analyzerService.analyze(input);
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (cancelRequestedRef.current) return;

      addAnalysis(result);
      setAnalysisResult(result);

      // Desplazamiento suave hasta la ficha técnica
      setTimeout(() => {
        document.getElementById('project-analysis-report-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (err: unknown) {
      if (!cancelRequestedRef.current) {
        setAnalysisError(err instanceof Error ? err.message : 'Error desconocido durante el análisis.');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleCancel = () => {
    cancelRequestedRef.current = true;
    setIsAnalyzing(false);
    setAnalysisStep('');
  };

  const handleDiscard = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setZipFile(null);
    setGithubUrl('');
    setDocFile(null);
    setDocText('');
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Pestañas de Fuente de Entrada */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            gap: 4,
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('zip');
              setAnalysisError(null);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'zip' ? '#2563eb' : 'transparent',
              color: activeTab === 'zip' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <FileArchive size={16} />
            Paquete ZIP
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('github');
              setAnalysisError(null);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'github' ? '#2563eb' : 'transparent',
              color: activeTab === 'github' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <FolderGit2 size={16} />
            Repositorio GitHub
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('document');
              setAnalysisError(null);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'document' ? '#2563eb' : 'transparent',
              color: activeTab === 'document' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={16} />
            Documento
          </button>
        </div>

        <span style={{ fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Info size={14} color="#2563eb" />
          Tu proyecto se analiza en tu navegador y no se sube a ningún servidor.
        </span>
      </div>

      {/* ÁREA DE ENTRADA SEGÚN LA PESTAÑA */}
      {/* 1. ZIP */}
      {activeTab === 'zip' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
            background: isDragging ? '#eff6ff' : '#f8fafc',
            borderRadius: 14,
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
          onClick={() => {
            const inputEl = document.getElementById(fileInputId);
            if (inputEl) inputEl.click();
          }}
        >
          <input
            id={fileInputId}
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#e0e7ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UploadCloud size={26} />
          </div>
          <div>
            {zipFile ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '6px 14px', borderRadius: 20, border: '1px solid #cbd5e1' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <strong style={{ fontSize: 13, color: '#1e293b' }}>{zipFile.name}</strong>
                <span style={{ fontSize: 12, color: '#64748b' }}>({(zipFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZipFile(null);
                  }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>
                  Arrastra tu archivo ZIP aquí o haz clic para seleccionar
                </p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                  Máximo 20 MB. Lee únicamente package.json, requirements.txt, Dockerfile, etc.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. GITHUB */}
      {activeTab === 'github' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
              URL del repositorio público de GitHub
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="https://github.com/usuario/repositorio"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  setAnalysisError(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 13.5,
                  outline: 'none',
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
              Solo repositorios públicos. Se inspeccionan los archivos de manifiesto mediante la API de GitHub.
            </span>
          </div>

          {/* Chips de ejemplos reales */}
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginRight: 8 }}>
              Probar con un ejemplo:
            </span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {GITHUB_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => {
                    setGithubUrl(ex.url);
                    setAnalysisError(null);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 16,
                    fontSize: 11.5,
                    fontWeight: 500,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#2563eb',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DOCUMENTO */}
      {activeTab === 'document' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: 13,
                fontWeight: 600,
                color: '#1e293b',
                cursor: 'pointer',
              }}
            >
              <UploadCloud size={16} />
              {docFile ? docFile.name : 'Subir archivo .md o .txt (máx 1 MB)'}
              <input
                type="file"
                accept=".md,.txt"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
            </label>
            {docFile && (
              <button
                type="button"
                onClick={() => setDocFile(null)}
                style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}
              >
                Quitar archivo
              </button>
            )}
            <span style={{ fontSize: 12, color: '#64748b' }}>o pega el contenido técnico debajo:</span>
          </div>

          <textarea
            rows={5}
            placeholder="Pega aquí la descripción técnica o dependencias de tu proyecto (ej. 'Backend en Django con base de datos PostgreSQL, React en frontend y cola de tareas Redis')..."
            value={docText}
            onChange={(e) => {
              setDocText(e.target.value);
              setAnalysisError(null);
            }}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* BARRA DE ACCIÓN / BOTÓN DE ANÁLISIS */}
      {!analysisResult && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
          {isAnalyzing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={16} className="animate-spin" />
                {analysisStep}
              </span>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!isInputReady()}
              onClick={handleStartAnalysis}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                border: 'none',
                cursor: isInputReady() ? 'pointer' : 'not-allowed',
                background: isInputReady() ? '#2563eb' : '#94a3b8',
                color: '#ffffff',
                boxShadow: isInputReady() ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={16} />
              Analizar proyecto
            </button>
          )}
        </div>
      )}

      {/* MENSAJE DE ERROR */}
      {analysisError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', margin: '0 0 2px' }}>
                Error en el análisis
              </p>
              <p style={{ fontSize: 12.5, color: '#b91c1c', margin: 0 }}>{analysisError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleStartAnalysis()}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid #fca5a5',
              background: '#ffffff',
              color: '#991b1b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* =========================================================================
       * RESULTADO DEL ANÁLISIS: FICHA TÉCNICA DEL PROYECTO
       * ========================================================================= */}
      {analysisResult && (
        <div id="project-analysis-report-section" style={{ scrollMarginTop: 80, marginTop: 16 }}>
          <ProjectAnalysisReport
            analysis={analysisResult}
            onApplyToProposal={(draft) => {
              onApplyToProposal(draft);
            }}
            onResetAnalysis={handleDiscard}
          />
        </div>
      )}
    </div>
  );
}
