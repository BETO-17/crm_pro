import { useState } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  Plus,
  Search,
  Trash2,
  Cpu,
  Globe,
} from 'lucide-react';
import '../azure_admin.css';

interface VMResource {
  id: string;
  name: string;
  type: string;
  size: string;
  region: string;
  ip: string;
  status: 'running' | 'stopped' | 'updating';
  cpuUsage: string;
}

const initialVMs: VMResource[] = [
  {
    id: 'vm-1',
    name: 'azure-spark-master-01',
    type: 'Virtual Machine',
    size: 'Standard_D4s_v5 (4 vCPU, 16 GB)',
    region: 'East US 2',
    ip: '10.0.1.4',
    status: 'running',
    cpuUsage: '38%',
  },
  {
    id: 'vm-2',
    name: 'azure-spark-worker-01',
    type: 'Virtual Machine',
    size: 'Standard_D8s_v5 (8 vCPU, 32 GB)',
    region: 'East US 2',
    ip: '10.0.1.5',
    status: 'running',
    cpuUsage: '64%',
  },
  {
    id: 'vm-3',
    name: 'azure-spark-worker-02',
    type: 'Virtual Machine',
    size: 'Standard_D8s_v5 (8 vCPU, 32 GB)',
    region: 'East US 2',
    ip: '10.0.1.6',
    status: 'running',
    cpuUsage: '58%',
  },
  {
    id: 'vm-4',
    name: 'azure-analytics-gateway',
    type: 'Application Gateway',
    size: 'Standard_v2 (WAF enabled)',
    region: 'East US 2',
    ip: '20.42.18.99',
    status: 'running',
    cpuUsage: '14%',
  },
  {
    id: 'vm-5',
    name: 'azure-backup-vm-staging',
    type: 'Virtual Machine',
    size: 'Standard_B2s (2 vCPU, 4 GB)',
    region: 'West Europe',
    ip: '10.2.0.8',
    status: 'stopped',
    cpuUsage: '0%',
  },
];

export default function AzureRecursosAdmin() {
  const [vms, setVms] = useState<VMResource[]>(initialVMs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');

  const toggleVMStatus = (id: string) => {
    setVms((prev) =>
      prev.map((vm) => {
        if (vm.id === id) {
          const nextStatus = vm.status === 'running' ? 'stopped' : 'running';
          return {
            ...vm,
            status: nextStatus,
            cpuUsage: nextStatus === 'running' ? '25%' : '0%',
          };
        }
        return vm;
      })
    );
  };

  const restartVM = (id: string) => {
    setVms((prev) =>
      prev.map((vm) => (vm.id === id ? { ...vm, status: 'updating' } : vm))
    );
    setTimeout(() => {
      setVms((prev) =>
        prev.map((vm) => (vm.id === id ? { ...vm, status: 'running' } : vm))
      );
    }, 1500);
  };

  const deleteVM = (id: string) => {
    setVms((prev) => prev.filter((vm) => vm.id !== id));
  };

  const filtered = vms.filter((vm) => {
    const matchSearch =
      vm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vm.ip.includes(searchTerm);
    const matchRegion = filterRegion === 'all' || vm.region.includes(filterRegion);
    return matchSearch && matchRegion;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Recursos Cloud & Máquinas Virtuales</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Administración del ciclo de vida de instancias de cómputo, clústeres Spark y escalado en Azure.
          </p>
        </div>
        <button
          className="azure-action-btn-small azure-action-btn-primary"
          onClick={() => {
            const newId = `vm-${Date.now()}`;
            setVms((prev) => [
              ...prev,
              {
                id: newId,
                name: `azure-vm-custom-${prev.length + 1}`,
                type: 'Virtual Machine',
                size: 'Standard_D4s_v5 (4 vCPU, 16 GB)',
                region: 'East US 2',
                ip: `10.0.1.${prev.length + 10}`,
                status: 'running',
                cpuUsage: '12%',
              },
            ]);
          }}
        >
          <Plus size={14} /> Nueva Instancia VM
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="topbar-search" style={{ minWidth: 260 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar por nombre de VM o IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          style={{ width: 180, height: 38 }}
        >
          <option value="all">Todas las regiones</option>
          <option value="East US">East US 2</option>
          <option value="West Europe">West Europe</option>
        </select>
      </div>

      {/* Resources Table */}
      <div className="azure-table-card">
        <div className="azure-table-header">
          <h3 className="azure-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={18} color="#0078d4" />
            Instancias Aprovisionadas ({filtered.length})
          </h3>
        </div>

        <table className="azure-admin-table">
          <thead>
            <tr>
              <th>Nombre del Recurso</th>
              <th>Tamaño / Tier</th>
              <th>Región</th>
              <th>IP Privada / Pública</th>
              <th>Uso CPU</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((vm) => (
              <tr key={vm.id}>
                <td>
                  <strong style={{ color: '#0f172a' }}>{vm.name}</strong>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{vm.type}</div>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                    {vm.size}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <Globe size={13} color="#64748b" /> {vm.region}
                  </span>
                </td>
                <td>
                  <code>{vm.ip}</code>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Cpu size={13} color={Number(vm.cpuUsage.replace('%', '')) > 60 ? '#f59e0b' : '#0078d4'} />
                    {vm.cpuUsage}
                  </span>
                </td>
                <td>
                  <span
                    className={`azure-status-pill ${
                      vm.status === 'running'
                        ? 'running'
                        : vm.status === 'stopped'
                        ? 'stopped'
                        : 'updating'
                    }`}
                  >
                    ● {vm.status === 'running' ? 'En ejecución' : vm.status === 'stopped' ? 'Detenido' : 'Reiniciando'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      className="azure-action-btn-small"
                      onClick={() => toggleVMStatus(vm.id)}
                      title={vm.status === 'running' ? 'Detener instancia' : 'Iniciar instancia'}
                    >
                      {vm.status === 'running' ? <Square size={12} color="#dc2626" /> : <Play size={12} color="#16a34a" />}
                    </button>
                    <button
                      className="azure-action-btn-small"
                      onClick={() => restartVM(vm.id)}
                      title="Reiniciar instancia"
                    >
                      <RotateCw size={12} />
                    </button>
                    <button
                      className="azure-action-btn-small"
                      onClick={() => deleteVM(vm.id)}
                      title="Eliminar recurso"
                    >
                      <Trash2 size={12} color="#dc2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
