import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Layers,
  Server,
  Activity,
  AlertCircle,
  FileText,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import AwsRegionMap from '../components/AwsRegionMap';
import RegionCard from '../components/RegionCard';
import { awsRegionsList, getRegionStatus } from '../data/awsRegionsData';
import type { AwsRegionInfo } from '../types/awsTypes';
import { useAws } from '../context/AwsContext';
import '../aws.css';

export default function AwsInfrastructure() {
  const navigate = useNavigate();
  const { setSelectedRegion, deployedServices, activeProposal, updateProposal } = useAws();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Proposal data for operational status
  const proposalRegionStr = activeProposal?.region && activeProposal.region !== 'Sin definir' && activeProposal.region !== 'Sin región'
    ? activeProposal.region
    : null;
  const proposalServicesList = activeProposal ? activeProposal.selectedServices : deployedServices;
  const hasActiveProposal = Boolean(activeProposal);

  // Proposal region object if assigned
  const proposalRegionObj = proposalRegionStr
    ? awsRegionsList.find((r) => proposalRegionStr.includes(r.code) || proposalRegionStr.includes(r.name)) || null
    : null;

  // Region currently inspected in viewer (defaults to proposal region if available, else null)
  const [inspectedRegionCode, setInspectedRegionCode] = useState<string | null>(
    proposalRegionObj ? proposalRegionObj.code : null
  );

  useEffect(() => {
    if (proposalRegionObj && !inspectedRegionCode) {
      setInspectedRegionCode(proposalRegionObj.code);
    }
  }, [proposalRegionObj]);

  // Clicking a card or pin ONLY inspects it in the viewer (does NOT mutate proposal)
  const handleInspect = (reg: AwsRegionInfo) => {
    setInspectedRegionCode(reg.code);
  };

  // Explicit button action with confirmation to assign region to active proposal
  const handleSetAsProposalRegion = (reg: AwsRegionInfo) => {
    if (!activeProposal) return;
    const formattedName = `${reg.code} (${reg.name})`;
    updateProposal({ region: formattedName });
    setSelectedRegion(formattedName);
    setToastMsg(`Región de la propuesta actualizada a "${formattedName}"`);
    setTimeout(() => setToastMsg(null), 3000);
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
            border: '1px solid #10b981',
            color: '#a7f3d0',
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
          <Sparkles size={16} color="#34d399" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
            Infraestructura Global
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Explora la red mundial de Regiones geográficas y Zonas de Disponibilidad (AZs). Selecciona tu región primaria para toda la suite.
          </p>
        </div>
      </div>

      {/* Notice Banner if No Active Proposal */}
      {!hasActiveProposal && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                flexShrink: 0,
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>
                Sin propuesta cloud activa registrada
              </div>
              <div style={{ fontSize: 12.5, color: '#3b82f6' }}>
                Para vincular una región oficial y desplegar los servicios de tu arquitectura, crea o activa una propuesta en Planificación.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/modules/aws/planning')}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            <FileText size={15} />
            Ir a Planificación
          </button>
        </div>
      )}

      {/* StatCards Grid */}
      <div className="aws-responsive-grid-4">
        {/* StatCard 1: Región de Despliegue */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
              Región de Despliegue
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Globe size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: proposalRegionObj ? '#1e293b' : '#94a3b8', lineHeight: 1.1 }}>
              {proposalRegionObj ? proposalRegionObj.code : 'Sin región'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {proposalRegionObj ? proposalRegionObj.name : 'Crea una propuesta para elegir región'}
            </div>
          </div>
        </div>

        {/* StatCard 2: Servicios Desplegados */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
              Servicios Desplegados
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <Server size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: hasActiveProposal ? '#1e293b' : '#94a3b8', lineHeight: 1.1 }}>
              {hasActiveProposal
                ? (proposalServicesList.length > 0 ? `${proposalServicesList.length} servicios` : '0 servicios')
                : 'Sin definir'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              {hasActiveProposal
                ? (proposalServicesList.length > 0 ? proposalServicesList.join(', ') : 'Sin recursos en arquitectura')
                : 'Pendiente de configurar'}
            </div>
          </div>
        </div>

        {/* StatCard 3: Estado de Infraestructura */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
              Estado de Infraestructura
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}
            >
              <Activity size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: hasActiveProposal ? '#1e293b' : '#94a3b8', lineHeight: 1.1 }}>
              {hasActiveProposal
                ? (proposalServicesList.length > 0 ? 'En uso' : 'Requiere revisión')
                : 'Sin definir'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              {hasActiveProposal ? (
                <>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: proposalServicesList.length > 0 ? '#16a34a' : '#f59e0b',
                    }}
                  />
                  <span>
                    {proposalServicesList.length > 0 ? 'Infraestructura operativa' : 'Región elegida sin servicios'}
                  </span>
                </>
              ) : (
                'Sin propuesta activa'
              )}
            </div>
          </div>
        </div>

        {/* StatCard 4: Zonas de Disponibilidad (AZs) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
              Zonas de Disponibilidad
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9333ea',
              }}
            >
              <Layers size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: proposalRegionObj ? '#1e293b' : '#94a3b8', lineHeight: 1.1 }}>
              {proposalRegionObj ? `${proposalRegionObj.availabilityZones} AZs` : 'Sin definir'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              {proposalRegionObj ? `Aislamiento Multi-AZ en ${proposalRegionObj.code}` : 'Tolerancia a fallos sin definir'}
            </div>
          </div>
        </div>
      </div>

      {/* Global Interactive Map Component */}
      <AwsRegionMap
        selectedRegionCode={inspectedRegionCode}
        onSelectRegion={handleInspect}
        proposalRegion={proposalRegionStr}
        proposalServices={proposalServicesList}
        onSetAsProposalRegion={handleSetAsProposalRegion}
        hasActiveProposal={hasActiveProposal}
      />

      {/* RegionCard Grid Section (Synchronized with Map on Click) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 2px' }}>
              Regiones de AWS
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
              Haz clic en una región para ver su detalle en el globo.
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: 20 }}>
            {awsRegionsList.length} Regiones Disponibles
          </span>
        </div>

        <div className="aws-responsive-grid-3">
          {awsRegionsList.map((region) => {
            const isSelected = inspectedRegionCode === region.code;
            const isTarget = proposalRegionStr ? proposalRegionStr.includes(region.code) : false;
            const regionServices = isTarget ? proposalServicesList : [];
            const statusInfo = getRegionStatus(region.code, proposalRegionStr, proposalServicesList);

            return (
              <RegionCard
                key={region.code}
                region={region}
                isSelected={isSelected}
                isTarget={isTarget}
                regionServices={regionServices}
                statusInfo={statusInfo}
                onSelect={handleInspect}
              />
            );
          })}
        </div>
      </div>

      {/* Educational Concept Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginTop: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <BookOpen size={16} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Región · Zona de Disponibilidad · Edge Location
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#2563eb', minWidth: 175 }}>
              Región de AWS:
            </span>
            <span style={{ color: '#475569' }}>
              Área geográfica en el mundo que contiene múltiples Zonas de Disponibilidad (AZs) aisladas y conectadas entre sí con baja latencia.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#16a34a', minWidth: 175 }}>
              Zona de Disponibilidad (AZ):
            </span>
            <span style={{ color: '#475569' }}>
              Uno o más centros de datos discretos e independientes con energía, redes y refrigeración redundantes para tolerancia a fallos.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#d97706', minWidth: 175 }}>
              Edge Location:
            </span>
            <span style={{ color: '#475569' }}>
              Red global de centros de datos aparte que utiliza Amazon CloudFront para acercar y servir el contenido a los usuarios con mínima latencia.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
