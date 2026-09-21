import { useState } from 'react';
import {
  Database,
  HardDrive,
  FolderPlus,
  Search,
  Lock,
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import '../azure_admin.css';

interface StorageContainer {
  id: string;
  account: string;
  name: string;
  accessTier: 'Hot' | 'Cool' | 'Archive';
  blobCount: number;
  sizeGB: number;
  publicAccess: 'Private' | 'Blob' | 'Container';
  lastModified: string;
}

const initialContainers: StorageContainer[] = [
  {
    id: 'cnt-1',
    account: 'erpeaststorage01',
    name: 'raw-telemetry-data',
    accessTier: 'Hot',
    blobCount: 142050,
    sizeGB: 840.5,
    publicAccess: 'Private',
    lastModified: '2026-09-20 22:40',
  },
  {
    id: 'cnt-2',
    account: 'erpeaststorage01',
    name: 'processed-analytics-parquet',
    accessTier: 'Hot',
    blobCount: 28910,
    sizeGB: 1250.0,
    publicAccess: 'Private',
    lastModified: '2026-09-21 00:15',
  },
  {
    id: 'cnt-3',
    account: 'erplakestoragedl2',
    name: 'machine-learning-models',
    accessTier: 'Cool',
    blobCount: 420,
    sizeGB: 95.2,
    publicAccess: 'Private',
    lastModified: '2026-09-18 14:10',
  },
  {
    id: 'cnt-4',
    account: 'erpeaststorage01',
    name: 'public-export-reports',
    accessTier: 'Hot',
    blobCount: 1540,
    sizeGB: 18.4,
    publicAccess: 'Blob',
    lastModified: '2026-09-21 01:00',
  },
  {
    id: 'cnt-5',
    account: 'erplakestoragedl2',
    name: 'historical-backups-2025',
    accessTier: 'Archive',
    blobCount: 89000,
    sizeGB: 4120.8,
    publicAccess: 'Private',
    lastModified: '2026-01-05 10:00',
  },
];

export default function AzureStorageAdmin() {
  const [containers, setContainers] = useState<StorageContainer[]>(initialContainers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  const filtered = containers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = filterTier === 'all' || c.accessTier === filterTier;
    return matchSearch && matchTier;
  });

  const totalStorageGB = containers.reduce((acc, c) => acc + c.sizeGB, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Azure Blob Storage & Data Lake Gen2</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Administración de cuentas de almacenamiento, contenedores de blobs y niveles de acceso en la nube.
          </p>
        </div>
        <button
          className="azure-action-btn-small azure-action-btn-primary"
          onClick={() => {
            const newId = `cnt-${Date.now()}`;
            setContainers((prev) => [
              ...prev,
              {
                id: newId,
                account: 'erpeaststorage01',
                name: `new-container-${prev.length + 1}`,
                accessTier: 'Hot',
                blobCount: 0,
                sizeGB: 0.1,
                publicAccess: 'Private',
                lastModified: 'Justo ahora',
              },
            ]);
          }}
        >
          <FolderPlus size={14} /> Crear Contenedor
        </button>
      </div>

      {/* Overview Cards */}
      <div className="azure-kpi-grid">
        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Almacenamiento Total</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#0078d4' }}>
              <HardDrive size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">{(totalStorageGB / 1024).toFixed(2)} TB</div>
          <div className="azure-kpi-delta positive">
            <Database size={12} /> 2 Cuentas Storage Activas
          </div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Total de Blobs / Archivos</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">
            {containers.reduce((acc, c) => acc + c.blobCount, 0).toLocaleString()}
          </div>
          <div className="azure-kpi-delta positive">
            <UploadCloud size={12} /> Ingesta continua en tiempo real
          </div>
        </div>

        <div className="azure-kpi-card">
          <div className="azure-kpi-header">
            <span className="azure-kpi-label">Seguridad & Encriptación</span>
            <div className="azure-kpi-icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <Lock size={18} />
            </div>
          </div>
          <div className="azure-kpi-value">TLS 1.3 / AES-256</div>
          <div className="azure-kpi-delta positive">
            <CheckCircle2 size={12} /> Claves administradas por Microsoft
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="topbar-search" style={{ minWidth: 260 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar por contenedor o cuenta de storage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          style={{ width: 180, height: 38 }}
        >
          <option value="all">Todos los niveles</option>
          <option value="Hot">Hot (Frecuente)</option>
          <option value="Cool">Cool (Poco frecuente)</option>
          <option value="Archive">Archive (Archivo)</option>
        </select>
      </div>

      {/* Storage Containers Table */}
      <div className="azure-table-card">
        <div className="azure-table-header">
          <h3 className="azure-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} color="#0078d4" />
            Contenedores en Producción ({filtered.length})
          </h3>
        </div>

        <table className="azure-admin-table">
          <thead>
            <tr>
              <th>Nombre del Contenedor</th>
              <th>Cuenta Storage</th>
              <th>Nivel de Acceso</th>
              <th>Blobs</th>
              <th>Tamaño (GB)</th>
              <th>Acceso Público</th>
              <th>Última Modificación</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong style={{ color: '#0f172a' }}>{c.name}</strong>
                </td>
                <td>
                  <code>{c.account}</code>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background:
                        c.accessTier === 'Hot'
                          ? '#eff6ff'
                          : c.accessTier === 'Cool'
                          ? '#f0fdf4'
                          : '#fef3c7',
                      color:
                        c.accessTier === 'Hot'
                          ? '#1d4ed8'
                          : c.accessTier === 'Cool'
                          ? '#15803d'
                          : '#b45309',
                    }}
                  >
                    {c.accessTier}
                  </span>
                </td>
                <td>{c.blobCount.toLocaleString()}</td>
                <td>
                  <strong>{c.sizeGB.toFixed(1)} GB</strong>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 12,
                      color: c.publicAccess === 'Private' ? '#16a34a' : '#ea580c',
                      fontWeight: 500,
                    }}
                  >
                    {c.publicAccess === 'Private' ? '🔒 Privado' : '🌐 ' + c.publicAccess}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#64748b' }}>{c.lastModified}</td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="azure-action-btn-small"
                    onClick={() => setContainers((prev) => prev.filter((item) => item.id !== c.id))}
                    title="Eliminar contenedor"
                  >
                    <Trash2 size={12} color="#dc2626" />
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
