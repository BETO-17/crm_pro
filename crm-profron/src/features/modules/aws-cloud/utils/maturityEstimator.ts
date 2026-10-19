import type { Finding, MaturityLevel, ProjectMaturity, ProjectMetrics } from '../types/awsTypes';
import type { ProjectFile } from './projectReaders';
import { compareSemver } from '../data/outdatedDeps';

const CODE_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'py',
  'java',
  'go',
  'rb',
  'php',
  'cs',
  'cpp',
  'c',
  'rs',
  'swift',
  'kt',
  'scala',
]);

/**
 * Motor de estimación de madurez y cálculo de métricas del proyecto.
 */
export function estimateProjectMaturity(params: {
  paths: string[];
  files: ProjectFile[];
  findings: Finding[];
  hasDatabase: boolean;
  version?: string;
  githubMetrics?: {
    commitsLast90Days?: number;
    contributors?: number;
    lastCommitDate?: string;
  };
}): { maturity: ProjectMaturity; metrics: ProjectMetrics } {
  const { paths, files, findings, hasDatabase, version = '0.0.0', githubMetrics } = params;

  const normalizedPaths = paths.map((p) => p.replace(/\\/g, '/').toLowerCase());

  // 1. Archivos de código
  let codeFiles = 0;
  let linesOfCode = 0;
  let todoCount = 0;
  let routesOrEndpoints = 0;

  // Detección de módulos (carpetas de 1er nivel dentro de src, app, backend, frontend, pkg, internal)
  const moduleSet = new Set<string>();

  for (const p of normalizedPaths) {
    const ext = p.split('.').pop() || '';
    if (CODE_EXTENSIONS.has(ext)) {
      codeFiles++;
    }

    // Extraer módulos
    const moduleMatch = p.match(/(?:^|\/)(?:src|app|backend|frontend|pkg|internal|lib)\/([a-zA-Z0-9_\-]+)\//i);
    if (moduleMatch && moduleMatch[1]) {
      const modName = moduleMatch[1].toLowerCase();
      if (!['assets', 'styles', 'css', 'images', 'public', 'tests', '__tests__'].includes(modName)) {
        moduleSet.add(modName);
      }
    }
  }

  // Si no se encontraron dentro de src/, buscar carpetas principales de primer nivel
  if (moduleSet.size === 0) {
    for (const p of normalizedPaths) {
      const parts = p.split('/');
      if (parts.length > 1 && parts[0] && !parts[0].startsWith('.')) {
        const topDir = parts[0];
        if (!['node_modules', 'dist', 'build', 'public', 'docs', 'venv'].includes(topDir)) {
          moduleSet.add(topDir);
        }
      }
    }
  }

  // 2. Líneas de código, TODOs y Endpoints en archivos leídos
  for (const f of files) {
    const ext = f.path.split('.').pop()?.toLowerCase() || '';
    if (CODE_EXTENSIONS.has(ext)) {
      const lines = f.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          linesOfCode++;
        }
        if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(line)) {
          todoCount++;
        }
      }

      // Endpoints / Rutas API o vistas
      const endpointMatches = f.content.match(
        /(?:app|router)\.(?:get|post|put|delete|patch|options)\s*\(|@(?:app|router|api_router)\.(?:get|post|put|delete|patch)|path\s*\(\s*['"][^'"]+['"]|<Route\s+[^>]*path=|@(Get|Post|Put|Delete|Request)Mapping/gi
      );
      if (endpointMatches) {
        routesOrEndpoints += endpointMatches.length;
      }
    }
  }

  // 3. Migraciones de Base de Datos
  let dbMigrations = 0;
  for (const p of normalizedPaths) {
    if (
      p.includes('/migrations/') ||
      p.includes('alembic/versions/') ||
      p.includes('prisma/migrations/') ||
      p.includes('/db/migrate/') ||
      p.includes('/flyway/') ||
      p.includes('/liquibase/')
    ) {
      if (CODE_EXTENSIONS.has(p.split('.').pop() || '') || p.endsWith('.sql')) {
        dbMigrations++;
      }
    }
  }

  const metrics: ProjectMetrics = {
    totalFiles: paths.length || files.length,
    codeFiles: codeFiles || files.length,
    linesOfCode,
    modules: moduleSet.size,
    routesOrEndpoints,
    dbMigrations,
    todoCount,
    commitsLast90Days: githubMetrics?.commitsLast90Days,
    contributors: githubMetrics?.contributors,
    lastCommitDate: githubMetrics?.lastCommitDate,
  };

  // 4. Condiciones para el nivel de Madurez
  const hasDocker =
    normalizedPaths.some((p) => p.includes('dockerfile') || p.includes('docker-compose'));
  const hasCi =
    normalizedPaths.some((p) => p.includes('.github/workflows/') || p.includes('.gitlab-ci.yml'));
  const hasTests =
    normalizedPaths.some((p) => /(\.test\.|\.spec\.|test_.*\.py|.*_test\.(py|go)|(^|\/)tests?\/)/.test(p));
  const hasLinter =
    normalizedPaths.some((p) => /(\.eslintrc|eslint|\.flake8|ruff\.toml|\.pylintrc|\.prettierrc)/.test(p));
  const isVersion1OrHigher = compareSemver(version, '1.0.0') >= 0;
  const criticalFindingsCount = findings.filter((f) => f.severity === 'critical').length;
  const commits90 = githubMetrics?.commitsLast90Days ?? 0;

  let level: MaturityLevel = 'prototype';
  let label = 'Prototipo';
  const signals: ProjectMaturity['signals'] = [];

  // Regla 1: production: Docker + CI/CD + pruebas + versión ≥ 1.0.0 + sin hallazgos críticos
  if (hasDocker && hasCi && hasTests && isVersion1OrHigher && criticalFindingsCount === 0) {
    level = 'production';
    label = 'Producción';
    signals.push({ label: 'Infraestructura', value: 'Docker y CI/CD activos' });
    signals.push({ label: 'Pruebas', value: 'Suite automatizada presente' });
    signals.push({ label: 'Versionado', value: `v${version} (≥ 1.0.0)` });
    signals.push({ label: 'Seguridad', value: '0 problemas críticos detectados' });
  }
  // Regla 2: active: pruebas o migraciones + linter + (commits en los últimos 90 días o más de 3 módulos)
  else if ((hasTests || dbMigrations > 0) && hasLinter && (commits90 > 0 || moduleSet.size > 3)) {
    level = 'active';
    label = 'Activo';
    if (hasTests) signals.push({ label: 'Pruebas', value: 'Pruebas automatizadas configuradas' });
    if (dbMigrations > 0) signals.push({ label: 'Persistencia', value: `${dbMigrations} migraciones registradas` });
    signals.push({ label: 'Calidad', value: 'Linter y análisis estático activo' });
    if (moduleSet.size > 3) signals.push({ label: 'Arquitectura', value: `${moduleSet.size} módulos estructurados` });
    if (commits90 > 0) signals.push({ label: 'Actividad Git', value: `${commits90} commits en últimos 90 días` });
  }
  // Regla 3: mvp: base de datos conectada o al menos 3 rutas/pantallas + más de 20 archivos de código
  else if ((hasDatabase || routesOrEndpoints >= 3) && codeFiles > 20) {
    level = 'mvp';
    label = 'MVP';
    if (hasDatabase) signals.push({ label: 'Base de datos', value: 'Conexión a base de datos detectada' });
    if (routesOrEndpoints >= 3) signals.push({ label: 'Superficie API', value: `${routesOrEndpoints} rutas o endpoints detectados` });
    signals.push({ label: 'Volumen de código', value: `${codeFiles} archivos de código fuente` });
  }
  // Regla 4: prototype: cualquier otro caso
  else {
    level = 'prototype';
    label = 'Prototipo';
    signals.push({ label: 'Estado', value: 'Proyecto en fase inicial o exploratoria' });
    signals.push({ label: 'Archivos de código', value: `${codeFiles} archivos analizados` });
    if (routesOrEndpoints > 0) {
      signals.push({ label: 'Rutas', value: `${routesOrEndpoints} endpoints detectados` });
    }
  }

  // Señales adicionales métricas descriptivas
  if (routesOrEndpoints > 0 && !signals.some((s) => s.label.includes('API') || s.label.includes('Rutas'))) {
    signals.push({ label: 'Rutas/Endpoints', value: `${routesOrEndpoints} detectados` });
  }
  if (dbMigrations > 0 && !signals.some((s) => s.label.includes('Persistencia') || s.label.includes('Migraciones'))) {
    signals.push({ label: 'Migraciones DB', value: `${dbMigrations} archivos` });
  }
  if (todoCount > 0) {
    signals.push({ label: 'Deuda técnica', value: `${todoCount} TODO/FIXME pendientes` });
  }

  return {
    maturity: {
      level,
      label,
      signals,
    },
    metrics,
  };
}
