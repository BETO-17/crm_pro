import type { CloudProposal, CostSimulationItem } from '../types/awsTypes';
import type { SecurityControls } from '../context/AwsContext';

export const demoProposal: CloudProposal = {
  id: 'prop-demo-001',
  solutionName: 'Portal de Clientes TechSoluciones',
  appType: 'E-commerce & Retail',
  description: 'Plataforma web de autogestión de clientes retail para seguimiento de pedidos, catálogo en tiempo real y facturación electrónica.',
  region: 'sa-east-1 (São Paulo)',
  estimatedUsers: 5000,
  availabilityLevel: '99.9% (Básico Multi-AZ)',
  selectedServices: ['EC2', 'RDS', 'S3', 'VPC', 'IAM', 'Route 53', 'CloudFront', 'ALB'],
  migrationGoal: 'Modernización de Aplicación',
  monthlyBudget: 310.95,
  annualBudget: 3731.40,
  createdAt: '2026-10-12',
  status: 'Aprobada',
};

export const demoCostItems: CostSimulationItem[] = [
  {
    id: 'cost-demo-1',
    serviceId: 'srv-ec2',
    serviceName: 'Amazon Elastic Compute Cloud (EC2)',
    category: 'Cómputo',
    instanceTypeOrTier: 't3.large (2 vCPU, 8 GB RAM)',
    quantity: 2,
    hoursPerMonth: 730,
    unit: 'hour',
    unitPrice: 0.0832,
    formulaText: '$0.0832 × 2 instancias × 730 h',
    costPerHour: 0.0832,
    monthlyCost: 121.47,
    annualCost: 1457.64,
  },
  {
    id: 'cost-demo-2',
    serviceId: 'srv-rds',
    serviceName: 'Amazon Relational Database Service (RDS)',
    category: 'Base de Datos',
    instanceTypeOrTier: 'db.t3.large PostgreSQL Multi-AZ',
    quantity: 1,
    hoursPerMonth: 730,
    unit: 'hour',
    unitPrice: 0.175,
    formulaText: '$0.1750 × 1 instancia × 730 h',
    costPerHour: 0.175,
    monthlyCost: 127.75,
    annualCost: 1533.00,
  },
  {
    id: 'cost-demo-3',
    serviceId: 'srv-s3',
    serviceName: 'Amazon Simple Storage Service (S3)',
    category: 'Almacenamiento',
    instanceTypeOrTier: 'S3 Standard Storage (100 GB)',
    quantity: 100,
    hoursPerMonth: 730,
    unit: 'gb-month',
    unitPrice: 0.023,
    formulaText: '$0.0230 × 100 GB almacenados',
    costPerHour: 0.023 / 730,
    monthlyCost: 2.30,
    annualCost: 27.60,
  },
  {
    id: 'cost-demo-4',
    serviceId: 'srv-route53',
    serviceName: 'Amazon Route 53 (DNS Cloud)',
    category: 'Redes y CDN',
    instanceTypeOrTier: 'Zona Alojada Pública (erpxmetrics360.com)',
    quantity: 1,
    hoursPerMonth: 730,
    unit: 'hosted-zone-month',
    unitPrice: 0.50,
    formulaText: '$0.5000 × 1 zona alojada al mes',
    costPerHour: 0.50 / 730,
    monthlyCost: 0.50,
    annualCost: 6.00,
  },
  {
    id: 'cost-demo-5',
    serviceId: 'srv-cloudfront',
    serviceName: 'Amazon CloudFront (CDN)',
    category: 'Redes y CDN',
    instanceTypeOrTier: 'Transferencia de datos saliente (500 GB)',
    quantity: 500,
    hoursPerMonth: 730,
    unit: 'gb-transfer',
    unitPrice: 0.085,
    formulaText: '$0.0850 × 500 GB transferidos',
    costPerHour: 0.085 / 730,
    monthlyCost: 42.50,
    annualCost: 510.00,
  },
  {
    id: 'cost-demo-6',
    serviceId: 'srv-alb',
    serviceName: 'Elastic Load Balancing (ALB)',
    category: 'Redes y CDN',
    instanceTypeOrTier: 'Application Load Balancer (1 ALB × 730 h)',
    quantity: 1,
    hoursPerMonth: 730,
    unit: 'hour',
    unitPrice: 0.0225,
    formulaText: '$0.0225 × 1 balanceador × 730 h',
    costPerHour: 0.0225,
    monthlyCost: 16.43,
    annualCost: 197.16,
  },
];

export const demoSecurityControls: SecurityControls = {
  rootBlocked: true,              // 20 pts (Cumplido)
  mfaEnforced: true,              // 20 pts (Cumplido)
  tls13: true,                    // 15 pts (Requiere revisión parcial)
  ec2Roles: false,                // 0 pts (En riesgo)
  s3EncryptionAndVersioning: false,// 0 pts
  complianceAudits: false,        // 0 pts
};
// Postura resultante: 20 + 20 + 15 = 55 pts (Ámbar: 40 a 79)
// Matriz muestra los 3 colores:
// - Identidad y Acceso: Cumplido (Verde)
// - Cifrado y Datos: Requiere revisión (Ámbar)
// - Protección de Cómputo: En riesgo (Rojo)
