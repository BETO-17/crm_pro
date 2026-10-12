import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Globe,
  Check,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Layers,
  Shield,
} from 'lucide-react';
import { useAws } from '../context/AwsContext';
import type { CloudProposal } from '../types/awsTypes';

interface MessageAction {
  type: 'apply_region' | 'apply_architecture' | 'apply_security' | 'apply_cost_optimization';
  label: string;
  payload: any;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: MessageAction;
  detailsCard?: {
    title: string;
    badge: string;
    badgeColor?: string;
    items: { label: string; value: string }[];
    pros?: string[];
    note?: string;
  };
}

interface AwsAiRegionAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickPromptCategories: {
  icon: ReactNode;
  label: string;
  prompts: string[];
}[] = [
  {
    icon: <Layers size={13} />,
    label: 'Arquitectura',
    prompts: [
      'Crear arquitectura E-commerce Retail (Alta Disponibilidad)',
      'Diseñar arquitectura Serverless para Data Lake & Analítica',
      'Estructurar API Backend con microservicios escalables',
    ],
  },
  {
    icon: <Shield size={13} />,
    label: 'Seguridad',
    prompts: [
      'Auditar mi postura de seguridad y corregir brechas',
      '¿Qué controles me faltan para llegar a 100/100 en seguridad?',
    ],
  },
  {
    icon: <Globe size={13} />,
    label: 'Regiones',
    prompts: [
      'Recomiéndame la mejor región para Perú y LATAM',
      '¿Cuál es la región más económica de AWS?',
      'Región con cumplimiento GDPR / Soberanía Europea',
    ],
  },
  {
    icon: <DollarSign size={13} />,
    label: 'Costos',
    prompts: [
      '¿Cómo optimizar mis costos mensuales en AWS?',
      'Calcular arquitectura económica de bajo presupuesto',
    ],
  },
];

export default function AwsAiRegionAdvisor({ isOpen, onClose }: AwsAiRegionAdvisorProps) {
  const {
    selectedRegion,
    setSelectedRegion,
    totalMonthlyCost,
    securityScore,
    deployedServices,
    addProposal,
    setAllSecurityControls,
  } = useAws();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: '¡Hola! Soy tu **Copiloto de Arquitectura Cloud AWS**. Estoy integrado con todos los módulos del sistema:\n\n• **Planificación:** Puedo diseñar y registrar arquitecturas completas en 1 clic.\n• **Regiones:** Analizo latencias y costos para seleccionar la mejor ubicación.\n• **Seguridad:** Audito tus controles IAM y te ayudo a alcanzar 100/100.\n• **FinOps:** Optimizo tus cotizaciones y presupuesto mensual.\n\n¿Qué solución deseas construir o analizar hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [executedActionId, setExecutedActionId] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const generateAiResponse = (userQuery: string): Message => {
    const q = userQuery.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. ARQUITECTURA: E-commerce / Retail
    if (q.includes('e-commerce') || q.includes('retail') || q.includes('tienda') || q.includes('ventas') || q.includes('erp')) {
      const isLatam = q.includes('peru') || q.includes('latam') || q.includes('sudamerica');
      const targetRegion = isLatam ? 'sa-east-1 (São Paulo)' : 'us-east-1 (N. Virginia)';
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'He diseñado una arquitectura **Well-Architected de Alta Disponibilidad** para una plataforma de E-commerce / Retail con alta resiliencia:',
        timestamp: time,
        detailsCard: {
          title: 'Arquitectura ERP Retail Multi-AZ Cloud',
          badge: '99.95% SLA • Alta Disponibilidad',
          badgeColor: '#2563eb',
          items: [
            { label: 'Servicios', value: 'EC2, RDS PostgreSQL (Multi-AZ), S3, CloudFront, VPC, Route 53' },
            { label: 'Región sugerida', value: targetRegion },
            { label: 'Costo mensual est.', value: '$665.94 / mes' },
            { label: 'Capacidad', value: '25,000 usuarios concurrentes' },
          ],
          pros: [
            'Failover automático síncrono en base de datos Multi-AZ',
            'Caché perimetral global con CloudFront para imágenes y frontend',
            'Segmentación de red segura en VPC con subredes privadas',
          ],
          note: 'Haz clic en el botón inferior para registrar esta propuesta en Planificación y cargar automáticamente la cotización.',
        },
        action: {
          type: 'apply_architecture',
          label: 'Crear esta Arquitectura en el Sistema',
          payload: {
            solutionName: 'ERP Retail Enterprise Cloud Multi-AZ',
            appType: 'E-commerce & Retail' as CloudProposal['appType'],
            description: 'Arquitectura de alta resiliencia con cómputo elástico EC2, base de datos RDS PostgreSQL Multi-AZ y caché perimetral CloudFront.',
            region: targetRegion,
            estimatedUsers: 25000,
            availabilityLevel: '99.95% (Alta Disponibilidad)' as CloudProposal['availabilityLevel'],
            selectedServices: ['EC2', 'RDS', 'S3', 'CloudFront', 'VPC', 'Route 53', 'IAM'],
            migrationGoal: 'Modernización de Aplicación' as CloudProposal['migrationGoal'],
            monthlyBudget: 665.94,
            annualBudget: 7991.28,
            status: 'Aprobada' as CloudProposal['status'],
          },
        },
      };
    }

    // 2. ARQUITECTURA: Serverless / Data Lake
    if (q.includes('serverless') || q.includes('data lake') || q.includes('analitica') || q.includes('analítica') || q.includes('lambda')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'He diseñado una solución **Serverless Event-Driven** para procesamiento analítico de datos a escala con coste basado estrictamente en consumo:',
        timestamp: time,
        detailsCard: {
          title: 'Data Lakehouse & Procesamiento Serverless',
          badge: 'Pago por Uso • Escalabilidad Infinita',
          badgeColor: '#7c3aed',
          items: [
            { label: 'Servicios', value: 'AWS Lambda, Amazon S3, CloudWatch, IAM' },
            { label: 'Región sugerida', value: 'us-east-1 (N. Virginia)' },
            { label: 'Costo mensual est.', value: '$182.50 / mes' },
            { label: 'Capacidad', value: 'Millones de eventos / peticiones' },
          ],
          pros: [
            'Cero servidores por administrar ni parchar',
            'Almacenamiento masivo en S3 Data Lake con tiering automático',
            'Ejecución en milisegundos con microservicios Lambda',
          ],
        },
        action: {
          type: 'apply_architecture',
          label: 'Crear Solución Serverless en el Sistema',
          payload: {
            solutionName: 'Data Lakehouse & Analítica Serverless',
            appType: 'Data Lake & Analítica' as CloudProposal['appType'],
            description: 'Ingesta continua de eventos de negocio, almacenamiento centralizado en S3 y transformaciones automáticas con AWS Lambda.',
            region: 'us-east-1 (N. Virginia)',
            estimatedUsers: 10000,
            availabilityLevel: '99.99% (Misión Crítica Multi-Región)' as CloudProposal['availabilityLevel'],
            selectedServices: ['S3', 'Lambda', 'CloudWatch', 'IAM'],
            migrationGoal: 'Escalabilidad Elástica' as CloudProposal['migrationGoal'],
            monthlyBudget: 182.50,
            annualBudget: 2190.00,
            status: 'Aprobada' as CloudProposal['status'],
          },
        },
      };
    }

    // 3. SEGURIDAD: Auditoría y Controles
    if (q.includes('seguridad') || q.includes('auditar') || q.includes('brecha') || q.includes('mfa') || q.includes('iam') || q.includes('100/100')) {
      const missingControls = 100 - securityScore;
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Tu postura de seguridad actual es de **${securityScore}/100 puntos**. He evaluado las mejores prácticas del pilar de Seguridad de AWS (AWS Well-Architected Framework):`,
        timestamp: time,
        detailsCard: {
          title: 'Plan de Endurecimiento de Seguridad (Hardening)',
          badge: missingControls > 0 ? `Oportunidad: +${missingControls} pts` : 'Postura Máxima (100/100)',
          badgeColor: '#16a34a',
          items: [
            { label: 'Puntaje Actual', value: `${securityScore} / 100` },
            { label: 'Meta Recomendada', value: '100 / 100 (Excelente)' },
            { label: 'Controles Clave', value: 'MFA Forzado, Root Lockout, Roles STS, TLS 1.3, S3 KMS, CloudTrail' },
          ],
          pros: [
            'Eliminación de credenciales estáticas mediante roles IAM temporales',
            'Bloqueo total de la cuenta Root y forzado de autenticación multifactor',
            'Cifrado en tránsito y reposo para cumplimiento normativo internacional',
          ],
          note: 'Al presionar el botón se habilitarán todos los controles de seguridad en el módulo de Seguridad & IAM.',
        },
        action: {
          type: 'apply_security',
          label: 'Aplicar Todos los Controles de Seguridad (Llegar a 100/100)',
          payload: {
            rootBlocked: true,
            mfaEnforced: true,
            ec2Roles: true,
            tls13: true,
            s3EncryptionAndVersioning: true,
            complianceAudits: true,
          },
        },
      };
    }

    // 4. REGIONES: LATAM / Perú
    if (q.includes('latam') || q.includes('peru') || q.includes('perú') || q.includes('sudamerica') || q.includes('brasil')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Para clientes en **Perú y Sudamérica**, la mejor opción para reducir al mínimo los tiempos de respuesta de red es la región de São Paulo:',
        timestamp: time,
        detailsCard: {
          title: 'Región sa-east-1 (São Paulo, Brasil)',
          badge: 'Menor Latencia Sudamérica',
          badgeColor: '#16a34a',
          items: [
            { label: 'Latencia desde Perú/Chile', value: '25 - 40 ms (Excelente)' },
            { label: 'Zonas de Disponibilidad', value: '3 AZs Físicas' },
            { label: 'Soberanía de Datos', value: 'Cumple con regulaciones locales LATAM' },
          ],
          pros: [
            'Respuestas ultra rápidas para sistemas ERP y transacciones en tiempo real',
            'Conexión directa mediante cables submarinos transoceánicos',
          ],
        },
        action: {
          type: 'apply_region',
          label: 'Aplicar sa-east-1 (São Paulo) como Región Primaria',
          payload: 'sa-east-1 (São Paulo)',
        },
      };
    }

    // 5. REGIONES: Económica / US East
    if (q.includes('econ') || q.includes('barat') || q.includes('costo') || q.includes('presupuesto') || q.includes('virginia')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'La región con las tarifas más bajas del planeta y el catálogo más amplio de servicios es **us-east-1 (N. Virginia)**:',
        timestamp: time,
        detailsCard: {
          title: 'Región us-east-1 (N. Virginia, USA)',
          badge: 'Tarifa Más Económica (Tier 1)',
          badgeColor: '#d97706',
          items: [
            { label: 'Comparativa de Precios', value: '15% a 30% más económica que otras regiones' },
            { label: 'Capacidad', value: '6 Zonas de Disponibilidad (AZs)' },
            { label: 'Lanzamiento de Servicios', value: 'Prioridad 1 en toda la red de AWS' },
          ],
          pros: [
            'Máximo ahorro en instancias EC2, bases de datos RDS y buckets S3',
            'Excelente rendimiento combinada con CloudFront Edge PoPs',
          ],
        },
        action: {
          type: 'apply_region',
          label: 'Aplicar us-east-1 (N. Virginia) como Región Primaria',
          payload: 'us-east-1 (N. Virginia)',
        },
      };
    }

    // 6. REGIONES: Europa GDPR
    if (q.includes('europa') || q.includes('gdpr') || q.includes('irlanda') || q.includes('ue')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Para estricta soberanía de datos en Europa y cumplimiento con **GDPR / ISO 27001**, la región recomendada es **eu-west-1 (Irlanda)**:',
        timestamp: time,
        detailsCard: {
          title: 'Región eu-west-1 (Irlanda, Europa)',
          badge: 'Cumplimiento GDPR Total',
          badgeColor: '#2563eb',
          items: [
            { label: 'Latencia en Europa', value: '15 - 30 ms' },
            { label: 'Marco Legal', value: 'GDPR / ENS / ISO 27001' },
            { label: 'Zonas de Disponibilidad', value: '3 AZs' },
          ],
        },
        action: {
          type: 'apply_region',
          label: 'Aplicar eu-west-1 (Irlanda) como Región Primaria',
          payload: 'eu-west-1 (Ireland)',
        },
      };
    }

    // 7. DEFAULT: General Cloud Advisor
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `He analizado tu consulta: "${userQuery}".\n\nActualmente tienes **${deployedServices.length} servicios activos** con un presupuesto de **$${totalMonthlyCost.toFixed(2)}/mes** en la región **${selectedRegion}** y una postura de seguridad de **${securityScore}/100**.\n\nPuedes pedirme:\n• Diseñar una propuesta para tu caso de uso específico.\n• Mejorar tus controles de seguridad a 100/100.\n• Analizar y cambiar tu región a la más conveniente.`,
      timestamp: time,
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAiResponse(query);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 500);
  };

  const handleExecuteAction = (action: MessageAction, msgId: string) => {
    if (action.type === 'apply_region') {
      setSelectedRegion(action.payload);
    } else if (action.type === 'apply_architecture') {
      addProposal(action.payload);
    } else if (action.type === 'apply_security') {
      setAllSecurityControls(action.payload);
    }
    setExecutedActionId(msgId);
    setTimeout(() => setExecutedActionId(null), 3500);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Copiloto IA de Arquitectura Cloud AWS"
      style={{
        width: 410,
        height: '100%',
        background: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.08)',
        zIndex: 50,
        flexShrink: 0,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.5)',
            }}
          >
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>AWS Cloud Architect AI</span>
              <Sparkles size={13} color="#fcd34d" />
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Copiloto Integral del Sistema</span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: 6,
            width: 28,
            height: 28,
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Cerrar copiloto IA"
        >
          <X size={16} />
        </button>
      </div>

      {/* Live System Context Mini Bar */}
      <div
        style={{
          padding: '8px 14px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: 11,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          color: '#475569',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Globe size={12} color="#2563eb" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedRegion.split(' ')[0]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <DollarSign size={12} color="#f59e0b" />
          <strong>${totalMonthlyCost.toFixed(0)}/m</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
          <ShieldCheck size={12} color="#16a34a" />
          <strong style={{ color: securityScore >= 80 ? '#16a34a' : '#d97706' }}>
            {securityScore}/100
          </strong>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div
        style={{
          flex: 1,
          padding: '14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          background: '#f8fafc',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: 4,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                maxWidth: '94%',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: msg.sender === 'user' ? '#2563eb' : '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 11,
                }}
              >
                {msg.sender === 'user' ? <User size={13} /> : <Sparkles size={13} color="#f59e0b" />}
              </div>

              <div
                style={{
                  background: msg.sender === 'user' ? '#2563eb' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.text}

                {/* Rich Details Card */}
                {msg.detailsCard && (
                  <div
                    style={{
                      marginTop: 10,
                      background: '#f1f5f9',
                      borderRadius: 10,
                      padding: '12px',
                      border: '1.5px solid #bfdbfe',
                      color: '#1e293b',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>
                        {msg.detailsCard.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: '#dbeafe',
                          color: msg.detailsCard.badgeColor || '#1e40af',
                        }}
                      >
                        {msg.detailsCard.badge}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '8px 0' }}>
                      {msg.detailsCard.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, gap: 8 }}>
                          <span style={{ color: '#64748b' }}>{it.label}:</span>
                          <strong style={{ color: '#1e293b', textAlign: 'right' }}>{it.value}</strong>
                        </div>
                      ))}
                    </div>

                    {msg.detailsCard.pros && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 8, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                        {msg.detailsCard.pros.map((p, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 11, color: '#475569' }}>
                            <Check size={12} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.detailsCard.note && (
                      <p style={{ margin: '8px 0 0', fontSize: 10.5, color: '#64748b', fontStyle: 'italic' }}>
                        {msg.detailsCard.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Trigger Button */}
                {msg.action && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={() => handleExecuteAction(msg.action!, msg.id)}
                      style={{
                        width: '100%',
                        background: executedActionId === msg.id ? '#16a34a' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 7,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {executedActionId === msg.id ? (
                        <><Check size={14} /> ¡Cambios Aplicados en el Sistema!</>
                      ) : (
                        <>
                          <span>{msg.action.label}</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#94a3b8', padding: '0 34px' }}>{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="#f59e0b" />
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', fontSize: 11.5, color: '#64748b' }}>
              Consultando modelo de arquitectura y estado del sistema...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Category Tabs & Quick Prompts */}
      <div
        style={{
          padding: '10px 12px',
          background: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
          {quickPromptCategories.map((cat, idx) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategoryTab(idx)}
              style={{
                background: activeCategoryTab === idx ? '#eff6ff' : '#f8fafc',
                border: activeCategoryTab === idx ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                color: activeCategoryTab === idx ? '#1d4ed8' : '#64748b',
                borderRadius: 14,
                padding: '3px 9px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {quickPromptCategories[activeCategoryTab].prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '5px 9px',
                fontSize: 11,
                color: '#334155',
                cursor: 'pointer',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#93c5fd')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div
        style={{
          padding: '12px 14px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="text"
            placeholder="Pregunta sobre arquitectura, seguridad, costos o regiones..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 12.5,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            style={{
              background: input.trim() && !isTyping ? '#2563eb' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '0 14px',
              cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </aside>
  );
}
