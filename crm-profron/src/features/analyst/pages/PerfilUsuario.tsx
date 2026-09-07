import { useState } from 'react';
import {
  FileText,
  Edit,
  CheckCircle,
  Save,
  X,
  Eye,
  Download,
  ShieldCheck,
  Clock,
  Building,
} from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  date: string;
  category: string;
  downloads: number;
}

const initialActivities: Activity[] = [
  { id: '1', name: 'Reporte de Ventas Mensual Q3', date: '15 Oct, 2023', category: 'Retail', downloads: 14 },
  { id: '2', name: 'Análisis de Inventario Regional', date: '02 Oct, 2023', category: 'Logística', downloads: 8 },
  { id: '3', name: 'Benchmark Precios vs. Competencia', date: '28 Sep, 2023', category: 'Pricing', downloads: 22 },
  { id: '4', name: 'Métricas de Ventas Omnicanal', date: '15 Sep, 2023', category: 'E-Commerce', downloads: 19 },
  { id: '5', name: 'Dashboard KPIs Regional Norte', date: '01 Sep, 2023', category: 'Finanzas', downloads: 31 },
];

export default function PerfilUsuario() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    nombre: 'Carlos Ruiz',
    correo: 'carlos.ruiz@retailmetrics.com',
    departamento: 'Data Science & Analytics',
    cargo: 'Analista Senior de Pricing',
  });
  const [activities] = useState<Activity[]>(initialActivities);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    setEditing(false);
    showToast('Perfil de analista actualizado correctamente ✓');
  };

  const handleDownload = (act: Activity) => {
    setDownloadedIds((prev) => new Set(prev).add(act.id));
    showToast(`Descargando "${act.name}" en formato Excel... ✓`);
  };

  const handleView = (act: Activity) => {
    setViewingActivity(act);
  };

  return (
    <div className="analyst-profile-page">
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

      {/* Activity Preview Modal */}
      {viewingActivity && (
        <div className="modal-overlay" onClick={() => setViewingActivity(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-active" style={{ fontSize: 11 }}>
                  {viewingActivity.category}
                </span>
                <h3 style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>{viewingActivity.name}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{viewingActivity.date}</span>
              </div>
              <button className="modal-close" onClick={() => setViewingActivity(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">
                Registro de telemetría y consolidación de dataset procesado por el analista <strong>{profile.nombre}</strong>.
              </p>
              <div className="modal-preview">
                <div className="mock-chart">
                  <div className="mock-chart-bar" style={{ height: '70%', background: '#4f8cff' }} />
                  <div className="mock-chart-bar" style={{ height: '85%', background: '#22c55e' }} />
                  <div className="mock-chart-bar" style={{ height: '40%', background: '#f59e0b' }} />
                  <div className="mock-chart-bar" style={{ height: '90%', background: '#6366f1' }} />
                </div>
                <p className="mock-chart-label">Vista de telemetría generada</p>
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setViewingActivity(null)}>
                  Cerrar
                </button>
                <button className="btn-primary" onClick={() => { handleDownload(viewingActivity); setViewingActivity(null); }}>
                  <Download size={14} /> Descargar Archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="page-title">Mi Perfil de Analista</h1>
      <p className="page-subtitle">
        Gestiona tu información profesional, credenciales de analítica y consulta el historial de entregables generados.
      </p>

      <div className="profile-layout">
        {/* ---- Left: Profile Card ---- */}
        <div className="profile-sidebar-card">
          <div className="profile-avatar-large" style={{ background: 'linear-gradient(135deg, #4f8cff, #6366f1)' }} aria-hidden="true">
            CR
          </div>
          <div className="profile-name">{profile.nombre}</div>
          <div className="profile-email">{profile.correo}</div>
          <div className="profile-role-badge">Rol: Usuario Analista</div>

          <div className="profile-meta">
            <div className="profile-meta-item">
              <div className="profile-meta-label">
                <Clock size={11} style={{ display: 'inline', marginRight: 4 }} /> Último acceso
              </div>
              <div className="profile-meta-value">Hoy, 09:41 AM</div>
            </div>
            <div className="profile-meta-item">
              <div className="profile-meta-label">
                <Building size={11} style={{ display: 'inline', marginRight: 4 }} /> Departamento
              </div>
              <div className="profile-meta-value">{profile.departamento}</div>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
              <ShieldCheck size={16} /> 2FA Habilitado en Cuenta
            </div>
          </div>
        </div>

        {/* ---- Right: Info + Activity ---- */}
        <div className="profile-main">
          {/* Personal Info Card */}
          <div className="admin-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Información Personal</h2>
                <p className="card-subtitle">Datos de contacto corporativos y cargo activo</p>
              </div>
              <button
                className="card-action-btn"
                onClick={() => (editing ? handleSave() : setEditing(true))}
                aria-label={editing ? 'Guardar' : 'Editar'}
                title={editing ? 'Guardar cambios' : 'Editar datos'}
              >
                {editing ? <Save size={16} /> : <Edit size={16} />}
              </button>
            </div>

            <div className="profile-info-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="perf-nombre">Nombre Completo</label>
                <input
                  id="perf-nombre"
                  className="form-input"
                  type="text"
                  value={profile.nombre}
                  onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="perf-correo">Correo Electrónico Corporativo</label>
                <input
                  id="perf-correo"
                  className="form-input"
                  type="email"
                  value={profile.correo}
                  onChange={(e) => setProfile({ ...profile, correo: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="perf-dept">Departamento</label>
                <input
                  id="perf-dept"
                  className="form-input"
                  type="text"
                  value={profile.departamento}
                  onChange={(e) => setProfile({ ...profile, departamento: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="perf-cargo">Cargo</label>
                <input
                  id="perf-cargo"
                  className="form-input"
                  type="text"
                  value={profile.cargo}
                  onChange={(e) => setProfile({ ...profile, cargo: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>

            {editing && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn-cancel" onClick={() => setEditing(false)}>
                  Cancelar
                </button>
                <button className="btn-save-db" onClick={handleSave}>
                  <Save size={14} /> Guardar Cambios
                </button>
              </div>
            )}
          </div>

          {/* Activity Report with Standardized Ver and Descargar Actions */}
          <div className="admin-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Informe de Actividad Reciente</h2>
                <p className="card-subtitle">Entregables y análisis generados durante tus sesiones de trabajo</p>
              </div>
            </div>

            <div className="activity-stats">
              <div className="activity-stat-card">
                <div className="activity-stat-label">Total de Reportes Generados</div>
                <div className="activity-stat-value">12</div>
              </div>
              <div className="activity-stat-card">
                <div className="activity-stat-label">Último Workspace Editado</div>
                <div className="activity-stat-text">Análisis Q3 - Medicamentos</div>
              </div>
            </div>

            <div className="activity-table-wrapper">
              <table className="activity-standard-table">
                <thead>
                  <tr>
                    <th>Reporte / Análisis</th>
                    <th>Categoría</th>
                    <th>Fecha</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act) => (
                    <tr key={act.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="activity-item-icon">
                            <FileText size={16} aria-hidden="true" />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                            {act.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-active" style={{ fontSize: 11 }}>
                          {act.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{act.date}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn-activity-action view"
                            onClick={() => handleView(act)}
                            title={`Ver detalles de ${act.name}`}
                          >
                            <Eye size={13} /> Ver
                          </button>
                          <button
                            className={`btn-activity-action download ${downloadedIds.has(act.id) ? 'downloaded' : ''}`}
                            onClick={() => handleDownload(act)}
                            title={`Descargar ${act.name}`}
                          >
                            <Download size={13} />
                            {downloadedIds.has(act.id) ? 'Descargado' : 'Descargar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
