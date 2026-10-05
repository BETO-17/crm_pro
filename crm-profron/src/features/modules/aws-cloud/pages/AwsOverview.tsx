import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  Database,
  Zap,
  Activity,
  CheckCircle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Globe,
  Radio,
} from 'lucide-react';
import '../aws.css';

export default function AwsOverview() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('us-east-1 (N. Virginia)');

  return (
    <div className="aws-container">
      {/* Hero Banner */}
      <div className="aws-hero">
        <div className="aws-hero-left">
          <div className="aws-hero-badge">
            <Sparkles size={13} /> Laboratorio Amazon Web Services (AWS)
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>
            Consola de Cómputo & Servicios Cloud AWS
          </h1>
          <p style={{ fontSize: 13.5, opacity: 0.92, margin: 0, maxWidth: 620 }}>
            Entorno dedicado para aprovisionamiento de instancias elásticas EC2, almacenamiento distribuido S3, funciones serverless Lambda y orquestación CloudWatch.
          </p>
        </div>

        <div className="aws-hero-right">
          <div className="aws-region-pill">
            <Radio size={14} color="#f59e0b" className="spin" />
            <Globe size={14} />
            <span>{selectedRegion}</span>
          </div>
          <span style={{ fontSize: 11, opacity: 0.8 }}>Estado de Región: Operacional 99.99%</span>
        </div>
      </div>

      {/* Grid of Main AWS Services */}
      <div className="aws-grid">
        {/* EC2 Card */}
        <div className="aws-card">
          <div>
            <div className="aws-card-icon">
              <Server size={22} />
            </div>
            <h3 className="aws-card-title">Amazon EC2 (Elastic Compute)</h3>
            <p className="aws-card-desc">
              Servidores virtuales escalables en la nube. Configura capacidades de CPU, memoria y almacenamiento en bloque EBS bajo demanda.
            </p>
          </div>
          <div className="aws-card-footer">
            <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={14} /> 4 Instancias Running
            </span>
            <button className="aws-btn-action" onClick={() => navigate('/modules/aws/compute')}>
              Ver EC2 <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* S3 Card */}
        <div className="aws-card">
          <div>
            <div className="aws-card-icon">
              <Database size={22} />
            </div>
            <h3 className="aws-card-title">Amazon S3 (Simple Storage Service)</h3>
            <p className="aws-card-desc">
              Almacenamiento de objetos con escalabilidad líder, disponibilidad de datos y cifrado integrado para backups y data lakes.
            </p>
          </div>
          <div className="aws-card-footer">
            <span style={{ color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Layers size={14} /> 6 Buckets Activos (2.4 TB)
            </span>
            <button className="aws-btn-action" onClick={() => navigate('/modules/aws/storage')}>
              Ver S3 <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Lambda Card */}
        <div className="aws-card">
          <div>
            <div className="aws-card-icon">
              <Zap size={22} />
            </div>
            <h3 className="aws-card-title">AWS Lambda (Serverless)</h3>
            <p className="aws-card-desc">
              Ejecuta código sin aprovisionar ni administrar servidores. Responde a eventos HTTP, colas SQS y triggers en tiempo real.
            </p>
          </div>
          <div className="aws-card-footer">
            <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={14} /> 8 Funciones Desplegadas
            </span>
            <button className="aws-btn-action" onClick={() => navigate('/modules/aws/serverless')}>
              Ver Lambda <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* CloudWatch Card */}
        <div className="aws-card">
          <div>
            <div className="aws-card-icon">
              <Activity size={22} />
            </div>
            <h3 className="aws-card-title">Amazon CloudWatch</h3>
            <p className="aws-card-desc">
              Monitoreo y observabilidad de tus recursos y aplicaciones en AWS e híbridas en tiempo real.
            </p>
          </div>
          <div className="aws-card-footer">
            <span style={{ color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Shield size={14} /> 0 Alarmas Críticas
            </span>
            <button className="aws-btn-action" onClick={() => navigate('/modules/aws/monitoring')}>
              Métricas <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Infrastructure Summary Table */}
      <div className="aws-launchpad">
        <div className="aws-launchpad-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Estado del Clúster y Recursos Recientes
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Monitoreo consolidado de infraestructura conectada a la cuenta de laboratorio
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                background: '#ffffff',
                color: '#334155',
              }}
            >
              <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
              <option value="us-west-2 (Oregon)">us-west-2 (Oregon)</option>
              <option value="sa-east-1 (São Paulo)">sa-east-1 (São Paulo)</option>
              <option value="eu-west-1 (Ireland)">eu-west-1 (Ireland)</option>
            </select>
          </div>
        </div>

        <div className="aws-table-container">
          <table className="aws-table">
            <thead>
              <tr>
                <th>Recurso / ID</th>
                <th>Servicio</th>
                <th>Tipo / Configuración</th>
                <th>Zona / Región</th>
                <th>Estado</th>
                <th>Latencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>i-0a8b9c1d2e3f4001</strong> (erp-api-prod)</td>
                <td>Amazon EC2</td>
                <td>t3.xlarge (4 vCPU, 16 GB)</td>
                <td>us-east-1a</td>
                <td><span className="aws-chip aws-chip-running">● Running</span></td>
                <td>12 ms</td>
              </tr>
              <tr>
                <td><strong>i-0c7f2a1b9d4e5112</strong> (erp-worker-queue)</td>
                <td>Amazon EC2</td>
                <td>t3.medium (2 vCPU, 4 GB)</td>
                <td>us-east-1b</td>
                <td><span className="aws-chip aws-chip-running">● Running</span></td>
                <td>14 ms</td>
              </tr>
              <tr>
                <td><strong>arn:aws:s3:::erp-analytics-raw</strong></td>
                <td>Amazon S3</td>
                <td>Standard • AES-256</td>
                <td>us-east-1</td>
                <td><span className="aws-chip aws-chip-running">● Disponible</span></td>
                <td>8 ms</td>
              </tr>
              <tr>
                <td><strong>fn-order-processor-v2</strong></td>
                <td>AWS Lambda</td>
                <td>Node.js 20.x • 512 MB</td>
                <td>us-east-1</td>
                <td><span className="aws-chip aws-chip-running">● Activo</span></td>
                <td>45 ms (p95)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
