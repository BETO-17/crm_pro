import { useState } from 'react';
import {
  FileText,
  Edit,
  CheckCircle,
  X,
  Save,
} from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  date: string;
  action: 'Descargar' | 'Ver';
}

const activities: Activity[] = [
  { id: '1', name: 'Reporte de Ventas Mensual', date: '15 Oct, 2023', action: 'Descargar' },
  { id: '2', name: 'Análisis de Inventario', date: '02 Oct, 2023', action: 'Descargar' },
  { id: '3', name: 'Exportación de Usuarios', date: '28 Sep, 2023', action: 'Ver' },
  { id: '4', name: 'Métricas de Ventas Q3', date: '15 Sep, 2023', action: 'Descargar' },
  { id: '5', name: 'Dashboard KPIs Regional', date: '01 Sep, 2023', action: 'Ver' },
];

export default function PerfilUsuario() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    nombre: 'ERP Admin',
    correo: 'admin@erpmetrics360.com',
    departamento: 'Data Science & Big Data',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    setEditing(false);
    showToast('Perfil actualizado correctamente ✓');
  };

  const handleAction = (activity: Activity) => {
    if (activity.action === 'Descargar') {
      setDownloadedIds((prev) => new Set(prev).add(activity.id));
      showToast(`Descargando "${activity.name}"...`);
    } else {
      showToast(`Abriendo "${activity.name}"...`, 'info');
    }
  };

  return (
    <>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <CheckCircle size={16} aria-hidden="true" />
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <h1 className="page-title">Perfil de Usuario</h1>
      <p className="page-subtitle">Gestiona tu perfil de analista, seguridad y preferencias de visualización.</p>

      <div className="profile-layout">
        {/* ---- Left: Profile Card ---- */}
        <div className="profile-sidebar-card">
          <div className="profile-avatar-large" aria-hidden="true">CR</div>
          <div className="profile-name">Carlos Ruiz</div>
          <div className="profile-email">carlosruiz@gmail.com</div>
          <div className="profile-role-badge">Rol: Especialista Big Data</div>

          <div className="profile-meta">
            <div className="profile-meta-item">
              <div className="profile-meta-label">Último acceso</div>
              <div className="profile-meta-value">Hoy, 09:41 AM</div>
            </div>
            <div className="profile-meta-item">
              <div className="profile-meta-label">Departamento</div>
              <div className="profile-meta-value">{profile.departamento}</div>
            </div>
          </div>
        </div>

        {/* ---- Right: Info + Activity ---- */}
        <div className="profile-main">
          {/* Personal Info */}
          <div className="admin-card">
            <div className="card-header">
              <h2 className="card-title">Información Personal</h2>
              <button
                className="card-action-btn"
                onClick={() => editing ? handleSave() : setEditing(true)}
                aria-label={editing ? 'Guardar' : 'Editar'}
              >
                {editing ? <Save size={16} /> : <Edit size={16} />}
              </button>
            </div>

            <div className="profile-info-grid">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  className="form-input"
                  type="text"
                  value={profile.nombre}
                  onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  className="form-input"
                  type="email"
                  value={profile.correo}
                  onChange={(e) => setProfile({ ...profile, correo: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>
            {editing && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn-cancel" onClick={() => setEditing(false)}>Cancelar</button>
                <button className="btn-save-db" onClick={handleSave}><Save size={14} /> Guardar</button>
              </div>
            )}
          </div>

          {/* Activity Report */}
          <div className="admin-card">
            <div className="card-header">
              <h2 className="card-title">Informe de Actividad</h2>
            </div>

            <div className="activity-stats">
              <div className="activity-stat-card">
                <div className="activity-stat-label">Total de Reportes</div>
                <div className="activity-stat-value">12</div>
              </div>
              <div className="activity-stat-card">
                <div className="activity-stat-label">Último Informe</div>
                <div className="activity-stat-text">Análisis Q3</div>
              </div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Actividad Reciente
            </h3>

            <div className="activity-list">
              {activities.map((act) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-item-icon">
                    <FileText size={16} aria-hidden="true" />
                  </div>
                  <div className="activity-item-info">
                    <div className="activity-item-name">{act.name}</div>
                    <div className="activity-item-date">{act.date}</div>
                  </div>
                  <button
                    className="activity-item-action"
                    onClick={() => handleAction(act)}
                    style={downloadedIds.has(act.id) ? { color: '#22c55e' } : {}}
                  >
                    {downloadedIds.has(act.id) ? '✓ Descargado' : act.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
