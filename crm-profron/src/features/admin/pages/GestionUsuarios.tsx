import { useState } from 'react';
import {
  UserPlus,
  Settings,
  Download,
  BarChart3,
  GitCompare,
  FileSpreadsheet,
  Plus,
  Minus,
  CheckCircle,
  X,
  Trash2,
  Edit,
} from 'lucide-react';
import type { ModuleStatus } from '../../../types';

interface ModuleItem {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  icon: 'download' | 'chart' | 'compare' | 'file';
}

interface CreatedUser {
  id: string;
  nombre: string;
  correo: string;
  fecha: string;
}

const initialModules: ModuleItem[] = [
  {
    id: 'carga',
    name: 'Carga de Datos',
    description: 'Permite la subida de archivos CSV masivos.',
    status: 'Activo',
    icon: 'download',
  },
  {
    id: 'observacion',
    name: 'Observacion de Datos',
    description: 'Motores de ML para predicción de ventas.',
    status: 'Inactivo',
    icon: 'chart',
  },
  {
    id: 'comparacion',
    name: 'Comparacion y Analisis',
    description: 'Visualización de datos demográficos y estacionales.',
    status: 'Activo',
    icon: 'compare',
  },
  {
    id: 'worpace',
    name: 'Worpace',
    description: 'Generación de PDFs automatizados mensuales.',
    status: 'Inactivo',
    icon: 'file',
  },
];

const iconMap = {
  download: Download,
  chart: BarChart3,
  compare: GitCompare,
  file: FileSpreadsheet,
};

const mockUsers: CreatedUser[] = [
  { id: '1', nombre: 'Carlos Ruiz', correo: 'carlos.ruiz@retail.com', fecha: 'Hace 2 días' },
  { id: '2', nombre: 'Laura Mendoza', correo: 'laura.m@retail.com', fecha: 'Hace 5 días' },
  { id: '3', nombre: 'Miguel Torres', correo: 'miguel.t@retail.com', fecha: 'Hace 1 semana' },
];

export default function GestionUsuarios() {
  const [modules, setModules] = useState(initialModules);
  const [users, setUsers] = useState<CreatedUser[]>(mockUsers);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    otp: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStatus: ModuleStatus = m.status === 'Activo' ? 'Inactivo' : 'Activo';
          showToast(
            `Módulo "${m.name}" ${newStatus === 'Activo' ? 'activado' : 'desactivado'}`,
            newStatus === 'Activo' ? 'success' : 'info'
          );
          return { ...m, status: newStatus };
        }
        return m;
      })
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.correo.trim()) {
      showToast('Por favor completa nombre y correo', 'error');
      return;
    }
    const newUser: CreatedUser = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      correo: formData.correo,
      fecha: 'Ahora mismo',
    };
    setUsers((prev) => [newUser, ...prev]);
    setFormData({ nombre: '', correo: '', password: '', otp: '' });
    showToast(`Usuario "${formData.nombre}" creado exitosamente ✓`);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(`Usuario "${user?.nombre}" eliminado`, 'info');
  };

  const activeCount = modules.filter((m) => m.status === 'Activo').length;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <CheckCircle size={16} aria-hidden="true" />
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      )}

      <h1 className="page-title">Gestión de Usuarios</h1>
      <p className="page-subtitle">
        Administra el acceso y los permisos de los módulos para la plataforma RetailMetrics 360.
      </p>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-chip">
          <span className="stat-chip-number">{users.length}</span>
          <span className="stat-chip-label">Usuarios registrados</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{activeCount}</span>
          <span className="stat-chip-label">Módulos activos</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{modules.length - activeCount}</span>
          <span className="stat-chip-label">Módulos inactivos</span>
        </div>
      </div>

      <div className="admin-panels">
        {/* ---- Left: Register User ---- */}
        <div className="admin-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <UserPlus size={20} aria-hidden="true" />
                Registrar Usuario
              </h2>
              <p className="card-subtitle">Añadir un nuevo analista al sistema.</p>
            </div>
          </div>

          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                className="form-input"
                type="text"
                placeholder="Ej. Ana García"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="correo">Correo Corporativo</label>
              <input
                id="correo"
                className="form-input"
                type="email"
                placeholder="ana.garcia@retail.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña Inicial</label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="otp">Código OTP (Opcional)</label>
              <input
                id="otp"
                className="form-input"
                type="text"
                placeholder="123456"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary">
              <UserPlus size={16} aria-hidden="true" />
              Crear Usuario
            </button>
          </form>

          {/* Recent Users List */}
          {users.length > 0 && (
            <div className="recent-users">
              <h3 className="recent-users-title">Usuarios Recientes</h3>
              {users.map((user) => (
                <div key={user.id} className="recent-user-item">
                  <div className="recent-user-avatar">
                    {user.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="recent-user-info">
                    <span className="recent-user-name">{user.nombre}</span>
                    <span className="recent-user-email">{user.correo}</span>
                  </div>
                  <span className="recent-user-time">{user.fecha}</span>
                  <div className="recent-user-actions">
                    <button
                      className="icon-btn-small"
                      onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                      aria-label={`Editar ${user.nombre}`}
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      className="icon-btn-small icon-btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                      aria-label={`Eliminar ${user.nombre}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Right: Module Management ---- */}
        <div className="admin-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Gestión de Módulos</h2>
              <p className="card-subtitle">Habilita o deshabilita módulos globales.</p>
            </div>
            <button className="card-action-btn" aria-label="Configuración de módulos">
              <Settings size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="module-list">
            {modules.map((mod) => {
              const Icon = iconMap[mod.icon];
              return (
                <div
                  key={mod.id}
                  className={`module-item ${mod.status === 'Activo' ? 'module-active' : 'module-inactive'}`}
                >
                  <div className="module-icon">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="module-info">
                    <div className="module-name">{mod.name}</div>
                    <div className="module-desc">{mod.description}</div>
                  </div>
                  <div className="module-toggle">
                    <button
                      className="module-toggle-btn"
                      onClick={() => toggleModule(mod.id)}
                      aria-label={`Toggle ${mod.name}`}
                    >
                      {mod.status === 'Activo' ? <Minus size={14} /> : <Plus size={14} />}
                    </button>
                    <span className={`badge ${mod.status === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>
                      {mod.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Module usage stats */}
          <div className="module-stats">
            <div className="module-stats-bar">
              <div
                className="module-stats-fill"
                style={{ width: `${(activeCount / modules.length) * 100}%` }}
              />
            </div>
            <span className="module-stats-label">
              {activeCount} de {modules.length} módulos activos ({Math.round((activeCount / modules.length) * 100)}%)
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
