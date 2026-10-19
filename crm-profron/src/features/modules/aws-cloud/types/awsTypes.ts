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

export type PricingUnit =
  | 'hour'
  | 'gb-month'
  | 'gb-transfer'
  | 'million-requests'
  | 'hosted-zone-month'
  | 'metric-month'
  | 'free';

export interface ServicePricing {
  unit: PricingUnit;
  price: number;
  unitLabel: string;
  note?: string;
}

export interface AwsService {
  id: string;
  name: string;
  shortName: string;
  codeName: string;
  category: ServiceCategory;
  description: string;
  mainFunction: string;
  pricing: ServicePricing;
  status?: 'Activo' | 'Planificado' | 'Disponible' | 'En Mantenimiento';
  iconType?: 'server' | 'database' | 'hard-drive' | 'network' | 'shield' | 'zap' | 'activity' | 'globe';
  pricingUnit?: string;
  estimatedCostPerHour?: number;
  freeTierEligible?: boolean;
  slaPercent?: number;
  useCase?: string;
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
  services?: string[]; // Alias compatible para selectedServices
  analysisId?: string; // ID del análisis de proyecto origen si fue importado
}

export type AwsProposal = CloudProposal;
export type AwsServiceItem = AwsService;

export interface CostSimulationItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  instanceTypeOrTier: string;
  quantity: number;
  hoursPerMonth: number;
  unit?: PricingUnit;
  unitPrice?: number;
  formulaText?: string;
  costPerHour?: number;
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
  coordinates: { x: number; y: number; lat: number; lng: number }; // Relative percentage (x,y) and Geographic coordinates (lat,lng)
  edgeLocationsCount?: number;
  launchedYear?: number;
  complianceList?: string[];
}

export interface SecurityResponsibilityItem {
  id: string;
  domain: string;
  awsResponsibility: string;
  customerResponsibility: string;
  customerStatus: 'correct' | 'review' | 'problem'; // verde, amarillo, rojo
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

export type { RegionOperationalStatus, RegionStatusDetails } from '../data/awsRegionsData';

// ==========================================
// Tipos para el Analizador de Migración a AWS
// ==========================================

export type AnalyzerInput =
  | { kind: 'zip'; file: File }
  | { kind: 'github'; url: string }
  | { kind: 'document'; file: File | { name: string; text: string } };

export interface DetectedTech {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'storage' | 'container' | 'other';
  evidence: {
    file: string;
    match: string;
  };
}

export interface ServiceRecommendation {
  serviceId: string;
  reason: string;
  triggeredBy: string[];
}

export interface UnsupportedTech {
  name: string;
  suggestedAwsService: string;
  note: string;
}

export type ReadinessDimensionId =
  | 'docs'
  | 'structure'
  | 'dependencies'
  | 'tests'
  | 'codeQuality'
  | 'containers'
  | 'security'
  | 'cicd'
  | 'governance';

export interface ReadinessCheck {
  id: string;
  label: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  evidence?: string;
}

export interface ReadinessDimension {
  id: ReadinessDimensionId;
  label: string;
  score: number;
  maxScore: number;
  checks: ReadinessCheck[];
}

export type Severity = 'critical' | 'medium' | 'low';

export interface Finding {
  id: string;
  dimension: ReadinessDimensionId;
  severity: Severity;
  title: string;
  evidence: string;
  recommendation: string;
}

export interface Strength {
  id: string;
  dimension: ReadinessDimensionId;
  title: string;
  evidence: string;
}

export type ReadinessStatus = 'ready' | 'ready-with-notes' | 'needs-preparation';

export type Confidence = 'high' | 'low';

export interface MigrationStrategy {
  id: 'rehost' | 'replatform' | 'refactor';
  label: string;
  description: string;
}

export interface PreMigrationTask {
  title: string;
  fromFindingId: string;
  severity: Severity;
}

export type MaturityLevel = 'prototype' | 'mvp' | 'active' | 'production';

export interface MaturitySignal {
  label: string;
  value: string | number;
  evidence?: string;
}

export interface ProjectMaturity {
  level: MaturityLevel;
  label: string;
  signals: MaturitySignal[];
}

export interface ProjectMetrics {
  totalFiles: number;
  codeFiles: number;
  linesOfCode: number;
  modules: number;
  routesOrEndpoints: number;
  dbMigrations: number;
  todoCount: number;
  lastCommitDate?: string;
  commitsLast90Days?: number;
  contributors?: number;
  releases?: number;
  openIssues?: number;
}

export interface SecurityCheck {
  id: string;
  label: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  notVerifiable?: boolean;
  evidence?: string;
  note?: string;
}

export interface GovernanceCheck {
  id: string;
  label: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  notVerifiable?: boolean;
  evidence?: string;
  note?: string;
}

export interface ProjectAnalysis {
  id: string;
  createdAt: string;
  projectName: string;
  source: 'zip' | 'github' | 'document';
  sourceLabel: string;
  filesAnalyzed: number;
  totalFiles: number;
  confidence: Confidence;
  isEstimated: boolean;
  partialSecretScan: boolean;
  score: number; // overallScore (0–100)
  overallScore: number; // Promedio ponderado: Cloud 35%, Seguridad 35%, Gestión 30%
  readinessScore: number; // Índice de preparación Cloud (0-100)
  securityScore: number; // Índice de Seguridad (0-100)
  governanceScore: number; // Índice de Gestión y Control (0-100)
  maturity: ProjectMaturity;
  metrics: ProjectMetrics;
  securityChecks?: SecurityCheck[];
  governanceChecks?: GovernanceCheck[];
  status: ReadinessStatus;
  dimensions: ReadinessDimension[];
  strengths: Strength[];
  findings: Finding[];
  stack: DetectedTech[];
  detected: DetectedTech[]; // compatibility alias
  recommendations: ServiceRecommendation[];
  unsupported: UnsupportedTech[];
  preMigrationTasks: PreMigrationTask[];
  strategy: MigrationStrategy;
  suggestedAppType: string;
  suggestedDescription: string;
  warnings: string[];
}

export type AnalysisResult = ProjectAnalysis;

