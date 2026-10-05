import { useState } from 'react';
import {
  Server,
  Play,
  Square,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  X,
  Sparkles,
} from 'lucide-react';
import '../aws.css';

interface EC2Instance {
  id: string;
  name: string;
  type: string;
  vCpu: number;
  ramGb: number;
  storageGb: number;
  publicIp: string;
  status: 'running' | 'stopped' | 'pending';
  uptime: string;
  cpuUsage: number;
}

const initialInstances: EC2Instance[] = [
  {
    id: 'i-09f1a23b4c5d6e7f8',
    name: 'erp-core-backend',
    type: 't3.xlarge',
    vCpu: 4,
    ramGb: 16,
    storageGb: 120,
    publicIp: '54.210.88.42',
    status: 'running',
    uptime: '14d 6h',
    cpuUsage: 34,
  },
  {
    id: 'i-01a2b3c4d5e6f7a8b',
    name: 'erp-database-replica',
    type: 'r5.large',
    vCpu: 2,
    ramGb: 16,
    storageGb: 300,
    publicIp: '3.88.192.10',
    status: 'running',
    uptime: '28d 12h',
    cpuUsage: 52,
  },
  {
    id: 'i-0c7f2a1b9d4e5112a',
    name: 'erp-worker-async',
    type: 't3.medium',
    vCpu: 2,
    ramGb: 4,
    storageGb: 60,
    publicIp: '52.14.77.109',
    status: 'running',
    uptime: '5d 1h',
    cpuUsage: 18,
  },
  {
    id: 'i-088192039481726a1',
    name: 'erp-analytics-staging',
    type: 'c5.xlarge',
    vCpu: 4,
    ramGb: 8,
    storageGb: 80,
    publicIp: '—',
    status: 'stopped',
    uptime: '0h',
    cpuUsage: 0,
  },
];

export default function AwsCompute() {
  const [instances, setInstances] = useState<EC2Instance[]>(initialInstances);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form for new instance
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newInstanceType, setNewInstanceType] = useState('t3.medium');
  const [newInstanceAmi, setNewInstanceAmi] = useState('Amazon Linux 2023');
  const [newInstanceStorage, setNewInstanceStorage] = useState(50);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleState = (id: string) => {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const nextState = inst.status === 'running' ? 'stopped' : 'running';
          showToast(`Instancia ${inst.name} cambiada a estado: ${nextState.toUpperCase()}`);
          return {
            ...inst,
            status: nextState,
            cpuUsage: nextState === 'running' ? Math.floor(Math.random() * 40) + 15 : 0,
            publicIp: nextState === 'running' ? `54.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.12` : '—',
          };
        }
        return inst;
      })
    );
  };

  const handleLaunchInstance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstanceName.trim()) return;

    const newInst: EC2Instance = {
      id: `i-0${Math.random().toString(16).substring(2, 18)}`,
      name: newInstanceName.trim().toLowerCase().replace(/\s+/g, '-'),
      type: newInstanceType,
      vCpu: newInstanceType.includes('xlarge') ? 4 : 2,
      ramGb: newInstanceType.includes('xlarge') ? 16 : 4,
      storageGb: Number(newInstanceStorage) || 40,
      publicIp: `54.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}.88`,
      status: 'running',
      uptime: '0m',
      cpuUsage: Math.floor(Math.random() * 20) + 10,
    };

    setInstances([newInst, ...instances]);
    setShowLaunchModal(false);
    setNewInstanceName('');
    showToast(`✓ Instancia EC2 "${newInst.name}" desplegada con éxito`);
  };

  const filtered = instances.filter(
    (inst) =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.type.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            Amazon EC2 — Máquinas Virtuales & Cómputo
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Administra servidores elásticos, monitorea consumo de CPU y escala instancias.
          </p>
        </div>

        <button className="aws-btn-action" onClick={() => setShowLaunchModal(true)}>
          <Plus size={16} /> Lanzar Instancia EC2
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Instancias Running</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {instances.filter((i) => i.status === 'running').length} / {instances.length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>vCPUs Asignadas</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {instances.reduce((acc, curr) => acc + (curr.status === 'running' ? curr.vCpu : 0), 0)} Cores
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Memoria RAM Total</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {instances.reduce((acc, curr) => acc + (curr.status === 'running' ? curr.ramGb : 0), 0)} GB RAM
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="aws-launchpad">
        <div className="aws-launchpad-header">
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, ID o tipo..."
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
                <th>Instancia & ID</th>
                <th>Tipo</th>
                <th>vCPU / RAM</th>
                <th>IP Pública</th>
                <th>Uso CPU</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst) => (
                <tr key={inst.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{inst.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{inst.id}</div>
                  </td>
                  <td>
                    <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                      {inst.type}
                    </span>
                  </td>
                  <td>{inst.vCpu} vCPU • {inst.ramGb} GB</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{inst.publicIp}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}>
                      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${inst.cpuUsage}%`,
                            height: '100%',
                            background: inst.cpuUsage > 75 ? '#ef4444' : inst.cpuUsage > 40 ? '#f59e0b' : '#10b981',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, minWidth: 28 }}>{inst.cpuUsage}%</span>
                    </div>
                  </td>
                  <td>
                    {inst.status === 'running' ? (
                      <span className="aws-chip aws-chip-running">
                        <CheckCircle size={12} /> Running
                      </span>
                    ) : (
                      <span className="aws-chip aws-chip-stopped">
                        <XCircle size={12} /> Stopped
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className={inst.status === 'running' ? 'aws-btn-secondary' : 'aws-btn-action'}
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => handleToggleState(inst.id)}
                    >
                      {inst.status === 'running' ? (
                        <>
                          <Square size={12} color="#dc2626" /> Detener
                        </>
                      ) : (
                        <>
                          <Play size={12} color="#16a34a" /> Iniciar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Launch Modal */}
      {showLaunchModal && (
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
          onClick={() => setShowLaunchModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 520,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Lanzar Instancia Amazon EC2
              </h2>
              <button
                onClick={() => setShowLaunchModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLaunchInstance} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Nombre de la Instancia (Tag: Name)
                </label>
                <input
                  type="text"
                  placeholder="ej. erp-analytics-node-01"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Imagen de Sistema Operativo (AMI)
                </label>
                <select
                  value={newInstanceAmi}
                  onChange={(e) => setNewInstanceAmi(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value="Amazon Linux 2023">Amazon Linux 2023 AMI (HVM, SSD Volume Type)</option>
                  <option value="Ubuntu Server 22.04 LTS">Ubuntu Server 22.04 LTS (HVM, EBS)</option>
                  <option value="Red Hat Enterprise Linux 9">Red Hat Enterprise Linux 9</option>
                  <option value="Windows Server 2022 Base">Microsoft Windows Server 2022 Base</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Tipo de Instancia
                  </label>
                  <select
                    value={newInstanceType}
                    onChange={(e) => setNewInstanceType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value="t3.micro">t3.micro (1 vCPU, 1 GB)</option>
                    <option value="t3.small">t3.small (1 vCPU, 2 GB)</option>
                    <option value="t3.medium">t3.medium (2 vCPU, 4 GB)</option>
                    <option value="t3.xlarge">t3.xlarge (4 vCPU, 16 GB)</option>
                    <option value="c5.xlarge">c5.xlarge (4 vCPU, 8 GB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Almacenamiento EBS (GB)
                  </label>
                  <input
                    type="number"
                    value={newInstanceStorage}
                    onChange={(e) => setNewInstanceStorage(Number(e.target.value))}
                    min={20}
                    max={1000}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="aws-btn-secondary"
                  onClick={() => setShowLaunchModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="aws-btn-action">
                  Lanzar Instancia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
