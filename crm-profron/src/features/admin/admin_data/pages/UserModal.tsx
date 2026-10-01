// ==========================================
// UserModal — Modal de Registro / Edición
// ==========================================
import { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import type { Role } from '../../../../core/types';

export interface UserFormData {
  nombre: string;
  correo: string;
  password: string;
  rol: Role;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  editUser?: { id: string; nombre: string; correo: string; rol: Role } | null;
}

const ROLES: Role[] = ['Administrador', 'Analista', 'Gerente', 'Usuario'];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Administrador: 'Acceso total al sistema y gestión de usuarios.',
  Analista: 'Carga, exploración y análisis de datasets.',
  Gerente: 'Visualización de reportes y métricas de negocio.',
  Usuario: 'Acceso básico a módulos asignados.',
};

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editUser = null,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    correo: '',
    password: '',
    rol: 'Analista',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  // Populate form when editing
  useEffect(() => {
    if (editUser) {
      setFormData({
        nombre: editUser.nombre,
        correo: editUser.correo,
        password: '',
        rol: editUser.rol,
      });
    } else {
      setFormData({ nombre: '', correo: '', password: '', rol: 'Analista' });
    }
    setErrors({});
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<UserFormData> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Ingresa un correo válido';
    }
    if (!editUser && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!editUser && formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  return (
    <div
      className="um-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="um-modal-title"
    >
      <div className="um-modal">
        {/* Header */}
        <div className="um-modal-header">
          <div className="um-modal-header-info">
            <div className="um-modal-icon">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 id="um-modal-title" className="um-modal-title">
                {editUser ? 'Editar Usuario' : 'Registrar Usuario'}
              </h2>
              <p className="um-modal-subtitle">
                {editUser
                  ? 'Modifica los datos del usuario.'
                  : 'Añade un nuevo miembro a la plataforma RetailMetrics 360.'}
              </p>
            </div>
          </div>
          <button
            className="um-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="um-modal-avatar-preview">
          <div className="um-avatar-circle">
            {getInitials(formData.nombre)}
          </div>
          <div className="um-avatar-meta">
            <span className="um-avatar-name">
              {formData.nombre || 'Nuevo Usuario'}
            </span>
            <span className="um-avatar-role">{formData.rol}</span>
          </div>
        </div>

        {/* Form */}
        <form className="um-modal-form" onSubmit={handleSubmit} noValidate>
          <div className="um-form-grid">
            {/* Nombre */}
            <div className="um-form-group">
              <label className="um-form-label" htmlFor="um-nombre">
                <User size={13} aria-hidden="true" />
                Nombre Completo
              </label>
              <input
                id="um-nombre"
                className={`um-form-input ${errors.nombre ? 'um-input-error' : ''}`}
                type="text"
                placeholder="Ej. Ana García Martínez"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                autoComplete="off"
              />
              {errors.nombre && (
                <span className="um-field-error">
                  <AlertCircle size={12} />
                  {errors.nombre}
                </span>
              )}
            </div>

            {/* Correo */}
            <div className="um-form-group">
              <label className="um-form-label" htmlFor="um-correo">
                <Mail size={13} aria-hidden="true" />
                Correo Corporativo
              </label>
              <input
                id="um-correo"
                className={`um-form-input ${errors.correo ? 'um-input-error' : ''}`}
                type="email"
                placeholder="ana.garcia@retailmetrics.com"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
                autoComplete="off"
              />
              {errors.correo && (
                <span className="um-field-error">
                  <AlertCircle size={12} />
                  {errors.correo}
                </span>
              )}
            </div>

            {/* Password */}
            {!editUser && (
              <div className="um-form-group">
                <label className="um-form-label" htmlFor="um-password">
                  <Lock size={13} aria-hidden="true" />
                  Contraseña Inicial
                </label>
                <div className="um-input-wrapper">
                  <input
                    id="um-password"
                    className={`um-form-input um-input-with-icon ${errors.password ? 'um-input-error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="um-input-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="um-field-error">
                    <AlertCircle size={12} />
                    {errors.password}
                  </span>
                )}
              </div>
            )}

            {/* Rol */}
            <div className="um-form-group um-form-group--full">
              <label className="um-form-label">
                <Shield size={13} aria-hidden="true" />
                Rol en la Plataforma
              </label>
              <div className="um-role-grid" role="radiogroup" aria-label="Seleccionar rol">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`um-role-card ${formData.rol === role ? 'um-role-card--active' : ''}`}
                    onClick={() => setFormData({ ...formData, rol: role })}
                    aria-pressed={formData.rol === role}
                  >
                    <span className="um-role-name">{role}</span>
                    <span className="um-role-desc">{ROLE_DESCRIPTIONS[role]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="um-modal-actions">
            <button
              type="button"
              className="um-btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="um-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="um-spinner" aria-hidden="true" />
                  Procesando...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  {editUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
