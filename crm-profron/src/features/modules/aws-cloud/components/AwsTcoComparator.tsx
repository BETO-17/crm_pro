import { useState } from 'react';
import {
  TrendingDown,
  Building2,
  Cloud,
  CheckCircle2,
  Zap,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';

export default function AwsTcoComparator() {
  const [timeframeYears, setTimeframeYears] = useState<3 | 5>(3);
  const [serverCount, setServerCount] = useState<number>(8);
  const [storageTb, setStorageTb] = useState<number>(25);
  const [sysAdmins, setSysAdmins] = useState<number>(2);
  const [awsPricingModel, setAwsPricingModel] = useState<'on_demand' | 'savings_plan_1yr' | 'savings_plan_3yr'>('savings_plan_3yr');

  // On-Premise Cost Calculations (3 or 5 years)
  const hardwarePerServer = 7500; // Server procurement + network gear
  const hardwareDepreciation = (serverCount * hardwarePerServer) * (timeframeYears === 5 ? 1.4 : 1.0);
  const storageSanCost = storageTb * 600 * (timeframeYears / 3);
  const dataCenterPowerCooling = serverCount * 140 * 12 * timeframeYears; // $140/mo per server rack space/power
  const vmwareLicenses = serverCount * 1200 * timeframeYears; // $1200/yr per host
  const hardwareSupport24x7 = serverCount * 800 * timeframeYears;
  const sysAdminSalary = sysAdmins * 45000 * timeframeYears; // Dedicated sysadmin labor allocation

  const totalOnPremiseCost =
    hardwareDepreciation +
    storageSanCost +
    dataCenterPowerCooling +
    vmwareLicenses +
    hardwareSupport24x7 +
    sysAdminSalary;

  // AWS Cloud Cost Calculations
  let awsDiscount = 0;
  if (awsPricingModel === 'savings_plan_1yr') awsDiscount = 0.32;
  if (awsPricingModel === 'savings_plan_3yr') awsDiscount = 0.54;

  const awsBaseCompute = serverCount * 165 * 12 * timeframeYears * (1 - awsDiscount);
  const awsStorageS3Ebs = storageTb * 28 * 12 * timeframeYears; // $0.028/GB
  const awsRdsDatabase = serverCount * 110 * 12 * timeframeYears * (1 - awsDiscount);
  const awsBusinessSupport = (awsBaseCompute + awsStorageS3Ebs + awsRdsDatabase) * 0.08;
  const awsCloudOpsLabor = Math.max(1, sysAdmins - 1) * 22000 * timeframeYears; // Reduced admin burden

  const totalAwsCost =
    awsBaseCompute +
    awsStorageS3Ebs +
    awsRdsDatabase +
    awsBusinessSupport +
    awsCloudOpsLabor;

  const totalSavings = Math.max(0, totalOnPremiseCost - totalAwsCost);
  const savingsPercent = totalOnPremiseCost > 0 ? (totalSavings / totalOnPremiseCost) * 100 : 0;
  const roiPercent = totalAwsCost > 0 ? (totalSavings / totalAwsCost) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner with Savings Indicator */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1d4ed8 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(74, 222, 128, 0.5)',
                color: '#86efac',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <TrendingDown size={13} color="#86efac" /> COMPARADOR TCO CERTIFICADO
            </span>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>Total Cost of Ownership (CapEx vs. OpEx)</span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
            Ahorro Económico Proyectado: <span style={{ color: '#86efac' }}>{savingsPercent.toFixed(1)}%</span>
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#93c5fd', maxWidth: 620 }}>
            Migrar de infraestructura On-Premise tradicional hacia AWS reduce drásticamente el gasto en hardware, energía, refrigeración y mantenimiento.
          </p>
        </div>

        {/* Big Savings Number Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(147, 197, 253, 0.3)',
            borderRadius: 14,
            padding: '16px 22px',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Ahorro Total Neto en {timeframeYears} Años</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#4ade80', margin: '2px 0' }}>
            ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span style={{ fontSize: 14 }}>USD</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#cbd5e1' }}>
            Retorno de Inversión (ROI): <strong style={{ color: '#fef08a' }}>{roiPercent.toFixed(0)}%</strong>
          </div>
        </div>
      </div>

      {/* Control Panel: Simulation Parameters */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: 22,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={17} color="#2563eb" />
            <span>Parámetros de la Infraestructura a Comparar</span>
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Ajusta las variables para recalcular el TCO</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* Timeframe */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              Horizonte de Tiempo
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setTimeframeYears(3)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: timeframeYears === 3 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: timeframeYears === 3 ? '#eff6ff' : '#ffffff',
                  color: timeframeYears === 3 ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                }}
              >
                3 Años (Estándar)
              </button>
              <button
                onClick={() => setTimeframeYears(5)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: timeframeYears === 5 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: timeframeYears === 5 ? '#eff6ff' : '#ffffff',
                  color: timeframeYears === 5 ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                }}
              >
                5 Años (Largo Plazo)
              </button>
            </div>
          </div>

          {/* Servers count */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              <span>Servidores On-Premise:</span>
              <span style={{ color: '#2563eb' }}>{serverCount} Servidores</span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              value={serverCount}
              onChange={(e) => setServerCount(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
            />
          </div>

          {/* Storage TB */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              <span>Almacenamiento SAN/NAS:</span>
              <span style={{ color: '#2563eb' }}>{storageTb} TB</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={storageTb}
              onChange={(e) => setStorageTb(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
            />
          </div>

          {/* IT Admins */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              <span>Personal TI Dedicado:</span>
              <span style={{ color: '#2563eb' }}>{sysAdmins} SysAdmins</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              value={sysAdmins}
              onChange={(e) => setSysAdmins(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
            />
          </div>

          {/* AWS Pricing Strategy */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              Estrategia de Precios AWS
            </label>
            <select
              value={awsPricingModel}
              onChange={(e) => setAwsPricingModel(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              <option value="on_demand">On-Demand (0% Descuento - Máxima Flexibilidad)</option>
              <option value="savings_plan_1yr">Savings Plans 1 Año (32% Descuento)</option>
              <option value="savings_plan_3yr">Savings Plans 3 Años (54% Descuento Recomendado)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Cost Breakdown Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* On-Premise Column */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: 22,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                    Centro de Datos On-Premise
                  </h4>
                  <span style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 600 }}>Modelo Tradicional CapEx + OpEx</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626' }}>
                  ${totalOnPremiseCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Total {timeframeYears} Años</div>
              </div>
            </div>

            {/* Itemized list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
                <span style={{ color: '#475569' }}>Adquisición Servidores & Hardware:</span>
                <strong style={{ color: '#1e293b' }}>${hardwareDepreciation.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
                <span style={{ color: '#475569' }}>Almacenamiento SAN/NAS Storage:</span>
                <strong style={{ color: '#1e293b' }}>${storageSanCost.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
                <span style={{ color: '#475569' }}>Energía Eléctrica & Climatización (HVAC):</span>
                <strong style={{ color: '#1e293b' }}>${dataCenterPowerCooling.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
                <span style={{ color: '#475569' }}>Licencias Virtualización & SO:</span>
                <strong style={{ color: '#1e293b' }}>${vmwareLicenses.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
                <span style={{ color: '#475569' }}>Pólizas de Garantía & Soporte Hardware:</span>
                <strong style={{ color: '#1e293b' }}>${hardwareSupport24x7.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
                <span style={{ color: '#475569' }}>Administración & Mantenimiento TI:</span>
                <strong style={{ color: '#1e293b' }}>${sysAdminSalary.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: 11.5, color: '#dc2626', fontWeight: 600 }}>
            ⚠️ Requiere inversión inicial alta y ciclos de renovación cada 3-5 años.
          </div>
        </div>

        {/* AWS Cloud Column */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '2px solid #2563eb',
            padding: 22,
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Cloud size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                    Amazon Web Services (AWS)
                  </h4>
                  <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 700 }}>Modelo 100% OpEx Elástico</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a' }}>
                  ${totalAwsCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Total {timeframeYears} Años</div>
              </div>
            </div>

            {/* Itemized list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f0fdf4', borderRadius: 6 }}>
                <span style={{ color: '#166534' }}>Amazon EC2 + Auto Scaling:</span>
                <strong style={{ color: '#166534' }}>${awsBaseCompute.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f0fdf4', borderRadius: 6 }}>
                <span style={{ color: '#166534' }}>Amazon S3 + EBS Block Storage:</span>
                <strong style={{ color: '#166534' }}>${awsStorageS3Ebs.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f0fdf4', borderRadius: 6 }}>
                <span style={{ color: '#166534' }}>Amazon RDS Managed Multi-AZ:</span>
                <strong style={{ color: '#166534' }}>${awsRdsDatabase.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f0fdf4', borderRadius: 6 }}>
                <span style={{ color: '#166534' }}>AWS Business Support 24/7 (SLA &lt;1h):</span>
                <strong style={{ color: '#166534' }}>${awsBusinessSupport.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f0fdf4', borderRadius: 6 }}>
                <span style={{ color: '#166534' }}>Operaciones Cloud Optimizadas:</span>
                <strong style={{ color: '#166534' }}>${awsCloudOpsLabor.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#ecfdf5', borderRadius: 6, border: '1px dashed #4ade80' }}>
                <span style={{ color: '#15803d', fontWeight: 700 }}>Ahorro Neto Directo:</span>
                <strong style={{ color: '#15803d', fontWeight: 800 }}>-${totalSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: 11.5, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} /> 0 inversión inicial en hardware y escalabilidad en segundos.
          </div>
        </div>
      </div>

      {/* Strategic Comparison Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Zap size={16} color="#2563eb" />
            <strong style={{ fontSize: 13, color: '#1e293b' }}>Agilidad & Time-to-Market</strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Despliegue de nuevos entornos en minutos vs. 6 a 12 semanas para comprar y montar servidores físicos.
          </p>
        </div>

        <div style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <DollarSign size={16} color="#16a34a" />
            <strong style={{ fontSize: 13, color: '#1e293b' }}>Paga por lo que Usas</strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Sin sobreaprovisionamiento ocioso. Capacidad elástica que crece o decrece según la demanda real.
          </p>
        </div>

        <div style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Info size={16} color="#d97706" />
            <strong style={{ fontSize: 13, color: '#1e293b' }}>Resiliencia & SLA 99.99%</strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Multi-AZ nativo y replicación geográfica sin el costo millonario de construir un segundo datacenter físico.
          </p>
        </div>
      </div>
    </div>
  );
}
