import { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  CheckCircle,
  Eye,
  Plus,
} from 'lucide-react';
import '../azure_admin.css';

interface KeyVaultSecret {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  expiresOn: string;
  lastUpdated: string;
}

const initialSecrets: KeyVaultSecret[] = [
  {
    id: 'sec-1',
    name: 'sql-synapse-connection-string',
    type: 'Secret (ConnectionString)',
    enabled: true,
    expiresOn: '2027-12-31',
    lastUpdated: '2026-08-15',
  },
  {
    id: 'sec-2',
    name: 'azure-storage-account-primary-key',
    type: 'Secret (StorageKey)',
    enabled: true,
    expiresOn: 'Nunca',
    lastUpdated: '2026-09-01',
  },
  {
    id: 'sec-3',
    name: 'jwt-auth-private-signing-cert',
    type: 'Certificate (RSA 4096)',
    enabled: true,
    expiresOn: '2027-04-20',
    lastUpdated: '2026-04-20',
  },
  {
    id: 'sec-4',
    name: 'eventhubs-send-listen-token',
    type: 'Secret (SAS Token)',
    enabled: true,
    expiresOn: '2026-11-30',
    lastUpdated: '2026-09-10',
  },
];

export default function AzureSeguridadAdmin() {
  const [secrets, setSecrets] = useState<KeyVaultSecret[]>(initialSecrets);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Seguridad, IAM & Azure Key Vault</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Administración de credenciales, identidades administradas (MSI), certificados y cumplimiento.
          </p>
        </div>
        <button
          className="azure-action-btn-small azure-action-btn-primary"
          onClick={() => {
            const newId = `sec-${Date.now()}`;
            setSecrets((prev) => [
              ...prev,
              {
                id: newId,
                name: `new-secret-${prev.length + 1}`,
                type: 'Secret (Generic)',
                enabled: true,
                expiresOn: '2027-12-31',
                lastUpdated: 'Hoy',
              },
            ]);
          }}
        >
          <Plus size={14} /> Crear Secreto / Llave
        </button>
      </div>

      {/* KPI Cards */}
      <div className="azure-kpi-grid">
        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Puntuación de Seguridad (Score)</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">94%</div>
          <div className="azure-kpi-delta positive">
            <CheckCircle size={12} /> Cumple con CIS Benchmark & ISO 27001
          </div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Secretos en Key Vault</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#0078d4' }}>
              <Key size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">{secrets.length}</div>
          <div className="azure-kpi-delta positive">
            <Lock size={12} /> Cifrado HSM FIPS 140-2 Nivel 2
          </div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Identidades con RBAC Activo</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">12 Roles</div>
          <div className="azure-kpi-delta positive">Principio de privilegio mínimo</div>
        </div>
      </div>

      {/* Key Vault Secrets Table */}
      <div className="azure-table-card">
        <div className="azure-table-header">
          <h3 className="azure-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} color="#0078d4" />
            Secretos y Credenciales en Key Vault (kv-erp-production-01)
          </h3>
        </div>

        <table className="azure-admin-table">
          <thead>
            <tr>
              <th>Nombre del Secreto</th>
              <th>Tipo de Contenido</th>
              <th>Estado</th>
              <th>Fecha de Expiración</th>
              <th>Última Modificación</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {secrets.map((sec) => (
              <tr key={sec.id}>
                <td>
                  <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{sec.name}</strong>
                </td>
                <td style={{ fontSize: 12 }}>{sec.type}</td>
                <td>
                  <span className="azure-status-pill running">
                    ● {sec.enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{sec.expiresOn}</td>
                <td style={{ fontSize: 12, color: '#64748b' }}>{sec.lastUpdated}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="azure-action-btn-small" title="Ver versión actual">
                    <Eye size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
