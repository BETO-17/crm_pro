import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  Eye,
  Check,
  X,
  Pencil,
  RotateCcw,
  ScanSearch,
  ChevronDown,
  ChevronUp,
  Network,
  Download,
  FileJson,
  FileSearch,
} from 'lucide-react';
import type { CloudProposal, ProjectAnalysis, CostSimulationItem } from '../types/awsTypes';
import { awsServicesCatalog } from '../data/awsServicesData';
import { useAws } from '../context/AwsContext';
import { downloadFossflowDiagram } from '../utils/fossflowExport';
import AwsProjectAnalyzer from '../components/AwsProjectAnalyzer';
import ProjectAnalysisReport from '../components/ProjectAnalysisReport';
import StatusBadge from '../components/StatusBadge';
import '../aws.css';

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = clean.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d}/${m}/${y.slice(-2)}`;
  }
  return clean;
}

// Predefined Optional Templates (User can click one to prefill description, type & services)
const proposalTemplates = [
  {
    id: 'tpl-retail',
    title: 'Comercio & Retail Omnicanal',
    appType: 'E-commerce & Retail' as const,
    suggestedServices: ['EC2', 'RDS', 'CloudFront', 'S3'],
    text: 'Migración integral de sistema transaccional de ventas, facturación electrónica y analítica de inventario con base de datos PostgreSQL Multi-AZ y aceleración perimetral CloudFront.',
  },
  {
    id: 'tpl-datalake',
    title: 'Data Lake & Analítica Serverless',
    appType: 'Data Lake & Analítica' as const,
    suggestedServices: ['S3', 'Lambda', 'CloudWatch'],
    text: 'Arquitectura serverless para ingesta continua de transacciones en Amazon S3, transformaciones automáticas con AWS Lambda y observabilidad centralizada en CloudWatch.',
  },
  {
    id: 'tpl-portal',
    title: 'Portal Corporativo & CRM Escalable',
    appType: 'Portal Web Empresarial' as const,
    suggestedServices: ['VPC', 'EC2', 'S3'],
    text: 'Despliegue de aplicación web empresarial con balanceo de carga L7, aislamiento en subredes privadas VPC y respaldo seguro de documentos en S3.',
  },
  {
    id: 'tpl-microservices',
    title: 'Microservicios Backend & APIs',
    appType: 'Microservicios Cloud' as const,
    suggestedServices: ['EC2', 'RDS', 'Route 53'],
    text: 'Infraestructura desacoplada con auto-escalado horizontal de servidores EC2, persistencia en Amazon RDS y endpoints optimizados para alto volumen de peticiones API.',
  },
  {
    id: 'tpl-dr',
    title: 'Disaster Recovery & Continuidad',
    appType: 'Portal Web Empresarial' as const,
    suggestedServices: ['Route 53', 'S3', 'EC2'],
    text: 'Estrategia de respaldo y replicación continua de datos con failover automatizado mediante Route 53 y políticas de snapshots encriptados con KMS.',
  },
  {
    id: 'tpl-security',
    title: 'Infraestructura Segura & Compliance',
    appType: 'API REST / Backend' as const,
    suggestedServices: ['VPC', 'S3', 'CloudWatch'],
    text: 'Entorno cloud de alta seguridad con control granular de accesos IAM, cifrado obligatorio en tránsito y reposo, y segmentación por zonas de aislamiento.',
  },
];

export default function AwsPlanning() {
  const {
    proposal,
    activeProposalId,
    setActiveProposalId,
    proposals,
    createProposal,
    updateProposal,
    deleteProposal,
    services,
    addService,
    toggleService,
    removeService,
    analyses,
    getAnalysis,
    addCostItem,
  } = useAws();

  const navigate = useNavigate();
  interface ToastState {
    msg: string;
    action?: { label: string; onClick: () => void };
    proposal?: CloudProposal;
    isRegistration?: boolean;
  }
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedDetailProp, setSelectedDetailProp] = useState<CloudProposal | null>(null);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Estado del Analizador de Proyectos
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [_cameFromAnalyzer, setCameFromAnalyzer] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [analysisCostItems, setAnalysisCostItems] = useState<CostSimulationItem[] | null>(null);
  const [selectedAnalysisForModal, setSelectedAnalysisForModal] = useState<ProjectAnalysis | null>(null);

  // Form Fields - All start completely empty / unselected by default
  const [solutionName, setSolutionName] = useState('');
  const [appType, setAppType] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [estimatedUsers, setEstimatedUsers] = useState<number | ''>('');
  const [availabilityLevel, setAvailabilityLevel] = useState<string>('');
  const [migrationGoal, setMigrationGoal] = useState<string>('');

  // Validation Errors per Field
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when active proposal is deleted
  useEffect(() => {
    if (!proposal && editingProposalId) {
      handleCancelEdit();
    }
  }, [proposal]);

  const showToast = (
    msg: string,
    actionOrProp?: { label: string; onClick: () => void } | CloudProposal,
    isRegistration?: boolean
  ) => {
    let proposalObj: CloudProposal | undefined;
    let actionObj: { label: string; onClick: () => void } | undefined;

    if (actionOrProp && 'solutionName' in actionOrProp) {
      proposalObj = actionOrProp as CloudProposal;
    } else if (actionOrProp && 'onClick' in actionOrProp) {
      actionObj = actionOrProp as { label: string; onClick: () => void };
    }

    setToast({
      msg,
      action: actionObj,
      proposal: proposalObj,
      isRegistration: !!isRegistration,
    });

    const duration = isRegistration ? 10000 : (actionObj ? 6500 : 3500);
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev));
    }, duration);
  };

  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      if (timeA !== timeB) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });
  }, [proposals]);

  const handleGoToDiagram = () => {
    try {
      localStorage.setItem('aws:networkTab', 'editor');
    } catch {
      // LocalStorage fallback
    }
    navigate('/modules/aws/network');
  };

  const handleApplyAnalyzerResult = (draft: {
    projectName?: string;
    appType: CloudProposal['appType'];
    description: string;
    selectedServices: string[];
    analysisId?: string;
    costItems?: CostSimulationItem[];
  }) => {
    setCameFromAnalyzer(true);
    if (draft.projectName) {
      setSolutionName(draft.projectName);
    }
    setAppType(draft.appType);
    setDescription(draft.description);
    if (draft.analysisId) {
      setCurrentAnalysisId(draft.analysisId);
    }
    if (draft.costItems && draft.costItems.length > 0) {
      setAnalysisCostItems(draft.costItems);
    }

    // Agregar servicios sugeridos a la selección
    for (const svcCode of draft.selectedServices) {
      if (!services.includes(svcCode)) {
        addService(svcCode);
      }
    }

    // Limpiar errores en esos campos
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.solutionName;
      delete copy.description;
      delete copy.appType;
      delete copy.services;
      return copy;
    });

    // Desplazar vista hacia el formulario
    const formCard = document.getElementById('proposal-form-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth' });
    }

    showToast('Completa región, usuarios, SLA y objetivo, y registra tu propuesta');
  };

  const handleApplyTemplate = (tpl: typeof proposalTemplates[0]) => {
    setSelectedTemplateId(tpl.id);
    setDescription(tpl.text);
    setAppType(tpl.appType);
    
    // Clear and set suggested services
    services.forEach((s) => removeService(s));
    tpl.suggestedServices.forEach((s) => addService(s));

    // Clear any errors for these fields
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.description;
      delete copy.appType;
      delete copy.services;
      return copy;
    });

    showToast(`Plantilla "${tpl.title}" aplicada. Servicios sugeridos agregados.`);
  };

  const handleToggleService = (codeName: string) => {
    toggleService(codeName);
    if (errors.services) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.services;
        return copy;
      });
    }
  };

  const handleClearAllServices = () => {
    services.forEach((s) => removeService(s));
  };

  const handleStartEdit = (prop: CloudProposal) => {
    setEditingProposalId(prop.id);
    setSolutionName(prop.solutionName);
    setAppType(prop.appType);
    setRegion(prop.region);
    setDescription(prop.description);
    setEstimatedUsers(prop.estimatedUsers);
    setAvailabilityLevel(prop.availabilityLevel);
    setMigrationGoal(prop.migrationGoal);
    setSelectedTemplateId(null);
    setErrors({});

    // Sync services
    services.forEach((s) => removeService(s));
    prop.selectedServices.forEach((s) => addService(s));

    showToast(`Editando propuesta "${prop.solutionName}".`);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProposalId(null);
    setSolutionName('');
    setAppType('');
    setRegion('');
    setDescription('');
    setEstimatedUsers('');
    setAvailabilityLevel('');
    setMigrationGoal('');
    setSelectedTemplateId(null);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Field-by-field validation
    const newErrors: Record<string, string> = {};
    if (!solutionName.trim()) {
      newErrors.solutionName = 'El nombre de la solución es obligatorio.';
    }
    if (!appType) {
      newErrors.appType = 'Selecciona el tipo de aplicación.';
    }
    if (!region) {
      newErrors.region = 'Selecciona la región AWS de despliegue.';
    }
    if (!description.trim()) {
      newErrors.description = 'La descripción de arquitectura es obligatoria.';
    }
    if (estimatedUsers === '' || Number(estimatedUsers) <= 0) {
      newErrors.estimatedUsers = 'Ingresa un número estimado de usuarios mayor a 0.';
    }
    if (!availabilityLevel) {
      newErrors.availabilityLevel = 'Selecciona el nivel de disponibilidad SLA.';
    }
    if (!migrationGoal) {
      newErrors.migrationGoal = 'Selecciona el objetivo principal de la migración.';
    }
    if (services.length === 0) {
      newErrors.services = 'Debes seleccionar al menos un servicio AWS para tu arquitectura.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Por favor completa todos los campos obligatorios señalados.');
      return;
    }

    setErrors({});

    const usersNum = Number(estimatedUsers);
    const baseCost = services.length * 95.5;
    const userFactor = (usersNum / 1000) * 8.2;
    const calculatedMonthly = +(baseCost + userFactor).toFixed(2);
    const calculatedAnnual = +(calculatedMonthly * 12).toFixed(2);

    if (editingProposalId) {
      updateProposal({
        solutionName: solutionName.trim(),
        appType: appType as CloudProposal['appType'],
        description: description.trim(),
        region,
        estimatedUsers: usersNum,
        availabilityLevel: availabilityLevel as CloudProposal['availabilityLevel'],
        selectedServices: services,
        migrationGoal: migrationGoal as CloudProposal['migrationGoal'],
        monthlyBudget: calculatedMonthly,
        annualBudget: calculatedAnnual,
      });

      showToast(`Propuesta "${solutionName.trim()}" actualizada correctamente.`);
      handleCancelEdit();
    } else {
      const newProp: CloudProposal = {
        id: `prop-${Date.now()}`,
        solutionName: solutionName.trim(),
        appType: appType as CloudProposal['appType'],
        description: description.trim(),
        region,
        estimatedUsers: usersNum,
        availabilityLevel: availabilityLevel as CloudProposal['availabilityLevel'],
        selectedServices: [...services],
        services: [...services],
        migrationGoal: migrationGoal as CloudProposal['migrationGoal'],
        monthlyBudget: calculatedMonthly,
        annualBudget: calculatedAnnual,
        status: 'Aprobada',
        createdAt: new Date().toISOString(),
        analysisId: currentAnalysisId || undefined,
      };

      createProposal(newProp);

      // Si vinieron supuestos de costos del análisis, guardarlos en la simulación de costos
      if (analysisCostItems && analysisCostItems.length > 0) {
        for (const item of analysisCostItems) {
          addCostItem(item);
        }
      }

      showToast('Propuesta registrada', newProp, true);
      setSolutionName('');
      setAppType('');
      setRegion('');
      setDescription('');
      setEstimatedUsers('');
      setAvailabilityLevel('');
      setMigrationGoal('');
      setSelectedTemplateId(null);
      setCameFromAnalyzer(false);
      setCurrentAnalysisId(null);
      setAnalysisCostItems(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar la propuesta "${name}"?`);
    if (!confirmed) return;
    deleteProposal(id);
    if (editingProposalId === id) {
      handleCancelEdit();
    }
    showToast(`Propuesta "${name}" eliminada.`);
  };

  return (
    <div className="aws-container">
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#0f172a',
            border: '1px solid #2563eb',
            color: '#ffffff',
            padding: '14px 18px',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            maxWidth: 620,
          }}
        >
          <Sparkles size={18} color="#60a5fa" style={{ flexShrink: 0 }} />

          {toast.isRegistration && toast.proposal ? (
            (() => {
              const pServices = toast.proposal.selectedServices || toast.proposal.services || [];
              const sCount = pServices.length;
              const sCountText = `${sCount} ${sCount === 1 ? 'servicio' : 'servicios'}`;
              const reg = toast.proposal.region ? (toast.proposal.region.split(' ')[0] || toast.proposal.region) : 'Sin región';

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                  {/* Texto: Título "Propuesta registrada" y debajo "<Nombre> · <región> · <n> servicios" */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 160, flex: 1 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#f8fafc' }}>
                      Propuesta registrada
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.3 }}>
                      <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{toast.proposal.solutionName}</strong> · {reg} · {sCountText}
                    </span>
                  </div>

                  {/* Dos botones: "Descargar diagrama" (principal) e "Ir al editor" (secundario) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      disabled={sCount === 0}
                      onClick={() => {
                        if (sCount > 0) {
                          downloadFossflowDiagram(toast.proposal!, awsServicesCatalog);
                        }
                      }}
                      title={sCount === 0 ? 'Agrega servicios a tu propuesta para generar el diagrama' : 'Descargar diagrama (.json)'}
                      style={{
                        background: sCount > 0 ? '#2563eb' : '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: sCount > 0 ? 'pointer' : 'not-allowed',
                        opacity: sCount > 0 ? 1 : 0.5,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: sCount > 0 ? '0 1px 3px rgba(37,99,235,0.4)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (sCount > 0) e.currentTarget.style.background = '#1d4ed8';
                      }}
                      onMouseLeave={(e) => {
                        if (sCount > 0) e.currentTarget.style.background = '#2563eb';
                      }}
                    >
                      <Download size={14} />
                      Descargar diagrama
                    </button>
                    <button
                      type="button"
                      onClick={handleGoToDiagram}
                      style={{
                        background: '#334155',
                        color: '#f8fafc',
                        border: '1px solid #475569',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#475569';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#334155';
                      }}
                    >
                      <Network size={14} />
                      Ir al editor
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <span style={{ flex: 1, color: '#f1f5f9' }}>{toast.msg}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={toast.action.onClick}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Network size={13} />
                  {toast.action.label}
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setToast(null)}
            title="Cerrar notificación"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
          Planificación Cloud
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Diseña y registra propuestas de arquitectura en AWS. Puedes partir de una plantilla o importar tu proyecto.
        </p>
      </div>

      {/* Grid: Form (Left) & Proposals Table (Right) */}
      <div className="aws-planning-grid" style={{ alignItems: 'start' }}>
        {/* Registration Form & Optional Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Plantillas Opcionales (Above Form, No Internal Scroll) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={17} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#1e293b' }}>
                  Plantillas de Arquitectura Opcionales
                </h3>
              </div>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>Haz clic en una para autorrellenar</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 10,
              }}
            >
              {proposalTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    style={{
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 6,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: 12.5, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                        {tpl.title}
                      </strong>
                      {isSelected && <Check size={14} color="#2563eb" strokeWidth={3} />}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tpl.text}
                    </p>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: '#2563eb', marginTop: 2 }}>
                      +{tpl.suggestedServices.join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Importar desde un proyecto (opcional) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <button
              type="button"
              onClick={() => setIsAnalyzerOpen((prev) => !prev)}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <ScanSearch size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>
                    Importar desde un proyecto (opcional)
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Analiza tu proyecto y te sugerimos los servicios AWS adecuados.
                  </p>
                </div>
              </div>
              {isAnalyzerOpen ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
            </button>

            {isAnalyzerOpen && (
              <div style={{ padding: '0 20px 20px' }}>
                <AwsProjectAnalyzer onApplyToProposal={handleApplyAnalyzerResult} />
              </div>
            )}
          </div>

          {/* Form Card */}
          <div id="proposal-form-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#2563eb" />
                <span>{editingProposalId ? 'Editar Propuesta Cloud' : 'Registrar Propuesta de Arquitectura'}</span>
              </h3>
              {editingProposalId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RotateCcw size={12} /> Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Field 1: Nombre */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  1. Nombre de la Solución Cloud *
                </label>
                <input
                  type="text"
                  placeholder="ej. Plataforma ERP & Ventas Omnicanal Multi-AZ"
                  value={solutionName}
                  onChange={(e) => {
                    setSolutionName(e.target.value);
                    if (errors.solutionName) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.solutionName;
                        return copy;
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${errors.solutionName ? '#dc2626' : '#cbd5e1'}`,
                    fontSize: 13,
                  }}
                />
                {errors.solutionName && (
                  <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 4, display: 'block' }}>
                    {errors.solutionName}
                  </span>
                )}
              </div>

              {/* Field 2 & 3: Tipo y Región */}
              <div className="aws-planning-fields-grid">
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                    2. Tipo de Aplicación *
                  </label>
                  <select
                    value={appType}
                    onChange={(e) => {
                      setAppType(e.target.value);
                      if (errors.appType) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.appType;
                          return copy;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${errors.appType ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: 13,
                      color: appType ? '#1e293b' : '#94a3b8',
                    }}
                  >
                    <option value="" disabled>Selecciona tipo de aplicación…</option>
                    <option value="E-commerce & Retail">E-commerce & Retail</option>
                    <option value="API REST / Backend">API REST / Backend</option>
                    <option value="Microservicios Cloud">Microservicios Cloud</option>
                    <option value="Data Lake & Analítica">Data Lake & Analítica</option>
                    <option value="Portal Web Empresarial">Portal Web Empresarial</option>
                  </select>
                  {errors.appType && (
                    <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 4, display: 'block' }}>
                      {errors.appType}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                    3. Región AWS Seleccionada *
                  </label>
                  <select
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      if (errors.region) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.region;
                          return copy;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${errors.region ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: 13,
                      color: region ? '#1e293b' : '#94a3b8',
                    }}
                  >
                    <option value="" disabled>Selecciona región…</option>
                    <option value="sa-east-1 (São Paulo, Brasil)">sa-east-1 (São Paulo, Brasil)</option>
                    <option value="us-east-1 (N. Virginia, USA)">us-east-1 (N. Virginia, USA)</option>
                    <option value="us-west-2 (Oregon, USA)">us-west-2 (Oregon, USA)</option>
                    <option value="eu-west-1 (Irlanda, Europa)">eu-west-1 (Irlanda, Europa)</option>
                    <option value="ca-central-1 (Montreal, Canadá)">ca-central-1 (Montreal, Canadá)</option>
                    <option value="eu-central-1 (Fráncfort, Alemania)">eu-central-1 (Fráncfort, Alemania)</option>
                    <option value="eu-south-2 (Aragón, España)">eu-south-2 (Aragón, España)</option>
                    <option value="ap-southeast-1 (Singapur)">ap-southeast-1 (Singapur)</option>
                    <option value="ap-northeast-1 (Tokio, Japón)">ap-northeast-1 (Tokio, Japón)</option>
                    <option value="ap-southeast-2 (Sídney, Australia)">ap-southeast-2 (Sídney, Australia)</option>
                    <option value="af-south-1 (Ciudad del Cabo, Sudáfrica)">af-south-1 (Ciudad del Cabo, Sudáfrica)</option>
                  </select>
                  {errors.region && (
                    <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 4, display: 'block' }}>
                      {errors.region}
                    </span>
                  )}
                </div>
              </div>

              {/* Field 4: Descripción (Textarea Obligatorio) */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  4. Descripción y Alcance de la Arquitectura *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe los componentes, requerimientos técnicos y alcance de la arquitectura cloud..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.description;
                        return copy;
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${errors.description ? '#dc2626' : '#cbd5e1'}`,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    lineHeight: 1.45,
                  }}
                />
                {errors.description && (
                  <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 4, display: 'block' }}>
                    {errors.description}
                  </span>
                )}
              </div>

              {/* Field 5 & 6: Usuarios y SLA */}
              <div className="aws-planning-fields-grid">
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                    5. Número Estimado de Usuarios *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000000}
                    placeholder="ej. 5000"
                    value={estimatedUsers}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setEstimatedUsers(val);
                      if (errors.estimatedUsers) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.estimatedUsers;
                          return copy;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${errors.estimatedUsers ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: 13,
                    }}
                  />
                  {errors.estimatedUsers && (
                    <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 4, display: 'block' }}>
                      {errors.estimatedUsers}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                    6. Nivel de Disponibilidad (SLA) *
                  </label>
                  <select
                    value={availabilityLevel}
                    onChange={(e) => {
                      setAvailabilityLevel(e.target.value);
                      if (errors.availabilityLevel) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.availabilityLevel;
                          return copy;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: `1px solid ${errors.availabilityLevel ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: 13,
                      color: availabilityLevel ? '#1e293b' : '#94a3b8',
                    }}
                  >
                    <option value="" disabled>Selecciona nivel de disponibilidad (SLA)…</option>
                    <option value="99.9% (Básico Multi-AZ)">99.9% (Básico Multi-AZ)</option>
                    <option value="99.95% (Alta Disponibilidad)">99.95% (Alta Disponibilidad)</option>
                    <option value="99.99% (Misión Crítica Multi-Región)">99.99% (Misión Crítica Multi-Región)</option>
                  </select>
                  {errors.availabilityLevel && (
                    <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 4, display: 'block' }}>
                      {errors.availabilityLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Field 7: Objetivo */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  7. Objetivo Principal de la Migración *
                </label>
                <select
                  value={migrationGoal}
                  onChange={(e) => {
                    setMigrationGoal(e.target.value);
                    if (errors.migrationGoal) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.migrationGoal;
                        return copy;
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${errors.migrationGoal ? '#dc2626' : '#cbd5e1'}`,
                    fontSize: 13,
                    color: migrationGoal ? '#1e293b' : '#94a3b8',
                  }}
                >
                  <option value="" disabled>Selecciona objetivo de migración…</option>
                  <option value="Modernización de Aplicación">Modernización de Aplicación</option>
                  <option value="Reducción de Costos">Reducción de Costos y TCO</option>
                  <option value="Escalabilidad Elástica">Escalabilidad Elástica ante Picos de Demanda</option>
                  <option value="Continuidad de Negocio y DR">Continuidad de Negocio y Disaster Recovery</option>
                </select>
                {errors.migrationGoal && (
                  <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 4, display: 'block' }}>
                    {errors.migrationGoal}
                  </span>
                )}
              </div>

              {/* Field 8: Servicios */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                    8. Servicios Cloud Seleccionados en la Arquitectura * ({services.length} seleccionados)
                  </label>
                  {services.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllServices}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Deseleccionar todos
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {awsServicesCatalog.map((svc) => {
                    const isChecked = services.includes(svc.codeName);
                    return (
                      <button
                        key={svc.codeName}
                        type="button"
                        onClick={() => handleToggleService(svc.codeName)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          border: isChecked ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          background: isChecked ? '#eff6ff' : '#ffffff',
                          color: isChecked ? '#1d4ed8' : '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isChecked && <CheckCircle size={13} color="#2563eb" />}
                        <span>{svc.codeName}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.services && (
                  <span style={{ color: '#dc2626', fontSize: 11.5, marginTop: 6, display: 'block' }}>
                    {errors.services}
                  </span>
                )}
              </div>

              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px 20px',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                {editingProposalId ? (
                  <><Check size={16} /> Guardar Cambios en Propuesta</>
                ) : (
                  <><Plus size={16} /> Registrar Propuesta Cloud</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Proposals List Card (Sticky right panel, prevents empty gap) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '20px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 24,
            alignSelf: 'start',
            minWidth: 0,
            maxWidth: '100%',
          }}
        >
          {/* Header: "Propuestas registradas" + badge with count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 14,
              borderBottom: '1px solid #f1f5f9',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: '#1e293b' }}>
                Propuestas registradas
              </h3>
              <span
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#64748b',
                  background: '#f8fafc',
                  lineHeight: 1.2,
                }}
              >
                {sortedProposals.length}
              </span>
            </div>
          </div>

          {/* Table / List Container (overflow-x-auto prevents any row from overflowing the card) */}
          <div style={{ width: '100%', overflowX: 'auto' }}>
            {sortedProposals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 260 }}>
                {sortedProposals.map((prop) => {
                  const isActive =
                    prop.id === activeProposalId ||
                    (!activeProposalId && sortedProposals[0]?.id === prop.id);
                  const propServices = prop.selectedServices || prop.services || [];
                  const sCount = propServices.length;
                  const sCountText = `${sCount} ${sCount === 1 ? 'servicio' : 'servicios'}`;
                  const reg = prop.region
                    ? prop.region.split(' ')[0] || prop.region
                    : 'Sin región';
                  const shortDate = formatShortDate(prop.createdAt) || 'Hoy';
                  const hasServices = sCount > 0;

                  return (
                    <div
                      key={prop.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        padding: '13px 15px',
                        borderRadius: 10,
                        border: isActive ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                        background: isActive ? '#f8faff' : '#ffffff',
                        boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.08)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Top Row: Solution Name (bold) + Subtitle on left, Status on right */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: '#1e293b',
                              wordBreak: 'break-word',
                              lineHeight: 1.35,
                            }}
                          >
                            {prop.solutionName}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: '#64748b',
                              marginTop: 2,
                              lineHeight: 1.3,
                            }}
                          >
                            {reg} · {sCountText} · {shortDate}
                          </div>
                        </div>

                        {/* Estado: SOLO StatusBadge success "Activa" si es la activa; si no, botón pequeño "Activar" */}
                        <div style={{ flexShrink: 0 }}>
                          {isActive ? (
                            <StatusBadge variant="success" size="sm">
                              Activa
                            </StatusBadge>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveProposalId(prop.id);
                                showToast(`"${prop.solutionName}" establecida como propuesta activa.`);
                              }}
                              title="Establecer como propuesta activa"
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#2563eb',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                lineHeight: 1.2,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#dbeafe')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#eff6ff')}
                            >
                              Activar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Acciones como botones de icono con tooltip (iconos de Lucide, 32px, gap-1) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 4,
                          paddingTop: 8,
                          borderTop: '1px solid #f1f5f9',
                        }}
                      >
                        {/* Ver análisis (FileSearch) solo si la propuesta tiene analysisId */}
                        {prop.analysisId && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = getAnalysis(prop.analysisId!) || analyses.find((a) => a.id === prop.analysisId);
                              if (found) {
                                setSelectedAnalysisForModal(found);
                              } else {
                                showToast('No se encontró el análisis técnico asociado a esta propuesta.');
                              }
                            }}
                            title="Ver análisis"
                            style={{
                              width: 32,
                              height: 32,
                              minWidth: 32,
                              minHeight: 32,
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 6,
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#2563eb',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#dbeafe';
                              e.currentTarget.style.color = '#1d4ed8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#eff6ff';
                              e.currentTarget.style.color = '#2563eb';
                            }}
                          >
                            <FileSearch size={16} />
                          </button>
                        )}

                        {/* Ver (Eye) */}
                        <button
                          type="button"
                          onClick={() => setSelectedDetailProp(prop)}
                          title="Ver detalles de propuesta"
                          style={{
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            minHeight: 32,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#64748b',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.color = '#64748b';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Editar (Pencil) */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(prop)}
                          title="Editar propuesta"
                          style={{
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            minHeight: 32,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#64748b',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.color = '#64748b';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Descargar diagrama (FileJson) */}
                        <button
                          type="button"
                          disabled={!hasServices}
                          onClick={() => {
                            if (hasServices) {
                              downloadFossflowDiagram(prop, awsServicesCatalog);
                            }
                          }}
                          title={
                            hasServices
                              ? 'Descargar diagrama (.json)'
                              : 'Agrega servicios a tu propuesta para generar el diagrama'
                          }
                          style={{
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            minHeight: 32,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            border: `1px solid ${hasServices ? '#bfdbfe' : '#e2e8f0'}`,
                            background: hasServices ? '#eff6ff' : '#f8fafc',
                            color: hasServices ? '#2563eb' : '#94a3b8',
                            cursor: hasServices ? 'pointer' : 'not-allowed',
                            opacity: hasServices ? 1 : 0.5,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (hasServices) {
                              e.currentTarget.style.background = '#dbeafe';
                              e.currentTarget.style.color = '#1d4ed8';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (hasServices) {
                              e.currentTarget.style.background = '#eff6ff';
                              e.currentTarget.style.color = '#2563eb';
                            }
                          }}
                        >
                          <FileJson size={16} />
                        </button>

                        {/* Eliminar (Trash2, rojo al pasar el mouse, con confirmación) */}
                        <button
                          type="button"
                          onClick={() => handleDelete(prop.id, prop.solutionName)}
                          title="Eliminar propuesta"
                          style={{
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            minHeight: 32,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#64748b',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#fecaca';
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.color = '#64748b';
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  background: '#ffffff',
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <FileText size={30} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                  Sin propuestas registradas
                </h4>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>
                  El entorno está actualmente en cero. Completa el formulario para registrar tu primera solución.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Ver Detalles de Propuesta (al hacer clic en el ícono de ojo) */}
      {selectedDetailProp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setSelectedDetailProp(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 520,
              padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              animation: 'dropdownFadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Detalle de Propuesta Cloud
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: '#1e293b' }}>
                  {selectedDetailProp.solutionName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailProp(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Región AWS:</span>
                  <strong style={{ fontSize: 13, color: '#1e293b' }}>{selectedDetailProp.region}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Tipo de App:</span>
                  <strong style={{ fontSize: 13, color: '#1e293b' }}>{selectedDetailProp.appType}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Presupuesto Estimado:</span>
                  <strong style={{ fontSize: 13, color: '#16a34a' }}>${selectedDetailProp.monthlyBudget.toFixed(2)}/mes</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Disponibilidad (SLA):</span>
                  <strong style={{ fontSize: 13, color: '#1e293b' }}>{selectedDetailProp.availabilityLevel}</strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Descripción de Arquitectura:
                </span>
                <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  {selectedDetailProp.description}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Servicios Seleccionados ({selectedDetailProp.selectedServices.length}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedDetailProp.selectedServices.map((srv) => (
                    <span
                      key={srv}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                      }}
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setSelectedDetailProp(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
              {selectedDetailProp.id !== activeProposalId && (
                <button
                  onClick={() => {
                    setActiveProposalId(selectedDetailProp.id);
                    showToast(`"${selectedDetailProp.solutionName}" establecida como propuesta activa.`);
                    setSelectedDetailProp(null);
                  }}
                  style={{
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Establecer como Activa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal grande para Ver Análisis de Proyecto */}
      {selectedAnalysisForModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setSelectedAnalysisForModal(null)}
        >
          <div
            style={{
              maxWidth: 1024,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProjectAnalysisReport
              analysis={selectedAnalysisForModal}
              isModal
              onCloseModal={() => setSelectedAnalysisForModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
