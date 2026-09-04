import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  metric: string;
  metricDetail: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      '"Antes de RetailMetrics 360, consolidar los CSVs de nuestras 64 tiendas tomaba 4 días cada fin de mes. Hoy, el parser inteligente procesa todo en 3 minutos. Redujimos el tiempo de preparación de reportes en un 40% y redirigimos a los analistas a encontrar oportunidades comerciales reales."',
    name: 'Martín Gómez Valdés',
    role: 'Director Corporativo de Operaciones',
    company: 'Grupo Vanguard Retail',
    initials: 'MG',
    metric: '-40% Tiempo de Reportes',
    metricDetail: '64 Sucursales',
  },
  {
    quote:
      '"La elasticidad predictiva de precios nos permitió liquidar stock estancado sin recurrir a remates ciegos del 50%. En tan solo un trimestre aumentamos el margen neto consolidado un 18% y supimos exactamente qué líneas de producto impulsar en la campaña de verano."',
    name: 'Sofía Larrea Ortiz',
    role: 'Chief Financial Officer',
    company: 'Distribuidora Continental',
    initials: 'SL',
    metric: '+18% Margen Neto',
    metricDetail: 'ROI comprobado en 45 días',
  },
];

const stats = [
  { value: '+$48M', label: 'Margen Adicional Generado' },
  { value: '14.2M', label: 'Filas Procesadas al Día' },
  { value: '99.98%', label: 'Disponibilidad de Plataforma' },
  { value: '450+', label: 'Marcas y Cadenas Conectadas' },
];

export default function TestimonialsSection() {
  return (
    <section className="landing-testimonials" id="casos" aria-labelledby="testimonials-title">
      <div className="landing-section-inner">
        <div className="landing-testimonials-header">
          <p className="landing-section-eyebrow">Validación en el Terreno</p>
          <h2 className="landing-section-title" id="testimonials-title">
            Líderes de operaciones y finanzas que transformaron sus números.
          </h2>
          <p className="landing-section-desc">
            Testimonios directos de corporaciones que reemplazaron procesos arcaicos por nuestra
            suite analítica.
          </p>
        </div>

        <div className="landing-testimonials-grid landing-animate-stagger">
          {testimonials.map((t) => (
            <article key={t.initials} className="landing-testimonial-card">
              <div className="landing-testimonial-stars" aria-label="5 de 5 estrellas">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#1a1d2e" stroke="#1a1d2e" />
                ))}
              </div>

              <blockquote className="landing-testimonial-quote">{t.quote}</blockquote>

              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar" aria-hidden="true">
                  {t.initials}
                </div>
                <div className="landing-testimonial-author-info">
                  <p className="landing-testimonial-name">{t.name}</p>
                  <p className="landing-testimonial-role">
                    {t.role} • {t.company}
                  </p>
                  <p className="landing-testimonial-metric">
                    <strong>{t.metric}</strong> • {t.metricDetail}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="landing-stats-bar landing-animate">
          {stats.map((s) => (
            <div key={s.label} className="landing-stat-item">
              <span className="landing-stat-value">{s.value}</span>
              <span className="landing-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
