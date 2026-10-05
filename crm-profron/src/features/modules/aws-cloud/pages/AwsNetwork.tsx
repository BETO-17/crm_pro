import { useState } from 'react';
import { Layers, Zap } from 'lucide-react';
import AwsNetworkDiagram from '../components/AwsNetworkDiagram';
import AwsMultiAzFailoverSimulator from '../components/AwsMultiAzFailoverSimulator';
import '../aws.css';

export default function AwsNetwork() {
  const [activeTab, setActiveTab] = useState<'topology' | 'failover'>('topology');

  return (
    <div className="aws-container">
      {/* Header and Subnav Tabs */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
            Módulo 6 — Arquitectura de Red, Flujo VPC & Resiliencia Multi-AZ
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Visualiza el flujo seguro de peticiones y simula escenarios reales de contingencia y failover automatizado.
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
            onClick={() => setActiveTab('topology')}
            style={{
              background: activeTab === 'topology' ? '#ffffff' : 'transparent',
              color: activeTab === 'topology' ? '#2563eb' : '#475569',
              fontWeight: 700,
              fontSize: 12.5,
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'topology' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Layers size={15} /> Topología & Flujo de Tráfico
          </button>

          <button
            onClick={() => setActiveTab('failover')}
            style={{
              background: activeTab === 'failover' ? '#2563eb' : 'transparent',
              color: activeTab === 'failover' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: 12.5,
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'failover' ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Zap size={15} /> Simulador Chaos & Failover Multi-AZ
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'topology' ? <AwsNetworkDiagram /> : <AwsMultiAzFailoverSimulator />}
    </div>
  );
}

