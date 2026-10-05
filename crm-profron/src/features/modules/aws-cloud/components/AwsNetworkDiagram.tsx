import { useState } from 'react';
import {
  Globe,
  Radio,
  Server,
  Database,
  Shield,
  Layers,
  ArrowDown,
  CheckCircle2,
  Play,
  Info,
} from 'lucide-react';

interface NodeDetail {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  cidrOrDns: string;
  securityGroup: string;
  description: string;
  status: 'Healthy' | 'Active' | 'Standby';
}

const networkNodesDetails: Record<string, NodeDetail> = {
  internet: {
    id: 'internet',
    title: 'Internet Público & Clientes Globales',
    subtitle: 'Trafico Entrante HTTPS (443)',
    category: 'Acceso Externo',
    cidrOrDns: '0.0.0.0/0',
    securityGroup: 'N/A',
    description: 'Navegadores web, aplicaciones móviles y clientes del sistema ERP accediendo desde cualquier ubicación geográfica.',
    status: 'Active',
  },
  route53: {
    id: 'route53',
    title: 'Amazon Route 53 (DNS Global)',
    subtitle: 'Enrutamiento de Dominio erpxmetrics360.com',
    category: 'DNS & Latency Routing',
    cidrOrDns: 'erpxmetrics360.com (Alias A Record)',
    securityGroup: 'AWS Shield Standard',
    description: 'Resuelve peticiones DNS con comprobación de estado de salud (Health Checks) y enruta tráfico hacia la distribución CloudFront más cercana.',
    status: 'Healthy',
  },
  cloudfront: {
    id: 'cloudfront',
    title: 'Amazon CloudFront (Edge CDN)',
    subtitle: 'Caché Global y Terminación SSL',
    category: 'Content Delivery Network',
    cidrOrDns: 'd1234abcd.cloudfront.net',
    securityGroup: 'AWS WAF (Web Application Firewall)',
    description: 'Distribución perimetral de contenido estático (React bundle, imágenes) y proxy inverso seguro hacia el Application Load Balancer de la VPC.',
    status: 'Healthy',
  },
  vpc: {
    id: 'vpc',
    title: 'Amazon VPC (Virtual Private Cloud)',
    subtitle: 'Red Aislada Corporativa (10.0.0.0/16)',
    category: 'Network Boundary',
    cidrOrDns: '10.0.0.0/16 (2 Zonas de Disponibilidad)',
    securityGroup: 'Network ACLs (NACLs)',
    description: 'Espacio de red privado lógicamente aislado en la región us-east-1 donde residen los balanceadores, servidores EC2 y la base de datos RDS.',
    status: 'Healthy',
  },
  alb: {
    id: 'alb',
    title: 'Application Load Balancer (ALB Público)',
    subtitle: 'Subred Pública (10.0.1.0/24 & 10.0.2.0/24)',
    category: 'Balanceo de Carga L7',
    cidrOrDns: 'alb-prod-19284.us-east-1.elb.amazonaws.com',
    securityGroup: 'sg-alb-public (Permite :443 desde CloudFront)',
    description: 'Recibe tráfico desde internet a través del Internet Gateway y distribuye peticiones uniformemente hacia el grupo de instancias EC2.',
    status: 'Healthy',
  },
  ec2: {
    id: 'ec2',
    title: 'Amazon EC2 Auto Scaling Group (App Tier)',
    subtitle: 'Subred Privada (10.0.10.0/24 & 10.0.20.0/24)',
    category: 'Cómputo Backend',
    cidrOrDns: '10.0.10.42 / 10.0.20.88 (Sin IP pública)',
    securityGroup: 'sg-ec2-backend (Solo tráfico desde sg-alb)',
    description: 'Servidores virtuales que procesan la lógica del ERP. No tienen acceso directo a internet excepto salida mediante NAT Gateway.',
    status: 'Healthy',
  },
  rds: {
    id: 'rds',
    title: 'Amazon RDS PostgreSQL (Database Tier)',
    subtitle: 'Subred Aislada de Datos (Multi-AZ)',
    category: 'Base de Datos Persistente',
    cidrOrDns: 'erp-db-primary.c83j1.us-east-1.rds.amazonaws.com',
    securityGroup: 'sg-rds-db (Solo puerto :5432 desde sg-ec2)',
    description: 'Base de datos transaccional con réplica síncrona en otra zona de disponibilidad (Multi-AZ) para tolerancia a fallos.',
    status: 'Healthy',
  },
};

export default function AwsNetworkDiagram() {
  const [selectedNode, setSelectedNode] = useState<NodeDetail>(networkNodesDetails.ec2);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateTraffic = () => {
    setIsSimulating(true);
    setActiveStep(1); // Internet
    setSelectedNode(networkNodesDetails.internet);

    const sequence = [
      { step: 2, key: 'route53', delay: 1000 },
      { step: 3, key: 'cloudfront', delay: 2000 },
      { step: 4, key: 'alb', delay: 3000 },
      { step: 5, key: 'ec2', delay: 4000 },
      { step: 6, key: 'rds', delay: 5000 },
    ];

    sequence.forEach(({ step, key, delay }) => {
      setTimeout(() => {
        setActiveStep(step);
        setSelectedNode(networkNodesDetails[key]);
      }, delay);
    });

    setTimeout(() => {
      setIsSimulating(false);
    }, 6200);
  };

  const isStepActive = (stepNum: number) => activeStep === stepNum;

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
            <span>Diagrama Interactivo de Arquitectura de Red AWS</span>
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
            Flujo de tráfico seguro desde Internet ➔ DNS Route 53 ➔ CloudFront CDN ➔ VPC ➔ Cómputo EC2 ➔ Base de Datos RDS.
          </p>
        </div>

        <button
          onClick={handleSimulateTraffic}
          disabled={isSimulating}
          style={{
            background: isSimulating ? '#64748b' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 16px',
            fontWeight: 700,
            fontSize: 13,
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}
        >
          <Play size={14} className={isSimulating ? 'spin' : ''} />
          {isSimulating ? 'Simulando flujo de paquetes...' : 'Simular Petición de Usuario'}
        </button>
      </div>

      {/* Main Diagram Canvas + Info Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20 }}>
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
            gap: 20,
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
              background: isStepActive(1) ? 'rgba(37, 99, 235, 0.35)' : '#1e293b',
              border: isStepActive(1) ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              padding: '12px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: isStepActive(1) ? '0 0 20px rgba(96, 165, 250, 0.5)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <Globe size={22} color="#60a5fa" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>INTERNET PÚBLICO</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Usuarios & Clientes (HTTPS :443)</div>
            </div>
          </div>

          <div style={{ color: isStepActive(1) || isStepActive(2) ? '#60a5fa' : '#475569', transition: 'color 0.3s ease' }}>
            <ArrowDown size={20} />
          </div>

          {/* Level 2: Route 53 (DNS) */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.route53)}
            style={{
              background: isStepActive(2) ? 'rgba(245, 158, 11, 0.3)' : '#192237',
              border: isStepActive(2) ? '2px solid #fbbf24' : '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 12,
              padding: '12px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: isStepActive(2) ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <Radio size={22} color="#fbbf24" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#fef08a' }}>Amazon Route 53</div>
              <div style={{ fontSize: 11, color: '#cbd5e1' }}>DNS Global & Latency Routing</div>
            </div>
          </div>

          <div style={{ color: isStepActive(2) || isStepActive(3) ? '#fbbf24' : '#475569', transition: 'color 0.3s ease' }}>
            <ArrowDown size={20} />
          </div>

          {/* Level 3: CloudFront CDN */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.cloudfront)}
            style={{
              background: isStepActive(3) ? 'rgba(16, 185, 129, 0.3)' : '#13242f',
              border: isStepActive(3) ? '2px solid #34d399' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: '12px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: isStepActive(3) ? '0 0 20px rgba(52, 211, 153, 0.5)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <Shield size={22} color="#34d399" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#a7f3d0' }}>Amazon CloudFront</div>
              <div style={{ fontSize: 11, color: '#cbd5e1' }}>CDN Global + AWS Shield DDoS</div>
            </div>
          </div>

          <div style={{ color: isStepActive(3) || isStepActive(4) ? '#34d399' : '#475569', transition: 'color 0.3s ease' }}>
            <ArrowDown size={20} />
          </div>

          {/* Level 4: VPC Boundary Box */}
          <div
            onClick={() => setSelectedNode(networkNodesDetails.vpc)}
            style={{
              width: '100%',
              maxWidth: 580,
              background: 'rgba(15, 23, 42, 0.85)',
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
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#93c5fd', letterSpacing: '0.5px' }}>
                🛡️ Amazon VPC (10.0.0.0/16) • Región us-east-1
              </span>
              <span style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.2)', color: '#bfdbfe', padding: '2px 8px', borderRadius: 10 }}>
                Internet Gateway Active
              </span>
            </div>

            {/* Public Subnet (ALB) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(networkNodesDetails.alb);
              }}
              style={{
                background: isStepActive(4) ? 'rgba(37, 99, 235, 0.4)' : '#1e293b',
                border: isStepActive(4) ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={20} color="#60a5fa" />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>Subred Pública (10.0.1.0/24)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Application Load Balancer (ALB)</div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>● :443 HTTPS</span>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', color: isStepActive(4) || isStepActive(5) ? '#60a5fa' : '#475569' }}>
              <ArrowDown size={16} />
            </div>

            {/* Private Subnet (EC2 Compute Tier) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(networkNodesDetails.ec2);
              }}
              style={{
                background: isStepActive(5) ? 'rgba(245, 158, 11, 0.35)' : '#1e293b',
                border: isStepActive(5) ? '2px solid #fbbf24' : '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 10,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={20} color="#fbbf24" />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>Subred Privada (10.0.10.0/24)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Amazon EC2 Auto Scaling (App Tier)</div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#fef08a', fontWeight: 600 }}>sg-ec2-backend</span>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', color: isStepActive(5) || isStepActive(6) ? '#fbbf24' : '#475569' }}>
              <ArrowDown size={16} />
            </div>

            {/* Isolated DB Subnet (RDS PostgreSQL Tier) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(networkNodesDetails.rds);
              }}
              style={{
                background: isStepActive(6) ? 'rgba(16, 185, 129, 0.35)' : '#1e293b',
                border: isStepActive(6) ? '2px solid #34d399' : '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 10,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={20} color="#34d399" />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>Subred de Base de Datos (10.0.20.0/24)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Amazon RDS PostgreSQL (Multi-AZ)</div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 600 }}>:5432 Cifrado</span>
            </div>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: 22,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
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
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} /> {selectedNode.status}
              </span>
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
              {selectedNode.title}
            </h3>

            <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              {selectedNode.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Dirección / Endpoint:</span>
                <span style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                  {selectedNode.cidrOrDns}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Regla Security Group / Firewall:</span>
                <span style={{ fontWeight: 700, color: '#d97706', fontFamily: 'monospace' }}>
                  {selectedNode.securityGroup}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={14} color="#2563eb" />
            <span>Haz clic en cualquier nodo del diagrama para inspeccionar su configuración.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
