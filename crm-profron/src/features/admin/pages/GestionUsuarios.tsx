import { useState } from 'react';
import {
  UserPlus,
  Settings,
  Download,
  BarChart3,
  GitCompare,
  FolderKanban,
  CheckCircle,
  X,
  Trash2,
  Edit,
  Shield,
  Layers,
  Users,
  Search,
  Check,
} from 'lucide-react';
import type { ModuleStatus, Role } from '../../../types';
import AsignacionModulos from './AsignacionModulos';
import Workspaces from './Workspaces';

interface ModuleItem {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  icon: 'download' | 'chart' | 'compare' | 'folder';
}

interface RegisteredUser {
  id: string;
  nombre: string;
  correo: string;
  rol: Role;
  fecha: string;
  status: 'Activo' | 'Pendiente' | 'Inactivo';
}

const initialModules: ModuleItem[] = [
  {
    id: 'carga',
    name: 'Carga de Datos',
    description: 'Permite la subida y validación de archivos CSV / Excel masivos.',
    status: 'Activo',
    icon: 'download',
  },
  {
    id: 'observacion',
    name: 'Observación de Datos',
    description: 'Explorador tabular interactivo y asistente de IA analítico.',
    status: 'Activo',
    icon: 'chart',
  },
  {
    id: 'comparacion',
    name: 'Comparación y Análisis',
    description: 'Benchmark comparativo de datasets internos vs. competencia.',
    status: 'Activo',
    icon: 'compare',
  },
  {
    id: 'workspaces',
    name: 'Workspaces',
    description: 'Gestión de sesiones de trabajo y tableros colaborativos.',
    status: 'Activo',
    icon: 'folder',
  },
];

const iconMap = {
  download: Download,
  chart: BarChart3,
  compare: GitCompare,
  folder: FolderKanban,
};

const initialUsersList: RegisteredUser[] = [
  { id: '1', nombre: 'Carlos Ruiz', correo: 'carlos.ruiz@retail.com', rol: 'Analista', fecha: '12 Sep 2024', status: 'Activo' },
  { id: '2', nombre: 'Laura Mendoza', correo: 'laura.m@retail.com', rol: 'Gerente', fecha: '08 Sep 2024', status: 'Activo' },
  { id: '3', nombre: 'Miguel Torres', correo: 'miguel.t@retail.com', rol: 'Analista', fecha: '01 Sep 2024', status: 'Activo' },
  { id: '4', nombre: 'Ana García', correo: 'ana.garcia@retail.com', rol: 'Gerente', fecha: '28 Ago 2024', status: 'Pendiente' },
  { id: '5', nombre: 'Sonia Sandoval', correo: 'sonia.s@retail.com', rol: 'Analista', fecha: '15 Ago 2024', status: 'Activo' },
];

type SubTab = 'gestion' | 'asignacion' | 'workspaces';

export default function GestionUsuarios() {
  const [activeTab, setActiveTab] = useState<SubTab>('gestion');
  const [modules, setModules] = useState(initialModules);
  const [users, setUsers] = useState<RegisteredUser[]>(initialUsersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: 'Analista' as Role,
    password: '',
    otp: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ nombre: string; correo: string; rol: Role; status: 'Activo' | 'Pendiente' | 'Inactivo' }>({
    nombre: '',
    correo: '',
    rol: 'Analista',
    status: 'Activo',
  });

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
            `Módulo "${m.name}" ${newStatus === 'Activo' ? 'activado' : 'desactivado'} globalmente`,
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
      showToast('Por favor completa nombre y correo electrónico', 'error');
      return;
    }
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      nombre: formData.nombre.trim(),
      correo: formData.correo.trim(),
      rol: formData.rol,
      fecha: 'Hoy',
      status: 'Activo',
    };
    setUsers((prev) => [newUser, ...prev]);
    setFormData({ nombre: '', correo: '', rol: 'Analista', password: '', otp: '' });
    showToast(`Usuario "${newUser.nombre}" registrado exitosamente ✓`);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(`Usuario "${user?.nombre}" eliminado`, 'info');
  };

  const startEdit = (user: RegisteredUser) => {
    setEditingUserId(user.id);
    setEditFormData({
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      status: user.status,
    });
  };

  const saveEdit = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, nombre: editFormData.nombre, correo: editFormData.correo, rol: editFormData.rol, status: editFormData.status }
          : u
      )
    );
    setEditingUserId(null);
    showToast('Usuario actualizado correctamente ✓');
  };

  const activeCount = modules.filter((m) => m.status === 'Activo').length;

  const filteredUsers = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="gestion-usuarios-page">
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

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Administración de Usuarios y Accesos</h1>
          <p className="page-subtitle">
            Control maestro de cuentas, matriz de permisos de módulos y supervisión de espacios de trabajo.
          </p>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="admin-segmented-tabs" role="tablist" aria-label="Secciones de usuarios">
        <button
          className={`admin-segmented-tab ${activeTab === 'gestion' ? 'active' : ''}`}
          onClick={() => setActiveTab('gestion')}
          role="tab"
          aria-selected={activeTab === 'gestion'}
        >
          <Users size={16} className="admin-segmented-tab-icon" />
          Gestión de Usuarios
        </button>
        <button
          className={`admin-segmented-tab ${activeTab === 'asignacion' ? 'active' : ''}`}
          onClick={() => setActiveTab('asignacion')}
          role="tab"
          aria-selected={activeTab === 'asignacion'}
        >
          <Shield size={16} className="admin-segmented-tab-icon" />
          Asignación y Permisos
        </button>
        <button
          className={`admin-segmented-tab ${activeTab === 'workspaces' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspaces')}
          role="tab"
          aria-selected={activeTab === 'workspaces'}
        >
          <Layers size={16} className="admin-segmented-tab-icon" />
          Workspaces Activos
        </button>
      </div>

      {/* Sub-View: Asignación */}
      {activeTab === 'asignacion' && <AsignacionModulos />}

      {/* Sub-View: Workspaces */}
      {activeTab === 'workspaces' && <Workspaces />}

      {/* Sub-View: Gestión Principal */}
      {activeTab === 'gestion' && (
        <>
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
            {/* ---- Left: Register User Form ---- */}
            <div className="admin-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    <UserPlus size={18} aria-hidden="true" />
                    Registrar Nuevo Usuario
                  </h2>
                  <p className="card-subtitle">Crea credenciales de acceso para un analista o gerente.</p>
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

                <div className="form-row">
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
                    <label className="form-label" htmlFor="rol">Rol del Sistema</label>
                    <select
                      id="rol"
                      className="form-select"
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value as Role })}
                    >
                      <option value="Analista">Analista</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
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
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 6, width: '100%' }}>
                  <UserPlus size={16} aria-hidden="true" />
                  Crear Usuario
                </button>
              </form>
            </div>

            {/* ---- Right: Module Master Control (Switch Toggle) ---- */}
            <div className="admin-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    <Settings size={18} aria-hidden="true" />
                    Control Maestro de Módulos
                  </h2>
                  <p className="card-subtitle">Habilita o deshabilita la disponibilidad de módulos globales.</p>
                </div>
              </div>

              <div className="module-list">
                {modules.map((mod) => {
                  const Icon = iconMap[mod.icon];
                  const isActive = mod.status === 'Activo';
                  return (
                    <div
                      key={mod.id}
                      className={`module-item ${isActive ? 'module-active' : 'module-inactive'}`}
                    >
                      <div className="module-icon">
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <div className="module-info">
                        <div className="module-name-row">
                          <span className="module-name">{mod.name}</span>
                          <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {mod.status}
                          </span>
                        </div>
                        <div className="module-desc">{mod.description}</div>
                      </div>
                      <div className="module-toggle">
                        {/* Modern Switch Component */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          className={`modern-toggle-switch ${isActive ? 'checked' : ''}`}
                          onClick={() => toggleModule(mod.id)}
                          aria-label={`Activar o desactivar módulo ${mod.name}`}
                        >
                          <span className="toggle-switch-handle" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Module stats bar */}
              <div className="module-stats">
                <div className="module-stats-bar">
                  <div
                    className="module-stats-fill"
                    style={{ width: `${(activeCount / modules.length) * 100}%` }}
                  />
                </div>
                <span className="module-stats-label">
                  {activeCount} de {modules.length} módulos disponibles en la plataforma ({Math.round((activeCount / modules.length) * 100)}%)
                </span>
              </div>
            </div>
          </div>

          {/* ---- Bottom: Full Users Directory Table ---- */}
          <div className="admin-card" style={{ marginTop: 24 }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 className="card-title">
                  <Users size={18} aria-hidden="true" />
                  Directorio de Usuarios Registrados
                </h2>
                <p className="card-subtitle">Lista de cuentas activas en la organización y acciones de administración.</p>
              </div>

              <div className="table-search-inline">
                <Search size={14} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar usuarios en la tabla"
                />
              </div>
            </div>

            <div className="users-table-wrapper">
              <table className="users-directory-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo Electrónico</th>
                    <th>Rol</th>
                    <th>Fecha de Alta</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isEditing = editingUserId === user.id;
                    const initials = user.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2);

                    return (
                      <tr key={user.id} className={isEditing ? 'editing-row' : ''}>
                        <td>
                          <div className="user-cell">
                            <div className="user-table-avatar" aria-hidden="true">
                              {initials}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                className="inline-edit-input"
                                value={editFormData.nombre}
                                onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                              />
                            ) : (
                              <span className="user-table-name">{user.nombre}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          {isEditing ? (
                            <input
                              type="email"
                              className="inline-edit-input"
                              value={editFormData.correo}
                              onChange={(e) => setEditFormData({ ...editFormData, correo: e.target.value })}
                            />
                          ) : (
                            <span className="user-table-email">{user.correo}</span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <select
                              className="inline-edit-select"
                              value={editFormData.rol}
                              onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value as Role })}
                            >
                              <option value="Analista">Analista</option>
                              <option value="Gerente">Gerente</option>
                              <option value="Administrador">Administrador</option>
                            </select>
                          ) : (
                            <span className="role-pill">{user.rol}</span>
                          )}
                        </td>

                        <td>
                          <span className="user-table-date">{user.fecha}</span>
                        </td>

                        <td>
                          {isEditing ? (
                            <select
                              className="inline-edit-select"
                              value={editFormData.status}
                              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as RegisteredUser['status'] })}
                            >
                              <option value="Activo">Activo</option>
                              <option value="Pendiente">Pendiente</option>
                              <option value="Inactivo">Inactivo</option>
                            </select>
                          ) : (
                            <span className={`status-dot-badge ${user.status.toLowerCase()}`}>
                              <span className="status-dot" />
                              {user.status}
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            {isEditing ? (
                              <>
                                <button
                                  className="icon-btn-action success"
                                  onClick={() => saveEdit(user.id)}
                                  title="Guardar cambios"
                                  aria-label="Guardar cambios"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  className="icon-btn-action"
                                  onClick={() => setEditingUserId(null)}
                                  title="Cancelar edición"
                                  aria-label="Cancelar edición"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="icon-btn-action"
                                  onClick={() => startEdit(user)}
                                  title={`Editar ${user.nombre}`}
                                  aria-label={`Editar ${user.nombre}`}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  className="icon-btn-action danger"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title={`Eliminar ${user.nombre}`}
                                  aria-label={`Eliminar ${user.nombre}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <Users size={32} />
                  <p>No se encontraron usuarios coincidentes.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
