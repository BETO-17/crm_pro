import {
  ShieldCheck,
  Users,
  CheckCircle,
  AlertTriangle,
  Network,
} from 'lucide-react';
import '../aws_admin.css';

interface IamUser {
  username: string;
  role: string;
  mfaEnabled: boolean;
  accessKeyActive: boolean;
  lastActive: string;
  attachedPolicies: string;
}

const iamUsers: IamUser[] = [
  { username: 'admin-lead-jair', role: 'AdministratorAccess', mfaEnabled: true, accessKeyActive: true, lastActive: 'Hoy (En sesión)', attachedPolicies: 'AdministratorAccess' },
  { username: 'dev-analyst-retail', role: 'DataAnalystReadOnly', mfaEnabled: true, accessKeyActive: false, lastActive: 'Hace 2 horas', attachedPolicies: 'AmazonS3ReadOnly, AWSLambdaReadOnly' },
  { username: 'ci-cd-github-actions', role: 'DeployerServiceRole', mfaEnabled: false, accessKeyActive: true, lastActive: 'Hace 10 min', attachedPolicies: 'AmazonEC2FullAccess, AWSLambdaFullAccess' },
];

export default function AwsSeguridadAdmin() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
          Seguridad, Identidad IAM & Redes VPC
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Control de acceso basado en roles (IAM), autenticación multifactor (MFA) y arquitectura de red privada (VPC).
        </p>
      </div>

      {/* Security Status Bar */}
      <div className="aws-admin-grid">
        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Usuarios IAM / Roles</span>
            <div className="aws-card-icon-pill">
              <Users size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">3 Usuarios / 6 Roles</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>100% MFA en cuentas humanas</span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">VPC Principales</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              <Network size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">vpc-08f1a23b (10.0.0.0/16)</div>
          <span style={{ fontSize: 12, color: '#64748b' }}>4 Subnets (2 Públicas, 2 Privadas)</span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Security Groups (Firewall)</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">5 Grupos Activos</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Puerto 22 (SSH) restringido a VPN</span>
        </div>
      </div>

      {/* IAM Users Table */}
      <div className="aws-table-card">
        <div className="aws-table-header">
          <h3 className="aws-table-title">Usuarios IAM y Credenciales de Seguridad</h3>
        </div>

        <table className="aws-admin-table">
          <thead>
            <tr>
              <th>Usuario IAM</th>
              <th>MFA Habilitado</th>
              <th>Access Key (CLI/SDK)</th>
              <th>Políticas Asignadas</th>
              <th>Última Actividad</th>
            </tr>
          </thead>
          <tbody>
            {iamUsers.map((user, idx) => (
              <tr key={idx}>
                <td>
                  <strong style={{ color: '#0f172a' }}>{user.username}</strong>
                </td>
                <td>
                  {user.mfaEnabled ? (
                    <span className="aws-badge-admin aws-badge-success">
                      <CheckCircle size={12} /> Activo (Virtual MFA)
                    </span>
                  ) : (
                    <span className="aws-badge-admin" style={{ background: '#fef3c7', color: '#b45309' }}>
                      <AlertTriangle size={12} /> Service Account
                    </span>
                  )}
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {user.accessKeyActive ? 'AKIA...' : 'Inactiva'}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#475569' }}>{user.attachedPolicies}</td>
                <td style={{ fontSize: 12, color: '#64748b' }}>{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VPC Architecture Box */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={18} color="#2563eb" />
          <span>Topología de Red Virtual (Amazon VPC)</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Subnet Pública 1 (us-east-1a)</div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>10.0.1.0/24 • Internet Gateway attached</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Subnet Pública 2 (us-east-1b)</div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>10.0.2.0/24 • Internet Gateway attached</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Subnet Privada 1 (us-east-1a)</div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>10.0.10.0/24 • NAT Gateway egress only</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Subnet Privada 2 (us-east-1b)</div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>10.0.20.0/24 • NAT Gateway egress only</div>
          </div>
        </div>
      </div>
    </div>
  );
}
