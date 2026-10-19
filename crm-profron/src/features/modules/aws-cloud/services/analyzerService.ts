import type { AnalyzerInput, Finding, PreMigrationTask, ProjectAnalysis, ReadinessStatus, Severity, Strength } from '../types/awsTypes';
import { readProjectInput } from '../utils/projectReaders';
import { detectStackFromFiles } from '../utils/stackDetector';
import { computeReadinessScore } from '../utils/readinessScorer';
import { computeSecurityScore } from '../utils/securityScorer';
import { computeGovernanceScore } from '../utils/governanceScorer';
import { estimateProjectMaturity } from '../utils/maturityEstimator';

/**
 * Contrato unificado del servicio de análisis de proyectos.
 * La interfaz de usuario interactúa con este contrato.
 */
export interface AnalyzerService {
  analyze(input: AnalyzerInput): Promise<ProjectAnalysis>;
}

/**
 * Implementación local en el navegador (Zero-Server / Client-Side).
 * Lee los archivos usando JSZip o APIs públicas y ejecuta las reglas en local.
 */
export const localAnalyzer: AnalyzerService = {
  async analyze(input: AnalyzerInput): Promise<ProjectAnalysis> {
    const readResult = await readProjectInput(input);
    const { paths, files, projectName, totalFiles, partialSecretScan, isEstimated, confidence } =
      readResult;

    let sourceLabel = '';
    if (input.kind === 'zip') {
      sourceLabel = `Paquete ZIP (${input.file.name})`;
    } else if (input.kind === 'github') {
      sourceLabel = `GitHub (${input.url.replace(/^https?:\/\/github\.com\//, '')})`;
    } else {
      const docName = 'name' in input.file ? input.file.name : 'Documento';
      sourceLabel = `Documento (${docName})`;
    }

    // 1. Detectar stack tecnológico y recomendaciones de servicios
    const stackResult = detectStackFromFiles(files, sourceLabel, input.kind);
    const detected = stackResult.detected;

    const hasBackendOrDb = detected.some(
      (d) => d.category === 'backend' || d.category === 'database'
    );

    // 2. Evaluar Preparación Cloud
    const docText = input.kind === 'document' ? files[0]?.content || '' : undefined;
    const readiness = computeReadinessScore({
      paths,
      files,
      isDocument: input.kind === 'document',
      docText,
      hasBackendOrDb,
    });

    // 3. Evaluar Seguridad (100 pts)
    const securityResult = await computeSecurityScore({
      paths,
      files,
      isDocument: input.kind === 'document',
    });

    // 4. Evaluar Gestión y Control (100 pts)
    const governanceResult = await computeGovernanceScore({
      paths,
      files,
      sourceKind: input.kind,
      githubUrl: input.kind === 'github' ? input.url : undefined,
      isDocument: input.kind === 'document',
    });

    // 5. Consolidar Hallazgos (Findings) sin duplicados y ordenados por severidad
    const combinedFindings: Finding[] = [];
    const seenFindingKeys = new Set<string>();

    for (const f of [...securityResult.findings, ...governanceResult.findings, ...readiness.findings]) {
      const key = f.id || `${f.dimension}:${f.title}`;
      if (!seenFindingKeys.has(key)) {
        seenFindingKeys.add(key);
        combinedFindings.push(f);
      }
    }

    const severityRank: Record<Severity, number> = { critical: 1, medium: 2, low: 3 };
    combinedFindings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

    // 6. Consolidar Fortalezas (Strengths) sin duplicados
    const combinedStrengths: Strength[] = [];
    const seenStrengthKeys = new Set<string>();

    for (const s of [...securityResult.strengths, ...governanceResult.strengths, ...readiness.strengths]) {
      const key = s.id || `${s.dimension}:${s.title}`;
      if (!seenStrengthKeys.has(key)) {
        seenStrengthKeys.add(key);
        combinedStrengths.push(s);
      }
    }

    // 7. Extraer versión del proyecto desde manifiesto
    let detectedVersion = '0.0.0';
    const pkgFile = files.find((f) => /(^|\/)package\.json$/i.test(f.path));
    if (pkgFile) {
      try {
        const parsed = JSON.parse(pkgFile.content);
        if (typeof parsed.version === 'string' && parsed.version.trim()) {
          detectedVersion = parsed.version.trim();
        }
      } catch {
        // ignore
      }
    } else {
      const pyprojectFile = files.find((f) => /(^|\/)pyproject\.toml$/i.test(f.path));
      if (pyprojectFile) {
        const vMatch = pyprojectFile.content.match(/version\s*=\s*["']([^"']+)["']/i);
        if (vMatch && vMatch[1]) {
          detectedVersion = vMatch[1].trim();
        }
      }
    }

    // 8. Evaluar Madurez y Métricas
    const maturityResult = estimateProjectMaturity({
      paths,
      files,
      findings: combinedFindings,
      hasDatabase: detected.some((d) => d.category === 'database'),
      version: detectedVersion,
      githubMetrics: governanceResult.githubActivity,
    });

    // 9. Cálculo de Puntaje General Ponderado
    // overallScore = promedio ponderado: Preparación Cloud 35%, Seguridad 35%, Gestión y control 30%
    const readinessScore = readiness.score;
    const securityScore = securityResult.score;
    const governanceScore = governanceResult.score;

    const overallScore = Math.round(
      readinessScore * 0.35 +
      securityScore * 0.35 +
      governanceScore * 0.30
    );

    const overallStatus: ReadinessStatus =
      overallScore >= 70 ? 'ready' : overallScore >= 50 ? 'ready-with-notes' : 'needs-preparation';

    // 10. Tareas previas a la migración
    const preMigrationTasks: PreMigrationTask[] = combinedFindings
      .filter((f) => f.severity === 'critical' || f.severity === 'medium')
      .map((f) => ({
        title: f.recommendation,
        fromFindingId: f.id,
        severity: f.severity,
      }));

    return {
      id: `analysis-${Date.now()}`,
      createdAt: new Date().toISOString(),
      projectName,
      source: input.kind,
      sourceLabel,
      filesAnalyzed: files.length,
      totalFiles: totalFiles || files.length,
      confidence: isEstimated ? 'low' : confidence,
      isEstimated,
      partialSecretScan,
      score: overallScore, // la dona muestra overallScore
      overallScore,
      readinessScore,
      securityScore,
      governanceScore,
      maturity: maturityResult.maturity,
      metrics: maturityResult.metrics,
      securityChecks: securityResult.checks,
      governanceChecks: governanceResult.checks,
      status: overallStatus,
      dimensions: readiness.dimensions,
      strengths: combinedStrengths,
      findings: combinedFindings,
      stack: detected,
      detected, // compatibilidad con componentes que leían .detected
      recommendations: stackResult.recommendations,
      unsupported: stackResult.unsupported,
      preMigrationTasks,
      strategy: readiness.strategy,
      suggestedAppType: stackResult.suggestedAppType,
      suggestedDescription: stackResult.suggestedDescription,
      warnings: stackResult.warnings,
    };
  },
};

/**
 * Instancia activa del servicio.
 */
export const analyzerService: AnalyzerService = localAnalyzer;

