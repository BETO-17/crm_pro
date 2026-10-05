import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Cpu,
  ArrowUpRight,
  Database,
  Zap,
  Play,
  Pause,
  Flame,
  CheckCircle2,
  Bell,
} from 'lucide-react';

interface MetricPoint {
  time: string;
  cpu: number;
  networkIn: number;
  networkOut: number;
  rdsLatency: number;
  lambdaReqs: number;
}

export default function AwsCloudWatchLiveTelemetry() {
  const [isLive, setIsLive] = useState(true);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(1500);
  const [history, setHistory] = useState<MetricPoint[]>(() => {
    const initial: MetricPoint[] = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now - i * 2000);
      initial.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: 24 + Math.sin(i) * 5 + Math.random() * 6,
        networkIn: 45 + Math.random() * 15,
        networkOut: 85 + Math.random() * 20,
        rdsLatency: 1.4 + Math.random() * 0.4,
        lambdaReqs: 320 + Math.floor(Math.random() * 80),
      });
    }
    return initial;
  });

  const stressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let nextCpu = 28 + (Math.random() * 12 - 6);
        let nextNetIn = 50 + (Math.random() * 20 - 10);
        let nextNetOut = 95 + (Math.random() * 30 - 15);
        let nextRdsLat = 1.3 + (Math.random() * 0.5);
        let nextLambda = 350 + Math.floor(Math.random() * 100);

        if (isStressTesting) {
          nextCpu = Math.min(96, (last?.cpu || 40) + 12 + Math.random() * 8);
          nextNetIn = (last?.networkIn || 50) + 80 + Math.random() * 40;
          nextNetOut = (last?.networkOut || 90) + 140 + Math.random() * 60;
          nextRdsLat = 3.8 + Math.random() * 1.5;
          nextLambda = 1450 + Math.floor(Math.random() * 300);
        }

        const newPoint: MetricPoint = {
          time: timeStr,
          cpu: Math.max(5, Math.min(100, nextCpu)),
          networkIn: Math.max(10, nextNetIn),
          networkOut: Math.max(20, nextNetOut),
          rdsLatency: Math.max(0.8, nextRdsLat),
          lambdaReqs: Math.max(50, nextLambda),
        };

        return [...prev.slice(1), newPoint];
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLive, isStressTesting, refreshInterval]);

  const handleTriggerStressTest = () => {
    if (isStressTesting) return;
    setIsStressTesting(true);

    if (stressTimeoutRef.current) clearTimeout(stressTimeoutRef.current);
    stressTimeoutRef.current = setTimeout(() => {
      setIsStressTesting(false);
    }, 8000);
  };

  const current = history[history.length - 1] || {
    cpu: 28,
    networkIn: 50,
    networkOut: 90,
    rdsLatency: 1.4,
    lambdaReqs: 360,
  };

  // Helper to generate SVG polyline points for smooth graph rendering
  const getSvgPath = (points: number[], min: number, max: number, height = 60, width = 280) => {
    if (!points.length) return '';
    const step = width / (points.length - 1);
    const range = max - min || 1;

    return points
      .map((val, idx) => {
        const x = idx * step;
        const normalized = (val - min) / range;
        const y = height - normalized * (height - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const cpuPoints = history.map((h) => h.cpu);
  const netInPoints = history.map((h) => h.networkIn);
  const rdsPoints = history.map((h) => h.rdsLatency);
  const lambdaPoints = history.map((h) => h.lambdaReqs);

  return (
    <div
      style={{
        background: '#0b1324',
        borderRadius: 16,
        border: '1px solid #1e293b',
        padding: '24px',
        color: '#ffffff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Header with Live Status & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Activity size={22} className={isLive ? 'pulse' : ''} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#ffffff' }}>
                Amazon CloudWatch — Telemetría en Tiempo Real
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: isLive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                  color: isLive ? '#4ade80' : '#94a3b8',
                  border: isLive ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid #475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: isLive ? '#4ade80' : '#94a3b8',
                    boxShadow: isLive ? '0 0 8px #4ade80' : 'none',
                  }}
                />
                {isLive ? 'STREAMING EN VIVO' : 'PAUSADO'}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Métricas de cómputo EC2, latencia RDS, tráfico ALB y ejecuciones Lambda en us-east-1.
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleTriggerStressTest}
            disabled={isStressTesting}
            style={{
              background: isStressTesting
                ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                : 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: isStressTesting ? '#ffffff' : '#fca5a5',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: isStressTesting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: isStressTesting ? '0 0 16px rgba(239, 68, 68, 0.5)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <Flame size={14} />
            {isStressTesting ? 'Inyectando Pico de Carga (8s)...' : 'Simular Pico de Tráfico (Stress Test)'}
          </button>

          <button
            onClick={() => setIsLive(!isLive)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {isLive ? <Pause size={13} /> : <Play size={13} />}
            {isLive ? 'Pausar' : 'Reanudar'}
          </button>

          {/* Refresh rate dropdown */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#93c5fd',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <option value={1000}>1.0s (Alta Precisión)</option>
            <option value={1500}>1.5s (Estándar)</option>
            <option value={3000}>3.0s (Económico)</option>
          </select>
        </div>
      </div>

      {/* 4 Live Metric Waveform Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {/* Metric 1: EC2 CPU Utilization */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: current.cpu > 80 ? '1px solid #ef4444' : '1px solid #1e293b',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={14} color="#60a5fa" /> EC2 CPU Utilization
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: current.cpu > 80 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  color: current.cpu > 80 ? '#f87171' : '#4ade80',
                }}
              >
                {current.cpu > 80 ? 'ALERTA >80%' : 'OK'}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: current.cpu > 80 ? '#f87171' : '#ffffff' }}>
              {current.cpu.toFixed(1)}%
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Umbral de Alarma: 85.0%</div>
          </div>

          {/* SVG Waveform */}
          <div style={{ marginTop: 12, height: 60, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 280 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={current.cpu > 80 ? '#ef4444' : '#3b82f6'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={current.cpu > 80 ? '#ef4444' : '#3b82f6'} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,60 ${getSvgPath(cpuPoints, 0, 100)} 280,60`}
                fill="url(#cpuGrad)"
              />
              <polyline
                points={getSvgPath(cpuPoints, 0, 100)}
                fill="none"
                stroke={current.cpu > 80 ? '#ef4444' : '#60a5fa'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 2: Network Throughput (ALB) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #1e293b',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowUpRight size={14} color="#34d399" /> ALB Throughput (MB/s)
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                GBit/s Wire
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
              {(current.networkIn + current.networkOut).toFixed(1)} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>MB/s</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              In: {current.networkIn.toFixed(0)} MB/s • Out: {current.networkOut.toFixed(0)} MB/s
            </div>
          </div>

          {/* SVG Waveform */}
          <div style={{ marginTop: 12, height: 60, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 280 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="netGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,60 ${getSvgPath(netInPoints, 0, 250)} 280,60`}
                fill="url(#netGrad)"
              />
              <polyline
                points={getSvgPath(netInPoints, 0, 250)}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 3: RDS Query Latency */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #1e293b',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Database size={14} color="#fbbf24" /> RDS Multi-AZ Latency
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                PostgreSQL
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
              {current.rdsLatency.toFixed(2)} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>ms</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>IOPS: 3,000 Provisioned (gp3)</div>
          </div>

          {/* SVG Waveform */}
          <div style={{ marginTop: 12, height: 60, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 280 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="rdsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,60 ${getSvgPath(rdsPoints, 0, 6)} 280,60`}
                fill="url(#rdsGrad)"
              />
              <polyline
                points={getSvgPath(rdsPoints, 0, 6)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 4: AWS Lambda Invocations */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #1e293b',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} color="#a855f7" /> Lambda Invocations
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                Serverless
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
              {current.lambdaReqs} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>req/s</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Tasa de Errores: 0.00% (HTTP 200 OK)</div>
          </div>

          {/* SVG Waveform */}
          <div style={{ marginTop: 12, height: 60, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 280 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="lambdaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,60 ${getSvgPath(lambdaPoints, 0, 2000)} 280,60`}
                fill="url(#lambdaGrad)"
              />
              <polyline
                points={getSvgPath(lambdaPoints, 0, 2000)}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CloudWatch Active Alarms Summary Footer */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 10,
          border: '1px solid #1e293b',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 12,
          color: '#94a3b8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={15} color="#38bdf8" />
          <span>
            Reglas de Alarma Activadas: <strong style={{ color: '#ffffff' }}>4 configuradas</strong> (SNS Topic:{' '}
            <span style={{ color: '#93c5fd', fontFamily: 'monospace' }}>arn:aws:sns:us-east-1:123456789012:erp-alerts</span>)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontWeight: 600 }}>
          <CheckCircle2 size={14} /> Todos los umbrales de servicio en estado nominal (OK)
        </div>
      </div>
    </div>
  );
}
