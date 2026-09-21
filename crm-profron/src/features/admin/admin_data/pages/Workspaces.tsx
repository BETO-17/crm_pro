import { useState } from 'react';
import {
  Plus,
  SlidersHorizontal,
  Clock,
  FolderOpen,
  Archive,
  MoreVertical,
  Users,
  CheckCircle,
  X,
  Trash2,
  Star,
  StarOff,
} from 'lucide-react';

interface WorkspaceSession {
  id: string;
  analyst: string;
  role: string;
  initials: string;
  avatarColor: string;
  tag: string;
  tagColor: string;
  title: string;
  timeLabel: string;
  collaborators?: number;
  starred: boolean;
}

interface SidebarItem {
  id: string;
  name: string;
  meta: string;
}

const initialSessions: WorkspaceSession[] = [
  {
    id: '1',
    analyst: 'Carlos Ruiz',
    role: 'Analista Senior',
    initials: 'CR',
    avatarColor: '#4f8cff',
    tag: 'Retail',
    tagColor: '#ef4444',
    title: 'Análisis Q3 - Rubro de Medicamentos',
    timeLabel: 'Editando ahora',
    collaborators: 3,
    starred: true,
  },
  {
    id: '2',
    analyst: 'Laura Mendoza',
    role: 'Logística',
    initials: 'LM',
    avatarColor: '#a855f7',
    tag: 'Inventario',
    tagColor: '#f59e0b',
    title: 'Optimización de Inventario',
    timeLabel: 'Hace 15 min',
    starred: false,
  },
  {
    id: '3',
    analyst: 'Sonia Sandoval',
    role: 'Analista',
    initials: 'SS',
    avatarColor: '#22c55e',
    tag: 'Global',
    tagColor: '#3b82f6',
    title: 'empresa import ing - sector tecnología',
    timeLabel: 'Activo ahora',
    starred: false,
  },
  {
    id: '4',
    analyst: 'Miguel Torres',
    role: 'Gerente',
    initials: 'MT',
    avatarColor: '#06b6d4',
    tag: 'Finanzas',
    tagColor: '#8b5cf6',
    title: 'Presupuesto Q4 - Regional Norte',
    timeLabel: 'Hace 2h',
    collaborators: 2,
    starred: true,
  },
  {
    id: '5',
    analyst: 'Ana García',
    role: 'Analista',
    initials: 'AG',
    avatarColor: '#f59e0b',
    tag: 'Supply Chain',
    tagColor: '#22c55e',
    title: 'Rutas de distribución última milla',
    timeLabel: 'Ayer',
    starred: false,
  },
];

const initialShared: SidebarItem[] = [
  { id: '1', name: 'KPIs Anuales', meta: 'Por: Elaine R.' },
  { id: '2', name: 'Dashboard Q3', meta: 'Por: Carlos R.' },
  { id: '3', name: 'Métricas Retail', meta: 'Por: Laura M.' },
];

const initialArchived: SidebarItem[] = [
  { id: '1', name: 'Cierre 2023', meta: 'Hace 3 meses' },
  { id: '2', name: 'Auditoría Q2', meta: 'Hace 5 meses' },
];

export default function Workspaces() {
  const [sessions, setSessions] = useState(initialSessions);
  const [shared, setShared] = useState(initialShared);
  const [archived, setArchived] = useState(initialArchived);
  const [filterMode, setFilterMode] = useState<'all' | 'starred' | 'recent'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleStar = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          showToast(
            s.starred ? `"${s.title}" removido de favoritos` : `"${s.title}" agregado a favoritos`,
            'info'
          );
          return { ...s, starred: !s.starred };
        }
        return s;
      })
    );
  };

  const deleteSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setArchived((prev) => [...prev, { id: Date.now().toString(), name: session.title, meta: 'Ahora mismo' }]);
      showToast(`"${session.title}" archivado`, 'info');
    }
  };

  const createWorkspace = () => {
    if (!newWsName.trim()) return;
    const colors = ['#4f8cff', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
    const tags = ['Retail', 'Logística', 'Finanzas', 'Tech', 'Supply Chain'];
    const tagColors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#22c55e'];
    const idx = sessions.length % colors.length;
    const newSession: WorkspaceSession = {
      id: Date.now().toString(),
      analyst: 'Retail Admin',
      role: 'Administrador',
      initials: 'RA',
      avatarColor: colors[idx],
      tag: tags[idx % tags.length],
      tagColor: tagColors[idx % tagColors.length],
      title: newWsName,
      timeLabel: 'Ahora mismo',
      starred: false,
    };
    setSessions((prev) => [newSession, ...prev]);
    setNewWsName('');
    setShowCreate(false);
    showToast(`Workspace "${newWsName}" creado`);
  };

  const restoreArchived = (id: string) => {
    const item = archived.find((a) => a.id === id);
    if (item) {
      setArchived((prev) => prev.filter((a) => a.id !== id));
      showToast(`"${item.name}" restaurado`, 'info');
    }
  };

  const deleteShared = (id: string) => {
    const item = shared.find((s) => s.id === id);
    setShared((prev) => prev.filter((s) => s.id !== id));
    showToast(`"${item?.name}" removido de compartidos`, 'info');
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterMode === 'starred') return s.starred;
    return true;
  }).sort((a, b) => {
    if (filterMode === 'recent') {
      if (a.timeLabel.includes('ahora') || a.timeLabel.includes('Editando')) return -1;
      if (b.timeLabel.includes('ahora') || b.timeLabel.includes('Editando')) return 1;
      return 0;
    }
    return 0;
  });

  return (
    <>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <CheckCircle size={16} aria-hidden="true" />
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Workspace</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="ws-name">Nombre del Workspace</label>
                <input
                  id="ws-name"
                  className="form-input"
                  type="text"
                  placeholder="Ej. Análisis Q4 Retail"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && createWorkspace()}
                />
              </div>
              <button className="btn-primary" onClick={createWorkspace}>
                <Plus size={16} aria-hidden="true" />
                Crear Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="workspaces-header">
        <div>
          <h1 className="page-title">Workspaces</h1>
          <p className="page-subtitle">Gestiona y analiza tus sesiones de datos.</p>
        </div>
        <button className="btn-create-workspace" onClick={() => setShowCreate(true)}>
          <Plus size={16} aria-hidden="true" />
          Crear Nuevo Workspace
        </button>
      </div>

      <div className="workspaces-content">
        {/* ---- Sessions ---- */}
        <div className="sessions-section">
          <div className="sessions-header">
            <h2 className="sessions-title">
              Sesiones de Equipo
              <span className="sessions-count">{filteredSessions.length}</span>
            </h2>
            <div className="sessions-filters">
              <button
                className={`session-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                <SlidersHorizontal size={14} aria-hidden="true" />
                Todas
              </button>
              <button
                className={`session-filter-btn ${filterMode === 'starred' ? 'active' : ''}`}
                onClick={() => setFilterMode('starred')}
              >
                <Star size={14} aria-hidden="true" />
                Favoritas
              </button>
              <button
                className={`session-filter-btn ${filterMode === 'recent' ? 'active' : ''}`}
                onClick={() => setFilterMode('recent')}
              >
                <Clock size={14} aria-hidden="true" />
                Recientes
              </button>
            </div>
          </div>

          <div className="sessions-grid">
            {filteredSessions.map((session) => (
              <article key={session.id} className="session-card">
                <div className="session-card-header">
                  <div
                    className="session-avatar"
                    style={{ background: session.avatarColor }}
                    aria-hidden="true"
                  >
                    {session.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="session-user-name">{session.analyst}</div>
                    <div className="session-user-role">{session.role}</div>
                  </div>
                  <button
                    className="session-star-btn"
                    onClick={(e) => { e.stopPropagation(); toggleStar(session.id); }}
                    aria-label={session.starred ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    {session.starred ? <Star size={14} fill="#f59e0b" color="#f59e0b" /> : <StarOff size={14} />}
                  </button>
                </div>

                <div className="session-card-preview">
                  <span
                    className="session-tag"
                    style={{ background: session.tagColor }}
                  >
                    {session.tag}
                  </span>
                </div>

                <div className="session-card-footer">
                  <div>
                    <div className="session-title">{session.title}</div>
                    <div className="session-time">{session.timeLabel}</div>
                  </div>
                  <div className="session-card-actions">
                    {session.collaborators && (
                      <div className="session-collab" aria-label={`${session.collaborators} colaboradores`}>
                        +{session.collaborators}
                      </div>
                    )}
                    <button
                      className="session-delete-btn"
                      onClick={() => deleteSession(session.id)}
                      aria-label={`Archivar ${session.title}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {filteredSessions.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <FolderOpen size={32} />
                <p>{filterMode === 'starred' ? 'No tienes sesiones favoritas.' : 'No hay sesiones activas.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* ---- Right Sidebar ---- */}
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-section">
            <h3 className="workspace-sidebar-title">
              <Users size={16} aria-hidden="true" />
              Compartidos ({shared.length})
            </h3>
            {shared.map((item) => (
              <div key={item.id} className="workspace-sidebar-item">
                <div className="ws-item-info">
                  <span className="ws-item-name">
                    <FolderOpen size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />
                    {item.name}
                  </span>
                  <span className="ws-item-meta">{item.meta}</span>
                </div>
                <button
                  className="ws-item-action"
                  onClick={() => deleteShared(item.id)}
                  aria-label={`Remover ${item.name}`}
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            ))}
            {shared.length === 0 && (
              <p className="ws-empty">No hay items compartidos</p>
            )}
          </div>

          <div className="workspace-sidebar-section">
            <h3 className="workspace-sidebar-title">
              <Archive size={16} aria-hidden="true" />
              Archivados ({archived.length})
            </h3>
            {archived.map((item) => (
              <div key={item.id} className="workspace-sidebar-item">
                <div className="ws-item-info">
                  <span className="ws-item-name">
                    <FolderOpen size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />
                    {item.name}
                  </span>
                  <span className="ws-item-meta">{item.meta}</span>
                </div>
                <button
                  className="ws-item-action"
                  onClick={() => restoreArchived(item.id)}
                  aria-label={`Restaurar ${item.name}`}
                  title="Restaurar"
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            ))}
            {archived.length === 0 && (
              <p className="ws-empty">No hay items archivados</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
