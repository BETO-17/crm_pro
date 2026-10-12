import { useState } from 'react';
import {
  Globe,
  Radio,
  Server,
  Database,
  Shield,
  Layers,
  ArrowDown,
  Play,
  Info,
  Plus,
  Network,
} from 'lucide-react';
import { useAws } from '../context/AwsContext';
import StatusBadge from './StatusBadge';

interface NodeDetail {
  id: string;
  serviceCode?: string;
  title: string;
  subtitle: string;
  category: string;
  cidrOrDns: string;
  securityGroup: string;
  description: string;
}

const networkNodesDetails: Record<string, NodeDetail> = {
  internet: {
    id: 'internet',
    title: 'Internet Público & Clientes Globales',
    subtitle: 'Tráfico Entrante HTTPS (443)',
    category: 'Acceso Externo',
    cidrOrDns: '0.0.0.0/0',
    securityGroup: 'N/A',
    description: 'Navegadores web, aplicaciones móviles y clientes accediendo de forma segura desde cualquier ubicación geográfica.',
  },
  route53: {
    id: 'route53',
    serviceCode: 'Route 53',
    title: 'Amazon Route 53 (DNS Global)',
    subtitle: 'Enrutamiento de Dominio erpxmetrics360.com',
    category: 'DNS & Latency Routing',
    cidrOrDns: 'erpxmetrics360.com (Alias A Record)',
    securityGroup: 'AWS Shield Standard',
    description: 'Resuelve peticiones DNS con comprobación de estado de salud (Health Checks) y enruta tráfico hacia la distribución CloudFront más cercana.',
  },
  cloudfront: {
    id: 'cloudfront',
    serviceCode: 'CloudFront',
    title: 'Amazon CloudFront (Edge CDN)',
    subtitle: 'Caché Global y Terminación SSL',
    category: 'Content Delivery Network',
    cidrOrDns: 'd1234abcd.cloudfront.net',
    securityGroup: 'AWS WAF (Web Application Firewall)',
    description: 'Distribución perimetral de contenido estático y proxy inverso seguro hacia el Application Load Balancer de la VPC.',
  },
  igw: {
    id: 'igw',
    serviceCode: 'VPC',
    title: 'Internet Gateway (IGW)',
    subtitle: 'Puerta de Enlace a Internet para la VPC',
    category: 'Puerta de Enlace',
    cidrOrDns: 'igw-0a1b2c3d4e5f',
    securityGroup: 'Tabla de Rutas VPC (0.0.0.0/0 -> igw)',
    description: 'Punto de entrada y salida horizontalmente escalable que conecta las subredes públicas de la VPC con la red de Internet.',
  },
  vpc: {
    id: 'vpc',
    serviceCode: 'VPC',
    title: 'Amazon VPC (Virtual Private Cloud)',
    subtitle: 'Red Aislada Corporativa (10.0.0.0/16)',
    category: 'Límite de Red',
    cidrOrDns: '10.0.0.0/16 (2 Zonas de Disponibilidad)',
    securityGroup: 'Network ACLs (NACLs)',
    description: 'Espacio de red privado lógicamente aislado donde residen los balanceadores, servidores de aplicaciones y la base de datos.',
  },
  alb: {
    id: 'alb',
    serviceCode: 'ALB',
    title: 'Elastic Load Balancing (ALB Público)',
    subtitle: 'Subred Pública (10.0.1.0/24 & 10.0.2.0/24)',
    category: 'Balanceo de Carga L7',
    cidrOrDns: 'alb-prod.elb.amazonaws.com',
    securityGroup: 'sg-alb-public (Permite :443 desde CloudFront)',
    description: 'Recibe tráfico a través del Internet Gateway y distribuye peticiones uniformemente hacia el grupo de instancias EC2 en ambas AZs.',
  },
  nat: {
    id: 'nat',
    serviceCode: 'VPC',
    title: 'NAT Gateway Administrado',
    subtitle: 'Subred Pública (Salida Segura)',
    category: 'Traducción de Red (NAT)',
    cidrOrDns: 'nat-0987654321fed (IP Elástica: 54.210.12.34)',
    securityGroup: 'Rutas Privadas (0.0.0.0/0 -> nat-gateway)',
    description: 'Permite que las instancias EC2 en subredes privadas se conecten a Internet para actualizaciones de paquetes sin exponerse a tráfico entrante.',
  },
  ec2: {
    id: 'ec2',
    serviceCode: 'EC2',
    title: 'Amazon EC2 Auto Scaling Group (App Tier)',
    subtitle: 'Subred Privada (10.0.10.0/24 & 10.0.20.0/24)',
    category: 'Cómputo Backend',
    cidrOrDns: '10.0.10.42 / 10.0.20.88 (Sin IP pública)',
    securityGroup: 'sg-ec2-backend (Solo tráfico desde sg-alb)',
    description: 'Servidores virtuales que procesan la lógica del ERP. No tienen acceso directo a internet excepto salida mediante NAT Gateway.',
  },
  rds: {
    id: 'rds',
    serviceCode: 'RDS',
    title: 'Amazon RDS PostgreSQL (Database Tier)',
    subtitle: 'Subred Aislada de Datos (Multi-AZ)',
    category: 'Base de Datos Persistente',
    cidrOrDns: 'erp-db-primary.rds.amazonaws.com',
    securityGroup: 'sg-rds-db (Solo puerto :5432 desde sg-ec2)',
    description: 'Base de datos transaccional con réplica síncrona en otra zona de disponibilidad (Multi-AZ) para tolerancia a fallos.',
  },
};

export default function AwsNetworkDiagram() {
  const { deployedServices, activeProposal, addService } = useAws();
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const regionLabel = activeProposal?.region ? activeProposal.region : 'Sin región definida';

  const isServiceDeployed = (code?: string): boolean => {
    if (!code) return true;
    if (!deployedServices || deployedServices.length === 0) return false;
    return deployedServices.some((s) => s.toLowerCase() === code.toLowerCase());
  };

  const handleSimulateTraffic = () => {
    if (!activeProposal) return;
    setIsSimulating(true);
    setActiveStep(1);
    setSelectedNode(networkNodesDetails.internet);

    const sequence = [
      { step: 2, key: 'route53', delay: 1000 },
      { step: 3, key: 'cloudfront', delay: 2000 },
      { step: 4, key: 'igw', delay: 3000 },
      { step: 5, key: 'alb', delay: 4000 },
      { step: 6, key: 'ec2', delay: 5000 },
      { step: 7, key: 'rds', delay: 6000 },
    ];

    sequence.forEach(({ step, key, delay }) => {
      setTimeout(() => {
        setActiveStep(step);
        setSelectedNode(networkNodesDetails[key]);
      }, delay);
    });

    setTimeout(() => {
      setIsSimulating(false);
    }, 7200);
  };

  const isStepActive = (stepNum: number) => activeStep === stepNum;

  const getDynamicDescription = (node: NodeDetail): string => {
    const solutionName = activeProposal?.solutionName || 'la aplicación';
    return node.description
      .replace(/la lógica del ERP/g, `la lógica de ${solutionName}`)
      .replace(/del sistema ERP/g, `de ${solutionName}`)
      .replace(/sistema ERP/g, solutionName);
  };

  const isSelectedNodeIncluded = selectedNode ? isServiceDeployed(selectedNode.serviceCode) : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Simulator Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="#2563eb" />
            <span>Diagrama de Red — {regionLabel}</span>
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
            {activeProposal
              ? `Visualizando topología para propuesta: "${activeProposal.solutionName}" (${regionLabel})`
              : 'Sin propuesta activa — Sin región definida'}
          </p>
        </div>

        <button
          onClick={handleSimulateTraffic}
          disabled={!activeProposal || isSimulating}
          title={!activeProposal ? 'Crea o selecciona una propuesta en Planificación para simular peticiones' : undefined}
          style={{
            background: !activeProposal
              ? '#94a3b8'
              : isSimulating
              ? '#64748b'
              : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 16px',
            fontWeight: 700,
            fontSize: 13,
            cursor: !activeProposal || isSimulating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: activeProposal && !isSimulating ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
            opacity: !activeProposal ? 0.65 : 1,
          }}
        >
          <Play size={14} className={isSimulating ? 'spin' : ''} />
          {isSimulating ? 'Simulando flujo de paquetes...' : 'Simular Petición de Usuario'}
        </button>
      </div>

      {/* Main Diagram Canvas + Info Side Panel */}
      <div className="aws-network-grid">
        {/* Visual Architecture Board */}
        <div
          style={{
            background: '#0b1324',
            borderRadius: 16,
            padding: '30px 24px',
            border: '1px solid #1e293b',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Grid Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              pointerEvents: 'none',
            }}
          />

          {/* Level 1: Internet */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.internet)}
            style={{
              width: '100%',
              maxWidth: 480,
              background: isStepActive(1) ? 'rgba(37, 99, 235, 0.35)' : '#1e293b',
              border: isStepActive(1) ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: isStepActive(1) ? '0 0 20px rgba(96, 165, 250, 0.5)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={22} color="#60a5fa" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>INTERNET PÚBLICO</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Usuarios & Clientes Externos (HTTPS :443)</div>
              </div>
            </div>
            <StatusBadge variant="success" status="Incluido" size="sm" />
          </div>

          <div style={{ color: isStepActive(1) || isStepActive(2) ? '#60a5fa' : '#475569', transition: 'color 0.3s ease' }}>
            <ArrowDown size={18} />
          </div>

          {/* Level 2: Route 53 (DNS) */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.route53)}
            style={{
              width: '100%',
              maxWidth: 480,
              background: isStepActive(2) ? 'rgba(245, 158, 11, 0.3)' : '#192237',
              border: isStepActive(2) ? '2px solid #fbbf24' : '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: isStepActive(2) ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none',
              transition: 'all 0.3s ease',
              opacity: isServiceDeployed('Route 53') ? 1 : 0.65,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Radio size={22} color="#fbbf24" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#fef08a' }}>Amazon Route 53</div>
                <div style={{ fontSize: 11, color: '#cbd5e1' }}>DNS Global & Enrutamiento de Baja Latencia</div>
              </div>
            </div>
            <StatusBadge
              variant={isServiceDeployed('Route 53') ? 'success' : 'neutral'}
              status={isServiceDeployed('Route 53') ? 'Incluido' : 'No incluido'}
              size="sm"
            />
          </div>

          <div style={{ color: isStepActive(2) || isStepActive(3) ? '#fbbf24' : '#475569', transition: 'color 0.3s ease' }}>
            <ArrowDown size={18} />
          </div>

          {/* Level 3: CloudFront CDN */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.cloudfront)}
            style={{
              width: '100%',
              maxWidth: 480,
              background: isStepActive(3) ? 'rgba(16, 185, 129, 0.3)' : '#13242f',
              border: isStepActive(3) ? '2px solid #34d399' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: isStepActive(3) ? '0 0 20px rgba(52, 211, 153, 0.5)' : 'none',
              transition: 'all 0.3s ease',
              opacity: isServiceDeployed('CloudFront') ? 1 : 0.65,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={22} color="#34d399" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#a7f3d0' }}>Amazon CloudFront</div>
                <div style={{ fontSize: 11, color: '#cbd5e1' }}>CDN Global + AWS Shield DDoS</div>
              </div>
            </div>
            <StatusBadge
              variant={isServiceDeployed('CloudFront') ? 'success' : 'neutral'}
              status={isServiceDeployed('CloudFront') ? 'Incluido' : 'No incluido'}
              size="sm"
            />
          </div>

          <div style={{ color: isStepActive(3) || isStepActive(4) ? '#34d399' : '#475569', transition: 'color 0.3s ease' }}>
            <ArrowDown size={18} />
          </div>

          {/* Level 4: Internet Gateway (IGW) */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.igw)}
            style={{
              width: '100%',
              maxWidth: 480,
              background: isStepActive(4) ? 'rgba(37, 99, 235, 0.4)' : '#18243b',
              border: isStepActive(4) ? '2px solid #60a5fa' : '1px solid rgba(96, 165, 250, 0.4)',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: isStepActive(4) ? '0 0 20px rgba(96, 165, 250, 0.5)' : 'none',
              transition: 'all 0.3s ease',
              opacity: isServiceDeployed('VPC') ? 1 : 0.65,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Network size={22} color="#60a5fa" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#93c5fd' }}>Internet Gateway (IGW)</div>
                <div style={{ fontSize: 11, color: '#cbd5e1' }}>Puerta de Entrada VPC a Internet</div>
              </div>
            </div>
            <StatusBadge
              variant={isServiceDeployed('VPC') ? 'success' : 'neutral'}
              status={isServiceDeployed('VPC') ? 'Incluido' : 'No incluido'}
              size="sm"
            />
          </div>

          <div style={{ color: isStepActive(4) || isStepActive(5) ? '#60a5fa' : '#475569', transition: 'color 0.3s ease' }}>
            <ArrowDown size={18} />
          </div>

          {/* Level 5: VPC Boundary Box */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.vpc)}
            style={{
              width: '100%',
              maxWidth: 620,
              background: 'rgba(15, 23, 42, 0.92)',
              border: '2px dashed rgba(59, 130, 246, 0.5)',
              borderRadius: 16,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              zIndex: 2,
            }}
          >
            {/* VPC Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#93c5fd', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} color="#60a5fa" />
                Amazon VPC (10.0.0.0/16) • {regionLabel}
              </span>
              <StatusBadge
                variant={isServiceDeployed('VPC') ? 'success' : 'neutral'}
                status={isServiceDeployed('VPC') ? 'Incluido' : 'No incluido'}
                size="sm"
              />
            </div>

            {/* Public Subnet (ALB + NAT Gateway) */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.65)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Subred Pública (10.0.1.0/24 & 10.0.2.0/24)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* ALB Card */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(networkNodesDetails.alb);
                  }}
                  style={{
                    background: isStepActive(5) ? 'rgba(37, 99, 235, 0.45)' : '#1e293b',
                    border: isStepActive(5) ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isServiceDeployed('ALB') ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Layers size={18} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>ALB (Load Balancer)</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Elastic Load Balancing</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <StatusBadge
                      variant={isServiceDeployed('ALB') ? 'success' : 'neutral'}
                      status={isServiceDeployed('ALB') ? 'Incluido' : 'No incluido'}
                      size="sm"
                    />
                    {isServiceDeployed('ALB') && (
                      <span style={{ fontSize: 10.5, color: '#4ade80', fontWeight: 600 }}>● :443 HTTPS</span>
                    )}
                  </div>
                </div>

                {/* NAT Gateway Card */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(networkNodesDetails.nat);
                  }}
                  style={{
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isServiceDeployed('VPC') ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Network size={18} color="#38bdf8" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>NAT Gateway</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Salida a Internet Segura</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <StatusBadge
                      variant={isServiceDeployed('VPC') ? 'success' : 'neutral'}
                      status={isServiceDeployed('VPC') ? 'Incluido' : 'No incluido'}
                      size="sm"
                    />
                    {isServiceDeployed('VPC') && (
                      <span style={{ fontSize: 10.5, color: '#38bdf8', fontWeight: 600 }}>● EIP</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow into Private Subnets */}
            <div style={{ textAlign: 'center', color: isStepActive(5) || isStepActive(6) ? '#60a5fa' : '#475569' }}>
              <ArrowDown size={16} />
            </div>

            {/* Multi-AZ Columns: AZ-a & AZ-b */}
            <div className="aws-planning-fields-grid" style={{ gap: 12 }}>
              {/* AZ-a */}
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.45)',
                  border: '1px dashed rgba(96, 165, 250, 0.3)',
                  borderRadius: 12,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: '#93c5fd', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                  Zona de Disponibilidad A (AZ-a)
                </div>

                {/* Subred Privada A (EC2) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(networkNodesDetails.ec2);
                  }}
                  style={{
                    background: isStepActive(6) ? 'rgba(245, 158, 11, 0.35)' : '#1e293b',
                    border: isStepActive(6) ? '2px solid #fbbf24' : '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isServiceDeployed('EC2') ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Server size={16} color="#fbbf24" />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>EC2 App Tier (Primaria)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>10.0.10.0/24</span>
                    <StatusBadge
                      variant={isServiceDeployed('EC2') ? 'success' : 'neutral'}
                      status={isServiceDeployed('EC2') ? 'Incluido' : 'No incluido'}
                      size="sm"
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center', color: isStepActive(6) || isStepActive(7) ? '#fbbf24' : '#475569' }}>
                  <ArrowDown size={14} />
                </div>

                {/* Subred BD A (RDS) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(networkNodesDetails.rds);
                  }}
                  style={{
                    background: isStepActive(7) ? 'rgba(16, 185, 129, 0.35)' : '#1e293b',
                    border: isStepActive(7) ? '2px solid #34d399' : '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isServiceDeployed('RDS') ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={16} color="#34d399" />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>RDS DB (Primaria R/W)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>10.0.30.0/24</span>
                    <StatusBadge
                      variant={isServiceDeployed('RDS') ? 'success' : 'neutral'}
                      status={isServiceDeployed('RDS') ? 'Incluido' : 'No incluido'}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* AZ-b */}
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.45)',
                  border: '1px dashed rgba(96, 165, 250, 0.3)',
                  borderRadius: 12,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: '#93c5fd', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                  Zona de Disponibilidad B (AZ-b)
                </div>

                {/* Subred Privada B (EC2 Standby) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(networkNodesDetails.ec2);
                  }}
                  style={{
                    background: isStepActive(6) ? 'rgba(245, 158, 11, 0.35)' : '#1e293b',
                    border: isStepActive(6) ? '2px solid #fbbf24' : '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isServiceDeployed('EC2') ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Server size={16} color="#fbbf24" />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>EC2 App Tier (Standby)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>10.0.20.0/24</span>
                    <StatusBadge
                      variant={isServiceDeployed('EC2') ? 'success' : 'neutral'}
                      status={isServiceDeployed('EC2') ? 'Incluido' : 'No incluido'}
                      size="sm"
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center', color: isStepActive(6) || isStepActive(7) ? '#fbbf24' : '#475569' }}>
                  <ArrowDown size={14} />
                </div>

                {/* Subred BD B (RDS Standby Replica) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(networkNodesDetails.rds);
                  }}
                  style={{
                    background: isStepActive(7) ? 'rgba(16, 185, 129, 0.35)' : '#1e293b',
                    border: isStepActive(7) ? '2px solid #34d399' : '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isServiceDeployed('RDS') ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={16} color="#34d399" />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>RDS DB (Réplica Síncrona)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>10.0.40.0/24</span>
                    <StatusBadge
                      variant={isServiceDeployed('RDS') ? 'success' : 'neutral'}
                      status={isServiceDeployed('RDS') ? 'Incluido' : 'No incluido'}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Node Inspector Side Panel (Sticky on desktop, below on mobile) */}
        <div
          className="aws-network-inspector"
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: 22,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 380,
          }}
        >
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                  }}
                >
                  {selectedNode.category}
                </span>
                <StatusBadge
                  variant={isSelectedNodeIncluded ? 'success' : 'neutral'}
                  status={isSelectedNodeIncluded ? 'Incluido' : 'No incluido'}
                  size="sm"
                />
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
                {selectedNode.title}
              </h3>

              <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                {getDynamicDescription(selectedNode)}
              </p>

              {isSelectedNodeIncluded ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Dirección / Endpoint:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                      {selectedNode.cidrOrDns}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Regla Security Group / Enrutamiento:</span>
                    <span style={{ fontWeight: 700, color: '#d97706', fontFamily: 'monospace' }}>
                      {selectedNode.securityGroup}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedNode.serviceCode) {
                        addService(selectedNode.serviceCode);
                      }
                    }}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      width: '100%',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    <Plus size={15} /> Agregar a la solución
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Info size={22} color="#64748b" />
              </div>
              <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
                Configuración de Red
              </h4>
              <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.5, color: '#64748b' }}>
                Selecciona un nodo del diagrama para ver su configuración
              </p>
            </div>
          )}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={14} color="#2563eb" />
            <span>Haz clic en cualquier nodo para inspeccionar sus parámetros.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
