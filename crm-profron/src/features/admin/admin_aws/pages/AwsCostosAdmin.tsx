import { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  CheckCircle,
  Lightbulb,
  Layers,
  Check,
  X,
  Clock,
  Sparkles,
  Sliders,
  FileText,
} from 'lucide-react';
import type { CloudProposal } from '../../../modules/aws-cloud/types/awsTypes';
import { initialSavedProposals } from '../../../modules/aws-cloud/data/awsCostsPresets';
import '../aws_admin.css';

const LOCAL_STORAGE_KEY = 'aws_cloud_planning_proposals';

interface ServiceCost {
  service: string;
  category: string;
  spendThisMonth: number;
  spendLastMonth: number;
  percentageOfTotal: number;
}

const serviceCosts: ServiceCost[] = [
  { service: 'Amazon Elastic Compute Cloud (EC2)', category: 'Cómputo', spendThisMonth: 980.40, spendLastMonth: 1040.00, percentageOfTotal: 53.3 },
  { service: 'Amazon Relational Database (RDS)', category: 'Base de Datos', spendThisMonth: 420.10, spendLastMonth: 420.00, percentageOfTotal: 22.8 },
  { service: 'Amazon Simple Storage Service (S3)', category: 'Almacenamiento', spendThisMonth: 185.20, spendLastMonth: 198.50, percentageOfTotal: 10.1 },
  { service: 'Amazon Virtual Private Cloud (VPC & NAT)', category: 'Redes', spendThisMonth: 140.00, spendLastMonth: 142.00, percentageOfTotal: 7.6 },
  { service: 'AWS Lambda & API Gateway', category: 'Serverless', spendThisMonth: 64.80, spendLastMonth: 58.20, percentageOfTotal: 3.5 },
  { service: 'Amazon CloudWatch & SNS', category: 'Monitoreo', spendThisMonth: 50.00, spendLastMonth: 48.00, percentageOfTotal: 2.7 },
];

export default function AwsCostosAdmin() {
  const [budgetLimit, setBudgetLimit] = useState(2500.00);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('2500.00');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load user proposals from localStorage
  const [proposals, setProposals] = useState<CloudProposal[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialSavedProposals;
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync proposals back to localStorage whenever admin updates statuses
  const updateProposalStatus = (id: string, newStatus: CloudProposal['status']) => {
    const updated = proposals.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
    setProposals(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(`✓ Propuesta actualizada a estado "${newStatus}"`);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(val);
      setIsEditingBudget(false);
      showToast(`✓ Límite de AWS Budgets actualizado a $${val.toFixed(2)} USD`);
    }
  };

  const currentTotal = serviceCosts.reduce((acc, curr) => acc + curr.spendThisMonth, 0);
  const approvedProposalsBudget = proposals
    .filter((p) => p.status === 'Aprobada')
    .reduce((acc, curr) => acc + curr.monthlyBudget, 0);

  const budgetUsagePercent = ((currentTotal / budgetLimit) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#0f172a',
            border: '1px solid #f59e0b',
            color: '#fef08a',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={16} color="#f59e0b" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            AWS Cost Explorer, Budgets & Aprobación de Arquitecturas
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Supervisión presupuestaria corporativa, límites de gasto (AWS Budgets) y bandeja de aprobación de proyectos de usuarios.
          </p>
        </div>

        <button
          className="aws-btn-secondary"
          onClick={() => {
            setTempBudget(budgetLimit.toString());
            setIsEditingBudget(!isEditingBudget);
          }}
        >
          <Sliders size={14} /> {isEditingBudget ? 'Cancelar Edición' : 'Configurar AWS Budget'}
        </button>
      </div>

      {/* Budget Editor Inline Panel */}
      {isEditingBudget && (
        <form
          onSubmit={handleSaveBudget}
          style={{
            background: '#ffffff',
            border: '2px solid #2563eb',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
          }}
        >
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Definir Límite Presupuestario Mensual Máximo (USD)
            </label>
            <input
              type="number"
              min={100}
              step={50}
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 700 }}
            />
          </div>
          <button
            type="submit"
            style={{
              marginTop: 18,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Guardar Límite
          </button>
        </form>
      )}

      {/* Overview Cards */}
      <div className="aws-admin-grid">
        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Gasto Acumulado del Mes</span>
            <div className="aws-card-icon-pill">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">${currentTotal.toFixed(2)}</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingDown size={13} /> -3.8% comparado con el mes anterior
          </span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Presupuesto Asignado (AWS Budgets)</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">${budgetLimit.toFixed(2)}</div>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', marginBottom: 3 }}>
              <span>Consumo actual:</span>
              <strong style={{ color: budgetUsagePercent > 90 ? '#dc2626' : '#2563eb' }}>{budgetUsagePercent.toFixed(1)}%</strong>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, budgetUsagePercent)}%`,
                  height: '100%',
                  background: budgetUsagePercent > 90 ? '#ef4444' : budgetUsagePercent > 75 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Comprometido en Propuestas Aprobadas</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">${approvedProposalsBudget.toFixed(2)} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>/mes</span></div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
            {proposals.filter((p) => p.status === 'Aprobada').length} Propuestas autorizadas para despliegue
          </span>
        </div>
      </div>

      {/* 🚀 WORKFLOW PIPELINE: User Architecture Proposals Review */}
      <div className="aws-table-card">
        <div className="aws-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="aws-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#2563eb" />
              <span>Bandeja de Aprobación de Propuestas de Arquitectura de Usuarios ({proposals.length})</span>
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Revisa, autoriza o solicita ajustes en las soluciones cloud enviadas por los analistas antes de habilitar recursos en producción.
            </p>
          </div>
        </div>

        <table className="aws-admin-table">
          <thead>
            <tr>
              <th>Solución & Alcance</th>
              <th>Tipo de Carga</th>
              <th>Región</th>
              <th>Servicios Involucrados</th>
              <th>Presupuesto Estimado</th>
              <th>Estado Actual</th>
              <th style={{ textAlign: 'right' }}>Decisión del Administrador</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((prop) => (
              <tr key={prop.id}>
                <td>
                  <strong style={{ color: '#0f172a', fontSize: 13.5 }}>{prop.solutionName}</strong>
                  <div style={{ fontSize: 11.5, color: '#64748b', maxWidth: 280, lineHeight: 1.3, marginTop: 2 }}>
                    {prop.description}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    Creado: {prop.createdAt} • Usuarios: {prop.estimatedUsers.toLocaleString()}
                  </div>
                </td>
                <td>
                  <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#334155' }}>
                    {prop.appType}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#475569' }}>{prop.region}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 220 }}>
                    {prop.selectedServices.map((s: string) => (
                      <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <strong style={{ color: '#0f172a', fontSize: 13 }}>${prop.monthlyBudget.toFixed(2)}</strong>
                  <div style={{ fontSize: 11, color: '#64748b' }}>${prop.annualBudget.toFixed(2)}/año</div>
                </td>
                <td>
                  {prop.status === 'Aprobada' ? (
                    <span className="aws-badge-admin aws-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={11} /> Aprobada
                    </span>
                  ) : prop.status === 'En Revisión' ? (
                    <span className="aws-badge-admin aws-badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> En Revisión
                    </span>
                  ) : (
                    <span className="aws-badge-admin" style={{ background: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <X size={11} /> Rechazada
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      onClick={() => updateProposalStatus(prop.id, 'Aprobada')}
                      disabled={prop.status === 'Aprobada'}
                      style={{
                        background: prop.status === 'Aprobada' ? '#f1f5f9' : '#16a34a',
                        color: prop.status === 'Aprobada' ? '#94a3b8' : '#ffffff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: prop.status === 'Aprobada' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      title="Aprobar para despliegue en producción"
                    >
                      <Check size={12} /> Aprobar
                    </button>

                    <button
                      onClick={() => updateProposalStatus(prop.id, 'Rechazada')}
                      disabled={prop.status === 'Rechazada'}
                      style={{
                        background: 'none',
                        border: '1px solid #cbd5e1',
                        color: '#dc2626',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: prop.status === 'Rechazada' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      title="Rechazar por exceso de presupuesto o arquitectura no conforme"
                    >
                      <X size={12} /> Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Savings Recommendations */}
      <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(234, 88, 12, 0.12))', border: '1px solid #fde68a', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lightbulb size={24} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#92400e' }}>
            Recomendación de Optimización: AWS Compute Savings Plans
          </h4>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#78350f' }}>
            Al comprometer un plan de ahorro de 1 año para instancias EC2 de producción, puedes ahorrar hasta <strong>$320.00 / mes (32%)</strong> en costos de cómputo.
          </p>
        </div>
      </div>

      {/* Service Costs Breakdown */}
      <div className="aws-table-card">
        <div className="aws-table-header">
          <h3 className="aws-table-title">Desglose de Costos por Servicio AWS (Mes en Curso)</h3>
        </div>

        <table className="aws-admin-table">
          <thead>
            <tr>
              <th>Servicio AWS</th>
              <th>Categoría</th>
              <th>Gasto Mes Actual</th>
              <th>Gasto Mes Anterior</th>
              <th>% del Total</th>
            </tr>
          </thead>
          <tbody>
            {serviceCosts.map((item, idx) => (
              <tr key={idx}>
                <td><strong>{item.service}</strong></td>
                <td><span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>{item.category}</span></td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>${item.spendThisMonth.toFixed(2)}</td>
                <td style={{ color: '#64748b' }}>${item.spendLastMonth.toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}>
                    <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentageOfTotal}%`, height: '100%', background: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{item.percentageOfTotal}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
