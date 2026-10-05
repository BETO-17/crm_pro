import { useState } from 'react';
import {
  Plus,
  Trash2,
  PieChart,
  Download,
  Sparkles,
} from 'lucide-react';
import type { CostSimulationItem } from '../types/awsTypes';
import { awsServicesCatalog } from '../data/awsServicesData';
import { initialCostItems } from '../data/awsCostsPresets';

export default function AwsCostCalculator() {
  const [items, setItems] = useState<CostSimulationItem[]>(initialCostItems);
  const [selectedServiceId, setSelectedServiceId] = useState(awsServicesCatalog[0].id);
  const [quantity, setQuantity] = useState(2);
  const [hours, setHours] = useState(730);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const selectedService = awsServicesCatalog.find((s) => s.id === selectedServiceId) || awsServicesCatalog[0];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const costPerHour = selectedService.estimatedCostPerHour;
    const monthlyCost = +(quantity * hours * costPerHour).toFixed(2);
    const annualCost = +(monthlyCost * 12).toFixed(2);

    const newItem: CostSimulationItem = {
      id: `cost-${Date.now()}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      instanceTypeOrTier: `${quantity}x ${selectedService.codeName} Tier`,
      quantity,
      hoursPerMonth: hours,
      costPerHour,
      monthlyCost,
      annualCost,
    };

    setItems([...items, newItem]);
    showToast(`✓ "${selectedService.codeName}" agregado a la estimación`);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    showToast('Ítem eliminado de la cotización');
  };

  const totalMonthly = items.reduce((acc, curr) => acc + curr.monthlyCost, 0);
  const totalAnnual = totalMonthly * 12;

  // Group by category for visual distribution
  const categoryTotals: Record<string, number> = {};
  items.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.monthlyCost;
  });

  const categoryColors: Record<string, string> = {
    'Cómputo': '#f59e0b',
    'Base de Datos': '#10b981',
    'Almacenamiento': '#3b82f6',
    'Redes y CDN': '#06b6d4',
    'Serverless': '#a855f7',
    'Seguridad e Identidad': '#ef4444',
    'Monitoreo y Gestión': '#64748b',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#0f172a',
            border: '1px solid #f59e0b',
            color: '#fef08a',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={16} color="#f59e0b" />
          {toastMsg}
        </div>
      )}

      {/* Summary Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div>
          <span style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#93c5fd', fontWeight: 700 }}>
            AWS Pricing Calculator Simulado
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '4px 0 6px' }}>
            Estimación Total de la Solución Cloud
          </h2>
          <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
            Cálculo proyectado basado en tarifas estándar de la región us-east-1 bajo demanda (On-Demand).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>Costo Mensual Estimado</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fcd34d' }}>
              ${totalMonthly.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 500 }}>/mes</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: 24 }}>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>Costo Anual Estimado</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#86efac' }}>
              ${totalAnnual.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 500 }}>/año</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Item Form + Distribution Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 20 }}>
        {/* Form */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} color="#2563eb" />
            <span>Agregar Servicio a la Estimación</span>
          </h3>

          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Seleccionar Servicio AWS
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                {awsServicesCatalog.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category}) — ${s.estimatedCostPerHour.toFixed(4)}/h
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  Cantidad / Instancias / GB
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  Horas de Uso al Mes (730 = 24/7)
                </label>
                <input
                  type="number"
                  min={1}
                  max={730}
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12.5, color: '#64748b' }}>
                Costo calculado:{' '}
                <strong style={{ color: '#2563eb' }}>
                  ${(quantity * hours * selectedService.estimatedCostPerHour).toFixed(2)}/mes
                </strong>
              </div>

              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={15} /> Añadir Ítem
              </button>
            </div>
          </form>
        </div>

        {/* Visual Category Distribution Graph */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieChart size={18} color="#f59e0b" />
              <span>Distribución de Costos por Categoría</span>
            </h3>

            {/* Segmented Bar Graphic */}
            <div style={{ height: 18, borderRadius: 9, display: 'flex', overflow: 'hidden', background: '#e2e8f0', marginBottom: 16 }}>
              {Object.entries(categoryTotals).map(([cat, amount]) => {
                const percent = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
                return (
                  <div
                    key={cat}
                    style={{
                      width: `${percent}%`,
                      background: categoryColors[cat] || '#2563eb',
                      transition: 'width 0.3s ease',
                    }}
                    title={`${cat}: $${amount.toFixed(2)} (${percent.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {Object.entries(categoryTotals).map(([cat, amount]) => {
                const percent = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColors[cat] || '#2563eb' }} />
                      <span style={{ color: '#334155', fontWeight: 600 }}>{cat}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>
                      ${amount.toFixed(2)} <span style={{ color: '#64748b', fontSize: 11 }}>({percent.toFixed(1)}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>✓ Estimador en tiempo real</span>
            <button
              onClick={() => showToast('Reporte de costos descargado en PDF')}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11.5,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Download size={12} /> Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
            Desglose de Ítems Cotizados ({items.length})
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Tarifas calculadas con base de 730 horas/mes</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '12px 18px' }}>Servicio & Configuración</th>
              <th style={{ padding: '12px 18px' }}>Categoría</th>
              <th style={{ padding: '12px 18px' }}>Cantidad</th>
              <th style={{ padding: '12px 18px' }}>Horas/Mes</th>
              <th style={{ padding: '12px 18px' }}>Costo Unitario</th>
              <th style={{ padding: '12px 18px' }}>Costo Mensual</th>
              <th style={{ padding: '12px 18px' }}>Costo Anual</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 18px' }}>
                  <strong style={{ color: '#1e293b' }}>{item.serviceName}</strong>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{item.instanceTypeOrTier}</div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>{item.quantity}</td>
                <td style={{ padding: '14px 18px' }}>{item.hoursPerMonth} h</td>
                <td style={{ padding: '14px 18px', fontFamily: 'monospace' }}>${item.costPerHour.toFixed(4)}/h</td>
                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>${item.monthlyCost.toFixed(2)}</td>
                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#16a34a' }}>${item.annualCost.toFixed(2)}</td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                    title="Eliminar ítem"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
