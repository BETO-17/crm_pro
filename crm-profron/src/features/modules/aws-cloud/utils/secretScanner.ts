import type { ProjectFile } from './projectReaders';
import type { Finding } from '../types/awsTypes';

export interface DetectedSecret {
  ruleId: string;
  ruleName: string;
  file: string;
  lineNumber: number;
  maskedValue: string;
  snippet: string;
}

/**
 * Enmascara un valor sensible mostrando los primeros 4 y últimos 3 caracteres.
 */
export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return trimmed.slice(0, 2) + '••••' + trimmed.slice(-2);
  }
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-3);
  const dotsCount = Math.min(12, Math.max(4, trimmed.length - 7));
  return `${prefix}${'•'.repeat(dotsCount)}${suffix}`;
}

/**
 * Determina si una cadena o archivo corresponde a un valor ficticio, de plantilla o de ejemplo.
 */
export function isExampleValue(raw: string, filePath: string): boolean {
  const lowerPath = filePath.toLowerCase();
  if (
    lowerPath.includes('.example') ||
    lowerPath.includes('.sample') ||
    lowerPath.includes('.template') ||
    lowerPath.endsWith('example.env') ||
    lowerPath.endsWith('sample.env')
  ) {
    return true;
  }

  const lowerRaw = raw.toLowerCase();
  const exampleMarkers = [
    'example',
    'your_',
    'changeme',
    'xxxx',
    '<',
    '${',
    'process.env',
    'os.environ',
    'placeholder',
    'dummy',
    'my-secret',
    'mysecret',
    'default',
    'todo',
  ];

  return exampleMarkers.some((marker) => lowerRaw.includes(marker));
}

interface SecretPattern {
  id: string;
  name: string;
  regex: RegExp;
  extractValue?: (match: RegExpExecArray) => string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    id: 'aws-access-key',
    name: 'AWS Access Key ID',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    extractValue: (m) => m[1],
  },
  {
    id: 'private-key',
    name: 'Clave privada RSA/EC/OPENSSH/DSA',
    regex: /(-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----)/g,
    extractValue: (m) => m[1],
  },
  {
    id: 'github-token',
    name: 'Token de acceso personal de GitHub',
    regex: /\b(gh[pousr]_[A-Za-z0-9]{36,})\b/g,
    extractValue: (m) => m[1],
  },
  {
    id: 'google-api-key',
    name: 'Google Cloud API Key',
    regex: /\b(AIza[0-9A-Za-z\-_]{35})\b/g,
    extractValue: (m) => m[1],
  },
  {
    id: 'stripe-live-key',
    name: 'Stripe Live Secret Key',
    regex: /\b(sk_live_[0-9a-zA-Z]{24,})\b/g,
    extractValue: (m) => m[1],
  },
  {
    id: 'database-credentials-url',
    name: 'Cadena de conexión de BD con credenciales',
    regex: /\b((?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@[^\s"']+)\b/gi,
    extractValue: (m) => m[1],
  },
  {
    id: 'generic-secret-assignment',
    name: 'Asignación de clave o contraseña en texto plano',
    regex: /\b(?:password|passwd|secret|api_key|apikey|access_token|secret_key)\s*[:=]\s*["']([^"'\s]{8,})["']/gi,
    extractValue: (m) => m[1],
  },
];

/**
 * Escanea archivos de texto en busca de credenciales o secretos en código.
 */
export function scanSecrets(files: ProjectFile[]): DetectedSecret[] {
  const detected: DetectedSecret[] = [];

  for (const file of files) {
    if (!file.content) continue;

    // Ignorar archivos que sean claramente ejemplos o plantillas
    const lowerPath = file.path.toLowerCase();
    if (
      lowerPath.includes('.example') ||
      lowerPath.includes('.sample') ||
      lowerPath.includes('.template')
    ) {
      continue;
    }

    const lines = file.content.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const lineText = lines[lineIndex];

      // Omitir líneas excesivamente largas (archivos minificados o datos base64)
      if (lineText.length > 2000) continue;

      for (const pattern of SECRET_PATTERNS) {
        pattern.regex.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.regex.exec(lineText)) !== null) {
          const secretValue = pattern.extractValue ? pattern.extractValue(match) : match[0];

          if (!secretValue || isExampleValue(secretValue, file.path)) {
            continue;
          }

          // Para asignaciones genéricas, evitar falsos positivos con llamadas de entorno
          if (
            pattern.id === 'generic-secret-assignment' &&
            (lineText.includes('process.env') ||
              lineText.includes('import.meta.env') ||
              lineText.includes('os.environ') ||
              lineText.includes('os.getenv') ||
              lineText.includes('getenv('))
          ) {
            continue;
          }

          detected.push({
            ruleId: pattern.id,
            ruleName: pattern.name,
            file: file.path,
            lineNumber: lineIndex + 1,
            maskedValue: maskSecret(secretValue),
            snippet: `${pattern.name}: ${maskSecret(secretValue)}`,
          });
        }
      }
    }
  }

  return detected;
}

/**
 * Convierte los secretos detectados en Findings críticos para la dimensión 'security'.
 */
export function convertSecretsToFindings(secrets: DetectedSecret[]): Finding[] {
  return secrets.map((s, idx) => ({
    id: `finding-secret-${idx + 1}-${s.file.replace(/[^a-zA-Z0-9]/g, '_')}-${s.lineNumber}`,
    dimension: 'security',
    severity: 'critical',
    title: `Credencial expuesta: ${s.ruleName} en ${s.file}:${s.lineNumber}`,
    evidence: `${s.file} (línea ${s.lineNumber}) — ${s.maskedValue}`,
    recommendation:
      'Revoca esta credencial, elimínala del código y usa variables de entorno o AWS Secrets Manager.',
  }));
}
