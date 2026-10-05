import { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  UploadCloud,
  Trash2,
  Lock,
  Globe,
  Sparkles,
  X,
  Layers,
  CheckCircle,
} from 'lucide-react';
import '../aws.css';

interface S3Bucket {
  id: string;
  name: string;
  region: string;
  storageClass: string;
  totalSizeGb: number;
  objectCount: number;
  encryption: 'SSE-S3 (AES-256)' | 'AWS-KMS';
  isPublic: boolean;
  createdDate: string;
}

const initialBuckets: S3Bucket[] = [
  {
    id: 'b-01',
    name: 'erp-analytics-raw-datasets',
    region: 'us-east-1',
    storageClass: 'Standard',
    totalSizeGb: 840,
    objectCount: 14200,
    encryption: 'SSE-S3 (AES-256)',
    isPublic: false,
    createdDate: '2026-01-15',
  },
  {
    id: 'b-02',
    name: 'erp-daily-backups-glacier',
    region: 'us-east-1',
    storageClass: 'Glacier Flexible',
    totalSizeGb: 1420,
    objectCount: 380,
    encryption: 'AWS-KMS',
    isPublic: false,
    createdDate: '2025-11-04',
  },
  {
    id: 'b-03',
    name: 'erp-invoices-and-reports',
    region: 'sa-east-1',
    storageClass: 'Standard',
    totalSizeGb: 195,
    objectCount: 28400,
    encryption: 'SSE-S3 (AES-256)',
    isPublic: false,
    createdDate: '2026-02-20',
  },
  {
    id: 'b-04',
    name: 'erp-public-assets-cdn',
    region: 'us-east-1',
    storageClass: 'Standard',
    totalSizeGb: 45,
    objectCount: 1250,
    encryption: 'SSE-S3 (AES-256)',
    isPublic: true,
    createdDate: '2026-03-01',
  },
];

export default function AwsStorage() {
  const [buckets, setBuckets] = useState<S3Bucket[]>(initialBuckets);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<S3Bucket | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Bucket Form
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketRegion, setNewBucketRegion] = useState('us-east-1');
  const [newBucketEncryption, setNewBucketEncryption] = useState<'SSE-S3 (AES-256)' | 'AWS-KMS'>('SSE-S3 (AES-256)');

  // Upload state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSizeMb, setUploadFileSizeMb] = useState(15);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    const formatted = newBucketName.toLowerCase().replace(/[^a-z0-9-.]/g, '-');
    const newB: S3Bucket = {
      id: `b-${Date.now()}`,
      name: formatted,
      region: newBucketRegion,
      storageClass: 'Standard',
      totalSizeGb: 0,
      objectCount: 0,
      encryption: newBucketEncryption,
      isPublic: false,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setBuckets([newB, ...buckets]);
    setShowCreateModal(false);
    setNewBucketName('');
    showToast(`✓ Bucket S3 "${newB.name}" creado con éxito`);
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBucket || !uploadFileName.trim()) return;

    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id === selectedBucket.id) {
          return {
            ...b,
            objectCount: b.objectCount + 1,
            totalSizeGb: +(b.totalSizeGb + uploadFileSizeMb / 1024).toFixed(2),
          };
        }
        return b;
      })
    );

    setShowUploadModal(false);
    setUploadFileName('');
    showToast(`✓ Archivo "${uploadFileName}" subido exitosamente a ${selectedBucket.name}`);
  };

  const handleDeleteBucket = (id: string, name: string) => {
    setBuckets(buckets.filter((b) => b.id !== id));
    showToast(`Bucket "${name}" eliminado`);
  };

  const filtered = buckets.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Amazon S3 — Almacenamiento de Objetos & Buckets
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Almacena, versiona y asegura datasets analíticos masivos con cifrado server-side.
          </p>
        </div>

        <button className="aws-btn-action" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Crear Bucket S3
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Total Buckets</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{buckets.length} Buckets</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Volumen Total</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {(buckets.reduce((acc, curr) => acc + curr.totalSizeGb, 0) / 1024).toFixed(2)} TB
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Objetos Almacenados</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {buckets.reduce((acc, curr) => acc + curr.objectCount, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="aws-launchpad">
        <div className="aws-launchpad-header">
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar bucket por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
              }}
            />
          </div>
        </div>

        <div className="aws-table-container">
          <table className="aws-table">
            <thead>
              <tr>
                <th>Nombre del Bucket</th>
                <th>Región AWS</th>
                <th>Clase Storage</th>
                <th>Tamaño / Objetos</th>
                <th>Cifrado</th>
                <th>Acceso Público</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bucket) => (
                <tr key={bucket.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Database size={16} color="#f59e0b" />
                      <span>{bucket.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{bucket.region}</span>
                  </td>
                  <td>
                    <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                      {bucket.storageClass}
                    </span>
                  </td>
                  <td>
                    {bucket.totalSizeGb} GB <span style={{ color: '#64748b', fontSize: 11 }}>({bucket.objectCount} obj)</span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#334155' }}>
                      <Lock size={13} color="#059669" /> {bucket.encryption}
                    </span>
                  </td>
                  <td>
                    {bucket.isPublic ? (
                      <span className="aws-chip aws-chip-warning">
                        <Globe size={11} /> Público
                      </span>
                    ) : (
                      <span className="aws-chip aws-chip-running">
                        <Lock size={11} /> Bloqueado (Privado)
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="aws-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => {
                          setSelectedBucket(bucket);
                          setShowUploadModal(true);
                        }}
                      >
                        <UploadCloud size={13} /> Subir
                      </button>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px 6px' }}
                        onClick={() => handleDeleteBucket(bucket.id, bucket.name)}
                        title="Eliminar Bucket"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Bucket Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 500,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Crear Bucket Amazon S3
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBucket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Nombre del Bucket (Debe ser único a nivel global)
                </label>
                <input
                  type="text"
                  placeholder="ej. erp-lakehouse-datalake"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Región de AWS
                </label>
                <select
                  value={newBucketRegion}
                  onChange={(e) => setNewBucketRegion(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value="us-east-1">EE. UU. Este (Norte de Virginia) us-east-1</option>
                  <option value="us-west-2">EE. UU. Oeste (Oregón) us-west-2</option>
                  <option value="sa-east-1">América del Sur (São Paulo) sa-east-1</option>
                  <option value="eu-west-1">Europa (Irlanda) eu-west-1</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Tipo de Cifrado Server-Side
                </label>
                <select
                  value={newBucketEncryption}
                  onChange={(e) => setNewBucketEncryption(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value="SSE-S3 (AES-256)">Cifrado del lado del servidor SSE-S3 (AES-256)</option>
                  <option value="AWS-KMS">AWS Key Management Service (AWS KMS)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="aws-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="aws-btn-action">
                  Crear Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedBucket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 480,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Subir Objeto a S3
                </h2>
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>Bucket: {selectedBucket.name}</span>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadFile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Nombre del Archivo / Dataset
                </label>
                <input
                  type="text"
                  placeholder="ej. sales_2026_q3_raw.csv"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Tamaño Simulado (MB)
                </label>
                <input
                  type="number"
                  value={uploadFileSizeMb}
                  onChange={(e) => setUploadFileSizeMb(Number(e.target.value))}
                  min={1}
                  max={5000}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="aws-btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="aws-btn-action">
                  <UploadCloud size={15} /> Subir Objeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
