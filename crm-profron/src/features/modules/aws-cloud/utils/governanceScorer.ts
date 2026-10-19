import type { Finding, GovernanceCheck, Strength } from '../types/awsTypes';
import type { ProjectFile } from './projectReaders';

export interface GovernanceScoreResult {
  score: number;
  checks: GovernanceCheck[];
  findings: Finding[];
  strengths: Strength[];
  githubActivity?: {
    commitsLast90Days?: number;
    contributors?: number;
    lastCommitDate?: string;
    note?: string;
  };
}

/**
 * Consulta la actividad reciente en GitHub (commits en los últimos 90 días y colaboradores).
 * Señal puramente informativa, sin puntos asignados.
 */
async function fetchGithubActivity(
  url: string
): Promise<{ commitsLast90Days?: number; contributors?: number; lastCommitDate?: string; note?: string }> {
  try {
    const match = url.replace(/^https?:\/\/github\.com\//, '').split('/');
    if (match.length < 2) return {};
    const [owner, repo] = match;

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    // 1. Commits en los últimos 90 días
    const commitsPromise = fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${encodeURIComponent(since)}&per_page=100`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal: controller.signal,
      }
    );

    // 2. Colaboradores
    const contribsPromise = fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal: controller.signal,
      }
    );

    const [commitsRes, contribsRes] = await Promise.all([commitsPromise, contribsPromise]);
    clearTimeout(timer);

    let commitsCount: number | undefined;
    let contributorsCount: number | undefined;
    let lastCommitDate: string | undefined;

    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits)) {
        commitsCount = commits.length;
        if (commits.length > 0 && commits[0]?.commit?.committer?.date) {
          lastCommitDate = commits[0].commit.committer.date;
        }
      }
    }

    if (contribsRes.ok) {
      const contribs = await contribsRes.json();
      if (Array.isArray(contribs)) {
        contributorsCount = contribs.length;
      }
    }

    if (commitsCount === undefined && contributorsCount === undefined) {
      return { note: 'Límite de API de GitHub alcanzado o repositorio privado' };
    }

    return {
      commitsLast90Days: commitsCount,
      contributors: contributorsCount,
      lastCommitDate,
    };
  } catch {
    return { note: 'No se pudo consultar la actividad de GitHub (red o límite de API alcanzado)' };
  }
}

/**
 * Evaluador del Pilar de Gestión y Control (100 puntos).
 */
export async function computeGovernanceScore(params: {
  paths: string[];
  files: ProjectFile[];
  sourceKind: 'zip' | 'github' | 'document';
  githubUrl?: string;
  isDocument: boolean;
}): Promise<GovernanceScoreResult> {
  const { paths, files, sourceKind, githubUrl, isDocument } = params;

  const checks: GovernanceCheck[] = [];
  const findings: Finding[] = [];
  const strengths: Strength[] = [];

  // Si es documento: todo No verificable
  if (isDocument) {
    const govChecksList: Array<{ id: string; label: string; maxPoints: number }> = [
      { id: 'gov-vcs', label: 'Control de versiones formal (Git / GitHub)', maxPoints: 15 },
      { id: 'gov-license', label: 'Licencia formal del proyecto (LICENSE)', maxPoints: 10 },
      { id: 'gov-versioning', label: 'Versionado semántico formal en manifiesto', maxPoints: 10 },
      { id: 'gov-changelog', label: 'Historial de cambios y versiones (CHANGELOG.md)', maxPoints: 10 },
      { id: 'gov-contributing', label: 'Guía para colaboradores (CONTRIBUTING.md)', maxPoints: 5 },
      { id: 'gov-codeowners', label: 'Revisión de código (.github/CODEOWNERS o PR Template)', maxPoints: 10 },
      { id: 'gov-issues', label: 'Seguimiento de tareas (Plantillas de Issues)', maxPoints: 5 },
      { id: 'gov-hooks', label: 'Hooks antes del commit (husky, lint-staged, pre-commit)', maxPoints: 10 },
      { id: 'gov-ci', label: 'Flujo de integración continua automatizado (CI Pipeline)', maxPoints: 15 },
      { id: 'gov-ci-tests', label: 'Pruebas automatizadas ejecutadas en el pipeline CI', maxPoints: 10 },
    ];

    for (const g of govChecksList) {
      checks.push({
        id: g.id,
        label: g.label,
        points: 0,
        maxPoints: g.maxPoints,
        passed: false,
        notVerifiable: true,
        evidence: 'No verificable desde el navegador',
        note: 'Requiere repositorio de código fuente para escaneo de gobernanza.',
      });
    }

    return {
      score: 0,
      checks,
      findings,
      strengths,
    };
  }

  const normalizedPaths = paths.map((p) => p.replace(/\\/g, '/').toLowerCase());
  const hasPath = (regex: RegExp) => normalizedPaths.some((p) => regex.test(p));

  // 1. Control de versiones (15 pts)
  // Repositorio GitHub o carpeta .git en el ZIP
  const hasGit =
    sourceKind === 'github' ||
    hasPath(/(^|\/)\.git(\/|$)/) ||
    files.some((f) => f.path.startsWith('.git/'));

  const vcsPoints = hasGit ? 15 : 0;
  if (hasGit) {
    strengths.push({
      id: 'str-gov-vcs',
      dimension: 'governance',
      title: 'Control de versiones formal con Git',
      evidence: sourceKind === 'github' ? 'Repositorio GitHub verificado' : 'Estructura .git presente',
    });
  } else {
    findings.push({
      id: 'find-gov-no-git',
      dimension: 'governance',
      severity: 'medium',
      title: 'Proyecto sin historial de control de versiones Git',
      evidence: 'No se detectó metadatos de Git',
      recommendation: 'Inicializa un repositorio Git (git init) y aloja el código en un gestor centralizado (GitHub/GitLab/CodeCommit).',
    });
  }

  checks.push({
    id: 'gov-vcs',
    label: 'Control de versiones formal (Git / GitHub)',
    points: vcsPoints,
    maxPoints: 15,
    passed: hasGit,
    evidence: hasGit ? (sourceKind === 'github' ? 'Repositorio GitHub' : 'Carpeta .git detectada') : 'Sin historial Git',
  });

  // 2. Licencia (10 pts)
  const licenseFile = paths.find((p) => /(^|\/)(license|licence|copying)(\.(md|txt))?$/i.test(p));
  const hasLicense = !!licenseFile;
  const licensePoints = hasLicense ? 10 : 0;

  if (hasLicense) {
    strengths.push({
      id: 'str-gov-license',
      dimension: 'governance',
      title: 'Licencia formal definida',
      evidence: licenseFile,
    });
  } else {
    findings.push({
      id: 'find-gov-no-license',
      dimension: 'governance',
      severity: 'low',
      title: 'Falta archivo de licencia (LICENSE)',
      evidence: 'No se encontró archivo LICENSE',
      recommendation: 'Agrega un archivo LICENSE (ej. MIT, Apache 2.0 o Propietaria) para clarificar derechos y propiedad intelectual.',
    });
  }

  checks.push({
    id: 'gov-license',
    label: 'Licencia formal del proyecto (LICENSE)',
    points: licensePoints,
    maxPoints: 10,
    passed: hasLicense,
    evidence: hasLicense ? licenseFile : 'Sin archivo LICENSE',
  });

  // 3. Versionado (10 pts)
  // campo "version" en el manifiesto distinto de "0.0.0", o releases/tags en GitHub
  let hasValidVersion = false;
  let versionEvidence = '';

  const pkgFile = files.find((f) => /(^|\/)package\.json$/i.test(f.path));
  if (pkgFile) {
    try {
      const parsed = JSON.parse(pkgFile.content);
      if (typeof parsed.version === 'string' && parsed.version.trim() && parsed.version !== '0.0.0') {
        hasValidVersion = true;
        versionEvidence = `v${parsed.version} en package.json`;
      }
    } catch {
      // ignore
    }
  }

  if (!hasValidVersion) {
    const pyprojectFile = files.find((f) => /(^|\/)pyproject\.toml$/i.test(f.path));
    if (pyprojectFile && /version\s*=\s*["'][^0]/i.test(pyprojectFile.content)) {
      hasValidVersion = true;
      versionEvidence = 'Versión semántica en pyproject.toml';
    }
  }

  if (hasValidVersion) {
    strengths.push({
      id: 'str-gov-version',
      dimension: 'governance',
      title: 'Versionado semántico formal en manifiesto',
      evidence: versionEvidence,
    });
  } else {
    findings.push({
      id: 'find-gov-no-version',
      dimension: 'governance',
      severity: 'low',
      title: 'Sin versión semántica formal en manifiesto',
      evidence: 'Versión no especificada o igual a 0.0.0',
      recommendation: 'Define una versión semántica inicial (ej. "1.0.0") en package.json o pyproject.toml para trazabilidad de releases.',
    });
  }

  checks.push({
    id: 'gov-versioning',
    label: 'Versionado semántico formal en manifiesto',
    points: hasValidVersion ? 10 : 0,
    maxPoints: 10,
    passed: hasValidVersion,
    evidence: hasValidVersion ? versionEvidence : 'Sin versión o 0.0.0',
  });

  // 4. Historial de cambios: CHANGELOG.md (10 pts)
  const changelogFile = paths.find((p) => /(^|\/)(changelog|history|releases)(\.(md|txt))?$/i.test(p));
  const hasChangelog = !!changelogFile;
  const changelogPoints = hasChangelog ? 10 : 0;

  if (hasChangelog) {
    strengths.push({
      id: 'str-gov-changelog',
      dimension: 'governance',
      title: 'Registro de cambios formal (CHANGELOG)',
      evidence: changelogFile,
    });
  } else {
    findings.push({
      id: 'find-gov-no-changelog',
      dimension: 'governance',
      severity: 'low',
      title: 'Falta archivo CHANGELOG.md para trazabilidad',
      evidence: 'No se encontró CHANGELOG.md',
      recommendation: 'Crea un archivo CHANGELOG.md para documentar mejoras, correcciones y cambios disruptivos entre versiones.',
    });
  }

  checks.push({
    id: 'gov-changelog',
    label: 'Historial de cambios y versiones (CHANGELOG.md)',
    points: changelogPoints,
    maxPoints: 10,
    passed: hasChangelog,
    evidence: hasChangelog ? changelogFile : 'Sin archivo CHANGELOG.md',
  });

  // 5. Guía de contribución: CONTRIBUTING.md (5 pts)
  const contributingFile = paths.find((p) => /(^|\/)contributing(\.(md|txt))?$/i.test(p));
  const hasContributing = !!contributingFile;
  checks.push({
    id: 'gov-contributing',
    label: 'Guía para colaboradores (CONTRIBUTING.md)',
    points: hasContributing ? 5 : 0,
    maxPoints: 5,
    passed: hasContributing,
    evidence: hasContributing ? contributingFile : 'Sin CONTRIBUTING.md',
  });

  // 6. Revisión de código: .github/CODEOWNERS o plantilla de pull request (10 pts)
  const codeownersFile = paths.find((p) => /(^|\/)(\.github\/)?(codeowners|pull_request_template(\.md)?)$/i.test(p));
  const hasCodeReview = !!codeownersFile;
  checks.push({
    id: 'gov-codeowners',
    label: 'Revisión de código (.github/CODEOWNERS o PR template)',
    points: hasCodeReview ? 10 : 0,
    maxPoints: 10,
    passed: hasCodeReview,
    evidence: hasCodeReview ? codeownersFile : 'Sin CODEOWNERS ni PR template',
  });

  // 7. Seguimiento de tareas: plantillas de issues en .github/ISSUE_TEMPLATE (5 pts)
  const issueTemplate = paths.find((p) => /(^|\/)\.github\/(issue_template(\.md)?|issue_template\/)/i.test(p));
  const hasIssueTemplates = !!issueTemplate;
  checks.push({
    id: 'gov-issues',
    label: 'Seguimiento de tareas (Plantillas de Issues)',
    points: hasIssueTemplates ? 5 : 0,
    maxPoints: 5,
    passed: hasIssueTemplates,
    evidence: hasIssueTemplates ? issueTemplate : 'Sin plantillas de Issues',
  });

  // 8. Hooks antes del commit: husky, lint-staged o .pre-commit-config.yaml (10 pts)
  const hasHooks =
    hasPath(/(^|\/)(\.husky|\.pre-commit-config\.ya?ml)/) ||
    files.some((f) => f.content.includes('"husky"') || f.content.includes('"lint-staged"'));
  const hookFile = paths.find((p) => /(^|\/)(\.husky|\.pre-commit-config\.ya?ml)/i.test(p));

  if (hasHooks) {
    strengths.push({
      id: 'str-gov-hooks',
      dimension: 'governance',
      title: 'Hooks de pre-commit para calidad antes del commit',
      evidence: hookFile || 'Configuración de husky / lint-staged detectada',
    });
  } else {
    findings.push({
      id: 'find-gov-no-hooks',
      dimension: 'governance',
      severity: 'low',
      title: 'Sin hooks automatizados de pre-commit',
      evidence: 'No se detectó husky ni pre-commit',
      recommendation: 'Configura husky o lint-staged para formatear y verificar código antes de cada commit.',
    });
  }

  checks.push({
    id: 'gov-hooks',
    label: 'Hooks antes del commit (husky, lint-staged, pre-commit)',
    points: hasHooks ? 10 : 0,
    maxPoints: 10,
    passed: hasHooks,
    evidence: hasHooks ? (hookFile || 'husky / lint-staged en package.json') : 'Sin hooks de pre-commit',
  });

  // 9. Integración continua (15 pts)
  const ciWorkflowFiles = files.filter((f) =>
    /(^|\/)\.github\/workflows\/.*\.ya?ml$/i.test(f.path) ||
    /(^|\/)(\.gitlab-ci\.yml|jenkinsfile|\.circleci\/config\.yml|azure-pipelines\.yml)/i.test(f.path)
  );
  const hasCi = ciWorkflowFiles.length > 0;
  const ciPoints = hasCi ? 15 : 0;

  if (hasCi) {
    strengths.push({
      id: 'str-gov-ci',
      dimension: 'governance',
      title: 'Pipelines automatizados de Integración Continua (CI)',
      evidence: ciWorkflowFiles.map((f) => f.path).slice(0, 2).join(', '),
    });
  } else {
    findings.push({
      id: 'find-gov-no-ci',
      dimension: 'governance',
      severity: 'medium',
      title: 'Sin pipeline de Integración Continua (CI/CD) automatizado',
      evidence: 'No se encontraron workflows de GitHub Actions o GitLab CI',
      recommendation: 'Implementa un workflow de GitHub Actions en .github/workflows/ci.yml para compilar y validar cambios automáticamente.',
    });
  }

  checks.push({
    id: 'gov-ci',
    label: 'Flujo de integración continua automatizado (CI Pipeline)',
    points: ciPoints,
    maxPoints: 15,
    passed: hasCi,
    evidence: hasCi ? ciWorkflowFiles.map((f) => f.path).slice(0, 2).join(', ') : 'Sin pipelines CI',
  });

  // 10. Pruebas automatizadas en ese pipeline (10 pts): el workflow ejecuta "test"
  let hasCiTests = false;
  let ciTestEvidence = '';

  for (const cw of ciWorkflowFiles) {
    const content = cw.content.toLowerCase();
    if (
      content.includes('npm test') ||
      content.includes('npm run test') ||
      content.includes('yarn test') ||
      content.includes('pnpm test') ||
      content.includes('pytest') ||
      content.includes('go test') ||
      content.includes('cargo test') ||
      content.includes('mvn test') ||
      /run:\s*.*test/i.test(cw.content)
    ) {
      hasCiTests = true;
      ciTestEvidence = `${cw.path} ejecuta suite de tests`;
      break;
    }
  }

  const ciTestPoints = hasCiTests ? 10 : 0;
  if (hasCiTests) {
    strengths.push({
      id: 'str-gov-ci-tests',
      dimension: 'governance',
      title: 'Pruebas automatizadas obligatorias en pipeline CI',
      evidence: ciTestEvidence,
    });
  } else if (hasCi) {
    findings.push({
      id: 'find-gov-no-ci-tests',
      dimension: 'governance',
      severity: 'medium',
      title: 'El pipeline de CI no ejecuta pruebas automatizadas',
      evidence: ciWorkflowFiles[0]?.path || 'Workflow de CI',
      recommendation: 'Agrega un paso de ejecución de pruebas ("npm test" o "pytest") en el pipeline de CI para bloquear merges defectuosos.',
    });
  }

  checks.push({
    id: 'gov-ci-tests',
    label: 'Pruebas automatizadas en pipeline CI ("npm test" / "pytest")',
    points: ciTestPoints,
    maxPoints: 10,
    passed: hasCiTests,
    evidence: hasCiTests ? ciTestEvidence : hasCi ? 'Pipeline CI no ejecuta comando test' : 'Sin pipeline CI',
  });

  // Solo GitHub: actividad reciente informativa (sin puntos)
  let githubActivity: GovernanceScoreResult['githubActivity'] | undefined;
  if (sourceKind === 'github' && githubUrl) {
    githubActivity = await fetchGithubActivity(githubUrl);
  }

  const totalScore = Math.min(
    100,
    checks.reduce((acc, c) => acc + c.points, 0)
  );

  return {
    score: totalScore,
    checks,
    findings,
    strengths,
    githubActivity,
  };
}
