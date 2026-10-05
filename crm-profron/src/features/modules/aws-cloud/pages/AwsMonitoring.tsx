import { useState } from 'react';
import {
  CheckCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import AwsCloudWatchLiveTelemetry from '../components/AwsCloudWatchLiveTelemetry';
import '../aws.css';

interface CloudWatchAlarm {
  id: string;
  name: string;
  metric: string;
  condition: string;
  state: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
  lastUpdated: string;
}

const alarms: CloudWatchAlarm[] = [
  {
    id: 'alm-01',
    name: 'EC2-High-CPU-Utilization',
    metric: 'CPUUtilization > 85% for 5 mins',
    condition: '>= 85.0',
    state: 'OK',
    lastUpdated: 'Hace 3 min',
  },
  {
    id: 'alm-02',
    name: 'Lambda-5xx-Error-Spike',
    metric: 'Errors > 5 for 1 min',
    condition: '>= 5.0',
    state: 'OK',
    lastUpdated: 'Hace 10 min',
  },
  {
    id: 'alm-03',
    name: 'S3-Bucket-4xx-Rate',
    metric: '4xxErrors > 50 for 15 mins',
    condition: '>= 50.0',
    state: 'OK',
    lastUpdated: 'Hace 1 hora',
  },
  {
    id: 'alm-04',
    name: 'VPC-NAT-Gateway-PacketDrop',
    metric: 'PacketsDropCount > 10',
    condition: '>= 10.0',
    state: 'OK',
    lastUpdated: 'Hace 4 horas',
  },
];

export default function AwsMonitoring() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleRefresh = () => {
    setToastMsg('Métricas de Amazon CloudWatch sincronizadas ✓');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="aws-container">
      {/* Toast */}
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
            Amazon CloudWatch — Monitoreo & Observabilidad
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Métricas de infraestructura en tiempo real, alarmas automatizadas y logs centralizados.
          </p>
        </div>

        <button className="aws-btn-secondary" onClick={handleRefresh}>
          <RefreshCw size={14} /> Sincronizar Métricas
        </button>
      </div>

      {/* Live Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Estado General</span>
            <span className="aws-chip aws-chip-running">
              <CheckCircle size={12} /> Óptimo
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>100% Saludable</div>
          <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>0 incidentes en las últimas 24h</span>
        </div>

        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Latencia Promedio API</span>
            <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>-4 ms vs ayer</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>24.6 ms</div>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Percentil 95 (p95): 52 ms</span>
        </div>

        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Rendimiento de Red</span>
            <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>1.2 Gbps</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>482 MB/s</div>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Tráfico entrante / saliente</span>
        </div>

        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Alarmas CloudWatch</span>
            <span className="aws-chip aws-chip-running">4 Configuradas</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>0 en Alarma</div>
          <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>Todas en estado normal (OK)</span>
        </div>
      </div>

      {/* CloudWatch Real-Time Live Telemetry Waveforms */}
      <AwsCloudWatchLiveTelemetry />

      {/* Alarms Table */}
      <div className="aws-launchpad">
        <div className="aws-launchpad-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Alarmas de Amazon CloudWatch
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Monitoreo activo para escalado automático y notificaciones de incidentes vía Amazon SNS
            </p>
          </div>
        </div>

        <div className="aws-table-container">
          <table className="aws-table">
            <thead>
              <tr>
                <th>Nombre de la Alarma</th>
                <th>Métrica Monitoreada</th>
                <th>Condición Umbral</th>
                <th>Estado Actual</th>
                <th>Última Evaluación</th>
              </tr>
            </thead>
            <tbody>
              {alarms.map((alarm) => (
                <tr key={alarm.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{alarm.name}</strong>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#334155' }}>{alarm.metric}</td>
                  <td>{alarm.condition}</td>
                  <td>
                    <span className="aws-chip aws-chip-running">
                      <CheckCircle size={12} /> OK
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{alarm.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
