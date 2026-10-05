// ==========================================
// UserTable — Tabla completa de usuarios
// ==========================================
import {
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Camera,
} from 'lucide-react';
import UserStatusBadge from './UserStatusBadge';
import type { Role } from '../../../../core/types';

export interface UserRow {
  id: string;
  nombre: string;
  correo: string;
  rol: Role;
  status: 'online' | 'offline' | 'pending';
  fecha: string;
}

interface UserTableProps {
  users: UserRow[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEdit: (user: UserRow) => void;
  onDelete: (id: string) => void;
  onRegisterFace?: (user: UserRow) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ROL_COLORS: Record<Role, string> = {
  Administrador: 'um-rol-admin',
  Analista: 'um-rol-analista',
  Gerente: 'um-rol-gerente',
  Usuario: 'um-rol-usuario',
};

function SkeletonRow() {
  return (
    <tr className="um-table-row um-skeleton-row">
      <td><div className="um-skeleton um-skeleton-avatar" /></td>
      <td><div className="um-skeleton um-skeleton-text" /></td>
      <td><div className="um-skeleton um-skeleton-text um-skeleton-short" /></td>
      <td><div className="um-skeleton um-skeleton-badge" /></td>
      <td><div className="um-skeleton um-skeleton-badge" /></td>
      <td><div className="um-skeleton um-skeleton-text um-skeleton-short" /></td>
      <td><div className="um-skeleton um-skeleton-actions" /></td>
    </tr>
  );
}

export default function UserTable({
  users,
  isLoading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onRegisterFace,
  currentPage,
  totalPages,
  onPageChange,
}: UserTableProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  return (
    <div className="um-table-wrapper">
      {/* Toolbar */}
      <div className="um-table-toolbar">
        <div className="um-table-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar usuarios"
            className="um-search-input"
          />
        </div>
        <span className="um-table-count">
          {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
        </span>
      </div>

      {/* Table */}
      <div className="um-table-scroll">
        <table className="um-table" aria-label="Lista de usuarios">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="um-table-empty">
                  <div className="um-empty-state">
                    <Users size={40} className="um-empty-icon" />
                    <p className="um-empty-title">
                      {searchQuery ? 'Sin resultados' : 'Sin usuarios registrados'}
                    </p>
                    <p className="um-empty-desc">
                      {searchQuery
                        ? `No se encontraron usuarios para "${searchQuery}"`
                        : 'Registra el primer usuario con el botón "+ Nuevo Usuario".'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="um-table-row">
                  <td>
                    <div className={`um-table-avatar um-avatar--${user.rol.toLowerCase()}`}>
                      {getInitials(user.nombre)}
                    </div>
                  </td>
                  <td>
                    <span className="um-table-name">{user.nombre}</span>
                  </td>
                  <td>
                    <span className="um-table-email">{user.correo}</span>
                  </td>
                  <td>
                    <span className={`um-rol-badge ${ROL_COLORS[user.rol]}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td>
                    <span className="um-table-date">{user.fecha}</span>
                  </td>
                  <td>
                    <div className="um-table-actions">
                      {onRegisterFace && (
                        <button
                          className="um-action-btn um-action-face"
                          onClick={() => onRegisterFace(user)}
                          aria-label={`Registrar rostro con Amazon Rekognition para ${user.nombre}`}
                          title="Registrar rostro con Amazon Rekognition"
                          style={{ color: '#d97706' }}
                        >
                          <Camera size={14} />
                        </button>
                      )}
                      <button
                        className="um-action-btn um-action-edit"
                        onClick={() => onEdit(user)}
                        aria-label={`Editar ${user.nombre}`}
                        title="Editar usuario"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="um-action-btn um-action-delete"
                        onClick={() => onDelete(user.id)}
                        aria-label={`Eliminar ${user.nombre}`}
                        title="Eliminar usuario"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="um-pagination" aria-label="Paginación">
          <button
            className="um-page-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`um-page-btn ${currentPage === page ? 'um-page-btn--active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          <button
            className="um-page-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
