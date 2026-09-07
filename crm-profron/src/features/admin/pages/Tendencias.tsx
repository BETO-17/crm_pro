import { useState } from 'react';
import {
  ShoppingCart,
  Clock,
  Truck,
  Plus,
  CheckCircle,
  X,
  Zap,
  Target,
  BarChart3,
  Building2,
} from 'lucide-react';
import type { StrategyStatus } from '../../../types';

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
  { name: 'Retail', percentage: 45, analysts: 189, color: '#4f8cff' },
  { name: 'Tecnología', percentage: 25, analysts: 105, color: '#6366f1' },
  { name: 'Logística', percentage: 15, analysts: 63, color: '#22c55e' },
  { name: 'Salud & Otros', percentage: 15, analysts: 63, color: '#f59e0b' },
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

  const totalAnalysts = sectors.reduce((acc, s) => acc + s.analysts, 0);

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
      description: 'Nueva iniciativa estratégica para optimización operativa.',
      status: 'Planeado',
      icon: icons[idx],
      progress: 10,
      owner: 'Carlos Ruiz',
    };
    setStrategies((prev) => [...prev, newStrategy]);
    showToast(`Estrategia "${newNames[idx]}" creada ✓`);
  };

  const removeStrategy = (id: string) => {
    const s = strategies.find((st) => st.id === id);
    setStrategies((prev) => prev.filter((st) => st.id !== id));
    showToast(`"${s?.title}" eliminada`, 'info');
  };

  const averageProgress = Math.round(
    strategies.reduce((a, s) => a + s.progress, 0) / (strategies.length || 1)
  );

  return (
    <div className="tendencias-page">
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

      {/* Page Header */}
      <h1 className="page-title">Tendencias y Estrategias</h1>
      <p className="page-subtitle">
        Monitoreo de distribución de actividad por sector de negocio y control de avance de iniciativas operativas.
      </p>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-chip">
          <span className="stat-chip-number">{totalAnalysts}</span>
          <span className="stat-chip-label">Total analistas activos</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{sectors.length}</span>
          <span className="stat-chip-label">Sectores monitoreados</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{strategies.filter((s) => s.status === 'En Progreso').length}</span>
          <span className="stat-chip-label">Estrategias en progreso</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number">{averageProgress}%</span>
          <span className="stat-chip-label">Avance global promedio</span>
        </div>
      </div>

      <div className="admin-panels">
        {/* ---- Left: Semantic Horizontal Bars for Sector Distribution ---- */}
        <div className="admin-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <BarChart3 size={18} aria-hidden="true" />
                Distribución de Analistas por Sector
              </h2>
              <p className="card-subtitle">
                Proporción de carga de trabajo analítica clasificada por verticales de industria.
              </p>
            </div>
            <div className="badge badge-active" style={{ fontSize: 12 }}>
              {totalAnalysts} analistas
            </div>
          </div>

          <div className="sectors-bars-container">
            {sectors.map((sector) => {
              const isSelected = selectedSector === sector.name;
              return (
                <div
                  key={sector.name}
                  className={`sector-progress-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedSector(isSelected ? null : sector.name)}
                >
                  <div className="sector-bar-header">
                    <div className="sector-bar-left">
                      <span className="sector-dot" style={{ background: sector.color }} />
                      <span className="sector-name">{sector.name}</span>
                    </div>
                    <div className="sector-bar-right">
                      <span className="sector-count">{sector.analysts} analistas</span>
                      <span className="sector-percentage" style={{ color: sector.color }}>
                        {sector.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Semantic Horizontal Progress Bar in Pure Vanilla CSS */}
                  <div className="sector-progress-track">
                    <div
                      className="sector-progress-fill"
                      style={{
                        width: `${sector.percentage}%`,
                        background: sector.color,
                        opacity: selectedSector && !isSelected ? 0.35 : 1,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sector Breakdown Summary Footnote */}
          <div className="sector-summary-box">
            <Building2 size={16} className="summary-icon" />
            <p className="summary-text">
              El sector <strong>Retail</strong> concentra la mayor parte del volumen con <strong>45%</strong> de la capacidad analítica instalada, seguido por <strong>Tecnología</strong> con <strong>25%</strong>.
            </p>
          </div>
        </div>

        {/* ---- Right: Operative Strategies ---- */}
        <div className="admin-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Target size={18} aria-hidden="true" />
                Estrategias Operativas
              </h2>
              <p className="card-subtitle">Iniciativas clave de optimización y seguimiento de avance.</p>
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
                        title="Click para alternar estado"
                      >
                        {strategy.status}
                      </button>
                    </div>
                    <p className="strategy-desc">{strategy.description}</p>

                    {/* Unified Color Palette Progress Bar */}
                    <div className="strategy-progress-wrapper">
                      <div className="strategy-progress-bar">
                        <div
                          className="strategy-progress-fill-unified"
                          style={{ width: `${strategy.progress}%` }}
                        />
                      </div>
                      <span className="strategy-progress-label-unified">{strategy.progress}%</span>
                    </div>

                    <div className="strategy-meta">
                      <span className="strategy-owner">👤 {strategy.owner}</span>
                      <button
                        className="strategy-remove"
                        onClick={() => removeStrategy(strategy.id)}
                        aria-label={`Eliminar estrategia ${strategy.title}`}
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
                <p>No hay estrategias activas. Crea una nueva para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
