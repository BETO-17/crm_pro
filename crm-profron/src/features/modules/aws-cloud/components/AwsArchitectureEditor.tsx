import { useState, useEffect } from 'react';
import { Monitor, ExternalLink, Info } from 'lucide-react';

export default function AwsArchitectureEditor() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '56px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}
        >
          <Monitor size={30} />
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
            El editor de diagramas está disponible en pantallas de 1024px o más
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 460 }}>
            Para una experiencia óptima de diseño e interacción con topologías isométricas, por favor accede desde una pantalla de escritorio o maximiza tu navegador.
          </p>
        </div>
        <a
          href="https://www.icewolfsoft.com/fossflow/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            padding: '10px 18px',
            borderRadius: 10,
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
          }}
        >
          <ExternalLink size={15} />
          Abrir en pestaña nueva
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Barra de información y acceso */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 12,
          padding: '12px 18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Info size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 500 }}>
            El editor se ejecuta en un sitio externo. Exporta tu diagrama como JSON desde el editor para conservarlo.
          </span>
        </div>
        <a
          href="https://www.icewolfsoft.com/fossflow/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            border: '1px solid #bfdbfe',
            color: '#2563eb',
            fontWeight: 600,
            fontSize: 12,
            padding: '7px 14px',
            borderRadius: 8,
            textDecoration: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <ExternalLink size={14} />
          Abrir en pestaña nueva
        </a>
      </div>

      {/* Contenedor del Editor FossFLOW (Plan B iframe) */}
      <div
        style={{
          height: '70vh',
          width: '100%',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <iframe
          src="https://www.icewolfsoft.com/fossflow/"
          title="Editor FossFLOW"
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="clipboard-read; clipboard-write"
        />
      </div>

      {/* Créditos de autoría y licencia */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Editor de diagramas:{' '}
          <a
            href="https://github.com/stan-smith/FossFLOW"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
          >
            FossFLOW (licencia MIT)
          </a>
        </span>
      </div>
    </div>
  );
}
