import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Si la ruta requiere roles específicos, validamos
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirigir al landing u otra página si no tiene permisos
        return <Navigate to="/" replace />;
      }
    }
  } catch (error) {
    // Error al parsear JSON
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  // Si todo está bien, renderiza las subrutas (el Outlet)
  return <Outlet />;
}
