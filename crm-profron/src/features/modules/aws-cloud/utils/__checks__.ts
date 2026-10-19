/**
 * Script de verificación para el Índice de Preparación Cloud
 * Ejecuta los 3 casos mínimos solicitados:
 * 1. Proyecto "bueno" (score >= 90, status 'ready')
 * 2. Proyecto "malo" (score < 30, status 'needs-preparation', findings críticos)
 * 3. Documento .md (confidence 'low', isEstimated true, seguridad no verificable)
 */

import { computeReadinessScore } from './readinessScorer';
import { scanSecrets } from './secretScanner';
import type { ProjectFile } from './projectReaders';

export function runChecks() {
  console.log('=====================================================');
  console.log('   VERIFICACIÓN DEL ÍNDICE DE PREPARACIÓN CLOUD      ');
  console.log('=====================================================\n');

  // -----------------------------------------------------------------
  // CASO 1: PROYECTO "BUENO"
  // -----------------------------------------------------------------
  console.log('--- CASO 1: PROYECTO "BUENO" ---');
  const goodPaths = [
    'README.md',
    '.env.example',
    'src/index.ts',
    'src/app.ts',
    'package.json',
    'package-lock.json',
    'tests/app.test.ts',
    '.eslintrc.json',
    '.prettierrc',
    'tsconfig.json',
    'Dockerfile',
    'docker-compose.yml',
    '.dockerignore',
    '.gitignore',
    '.github/workflows/ci.yml',
  ];

  const goodFiles: ProjectFile[] = [
    {
      path: 'README.md',
      content: `# Sistema Corporativo Cloud
## Instalación y ejecución
Para instalar las dependencias:
\`\`\`bash
npm install
npm run dev
\`\`\`
Ejecutar con Docker:
\`\`\`bash
docker compose up
\`\`\`
`,
    },
    {
      path: '.env.example',
      content: 'PORT=3000\nDATABASE_URL=postgres://user:password@localhost:5432/db\nNODE_ENV=production\n',
    },
    {
      path: 'src/index.ts',
      content: `import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running on port', port));
`,
    },
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: 'empresa-cloud-app',
          scripts: {
            test: 'vitest run',
            build: 'tsc -b && vite build',
          },
          dependencies: {
            express: '^4.19.2',
          },
          devDependencies: {
            vitest: '^1.5.0',
            eslint: '^8.57.0',
            prettier: '^3.2.5',
            typescript: '^5.4.5',
          },
        },
        null,
        2
      ),
    },
    {
      path: 'package-lock.json',
      content: '{"name": "empresa-cloud-app", "lockfileVersion": 3}',
    },
    {
      path: 'Dockerfile',
      content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
`,
    },
    {
      path: '.dockerignore',
      content: 'node_modules\n.env\ndist\ncoverage\n',
    },
    {
      path: '.gitignore',
      content: 'node_modules\n.env\n.env.local\ndist\ncoverage\n.DS_Store\n',
    },
    {
      path: 'tsconfig.json',
      content: '{"compilerOptions": {"target": "ES2022", "module": "NodeNext"}}',
    },
  ];

  const goodResult = computeReadinessScore({
    paths: goodPaths,
    files: goodFiles,
    isDocument: false,
    hasBackendOrDb: true,
  });

  console.log(`Puntaje obtenido: ${goodResult.score}/100`);
  console.log(`Estado: ${goodResult.status}`);
  console.log(`Estrategia: ${goodResult.strategy.id} (${goodResult.strategy.label})`);
  console.log(`Fortalezas: ${goodResult.strengths.length}`);
  console.log(`Hallazgos: ${goodResult.findings.length}`);
  const passCase1 = goodResult.score >= 90 && goodResult.status === 'ready';
  console.log(`Resultado Caso 1: ${passCase1 ? 'PASÓ (score >= 90, ready)' : 'FALLÓ'}\n`);

  // -----------------------------------------------------------------
  // CASO 2: PROYECTO "MALO"
  // -----------------------------------------------------------------
  console.log('--- CASO 2: PROYECTO "MALO" ---');
  const badPaths = ['index.js', 'package.json', '.env'];
  const badFiles: ProjectFile[] = [
    {
      path: 'index.js',
      content: `const express = require('express');
const app = express();
app.listen(8080);
`,
    },
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: 'insecure-app',
          dependencies: {
            express: '*',
          },
        },
        null,
        2
      ),
    },
    {
      path: '.env',
      content: 'AWS_ACCESS_KEY_ID=AKIA9876543210ZYXWVU\nDATABASE_PASSWORD=production_secret_key_12345\n',
    },
  ];

  const badResult = computeReadinessScore({
    paths: badPaths,
    files: badFiles,
    isDocument: false,
    hasBackendOrDb: true,
  });

  const secrets = scanSecrets(badFiles);
  const criticalFindings = badResult.findings.filter((f) => f.severity === 'critical');

  console.log(`Puntaje obtenido: ${badResult.score}/100`);
  console.log(`Estado: ${badResult.status}`);
  console.log(`Secretos detectados en código: ${secrets.length}`);
  secrets.forEach((s) => console.log(`  - ${s.ruleName} en ${s.file}:${s.lineNumber} -> ${s.maskedValue}`));
  console.log(`Hallazgos Críticos: ${criticalFindings.length}`);
  criticalFindings.forEach((f) => console.log(`  - [${f.severity.toUpperCase()}] ${f.title}`));
  const passCase2 =
    badResult.score < 30 &&
    badResult.status === 'needs-preparation' &&
    criticalFindings.some((f) => f.title.includes('Credencial expuesta') || f.title.includes('secreto')) &&
    criticalFindings.some((f) => f.id.includes('real-env'));
  console.log(`Resultado Caso 2: ${passCase2 ? 'PASÓ (score < 30, needs-preparation, 2+ critical findings)' : 'FALLÓ'}\n`);

  // -----------------------------------------------------------------
  // CASO 3: DOCUMENTO .MD
  // -----------------------------------------------------------------
  console.log('--- CASO 3: DOCUMENTO .MD ---');
  const docText = `# Arquitectura Portal Cloud
Sistema web empresarial que incluye Dockerfile para despliegue y pruebas automatizadas con vitest y jest.
Integración continua mediante pipelines de CI en GitHub Actions. Documentación en README.
`;

  const docFiles: ProjectFile[] = [
    {
      path: 'arquitectura.md',
      content: docText,
    },
  ];

  const docResult = computeReadinessScore({
    paths: [],
    files: docFiles,
    isDocument: true,
    docText,
    hasBackendOrDb: true,
  });

  const secDim = docResult.dimensions.find((d) => d.id === 'security');
  const allSecNonVerifiable = secDim?.checks.every((c) => !c.passed && c.evidence === 'No verificable');

  console.log(`Puntaje obtenido: ${docResult.score}/100`);
  console.log(`Confianza: ${docResult.confidence}`);
  console.log(`Es estimado (isEstimated): ${docResult.isEstimated}`);
  console.log(`Seguridad no verificable: ${allSecNonVerifiable}`);
  secDim?.checks.forEach((c) => console.log(`  - ${c.label}: passed=${c.passed}, evidencia="${c.evidence}"`));

  const passCase3 = docResult.confidence === 'low' && docResult.isEstimated === true && allSecNonVerifiable;
  console.log(`Resultado Caso 3: ${passCase3 ? 'PASÓ (confidence: low, isEstimated: true, seguridad no verificable)' : 'FALLÓ'}\n`);

  console.log('=====================================================');
  console.log(`RESUMEN GLOBAL: ${passCase1 && passCase2 && passCase3 ? 'TODOS LOS CASOS PASARON EXITOSAMENTE (3/3)' : 'HAY CASOS FALLIDOS'}`);
  console.log('=====================================================');

  return {
    case1: { passed: passCase1, score: goodResult.score, status: goodResult.status },
    case2: { passed: passCase2, score: badResult.score, status: badResult.status, criticalCount: criticalFindings.length },
    case3: { passed: passCase3, confidence: docResult.confidence, isEstimated: docResult.isEstimated },
  };
}

// Ejecución directa si se invoca con tsx o node
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('__checks__')) {
  runChecks();
}
