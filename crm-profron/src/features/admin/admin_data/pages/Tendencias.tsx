import { useState } from 'react';
import {
  ShoppingCart,
  Clock,
  Truck,
  MoreHorizontal,
  Plus,
  CheckCircle,
  X,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react';
import type { StrategyStatus } from '../../../../core/types';

interface Strategy {
  id: string;
  title: string;
  description: string;
  status: StrategyStatus;
  icon: 'cart' | 'clock' | 'truck' | 'zap' | 'target';
  progress: number;
  owner: string;
}

const initialStrategies: Strategy[] = [
  {
    id: '1',
    title: 'Optimización de Ventas Omnicanal',
    description:
      'Implementar sincronización de inventario en tiempo real entre tiendas físicas y e-commerce para reducir rupturas de stock en un 15%.',
    status: 'En Progreso',
    icon: 'cart',
    progress: 65,
    owner: 'Carlos Ruiz',
  },
  {
    id: '2',
    title: 'Eficiencia en Turnos Laborales',
    description:
      'Reorganizar los horarios del personal basándose en el análisis predictivo de tráfico en tienda, buscando una mejora del 20% en la cobertura en horas pico.',
    status: 'Planeado',
    icon: 'clock',
    progress: 15,
    owner: 'Laura Mendoza',
  },
  {
    id: '3',
    title: 'Reestructuración Logística',
    description:
      'Consolidar nodos de distribución regionales para acortar tiempos de entrega en última milla.',
    status: 'Revisión',
    icon: 'truck',
    progress: 85,
    owner: 'Miguel Torres',
  },
];

const sectors = [
  { name: 'Retail', percentage: 45, color: '#0a0e1a' },
  { name: 'Tecnología', percentage: 25, color: '#4f8cff' },
  { name: 'Logística', percentage: 15, color: '#6b7280' },
  { name: 'Salud & Otros', percentage: 15, color: '#9ca3af' },
];

const iconMap = {
  cart: ShoppingCart,
  clock: Clock,
  truck: Truck,
  zap: Zap,
  target: Target,
};

const statusClass: Record<StrategyStatus, string> = {
  'En Progreso': 'badge-progress',
  'Planeado': 'badge-planned',
  'Revisión': 'badge-review',
};

const statusCycle: StrategyStatus[] = ['Planeado', 'En Progreso', 'Revisión'];

export default function Tendencias() {
  const [strategies, setStrategies] = useState(initialStrategies);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalAnalysts = sectors.reduce((acc, s) => acc + Math.round(420 * s.percentage / 100), 0);

  const cycleStatus = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentIndex = statusCycle.indexOf(s.status);
          const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
          showToast(`"${s.title}" → ${nextStatus}`, 'info');
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const addStrategy = () => {
    const newNames = [
      'Expansión Digital Q4',
      'Automatización de Reportes',
      'Programa de Fidelización',
      'Análisis Predictivo de Demanda',
    ];
    const icons: Strategy['icon'][] = ['zap', 'target', 'cart', 'clock'];
    const idx = strategies.length % newNames.length;
    const newStrategy: Strategy = {
      id: Date.now().toString(),
      title: newNames[idx],
      description: 'Nueva iniciativa estratégica pendiente de definición detallada del alcance y recursos.',
      status: 'Planeado',
      icon: icons[idx],
      progress: 0,
      owner: 'Sin asignar',
    };
    setStrategies((prev) => [...prev, newStrategy]);
    showToast(`Estrategia "${newNames[idx]}" creada`);
  };

  const removeStrategy = (id: string) => {
    const s = strategies.find((st) => st.id === id);
    setStrategies((prev) => prev.filter((st) => st.id !== id));
    showToast(`"${s?.title}" eliminada`, 'info');
  };

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

      <h1 className="page-title">Tendencias</h1>
      <p className="page-subtitle">Análisis de distribución y estrategias operativas</p>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-chip">
          <span className="stat-chip-number">{totalAnalysts}</span>
          <span className="stat-chip-label">Total analistas</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{strategies.filter((s) => s.status === 'En Progreso').length}</span>
          <span className="stat-chip-label">En progreso</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{sectors.length}</span>
          <span className="stat-chip-label">Sectores activos</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{Math.round(strategies.reduce((a, s) => a + s.progress, 0) / strategies.length)}%</span>
          <span className="stat-chip-label">Avance promedio</span>
        </div>
      </div>

      <div className="admin-panels">
        {/* ---- Left: Sector Distribution ---- */}
        <div className="admin-card">
          <div className="card-header">
            <h2 className="card-title">
              <BarChart3 size={18} aria-hidden="true" />
              Distribución de Analistas por Sector
            </h2>
            <button className="card-action-btn" aria-label="Más opciones">
              <MoreHorizontal size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="diamond-chart-container">
            <div className="diamond-shape" aria-label={`${totalAnalysts} total analistas`}>
              <div className="diamond-inner">
                <div className="diamond-number">{totalAnalysts}</div>
                <div className="diamond-label">Total Analistas</div>
              </div>
            </div>

            <div className="sector-legend" role="list" aria-label="Distribución por sector">
              {sectors.map((sector) => (
                <button
                  key={sector.name}
                  className={`sector-item ${selectedSector === sector.name ? 'sector-selected' : ''}`}
                  onClick={() => setSelectedSector(selectedSector === sector.name ? null : sector.name)}
                  role="listitem"
                >
                  <span
                    className="sector-dot"
                    style={{ background: sector.color }}
                    aria-hidden="true"
                  />
                  <span>{sector.name} ({sector.percentage}%)</span>
                  <span className="sector-count">{Math.round(420 * sector.percentage / 100)}</span>
                </button>
              ))}
            </div>

            {/* Sector Bars */}
            <div className="sector-bars">
              {sectors.map((sector) => (
                <div key={sector.name} className="sector-bar-row">
                  <div className="sector-bar-track">
                    <div
                      className="sector-bar-fill"
                      style={{
                        width: `${sector.percentage}%`,
                        background: sector.color,
                        opacity: selectedSector && selectedSector !== sector.name ? 0.3 : 1,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Right: Operative Strategies ---- */}
        <div className="admin-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Estrategias Operativas</h2>
              <p className="card-subtitle">Iniciativas clave para optimización Q3</p>
            </div>
            <button className="btn-new-strategy" onClick={addStrategy}>
              <Plus size={14} aria-hidden="true" />
              Nueva
            </button>
          </div>

          <div className="strategies-list">
            {strategies.map((strategy) => {
              const Icon = iconMap[strategy.icon];
              return (
                <div key={strategy.id} className="strategy-item">
                  <div className="strategy-icon">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="strategy-content">
                    <div className="strategy-title-row">
                      <span className="strategy-title">{strategy.title}</span>
                      <button
                        className={`badge ${statusClass[strategy.status]} badge-clickable`}
                        onClick={() => cycleStatus(strategy.id)}
                        title="Click para cambiar estado"
                      >
                        {strategy.status}
                      </button>
                    </div>
                    <p className="strategy-desc">{strategy.description}</p>

                    {/* Progress Bar */}
                    <div className="strategy-progress">
                      <div className="strategy-progress-bar">
                        <div
                          className="strategy-progress-fill"
                          style={{ width: `${strategy.progress}%` }}
                        />
                      </div>
                      <span className="strategy-progress-label">{strategy.progress}%</span>
                    </div>

                    <div className="strategy-meta">
                      <span className="strategy-owner">👤 {strategy.owner}</span>
                      <button
                        className="strategy-remove"
                        onClick={() => removeStrategy(strategy.id)}
                        aria-label={`Eliminar ${strategy.title}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {strategies.length === 0 && (
              <div className="empty-state">
                <Target size={32} />
                <p>No hay estrategias. Crea una nueva para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
