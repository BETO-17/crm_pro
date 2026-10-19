import type { Finding, SecurityCheck, Strength } from '../types/awsTypes';
import type { ProjectFile } from './projectReaders';
import { scanSecrets } from './secretScanner';
import { isDependencyOutdated, cleanSemver } from '../data/outdatedDeps';

export interface SecurityScoreResult {
  score: number;
  checks: SecurityCheck[];
  findings: Finding[];
  strengths: Strength[];
}

interface ParsedDep {
  name: string;
  version: string;
  ecosystem: 'npm' | 'pypi';
  sourceFile: string;
}

/**
 * Extrae dependencias de archivos de manifiesto (package.json, requirements.txt, etc.)
 */
function extractDependencies(files: ProjectFile[]): ParsedDep[] {
  const deps: ParsedDep[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const pathLower = file.path.toLowerCase();

    // 1. package.json
    if (pathLower.endsWith('package.json')) {
      try {
        const pkg = JSON.parse(file.content);
        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
        };
        for (const [name, rawVer] of Object.entries(allDeps)) {
          if (typeof rawVer === 'string' && !seen.has(`npm:${name.toLowerCase()}`)) {
            seen.add(`npm:${name.toLowerCase()}`);
            deps.push({
              name,
              version: cleanSemver(rawVer),
              ecosystem: 'npm',
              sourceFile: file.path,
            });
          }
        }
      } catch {
        // Ignorar si el JSON tiene errores de sintaxis
      }
    }

    // 2. requirements.txt o Pipfile
    if (pathLower.endsWith('requirements.txt') || pathLower.endsWith('pipfile')) {
      const lines = file.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = trimmed.match(/^([a-zA-Z0-9_\-\.]+)(?:[=~><]+([a-zA-Z0-9_\-\.]+))?/);
        if (match) {
          const name = match[1];
          const rawVer = match[2] || '0.0.0';
          if (!seen.has(`pypi:${name.toLowerCase()}`)) {
            seen.add(`pypi:${name.toLowerCase()}`);
            deps.push({
              name,
              version: cleanSemver(rawVer),
              ecosystem: 'pypi',
              sourceFile: file.path,
            });
          }
        }
      }
    }
  }

  return deps;
}

/**
 * Consulta por lotes (batch) a la API pública de OSV para vulnerabilidades conocidas.
 * Si falla por red, CORS o timeout, se maneja de forma resiliente.
 */
async function queryOsvVulnerabilities(
  deps: ParsedDep[]
): Promise<{ success: boolean; totalVulns: number; vulnerablePackages: string[]; error?: string }> {
  if (deps.length === 0) {
    return { success: true, totalVulns: 0, vulnerablePackages: [] };
  }

  const batch = deps.slice(0, 50).map((d) => ({
    package: {
      name: d.name,
      ecosystem: d.ecosystem === 'npm' ? 'npm' : 'PyPI',
    },
    version: d.version,
  }));

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queries: batch }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { success: false, totalVulns: 0, vulnerablePackages: [], error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    let totalVulns = 0;
    const vulnerablePackages: string[] = [];

    if (Array.isArray(data.results)) {
      data.results.forEach((r: { vulns?: unknown[] }, idx: number) => {
        if (r.vulns && Array.isArray(r.vulns) && r.vulns.length > 0) {
          totalVulns += r.vulns.length;
          vulnerablePackages.push(batch[idx].package.name);
        }
      });
    }

    return {
      success: true,
      totalVulns,
      vulnerablePackages,
    };
  } catch (err) {
    return {
      success: false,
      totalVulns: 0,
      vulnerablePackages: [],
      error: err instanceof Error ? err.message : 'Error de conexión',
    };
  }
}

/**
 * Evaluador integral del Pilar de Seguridad (100 puntos).
 */
export async function computeSecurityScore(params: {
  paths: string[];
  files: ProjectFile[];
  isDocument: boolean;
}): Promise<SecurityScoreResult> {
  const { paths, files, isDocument } = params;

  const checks: SecurityCheck[] = [];
  const findings: Finding[] = [];
  const strengths: Strength[] = [];

  // Si es fuente Documento: Todo "No verificable desde el navegador"
  if (isDocument) {
    const docCheckLabels: Array<{ id: string; label: string; maxPoints: number }> = [
      { id: 'sec-creds', label: 'Sin credenciales expuestas en código', maxPoints: 30 },
      { id: 'sec-env-files', label: 'Ausencia de archivo .env real en el proyecto', maxPoints: 15 },
      { id: 'sec-gitignore', label: '.gitignore que excluye .env, dependencias y builds', maxPoints: 10 },
      { id: 'sec-outdated-deps', label: 'Dependencias sin versiones obsoletas o vulnerables', maxPoints: 15 },
      { id: 'sec-known-vulns', label: 'Vulnerabilidades conocidas en paquetes (OSV Database)', maxPoints: 15 },
      { id: 'sec-best-practices', label: 'Señales de buenas prácticas de seguridad en código', maxPoints: 15 },
    ];

    for (const dc of docCheckLabels) {
      checks.push({
        id: dc.id,
        label: dc.label,
        points: 0,
        maxPoints: dc.maxPoints,
        passed: false,
        notVerifiable: true,
        evidence: 'No verificable desde el navegador',
        note: 'Requiere repositorio de código fuente para escaneo estático.',
      });
    }

    return {
      score: 0,
      checks,
      findings,
      strengths,
    };
  }

  // -------------------------------------------------------------
  // 1. Sin credenciales expuestas (30 pts)
  // Cada secreto crítico deja este check en 0 puntos.
  // -------------------------------------------------------------
  const detectedSecrets = scanSecrets(files);

  let credsPoints = 0;
  let credsPassed = false;
  let credsEvidence = '';

  if (detectedSecrets.length === 0) {
    credsPoints = 30;
    credsPassed = true;
    credsEvidence = '0 credenciales o secretos detectados en código';
    strengths.push({
      id: 'str-sec-no-secrets',
      dimension: 'security',
      title: 'Código limpio de credenciales y secretos',
      evidence: 'Escaneo estático sin secretos en archivos analizados',
    });
  } else {
    credsPoints = 0;
    credsPassed = false;
    credsEvidence = `${detectedSecrets.length} secreto(s) crítico(s) detectado(s)`;
    findings.push({
      id: 'find-sec-critical-secrets',
      dimension: 'security',
      severity: 'critical',
      title: 'Credenciales críticas expuestas en el código fuente',
      evidence: detectedSecrets
        .map((s) => `${s.file}:${s.lineNumber} (${s.ruleName})`)
        .slice(0, 3)
        .join(', '),
      recommendation:
        'Revoca inmediatamente las claves expuestas y migra las credenciales a AWS Secrets Manager o AWS Systems Manager Parameter Store.',
    });
  }

  checks.push({
    id: 'sec-creds',
    label: 'Sin credenciales expuestas en código fuente',
    points: credsPoints,
    maxPoints: 30,
    passed: credsPassed,
    evidence: credsEvidence,
  });

  // -------------------------------------------------------------
  // 2. Sin archivo .env real en el proyecto (15 pts)
  // -------------------------------------------------------------
  const realEnvPath = paths.find(
    (p) =>
      /(^|\/)\.env(\.(local|production|development|stage|test))?$/i.test(p) &&
      !p.includes('.example') &&
      !p.includes('.sample') &&
      !p.includes('.template')
  );

  const noRealEnv = !realEnvPath;
  const envPoints = noRealEnv ? 15 : 0;

  if (noRealEnv) {
    strengths.push({
      id: 'str-sec-no-env',
      dimension: 'security',
      title: 'Sin archivos .env con variables sensibles en el repositorio',
      evidence: 'No se encontraron archivos .env rastreados',
    });
  } else {
    findings.push({
      id: 'find-sec-env-tracked',
      dimension: 'security',
      severity: 'critical',
      title: 'Archivo de entorno (.env) incluido en el repositorio',
      evidence: realEnvPath || '.env',
      recommendation:
        'Elimina el archivo .env del control de versiones (git rm --cached .env) y utiliza .env.example para documentar variables requeridas.',
    });
  }

  checks.push({
    id: 'sec-env-files',
    label: 'Ausencia de archivos .env reales con credenciales',
    points: envPoints,
    maxPoints: 15,
    passed: noRealEnv,
    evidence: noRealEnv ? '0 archivos .env en el repositorio' : `Archivo .env detectado: ${realEnvPath}`,
  });

  // -------------------------------------------------------------
  // 3. .gitignore que excluye .env, dependencias y builds (10 pts)
  // -------------------------------------------------------------
  const gitignoreFile = files.find((f) => /(^|\/)\.gitignore$/i.test(f.path));
  let gitignorePoints = 0;
  let gitignorePassed = false;
  let gitignoreEvidence = '';

  if (gitignoreFile) {
    const gText = gitignoreFile.content.toLowerCase();
    const hasEnv = gText.includes('.env');
    const hasDeps = gText.includes('node_modules') || gText.includes('venv') || gText.includes('__pycache__');
    const hasBuilds =
      gText.includes('dist') ||
      gText.includes('build') ||
      gText.includes('.next') ||
      gText.includes('out') ||
      gText.includes('target') ||
      gText.includes('*.pyc');

    if (hasEnv && hasDeps && hasBuilds) {
      gitignorePoints = 10;
      gitignorePassed = true;
      gitignoreEvidence = `${gitignoreFile.path} (excluye .env, dependencias y carpetas de build)`;
      strengths.push({
        id: 'str-sec-gitignore',
        dimension: 'security',
        title: 'Reglas completas de exclusión en .gitignore',
        evidence: gitignoreEvidence,
      });
    } else if (hasEnv && hasDeps) {
      gitignorePoints = 6;
      gitignorePassed = true;
      gitignoreEvidence = `${gitignoreFile.path} (excluye .env y dependencias; falta build/dist)`;
    } else {
      gitignorePoints = 2;
      gitignorePassed = false;
      gitignoreEvidence = `${gitignoreFile.path} incompleto (no excluye .env o dependencias)`;
      findings.push({
        id: 'find-sec-gitignore-incomplete',
        dimension: 'security',
        severity: 'medium',
        title: '.gitignore incompleto para entornos de producción',
        evidence: gitignoreEvidence,
        recommendation:
          'Agrega reglas para ignorar .env*, carpetas de dependencias (node_modules/ o venv/) y artefactos compilados (dist/, build/).',
      });
    }
  } else {
    gitignorePoints = 0;
    gitignorePassed = false;
    gitignoreEvidence = 'Sin archivo .gitignore en el repositorio';
    findings.push({
      id: 'find-sec-no-gitignore',
      dimension: 'security',
      severity: 'medium',
      title: 'Falta archivo .gitignore en la raíz',
      evidence: 'No se encontró .gitignore',
      recommendation:
        'Crea un .gitignore para prevenir la subida accidental de secretos, dependencias pesadas y archivos compilados.',
    });
  }

  checks.push({
    id: 'sec-gitignore',
    label: '.gitignore que excluye .env, dependencias y builds',
    points: gitignorePoints,
    maxPoints: 10,
    passed: gitignorePassed,
    evidence: gitignoreEvidence,
  });

  // -------------------------------------------------------------
  // 4. Dependencias sin versiones muy antiguas (15 pts)
  // -------------------------------------------------------------
  const allDeps = extractDependencies(files);
  const outdatedList: Array<{ name: string; current: string; min: string; note: string }> = [];

  for (const dep of allDeps) {
    const check = isDependencyOutdated(dep.name, dep.version);
    if (check.isOutdated && check.rule) {
      outdatedList.push({
        name: dep.name,
        current: dep.version,
        min: check.rule.minVersion,
        note: check.rule.recommendation,
      });
    }
  }

  let outdatedPoints = 15;
  let outdatedPassed = true;
  let outdatedEvidence = '';

  if (outdatedList.length === 0) {
    outdatedPoints = 15;
    outdatedPassed = true;
    outdatedEvidence = 'Dependencias principales dentro de versiones seguras recomendadas';
    strengths.push({
      id: 'str-sec-deps-modern',
      dimension: 'security',
      title: 'Versiones de dependencias actualizadas y soportadas',
      evidence: 'Paquetes analizados cumplen con líneas base recomendadas',
    });
  } else {
    outdatedPoints = Math.max(0, 15 - outdatedList.length * 5);
    outdatedPassed = outdatedPoints >= 10;
    outdatedEvidence = `${outdatedList.length} paquete(s) con versiones obsoletas: ${outdatedList
      .map((d) => `${d.name}@${d.current} (< ${d.min})`)
      .join(', ')}`;

    findings.push({
      id: 'find-sec-outdated-deps',
      dimension: 'security',
      severity: 'medium',
      title: 'Dependencias con versiones obsoletas o sin soporte oficial',
      evidence: outdatedEvidence,
      recommendation: `Actualiza los paquetes detectados a sus versiones mínimas recomendadas: ${outdatedList
        .map((d) => `${d.name} ≥ ${d.min}`)
        .join('; ')}.`,
    });
  }

  checks.push({
    id: 'sec-outdated-deps',
    label: 'Dependencias sin versiones muy antiguas o deprecadas',
    points: outdatedPoints,
    maxPoints: 15,
    passed: outdatedPassed,
    evidence: outdatedEvidence,
  });

  // -------------------------------------------------------------
  // 5. Vulnerabilidades conocidas (OSV API) (15 pts)
  // -------------------------------------------------------------
  const osvResult = await queryOsvVulnerabilities(allDeps);

  let osvPoints = 15;
  let osvPassed = true;
  let osvNotVerifiable = false;
  let osvEvidence = '';
  let osvNote: string | undefined;

  if (!osvResult.success) {
    // Si falla por CORS, red o timeout, se marca como no verificable sin restar puntos
    osvPoints = 15;
    osvPassed = true;
    osvNotVerifiable = true;
    osvEvidence = 'No verificable desde el navegador';
    osvNote = 'Requiere análisis en servidor (OSV API no alcanzable por CORS o red)';
  } else if (osvResult.totalVulns > 0) {
    osvPoints = 0;
    osvPassed = false;
    osvEvidence = `${osvResult.totalVulns} vulnerabilidad(es) conocidas en: ${osvResult.vulnerablePackages.slice(0, 3).join(', ')}`;
    findings.push({
      id: 'find-sec-osv-vulns',
      dimension: 'security',
      severity: 'medium',
      title: 'Vulnerabilidades conocidas reportadas en base de datos OSV',
      evidence: osvEvidence,
      recommendation:
        'Ejecuta npm audit o pip-audit y actualiza los paquetes afectados para aplicar los parches de seguridad.',
    });
  } else {
    osvPoints = 15;
    osvPassed = true;
    osvEvidence = '0 vulnerabilidades conocidas reportadas en base de datos OSV';
    strengths.push({
      id: 'str-sec-osv-clean',
      dimension: 'security',
      title: 'Sin vulnerabilidades conocidas en base de datos OSV',
      evidence: 'Consulta OSV batch completada satisfactoriamente',
    });
  }

  checks.push({
    id: 'sec-known-vulns',
    label: 'Vulnerabilidades conocidas (OSV Open Source Vulnerabilities)',
    points: osvPoints,
    maxPoints: 15,
    passed: osvPassed,
    notVerifiable: osvNotVerifiable,
    evidence: osvEvidence,
    note: osvNote,
  });

  // -------------------------------------------------------------
  // 6. Señales de buenas prácticas en código (15 pts)
  // helmet, cors con origen configurado (no "*"), bcrypt/argon2, rate limiting,
  // ausencia de CORS abierto (origin: "*") y DEBUG = True en Django.
  // -------------------------------------------------------------
  let hasHelmet = false;
  let hasBcryptOrArgon = false;
  let hasRateLimit = false;
  let hasOpenCors = false;
  let hasDjangoDebugTrue = false;
  let hasSafeCors = false;

  for (const f of files) {
    const text = f.content;
    const lower = text.toLowerCase();

    if (lower.includes('helmet') || lower.includes('@fastify/helmet')) {
      hasHelmet = true;
    }

    if (
      lower.includes('bcrypt') ||
      lower.includes('argon2') ||
      lower.includes('passlib') ||
      lower.includes('crypto.pbkdf2')
    ) {
      hasBcryptOrArgon = true;
    }

    if (
      lower.includes('rate-limit') ||
      lower.includes('ratelimit') ||
      lower.includes('express-rate-limit') ||
      lower.includes('slowdown')
    ) {
      hasRateLimit = true;
    }

    // CORS abierto wildcard
    if (
      /origin\s*:\s*["']\*["']/i.test(text) ||
      /cors\(\s*{\s*origin\s*:\s*["']\*["']\s*}\s*\)/i.test(text) ||
      /cors_allow_all_origins\s*=\s*true/i.test(text) ||
      /access-control-allow-origin\s*,\s*["']\*["']/i.test(lower)
    ) {
      hasOpenCors = true;
    }

    // CORS con origen seguro
    if (
      /origin\s*:\s*(\[[^\]]+\]|process\.env|["']https?:\/\/[a-z0-9_\-\.]+["'])/i.test(text) ||
      /cors_allowed_origins\s*=/i.test(text)
    ) {
      hasSafeCors = true;
    }

    // Django settings DEBUG = True
    if (/debug\s*=\s*true/i.test(text) && (f.path.includes('settings') || f.path.endsWith('.py'))) {
      hasDjangoDebugTrue = true;
    }
  }

  let bpScore = 0;
  const bpEvidences: string[] = [];

  if (hasHelmet) {
    bpScore += 4;
    bpEvidences.push('Helmet (headers de seguridad)');
  }
  if (hasSafeCors) {
    bpScore += 4;
    bpEvidences.push('CORS con origen delimitado');
  }
  if (hasBcryptOrArgon) {
    bpScore += 4;
    bpEvidences.push('Hashing robusto (bcrypt/argon2)');
  }
  if (hasRateLimit) {
    bpScore += 3;
    bpEvidences.push('Rate Limiting anti-abuso');
  }

  // Si no tiene debilidades y el proyecto es pequeño o estático sin dependencias backend
  if (bpScore === 0 && !hasOpenCors && !hasDjangoDebugTrue) {
    bpScore = 5;
  }

  // Penalizaciones
  if (hasOpenCors) {
    bpScore = Math.max(0, bpScore - 6);
    findings.push({
      id: 'find-sec-open-cors',
      dimension: 'security',
      severity: 'medium',
      title: 'Política CORS abierta a cualquier origen (origin: "*")',
      evidence: 'CORS con comodín origin: "*" detectado',
      recommendation:
        'Restringe CORS a la lista explícita de dominios de tus aplicaciones frontend en lugar del comodín global.',
    });
  }

  if (hasDjangoDebugTrue) {
    bpScore = Math.max(0, bpScore - 8);
    findings.push({
      id: 'find-sec-django-debug',
      dimension: 'security',
      severity: 'critical',
      title: 'Directiva DEBUG = True activa en configuración de Django',
      evidence: 'DEBUG = True detectado en archivos de configuración',
      recommendation:
        'Configura DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() == "true" para evitar exponer trazas y claves secretas en producción.',
    });
  }

  if (bpEvidences.length > 0) {
    strengths.push({
      id: 'str-sec-best-practices',
      dimension: 'security',
      title: 'Buenas prácticas de seguridad implementadas',
      evidence: bpEvidences.join(', '),
    });
  }

  bpScore = Math.max(0, Math.min(15, bpScore));
  const bpPassed = bpScore >= 10;

  checks.push({
    id: 'sec-best-practices',
    label: 'Señales de buenas prácticas de seguridad en código',
    points: bpScore,
    maxPoints: 15,
    passed: bpPassed,
    evidence: bpEvidences.length > 0
      ? bpEvidences.join(', ')
      : hasOpenCors || hasDjangoDebugTrue
      ? 'Configuración con debilidades detectadas (CORS abierto o DEBUG activo)'
      : 'Sin vulnerabilidades evidentes de configuración',
  });

  // Calcular score total de seguridad
  const totalScore = Math.min(
    100,
    checks.reduce((acc, c) => acc + c.points, 0)
  );

  return {
    score: totalScore,
    checks,
    findings,
    strengths,
  };
}
