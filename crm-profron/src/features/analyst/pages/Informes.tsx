import {
  FileText,
  TrendingUp,
  PieChart,
  BarChart3,
  Download,
  Eye,
  Share2,
} from 'lucide-react';

/* ---- Simulated Reports ---- */
interface Informe {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  iconBg: string;
  icon: 'file' | 'trend' | 'pie' | 'bar';
}

const informes: Informe[] = [
  {
    id: '1',
    title: 'Reporte de Ventas Q3 2023',
    date: 'Generado: 15 Oct, 2023',
    description: 'Análisis completo de ventas del tercer trimestre incluyendo métricas por región, categoría y canal de distribución.',
    tags: ['RETAIL', 'TRIMESTRAL', 'VENTAS'],
    iconBg: 'linear-gradient(135deg, #4f8cff, #6366f1)',
    icon: 'trend',
  },
  {
    id: '2',
    title: 'Análisis de Inventario Regional',
    date: 'Generado: 02 Oct, 2023',
    description: 'Estado del inventario por región con alertas de stock bajo, rotación de productos y proyecciones de demanda.',
    tags: ['LOGÍSTICA', 'INVENTARIO', 'MENSUAL'],
    iconBg: 'linear-gradient(135deg, #22c55e, #16a34a)',
    icon: 'bar',
  },
  {
    id: '3',
    title: 'Comparativa de Precios vs Competencia',
    date: 'Generado: 28 Sep, 2023',
    description: 'Benchmark de precios contra los 3 principales competidores del sector con análisis de elasticidad y margen.',
    tags: ['RETAIL', 'PRICING', 'COMPETENCIA'],
    iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: 'pie',
  },
  {
    id: '4',
    title: 'KPIs Dashboard Ejecutivo',
    date: 'Generado: 15 Sep, 2023',
    description: 'Resumen ejecutivo con los KPIs clave del negocio: revenue, CAC, LTV, NPS, y métricas operacionales.',
    tags: ['EJECUTIVO', 'KPI', 'MENSUAL'],
    iconBg: 'linear-gradient(135deg, #ec4899, #db2777)',
    icon: 'file',
  },
  {
    id: '5',
    title: 'Segmentación de Clientes RFM',
    date: 'Generado: 01 Sep, 2023',
    description: 'Análisis de segmentación por Recencia, Frecuencia y Monto con recomendaciones de campañas personalizadas.',
    tags: ['CLIENTES', 'SEGMENTACIÓN', 'ANALÍTICA'],
    iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    icon: 'pie',
  },
  {
    id: '6',
    title: 'Forecast de Ventas Q4 2023',
    date: 'Generado: 25 Aug, 2023',
    description: 'Modelo predictivo de ventas para el cuarto trimestre con escenarios optimista, base y conservador.',
    tags: ['FORECAST', 'MODELADO', 'TRIMESTRAL'],
    iconBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    icon: 'trend',
  },
];

const iconMap = {
  file: FileText,
  trend: TrendingUp,
  pie: PieChart,
  bar: BarChart3,
};

export default function Informes() {
  return (
    <>
      <h1 className="page-title">Informes y Reportes</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        Consulta, descarga y comparte los reportes generados a partir de tus análisis.
      </p>

      <div className="informes-grid">
        {informes.map((inf) => {
          const Icon = iconMap[inf.icon];
          return (
            <div key={inf.id} className="informe-card">
              <div className="informe-card-header">
                <div className="informe-icon" style={{ background: inf.iconBg }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="informe-title">{inf.title}</div>
                  <div className="informe-date">{inf.date}</div>
                </div>
              </div>
              <p className="informe-desc">{inf.description}</p>
              <div className="informe-tags">
                {inf.tags.map((tag) => (
                  <span key={tag} className="informe-tag">{tag}</span>
                ))}
              </div>
              <div className="informe-actions">
                <button className="btn-filter" style={{ fontSize: 12, padding: '6px 12px' }}>
                  <Download size={12} /> Descargar
                </button>
                <button className="btn-filter" style={{ fontSize: 12, padding: '6px 12px' }}>
                  <Eye size={12} /> Ver
                </button>
                <button className="btn-filter" style={{ fontSize: 12, padding: '6px 12px' }}>
                  <Share2 size={12} /> Compartir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
