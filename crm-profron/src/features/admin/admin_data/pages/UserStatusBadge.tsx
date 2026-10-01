// ==========================================
// UserStatusBadge — Subcomponente de estado
// ==========================================

interface UserStatusBadgeProps {
  status: 'online' | 'offline' | 'pending';
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const labels: Record<string, string> = {
    online: 'Activo',
    offline: 'Inactivo',
    pending: 'Pendiente',
  };

  return (
    <span className={`user-status-badge user-status-badge--${status}`}>
      <span className="user-status-dot" aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
