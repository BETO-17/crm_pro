import { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import '../aws_admin.css';

export default function AwsStorageAdmin() {
  const [blockPublicAccessAll, setBlockPublicAccessAll] = useState(true);
  const [autoGlacierTransition, setAutoGlacierTransition] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
          Gobernanza de Almacenamiento & Amazon S3
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Políticas globales de acceso público, políticas de ciclo de vida (Lifecycle Rules) y cifrado AWS-KMS.
        </p>
      </div>

      {/* Security Policies Toggle Panel */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="#059669" />
          <span>Políticas de Seguridad a Nivel de Cuenta S3</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>Bloquear Todo el Acceso Público (S3 Block Public Access)</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Evita que cualquier bucket o dataset sea expuesto inadvertidamente a internet.</div>
            </div>
            <button
              onClick={() => {
                setBlockPublicAccessAll(!blockPublicAccessAll);
                showToast(`Políticas de bloqueo público: ${!blockPublicAccessAll ? 'ACTIVADAS' : 'DESACTIVADAS'}`);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                background: blockPublicAccessAll ? 'rgba(16, 185, 129, 0.15)' : '#f1f5f9',
                color: blockPublicAccessAll ? '#059669' : '#64748b',
              }}
            >
              {blockPublicAccessAll ? '✓ Habilitado (Recomendado)' : 'Deshabilitado'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>Cifrado Obligatorio en Tránsito (TLS 1.2+ HTTPS)</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Rechaza solicitudes HTTP no seguras mediante política de bucket 'aws:SecureTransport'.</div>
            </div>
            <span className="aws-badge-admin aws-badge-success">✓ Enforced</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>Regla de Transición a Amazon S3 Glacier (90 días)</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Mueve automáticamente datasets antiguos a almacenamiento de archivo frío para reducir costos en un 68%.</div>
            </div>
            <button
              onClick={() => {
                setAutoGlacierTransition(!autoGlacierTransition);
                showToast(`Transición automática a Glacier: ${!autoGlacierTransition ? 'ACTIVADA' : 'DESACTIVADA'}`);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                background: autoGlacierTransition ? 'rgba(245, 158, 11, 0.15)' : '#f1f5f9',
                color: autoGlacierTransition ? '#d97706' : '#64748b',
              }}
            >
              {autoGlacierTransition ? '✓ Regla Activa (90d)' : 'Desactivada'}
            </button>
          </div>
        </div>
      </div>

      {/* Storage Classes Breakdown Table */}
      <div className="aws-table-card">
        <div className="aws-table-header">
          <h3 className="aws-table-title">Distribución de Capacidad por Clase de Almacenamiento</h3>
        </div>

        <table className="aws-admin-table">
          <thead>
            <tr>
              <th>Clase de Almacenamiento</th>
              <th>Propósito</th>
              <th>Volumen Almacenado</th>
              <th>Disponibilidad Diseñada</th>
              <th>Costo Mensual / GB</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>S3 Standard</strong></td>
              <td>Acceso frecuente para reportes y tablas activas</td>
              <td>1.84 TB (48%)</td>
              <td>99.999999999% (11 9s)</td>
              <td>$0.023 / GB</td>
            </tr>
            <tr>
              <td><strong>S3 Intelligent-Tiering</strong></td>
              <td>Optimización automática según patrones de lectura</td>
              <td>1.12 TB (29%)</td>
              <td>99.999999999% (11 9s)</td>
              <td>$0.0125 / GB</td>
            </tr>
            <tr>
              <td><strong>S3 Glacier Flexible Archive</strong></td>
              <td>Copias de seguridad históricas y cumplimiento</td>
              <td>0.84 TB (23%)</td>
              <td>99.999999999% (11 9s)</td>
              <td>$0.0036 / GB</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
