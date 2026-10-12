import { useState, lazy, Suspense } from 'react';
import { Network, PenTool, Loader2 } from 'lucide-react';
import AwsNetworkDiagram from '../components/AwsNetworkDiagram';
import '../aws.css';

const AwsArchitectureEditor = lazy(() => import('../components/AwsArchitectureEditor'));

export default function AwsNetwork() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'editor'>(() => {
    try {
      const saved = localStorage.getItem('aws:networkTab');
      if (saved === 'editor' || saved === 'architecture') {
        return saved;
      }
    } catch {
      // LocalStorage fallback
    }
    return 'architecture';
  });

  const handleTabChange = (tab: 'architecture' | 'editor') => {
    setActiveTab(tab);
    try {
      localStorage.setItem('aws:networkTab', tab);
    } catch {
      // LocalStorage error handling
    }
  };

  return (
    <div className="aws-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
            Arquitectura de Red
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Visualiza el flujo seguro de peticiones y la topología de red distribuida en Amazon VPC.
          </p>
        </div>

        {/* Pestañas de Navegación */}
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            gap: 4
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('architecture')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeTab === 'architecture' ? '#2563eb' : 'transparent',
              color: activeTab === 'architecture' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'architecture' ? '0 1px 3px rgba(37,99,235,0.25)' : 'none'
            }}
          >
            <Network size={16} />
            Arquitectura de la solución
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('editor')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeTab === 'editor' ? '#2563eb' : 'transparent',
              color: activeTab === 'editor' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'editor' ? '0 1px 3px rgba(37,99,235,0.25)' : 'none'
            }}
          >
            <PenTool size={16} />
            Diseñar mi arquitectura
          </button>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'architecture' ? (
        <AwsNetworkDiagram />
      ) : (
        <Suspense
          fallback={
            <div
              style={{
                height: '70vh',
                width: '100%',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: '#64748b'
              }}
            >
              <Loader2 size={32} className="animate-spin" style={{ color: '#2563eb' }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Cargando editor de diagramas…</span>
            </div>
          }
        >
          <AwsArchitectureEditor />
        </Suspense>
      )}
    </div>
  );
}
