import { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Lightbulb,
  RotateCcw,
  Printer,
  FileArchive,
  FolderGit2,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Boxes,
  Layers,
  Sparkles,
  ShieldCheck,
  GitBranch,
  Box,
  FileSearch,
  ArrowRight,
  Info,
  X,
  Scale,
  Award,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { awsServicesCatalog } from '../data/awsServicesData';
import type {
  ProjectAnalysis,
  CloudProposal,
  CostSimulationItem,
  ReadinessDimensionId,
  Severity,
  MaturityLevel,
} from '../types/awsTypes';

interface ProjectAnalysisReportProps {
  analysis: ProjectAnalysis;
  onApplyToProposal?: (data: {
    projectName: string;
    appType: CloudProposal['appType'];
    description: string;
    selectedServices: string[];
    analysisId: string;
    costItems?: CostSimulationItem[];
  }) => void;
  onResetAnalysis?: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export default function ProjectAnalysisReport({
  analysis,
  onApplyToProposal,
  onResetAnalysis,
  isModal = false,
  onCloseModal,
}: ProjectAnalysisReportProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'proposal'>('status');
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Acordeones de dimensiones en Pestaña 1 (abiertas/cerradas)
  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, boolean>>({});

  // Acordeones de grupos de problemas (Crítico abierto por defecto)
  const [expandedFindingGroups, setExpandedFindingGroups] = useState<Record<Severity, boolean>>({
    critical: true,
    medium: false,
    low: false,
  });

  // Checkboxes de servicios seleccionados en Pestaña 2
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(() => {
    return new Set(analysis.recommendations.map((r) => r.serviceId));
  });

  // Supuestos de costo editables en línea para servicios principales
  const [costAssumptions, setCostAssumptions] = useState({
    ec2Instances: 2,
    ec2Hours: 730,
    rdsInstances: 1,
    rdsHours: 730,
    s3Gb: 50,
    cloudfrontGb: 100,
    route53Zones: 1,
    albCount: 1,
    albHours: 730,
  });

  const toggleDimension = (dimId: string) => {
    setExpandedDimensions((prev) => ({
      ...prev,
      [dimId]: !prev[dimId],
    }));
  };

  const toggleFindingGroup = (sev: Severity) => {
    setExpandedFindingGroups((prev) => ({
      ...prev,
      [sev]: !prev[sev],
    }));
  };

  const toggleServiceCheckbox = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  const overallScore = analysis.overallScore ?? analysis.score;
  const cloudReadinessScore = analysis.readinessScore ?? analysis.score;
  const securityScore = analysis.securityScore ?? 0;
  const governanceScore = analysis.governanceScore ?? 0;
  const maturityLevel: MaturityLevel = analysis.maturity?.level || 'prototype';
  const maturityLabel =
    analysis.maturity?.label ||
    (maturityLevel === 'production'
      ? 'Producción'
      : maturityLevel === 'active'
      ? 'Activo'
      : maturityLevel === 'mvp'
      ? 'MVP'
      : 'Prototipo');

  // Color de estado para el score general
  const statusColor = useMemo(() => {
    if (overallScore >= 70) return '#16A34A'; // Verde
    if (overallScore >= 50) return '#F59E0B'; // Ámbar
    return '#DC2626'; // Rojo
  }, [overallScore]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#16A34A';
    if (score >= 50) return '#D97706';
    return '#DC2626';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return '#f0fdf4';
    if (score >= 50) return '#fffbeb';
    return '#fef2f2';
  };

  const getScoreBorder = (score: number) => {
    if (score >= 70) return '#bbf7d0';
    if (score >= 50) return '#fde68a';
    return '#fecaca';
  };

  const maturityBadgeMap: Record<MaturityLevel, 'success' | 'info' | 'warning' | 'neutral'> = {
    production: 'success',
    active: 'info',
    mvp: 'warning',
    prototype: 'neutral',
  };

  const isCheckNotVerifiable = (ch: { notVerifiable?: boolean; evidence?: string }) => {
    return (
      ch.notVerifiable === true ||
      ch.evidence === 'No verificable' ||
      ch.evidence === 'No verificable desde el navegador' ||
      (typeof ch.evidence === 'string' && ch.evidence.toLowerCase().includes('no verificable'))
    );
  };

  const statusBadgeVariant = useMemo(() => {
    if (analysis.status === 'ready') return 'success';
    if (analysis.status === 'ready-with-notes') return 'warning';
    return 'danger';
  }, [analysis.status]);

  const statusText = useMemo(() => {
    if (analysis.status === 'ready') return 'Apto para migrar';
    if (analysis.status === 'ready-with-notes') return 'Apto con observaciones';
    return 'Requiere preparación';
  }, [analysis.status]);

  // Icono de fuente
  const SourceIcon = useMemo(() => {
    if (analysis.source === 'zip') return FileArchive;
    if (analysis.source === 'github') return FolderGit2;
    return FileText;
  }, [analysis.source]);

  // Contadores de problemas
  const criticalCount = useMemo(
    () => analysis.findings.filter((f) => f.severity === 'critical').length,
    [analysis.findings]
  );
  const observationsCount = useMemo(
    () => analysis.findings.filter((f) => f.severity === 'medium' || f.severity === 'low').length,
    [analysis.findings]
  );

  // Stack agrupado por categorías
  const stackByCategory = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const tech of analysis.stack) {
      const cat = tech.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(tech.name);
    }
    return map;
  }, [analysis.stack]);

  // Cálculo dinámico de costos estimados según supuestos y selección
  const { totalMonthlyCost, totalAnnualCost, generatedCostItems } = useMemo(() => {
    let monthly = 0;
    const items: CostSimulationItem[] = [];

    for (const rec of analysis.recommendations) {
      if (!selectedServiceIds.has(rec.serviceId)) continue;
      const catSvc = awsServicesCatalog.find((s) => s.id === rec.serviceId);
      if (!catSvc) continue;

      let itemMonthly = 0;
      let formula = '';
      let tier = `1x ${catSvc.shortName || catSvc.codeName} Standard`;
      let qty = 1;
      let hrs = 730;

      switch (catSvc.codeName) {
        case 'EC2':
          qty = costAssumptions.ec2Instances;
          hrs = costAssumptions.ec2Hours;
          itemMonthly = +(catSvc.pricing.price * qty * hrs).toFixed(2);
          formula = `$${catSvc.pricing.price} × ${qty} instancias × ${hrs} h`;
          tier = `t3.large (${qty} instancias)`;
          break;
        case 'RDS':
          qty = costAssumptions.rdsInstances;
          hrs = costAssumptions.rdsHours;
          itemMonthly = +(catSvc.pricing.price * qty * hrs).toFixed(2);
          formula = `$${catSvc.pricing.price} × ${qty} instancia × ${hrs} h`;
          tier = `db.t3.large PostgreSQL (${qty} instancia)`;
          break;
        case 'S3':
          qty = costAssumptions.s3Gb;
          itemMonthly = +(catSvc.pricing.price * qty).toFixed(2);
          formula = `$${catSvc.pricing.price} × ${qty} GB`;
          tier = `S3 Standard (${qty} GB)`;
          break;
        case 'CloudFront':
          qty = costAssumptions.cloudfrontGb;
          itemMonthly = +(catSvc.pricing.price * qty).toFixed(2);
          formula = `$${catSvc.pricing.price} × ${qty} GB transferidos`;
          tier = `CloudFront (${qty} GB transferencia)`;
          break;
        case 'Route 53':
          qty = costAssumptions.route53Zones;
          itemMonthly = +(catSvc.pricing.price * qty).toFixed(2);
          formula = `$${catSvc.pricing.price} × ${qty} zona hospedada`;
          tier = `Zona hospedada pública (${qty})`;
          break;
        case 'ALB':
          qty = costAssumptions.albCount;
          hrs = costAssumptions.albHours;
          itemMonthly = +(catSvc.pricing.price * qty * hrs).toFixed(2);
          formula = `$${catSvc.pricing.price} × ${qty} balanceador × ${hrs} h`;
          tier = `Application Load Balancer (${qty})`;
          break;
        default:
          if (catSvc.pricing.unit === 'free') {
            itemMonthly = 0;
            formula = 'Servicio gratuito / Incluido';
          } else {
            qty = 1;
            itemMonthly = +(catSvc.pricing.price * 730).toFixed(2);
            formula = `$${catSvc.pricing.price} × 730 h`;
          }
          break;
      }

      monthly += itemMonthly;
      items.push({
        id: `cost-analysis-${rec.serviceId}-${Date.now()}`,
        serviceId: catSvc.id,
        serviceName: catSvc.name,
        category: catSvc.category,
        instanceTypeOrTier: tier,
        quantity: qty,
        hoursPerMonth: hrs,
        unit: catSvc.pricing.unit,
        unitPrice: catSvc.pricing.price,
        formulaText: formula,
        costPerHour: catSvc.pricing.unit === 'hour' ? catSvc.pricing.price : 0,
        monthlyCost: itemMonthly,
        annualCost: +(itemMonthly * 12).toFixed(2),
      });
    }

    monthly = +monthly.toFixed(2);
    const annual = +(monthly * 12).toFixed(2);
    return { totalMonthlyCost: monthly, totalAnnualCost: annual, generatedCostItems: items };
  }, [analysis.recommendations, selectedServiceIds, costAssumptions]);

  // Manejo de impresión
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Ficha técnica — ${analysis.projectName}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Dimension icon mapper
  const getDimensionIcon = (id: ReadinessDimensionId) => {
    switch (id) {
      case 'docs':
        return FileText;
      case 'structure':
        return Layers;
      case 'dependencies':
        return Boxes;
      case 'tests':
        return CheckCircle2;
      case 'codeQuality':
        return Sparkles;
      case 'containers':
        return Box;
      case 'security':
        return ShieldCheck;
      case 'cicd':
        return GitBranch;
      default:
        return Activity;
    }
  };

  return (
    <div
      className="project-analysis-report-container"
      style={{
        background: '#ffffff',
        border: isModal ? 'none' : '1px solid #e2e8f0',
        borderRadius: 16,
        padding: isModal ? '0' : '28px',
        boxShadow: isModal ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        color: '#1e293b',
      }}
    >
      {/* Estilos específicos de impresión @media print y responsive */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .project-analysis-report-container,
          .project-analysis-report-container * {
            visibility: visible;
          }
          .project-analysis-report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
          .report-panel {
            display: flex !important;
            page-break-inside: auto;
          }
          .report-panel-hidden {
            display: flex !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .donut-progress-segment {
            transition: none !important;
            animation: none !important;
          }
        }
        @media (max-width: 900px) {
          .report-header-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .report-header-scores-container {
            width: 100% !important;
            order: 1 !important;
          }
          .report-header-info {
            order: 2 !important;
          }
          .report-header-kpis {
            width: 100% !important;
          }
          .report-tablist {
            width: 100% !important;
            display: flex !important;
          }
          .report-tab-btn {
            flex: 1 !important;
            justify-content: center !important;
            text-align: center !important;
          }
        }

      `}</style>

      {/* 1. BARRA SUPERIOR DE ACCIONES */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingBottom: 16,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileSearch size={20} color="#2563eb" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ficha Técnica de Evaluación
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onResetAnalysis && (
            <button
              type="button"
              onClick={onResetAnalysis}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              <RotateCcw size={14} />
              Analizar otro proyecto
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: '1px solid #2563eb',
              background: '#eff6ff',
              color: '#2563eb',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#dbeafe')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#eff6ff')}
          >
            <Printer size={14} />
            Imprimir / Guardar PDF
          </button>

          {isModal && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              title="Cerrar modal"
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 2. ENCABEZADO DE LA FICHA (Siempre visible) */}
      <div
        className="report-header-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          alignItems: 'center',
          paddingBottom: 20,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Columna Izquierda: Información del Proyecto */}
        <div className="report-header-info" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ficha técnica del proyecto
            </span>
            <h2
              style={{
                margin: '4px 0 6px',
                fontSize: 24,
                fontWeight: 800,
                color: '#1e293b',
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              {analysis.projectName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#64748b' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <SourceIcon size={14} color="#2563eb" />
                {analysis.sourceLabel}
              </span>
              <span>•</span>
              <span>
                {new Date(analysis.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>•</span>
              <span>
                <strong>{analysis.filesAnalyzed}</strong> de {analysis.totalFiles} archivos analizados
              </span>
            </div>
          </div>

          {/* Badges de Estado y Confianza */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <StatusBadge variant={statusBadgeVariant} size="md">
              {statusText}
            </StatusBadge>

            {analysis.confidence === 'high' ? (
              <StatusBadge variant="success" size="sm">
                Confianza del análisis: Alta
              </StatusBadge>
            ) : (
              <StatusBadge variant="warning" size="sm">
                Baja — basado en la descripción del documento
              </StatusBadge>
            )}
          </div>

          {/* Aviso si escaneo de credenciales fue parcial */}
          {analysis.partialSecretScan && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 11.5,
                color: '#64748b',
              }}
            >
              <Info size={14} color="#64748b" style={{ flexShrink: 0 }} />
              <span>El escaneo de credenciales fue parcial: se revisaron solo los archivos principales del repositorio.</span>
            </div>
          )}

          {/* Chips del Stack Agrupados por Categoría */}
          {analysis.stack.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Tecnologías Detectadas
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Array.from(stackByCategory.entries()).map(([category, techNames]) => (
                  <div
                    key={category}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>
                      {category}:
                    </span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>
                      {techNames.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tres Mini-Indicadores (Fortalezas, Críticos, Observaciones) */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                background: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: '#16a34a',
              }}
            >
              <CheckCircle2 size={14} />
              Fortalezas: {analysis.strengths.length}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                background: criticalCount > 0 ? '#fee2e2' : '#f1f5f9',
                border: `1px solid ${criticalCount > 0 ? '#fca5a5' : '#cbd5e1'}`,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: criticalCount > 0 ? '#dc2626' : '#64748b',
              }}
            >
              <AlertTriangle size={14} />
              Problemas críticos: {criticalCount}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                background: observationsCount > 0 ? '#fef3c7' : '#f1f5f9',
                border: `1px solid ${observationsCount > 0 ? '#fde68a' : '#cbd5e1'}`,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: observationsCount > 0 ? '#d97706' : '#64748b',
              }}
            >
              <HelpCircle size={14} />
              Observaciones: {observationsCount}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Dona General + 4 Tarjetas de Indicadores */}
        <div
          className="report-header-scores-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Gráfico de Dona SVG (190px) con overallScore */}
          <div className="report-header-donut" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div
              role="img"
              aria-label={`Índice General: ${overallScore} de 100, ${statusText}`}
              style={{
                position: 'relative',
                width: 190,
                height: 190,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="190" height="190" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {analysis.isEstimated && (
                  <defs>
                    <mask id={`donut-mask-${analysis.id}`}>
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="9"
                        strokeDasharray="238.76"
                        strokeDashoffset={mounted ? 238.76 - (overallScore / 100) * 238.76 : 238.76}
                        strokeLinecap="round"
                        className="donut-progress-segment"
                        style={{
                          transition: 'stroke-dashoffset 1s ease-out',
                        }}
                      />
                    </mask>
                  </defs>
                )}

                {/* Círculo base gris */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="9"
                />

                {/* Segmento lleno de puntaje */}
                {analysis.isEstimated ? (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="9"
                    strokeDasharray="4 2.5"
                    mask={`url(#donut-mask-${analysis.id})`}
                  />
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="9"
                    strokeDasharray="238.76"
                    strokeDashoffset={mounted ? 238.76 - (overallScore / 100) * 238.76 : 238.76}
                    strokeLinecap="round"
                    className="donut-progress-segment"
                    style={{
                      transition: 'stroke-dashoffset 1s ease-out',
                    }}
                  />
                )}
              </svg>

              {/* Texto Central en la Dona */}
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {analysis.isEstimated && (
                  <span
                    style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 2,
                    }}
                  >
                    Estimado
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: '#1e293b' }}>
                    {overallScore}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8' }}>
                    /100
                  </span>
                </div>

                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginTop: 4, maxWidth: 100 }}>
                  Índice General
                </span>
              </div>
            </div>

            {/* Enlace "¿Cómo se calcula?" */}
            <button
              type="button"
              onClick={() => setShowCalculationInfo(!showCalculationInfo)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 6,
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <HelpCircle size={13} />
              ¿Cómo se calcula?
            </button>
          </div>

          {/* 4 Tarjetas Pequeñas de Indicadores */}
          <div
            className="report-header-kpis"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(130px, 1fr))',
              gap: 10,
              flex: 1,
              minWidth: 260,
            }}
          >
            {/* Tarjeta 1: Preparación Cloud */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: getScoreBg(cloudReadinessScore),
                border: `1px solid ${getScoreBorder(cloudReadinessScore)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Preparación Cloud
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <strong style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(cloudReadinessScore) }}>
                  {cloudReadinessScore}
                </strong>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>/100</span>
              </div>
            </div>

            {/* Tarjeta 2: Seguridad */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: getScoreBg(securityScore),
                border: `1px solid ${getScoreBorder(securityScore)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Seguridad
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <strong style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(securityScore) }}>
                  {securityScore}
                </strong>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>/100</span>
              </div>
            </div>

            {/* Tarjeta 3: Gestión y control */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: getScoreBg(governanceScore),
                border: `1px solid ${getScoreBorder(governanceScore)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Gestión y control
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <strong style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(governanceScore) }}>
                  {governanceScore}
                </strong>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>/100</span>
              </div>
            </div>

            {/* Tarjeta 4: Madurez */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Madurez
              </span>
              <div>
                <StatusBadge variant={maturityBadgeMap[maturityLevel] || 'neutral'} size="sm">
                  {maturityLabel}
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popover / Explicación de los 3 puntajes, sus pesos y las reglas de madurez */}
      {showCalculationInfo && (
        <div
          className="no-print"
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 12,
            padding: 18,
            fontSize: 12.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
              ¿Cómo se calcula el diagnóstico integral?
            </h4>
            <button
              type="button"
              onClick={() => setShowCalculationInfo(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Pesos del Índice General */}
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ponderación del Índice General (100 pts)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 6 }}>
              <div style={{ padding: '8px 12px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#1e293b' }}>Preparación Cloud</strong>
                  <span style={{ color: '#2563eb', fontWeight: 800 }}>35%</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.35 }}>
                  Evalúa 8 dimensiones técnicas (100 pts): documentación, arquitectura, dependencias, pruebas, calidad, contenedores, seguridad base y CI/CD.
                </p>
              </div>

              <div style={{ padding: '8px 12px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#1e293b' }}>Seguridad</strong>
                  <span style={{ color: '#2563eb', fontWeight: 800 }}>35%</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.35 }}>
                  Credenciales expuestas (30), sin .env real (15), .gitignore (10), versiones no obsoletas (15), base OSV (15) y buenas prácticas en código (15).
                </p>
              </div>

              <div style={{ padding: '8px 12px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#1e293b' }}>Gestión y Control</strong>
                  <span style={{ color: '#2563eb', fontWeight: 800 }}>30%</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.35 }}>
                  Git (15), LICENSE (10), versionado (10), CHANGELOG (10), guía de contribución (5), CODEOWNERS (10), issues (5), hooks (10), CI activo (15) y pruebas en CI (10).
                </p>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#475569' }}>
              <strong>Fórmula:</strong> <code>Índice General = (Preparación Cloud × 0.35) + (Seguridad × 0.35) + (Gestión × 0.30)</code>
            </div>
          </div>

          {/* Reglas de Madurez */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reglas de Clasificación de Madurez
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 6 }}>
              <div style={{ padding: '6px 10px', background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0', fontSize: 11.5 }}>
                <strong style={{ color: '#15803d' }}>Producción (production):</strong> Docker + CI/CD + pruebas + versión ≥ 1.0.0 + sin hallazgos críticos de seguridad.
              </div>
              <div style={{ padding: '6px 10px', background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe', fontSize: 11.5 }}>
                <strong style={{ color: '#1d4ed8' }}>Activo (active):</strong> Pruebas o migraciones + linter + (commits recientes en 90 días o más de 3 módulos).
              </div>
              <div style={{ padding: '6px 10px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fde68a', fontSize: 11.5 }}>
                <strong style={{ color: '#b45309' }}>MVP (mvp):</strong> Base de datos conectada o al menos 3 rutas/pantallas + más de 20 archivos de código.
              </div>
              <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5 }}>
                <strong style={{ color: '#475569' }}>Prototipo (prototype):</strong> Cualquier otro caso en fase inicial o exploratoria.
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 3. SELECTOR DE PESTAÑAS (Accesible con teclado) */}
      <div
        role="tablist"
        aria-label="Secciones de la ficha técnica"
        className="report-tablist no-print"
        style={{
          display: 'flex',
          borderBottom: '2px solid #e2e8f0',
          gap: 16,
        }}
      >
        <button
          type="button"
          role="tab"
          id="tab-status"
          aria-selected={activeTab === 'status'}
          aria-controls="panel-status"
          tabIndex={0}
          onClick={() => setActiveTab('status')}
          className="report-tab-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: `3px solid ${activeTab === 'status' ? '#2563eb' : 'transparent'}`,
            color: activeTab === 'status' ? '#2563eb' : '#64748b',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.15s ease',
          }}
        >
          <Activity size={17} />
          Estado del sistema
        </button>

        <button
          type="button"
          role="tab"
          id="tab-proposal"
          aria-selected={activeTab === 'proposal'}
          aria-controls="panel-proposal"
          tabIndex={0}
          onClick={() => setActiveTab('proposal')}
          className="report-tab-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: `3px solid ${activeTab === 'proposal' ? '#2563eb' : 'transparent'}`,
            color: activeTab === 'proposal' ? '#2563eb' : '#64748b',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: -2,
            transition: 'all 0.15s ease',
          }}
        >
          <Lightbulb size={17} />
          Propuesta recomendada
        </button>
      </div>

      {/* =========================================================================
       * CONTENIDO PESTAÑA 1 — ESTADO DEL SISTEMA
       * ========================================================================= */}
      <div
        id="panel-status"
        role="tabpanel"
        aria-labelledby="tab-status"
        className={`report-panel ${activeTab === 'status' ? '' : 'report-panel-hidden'}`}
        style={{
          display: activeTab === 'status' ? 'flex' : undefined,
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* 1. SUBSECCIÓN: SEGURIDAD (100 pts) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                Seguridad
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${securityScore}%`,
                    height: '100%',
                    background: getScoreColor(securityScore),
                    borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: getScoreColor(securityScore) }}>
                {securityScore} / 100 pts
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            {(analysis.securityChecks || []).map((ch) => {
              const notVerifiable = isCheckNotVerifiable(ch);
              return (
                <div
                  key={ch.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: '1px dashed #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                    {notVerifiable ? (
                      <span
                        style={{
                          color: '#64748b',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          marginTop: 1,
                        }}
                      >
                        No verificable desde el navegador
                      </span>
                    ) : ch.passed ? (
                      <CheckCircle2 size={17} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <XCircle size={17} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>
                        {ch.label}
                      </span>
                      {ch.evidence && !notVerifiable && (
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            color: '#64748b',
                            background: '#f8fafc',
                            padding: '1px 6px',
                            borderRadius: 4,
                            width: 'fit-content',
                          }}
                        >
                          Evidencia: {ch.evidence}
                        </span>
                      )}
                      {ch.note && (
                        <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                          Nota: {ch.note}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: notVerifiable ? '#64748b' : ch.passed ? '#16a34a' : '#dc2626',
                      flexShrink: 0,
                    }}
                  >
                    {ch.points} / {ch.maxPoints} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SUBSECCIÓN: GESTIÓN Y CONTROL (100 pts) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Scale size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                Gestión y control
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${governanceScore}%`,
                    height: '100%',
                    background: getScoreColor(governanceScore),
                    borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: getScoreColor(governanceScore) }}>
                {governanceScore} / 100 pts
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            {(analysis.governanceChecks || []).map((ch) => {
              const notVerifiable = isCheckNotVerifiable(ch);
              return (
                <div
                  key={ch.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: '1px dashed #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                    {notVerifiable ? (
                      <span
                        style={{
                          color: '#64748b',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          marginTop: 1,
                        }}
                      >
                        No verificable desde el navegador
                      </span>
                    ) : ch.passed ? (
                      <CheckCircle2 size={17} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <XCircle size={17} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>
                        {ch.label}
                      </span>
                      {ch.evidence && !notVerifiable && (
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            color: '#64748b',
                            background: '#f8fafc',
                            padding: '1px 6px',
                            borderRadius: 4,
                            width: 'fit-content',
                          }}
                        >
                          Evidencia: {ch.evidence}
                        </span>
                      )}
                      {ch.note && (
                        <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                          Nota: {ch.note}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: notVerifiable ? '#64748b' : ch.passed ? '#16a34a' : '#dc2626',
                      flexShrink: 0,
                    }}
                  >
                    {ch.points} / {ch.maxPoints} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SUBSECCIÓN: PREPARACIÓN CLOUD (100 pts) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                Preparación Cloud
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${cloudReadinessScore}%`,
                    height: '100%',
                    background: getScoreColor(cloudReadinessScore),
                    borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: getScoreColor(cloudReadinessScore) }}>
                {cloudReadinessScore} / 100 pts
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.dimensions.map((dim) => {
              const DimIcon = getDimensionIcon(dim.id);
              const percent = dim.maxScore > 0 ? (dim.score / dim.maxScore) * 100 : 0;
              const barColor = percent >= 70 ? '#16A34A' : percent >= 50 ? '#F59E0B' : '#DC2626';
              const isExpanded = !!expandedDimensions[dim.id];

              return (
                <div
                  key={dim.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  {/* Fila Cabecera de la Dimensión */}
                  <div
                    onClick={() => toggleDimension(dim.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                      <DimIcon size={17} color="#2563eb" />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>
                        {dim.label}
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 360, margin: '0 16px' }}>
                      <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: barColor,
                            borderRadius: 4,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', minWidth: 50, textAlign: 'right' }}>
                        {dim.score} / {dim.maxScore}
                      </span>
                    </div>

                    <div style={{ color: '#64748b' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Detalle de Checks al expandir */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '12px 16px 16px',
                        background: '#ffffff',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {dim.checks.map((ch) => {
                        const notVerifiable = isCheckNotVerifiable(ch);
                        return (
                          <div
                            key={ch.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 12,
                              padding: '6px 0',
                              borderBottom: '1px dashed #f1f5f9',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                              {notVerifiable ? (
                                <span
                                  style={{
                                    color: '#64748b',
                                    background: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  No verificable desde el navegador
                                </span>
                              ) : ch.passed ? (
                                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                              ) : (
                                <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                                  {ch.label}
                                </span>
                                {ch.evidence && !notVerifiable && (
                                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', background: '#f8fafc', padding: '1px 6px', borderRadius: 4, width: 'fit-content' }}>
                                    Evidencia: {ch.evidence}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span style={{ fontSize: 12, fontWeight: 700, color: notVerifiable ? '#64748b' : ch.passed ? '#16a34a' : '#64748b', flexShrink: 0 }}>
                              {ch.points} / {ch.maxPoints} pts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. SUBSECCIÓN: MADUREZ Y MÉTRICAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Award size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                Madurez del proyecto
              </h3>
            </div>
            <StatusBadge variant={maturityBadgeMap[maturityLevel] || 'neutral'} size="md">
              Nivel: {maturityLabel}
            </StatusBadge>
          </div>

          {/* Señales que justifican el nivel (sin porcentaje de avance) */}
          {analysis.maturity?.signals && analysis.maturity.signals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Señales que determinan el nivel {maturityLabel}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {analysis.maturity.signals.map((sig, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#64748b' }}>{sig.label}:</span>
                    <strong style={{ color: '#1e293b' }}>{sig.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de métricas del proyecto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Métricas del proyecto
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
              }}
            >
              <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Archivos de código</span>
                <strong style={{ fontSize: 18, color: '#1e293b' }}>
                  {analysis.metrics?.codeFiles ?? analysis.filesAnalyzed}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                  de {analysis.metrics?.totalFiles ?? analysis.totalFiles} archivos
                </span>
              </div>

              <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Líneas de código (LOC)</span>
                <strong style={{ fontSize: 18, color: '#1e293b' }}>
                  {(analysis.metrics?.linesOfCode ?? 0).toLocaleString('es-ES')}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                  archivos leídos (sin vacías)
                </span>
              </div>

              <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Módulos detectados</span>
                <strong style={{ fontSize: 18, color: '#1e293b' }}>
                  {analysis.metrics?.modules ?? 0}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                  directorios de 1er nivel
                </span>
              </div>

              <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Rutas / Endpoints API</span>
                <strong style={{ fontSize: 18, color: '#1e293b' }}>
                  {analysis.metrics?.routesOrEndpoints ?? 0}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                  patrones detectados
                </span>
              </div>

              <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Migraciones de BD</span>
                <strong style={{ fontSize: 18, color: '#1e293b' }}>
                  {analysis.metrics?.dbMigrations ?? 0}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                  alembic, prisma, sql
                </span>
              </div>

              <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>TODO / FIXME pendientes</span>
                <strong style={{ fontSize: 18, color: analysis.metrics?.todoCount && analysis.metrics.todoCount > 20 ? '#d97706' : '#1e293b' }}>
                  {analysis.metrics?.todoCount ?? 0}
                </strong>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                  deuda técnica anotada
                </span>
              </div>

              {analysis.source === 'github' && (
                <>
                  <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Commits últimos 90 días</span>
                    <strong style={{ fontSize: 18, color: '#1e293b' }}>
                      {analysis.metrics?.commitsLast90Days !== undefined ? analysis.metrics.commitsLast90Days : 'N/D'}
                    </strong>
                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                      actividad reciente
                    </span>
                  </div>

                  <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Colaboradores</span>
                    <strong style={{ fontSize: 18, color: '#1e293b' }}>
                      {analysis.metrics?.contributors !== undefined ? analysis.metrics.contributors : 'N/D'}
                    </strong>
                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                      contribuidores GitHub
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>


        {/* b) Problemas encontrados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
              Problemas encontrados ({analysis.findings.length})
            </h3>
          </div>

          {analysis.findings.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 12,
                color: '#15803d',
              }}
            >
              <CheckCircle2 size={22} color="#16a34a" />
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                No encontramos problemas. Tu proyecto está listo para planificar su migración.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['critical', 'medium', 'low'] as Severity[]).map((sev) => {
                const groupFindings = analysis.findings.filter((f) => f.severity === sev);
                if (groupFindings.length === 0) return null;

                const isGroupOpen = !!expandedFindingGroups[sev];
                const badgeLabel = sev === 'critical' ? 'Crítico' : sev === 'medium' ? 'Medio' : 'Bajo';
                const badgeBg = sev === 'critical' ? '#fee2e2' : sev === 'medium' ? '#fef3c7' : '#f1f5f9';
                const badgeBorder = sev === 'critical' ? '#fca5a5' : sev === 'medium' ? '#fde68a' : '#cbd5e1';
                const badgeColor = sev === 'critical' ? '#dc2626' : sev === 'medium' ? '#b45309' : '#475569';

                return (
                  <div
                    key={sev}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#ffffff',
                    }}
                  >
                    <div
                      onClick={() => toggleFindingGroup(sev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            background: badgeBg,
                            border: `1px solid ${badgeBorder}`,
                            color: badgeColor,
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            textTransform: 'uppercase',
                          }}
                        >
                          {badgeLabel} ({groupFindings.length})
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                          {sev === 'critical'
                            ? 'Deben corregirse antes de desplegar en producción'
                            : sev === 'medium'
                            ? 'Recomendados antes de la migración'
                            : 'Oportunidades de mejora en calidad'}
                        </span>
                      </div>
                      <div style={{ color: '#64748b' }}>
                        {isGroupOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isGroupOpen && (
                      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {groupFindings.map((finding) => (
                          <div
                            key={finding.id}
                            style={{
                              padding: '14px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: 8,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <h5 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>
                                {finding.title}
                              </h5>
                              <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                                {finding.dimension}
                              </span>
                            </div>

                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              <strong>Evidencia:</strong>{' '}
                              <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                {finding.evidence}
                              </span>
                            </div>

                            {/* Bloque destacado "Cómo resolverlo" */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                padding: '10px 12px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: 8,
                                fontSize: 12,
                                color: '#1e40af',
                                lineHeight: 1.4,
                              }}
                            >
                              <Info size={15} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <strong>Cómo resolverlo:</strong> {finding.recommendation}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* c) Fortalezas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            Fortalezas identificadas ({analysis.strengths.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {analysis.strengths.map((str) => (
              <div
                key={str.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                }}
              >
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    {str.title}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>
                    {str.evidence}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
       * CONTENIDO PESTAÑA 2 — PROPUESTA RECOMENDADA
       * ========================================================================= */}
      <div
        id="panel-proposal"
        role="tabpanel"
        aria-labelledby="tab-proposal"
        className={`report-panel ${activeTab === 'proposal' ? '' : 'report-panel-hidden'}`}
        style={{
          display: activeTab === 'proposal' ? 'flex' : undefined,
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* a) Estrategia de Migración */}
        <div
          style={{
            padding: 20,
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estrategia de Migración AWS Recomendada
            </span>
            <span
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Modelo 6 R's de AWS
            </span>
          </div>

          <h4 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#1e293b' }}>
            {analysis.strategy.label}
          </h4>

          <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
            {analysis.strategy.description}
          </p>

          <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
            Elegida automáticamente porque el proyecto obtuvo un índice de {analysis.score}/100 y cuenta con {analysis.stack.map((s) => s.name).join(', ') || 'arquitectura cloud'}.
          </div>
        </div>

        {/* b) Tareas previas a la migración */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            Tareas previas a la migración ({analysis.preMigrationTasks.length})
          </h3>

          {analysis.preMigrationTasks.length === 0 ? (
            <div style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>
              Sin tareas previas requeridas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.preMigrationTasks.map((task, idx) => (
                <div
                  key={task.fromFindingId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', flex: 1 }}>
                    {task.title}
                  </span>
                  <span
                    style={{
                      background: task.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                      color: task.severity === 'critical' ? '#dc2626' : '#b45309',
                      border: `1px solid ${task.severity === 'critical' ? '#fca5a5' : '#fde68a'}`,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    {task.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* c) Servicios AWS recomendados con Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
              Servicios AWS recomendados
            </h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {selectedServiceIds.size} de {analysis.recommendations.length} seleccionados
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.recommendations.map((rec) => {
              const catalogSvc = awsServicesCatalog.find((s) => s.id === rec.serviceId);
              if (!catalogSvc) return null;
              const isChecked = selectedServiceIds.has(rec.serviceId);

              return (
                <label
                  key={rec.serviceId}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '14px',
                    borderRadius: 10,
                    border: isChecked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    background: isChecked ? '#f8faff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleServiceCheckbox(rec.serviceId)}
                    style={{ marginTop: 3, cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
                          {catalogSvc.name}
                        </span>
                        <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: 4 }}>
                          {catalogSvc.category}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                        {catalogSvc.pricing.unitLabel}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
                      {rec.reason}
                    </p>

                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      <strong>Detonado por:</strong> {rec.triggeredBy.join(', ')}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* d) Costo estimado y Supuestos Editables */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Simulación de Presupuesto
              </span>
              <h4 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                Costo estimado de la arquitectura recomendada
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Total Mensual</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>
                  ${totalMonthlyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Total Anual</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>
                  ${totalAnnualCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Supuestos Editables en Línea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
              Supuestos de cálculo (editables en línea):
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span>EC2 (Instancias):</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={costAssumptions.ec2Instances}
                  onChange={(e) => setCostAssumptions((prev) => ({ ...prev, ec2Instances: Number(e.target.value) || 1 }))}
                  style={{ width: 60, padding: '3px 6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span>RDS (Bases de datos):</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={costAssumptions.rdsInstances}
                  onChange={(e) => setCostAssumptions((prev) => ({ ...prev, rdsInstances: Number(e.target.value) || 1 }))}
                  style={{ width: 60, padding: '3px 6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span>S3 Storage (GB):</span>
                <input
                  type="number"
                  min="5"
                  max="10000"
                  value={costAssumptions.s3Gb}
                  onChange={(e) => setCostAssumptions((prev) => ({ ...prev, s3Gb: Number(e.target.value) || 5 }))}
                  style={{ width: 60, padding: '3px 6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span>CloudFront (GB/mes):</span>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={costAssumptions.cloudfrontGb}
                  onChange={(e) => setCostAssumptions((prev) => ({ ...prev, cloudfrontGb: Number(e.target.value) || 10 }))}
                  style={{ width: 60, padding: '3px 6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                />
              </label>
            </div>
          </div>

          <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
            Precios referenciales, verificar en calculator.aws
          </span>
        </div>

        {/* e) No disponibles en este simulador (si hay) */}
        {analysis.unsupported.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Tecnologías no simulables en este entorno ({analysis.unsupported.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.unsupported.map((un, idx) => (
                <div key={idx} style={{ fontSize: 12.5, color: '#475569' }}>
                  <strong>{un.name}:</strong> Se recomienda migrar a <em>{un.suggestedAwsService}</em>. {un.note}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* g) Aviso ámbar si el estado es 'needs-preparation' */}
        {analysis.status === 'needs-preparation' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '14px 18px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 10,
              fontSize: 13,
              color: '#92400e',
            }}
          >
            <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Tu proyecto requiere preparación:</strong> Puedes continuar con la propuesta, pero te recomendamos resolver primero las tareas previas señaladas para no trasladar deudas técnicas a la nube.
            </div>
          </div>
        )}

        {/* f) Botón principal "Usar en mi propuesta" */}
        {onApplyToProposal && (
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                const selectedCodes = Array.from(selectedServiceIds)
                  .map((id) => awsServicesCatalog.find((s) => s.id === id)?.codeName)
                  .filter((c): c is string => Boolean(c));

                onApplyToProposal({
                  projectName: analysis.projectName,
                  appType: analysis.suggestedAppType as CloudProposal['appType'],
                  description: analysis.suggestedDescription,
                  selectedServices: selectedCodes,
                  analysisId: analysis.id,
                  costItems: generatedCostItems,
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
            >
              Usar en mi propuesta
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
