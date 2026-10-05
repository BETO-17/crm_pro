import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  Terminal,
  X,
  Minimize2,
  Maximize2,
  Play,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface CommandOutput {
  id: string;
  command: string;
  result: string | ReactNode;
  timestamp: string;
  isError?: boolean;
}

const PRESET_COMMANDS = [
  'aws sts get-caller-identity',
  'aws s3 ls',
  'aws ec2 describe-instances',
  'aws rds describe-db-instances',
  'aws lambda list-functions',
  'aws cloudwatch get-metric-data',
  'aws pricing get-summary',
  'help',
  'clear',
];

export default function AwsCloudShell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    {
      id: 'init-0',
      command: 'aws --version',
      result: 'aws-cli/2.15.17 Python/3.11.6 Linux/6.1.0-amazon2023 x86_64 (CloudShell Session Activa)',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-1',
      command: 'aws sts get-caller-identity',
      result: JSON.stringify(
        {
          UserId: 'AIDACK782910EXAMPLE',
          Account: '782910482910',
          Arn: 'arn:aws:iam::782910482910:user/cloud-analyst-practitioner',
          Environment: 'AWS Production (Simulado)',
          SessionToken: 'STS-TOKEN-VALIDATED',
        },
        null,
        2
      ),
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, outputs]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // Add to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const now = new Date().toLocaleTimeString();
    const cmdId = `cmd-${Date.now()}`;

    if (trimmed.toLowerCase() === 'clear' || trimmed.toLowerCase() === 'cls') {
      setOutputs([]);
      setInputVal('');
      return;
    }

    let resultOutput: string | ReactNode = '';
    let isErr = false;

    const lower = trimmed.toLowerCase();

    if (lower === 'help' || lower === 'aws help') {
      resultOutput = (
        <div style={{ lineHeight: 1.6 }}>
          <strong style={{ color: '#60A5FA' }}>Comandos CLI Disponibles en AWS CloudShell:</strong>
          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
            <li><code style={{ color: '#34D399' }}>aws sts get-caller-identity</code> — Verifica usuario IAM y credenciales STS.</li>
            <li><code style={{ color: '#34D399' }}>aws s3 ls</code> — Lista buckets de almacenamiento y data lakes S3.</li>
            <li><code style={{ color: '#34D399' }}>aws ec2 describe-instances</code> — Lista servidores y Auto Scaling Groups.</li>
            <li><code style={{ color: '#34D399' }}>aws rds describe-db-instances</code> — Estado de base de datos PostgreSQL Multi-AZ.</li>
            <li><code style={{ color: '#34D399' }}>aws lambda list-functions</code> — Microservicios serverless en ejecución.</li>
            <li><code style={{ color: '#34D399' }}>aws cloudwatch get-metric-data</code> — Telemetría de CPU y red en vivo.</li>
            <li><code style={{ color: '#34D399' }}>aws pricing get-summary</code> — Resumen de economía y TCO de la nube.</li>
            <li><code style={{ color: '#34D399' }}>clear</code> — Limpia el historial de la terminal.</li>
          </ul>
        </div>
      );
    } else if (lower.startsWith('aws sts get-caller-identity')) {
      resultOutput = JSON.stringify(
        {
          UserId: 'AIDACK782910EXAMPLE',
          Account: '782910482910',
          Arn: 'arn:aws:iam::782910482910:user/cloud-analyst-practitioner',
          Status: 'Active & Enforced with MFA (TOTP)',
        },
        null,
        2
      );
    } else if (lower.startsWith('aws s3 ls')) {
      resultOutput = `2026-09-15 08:30:12  s3://erp-production-datalake-analytics
2026-09-18 14:22:45  s3://erp-invoice-storage-vault-glacier
2026-09-24 11:10:00  s3://erp-frontend-assets-cloudfront-origin
2026-10-01 02:00:00  s3://erp-backups-rds-snapshots-encrypted

Total: 4 S3 Buckets | 1.84 TB Almacenados | Encriptación SSE-KMS Activa (100%)`;
    } else if (lower.startsWith('aws ec2 describe-instances')) {
      resultOutput = JSON.stringify(
        {
          Reservations: [
            {
              ReservationId: 'r-0e8391204fa',
              Instances: [
                {
                  InstanceId: 'i-0a89f921bc45d',
                  InstanceType: 't3.medium (2 vCPU, 4 GiB RAM)',
                  State: { Code: 16, Name: 'running' },
                  PrivateIpAddress: '10.0.1.45',
                  PublicIpAddress: '54.210.88.12',
                  VpcId: 'vpc-078a9c21ef',
                  SubnetId: 'subnet-public-1a',
                  Architecture: 'x86_64',
                  SecurityGroups: ['sg-erp-backend-api'],
                  LaunchTime: '2026-09-28T14:30:00.000Z',
                },
                {
                  InstanceId: 'i-0b77e144ea890',
                  InstanceType: 't3.medium (2 vCPU, 4 GiB RAM)',
                  State: { Code: 16, Name: 'running' },
                  PrivateIpAddress: '10.0.2.89',
                  PublicIpAddress: '54.210.88.94',
                  VpcId: 'vpc-078a9c21ef',
                  SubnetId: 'subnet-public-1b',
                  Architecture: 'x86_64',
                  SecurityGroups: ['sg-erp-backend-api'],
                  LaunchTime: '2026-09-28T14:31:00.000Z',
                },
              ],
            },
          ],
        },
        null,
        2
      );
    } else if (lower.startsWith('aws rds describe-db-instances')) {
      resultOutput = JSON.stringify(
        {
          DBInstances: [
            {
              DBInstanceIdentifier: 'erp-database-primary-postgres',
              Engine: 'postgres',
              EngineVersion: '15.3',
              DBInstanceClass: 'db.m5.large',
              MultiAZ: true,
              SecondaryAvailabilityZone: 'us-east-1b',
              AllocatedStorage: 250,
              StorageType: 'gp3 (3000 IOPS)',
              StorageEncrypted: true,
              KmsKeyId: 'arn:aws:kms:us-east-1:782910482910:key/erp-db-key',
              Status: 'available (SLA 99.99%)',
              Endpoint: {
                Address: 'erp-database-primary.c81920.us-east-1.rds.amazonaws.com',
                Port: 5432,
              },
            },
          ],
        },
        null,
        2
      );
    } else if (lower.startsWith('aws lambda list-functions')) {
      resultOutput = JSON.stringify(
        {
          Functions: [
            {
              FunctionName: 'erp-pdf-invoice-generator',
              Runtime: 'nodejs20.x',
              MemorySize: 512,
              Timeout: 15,
              LastModified: '2026-09-30T10:14:00.000Z',
              State: 'Active',
            },
            {
              FunctionName: 'erp-etl-daily-data-transform',
              Runtime: 'python3.11',
              MemorySize: 1024,
              Timeout: 120,
              LastModified: '2026-10-01T00:05:00.000Z',
              State: 'Active',
            },
          ],
        },
        null,
        2
      );
    } else if (lower.startsWith('aws cloudwatch get-metric-data')) {
      resultOutput = `=== AWS CloudWatch Live Metrics (us-east-1) ===
• CPU Utilization:         28.4% (Promedio clúster t3.medium)
• Network In / Out:        14.2 MB/s / 26.8 MB/s
• RDS PostgreSQL Latency:  1.24 ms RTT
• HTTP 200 OK Responses:   99.98%
• HTTP 5xx Server Errors:  0.00% (Saludable)
• Alarmas CloudWatch:      0 Disparadas / 4 En Monitoreo Activo`;
    } else if (lower.startsWith('aws pricing get-summary')) {
      resultOutput = `=== AWS TCO & Pricing Summary ===
• EC2 Compute (2 x t3.medium):          $242.94 / mes
• RDS PostgreSQL (Multi-AZ db.m5.large): $255.50 / mes
• CloudFront CDN & Route 53 DNS:        $85.00 / mes
• S3 Intelligent-Tiering Storage:       $57.50 / mes
---------------------------------------------------------
TOTAL MENSUAL ESTIMADO:                 $640.94 / mes
AHORRO ESTIMADO VS ON-PREMISE:          -54.2% TCO`;
    } else {
      isErr = true;
      resultOutput = `Comando no reconocido: "${trimmed}". Escribe "help" o "aws help" para ver la lista de comandos disponibles.`;
    }

    setOutputs((prev) => [
      ...prev,
      {
        id: cmdId,
        command: trimmed,
        result: resultOutput,
        timestamp: now,
        isError: isErr,
      },
    ]);

    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 28,
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: '#FFFFFF',
            border: '1.5px solid #3B82F6',
            borderRadius: 30,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 9999,
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
            }}
          >
            <Terminal size={14} />
          </div>
          <span>AWS CloudShell</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px #34D399',
            }}
          />
        </button>
      )}

      {/* Terminal Modal / Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: isMaximized ? 0 : 20,
            right: isMaximized ? 0 : 24,
            width: isMaximized ? '100vw' : '720px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMaximized ? '100vh' : '480px',
            background: '#0B1120',
            border: '1px solid #1E293B',
            borderRadius: isMaximized ? 0 : 16,
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.25)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          }}
        >
          {/* Terminal Window Header */}
          <div
            style={{
              background: '#0F172A',
              borderBottom: '1px solid #1E293B',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E2E8F0', fontSize: 12.5, fontWeight: 700 }}>
                <Terminal size={14} color="#60A5FA" />
                <span>AWS CloudShell — us-east-1 (N. Virginia)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setOutputs([])}
                title="Limpiar terminal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? 'Restaurar' : 'Maximizar'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                }}
              >
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar terminal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Preset Command Quick Chips */}
          <div
            style={{
              background: '#070C18',
              borderBottom: '1px solid #1E293B',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={11} color="#60A5FA" /> Comandos rápidos:
            </span>
            {PRESET_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #334155',
                  color: '#93C5FD',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#60A5FA')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Terminal Console Output Scroll Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              fontSize: 12.5,
              color: '#E2E8F0',
            }}
          >
            {outputs.map((item) => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Prompt & Command Line */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>[cloudshell-user@aws-cloud ~]$</span>
                    <strong style={{ color: '#FFFFFF' }}>{item.command}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#64748B' }}>{item.timestamp}</span>
                    <button
                      onClick={() => handleCopy(typeof item.result === 'string' ? item.result : item.command, item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedId === item.id ? '#34D399' : '#64748B',
                        cursor: 'pointer',
                        padding: 2,
                      }}
                      title="Copiar salida"
                    >
                      {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Result output */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: item.isError ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(30, 41, 59, 0.7)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: item.isError ? '#F87171' : '#CBD5E1',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    fontSize: 12,
                  }}
                >
                  {item.result}
                </div>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive Input Command Prompt */}
          <div
            style={{
              background: '#0F172A',
              borderTop: '1px solid #1E293B',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap' }}>
              [cloudshell-user@aws ~]$
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe un comando de AWS CLI (ej: aws s3 ls, aws ec2 describe-instances, help)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => executeCommand(inputVal)}
              disabled={!inputVal.trim()}
              style={{
                background: inputVal.trim() ? '#2563EB' : 'rgba(37, 99, 235, 0.3)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: inputVal.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Play size={12} />
              <span>Ejecutar</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
