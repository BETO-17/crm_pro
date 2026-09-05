import { useState } from 'react';
import {
  UserPlus,
  Search,
  Settings,
  CheckCircle,
  X,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react';

interface UserAssignment {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
  carga: boolean;
  analisis: boolean;
  tendencias: boolean;
  workspace: boolean;
  reportes: boolean;
  lastLogin: string;
  status: 'online' | 'offline' | 'away';
}

const initialUsers: UserAssignment[] = [
  {
    id: '1',
    name: 'Carlos Ruiz',
    email: 'carlos@retail.com',
    role: 'Analista',
    initials: 'CR',
    color: '#4f8cff',
    carga: true,
    analisis: true,
    tendencias: false,
    workspace: true,
    reportes: false,
    lastLogin: 'Hace 5 min',
    status: 'online',
  },
  {
    id: '2',
    name: 'Laura Mendoza',
    email: 'laura@retail.com',
    role: 'Gerente',
    initials: 'LM',
    color: '#a855f7',
    carga: false,
    analisis: true,
    tendencias: true,
    workspace: true,
    reportes: true,
    lastLogin: 'Hace 1h',
    status: 'away',
  },
  {
    id: '3',
    name: 'Miguel Torres',
    email: 'miguel@retail.com',
    role: 'Analista',
    initials: 'MT',
    color: '#22c55e',
    carga: true,
    analisis: false,
    tendencias: true,
    workspace: false,
    reportes: false,
    lastLogin: 'Hace 3h',
    status: 'online',
  },
  {
    id: '4',
    name: 'Ana García',
    email: 'ana@retail.com',
    role: 'Gerente',
    initials: 'AG',
    color: '#f59e0b',
    carga: true,
    analisis: true,
    tendencias: true,
    workspace: true,
    reportes: true,
    lastLogin: 'Ayer',
    status: 'offline',
  },
  {
    id: '5',
    name: 'Roberto Díaz',
    email: 'roberto@retail.com',
    role: 'Analista',
    initials: 'RD',
    color: '#ef4444',
    carga: false,
    analisis: false,
    tendencias: false,
    workspace: false,
    reportes: false,
    lastLogin: 'Hace 2 días',
    status: 'offline',
  },
];

export default function AsignacionModulos() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAssignment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Analista',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const togglePermission = (userId: string, field: 'carga' | 'analisis' | 'tendencias' | 'workspace' | 'reportes') => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, [field]: !u[field] } : u
      )
    );
    setHasChanges(true);
  };

  const handleSavePermissions = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      showToast('Permisos actualizados correctamente ✓');
    }, 800);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Analista' });
    setShowModal(true);
  };

  const openEditModal = (user: UserAssignment) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowModal(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
      showToast('Usuario eliminado', 'info');
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Por favor completa nombre y correo', 'error');
      return;
    }

    const initials = formData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? {
        ...u,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        initials
      } : u));
      showToast('Usuario actualizado correctamente');
    } else {
      const colors = ['#4f8cff', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
      const newUser: UserAssignment = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        initials,
        color: colors[Math.floor(Math.random() * colors.length)],
        carga: false,
        analisis: false,
        tendencias: false,
        workspace: false,
        reportes: false,
        lastLogin: 'Nunca',
        status: 'offline',
      };
      setUsers([...users, newUser]);
      showToast('Usuario creado correctamente');
    }
    setShowModal(false);
  };

  const selectAll = (field: 'carga' | 'analisis' | 'tendencias' | 'workspace' | 'reportes') => {
    const allChecked = filteredUsers.every((u) => u[field]);
    setUsers((prev) =>
      prev.map((u) => {
        if (filteredUsers.find((fu) => fu.id === u.id)) {
          return { ...u, [field]: !allChecked };
        }
        return u;
      })
    );
    setHasChanges(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPerms = users.reduce((acc, u) => acc + (u.carga ? 1 : 0) + (u.analisis ? 1 : 0) + (u.tendencias ? 1 : 0) + (u.workspace ? 1 : 0) + (u.reportes ? 1 : 0), 0);

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

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ej. Ana García"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="ana@empresa.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Analista">Analista</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              
              <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Gestión de Usuarios y Módulos</h1>
          <p className="page-subtitle">Administra el acceso y permisos de la plataforma de manera centralizada.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <UserPlus size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-chip">
          <span className="stat-chip-number">{users.length}</span>
          <span className="stat-chip-label">Total usuarios</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{users.filter((u) => u.status === 'online').length}</span>
          <span className="stat-chip-label">En línea</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{totalPerms}</span>
          <span className="stat-chip-label">Permisos asignados</span>
        </div>
      </div>

      <div className="admin-panels" style={{ gridTemplateColumns: '1fr' }}>
        {/* ---- Full Width: Module Assignment & User List ---- */}
        <div className="admin-card">
          <div className="assignment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 className="card-title">
                <Settings size={20} aria-hidden="true" style={{ marginRight: '8px' }} />
                Asignación de Módulos
              </h2>
            </div>
            <div className="assignment-search">
              <Search size={14} aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar usuario"
              />
            </div>
          </div>

          {hasChanges && (
            <div className="changes-banner">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>Hay cambios sin guardar</span>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="assignment-table" role="grid" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>
                    <button className="th-toggle" onClick={() => selectAll('carga')} title="Seleccionar todos">
                      Carga
                    </button>
                  </th>
                  <th>
                    <button className="th-toggle" onClick={() => selectAll('analisis')} title="Seleccionar todos">
                      Análisis
                    </button>
                  </th>
                  <th>
                    <button className="th-toggle" onClick={() => selectAll('tendencias')} title="Seleccionar todos">
                      Tendencias
                    </button>
                  </th>
                  <th>
                    <button className="th-toggle" onClick={() => selectAll('workspace')} title="Seleccionar todos">
                      Workspace
                    </button>
                  </th>
                  <th>
                    <button className="th-toggle" onClick={() => selectAll('reportes')} title="Seleccionar todos">
                      Reportes
                    </button>
                  </th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`assignment-row ${user.status}`}>
                    <td>
                      <div className="assignment-user">
                        <div className="assignment-avatar-wrap">
                          <div
                            className="assignment-avatar"
                            style={{ background: user.color }}
                            aria-hidden="true"
                          >
                            {user.initials}
                          </div>
                          <span className={`status-dot status-${user.status}`} />
                        </div>
                        <div>
                          <div className="assignment-user-name">{user.name}</div>
                          <div className="assignment-user-role">{user.role} · {user.lastLogin}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="assignment-checkbox"
                        checked={user.carga}
                        onChange={() => togglePermission(user.id, 'carga')}
                        aria-label={`Carga para ${user.name}`}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="assignment-checkbox"
                        checked={user.analisis}
                        onChange={() => togglePermission(user.id, 'analisis')}
                        aria-label={`Análisis para ${user.name}`}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="assignment-checkbox"
                        checked={user.tendencias}
                        onChange={() => togglePermission(user.id, 'tendencias')}
                        aria-label={`Tendencias para ${user.name}`}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="assignment-checkbox"
                        checked={user.workspace}
                        onChange={() => togglePermission(user.id, 'workspace')}
                        aria-label={`Workspace para ${user.name}`}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="assignment-checkbox"
                        checked={user.reportes}
                        onChange={() => togglePermission(user.id, 'reportes')}
                        aria-label={`Reportes para ${user.name}`}
                      />
                    </td>
                    <td>
                      <span className={`badge badge-status-${user.status}`}>
                        {user.status === 'online' ? 'En línea' : user.status === 'away' ? 'Ausente' : 'Desconectado'}
                      </span>
                    </td>
                    <td>
                      <div className="recent-user-actions" style={{ justifyContent: 'flex-end', display: 'flex', gap: '8px' }}>
                        <button
                          className="icon-btn-small"
                          onClick={() => openEditModal(user)}
                          aria-label={`Editar ${user.name}`}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="icon-btn-small icon-btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          aria-label={`Eliminar ${user.name}`}
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

          {filteredUsers.length === 0 && (
            <div className="empty-state" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Search size={32} style={{ margin: '0 auto 12px' }} />
              <p>No se encontraron usuarios con "{searchTerm}"</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              className={`btn-save ${saving ? 'btn-saving' : ''} ${!hasChanges ? 'btn-disabled' : ''}`}
              onClick={handleSavePermissions}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Guardando...' : 'Guardar Permisos'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
