import type { AnalyzerInput, AnalysisResult } from '../types/awsTypes';
import { readProjectInput } from '../utils/projectReaders';
import { detectStackFromFiles } from '../utils/stackDetector';

/**
 * Contrato unificado del servicio de análisis de proyectos.
 * La interfaz de usuario SOLO interactúa con este contrato.
 */
export interface AnalyzerService {
  analyze(input: AnalyzerInput): Promise<AnalysisResult>;
}

/**
 * Implementación local en el navegador (Zero-Server / Client-Side).
 * Lee los archivos usando JSZip o APIs públicas y ejecuta las reglas en local.
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
 * Instancia activa del servicio.
 */
export const analyzerService: AnalyzerService = localAnalyzer;

/* =========================================================================
 * ARQUITECTURA PREPARADA PARA BACKEND FUTURO:
 *
 * Para conectar un backend en el futuro sin modificar la interfaz de usuario,
 * se crearía un `remoteAnalyzer` que consuma un endpoint REST o microservicio
 * manteniendo el mismo contrato `AnalyzerService`:
 *
 * export const remoteAnalyzer: AnalyzerService = {
 *   async analyze(input: AnalyzerInput): Promise<AnalysisResult> {
 *     const formData = new FormData();
 *     formData.append('kind', input.kind);
 *
 *     if (input.kind === 'zip') {
 *       formData.append('file', input.file);
 *     } else if (input.kind === 'github') {
 *       formData.append('url', input.url);
 *     } else if (input.kind === 'document') {
 *       if ('text' in input.file) {
 *         formData.append('text', input.file.text);
 *       } else {
 *         formData.append('file', input.file);
 *       }
 *     }
 *
 *     const response = await fetch('/api/v1/aws-analyzer/inspect', {
 *       method: 'POST',
 *       body: formData,
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Error del servidor al analizar proyecto (${response.status})`);
 *     }
 *
 *     return (await response.json()) as AnalysisResult;
 *   },
 * };
 *
 * // Para conmutar de local a backend remoto:
 * // export const analyzerService: AnalyzerService = remoteAnalyzer;
 * ========================================================================= */
