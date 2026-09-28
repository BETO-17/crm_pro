import { Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Modo de desarrollo / acceso libre: auto-inicializar credenciales si no existen
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'dev-bypass-token');
  }
  
  if (!localStorage.getItem('user')) {
    const defaultRole = allowedRoles && allowedRoles.includes('admin') ? 'admin' : 'usuario';
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-demo-1',
        role: defaultRole,
        username: 'demo_user',
        email: 'usuario@erpmetrics360.com',
        full_name: 'Usuario Suscrito',
      })
    );
  }

  // Permitir el acceso a las subrutas
  return <Outlet />;
}
