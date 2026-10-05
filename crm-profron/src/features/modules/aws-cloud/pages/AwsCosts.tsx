import { useState } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';
import AwsCostCalculator from '../components/AwsCostCalculator';
import AwsTcoComparator from '../components/AwsTcoComparator';
import '../aws.css';

export default function AwsCosts() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'tco'>('calculator');

  return (
    <div className="aws-container">
      {/* Header and Subnav Tabs */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
            Módulo 3 — Costos, Economía Cloud & Comparador TCO
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Calcula la estimación de servicios en AWS y compara el retorno de inversión (TCO) frente a centros de datos On-Premise.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#e2e8f0',
            padding: 4,
            borderRadius: 10,
            gap: 4,
          }}
        >
          <button
            onClick={() => setActiveTab('calculator')}
            style={{
              background: activeTab === 'calculator' ? '#ffffff' : 'transparent',
              color: activeTab === 'calculator' ? '#2563eb' : '#475569',
              fontWeight: 700,
              fontSize: 12.5,
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'calculator' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Calculator size={15} /> Calculadora de Precios
          </button>

          <button
            onClick={() => setActiveTab('tco')}
            style={{
              background: activeTab === 'tco' ? '#2563eb' : 'transparent',
              color: activeTab === 'tco' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: 12.5,
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'tco' ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <TrendingDown size={15} /> Comparador TCO (On-Prem vs Cloud)
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'calculator' ? <AwsCostCalculator /> : <AwsTcoComparator />}
    </div>
  );
}

