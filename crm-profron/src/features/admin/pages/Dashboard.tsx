import { useState } from 'react';
import {
  Users,
  Activity,
  Database,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  ArrowUpRight,
  Server,
  UserPlus,
  BarChart3,
  FileText,
} from 'lucide-react';

interface AuditItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'upload' | 'user' | 'report' | 'system';
}

const initialAuditLogs: AuditItem[] = [
  {
    id: '1',
    user: 'Carlos Ruiz',
    action: 'Subió y validó dataset',
    target: 'ventas_q3_retail.csv (12.4 MB)',
    time: 'Hace 12 min',
    type: 'upload',
  },
  {
    id: '2',
    user: 'Laura Mendoza',
    action: 'Generó reporte ejecutivo',
    target: 'Optimización de Inventario Q3',
    time: 'Hace 45 min',
    type: 'report',
  },
  {
    id: '3',
    user: 'Retail Admin',
    action: 'Registró nuevo analista',
    target: 'ana.garcia@retail.com',
    time: 'Hace 2 horas',
    type: 'user',
  },
  {
    id: '4',
    user: 'Sistema',
    action: 'Copia de seguridad automática completada',
    target: 'Snapshot DB #4829',
    time: 'Hace 4 horas',
    type: 'system',
  },
  {
    id: '5',
    user: 'Miguel Torres',
    action: 'Actualizó permisos en workspace',
    target: 'Presupuesto Q4 Regional',
    time: 'Hace 6 horas',
    type: 'user',
  },
];

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [logs] = useState<AuditItem[]>(initialAuditLogs);

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1 className="page-title">Dashboard Ejecutivo</h1>
          <p className="page-subtitle">
            Resumen en tiempo real del estado de la plataforma, actividad de analistas y métricas del sistema.
          </p>
        </div>
      </div>

      {/* ---- 4 KPI Cards ---- */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">Usuarios Activos</span>
            <div className="kpi-icon-badge" style={{ background: 'rgba(79, 140, 255, 0.12)', color: 'var(--accent-blue)' }}>
              <Users size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="kpi-card-value">24</div>
          <div className="kpi-card-footer">
            <span className="kpi-trend positive">
              <TrendingUp size={13} /> +12%
            </span>
            <span className="kpi-subtext">vs. mes anterior</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">Sesiones Abiertas</span>
            <div className="kpi-icon-badge" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' }}>
              <Activity size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="kpi-card-value">8</div>
          <div className="kpi-card-footer">
            <span className="kpi-badge-live">
              <span className="live-dot" /> 3 editando en vivo
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">Datasets Cargados (Mes)</span>
            <div className="kpi-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
              <Database size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="kpi-card-value">142</div>
          <div className="kpi-card-footer">
            <span className="kpi-trend positive">
              <TrendingUp size={13} /> +18.4%
            </span>
            <span className="kpi-subtext">1.8 GB procesados</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">Salud de la API</span>
            <div className="kpi-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <CheckCircle2 size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="kpi-card-value" style={{ color: '#10b981' }}>99.9%</div>
          <div className="kpi-card-footer">
            <span className="kpi-badge-healthy">Operativo</span>
            <span className="kpi-subtext">Latencia: 42ms</span>
          </div>
        </div>
      </div>

      {/* ---- Main Panels: Activity + System Overview ---- */}
      <div className="admin-panels" style={{ marginTop: 24 }}>
        {/* Left: Recent Activity Log */}
        <div className="admin-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Clock size={18} aria-hidden="true" />
                Actividad Reciente del Sistema
              </h2>
              <p className="card-subtitle">Auditoría en tiempo real de eventos y acciones</p>
            </div>
            <span className="badge badge-active" style={{ fontSize: 11 }}>En vivo</span>
          </div>

          <div className="audit-list">
            {logs.map((log) => (
              <div key={log.id} className="audit-item">
                <div className="audit-icon-wrapper">
                  {log.type === 'upload' && <FileSpreadsheet size={15} style={{ color: '#4f8cff' }} />}
                  {log.type === 'report' && <BarChart3 size={15} style={{ color: '#22c55e' }} />}
                  {log.type === 'user' && <Users size={15} style={{ color: '#a855f7' }} />}
                  {log.type === 'system' && <Server size={15} style={{ color: '#f59e0b' }} />}
                </div>
                <div className="audit-info">
                  <div className="audit-user-line">
                    <span className="audit-user">{log.user}</span>
                    <span className="audit-action">{log.action}</span>
                  </div>
                  <span className="audit-target">{log.target}</span>
                </div>
                <span className="audit-time">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Infrastructure & Quick Actions */}
        <div className="admin-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <ShieldCheck size={18} aria-hidden="true" />
                Infraestructura y Accesos Rápidos
              </h2>
              <p className="card-subtitle">Estado de servicios y operaciones frecuentes</p>
            </div>
          </div>

          {/* Quick Services Status */}
          <div className="services-status-list">
            <div className="service-row">
              <div className="service-info">
                <span className="service-name">Motor de Ingesta CSV / XLSX</span>
                <span className="service-sub">Pipeline de validación y parsing</span>
              </div>
              <span className="badge badge-active">Activo</span>
            </div>

            <div className="service-row">
              <div className="service-info">
                <span className="service-name">Almacenamiento de Datasets</span>
                <span className="service-sub">12.8 GB / 50 GB utilizados (25.6%)</span>
              </div>
              <div className="storage-mini-bar">
                <div className="storage-fill" style={{ width: '25.6%' }} />
              </div>
            </div>

            <div className="service-row">
              <div className="service-info">
                <span className="service-name">Servicio de Generación de Reportes</span>
                <span className="service-sub">PDFKit & Excel Exporter</span>
              </div>
              <span className="badge badge-active">Activo</span>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginTop: 24, marginBottom: 12 }}>
            Acciones Rápidas
          </h3>
          <div className="quick-actions-grid">
            <button
              className="quick-action-btn"
              onClick={() => onNavigate && onNavigate('usuarios')}
            >
              <div className="quick-action-icon">
                <UserPlus size={16} />
              </div>
              <div className="quick-action-text">
                <span className="quick-action-title">Gestionar Usuarios</span>
                <span className="quick-action-sub">Altas y asignación</span>
              </div>
              <ArrowUpRight size={14} className="quick-action-arrow" />
            </button>

            <button
              className="quick-action-btn"
              onClick={() => onNavigate && onNavigate('tendencias')}
            >
              <div className="quick-action-icon">
                <BarChart3 size={16} />
              </div>
              <div className="quick-action-text">
                <span className="quick-action-title">Ver Tendencias</span>
                <span className="quick-action-sub">Sectores y avance</span>
              </div>
              <ArrowUpRight size={14} className="quick-action-arrow" />
            </button>

            <button
              className="quick-action-btn"
              onClick={() => onNavigate && onNavigate('reportes')}
            >
              <div className="quick-action-icon">
                <FileText size={16} />
              </div>
              <div className="quick-action-text">
                <span className="quick-action-title">Centro de Reportes</span>
                <span className="quick-action-sub">Descargas y métricas</span>
              </div>
              <ArrowUpRight size={14} className="quick-action-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
