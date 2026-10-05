import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  DollarSign,
  ShieldCheck,
  Globe,
  ArrowRight,
  Layers,
  Sparkles,
  PieChart,
  Zap,
  CheckCircle,
} from 'lucide-react';
import AwsStatCard from '../components/AwsStatCard';
import AwsCloudWatchLiveTelemetry from '../components/AwsCloudWatchLiveTelemetry';
import { initialSavedProposals } from '../data/awsCostsPresets';
import '../aws.css';

export default function AwsDashboard() {
  const navigate = useNavigate();
  const [selectedRegion] = useState('us-east-1 (N. Virginia)');

  const activeProposal = initialSavedProposals[0];

  return (
    <div className="aws-container">
      {/* Hero Banner */}
      <div className="aws-hero">
        <div className="aws-hero-left">
          <div className="aws-hero-badge">
            <Sparkles size={13} /> CloudOps Dashboard — Semanas 5 y 6
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
            Planificación & Arquitectura Cloud AWS
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: 640 }}>
            Panel unificado para visualización de arquitectura de red, cálculo de economía en la nube, infraestructura global y gobierno de identidades IAM.
          </p>
        </div>

        <div className="aws-hero-right">
          <div className="aws-region-pill">
            <Globe size={15} />
            <span>{selectedRegion}</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.88)' }}>Arquitectura: Multi-AZ Alta Disponibilidad</span>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        <AwsStatCard
          title="Costo Mensual Estimado"
          value="$665.94"
          subtitle="Proyección anual: $7,991.28"
          trend="-12% vs on-premise"
          trendPositive={true}
          icon={DollarSign}
          iconColor="#f59e0b"
          iconBg="rgba(245, 158, 11, 0.12)"
        />

        <AwsStatCard
          title="Servicios AWS en Solución"
          value="7 Servicios"
          subtitle="EC2, S3, RDS, CloudFront, VPC..."
          badgeText="Well-Architected"
          badgeType="success"
          icon={Server}
          iconColor="#2563eb"
          iconBg="rgba(37, 99, 235, 0.1)"
        />

        <AwsStatCard
          title="Nivel de Disponibilidad (SLA)"
          value="99.95%"
          subtitle="Multi-AZ Failover síncrono"
          badgeText="Alta Disponibilidad"
          badgeType="info"
          icon={Layers}
          iconColor="#059669"
          iconBg="rgba(16, 185, 129, 0.12)"
        />

        <AwsStatCard
          title="Postura de Seguridad (IAM/KMS)"
          value="96 / 100"
          subtitle="MFA forzado y cifrado SSE-S3"
          badgeText="Cumplimiento OK"
          badgeType="success"
          icon={ShieldCheck}
          iconColor="#16a34a"
          iconBg="rgba(22, 163, 74, 0.12)"
        />
      </div>

      {/* CloudWatch Live Telemetry Real-time Monitor */}
      <AwsCloudWatchLiveTelemetry />

      {/* Split View: Solution Proposal Card & Cost Breakdown Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Proposal Summary Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 12, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                Propuesta Cloud Activa
              </span>
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={13} /> {activeProposal.status}
              </span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
              {activeProposal.solutionName}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              {activeProposal.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>Tipo de Aplicación:</span>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{activeProposal.appType}</div>
              </div>
              <div>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>Usuarios Estimados:</span>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{activeProposal.estimatedUsers.toLocaleString()} concurrentes</div>
              </div>
              <div>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>Objetivo de Migración:</span>
                <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 13 }}>{activeProposal.migrationGoal}</div>
              </div>
              <div>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>Región de Despliegue:</span>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{activeProposal.region}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>
                Servicios Seleccionados en la Arquitectura:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {activeProposal.selectedServices.map((svc) => (
                  <span
                    key={svc}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    AWS {svc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Registrado el: {activeProposal.createdAt}</span>
            <button
              className="aws-btn-action"
              onClick={() => navigate('/modules/aws/planning')}
            >
              <span>Gestionar Planificación</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Cost & Economics Summary Chart */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChart size={18} color="#f59e0b" />
                <span>Economía & Costos Cloud</span>
              </h3>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>$665.94 / mes</span>
            </div>

            {/* Visual Mini Chart Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '18px 0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#334155', fontWeight: 600 }}>Cómputo (EC2 + ALB)</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>$242.94 (36%)</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: '36%', height: '100%', background: '#f59e0b' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#334155', fontWeight: 600 }}>Base de Datos (RDS Multi-AZ)</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>$255.50 (38%)</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: '38%', height: '100%', background: '#10b981' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#334155', fontWeight: 600 }}>Redes, CDN & DNS (CloudFront + R53)</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>$85.00 (13%)</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: '13%', height: '100%', background: '#06b6d4' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#334155', fontWeight: 600 }}>Almacenamiento (S3 Data Lake)</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>$57.50 (9%)</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: '9%', height: '100%', background: '#3b82f6' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Simulador Pricing Calculator</span>
            <button
              className="aws-btn-secondary"
              onClick={() => navigate('/modules/aws/costs')}
            >
              <span>Ver Calculadora</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Grid to Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div
          onClick={() => navigate('/modules/aws/network')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Layers size={18} color="#2563eb" />
            <strong style={{ fontSize: 14, color: '#1e293b' }}>Arquitectura de Red</strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Diagrama visual interactivo `Internet ➔ Route 53 ➔ CloudFront ➔ VPC`.
          </p>
        </div>

        <div
          onClick={() => navigate('/modules/aws/infrastructure')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Globe size={18} color="#059669" />
            <strong style={{ fontSize: 14, color: '#1e293b' }}>Infraestructura Global</strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            33 Regiones geográficas y 105 Zonas de Disponibilidad (AZs).
          </p>
        </div>

        <div
          onClick={() => navigate('/modules/aws/security')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <ShieldCheck size={18} color="#dc2626" />
            <strong style={{ fontSize: 14, color: '#1e293b' }}>Seguridad & IAM</strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Modelo de Responsabilidad Compartida y control de identidades.
          </p>
        </div>

        <div
          onClick={() => navigate('/modules/aws/services')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Zap size={18} color="#d97706" />
            <strong style={{ fontSize: 14, color: '#1e293b' }}>Catálogo de Servicios</strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Explorador técnico con filtros para EC2, S3, RDS, Lambda y más.
          </p>
        </div>
      </div>
    </div>
  );
}
