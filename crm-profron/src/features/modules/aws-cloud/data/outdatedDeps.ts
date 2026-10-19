/**
 * Tabla de versiones mínimas recomendadas para paquetes comunes.
 * Se utiliza para detectar dependencias obsoletas con riesgos de seguridad o incompatibilidad.
 */

export interface RecommendedDepVersion {
  name: string;
  minVersion: string;
  ecosystem: 'npm' | 'pypi';
  recommendation: string;
}

export const RECOMMENDED_DEP_VERSIONS: Record<string, RecommendedDepVersion> = {
  react: {
    name: 'react',
    minVersion: '18.0.0',
    ecosystem: 'npm',
    recommendation: 'Actualizar a React 18+ para soporte concurrente y parches de seguridad.',
  },
  express: {
    name: 'express',
    minVersion: '4.18.0',
    ecosystem: 'npm',
    recommendation: 'Actualizar a Express 4.18+ para mitigar vulnerabilidades en dependencias internas (qs/send).',
  },
  django: {
    name: 'django',
    minVersion: '4.2.0',
    ecosystem: 'pypi',
    recommendation: 'Versiones de Django < 4.2 están fuera de soporte oficial (EOL) y sin parches de seguridad.',
  },
  flask: {
    name: 'flask',
    minVersion: '2.2.0',
    ecosystem: 'pypi',
    recommendation: 'Actualizar a Flask 2.2+ para soporte moderno de Werkzeug y seguridad en sesiones.',
  },
  axios: {
    name: 'axios',
    minVersion: '1.0.0',
    ecosystem: 'npm',
    recommendation: 'Versiones de Axios < 1.0 tienen vulnerabilidades conocidas de SSRF y prototipo.',
  },
  lodash: {
    name: 'lodash',
    minVersion: '4.17.21',
    ecosystem: 'npm',
    recommendation: 'Versiones de Lodash < 4.17.21 son vulnerables a Prototype Pollution crítico (CVE-2021-23337).',
  },
  jsonwebtoken: {
    name: 'jsonwebtoken',
    minVersion: '9.0.0',
    ecosystem: 'npm',
    recommendation: 'Versiones < 9.0.0 tienen vulnerabilidades críticas en verificación de firmas y tokens.',
  },
  next: {
    name: 'next',
    minVersion: '13.0.0',
    ecosystem: 'npm',
    recommendation: 'Actualizar a Next.js 13+ para compatibilidad con el ecosistema moderno y parches de seguridad.',
  },
};

/**
 * Limpia y normaliza una cadena de versión semántica (ej: "^16.8.0" -> "16.8.0")
 */
export function cleanSemver(versionStr: string): string {
  return versionStr
    .trim()
    .replace(/^[\^~>=<v\s]+/, '')
    .split(/[-+]/)[0] || '0.0.0';
}

/**
 * Compara dos versiones semver (v1 vs v2).
 * Retorna:
 *  -1 si v1 < v2
 *   0 si v1 == v2
 *   1 si v1 > v2
 */
export function compareSemver(v1: string, v2: string): number {
  const parts1 = cleanSemver(v1).split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = cleanSemver(v2).split('.').map((p) => parseInt(p, 10) || 0);

  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * Verifica si una dependencia está por debajo de la versión mínima recomendada.
 */
export function isDependencyOutdated(
  packageName: string,
  currentVersion: string
): { isOutdated: boolean; rule?: RecommendedDepVersion } {
  const lowerName = packageName.toLowerCase();
  const rule = RECOMMENDED_DEP_VERSIONS[lowerName];
  if (!rule) {
    return { isOutdated: false };
  }

  const cmp = compareSemver(currentVersion, rule.minVersion);
  return {
    isOutdated: cmp < 0,
    rule,
  };
}
