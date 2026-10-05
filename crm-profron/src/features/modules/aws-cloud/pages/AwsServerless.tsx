import { useState } from 'react';
import {
  Zap,
  Play,
  Plus,
  Search,
  Terminal,
  Sparkles,
  X,
} from 'lucide-react';
import '../aws.css';

interface LambdaFunction {
  id: string;
  name: string;
  runtime: string;
  memoryMb: number;
  timeoutSec: number;
  lastInvoked: string;
  invocationsToday: number;
  errorRatePercent: number;
  avgDurationMs: number;
  codeSnippet: string;
}

const initialFunctions: LambdaFunction[] = [
  {
    id: 'fn-01',
    name: 'erp-process-order-event',
    runtime: 'Node.js 20.x',
    memoryMb: 512,
    timeoutSec: 15,
    lastInvoked: 'Hace 2 min',
    invocationsToday: 18450,
    errorRatePercent: 0.02,
    avgDurationMs: 42,
    codeSnippet: `export const handler = async (event) => {\n  const { orderId, total, items } = JSON.parse(event.body);\n  console.log(\`Procesando orden \${orderId} por $\${total}\`);\n  return { statusCode: 200, body: JSON.stringify({ status: 'SUCCESS', orderId }) };\n};`,
  },
  {
    id: 'fn-02',
    name: 'erp-sync-retail-inventory',
    runtime: 'Python 3.11',
    memoryMb: 1024,
    timeoutSec: 60,
    lastInvoked: 'Hace 12 min',
    invocationsToday: 2400,
    errorRatePercent: 0.0,
    avgDurationMs: 180,
    codeSnippet: `import json\n\ndef lambda_handler(event, context):\n    print("Sincronizando inventario con sucursales retail...")\n    return {\n        'statusCode': 200,\n        'body': json.dumps({'sync': 'COMPLETED', 'updated_skus': 142})\n    }`,
  },
  {
    id: 'fn-03',
    name: 'erp-generate-pdf-invoice',
    runtime: 'Node.js 20.x',
    memoryMb: 2048,
    timeoutSec: 30,
    lastInvoked: 'Hace 45 min',
    invocationsToday: 820,
    errorRatePercent: 0.1,
    avgDurationMs: 450,
    codeSnippet: `export const handler = async (event) => {\n  console.log("Generando factura PDF y subiendo a S3...");\n  return { statusCode: 200, body: JSON.stringify({ pdfUrl: 'https://s3.aws.com/erp-invoices/fac-992.pdf' }) };\n};`,
  },
];

export default function AwsServerless() {
  const [functions, setFunctions] = useState<LambdaFunction[]>(initialFunctions);
  const [selectedFn, setSelectedFn] = useState<LambdaFunction>(initialFunctions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [testPayload, setTestPayload] = useState('{\n  "orderId": "ORD-94821",\n  "total": 349.50,\n  "customer": "retail_client@erpsync.com"\n}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New function form
  const [newFnName, setNewFnName] = useState('');
  const [newFnRuntime, setNewFnRuntime] = useState('Node.js 20.x');
  const [newFnMemory, setNewFnMemory] = useState(512);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTestInvoke = () => {
    setIsExecuting(true);
    setExecutionOutput(null);

    setTimeout(() => {
      setIsExecuting(false);
      const latency = Math.floor(Math.random() * 40) + 25;
      const billedDuration = Math.ceil(latency / 100) * 100;
      const timestamp = new Date().toISOString();

      setExecutionOutput(`START RequestId: c3f8a192-b41e-4589-9182-${Math.random().toString(16).substring(2, 10)} Version: $LATEST\n2026-10-01T${timestamp.split('T')[1]} INFO [Lambda Runtime] Ejecutando handler para ${selectedFn.name}\n2026-10-01T${timestamp.split('T')[1]} INFO Payload recibido con éxito\nEND RequestId: c3f8a192-b41e-4589-9182\nREPORT RequestId: c3f8a192-b41e-4589-9182 Duration: ${latency}.21 ms Billed Duration: ${billedDuration} ms Memory Size: ${selectedFn.memoryMb} MB Max Memory Used: 78 MB\n\nResponse:\n{\n  "statusCode": 200,\n  "status": "SUCCESS",\n  "message": "Evento procesado correctamente por ${selectedFn.name}"\n}`);
      showToast(`✓ Invocación exitosa (${latency} ms)`);
    }, 600);
  };

  const handleCreateFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFnName.trim()) return;

    const formatted = newFnName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const newFn: LambdaFunction = {
      id: `fn-${Date.now()}`,
      name: formatted,
      runtime: newFnRuntime,
      memoryMb: newFnMemory,
      timeoutSec: 15,
      lastInvoked: 'Recién creada',
      invocationsToday: 0,
      errorRatePercent: 0.0,
      avgDurationMs: 35,
      codeSnippet: `export const handler = async (event) => {\n  console.log("Nueva función ${formatted} ejecutada");\n  return { statusCode: 200, body: JSON.stringify({ message: 'Hello from ${formatted}!' }) };\n};`,
    };

    setFunctions([newFn, ...functions]);
    setSelectedFn(newFn);
    setShowCreateModal(false);
    setNewFnName('');
    showToast(`✓ Función Lambda "${newFn.name}" desplegada con éxito`);
  };

  const filtered = functions.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.runtime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="aws-container">
      {/* Toast */}
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            AWS Lambda — Funciones Serverless & Microservicios
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Ejecuta microservicios backend guiados por eventos en milisegundos sin gestionar infraestructura.
          </p>
        </div>

        <button className="aws-btn-action" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Crear Función Lambda
        </button>
      </div>

      {/* Split View: List on left, Test Simulator on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Functions List */}
        <div className="aws-launchpad">
          <div className="aws-launchpad-header">
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Funciones Activas ({functions.length})
            </h3>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar función..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((fn) => {
              const isSelected = selectedFn.id === fn.id;
              return (
                <div
                  key={fn.id}
                  onClick={() => setSelectedFn(fn)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: isSelected ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                    background: isSelected ? '#fffdf7' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>{fn.name}</span>
                    <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#334155' }}>
                      {fn.runtime}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#64748b' }}>
                    <span>⚡ {fn.memoryMb} MB</span>
                    <span>⏱ {fn.avgDurationMs} ms avg</span>
                    <span>📈 {fn.invocationsToday.toLocaleString()} hoy</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code & Live Execution Sandbox */}
        <div className="aws-launchpad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="#f59e0b" />
                <span>Consola de Prueba: {selectedFn.name}</span>
              </h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>{selectedFn.runtime} • Timeout {selectedFn.timeoutSec}s</span>
            </div>

            <button
              className="aws-btn-action"
              onClick={handleTestInvoke}
              disabled={isExecuting}
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
            >
              <Play size={14} /> {isExecuting ? 'Ejecutando...' : 'Test Invocación'}
            </button>
          </div>

          {/* Code Viewer */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Código de la Función (index.js / handler)
            </label>
            <pre
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'monospace',
                overflowX: 'auto',
                margin: 0,
                maxHeight: 140,
              }}
            >
              {selectedFn.codeSnippet}
            </pre>
          </div>

          {/* Test Event JSON */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              JSON Payload de Evento (Test Input)
            </label>
            <textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
          </div>

          {/* Execution Output Console */}
          {executionOutput && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 4 }}>
                <Terminal size={14} /> Registro de Ejecución CloudWatch Logs
              </label>
              <pre
                style={{
                  background: '#090d16',
                  color: '#4ade80',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 180,
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                }}
              >
                {executionOutput}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 480,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Crear Función AWS Lambda
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFunction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Nombre de la Función
                </label>
                <input
                  type="text"
                  placeholder="ej. erp-calculate-tax"
                  value={newFnName}
                  onChange={(e) => setNewFnName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Tiempo de Ejecución (Runtime)
                </label>
                <select
                  value={newFnRuntime}
                  onChange={(e) => setNewFnRuntime(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value="Node.js 20.x">Node.js 20.x</option>
                  <option value="Python 3.11">Python 3.11</option>
                  <option value="Java 17">Java 17 (Corretto)</option>
                  <option value="Go 1.x">Go 1.x</option>
                  <option value=".NET 8">.NET 8 (C#/F#)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Memoria Asignada (MB)
                </label>
                <select
                  value={newFnMemory}
                  onChange={(e) => setNewFnMemory(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value={128}>128 MB</option>
                  <option value={256}>256 MB</option>
                  <option value={512}>512 MB (Recomendado)</option>
                  <option value={1024}>1024 MB (1 GB)</option>
                  <option value={2048}>2048 MB (2 GB)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="aws-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="aws-btn-action">
                  Crear Función
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
