import { useState } from 'react';
import {
  Play,
  Square,
  Search,
  Sparkles,
  Plus,
  RefreshCw,
  Trash2,
  Moon,
  Zap,
  Server,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import '../aws_admin.css';

interface AdminEC2 {
  id: string;
  name: string;
  type: string;
  asg: string;
  region: string;
  status: 'running' | 'stopped' | 'rebooting' | 'terminating';
  costPerHour: number;
  ipPrivate: string;
  uptime: string;
}

const initialAdminInstances: AdminEC2[] = [
  {
    id: 'i-0a819b2c3d4e5f678',
    name: 'erp-prod-node-01',
    type: 't3.xlarge',
    asg: 'asg-erp-core-prod',
    region: 'us-east-1a',
    status: 'running',
    costPerHour: 0.1664,
    ipPrivate: '10.0.10.42',
    uptime: '18d 4h',
  },
  {
    id: 'i-0b928c3d4e5f6a789',
    name: 'erp-prod-node-02',
    type: 't3.xlarge',
    asg: 'asg-erp-core-prod',
    region: 'us-east-1b',
    status: 'running',
    costPerHour: 0.1664,
    ipPrivate: '10.0.11.88',
    uptime: '18d 4h',
  },
  {
    id: 'i-0c192a3b4c5d6e7f0',
    name: 'erp-analytics-worker-01',
    type: 'c5.2xlarge',
    asg: 'asg-analytics-batch',
    region: 'us-east-1a',
    status: 'running',
    costPerHour: 0.3400,
    ipPrivate: '10.0.10.105',
    uptime: '4d 12h',
  },
  {
    id: 'i-0d283b4c5d6e7f8a1',
    name: 'erp-staging-preview',
    type: 't3.medium',
    asg: 'standalone',
    region: 'sa-east-1a',
    status: 'stopped',
    costPerHour: 0.0416,
    ipPrivate: '10.0.20.14',
    uptime: '0h (Apagado)',
  },
  {
    id: 'i-0e394b5c6d7e8f9a2',
    name: 'erp-dev-sandbox-01',
    type: 't3.micro',
    asg: 'standalone',
    region: 'us-east-1a',
    status: 'stopped',
    costPerHour: 0.0104,
    ipPrivate: '10.0.10.99',
    uptime: '0h (Apagado)',
  },
];

export default function AwsRecursosAdmin() {
  const [instances, setInstances] = useState<AdminEC2[]>(initialAdminInstances);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Instance Modal Form
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('t3.large');
  const [newRegion, setNewRegion] = useState('us-east-1a');
  const [newAsg, setNewAsg] = useState('asg-erp-core-prod');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Start Instance
  const handleStart = (id: string, name: string) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: 'running', uptime: '1m (Iniciado)' } : inst))
    );
    showToast(`🟢 Instancia "${name}" iniciada con éxito. Registrada en ALB.`);
  };

  // Stop Instance
  const handleStop = (id: string, name: string) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: 'stopped', uptime: '0h (Detenido)' } : inst))
    );
    showToast(`⏹️ Instancia "${name}" detenida. Drenando tráfico activo.`);
  };

  // Reboot Instance
  const handleReboot = (id: string, name: string) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: 'rebooting' } : inst))
    );
    showToast(`🔄 Reiniciando instancia "${name}"...`);

    setTimeout(() => {
      setInstances((prev) =>
        prev.map((inst) => (inst.id === id ? { ...inst, status: 'running', uptime: '1m (Reiniciado)' } : inst))
      );
      showToast(`✓ Instancia "${name}" reiniciada y 100% saludable.`);
    }, 2000);
  };

  // Terminate Instance (Kill)
  const handleTerminate = (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de terminar y destruir la instancia EC2 "${name}" (${id})? Esta acción liberará el almacenamiento EBS asociado.`)) {
      return;
    }

    setInstances((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: 'terminating' } : inst))
    );
    showToast(`⚠️ Destruyendo instancia "${name}"...`);

    setTimeout(() => {
      setInstances((prev) => prev.filter((inst) => inst.id !== id));
      showToast(`💥 Instancia "${name}" terminada y desregistrada del clúster.`);
    }, 1800);
  };

  // Bulk Operation 1: Night-time cost savings mode
  const handleNightSavingsMode = () => {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.name.includes('staging') || inst.name.includes('dev') || inst.name.includes('worker')) {
          return { ...inst, status: 'stopped', uptime: '0h (Ahorro Nocturno)' };
        }
        return inst;
      })
    );
    showToast('🌙 Modo Ahorro Nocturno Activado: Instancias Dev & Staging detenidas para recortar facturación.');
  };

  // Bulk Operation 2: Emergency Auto Scaling boost
  const handleEmergencyScale = () => {
    const newId = `i-${Math.random().toString(36).substring(2, 11)}`;
    const newInst: AdminEC2 = {
      id: newId,
      name: `erp-prod-node-boost-${Math.floor(Math.random() * 90 + 10)}`,
      type: 't3.xlarge',
      asg: 'asg-erp-core-prod',
      region: Math.random() > 0.5 ? 'us-east-1a' : 'us-east-1b',
      status: 'running',
      costPerHour: 0.1664,
      ipPrivate: `10.0.10.${Math.floor(Math.random() * 150 + 50)}`,
      uptime: '1m',
    };
    setInstances((prev) => [newInst, ...prev]);
    showToast('🚀 Escalado de Emergencia: +1 Nodo EC2 aprovisionado e inyectado al Auto Scaling Group.');
  };

  // Handle Create New Instance
  const handleCreateInstance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Por favor ingresa un nombre para la instancia.');
      return;
    }

    const typeCosts: Record<string, number> = {
      't3.micro': 0.0104,
      't3.medium': 0.0416,
      't3.large': 0.0832,
      't3.xlarge': 0.1664,
      'c5.2xlarge': 0.3400,
    };

    const newInst: AdminEC2 = {
      id: `i-0${Math.random().toString(36).substring(2, 10)}`,
      name: newName.trim(),
      type: newType,
      asg: newAsg,
      region: newRegion,
      status: 'running',
      costPerHour: typeCosts[newType] || 0.0832,
      ipPrivate: `10.0.10.${Math.floor(Math.random() * 180 + 20)}`,
      uptime: '1m (Recién creada)',
    };

    setInstances([newInst, ...instances]);
    setShowNewModal(false);
    setNewName('');
    showToast(`✓ Nueva instancia "${newInst.name}" desplegada con éxito en ${newInst.region}.`);
  };

  const filtered = instances.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.asg.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'running') return matchesSearch && i.status === 'running';
    if (statusFilter === 'stopped') return matchesSearch && i.status === 'stopped';
    return matchesSearch;
  });

  const totalRunning = instances.filter((i) => i.status === 'running').length;
  const totalHourlySpend = instances
    .filter((i) => i.status === 'running')
    .reduce((acc, curr) => acc + curr.costPerHour, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#0f172a',
            border: '1px solid #2563eb',
            color: '#bfdbfe',
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
          <Sparkles size={16} color="#60a5fa" />
          {toastMsg}
        </div>
      )}

      {/* Header with Provision Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            Flota de Cómputo EC2 & Gestión del Ciclo de Vida
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Panel de control operacional para iniciar, detener, reiniciar o terminar servidores elásticos en tiempo real.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleNightSavingsMode}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: 8,
              padding: '9px 14px',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Moon size={14} color="#6366f1" /> Ahorro Nocturno
          </button>

          <button
            onClick={handleEmergencyScale}
            style={{
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              color: '#2563eb',
              borderRadius: 8,
              padding: '9px 14px',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Zap size={14} /> Auto Scaling Boost (+1)
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 16px',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Plus size={15} /> Aprovisionar Instancia EC2
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="aws-admin-grid">
        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Instancias Activas (Running)</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">{totalRunning} / {instances.length} Nodos</div>
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> {instances.filter((i) => i.status === 'stopped').length} Instancias en reposo (Cero costo de cómputo)
          </span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Costo por Hora de Flota</span>
            <div className="aws-card-icon-pill">
              <Server size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">${totalHourlySpend.toFixed(4)} <span style={{ fontSize: 13, color: '#64748b' }}>/hora</span></div>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Proyección mensual estimada: ${(totalHourlySpend * 730).toFixed(2)} USD
          </span>
        </div>

        <div className="aws-admin-card">
          <div className="aws-card-header-flex">
            <span className="aws-card-stat-label">Grupos Auto Scaling</span>
            <div className="aws-card-icon-pill" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className="aws-card-stat-val">2 Clústeres ASG</div>
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
            Políticas de escalado dinámico por métricas CloudWatch
          </span>
        </div>
      </div>

      {/* Interactive Table with Live Actions */}
      <div className="aws-table-card">
        <div className="aws-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 className="aws-table-title">Flota de Servidores EC2 ({filtered.length})</h3>

            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
              <button
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: statusFilter === 'all' ? '#ffffff' : 'transparent',
                  color: statusFilter === 'all' ? '#2563eb' : '#64748b',
                }}
              >
                Todos ({instances.length})
              </button>
              <button
                onClick={() => setStatusFilter('running')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: statusFilter === 'running' ? '#ffffff' : 'transparent',
                  color: statusFilter === 'running' ? '#16a34a' : '#64748b',
                }}
              >
                Running ({instances.filter((i) => i.status === 'running').length})
              </button>
              <button
                onClick={() => setStatusFilter('stopped')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: statusFilter === 'stopped' ? '#ffffff' : 'transparent',
                  color: statusFilter === 'stopped' ? '#475569' : '#64748b',
                }}
              >
                Stopped ({instances.filter((i) => i.status === 'stopped').length})
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por ID, Tag o ASG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: 12,
              }}
            />
          </div>
        </div>

        <table className="aws-admin-table">
          <thead>
            <tr>
              <th>Instancia ID & IP Privada</th>
              <th>Nombre Tag</th>
              <th>Tipo Hardware</th>
              <th>Grupo ASG</th>
              <th>Zona AZ</th>
              <th>Costo / Hora</th>
              <th>Tiempo Activo</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones en Vivo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inst) => (
              <tr key={inst.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: 12.5 }}>
                    {inst.id}
                  </span>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>IP: {inst.ipPrivate}</div>
                </td>
                <td>
                  <strong style={{ color: '#0f172a' }}>{inst.name}</strong>
                </td>
                <td>
                  <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                    {inst.type}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#475569' }}>{inst.asg}</td>
                <td>{inst.region}</td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>${inst.costPerHour.toFixed(4)}/h</td>
                <td style={{ fontSize: 11.5, color: '#64748b' }}>{inst.uptime}</td>
                <td>
                  {inst.status === 'running' && (
                    <span className="aws-badge-admin aws-badge-success">● Running</span>
                  )}
                  {inst.status === 'stopped' && (
                    <span className="aws-badge-admin" style={{ background: '#f1f5f9', color: '#64748b' }}>● Stopped</span>
                  )}
                  {inst.status === 'rebooting' && (
                    <span className="aws-badge-admin aws-badge-warning">🔄 Rebooting</span>
                  )}
                  {inst.status === 'terminating' && (
                    <span className="aws-badge-admin" style={{ background: '#fee2e2', color: '#dc2626' }}>💥 Terminating</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 5 }}>
                    {inst.status === 'running' ? (
                      <>
                        <button
                          onClick={() => handleStop(inst.id, inst.name)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            color: '#b91c1c',
                          }}
                          title="Detener instancia (Stop)"
                        >
                          <Square size={11} color="#dc2626" /> Detener
                        </button>

                        <button
                          onClick={() => handleReboot(inst.id, inst.name)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            color: '#2563eb',
                          }}
                          title="Reiniciar instancia (Reboot)"
                        >
                          <RefreshCw size={11} color="#2563eb" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStart(inst.id, inst.name)}
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        title="Iniciar instancia (Start)"
                      >
                        <Play size={11} /> Iniciar
                      </button>
                    )}

                    <button
                      onClick={() => handleTerminate(inst.id, inst.name)}
                      style={{
                        background: 'none',
                        border: '1px solid #fecaca',
                        padding: '4px 7px',
                        borderRadius: 6,
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                      title="Terminar y destruir instancia (Kill)"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form: Provision New Instance */}
      {showNewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 28,
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                Aprovisionar Nueva Instancia EC2
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInstance} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Nombre / Tag de la Instancia *
                </label>
                <input
                  type="text"
                  placeholder="ej. erp-microservice-payment-01"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Tipo de Instancia (vCPU / Memoria)
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="t3.micro">t3.micro (2 vCPU, 1 GB RAM) — $0.0104/h</option>
                  <option value="t3.medium">t3.medium (2 vCPU, 4 GB RAM) — $0.0416/h</option>
                  <option value="t3.large">t3.large (2 vCPU, 8 GB RAM) — $0.0832/h</option>
                  <option value="t3.xlarge">t3.xlarge (4 vCPU, 16 GB RAM) — $0.1664/h</option>
                  <option value="c5.2xlarge">c5.2xlarge (8 vCPU, 16 GB RAM) — $0.3400/h</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Zona de Disponibilidad
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="us-east-1a">us-east-1a</option>
                    <option value="us-east-1b">us-east-1b</option>
                    <option value="sa-east-1a">sa-east-1a</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Grupo de Autoescalado
                  </label>
                  <select
                    value={newAsg}
                    onChange={(e) => setNewAsg(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="asg-erp-core-prod">asg-erp-core-prod</option>
                    <option value="asg-analytics-batch">asg-analytics-batch</option>
                    <option value="standalone">standalone (Independiente)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '9px 16px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 18px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Desplegar Instancia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
