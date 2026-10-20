import type {
  AnalyzerInput,
  AnalysisResult,
  EnterpriseEvaluationResponse,
  EvaluationOptions,
  ServiceRecommendation,
  DetectedTech,
} from '../types/awsTypes';
import { readProjectInput } from '../utils/projectReaders';
import { detectStackFromFiles } from '../utils/stackDetector';
import { awsServicesCatalog } from '../data/awsServicesData';

const CANDIDATE_PORTS = ['8080', '8000'];
let cachedBaseUrl = 'http://localhost:8080/api/v1';

export async function getBackendBaseUrl(): Promise<string> {
  for (const port of CANDIDATE_PORTS) {
    try {
      const url = `http://localhost:${port}/api/v1`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${url}/migration-evaluator/status`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        cachedBaseUrl = url;
        return url;
      }
    } catch {
      continue;
    }
  }
  return cachedBaseUrl;
}

export interface AnalyzerService {
  analyze(input: AnalyzerInput, options?: EvaluationOptions): Promise<AnalysisResult>;
}

/**
 * Comprueba el estado del microservicio de evaluación y el motor de IA en el backend (detectando puertos 8080 y 8000).
 */
export async function checkBackendHealth(): Promise<{
  online: boolean;
  service?: string;
  aiEngine?: string;
  geminiActive?: boolean;
  port?: string;
}> {
  for (const port of CANDIDATE_PORTS) {
    try {
      const url = `http://localhost:${port}/api/v1`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${url}/migration-evaluator/status`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        cachedBaseUrl = url;
        return {
          online: true,
          service: data.service,
          aiEngine: data.ai_engine,
          geminiActive: data.gemini_active,
          port,
        };
      }
    } catch {
      continue;
    }
  }
  return { online: false };
}

/**
 * Implementación local en el navegador (Zero-Server / Offline).
 * Utiliza JSZip para descomprimir e inspeccionar heurísticamente.
 */
export const localAnalyzer: AnalyzerService = {
  async analyze(input: AnalyzerInput): Promise<AnalysisResult> {
    const files = await readProjectInput(input);

    let sourceLabel = '';
    if (input.kind === 'zip') {
      sourceLabel = `Paquete ZIP (${input.file.name})`;
    } else if (input.kind === 'github') {
      sourceLabel = `GitHub (${input.url.replace(/^https?:\/\/github\.com\//, '')})`;
    } else {
      const docName = 'name' in input.file ? input.file.name : 'Documento';
      sourceLabel = `Documento (${docName})`;
    }

    return detectStackFromFiles(files, sourceLabel);
  },
};

/**
 * Implementación Remota conectada a FastAPI + Gemini + REA Agent.
 */
export const remoteAnalyzer: AnalyzerService = {
  async analyze(input: AnalyzerInput, options?: EvaluationOptions): Promise<AnalysisResult> {
    const baseUrl = await getBackendBaseUrl();
    const trafficTier = options?.traffic_tier || 'medium';
    const targetRegion = options?.target_region || 'us-east-1';
    const customNotes = options?.custom_notes || '';

    // Si es documento de texto libre sin backend específico para texto, procesar con analizador local
    if (input.kind === 'document') {
      return localAnalyzer.analyze(input, options);
    }

    let rawEval: EnterpriseEvaluationResponse;

    if (input.kind === 'zip') {
      const formData = new FormData();
      formData.append('file', input.file);
      formData.append('traffic_tier', trafficTier);
      formData.append('target_region', targetRegion);
      if (customNotes) formData.append('custom_notes', customNotes);

      const res = await fetch(`${baseUrl}/migration-evaluator/evaluate-zip`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error al procesar archivo en el servidor (${res.status})`);
      }

      rawEval = await res.json();
    } else {
      // Repositorio GitHub
      const payload = {
        repo_url: input.url,
        github_token: options?.github_token || undefined,
        traffic_tier: trafficTier,
        target_region: targetRegion,
        custom_notes: customNotes || undefined,
      };

      const res = await fetch(`${baseUrl}/migration-evaluator/evaluate-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error al clonar y auditar repositorio GitHub (${res.status})`);
      }

      rawEval = await res.json();
    }

    // Mapear respuesta del evaluador enterprise al contrato AnalysisResult
    const sourceLabel =
      input.kind === 'zip'
        ? `Paquete ZIP (${input.file.name})`
        : `GitHub (${input.url.replace(/^https?:\/\/github\.com\//, '')})`;

    // Extraer servicios sugeridos a partir del escenario Recommended-Production (o el primer escenario)
    const primaryScenario =
      rawEval.scenarios?.find((s) => s.scenario_type === 'Recommended-Production') ||
      rawEval.scenarios?.[0];

    const recommendations: ServiceRecommendation[] = [];
    const detected: DetectedTech[] = [];

    // Mapear evidencias técnicas detectadas
    if (rawEval.technical_evidence) {
      const ev = rawEval.technical_evidence;
      (ev.languages || []).forEach((lang, idx) => {
        detected.push({
          id: `lang-${idx}`,
          name: lang,
          category: 'backend',
          evidence: { file: 'Código fuente', match: `Lenguaje: ${lang}` },
        });
      });
      (ev.frameworks || []).forEach((fw, idx) => {
        detected.push({
          id: `fw-${idx}`,
          name: fw,
          category: 'other',
          evidence: { file: 'Dependencias', match: `Framework: ${fw}` },
        });
      });
      (ev.databases || []).forEach((db, idx) => {
        detected.push({
          id: `db-${idx}`,
          name: db,
          category: 'database',
          evidence: { file: 'Persistencia', match: `Base de datos: ${db}` },
        });
      });
      if (ev.has_docker) {
        detected.push({
          id: 'docker-1',
          name: 'Docker / Contenedores',
          category: 'container',
          evidence: { file: 'Dockerfile', match: 'Contenedorización lista' },
        });
      }
    }

    // Agregar indicador de plataforma origen detectada
    if (rawEval.origin_detected) {
      detected.unshift({
        id: 'origin-0',
        name: rawEval.origin_detected,
        category: 'other',
        evidence: {
          file: rawEval.detected_configs?.join(', ') || 'Configuraciones',
          match: `Origen: ${rawEval.origin_detected}`,
        },
      });
    }

    // Mapear servicios del escenario principal
    if (primaryScenario?.services) {
      for (const svc of primaryScenario.services) {
        const code = svc.service_code || svc.service_name;
        const matched = awsServicesCatalog.find(
          (cat) =>
            cat.codeName.toLowerCase() === code.toLowerCase() ||
            cat.shortName.toLowerCase() === code.toLowerCase() ||
            cat.name.toLowerCase().includes(svc.service_name.toLowerCase()) ||
            svc.service_name.toLowerCase().includes(cat.shortName.toLowerCase())
        );

        recommendations.push({
          serviceId: matched?.id || `srv-${svc.service_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          reason: `${svc.role} (${svc.specs}). ${svc.reason}`,
          triggeredBy: [rawEval.architecture_pattern || 'Arquitectura detectada'],
        });
      }
    }

    // Determinar appType sugerido
    let suggestedAppType = 'Portal Web Empresarial';
    const patternLower = (rawEval.architecture_pattern || '').toLowerCase();
    if (patternLower.includes('microservicio') || patternLower.includes('api')) {
      suggestedAppType = 'Microservicios Cloud';
    } else if (patternLower.includes('jamstack') || patternLower.includes('serverless')) {
      suggestedAppType = 'API REST / Backend';
    } else if (patternLower.includes('e-commerce') || patternLower.includes('retail')) {
      suggestedAppType = 'E-commerce & Retail';
    }

    return {
      source: sourceLabel,
      filesAnalyzed: rawEval.technical_evidence?.total_files || 1,
      detected,
      recommendations,
      unsupported: [],
      suggestedAppType,
      suggestedDescription: `${rawEval.system_analysis}\n\nEstrategia de Migración: ${rawEval.migration_strategy}`,
      warnings: rawEval.well_architected_notes || [],
      enterpriseEvaluation: rawEval,
    };
  },
};

/**
 * Servicio unificado: Se comunica prioritariamente con el Backend de FastAPI (puertos 8080/8000).
 * Si el backend está activo, ejecuta la auditoría con IA + REA en el servidor.
 */
export const analyzerService: AnalyzerService = {
  async analyze(input: AnalyzerInput, options?: EvaluationOptions): Promise<AnalysisResult> {
    const health = await checkBackendHealth();

    if (health.online) {
      // El backend está disponible: usar SIEMPRE el evaluador real del backend
      return await remoteAnalyzer.analyze(input, options);
    }

    // Si el backend estuviese apagado, advertir y usar el detector local
    console.warn('Backend de evaluación no detectado en puertos 8080/8000, usando análisis local.');
    const localResult = await localAnalyzer.analyze(input);
    localResult.warnings.push('Aviso: El backend (puerto 8080) no respondió. Se ejecutó una inspección básica local.');
    return localResult;
  },
};
