import { useState } from 'react';
import { Search } from 'lucide-react';
import AwsServiceCard from '../components/AwsServiceCard';
import { awsServicesCatalog } from '../data/awsServicesData';
import type { ServiceCategory } from '../types/awsTypes';
import '../aws.css';

const categories: ('Todas' | ServiceCategory)[] = [
  'Todas',
  'Cómputo',
  'Almacenamiento',
  'Base de Datos',
  'Redes y CDN',
  'Seguridad e Identidad',
  'Serverless',
  'Monitoreo y Gestión',
];

export default function AwsServicesCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | ServiceCategory>('Todas');

  const filteredServices = awsServicesCatalog.filter((svc) => {
    const matchesCategory = selectedCategory === 'Todas' || svc.category === selectedCategory;
    const matchesSearch =
      svc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.codeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="aws-container">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
          Módulo 7 — Catálogo de Servicios de Amazon Web Services
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Explorador técnico de los principales servicios en la nube con fichas técnicas, tarifas y casos de uso recomendados.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por nombre (ej. EC2, S3, RDS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filteredServices.map((svc) => (
          <AwsServiceCard key={svc.id} service={svc} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: 14,
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Search size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
            No se encontraron servicios
          </h3>
          <p style={{ fontSize: 13, margin: 0 }}>
            Intenta buscar con otro término o selecciona "Todas" en las categorías.
          </p>
        </div>
      )}
    </div>
  );
}
