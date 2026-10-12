import AwsNetworkDiagram from '../components/AwsNetworkDiagram';
import '../aws.css';

export default function AwsNetwork() {
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
      </div>

      {/* Render Network Diagram */}
      <AwsNetworkDiagram />
    </div>
  );
}
