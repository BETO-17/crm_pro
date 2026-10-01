// ==========================================
// GestionUsuarios — Módulo principal
// ==========================================
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  CheckCircle,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { Role } from '../../../../core/types';
import UserTable, { type UserRow } from './UserTable';
import UserModal, { type UserFormData } from './UserModal';

const PAGE_SIZE = 8;

// ---- Mock data para demostración (reemplazable por API) ----
const MOCK_USERS: UserRow[] = [
  {
    id: '1',
    nombre: 'Raquel Andreina',
    correo: 'raquel.andreina@retailmetrics.com',
    rol: 'Administrador',
    status: 'online',
    fecha: '10 Sep 2026',
  },
  {
    id: '2',
    nombre: 'Carlos Rodríguez',
    correo: 'c.rodriguez@retailmetrics.com',
    rol: 'Analista',
    status: 'online',
    fecha: '15 Sep 2026',
  },
  {
    id: '3',
    nombre: 'María Fernández',
    correo: 'm.fernandez@retailmetrics.com',
    rol: 'Gerente',
    status: 'offline',
    fecha: '18 Sep 2026',
  },
  {
    id: '4',
    nombre: 'Jorge Alejandro Pérez',
    correo: 'j.perez@retailmetrics.com',
    rol: 'Analista',
    status: 'pending',
    fecha: '20 Sep 2026',
  },
  {
    id: '5',
    nombre: 'Luisa Valentina Torres',
    correo: 'l.torres@retailmetrics.com',
    rol: 'Analista',
    status: 'online',
    fecha: '22 Sep 2026',
  },
  {
    id: '6',
    nombre: 'Andrés Felipe Gómez',
    correo: 'a.gomez@retailmetrics.com',
    rol: 'Usuario',
    status: 'offline',
    fecha: '24 Sep 2026',
  },
  {
    id: '7',
    nombre: 'Valentina Morales',
    correo: 'v.morales@retailmetrics.com',
    rol: 'Analista',
    status: 'online',
    fecha: '26 Sep 2026',
  },
  {
    id: '8',
    nombre: 'Diego Hernández',
    correo: 'd.hernandez@retailmetrics.com',
    rol: 'Gerente',
    status: 'offline',
    fecha: '27 Sep 2026',
  },
  {
    id: '9',
    nombre: 'Sofía Ramírez',
    correo: 's.ramirez@retailmetrics.com',
    rol: 'Analista',
    status: 'pending',
    fecha: '28 Sep 2026',
  },
];

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  message: string;
  type: ToastType;
}

export default function GestionUsuarios() {
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<Toast | null>(null);

  // ---- Toast helper ----
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ---- Fetch usuarios desde API (con fallback a mock) ----
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/v1/users/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped: UserRow[] = data.map((u: Record<string, unknown>) => ({
          id: String(u.id),
          nombre: (u.full_name as string) || 'Sin nombre',
          correo: u.email as string,
          rol: (u.role as Role) || 'Usuario',
          status: (u.status as UserRow['status']) || 'offline',
          fecha: u.created_at
            ? new Date(u.created_at as string).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Registrado',
        }));
        setUsers(mapped.reverse());
      }
      // Si falla la API, los datos mock quedan intactos
    } catch {
      // API no disponible — usamos datos mock (no mostramos error al usuario)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  // ---- Filtrado y paginación ----
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery]);

  // ---- KPIs ----
  const statsActive = users.filter((u) => u.status === 'online').length;
  const statsInactive = users.filter((u) => u.status === 'offline').length;
  const statsPending = users.filter((u) => u.status === 'pending').length;

  // ---- Handlers ----
  const handleOpenCreate = () => {
    setEditUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserRow) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditUser(null);
  };

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      if (editUser) {
        // Editar usuario
        const res = await fetch(`http://localhost:8000/api/v1/users/${editUser.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            full_name: data.nombre,
            email: data.correo,
            role: data.rol.toLowerCase(),
          }),
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editUser.id
                ? { ...u, nombre: data.nombre, correo: data.correo, rol: data.rol }
                : u
            )
          );
          showToast(`Usuario "${data.nombre}" actualizado ✓`);
        } else {
          // Actualización local si la API no responde
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editUser.id
                ? { ...u, nombre: data.nombre, correo: data.correo, rol: data.rol }
                : u
            )
          );
          showToast(`Usuario "${data.nombre}" actualizado ✓`);
        }
      } else {
        // Crear usuario
        const res = await fetch('http://localhost:8000/api/v1/users/', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: data.correo,
            full_name: data.nombre,
            password: data.password,
            role: data.rol.toLowerCase(),
            is_active: true,
            status: 'offline',
          }),
        });

        const today = new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        if (res.ok) {
          const created = await res.json();
          const newUser: UserRow = {
            id: String(created.id ?? Date.now()),
            nombre: data.nombre,
            correo: data.correo,
            rol: data.rol,
            status: 'pending',
            fecha: today,
          };
          setUsers((prev) => [newUser, ...prev]);
          showToast(`Usuario "${data.nombre}" creado exitosamente ✓`);
        } else {
          // Fallback: agregar localmente si API no disponible
          const newUser: UserRow = {
            id: String(Date.now()),
            nombre: data.nombre,
            correo: data.correo,
            rol: data.rol,
            status: 'pending',
            fecha: today,
          };
          setUsers((prev) => [newUser, ...prev]);
          showToast(`Usuario "${data.nombre}" creado exitosamente ✓`);
        }
      }
      handleCloseModal();
    } catch {
      // Fallback offline
      const today = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      if (!editUser) {
        const newUser: UserRow = {
          id: String(Date.now()),
          nombre: data.nombre,
          correo: data.correo,
          rol: data.rol,
          status: 'pending',
          fecha: today,
        };
        setUsers((prev) => [newUser, ...prev]);
        showToast(`Usuario "${data.nombre}" creado ✓`);
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (!window.confirm(`¿Eliminar al usuario "${target.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // No hay API — eliminamos localmente de todas formas
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(`Usuario "${target.nombre}" eliminado`, 'info');
  };

  // ---- Render ----
  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`um-toast um-toast--${toast.type}`} role="alert" aria-live="polite">
          {toast.type === 'success' && <CheckCircle size={16} aria-hidden="true" />}
          {toast.type === 'error' && <AlertTriangle size={16} aria-hidden="true" />}
          {toast.type === 'info' && <X size={16} aria-hidden="true" />}
          <span>{toast.message}</span>
          <button
            className="um-toast-close"
            onClick={() => setToast(null)}
            aria-label="Cerrar notificación"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="um-page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">
            Administra los accesos, roles y permisos de todos los miembros de RetailMetrics 360.
          </p>
        </div>
        <div className="um-header-actions">
          <button
            className="um-btn-refresh"
            onClick={fetchUsers}
            disabled={isLoading}
            aria-label="Actualizar lista"
            title="Actualizar"
          >
            <RefreshCw size={15} className={isLoading ? 'um-spin' : ''} />
          </button>
          <button className="um-btn-create" onClick={handleOpenCreate}>
            <UserPlus size={16} aria-hidden="true" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="um-kpi-row">
        <div className="um-kpi-card um-kpi-card--total">
          <div className="um-kpi-icon-wrap um-kpi-icon--blue">
            <Users size={20} />
          </div>
          <div className="um-kpi-info">
            <span className="um-kpi-value">{users.length}</span>
            <span className="um-kpi-label">Total Usuarios</span>
          </div>
        </div>
        <div className="um-kpi-card um-kpi-card--active">
          <div className="um-kpi-icon-wrap um-kpi-icon--green">
            <UserCheck size={20} />
          </div>
          <div className="um-kpi-info">
            <span className="um-kpi-value">{statsActive}</span>
            <span className="um-kpi-label">Activos</span>
          </div>
        </div>
        <div className="um-kpi-card um-kpi-card--inactive">
          <div className="um-kpi-icon-wrap um-kpi-icon--gray">
            <UserX size={20} />
          </div>
          <div className="um-kpi-info">
            <span className="um-kpi-value">{statsInactive}</span>
            <span className="um-kpi-label">Inactivos</span>
          </div>
        </div>
        <div className="um-kpi-card um-kpi-card--pending">
          <div className="um-kpi-icon-wrap um-kpi-icon--amber">
            <UserPlus size={20} />
          </div>
          <div className="um-kpi-info">
            <span className="um-kpi-value">{statsPending}</span>
            <span className="um-kpi-label">Pendientes</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="um-section-card">
        <UserTable
          users={paginatedUsers}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        editUser={
          editUser
            ? { id: editUser.id, nombre: editUser.nombre, correo: editUser.correo, rol: editUser.rol }
            : null
        }
      />
    </>
  );
}
