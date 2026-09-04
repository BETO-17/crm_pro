import { useState } from 'react';
import {
  UserPlus,
  Search,
  Settings,
  CheckCircle,
  X,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface UserAssignment {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  carga: boolean;
  analisis: boolean;
  tendencias: boolean;
  lastLogin: string;
  status: 'online' | 'offline' | 'away';
}

const initialUsers: UserAssignment[] = [
  {
    id: '1',
    name: 'Carlos Ruiz',
    role: 'Analista',
    initials: 'CR',
    color: '#4f8cff',
    carga: true,
    analisis: true,
    tendencias: false,
    lastLogin: 'Hace 5 min',
    status: 'online',
  },
  {
    id: '2',
    name: 'Laura Mendoza',
    role: 'Gerente',
    initials: 'LM',
    color: '#a855f7',
    carga: false,
    analisis: true,
    tendencias: true,
    lastLogin: 'Hace 1h',
    status: 'away',
  },
  {
    id: '3',
    name: 'Miguel Torres',
    role: 'Analista',
    initials: 'MT',
    color: '#22c55e',
    carga: true,
    analisis: false,
    tendencias: true,
    lastLogin: 'Hace 3h',
    status: 'online',
  },
  {
    id: '4',
    name: 'Ana García',
    role: 'Gerente',
    initials: 'AG',
    color: '#f59e0b',
    carga: true,
    analisis: true,
    tendencias: true,
    lastLogin: 'Ayer',
    status: 'offline',
  },
  {
    id: '5',
    name: 'Roberto Díaz',
    role: 'Analista',
    initials: 'RD',
    color: '#ef4444',
    carga: false,
    analisis: false,
    tendencias: false,
    lastLogin: 'Hace 2 días',
    status: 'offline',
  },
];

export default function AsignacionModulos() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: 'Analista',
    password: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const togglePermission = (userId: string, field: 'carga' | 'analisis' | 'tendencias') => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, [field]: !u[field] } : u
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      showToast('Permisos actualizados correctamente ✓');
    }, 800);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.correo.trim()) {
      showToast('Por favor completa nombre y correo', 'error');
      return;
    }
    const initials = formData.nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const colors = ['#4f8cff', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
    const newUser: UserAssignment = {
      id: Date.now().toString(),
      name: formData.nombre,
      role: formData.rol,
      initials,
      color: colors[Math.floor(Math.random() * colors.length)],
      carga: false,
      analisis: false,
      tendencias: false,
      lastLogin: 'Nunca',
      status: 'offline',
    };
    setUsers((prev) => [...prev, newUser]);
    setFormData({ nombre: '', correo: '', rol: 'Analista', password: '' });
    showToast(`Usuario "${formData.nombre}" creado — asigna módulos en la tabla`);
  };

  const selectAll = (field: 'carga' | 'analisis' | 'tendencias') => {
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
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPerms = users.reduce((acc, u) => acc + (u.carga ? 1 : 0) + (u.analisis ? 1 : 0) + (u.tendencias ? 1 : 0), 0);

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
      <p className="page-subtitle">Administra el acceso y permisos de la plataforma.</p>

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

      <div className="admin-panels">
        {/* ---- Left: Register New User ---- */}
        <div className="admin-card">
          <div className="card-header">
            <h2 className="card-title">
              <UserPlus size={20} aria-hidden="true" />
              Registro de Nuevo Usuario
            </h2>
          </div>

          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label className="form-label" htmlFor="as-nombre">Nombre Completo</label>
              <input
                id="as-nombre"
                className="form-input"
                type="text"
                placeholder="Ej. Ana García"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="as-correo">Correo Electrónico</label>
              <input
                id="as-correo"
                className="form-input"
                type="email"
                placeholder="ana.garcia@empresa.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="as-rol">Rol</label>
                <select
                  id="as-rol"
                  className="form-select"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  <option value="Analista">Analista</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="as-password">Contraseña Temporal</label>
                <input
                  id="as-password"
                  className="form-input"
                  type="text"
                  placeholder="Temp123!"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <UserPlus size={16} aria-hidden="true" />
              + Crear Usuario
            </button>
          </form>

          {/* Security note */}
          <div className="info-banner">
            <Shield size={16} aria-hidden="true" />
            <span>Las contraseñas temporales expiran en 24h. El usuario deberá cambiarla en su primer inicio.</span>
          </div>
        </div>

        {/* ---- Right: Module Assignment ---- */}
        <div className="admin-card">
          <div className="assignment-header">
            <h2 className="card-title">
              <Settings size={20} aria-hidden="true" />
              Asignación de Módulos
            </h2>
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

          <table className="assignment-table" role="grid">
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
                <th>Estado</th>
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
                    <span className={`badge badge-status-${user.status}`}>
                      {user.status === 'online' ? 'En línea' : user.status === 'away' ? 'Ausente' : 'Desconectado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <Search size={32} />
              <p>No se encontraron usuarios con "{searchTerm}"</p>
            </div>
          )}

          <button
            className={`btn-save ${saving ? 'btn-saving' : ''} ${!hasChanges ? 'btn-disabled' : ''}`}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </>
  );
}
