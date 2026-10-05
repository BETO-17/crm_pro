import { useState } from 'react';
import {
  Lock,
  AlertTriangle,
  CheckCircle,
  Server,
} from 'lucide-react';
import { securityResponsibilityItems } from '../data/awsRegionsData';

export default function AwsSecurityMatrix() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'iam' | 'compliance'>('matrix');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            background: activeTab === 'matrix' ? '#2563eb' : '#ffffff',
            color: activeTab === 'matrix' ? '#ffffff' : '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🛡️ Modelo de Responsabilidad Compartida
        </button>

        <button
          onClick={() => setActiveTab('iam')}
          style={{
            background: activeTab === 'iam' ? '#2563eb' : '#ffffff',
            color: activeTab === 'iam' ? '#ffffff' : '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🔑 AWS IAM & Control de Acceso
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          style={{
            background: activeTab === 'compliance' ? '#2563eb' : '#ffffff',
            color: activeTab === 'compliance' ? '#ffffff' : '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          📋 Cifrado, Datos y Cumplimiento
        </button>
      </div>

      {/* TAB 1: Shared Responsibility Matrix */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Header Concept Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
            }}
          >
            <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid #bfdbfe', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                <Server size={18} />
                <span>Seguridad 'DE' la Nube (Responsabilidad de AWS)</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                AWS protege la infraestructura física global: centros de datos, hardware de cómputo, almacenamiento, redes y el software del hipervisor.
              </p>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid #fde68a', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                <Lock size={18} />
                <span>Seguridad 'EN' la Nube (Responsabilidad del Cliente)</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                El cliente gestiona la seguridad de sus datos, usuarios IAM, cifrado de contenido, configuración de sistemas operativos y reglas de firewall.
              </p>
            </div>
          </div>

          {/* Detailed Responsibilities Table with Traffic Lights */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                Matriz de Control y Semáforo de Cumplimiento
              </h3>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, fontWeight: 700 }}>
                <span style={{ color: '#16a34a' }}>🟢 Correcto</span>
                <span style={{ color: '#d97706' }}>🟡 Requiere Revisión</span>
                <span style={{ color: '#dc2626' }}>🔴 Problema</span>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', width: '22%' }}>Dominio de Seguridad</th>
                  <th style={{ padding: '12px 18px', width: '28%' }}>Garantía de AWS</th>
                  <th style={{ padding: '12px 18px', width: '32%' }}>Responsabilidad del Cliente</th>
                  <th style={{ padding: '12px 18px', width: '18%' }}>Estado Actual</th>
                </tr>
              </thead>
              <tbody>
                {securityResponsibilityItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }}>
                      {item.domain}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12.5 }}>
                      {item.awsResponsibility}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontSize: 12.5 }}>
                      {item.customerResponsibility}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {item.customerStatus === 'correct' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', fontWeight: 700, fontSize: 11 }}>
                          <CheckCircle size={13} /> {item.statusLabel}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 700, fontSize: 11 }}>
                          <AlertTriangle size={13} /> {item.statusLabel}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: IAM Identity & Access Management */}
      {activeTab === 'iam' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Cuenta Root Bloqueada</span>
                <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                  ✓ Seguro
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Sin Access Keys activas. MFA con llave física YubiKey.</p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>MFA Obligatorio en IAM</span>
                <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                  ✓ 100% Enforced
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Todos los analistas y administradores autentican con TOTP.</p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Roles de Instancia (EC2 Roles)</span>
                <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                  ✓ Sin credenciales hardcodeadas
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Tokens temporales renovados automáticamente por STS.</p>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              Principales Políticas IAM Aplicadas en el Entorno ERP
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#1e293b', fontSize: 13 }}>ERP-DataAnalyst-ReadOnly-Policy</strong>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>Permite lectura en S3 analytics y ejecución de consultas en Athena.</div>
                </div>
                <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>4 Usuarios Asignados</span>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#1e293b', fontSize: 13 }}>ERP-Backend-EC2-S3Access-Role</strong>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>Permite a los servidores backend subir facturas y reportes al bucket S3.</div>
                </div>
                <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>2 Instancias Asignadas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Compliance & Data Protection */}
      {activeTab === 'compliance' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            Estándares de Cumplimiento & Encriptación de Datos
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13.5, marginBottom: 4 }}>ISO/IEC 27001 & SOC 2</div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Auditorías anuales independientes que certifican la seguridad de la infraestructura AWS.</p>
            </div>

            <div style={{ padding: 16, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13.5, marginBottom: 4 }}>Cifrado en Tránsito (TLS 1.3)</div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Certificados SSL/TLS gratuitos administrados por AWS Certificate Manager (ACM).</p>
            </div>

            <div style={{ padding: 16, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13.5, marginBottom: 4 }}>Protección contra Pérdida de Datos</div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Snapshots automáticos de Amazon RDS y S3 Versioning habilitados contra ransomware.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
