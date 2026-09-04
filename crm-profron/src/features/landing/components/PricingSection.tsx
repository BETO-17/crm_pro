import { Check, X } from 'lucide-react';

interface PlanFeature {
  text: string;
  bold?: boolean;
  included: boolean;
}

interface PricingPlan {
  eyebrow: string;
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  billing?: string;
  features: PlanFeature[];
  cta: string;
  recommended?: boolean;
  ctaStyle: 'outlined' | 'filled';
}

const plans: PricingPlan[] = [
  {
    eyebrow: 'Plan Starter',
    name: 'Analistas Individuales',
    description:
      'Ideal para consultores y analistas independientes que necesitan procesar datos de una o dos marcas.',
    price: '$149',
    priceSuffix: '/ mes',
    billing: 'Facturación anual ($1,788/año)',
    features: [
      { text: 'Hasta 3 workspaces simultáneos', included: true },
      { text: 'Carga masiva: hasta 500k filas mensuales', included: true },
      { text: 'Módulo de elasticidad de precios estándar', included: true },
      { text: 'Exportación a Excel y PDF', included: true },
      { text: 'Asistente de IA en lenguaje natural', included: false },
      { text: 'Conexión directa vía API a ERP', included: false },
    ],
    cta: 'Elegir Plan Starter',
    ctaStyle: 'outlined',
  },
  {
    eyebrow: 'Plan Business',
    name: 'Empresas en Crecimiento',
    description:
      'Para retailers con múltiples sucursales y equipos que requieren workspaces colaborativos sin límites.',
    price: '$389',
    priceSuffix: '/ mes',
    billing: 'Facturación anual ($4,668/año)',
    recommended: true,
    features: [
      { text: 'Workspaces ilimitados con permisos por rol', included: true, bold: true },
      { text: 'Carga masiva: hasta 10 millones de filas', included: true },
      { text: 'Asistente de IA Integrado (NL to SQL)', included: true, bold: true },
      { text: 'Comparación & Benchmarks sectoriales', included: true },
      { text: 'Diagnóstico y simulador de liquidaciones', included: true },
      { text: 'Soporte prioritario 24/5 vía chat interno', included: true },
    ],
    cta: 'Probar Business 14 Días Gratis',
    ctaStyle: 'filled',
  },
  {
    eyebrow: 'Plan Enterprise',
    name: 'Grandes Corporaciones',
    description:
      'Despliegue a medida con modelos de IA afinados a tus SKUs, integraciones de baja latencia y SLA garantizado.',
    price: 'Personalizado',
    billing: 'Contratos anuales o multianuales',
    features: [
      { text: 'Todo lo incluido en Business sin restricciones', included: true },
      { text: 'Modelos predictivos entrenados con tus datos', included: true },
      { text: 'Conexión directa por Webhooks, API y Data Lake', included: true },
      { text: 'Arquitectura aislada (Dedicated VPC / On-premise)', included: true },
      { text: 'Gerente de cuenta técnico y consultoría analítica', included: true },
      { text: 'SLA 99.99% y certificación SOC2 Tipo II', included: true },
    ],
    cta: 'Contactar a Ventas Corporativas',
    ctaStyle: 'outlined',
  },
];

export default function PricingSection() {
  return (
    <section className="landing-pricing" id="precios" aria-labelledby="pricing-title">
      <div className="landing-section-inner">
        <div className="landing-pricing-header">
          <p className="landing-section-eyebrow">Inversión Transparente</p>
          <h2 className="landing-section-title" id="pricing-title">
            Planes escalables para analistas y corporaciones consolidadas.
          </h2>
          <p className="landing-section-desc">
            Sin costos ocultos ni penalizaciones por volumen de datos. Elige el nivel de aceleración
            que tu negocio requiere.
          </p>
        </div>

        <div className="landing-pricing-grid landing-animate-stagger">
          {plans.map((plan) => (
            <article
              key={plan.eyebrow}
              className={`landing-pricing-card ${plan.recommended ? 'recommended' : ''}`}
            >
              {plan.recommended && (
                <div className="landing-pricing-badge">Más Recomendado</div>
              )}

              <p className="landing-pricing-eyebrow">{plan.eyebrow}</p>
              <h3 className="landing-pricing-name">{plan.name}</h3>
              <p className="landing-pricing-desc">{plan.description}</p>

              <div className="landing-pricing-price-block">
                <span className={`landing-pricing-price ${!plan.priceSuffix ? 'custom' : ''}`}>
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span className="landing-pricing-suffix">{plan.priceSuffix}</span>
                )}
              </div>
              {plan.billing && (
                <p className="landing-pricing-billing">{plan.billing}</p>
              )}

              <ul className="landing-pricing-features">
                {plan.features.map((feat, i) => (
                  <li key={i} className={feat.included ? 'included' : 'excluded'}>
                    {feat.included ? (
                      <Check size={14} className="landing-pricing-check" />
                    ) : (
                      <X size={14} className="landing-pricing-x" />
                    )}
                    <span className={feat.bold ? 'bold' : ''}>{feat.text}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`landing-pricing-cta ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
