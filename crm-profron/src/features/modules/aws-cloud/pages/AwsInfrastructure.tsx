import { useState } from 'react';
import {
  Layers,
  Shield,
  Zap,
} from 'lucide-react';
import AwsRegionMap from '../components/AwsRegionMap';
import { awsRegionsList } from '../data/awsRegionsData';
import '../aws.css';

export default function AwsInfrastructure() {
  const [selectedRegion, setSelectedRegion] = useState(awsRegionsList[0]);

  return (
    <div className="aws-container">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
          Módulo 4 — Infraestructura Global de AWS
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Explora la red mundial de Regiones geográficas, Zonas de Disponibilidad (AZs) y Puntos de Presencia (Edge Locations).
        </p>
      </div>

      {/* Global Interactive Map Component */}
      <AwsRegionMap
        selectedRegionCode={selectedRegion.code}
        onSelectRegion={(reg) => setSelectedRegion(reg)}
      />

      {/* Detailed Region Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                Zonas de Disponibilidad (AZs)
              </h3>
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                {selectedRegion.availabilityZones} AZs en {selectedRegion.code}
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>
            Cada Zona de Disponibilidad consta de uno o más centros de datos discretos con energía, red y conectividad redundantes, ubicados a kilómetros de distancia para aislamiento de fallos.
          </p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                Puntos de Presencia (Edge Locations)
              </h3>
              <span style={{ fontSize: 12, color: '#d97706', fontWeight: 700 }}>
                +600 Edge PoPs Mundiales
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>
            Utilizados por Amazon CloudFront (CDN) y Route 53 para entregar contenido estático y dinámico con la menor latencia posible al usuario final.
          </p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                Resiliencia & Cumplimiento
              </h3>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>
                Soberanía de Datos Local
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>
            Los datos almacenados en una región específica (ej. sa-east-1) nunca salen de esa ubicación geográfica a menos que el cliente configure una replicación explícita.
          </p>
        </div>
      </div>
    </div>
  );
}
