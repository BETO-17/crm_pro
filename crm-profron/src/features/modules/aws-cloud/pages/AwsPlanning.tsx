import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import type { CloudProposal } from '../types/awsTypes';
import { initialSavedProposals } from '../data/awsCostsPresets';
import { awsServicesCatalog } from '../data/awsServicesData';
import '../aws.css';

const LOCAL_STORAGE_KEY = 'aws_cloud_planning_proposals';

export default function AwsPlanning() {
  const [proposals, setProposals] = useState<CloudProposal[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialSavedProposals;
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form Fields
  const [solutionName, setSolutionName] = useState('');
  const [appType, setAppType] = useState<CloudProposal['appType']>('E-commerce & Retail');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('us-east-1 (N. Virginia)');
  const [estimatedUsers, setEstimatedUsers] = useState(15000);
  const [availabilityLevel, setAvailabilityLevel] = useState<CloudProposal['availabilityLevel']>('99.95% (Alta Disponibilidad)');
  const [selectedServices, setSelectedServices] = useState<string[]>(['EC2', 'RDS', 'S3', 'CloudFront', 'VPC']);
  const [migrationGoal, setMigrationGoal] = useState<CloudProposal['migrationGoal']>('Modernización de Aplicación');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(proposals));
    } catch {
      // ignore
    }
  }, [proposals]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleService = (codeName: string) => {
    if (selectedServices.includes(codeName)) {
      setSelectedServices(selectedServices.filter((s) => s !== codeName));
    } else {
      setSelectedServices([...selectedServices, codeName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionName.trim() || !description.trim()) {
      showToast('Por favor completa el nombre y la descripción de la solución.');
      return;
    }

    if (selectedServices.length === 0) {
      showToast('Debes seleccionar al menos un servicio AWS para tu arquitectura.');
      return;
    }

    // Estimate monthly budget based on selected services
    const baseCost = selectedServices.length * 95.5;
    const userFactor = (estimatedUsers / 1000) * 8.2;
    const calculatedMonthly = +(baseCost + userFactor).toFixed(2);
    const calculatedAnnual = +(calculatedMonthly * 12).toFixed(2);

    const newProposal: CloudProposal = {
      id: `prop-${Date.now()}`,
      solutionName: solutionName.trim(),
      appType,
      description: description.trim(),
      region,
      estimatedUsers,
      availabilityLevel,
      selectedServices,
      migrationGoal,
      monthlyBudget: calculatedMonthly,
      annualBudget: calculatedAnnual,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'En Revisión',
    };

    setProposals([newProposal, ...proposals]);
    showToast(`✓ Propuesta "${newProposal.solutionName}" registrada con éxito.`);

    // Reset Form
    setSolutionName('');
    setDescription('');
  };

  const handleDelete = (id: string, name: string) => {
    setProposals(proposals.filter((p) => p.id !== id));
    showToast(`Propuesta "${name}" eliminada.`);
  };

  return (
    <div className="aws-container">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#0f172a',
            border: '1px solid #2563eb',
            color: '#bfdbfe',
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
          <Sparkles size={16} color="#60a5fa" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
          Módulo 2 — Planificación de Solución Cloud
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Diseña y registra propuestas formales de arquitectura de software para migración a servicios de AWS.
        </p>
      </div>

      {/* Grid: Form (Left) & Proposals Table (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: 24 }}>
        {/* Registration Form */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#2563eb" />
            <span>Registrar Nueva Propuesta de Arquitectura</span>
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                1. Nombre de la Solución Cloud *
              </label>
              <input
                type="text"
                placeholder="ej. Sistema de Facturación y Retail Cloud v3"
                value={solutionName}
                onChange={(e) => setSolutionName(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  2. Tipo de Aplicación *
                </label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="E-commerce & Retail">E-commerce & Retail</option>
                  <option value="API REST / Backend">API REST / Backend</option>
                  <option value="Microservicios Cloud">Microservicios Cloud</option>
                  <option value="Data Lake & Analítica">Data Lake & Analítica</option>
                  <option value="Portal Web Empresarial">Portal Web Empresarial</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  3. Región AWS Seleccionada *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia, USA)</option>
                  <option value="us-west-2 (Oregon)">us-west-2 (Oregon, USA)</option>
                  <option value="sa-east-1 (São Paulo)">sa-east-1 (São Paulo, Brasil)</option>
                  <option value="eu-west-1 (Ireland)">eu-west-1 (Irlanda, Europa)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                4. Descripción y Alcance de la Solución *
              </label>
              <textarea
                placeholder="Describe el propósito del sistema, los componentes involucrados y los flujos críticos de datos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  5. Número Estimado de Usuarios *
                </label>
                <input
                  type="number"
                  min={100}
                  max={5000000}
                  value={estimatedUsers}
                  onChange={(e) => setEstimatedUsers(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  6. Nivel de Disponibilidad (SLA) *
                </label>
                <select
                  value={availabilityLevel}
                  onChange={(e) => setAvailabilityLevel(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="99.9% (Básico Multi-AZ)">99.9% (Básico Multi-AZ)</option>
                  <option value="99.95% (Alta Disponibilidad)">99.95% (Alta Disponibilidad)</option>
                  <option value="99.99% (Misión Crítica Multi-Región)">99.99% (Misión Crítica Multi-Región)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                7. Objetivo Principal de la Migración *
              </label>
              <select
                value={migrationGoal}
                onChange={(e) => setMigrationGoal(e.target.value as any)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                <option value="Modernización de Aplicación">Modernización de Aplicación</option>
                <option value="Reducción de Costos">Reducción de Costos y TCO</option>
                <option value="Escalabilidad Elástica">Escalabilidad Elástica ante Picos de Demanda</option>
                <option value="Continuidad de Negocio y DR">Continuidad de Negocio y Disaster Recovery</option>
              </select>
            </div>

            {/* Service Selection Tags */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                8. Servicios Cloud Seleccionados en la Arquitectura *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {awsServicesCatalog.map((svc) => {
                  const isChecked = selectedServices.includes(svc.codeName);
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
              <Plus size={16} /> Registrar Propuesta Cloud
            </button>
          </form>
        </div>

        {/* Proposals List / Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
              Propuestas Registradas ({proposals.length})
            </h3>
            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Persistencia Activa ✓</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {proposals.map((prop) => (
              <div
                key={prop.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                      {prop.solutionName}
                    </h4>
                    <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 700 }}>
                      {prop.appType} • {prop.region}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 12,
                      background: prop.status === 'Aprobada' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(245, 158, 11, 0.14)',
                      color: prop.status === 'Aprobada' ? '#16a34a' : '#d97706',
                    }}
                  >
                    {prop.status}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                  {prop.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {prop.selectedServices.map((s) => (
                    <span key={s} style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#334155' }}>
                      {s}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f1f5f9', fontSize: 12 }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Presupuesto: </span>
                    <strong style={{ color: '#1e293b' }}>${prop.monthlyBudget.toFixed(2)}/mes</strong>
                  </div>

                  <button
                    onClick={() => handleDelete(prop.id, prop.solutionName)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600 }}
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
