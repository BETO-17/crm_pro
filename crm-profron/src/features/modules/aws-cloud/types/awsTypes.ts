// ==========================================
// Cloud Foundations — AWS Types & Interfaces
// ==========================================

export type ServiceCategory =
  | 'Cómputo'
  | 'Almacenamiento'
  | 'Base de Datos'
  | 'Redes y CDN'
  | 'Seguridad e Identidad'
  | 'Serverless'
  | 'Monitoreo y Gestión'
  | 'Analítica';

export interface AwsService {
  id: string;
  name: string;
  codeName: string;
  category: ServiceCategory;
  description: string;
  mainFunction: string;
  status: 'Activo' | 'Planificado' | 'Disponible' | 'En Mantenimiento';
  iconType: 'server' | 'database' | 'hard-drive' | 'network' | 'shield' | 'zap' | 'activity' | 'globe';
  pricingUnit: string;
  estimatedCostPerHour: number;
  freeTierEligible: boolean;
  slaPercent: number;
  useCase: string;
}

export interface CloudProposal {
  id: string;
  solutionName: string;
  appType: 'E-commerce & Retail' | 'API REST / Backend' | 'Microservicios Cloud' | 'Data Lake & Analítica' | 'Portal Web Empresarial';
  description: string;
  region: string;
  estimatedUsers: number;
  availabilityLevel: '99.9% (Básico Multi-AZ)' | '99.95% (Alta Disponibilidad)' | '99.99% (Misión Crítica Multi-Región)';
  selectedServices: string[]; // List of service codeNames
  migrationGoal: 'Modernización de Aplicación' | 'Reducción de Costos' | 'Escalabilidad Elástica' | 'Continuidad de Negocio y DR';
  monthlyBudget: number;
  annualBudget: number;
  createdAt: string;
  status: 'Aprobada' | 'En Revisión' | 'Borrador' | 'Rechazada' | 'Requiere Ajustes';
}

export interface CostSimulationItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  instanceTypeOrTier: string;
  quantity: number;
  hoursPerMonth: number;
  costPerHour: number;
  monthlyCost: number;
  annualCost: number;
}

export interface AwsRegionInfo {
  code: string;
  name: string;
  location: string;
  continent?: string;
  flag: string;
  availabilityZones: number;
  activeServicesCount: number;
  status: 'Operacional' | 'Mantenimiento';
  latencyMs: number;
  isPrimary: boolean;
  coordinates: { x: number; y: number }; // Relative coordinates for visual map (percentage 0-100)
  edgeLocationsCount?: number;
  launchedYear?: number;
  complianceList?: string[];
}

export interface SecurityResponsibilityItem {
  id: string;
  domain: string;
  awsResponsibility: string;
  customerResponsibility: string;
  customerStatus: 'correct' | 'review' | 'problem'; // 🟢 verde, 🟡 amarillo, 🔴 rojo
  statusLabel: string;
  recommendation: string;
}

export interface NetworkNodeInfo {
  id: string;
  label: string;
  sublabel: string;
  type: 'internet' | 'route53' | 'cloudfront' | 'vpc' | 'subnet-public' | 'subnet-private' | 'ec2' | 'rds';
  icon: string;
  details: string;
  securityGroup: string;
  status: 'active' | 'standby';
}
