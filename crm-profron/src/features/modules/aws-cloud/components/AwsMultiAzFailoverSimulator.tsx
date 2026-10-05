import { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Server,
  Database,
  Play,
  RotateCcw,
  Terminal,
  Layers,
  Flame,
} from 'lucide-react';

type SimulationState = 'NORMAL' | 'AZ_A_DOWN' | 'AZ_B_DOWN' | 'EC2_FAIL' | 'RDS_FAILOVER' | 'RECOVERING';

interface LogEntry {
  id: string;
  time: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

export default function AwsMultiAzFailoverSimulator() {
  const [simState, setSimState] = useState<SimulationState>('NORMAL');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [trafficSplit, setTrafficSplit] = useState<{ azA: number; azB: number }>({ azA: 50, azB: 50 });
  const [rdsMaster, setRdsMaster] = useState<'AZ_A' | 'AZ_B'>('AZ_A');
  const [ec2AHealth, setEc2AHealth] = useState<'HEALTHY' | 'UNHEALTHY' | 'TERMINATED'>('HEALTHY');
  const [ec2BHealth, setEc2BHealth] = useState<'HEALTHY' | 'UNHEALTHY'>('HEALTHY');
  const [rtoSeconds, setRtoSeconds] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      time: new Date().toLocaleTimeString(),
      type: 'SUCCESS',
      message: 'Arquitectura Multi-AZ inicializada en región us-east-1. ALB distribuyendo balanceo de carga (50% / 50%).',
    },
    {
      id: '2',
      time: new Date().toLocaleTimeString(),
      type: 'INFO',
      message: 'Replicación síncrona de Amazon RDS PostgreSQL activa entre us-east-1a (Primary) y us-east-1b (Standby).',
    },
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev.slice(-15), newEntry]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle Disaster Simulation: AZ-A Outage
  const triggerAzAFailover = () => {
    setSimState('AZ_A_DOWN');
    setEc2AHealth('UNHEALTHY');
    setRtoSeconds(14);
    addLog('ERROR', '🔥 [CHAOS TEST] Corte de suministro y caída total de la Zona de Disponibilidad us-east-1a.');
    addLog('WARN', '⚠️ CloudWatch Alarm: [ALB-TargetGroup-Unhealthy] 2 de 2 health checks fallaron en us-east-1a.');

    setTimeout(() => {
      setTrafficSplit({ azA: 0, azB: 100 });
      addLog('INFO', '🔄 Application Load Balancer desregistra targets caídos y redirige el 100% del tráfico a us-east-1b.');
    }, 900);

    setTimeout(() => {
      setRdsMaster('AZ_B');
      addLog('SUCCESS', '🚀 Amazon RDS Multi-AZ Failover completado: Réplica en us-east-1b promovida a PRIMARY MASTER (RPO: 0s, RTO: 14s).');
      addLog('SUCCESS', '✅ CNAME DNS de base de datos erp-db.c83j1.us-east-1.rds.amazonaws.com actualizado transparentemente.');
    }, 2200);
  };

  // Handle Disaster Simulation: EC2 Instance Crash in AZ-A
  const triggerEc2Crash = () => {
    setSimState('EC2_FAIL');
    setEc2AHealth('UNHEALTHY');
    setTrafficSplit({ azA: 10, azB: 90 });
    addLog('ERROR', '💥 [CHAOS TEST] Inyección de falla de memoria (OOM Kernel Panic) en instancia EC2 app-srv-01 (us-east-1a).');
    addLog('WARN', '⚠️ ALB detectó HTTP 502 Bad Gateway en puerto 8080. Drenando conexiones activas.');

    setTimeout(() => {
      setEc2AHealth('TERMINATED');
      setTrafficSplit({ azA: 0, azB: 100 });
      addLog('INFO', '🛠️ AWS Auto Scaling Group detecta instancia no saludable. Iniciando terminación y reemplazo automático...');
    }, 1400);

    setTimeout(() => {
      setEc2AHealth('HEALTHY');
      setTrafficSplit({ azA: 50, azB: 50 });
      setSimState('NORMAL');
      addLog('SUCCESS', '🌱 Nueva instancia EC2 i-0ff92c10b instanciada y registrada como Healthy en el Target Group.');
    }, 3800);
  };

  // Handle Disaster Simulation: RDS Forced Failover
  const triggerRdsFailover = () => {
    setSimState('RDS_FAILOVER');
    addLog('WARN', '⚡ [CHAOS TEST] Forzando Failover manual de Base de Datos RDS (Simulación de mantenimiento / Kernel upgrade).');
    
    setTimeout(() => {
      const nextMaster = rdsMaster === 'AZ_A' ? 'AZ_B' : 'AZ_A';
      setRdsMaster(nextMaster);
      addLog('SUCCESS', `✅ Failover de Base de Datos exitoso. El nuevo nodo MASTER se encuentra en ${nextMaster === 'AZ_A' ? 'us-east-1a' : 'us-east-1b'}.`);
      setSimState('NORMAL');
    }, 2000);
  };

  // Restore everything to healthy multi-AZ
  const handleRestore = () => {
    setSimState('RECOVERING');
    addLog('INFO', '🔄 Iniciando protocolo de recuperación y resincronización de zonas (Self-Healing)...');

    setTimeout(() => {
      setSimState('NORMAL');
      setEc2AHealth('HEALTHY');
      setEc2BHealth('HEALTHY');
      setTrafficSplit({ azA: 50, azB: 50 });
      setRdsMaster('AZ_A');
      setRtoSeconds(0);
      addLog('SUCCESS', '✨ Todos los Data Centers y servicios restaurados. Tráfico balanceado uniformemente 50% / 50%.');
    }, 1200);
  };

  // Auto demonstration loop
  const handleRunAutoDemo = () => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);
    handleRestore();

    setTimeout(() => {
      triggerAzAFailover();
    }, 2000);

    setTimeout(() => {
      handleRestore();
      setIsAutoPlaying(false);
    }, 7000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Control Center */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 14,
          padding: '20px 24px',
          border: '1px solid #334155',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(96, 165, 250, 0.5)',
                color: '#93c5fd',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 20,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Zap size={13} color="#60a5fa" /> CHAOS LAB — ALTA DISPONIBILIDAD
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: simState === 'NORMAL' ? '#4ade80' : '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: simState === 'NORMAL' ? '#4ade80' : '#f87171',
                  boxShadow: `0 0 10px ${simState === 'NORMAL' ? '#4ade80' : '#f87171'}`,
                }}
              />
              {simState === 'NORMAL' ? 'SISTEMA 100% OPERATIVO (MULTI-AZ ACTIVO)' : 'SIMULACIÓN DE CONTINGENCIA EN CURSO'}
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
            Simulador de Resiliencia, Caída de Zona & Failover Automático
          </h2>
          <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8', maxWidth: 650 }}>
            Experimenta cómo la arquitectura Multi-AZ de AWS con Application Load Balancer y Amazon RDS mitiga desastres en tiempo real sin pérdida de datos.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleRunAutoDemo}
            disabled={isAutoPlaying}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 16px',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: isAutoPlaying ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            }}
          >
            <Play size={14} /> {isAutoPlaying ? 'Ejecutando Demo...' : 'Demo Automática de Caída'}
          </button>

          <button
            onClick={handleRestore}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: 8,
              padding: '9px 14px',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={14} /> Restaurar Todo
          </button>
        </div>
      </div>

      {/* Metric Cards KPI HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Disponibilidad del Sistema (SLA)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginTop: 3 }}>99.995%</div>
          <div style={{ fontSize: 11, color: '#16a34a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Cero caídas para usuarios finales
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Distribución de Carga (ALB)</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
            AZ-A: <span style={{ color: trafficSplit.azA === 0 ? '#ef4444' : '#2563eb' }}>{trafficSplit.azA}%</span> | AZ-B:{' '}
            <span style={{ color: '#2563eb' }}>{trafficSplit.azB}%</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Round Robin adaptativo</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>RPO (Recovery Point Objective)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>0 seg</div>
          <div style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>Cero pérdida de transacciones</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>RTO (Recovery Time Objective)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: rtoSeconds > 0 ? '#f59e0b' : '#16a34a', marginTop: 3 }}>
            {rtoSeconds > 0 ? `${rtoSeconds} seg` : '< 15 seg'}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Failover automatizado sin intervención</div>
        </div>
      </div>

      {/* Main Interactive Multi-AZ Diagram Grid */}
      <div
        style={{
          background: '#0b1324',
          borderRadius: 16,
          border: '1px solid #1e293b',
          padding: '24px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'relative',
        }}
      >
        {/* Layer 1: Global Entry (Internet & Application Load Balancer) */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #334155',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            zIndex: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Layers size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>
                  AWS Application Load Balancer (ALB)
                </span>
                <span style={{ fontSize: 11, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  Active Health Check
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                DNS: alb-enterprise-prod.us-east-1.elb.amazonaws.com • Algoritmo: Least Outstanding Requests
              </div>
            </div>
          </div>

          {/* Real-time traffic balance bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>Balanceo en vivo:</div>
            <div style={{ width: 140, height: 10, background: '#334155', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
              <div
                style={{
                  width: `${trafficSplit.azA}%`,
                  background: trafficSplit.azA > 0 ? '#3b82f6' : '#ef4444',
                  transition: 'width 0.5s ease',
                }}
              />
              <div
                style={{
                  width: `${trafficSplit.azB}%`,
                  background: '#60a5fa',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Layer 2: Dual Availability Zones (Side by Side) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Availability Zone A */}
          <div
            style={{
              background: simState === 'AZ_A_DOWN' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(15, 23, 42, 0.85)',
              border: simState === 'AZ_A_DOWN' ? '2px dashed #ef4444' : '2px dashed #3b82f6',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            {/* AZ Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: simState === 'AZ_A_DOWN' ? '#f87171' : '#93c5fd' }}>
                  🏢 Zona A: us-east-1a (Data Center Primario)
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: simState === 'AZ_A_DOWN' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.2)',
                  color: simState === 'AZ_A_DOWN' ? '#fca5a5' : '#4ade80',
                }}
              >
                {simState === 'AZ_A_DOWN' ? '🔴 FUERA DE SERVICIO' : '🟢 SALUDABLE'}
              </span>
            </div>

            {/* Subnet 1: EC2 App Tier */}
            <div
              style={{
                background: ec2AHealth === 'HEALTHY' ? '#1e293b' : 'rgba(239, 68, 68, 0.2)',
                border: ec2AHealth === 'HEALTHY' ? '1px solid #334155' : '1px solid #ef4444',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={20} color={ec2AHealth === 'HEALTHY' ? '#60a5fa' : '#ef4444'} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>EC2 App Instance (app-srv-01)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>IP: 10.0.10.42 • Subred Privada A</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: ec2AHealth === 'HEALTHY' ? '#4ade80' : '#f87171',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '3px 7px',
                  borderRadius: 4,
                }}
              >
                {ec2AHealth}
              </span>
            </div>

            {/* Subnet 2: RDS PostgreSQL */}
            <div
              style={{
                background: rdsMaster === 'AZ_A' && simState !== 'AZ_A_DOWN' ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                border: rdsMaster === 'AZ_A' && simState !== 'AZ_A_DOWN' ? '1px solid #10b981' : '1px solid #334155',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={20} color={rdsMaster === 'AZ_A' ? '#34d399' : '#94a3b8'} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>RDS PostgreSQL Cluster</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Endpoint: erp-db.us-east-1a • Subred Datos A</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: rdsMaster === 'AZ_A' && simState !== 'AZ_A_DOWN' ? '#34d399' : '#94a3b8',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                {simState === 'AZ_A_DOWN' ? 'OFFLINE' : rdsMaster === 'AZ_A' ? '⭐ PRIMARY MASTER' : 'STANDBY REPLICA'}
              </span>
            </div>

            {/* Chaos Injection Buttons for AZ-A */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
              <button
                onClick={triggerAzAFailover}
                disabled={simState === 'AZ_A_DOWN'}
                style={{
                  flex: 1,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: simState === 'AZ_A_DOWN' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <Flame size={12} /> Caída de Zona A
              </button>

              <button
                onClick={triggerEc2Crash}
                disabled={simState !== 'NORMAL'}
                style={{
                  flex: 1,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#fde68a',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: simState !== 'NORMAL' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <AlertTriangle size={12} /> Falla App Server
              </button>
            </div>
          </div>

          {/* Availability Zone B */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: simState === 'AZ_A_DOWN' ? '2px solid #22c55e' : '2px dashed #3b82f6',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              position: 'relative',
              boxShadow: simState === 'AZ_A_DOWN' ? '0 0 25px rgba(34, 197, 94, 0.25)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {/* AZ Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#93c5fd' }}>
                  🏢 Zona B: us-east-1b (Data Center Secundario / Standby)
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                }}
              >
                🟢 {simState === 'AZ_A_DOWN' ? 'ABSORBIENDO 100% TRÁFICO' : 'SALUDABLE'}
              </span>
            </div>

            {/* Subnet 1: EC2 App Tier */}
            <div
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={20} color="#60a5fa" />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>EC2 App Instance (app-srv-02)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>IP: 10.0.11.88 • Subred Privada B</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: '#4ade80',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '3px 7px',
                  borderRadius: 4,
                }}
              >
                {ec2BHealth}
              </span>
            </div>

            {/* Subnet 2: RDS PostgreSQL */}
            <div
              style={{
                background: rdsMaster === 'AZ_B' ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                border: rdsMaster === 'AZ_B' ? '1px solid #10b981' : '1px solid #334155',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={20} color={rdsMaster === 'AZ_B' ? '#34d399' : '#94a3b8'} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>RDS PostgreSQL Cluster</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Endpoint: erp-db.us-east-1b • Subred Datos B</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: rdsMaster === 'AZ_B' ? '#34d399' : '#94a3b8',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                {rdsMaster === 'AZ_B' ? '⭐ PROMOTED TO MASTER' : '🔄 SYNCHRONOUS STANDBY'}
              </span>
            </div>

            {/* Manual RDS Failover Trigger */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
              <button
                onClick={triggerRdsFailover}
                disabled={simState !== 'NORMAL'}
                style={{
                  flex: 1,
                  background: 'rgba(37, 99, 235, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#93c5fd',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: simState !== 'NORMAL' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <RefreshCw size={12} /> Forzar Failover RDS Manual
              </button>
            </div>
          </div>
        </div>

        {/* Data Replication Sync Stream Bar */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 11.5,
            color: '#cbd5e1',
          }}
        >
          <Database size={14} color="#34d399" />
          <span>Canal de Replicación Síncrona Multi-AZ AWS (Latencia &lt; 2ms):</span>
          <span style={{ fontWeight: 700, color: simState === 'AZ_A_DOWN' ? '#f87171' : '#4ade80' }}>
            {simState === 'AZ_A_DOWN' ? '⏸️ Replicación pausada (Nodo B promovido)' : '⚡ Sincronizado en tiempo real (RPO = 0s)'}
          </span>
        </div>
      </div>

      {/* Incident Command Console & CloudWatch Event Log */}
      <div
        style={{
          background: '#0f172a',
          borderRadius: 14,
          border: '1px solid #1e293b',
          padding: 18,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #1e293b', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', fontSize: 13, fontWeight: 700 }}>
            <Terminal size={16} color="#60a5fa" />
            <span>AWS CloudWatch Events & Incident Response Log (Audit Trail)</span>
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Eventos en Vivo del Motor de Resiliencia</span>
        </div>

        <div
          ref={logContainerRef}
          style={{
            height: 140,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontFamily: 'monospace',
            fontSize: 11.5,
            paddingRight: 6,
          }}
        >
          {logs.map((log) => {
            let color = '#94a3b8';
            if (log.type === 'ERROR') color = '#f87171';
            if (log.type === 'WARN') color = '#fbbf24';
            if (log.type === 'SUCCESS') color = '#4ade80';
            if (log.type === 'INFO') color = '#93c5fd';

            return (
              <div key={log.id} style={{ display: 'flex', gap: 10, lineHeight: 1.4 }}>
                <span style={{ color: '#64748b' }}>[{log.time}]</span>
                <span style={{ color, fontWeight: 600 }}>{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
