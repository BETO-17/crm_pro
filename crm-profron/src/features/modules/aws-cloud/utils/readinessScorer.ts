import type {
  Confidence,
  Finding,
  MigrationStrategy,
  PreMigrationTask,
  ReadinessCheck,
  ReadinessDimension,
  ReadinessDimensionId,
  ReadinessStatus,
  Severity,
  Strength,
} from '../types/awsTypes';
import type { ProjectFile } from './projectReaders';
import { scanSecrets, convertSecretsToFindings } from './secretScanner';

export interface ReadinessScoreResult {
  score: number;
  status: ReadinessStatus;
  dimensions: ReadinessDimension[];
  strengths: Strength[];
  findings: Finding[];
  preMigrationTasks: PreMigrationTask[];
  strategy: MigrationStrategy;
  confidence: Confidence;
  isEstimated: boolean;
}

export function computeReadinessScore(params: {
  paths: string[];
  files: ProjectFile[];
  isDocument: boolean;
  docText?: string;
  hasBackendOrDb?: boolean;
}): ReadinessScoreResult {
  const { paths, files, isDocument, docText = '', hasBackendOrDb = true } = params;

  const normalizedPaths = paths.map((p) => p.replace(/\\/g, '/').toLowerCase());
  const hasPath = (regex: RegExp) => normalizedPaths.some((p) => regex.test(p));

  const textToSearch = isDocument
    ? docText.toLowerCase()
    : files.map((f) => f.content.slice(0, 5000)).join('\n').toLowerCase();

  // -------------------------------------------------------------
  // 1. Documentación (10 pts)
  // -------------------------------------------------------------
  const docsChecks: ReadinessCheck[] = [];

  // Check 1: README en la raíz (4)
  const readmePath = paths.find((p) => /^(readme(\.(md|txt|rst))?)$/i.test(p) || p.toLowerCase() === 'readme.md');
  const hasReadme = isDocument
    ? textToSearch.includes('readme')
    : !!readmePath;
  docsChecks.push({
    id: 'check-docs-readme',
    label: 'README en la raíz del proyecto',
    points: hasReadme ? 4 : 0,
    maxPoints: 4,
    passed: hasReadme,
    evidence: hasReadme ? (readmePath || 'README detectado') : undefined,
  });

  // Check 2: README con sección de instalación o ejecución (3)
  const readmeFile = files.find((f) => /(^|\/)readme(\.(md|txt|rst))?$/i.test(f.path));
  const readmeContent = readmeFile ? readmeFile.content.toLowerCase() : textToSearch;
  const hasInstallGuide =
    readmeContent.includes('instal') ||
    readmeContent.includes('npm install') ||
    readmeContent.includes('pip install') ||
    readmeContent.includes('docker') ||
    readmeContent.includes('run') ||
    readmeContent.includes('ejecut');
  docsChecks.push({
    id: 'check-docs-install-guide',
    label: 'Sección de instalación o ejecución en el README',
    points: hasInstallGuide ? 3 : 0,
    maxPoints: 3,
    passed: hasInstallGuide,
    evidence: hasInstallGuide ? 'Instrucciones de instalación/ejecución detectadas' : undefined,
  });

  // Check 3: .env.example, .env.sample o .env.template (3)
  const envExamplePath = paths.find((p) =>
    /(^|\/)(\.env\.(example|sample|template)|env\.example)$/i.test(p)
  );
  const hasEnvExample = isDocument
    ? textToSearch.includes('.env.example') || textToSearch.includes('.env.sample')
    : !!envExamplePath;
  docsChecks.push({
    id: 'check-docs-env-example',
    label: 'Plantilla de configuración (.env.example o similar)',
    points: hasEnvExample ? 3 : 0,
    maxPoints: 3,
    passed: hasEnvExample,
    evidence: hasEnvExample ? (envExamplePath || '.env.example detectado') : undefined,
  });

  // -------------------------------------------------------------
  // 2. Estructura (15 pts)
  // -------------------------------------------------------------
  const structChecks: ReadinessCheck[] = [];

  // Check 1: Código en carpetas (src/, app/, backend/, frontend/, packages/, server/, client/) y no suelto en la raíz (5)
  const structuredFolderMatch = paths.find((p) =>
    /^(src|app|backend|frontend|packages|server|client)\//i.test(p)
  );
  const hasStructuredFolders = isDocument
    ? textToSearch.includes('src/') || textToSearch.includes('backend/') || textToSearch.includes('frontend/')
    : !!structuredFolderMatch;
  const detectedFolder = structuredFolderMatch ? structuredFolderMatch.split('/')[0] + '/' : 'src/';
  structChecks.push({
    id: 'check-structure-folders',
    label: 'Código fuente en carpetas estructuradas (src/, backend/, etc.)',
    points: hasStructuredFolders ? 5 : 0,
    maxPoints: 5,
    passed: hasStructuredFolders,
    evidence: hasStructuredFolders ? `Código organizado en ${detectedFolder}` : undefined,
  });

  // Check 2: Separación clara: frontend y backend en carpetas distintas, monorepo con packages/, o app en src/ (5)
  const hasFrontDir = hasPath(/^(frontend|client)\//);
  const hasBackDir = hasPath(/^(backend|server|api)\//);
  const hasPackagesDir = hasPath(/^packages\//);
  const hasCleanSrc = hasPath(/^src\//) && !paths.some((p) => !p.includes('/') && /\.(js|ts|py|go|php|rb|java|cs)$/i.test(p) && !p.startsWith('config') && !p.startsWith('vite') && !p.startsWith('webpack'));
  const hasClearSeparation = isDocument
    ? (textToSearch.includes('frontend') && textToSearch.includes('backend')) || textToSearch.includes('monorepo') || textToSearch.includes('src/')
    : (hasFrontDir && hasBackDir) || hasPackagesDir || hasCleanSrc;
  structChecks.push({
    id: 'check-structure-separation',
    label: 'Separación clara de responsabilidades (frontend, backend o monorepo)',
    points: hasClearSeparation ? 5 : 0,
    maxPoints: 5,
    passed: hasClearSeparation,
    evidence: hasClearSeparation
      ? hasFrontDir && hasBackDir
        ? 'Separación explícita de frontend y backend'
        : hasPackagesDir
        ? 'Arquitectura monorepo en packages/'
        : 'Aplicación modular contenida en src/'
      : undefined,
  });

  // Check 3: Configuración externalizada: process.env, import.meta.env, os.environ, os.getenv o getenv (5)
  const externalConfigMatch = files.find((f) =>
    /process\.env|import\.meta\.env|os\.environ|os\.getenv|getenv\s*\(/i.test(f.content)
  );
  const hasExternalConfig = isDocument
    ? textToSearch.includes('process.env') || textToSearch.includes('import.meta.env') || textToSearch.includes('os.environ')
    : !!externalConfigMatch;
  structChecks.push({
    id: 'check-structure-external-config',
    label: 'Configuración externalizada mediante variables de entorno',
    points: hasExternalConfig ? 5 : 0,
    maxPoints: 5,
    passed: hasExternalConfig,
    evidence: hasExternalConfig
      ? externalConfigMatch
        ? `Variables de entorno en ${externalConfigMatch.path}`
        : 'Uso de variables de entorno detectado'
      : undefined,
  });

  // -------------------------------------------------------------
  // 3. Dependencias (15 pts)
  // -------------------------------------------------------------
  const depsChecks: ReadinessCheck[] = [];

  // Check 1: Manifiesto de dependencias (5)
  const manifestPath = paths.find((p) =>
    /(^|\/)(package\.json|requirements\.txt|pyproject\.toml|composer\.json|pom\.xml|build\.gradle(\.kts)?|go\.mod|gemfile)$/i.test(p)
  );
  const hasManifest = isDocument
    ? textToSearch.includes('package.json') || textToSearch.includes('requirements.txt') || textToSearch.includes('pyproject.toml')
    : !!manifestPath;
  depsChecks.push({
    id: 'check-deps-manifest',
    label: 'Manifiesto formal de dependencias',
    points: hasManifest ? 5 : 0,
    maxPoints: 5,
    passed: hasManifest,
    evidence: hasManifest ? (manifestPath || 'Manifiesto de dependencias') : undefined,
  });

  // Check 2: Lockfile (5)
  const lockfilePath = paths.find((p) =>
    /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|pipfile\.lock|composer\.lock|go\.sum|gemfile\.lock)$/i.test(p)
  );
  const hasLockfile = isDocument
    ? textToSearch.includes('package-lock.json') || textToSearch.includes('yarn.lock') || textToSearch.includes('poetry.lock')
    : !!lockfilePath;
  depsChecks.push({
    id: 'check-deps-lockfile',
    label: 'Lockfile para instalaciones determinísticas',
    points: hasLockfile ? 5 : 0,
    maxPoints: 5,
    passed: hasLockfile,
    evidence: hasLockfile ? (lockfilePath || 'Lockfile detectado') : undefined,
  });

  // Check 3: Versiones fijadas: sin "*", "latest" ni dependencias sin versión (5)
  let hasPinnedVersions = false;
  let pinnedEvidence = 'Versiones fijadas';

  if (isDocument) {
    hasPinnedVersions = !textToSearch.includes('latest') && !textToSearch.includes('"*"');
  } else {
    const pkg = files.find((f) => /(^|\/)package\.json$/i.test(f.path));
    const req = files.find((f) => /(^|\/)requirements\.txt$/i.test(f.path));

    if (pkg) {
      try {
        const parsed = JSON.parse(pkg.content);
        const allDeps = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
        const depEntries = Object.entries(allDeps);
        if (depEntries.length > 0) {
          const hasUnpinned = depEntries.some(
            ([_, ver]) => typeof ver !== 'string' || ver.trim() === '*' || ver.trim() === 'latest' || ver.trim() === ''
          );
          hasPinnedVersions = !hasUnpinned;
          pinnedEvidence = hasPinnedVersions ? `${pkg.path} (versiones controladas)` : 'Dependencias no fijadas';
        }
      } catch {
        hasPinnedVersions = false;
      }
    } else if (req) {
      const lines = req.content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#') && !l.startsWith('-'));
      if (lines.length > 0) {
        const allPinned = lines.every((l) => l.includes('==') || l.includes('>=') || l.includes('~='));
        hasPinnedVersions = allPinned;
        pinnedEvidence = hasPinnedVersions ? `${req.path} (versiones fijadas con == o >=)` : 'Dependencias sin versión fijada';
      }
    } else if (manifestPath) {
      hasPinnedVersions = true; // Otros manifiestos como pom.xml/go.mod suelen fijar versiones
    }
  }

  depsChecks.push({
    id: 'check-deps-pinned',
    label: 'Versiones fijadas en manifiesto (sin "*" ni "latest")',
    points: hasPinnedVersions ? 5 : 0,
    maxPoints: 5,
    passed: hasPinnedVersions,
    evidence: hasPinnedVersions ? pinnedEvidence : undefined,
  });

  // -------------------------------------------------------------
  // 4. Pruebas (15 pts)
  // -------------------------------------------------------------
  const testsChecks: ReadinessCheck[] = [];

  // Check 1: Archivos de prueba: *.test.*, *.spec.*, test_*.py, *_test.py, *_test.go o carpetas tests/, test/, __tests__/ (8)
  const testFileMatch = paths.find((p) =>
    /(\.test\.|\.spec\.|test_.*\.py|.*_test\.(py|go)$|(^|\/)(tests?|__tests__)\/)/i.test(p)
  );
  const hasTestFiles = isDocument
    ? textToSearch.includes('test') || textToSearch.includes('prueba') || textToSearch.includes('spec')
    : !!testFileMatch;
  testsChecks.push({
    id: 'check-tests-files',
    label: 'Archivos o suites de pruebas automatizadas',
    points: hasTestFiles ? 8 : 0,
    maxPoints: 8,
    passed: hasTestFiles,
    evidence: hasTestFiles ? (testFileMatch || 'Archivos de prueba detectados') : undefined,
  });

  // Check 2: Framework de pruebas (jest, vitest, mocha, @testing-library, cypress, playwright, pytest, unittest, phpunit, junit) (4)
  const hasTestFramework = isDocument
    ? textToSearch.includes('jest') || textToSearch.includes('vitest') || textToSearch.includes('pytest') || textToSearch.includes('testing-library')
    : files.some((f) =>
        /(jest|vitest|mocha|@testing-library|cypress|playwright|pytest|unittest|phpunit|junit)/i.test(f.content)
      ) || hasPath(/(jest\.config|vitest\.config|pytest\.ini|\.pytest_cache)/);
  testsChecks.push({
    id: 'check-tests-framework',
    label: 'Framework de pruebas instalado o configurado',
    points: hasTestFramework ? 4 : 0,
    maxPoints: 4,
    passed: hasTestFramework,
    evidence: hasTestFramework ? 'Framework de pruebas detectado' : undefined,
  });

  // Check 3: Script de pruebas: "test" en package.json (no placeholder), pytest.ini, tox.ini o [tool.pytest] (3)
  let hasTestScript = false;
  if (isDocument) {
    hasTestScript = textToSearch.includes('npm test') || textToSearch.includes('pytest') || textToSearch.includes('ejecutar pruebas');
  } else {
    const pkg = files.find((f) => /(^|\/)package\.json$/i.test(f.path));
    if (pkg) {
      try {
        const parsed = JSON.parse(pkg.content);
        const testScript = parsed.scripts?.test;
        if (typeof testScript === 'string' && testScript.trim()) {
          const lowerScript = testScript.toLowerCase();
          const isPlaceholder =
            lowerScript.includes('no test specified') ||
            lowerScript.includes('error: no test') ||
            lowerScript === 'exit 1';
          hasTestScript = !isPlaceholder;
        }
      } catch {
        hasTestScript = false;
      }
    }
    if (!hasTestScript) {
      hasTestScript = hasPath(/(pytest\.ini|tox\.ini)/) || files.some((f) => f.content.includes('[tool.pytest]'));
    }
  }

  testsChecks.push({
    id: 'check-tests-script',
    label: 'Script formal de ejecución de pruebas ("test")',
    points: hasTestScript ? 3 : 0,
    maxPoints: 3,
    passed: hasTestScript,
    evidence: hasTestScript ? 'Comando de ejecución de pruebas configurado' : undefined,
  });

  // -------------------------------------------------------------
  // 5. Calidad de código (10 pts)
  // -------------------------------------------------------------
  const qualityChecks: ReadinessCheck[] = [];

  // Check 1: Linter: eslint, .flake8, ruff, pylint, .rubocop.yml, golangci (4)
  const linterFileMatch = paths.find((p) =>
    /(^|\/)(\.eslintrc|eslint\.config|\.flake8|ruff\.toml|\.pylintrc|\.rubocop\.yml|\.golangci\.yml)/i.test(p)
  );
  const hasLinter = isDocument
    ? textToSearch.includes('eslint') || textToSearch.includes('flake8') || textToSearch.includes('ruff') || textToSearch.includes('linter')
    : !!linterFileMatch || files.some((f) => f.content.includes('"eslint"') || f.content.includes("'eslint'"));
  qualityChecks.push({
    id: 'check-quality-linter',
    label: 'Linter de código para análisis estático',
    points: hasLinter ? 4 : 0,
    maxPoints: 4,
    passed: hasLinter,
    evidence: hasLinter ? (linterFileMatch || 'Linter detectado') : undefined,
  });

  // Check 2: Formateador: prettier, black, ruff format, .editorconfig (3)
  const formatterFileMatch = paths.find((p) =>
    /(^|\/)(\.prettierrc|prettier\.config|\.editorconfig|pyproject\.toml)/i.test(p)
  );
  const hasFormatter = isDocument
    ? textToSearch.includes('prettier') || textToSearch.includes('black') || textToSearch.includes('.editorconfig')
    : !!formatterFileMatch || files.some((f) => f.content.includes('"prettier"') || f.content.includes('[tool.black]'));
  qualityChecks.push({
    id: 'check-quality-formatter',
    label: 'Formateador de código automático',
    points: hasFormatter ? 3 : 0,
    maxPoints: 3,
    passed: hasFormatter,
    evidence: hasFormatter ? (formatterFileMatch || 'Formateador detectado') : undefined,
  });

  // Check 3: Tipado: tsconfig.json, archivos .ts/.tsx, mypy o pyright (3)
  const typingFileMatch = paths.find((p) =>
    /(^|\/)(tsconfig\.json|mypy\.ini|pyrightconfig\.json|\.d\.ts)$/i.test(p) || /\.(ts|tsx)$/i.test(p)
  );
  const hasTyping = isDocument
    ? textToSearch.includes('typescript') || textToSearch.includes('tsconfig') || textToSearch.includes('mypy')
    : !!typingFileMatch;
  qualityChecks.push({
    id: 'check-quality-typing',
    label: 'Tipado estático (TypeScript / mypy / pyright)',
    points: hasTyping ? 3 : 0,
    maxPoints: 3,
    passed: hasTyping,
    evidence: hasTyping ? (typingFileMatch || 'Tipado estático detectado') : undefined,
  });

  // -------------------------------------------------------------
  // 6. Contenedores (15 pts)
  // -------------------------------------------------------------
  const containerChecks: ReadinessCheck[] = [];

  // Check 1: Dockerfile (7)
  const dockerfilePath = paths.find((p) => /(^|\/)dockerfile(\.[a-z0-9_-]+)?$/i.test(p));
  const hasDockerfile = isDocument
    ? textToSearch.includes('dockerfile')
    : !!dockerfilePath;
  containerChecks.push({
    id: 'check-container-dockerfile',
    label: 'Dockerfile para empaquetado de aplicación',
    points: hasDockerfile ? 7 : 0,
    maxPoints: 7,
    passed: hasDockerfile,
    evidence: hasDockerfile ? (dockerfilePath || 'Dockerfile') : undefined,
  });

  // Check 2: docker-compose.yml/.yaml o compose.yml (4)
  const composePath = paths.find((p) => /(^|\/)(docker-compose|compose)\.ya?ml$/i.test(p));
  const hasCompose = isDocument
    ? textToSearch.includes('docker-compose') || textToSearch.includes('compose.yml')
    : !!composePath;
  containerChecks.push({
    id: 'check-container-compose',
    label: 'Docker Compose para orquestación de servicios locales',
    points: hasCompose ? 4 : 0,
    maxPoints: 4,
    passed: hasCompose,
    evidence: hasCompose ? (composePath || 'docker-compose.yml') : undefined,
  });

  // Check 3: .dockerignore (2)
  const dockerignorePath = paths.find((p) => /(^|\/)\.dockerignore$/i.test(p));
  const hasDockerignore = isDocument
    ? textToSearch.includes('.dockerignore')
    : !!dockerignorePath;
  containerChecks.push({
    id: 'check-container-dockerignore',
    label: 'Archivo .dockerignore para exclusión de artefactos',
    points: hasDockerignore ? 2 : 0,
    maxPoints: 2,
    passed: hasDockerignore,
    evidence: hasDockerignore ? (dockerignorePath || '.dockerignore') : undefined,
  });

  // Check 4: EXPOSE o HEALTHCHECK en el Dockerfile (2)
  const dockerfileItem = files.find((f) => /(^|\/)dockerfile(\.[a-z0-9_-]+)?$/i.test(f.path));
  const hasExposeOrHealthcheck = isDocument
    ? textToSearch.includes('expose') || textToSearch.includes('healthcheck')
    : dockerfileItem
    ? /(^|\n)\s*(EXPOSE|HEALTHCHECK)\s+/i.test(dockerfileItem.content)
    : false;
  containerChecks.push({
    id: 'check-container-healthcheck',
    label: 'Instrucción EXPOSE o HEALTHCHECK en el Dockerfile',
    points: hasExposeOrHealthcheck ? 2 : 0,
    maxPoints: 2,
    passed: hasExposeOrHealthcheck,
    evidence: hasExposeOrHealthcheck ? 'EXPOSE o HEALTHCHECK presente en Dockerfile' : undefined,
  });

  // -------------------------------------------------------------
  // 7. Seguridad (15 pts)
  // Regla para documentos: "Ningún check de seguridad puede marcarse como aprobado con un documento: márcalos como 'No verificable'."
  // -------------------------------------------------------------
  const securityChecks: ReadinessCheck[] = [];
  const detectedSecrets = isDocument ? [] : scanSecrets(files);

  // Check 1: .gitignore que incluya .env y node_modules (o venv/__pycache__ en Python) (5)
  let hasValidGitignore = false;
  let gitignoreEvidence = '';
  if (isDocument) {
    hasValidGitignore = false;
    gitignoreEvidence = 'No verificable en documento';
  } else {
    const gitignoreFile = files.find((f) => /(^|\/)\.gitignore$/i.test(f.path));
    if (gitignoreFile) {
      const gContent = gitignoreFile.content.toLowerCase();
      const hasEnvIgnore = gContent.includes('.env');
      const hasDepIgnore =
        gContent.includes('node_modules') || gContent.includes('venv') || gContent.includes('__pycache__');
      hasValidGitignore = hasEnvIgnore && hasDepIgnore;
      gitignoreEvidence = hasValidGitignore
        ? `${gitignoreFile.path} (excluye .env y dependencias)`
        : 'Incompleto (.gitignore no excluye .env o dependencias)';
    } else {
      hasValidGitignore = false;
      gitignoreEvidence = 'Sin archivo .gitignore';
    }
  }

  securityChecks.push({
    id: 'check-security-gitignore',
    label: 'Archivo .gitignore con exclusión de .env y dependencias',
    points: hasValidGitignore ? 5 : 0,
    maxPoints: 5,
    passed: hasValidGitignore,
    evidence: hasValidGitignore ? gitignoreEvidence : isDocument ? 'No verificable' : undefined,
  });

  // Check 2: No hay archivo .env real en el proyecto (5)
  let noRealEnv = false;
  let realEnvPath: string | undefined;

  if (isDocument) {
    noRealEnv = false;
  } else {
    realEnvPath = paths.find(
      (p) =>
        /(^|\/)\.env(\.(local|production|development|stage|test))?$/i.test(p) &&
        !p.includes('.example') &&
        !p.includes('.sample') &&
        !p.includes('.template')
    );
    noRealEnv = !realEnvPath;
  }

  securityChecks.push({
    id: 'check-security-no-real-env',
    label: 'Ausencia de archivos .env reales con credenciales',
    points: noRealEnv ? 5 : 0,
    maxPoints: 5,
    passed: noRealEnv,
    evidence: noRealEnv
      ? 'Sin archivos .env en el repositorio'
      : isDocument
      ? 'No verificable'
      : `Archivo .env detectado: ${realEnvPath}`,
  });

  // Check 3: No se detectan secretos expuestos (5)
  const noSecretsDetected = !isDocument && detectedSecrets.length === 0;
  securityChecks.push({
    id: 'check-security-no-secrets',
    label: 'Código limpio de secretos o credenciales expuestas',
    points: noSecretsDetected ? 5 : 0,
    maxPoints: 5,
    passed: noSecretsDetected,
    evidence: noSecretsDetected
      ? '0 credenciales o secretos detectados'
      : isDocument
      ? 'No verificable'
      : `${detectedSecrets.length} credenciales detectadas`,
  });

  // -------------------------------------------------------------
  // 8. CI/CD (5 pts)
  // -------------------------------------------------------------
  const cicdChecks: ReadinessCheck[] = [];
  const cicdPath = paths.find((p) =>
    /(\.github\/workflows\/.*\.ya?ml|\.gitlab-ci\.yml|jenkinsfile|azure-pipelines\.ya?ml|bitbucket-pipelines\.ya?ml|\.circleci\/)/i.test(p)
  );
  const hasCicd = isDocument
    ? textToSearch.includes('github actions') || textToSearch.includes('gitlab-ci') || textToSearch.includes('jenkins') || textToSearch.includes('ci/cd')
    : !!cicdPath;
  cicdChecks.push({
    id: 'check-cicd-pipeline',
    label: 'Definición de flujo CI/CD automatizado',
    points: hasCicd ? 5 : 0,
    maxPoints: 5,
    passed: hasCicd,
    evidence: hasCicd ? (cicdPath || 'Flujo CI/CD detectado') : undefined,
  });

  // -------------------------------------------------------------
  // Construir Dimensiones
  // -------------------------------------------------------------
  const createDimension = (
    id: ReadinessDimensionId,
    label: string,
    maxScore: number,
    checks: ReadinessCheck[]
  ): ReadinessDimension => {
    const score = checks.reduce((acc, c) => acc + c.points, 0);
    return {
      id,
      label,
      score,
      maxScore,
      checks,
    };
  };

  const dimensions: ReadinessDimension[] = [
    createDimension('docs', 'Documentación', 10, docsChecks),
    createDimension('structure', 'Estructura', 15, structChecks),
    createDimension('dependencies', 'Dependencias', 15, depsChecks),
    createDimension('tests', 'Pruebas', 15, testsChecks),
    createDimension('codeQuality', 'Calidad de código', 10, qualityChecks),
    createDimension('containers', 'Contenedores', 15, containerChecks),
    createDimension('security', 'Seguridad', 15, securityChecks),
    createDimension('cicd', 'CI/CD', 5, cicdChecks),
  ];

  const totalScore = Math.min(100, Math.max(0, dimensions.reduce((acc, d) => acc + d.score, 0)));

  // Determinar status: 70–100 'ready'; 50–69 'ready-with-notes'; 0–49 'needs-preparation'
  let status: ReadinessStatus = 'needs-preparation';
  if (totalScore >= 70) {
    status = 'ready';
  } else if (totalScore >= 50) {
    status = 'ready-with-notes';
  }

  // -------------------------------------------------------------
  // Fortalezas (Strengths) a partir de checks aprobados con evidencia
  // -------------------------------------------------------------
  const strengths: Strength[] = [];
  for (const dim of dimensions) {
    for (const ch of dim.checks) {
      if (ch.passed && ch.evidence && ch.evidence !== 'No verificable') {
        strengths.push({
          id: `strength-${ch.id}`,
          dimension: dim.id,
          title: ch.label,
          evidence: ch.evidence,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // Hallazgos (Findings) a partir de checks fallidos y secretos
  // Severidad:
  // - critical: secreto expuesto, archivo .env real incluido, sin .gitignore
  // - medium: sin pruebas, sin Dockerfile, sin lockfile, versiones no fijadas, config no externalizada
  // - low: sin README instalación, sin linter, sin formateador, sin CI/CD, sin .dockerignore, sin HEALTHCHECK
  // -------------------------------------------------------------
  const findings: Finding[] = [];

  // 1. Secretos detectados (Critical)
  const secretFindings = convertSecretsToFindings(detectedSecrets);
  findings.push(...secretFindings);

  // 2. Archivo .env real (Critical)
  if (!noRealEnv && !isDocument && realEnvPath) {
    findings.push({
      id: 'finding-real-env-included',
      dimension: 'security',
      severity: 'critical',
      title: `Archivo de configuración sensible incluido: ${realEnvPath}`,
      evidence: realEnvPath,
      recommendation:
        'Elimina el archivo .env del repositorio, revoca las credenciales que contenía y usa .env.example como plantilla.',
    });
  }

  // 3. .gitignore ausente o incompleto (Critical)
  if (!hasValidGitignore && !isDocument) {
    findings.push({
      id: 'finding-missing-gitignore',
      dimension: 'security',
      severity: 'critical',
      title: 'Archivo .gitignore ausente o incompleto',
      evidence: gitignoreEvidence || '.gitignore',
      recommendation:
        'Crea o actualiza .gitignore para excluir explícitamente .env, carpetas de dependencias (node_modules/venv) y cachés temporales.',
    });
  }

  // 4. Hallazgos Medium
  if (!hasTestFiles && !isDocument) {
    findings.push({
      id: 'finding-no-tests',
      dimension: 'tests',
      severity: 'medium',
      title: 'Sin pruebas automatizadas en el repositorio',
      evidence: 'No se detectaron archivos *.test.*, *.spec.* ni carpetas tests/',
      recommendation:
        'Implementa pruebas unitarias o de integración para validar la lógica antes de migrar a AWS.',
    });
  }

  if (!hasDockerfile && !isDocument) {
    findings.push({
      id: 'finding-no-dockerfile',
      dimension: 'containers',
      severity: 'medium',
      title: 'No se encontró archivo Dockerfile para contenerización',
      evidence: 'Ausencia de Dockerfile en el proyecto',
      recommendation:
        'Crea un Dockerfile multi-stage para empaquetar la aplicación de forma portable y desplegable en contenedores.',
    });
  }

  if (!hasLockfile && !isDocument) {
    findings.push({
      id: 'finding-no-lockfile',
      dimension: 'dependencies',
      severity: 'medium',
      title: 'Falta archivo lockfile para instalaciones determinísticas',
      evidence: 'No se encontró package-lock.json, poetry.lock, yarn.lock, etc.',
      recommendation:
        'Genera y sube el archivo lockfile al repositorio para asegurar que los builds en AWS sean reproducibles.',
    });
  }

  if (!hasPinnedVersions && !isDocument) {
    findings.push({
      id: 'finding-unpinned-dependencies',
      dimension: 'dependencies',
      severity: 'medium',
      title: 'Dependencias con versiones dinámicas o sin fijar',
      evidence: pinnedEvidence,
      recommendation:
        'Fija las versiones exactas o rangos controlados en el manifiesto para evitar roturas imprevistas en la nube.',
    });
  }

  if (!hasExternalConfig && !isDocument) {
    findings.push({
      id: 'finding-config-not-externalized',
      dimension: 'structure',
      severity: 'medium',
      title: 'Configuración no externalizada mediante variables de entorno',
      evidence: 'No se detectó uso de process.env ni os.environ',
      recommendation:
        'Externaliza credenciales, puertos y endpoints usando variables de entorno o AWS Secrets Manager.',
    });
  }

  // 5. Hallazgos Low
  if (!hasInstallGuide && !isDocument) {
    findings.push({
      id: 'finding-no-install-guide',
      dimension: 'docs',
      severity: 'low',
      title: 'El README carece de guía de instalación o ejecución',
      evidence: 'README sin sección de instalación',
      recommendation:
        'Documenta los pasos claros para clonar, instalar dependencias y ejecutar la aplicación localmente.',
    });
  }

  if (!hasLinter && !isDocument) {
    findings.push({
      id: 'finding-no-linter',
      dimension: 'codeQuality',
      severity: 'low',
      title: 'Sin herramienta de linting configurada',
      evidence: 'No se detectó ESLint, Ruff ni Flake8',
      recommendation:
        'Configura un linter (ESLint para JS/TS o Ruff para Python) para mantener consistencia y detectar errores tempranos.',
    });
  }

  if (!hasFormatter && !isDocument) {
    findings.push({
      id: 'finding-no-formatter',
      dimension: 'codeQuality',
      severity: 'low',
      title: 'Sin formateador de código configurado',
      evidence: 'No se detectó Prettier ni .editorconfig',
      recommendation:
        'Añade un formateador automático (.editorconfig o Prettier) para unificar el formato del código.',
    });
  }

  if (!hasCicd && !isDocument) {
    findings.push({
      id: 'finding-no-cicd',
      dimension: 'cicd',
      severity: 'low',
      title: 'Sin pipeline de integración y entrega continua (CI/CD)',
      evidence: 'No se detectaron workflows en .github/workflows ni .gitlab-ci.yml',
      recommendation:
        'Crea un workflow de CI/CD en GitHub Actions o GitLab CI para automatizar pruebas y despliegues en AWS.',
    });
  }

  if (hasDockerfile && !hasDockerignore && !isDocument) {
    findings.push({
      id: 'finding-no-dockerignore',
      dimension: 'containers',
      severity: 'low',
      title: 'Falta archivo .dockerignore',
      evidence: 'No se encontró .dockerignore junto al Dockerfile',
      recommendation:
        'Crea un archivo .dockerignore para excluir dependencias locales y temporales del contexto de compilación.',
    });
  }

  if (hasDockerfile && !hasExposeOrHealthcheck && !isDocument) {
    findings.push({
      id: 'finding-no-expose-healthcheck',
      dimension: 'containers',
      severity: 'low',
      title: 'Dockerfile sin EXPOSE o HEALTHCHECK',
      evidence: 'Dockerfile no declara puerto ni chequeo de salud',
      recommendation:
        'Agrega la directiva EXPOSE para el puerto de servicio y HEALTHCHECK para facilitar el balanceo de carga.',
    });
  }

  // Ordenar Findings: critical → medium → low
  const severityRank: Record<Severity, number> = {
    critical: 1,
    medium: 2,
    low: 3,
  };
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  // -------------------------------------------------------------
  // Pre-migration Tasks: una tarea por cada Finding critical o medium
  // -------------------------------------------------------------
  const preMigrationTasks: PreMigrationTask[] = findings
    .filter((f) => f.severity === 'critical' || f.severity === 'medium')
    .map((f) => ({
      title: f.recommendation,
      fromFindingId: f.id,
      severity: f.severity,
    }));

  // -------------------------------------------------------------
  // Estrategia de Migración (estrategias de AWS)
  // -------------------------------------------------------------
  let strategy: MigrationStrategy;
  if (!hasBackendOrDb) {
    strategy = {
      id: 'rehost',
      label: 'Rehost (Lift & Shift)',
      description:
        'Rehost estático hacia Amazon S3 y Amazon CloudFront con distribución perimetral global.',
    };
  } else if (status === 'ready') {
    strategy = {
      id: 'replatform',
      label: 'Replatform (Lift, Tinker and Shift)',
      description:
        'Replatform: migrar con ajustes menores aprovechando servicios administrados (ej. RDS en lugar de una BD propia).',
    };
  } else if (status === 'ready-with-notes') {
    strategy = {
      id: 'replatform',
      label: 'Replatform con ajustes',
      description:
        'Replatform: migrar con ajustes menores aprovechando servicios administrados; aplicar primero las tareas previas.',
    };
  } else {
    strategy = {
      id: 'refactor',
      label: 'Refactor / Re-architect',
      description:
        'Preparar y refactorizar: resolver las tareas previas antes de migrar para no trasladar los problemas a la nube.',
    };
  }

  return {
    score: totalScore,
    status,
    dimensions,
    strengths,
    findings,
    preMigrationTasks,
    strategy,
    confidence: isDocument ? 'low' : 'high',
    isEstimated: isDocument,
  };
}
