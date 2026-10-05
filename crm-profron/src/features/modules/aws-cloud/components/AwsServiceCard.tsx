import { useState } from 'react';
import {
  Server,
  Database,
  HardDrive,
  Network,
  Shield,
  Zap,
  Activity,
  Globe,
  Info,
  X,
} from 'lucide-react';
import type { AwsService } from '../types/awsTypes';

interface AwsServiceCardProps {
  service: AwsService;
  onSelect?: (service: AwsService) => void;
  isSelected?: boolean;
}

export default function AwsServiceCard({
  service,
  onSelect,
  isSelected = false,
}: AwsServiceCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getServiceIcon = () => {
    switch (service.iconType) {
      case 'server':
        return <Server size={20} />;
      case 'database':
        return <Database size={20} />;
      case 'hard-drive':
        return <HardDrive size={20} />;
      case 'network':
        return <Network size={20} />;
      case 'shield':
        return <Shield size={20} />;
      case 'zap':
        return <Zap size={20} />;
      case 'activity':
        return <Activity size={20} />;
      case 'globe':
      default:
        return <Globe size={20} />;
    }
  };

  const getCategoryColor = () => {
    switch (service.category) {
      case 'Cómputo':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: '#fde68a' };
      case 'Almacenamiento':
        return { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb', border: '#bfdbfe' };
      case 'Base de Datos':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: '#a7f3d0' };
      case 'Seguridad e Identidad':
        return { bg: 'rgba(220, 38, 38, 0.1)', text: '#dc2626', border: '#fecaca' };
      case 'Serverless':
        return { bg: 'rgba(168, 85, 247, 0.12)', text: '#9333ea', border: '#e9d5ff' };
      case 'Redes y CDN':
      default:
        return { bg: 'rgba(14, 165, 233, 0.12)', text: '#0284c7', border: '#bae6fd' };
    }
  };

  const catStyle = getCategoryColor();

  return (
    <>
      <div
        style={{
          background: '#ffffff',
          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '22px',
          boxShadow: isSelected ? '0 8px 24px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: onSelect ? 'pointer' : 'default',
        }}
        onClick={() => onSelect && onSelect(service)}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: catStyle.bg,
                color: catStyle.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getServiceIcon()}
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 20,
                background: catStyle.bg,
                color: catStyle.text,
                border: `1px solid ${catStyle.border}`,
              }}
            >
              {service.category}
            </span>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
            {service.name}
          </h3>

          <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
            {service.description}
          </p>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Tarifa estimada</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
              {service.estimatedCostPerHour === 0 ? 'Gratuito' : `$${service.estimatedCostPerHour.toFixed(4)}/h`}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailModal(true);
            }}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.2s ease',
            }}
          >
            <Info size={13} /> Ficha Técnica
          </button>
        </div>
      </div>

      {/* Modal Ficha Técnica */}
      {showDetailModal && (
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
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 540,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: catStyle.bg, color: catStyle.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getServiceIcon()}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#1e293b' }}>{service.name}</h2>
                  <span style={{ fontSize: 12, color: catStyle.text, fontWeight: 700 }}>{service.category} • {service.codeName}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
              <div>
                <strong style={{ color: '#1e293b', display: 'block', marginBottom: 4 }}>Función Principal:</strong>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>{service.mainFunction}</p>
              </div>

              <div>
                <strong style={{ color: '#1e293b', display: 'block', marginBottom: 4 }}>Caso de Uso Recomendado:</strong>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>{service.useCase}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Unidad de Facturación:</span>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{service.pricingUnit}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>SLA de Disponibilidad:</span>
                  <div style={{ fontWeight: 700, color: '#16a34a' }}>{service.slaPercent}%</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
