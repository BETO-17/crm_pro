import { Cloud, Server, Database, Activity, CheckCircle } from 'lucide-react';
import '../azure.css';

export default function AzureOverview() {
  return (
    <div className="azure-container">
      <div className="azure-hero">
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Laboratorio Microsoft Azure</h1>
          <p style={{ fontSize: 14, opacity: 0.9, marginTop: 6, margin: 0 }}>
            Entorno dedicado para despliegue de infraestructura, servicios en la nube y pipelines de datos.
          </p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
          Azure Portal Conectado ✓
        </div>
      </div>

      <div className="azure-grid">
        <div className="azure-card">
          <div className="azure-card-icon">
            <Server size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Máquinas Virtuales & Cómputo</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Aprovisionamiento y administración de instancias VM para procesamiento distribuido.
          </p>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle size={14} /> 2 Instancias Activas
          </div>
        </div>

        <div className="azure-card">
          <div className="azure-card-icon">
            <Database size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Azure Blob Storage & Data Lake</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Almacenamiento masivo de objetos no estructurados y capas de persistencia para analítica.
          </p>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0078d4', fontWeight: 600 }}>
            <Activity size={14} /> 1.2 TB Almacenados
          </div>
        </div>

        <div className="azure-card">
          <div className="azure-card-icon">
            <Cloud size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Azure Data Factory & ETL</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Integración y orquestación de datos mediante canalizaciones automatizadas en la nube.
          </p>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle size={14} /> Pipeline Listo para Ejecución
          </div>
        </div>
      </div>
    </div>
  );
}
