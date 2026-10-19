import JSZip from 'jszip';
import type { AnalyzerInput, Confidence } from '../types/awsTypes';

export interface ProjectFile {
  path: string;
  content: string;
}

export interface ProjectReadResult {
  projectName: string;
  paths: string[]; // TODAS las rutas del proyecto
  files: ProjectFile[]; // solo los archivos leídos
  confidence: Confidence;
  isEstimated: boolean;
  partialSecretScan: boolean;
  totalFiles: number;
}

// Directorios excluidos en todo el análisis
export const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'venv',
  '.venv',
  '__pycache__',
  'dist',
  'build',
  '.next',
  'vendor',
  'target',
  'coverage',
]);

// Extensiones de archivos binarios e imágenes a ignorar para lectura de contenido
const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'ico',
  'webp',
  'bmp',
  'tiff',
  'pdf',
  'zip',
  'gz',
  'tar',
  'bz2',
  'xz',
  '7z',
  'rar',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',
  'mp4',
  'mp3',
  'avi',
  'mov',
  'wmv',
  'mkv',
  'flv',
  'wav',
  'ogg',
  'exe',
  'dll',
  'so',
  'dylib',
  'bin',
  'iso',
  'img',
  'msi',
  'pyc',
  'pyo',
  'class',
  'o',
  'obj',
  'jar',
  'war',
  'ear',
]);

/**
 * Comprueba si una ruta pertenece a un directorio ignorado.
 */
export function isIgnoredPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i].toLowerCase();
    // Si cualquier segmento antes del nombre de archivo es ignorado
    if (i < segments.length - 1 && IGNORED_DIRS.has(seg)) {
      return true;
    }
    // Si el elemento es un directorio ignorado en la raíz
    if (segments.length === 1 && IGNORED_DIRS.has(seg)) {
      return true;
    }
  }

  return false;
}

/**
 * Determina si un archivo tiene extensión binaria.
 */
export function isBinaryFile(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase();
  return ext ? BINARY_EXTENSIONS.has(ext) : false;
}

/**
 * Extrae el nombre del proyecto desde package.json o el primer título de un documento.
 */
export function extractProjectName(files: ProjectFile[], fallbackName: string): string {
  // 1. Priorizar package.json
  const pkgFile = files.find((f) => /(^|\/)package\.json$/i.test(f.path));
  if (pkgFile) {
    try {
      const parsed = JSON.parse(pkgFile.content);
      if (parsed.name && typeof parsed.name === 'string' && parsed.name.trim()) {
        return parsed.name.trim();
      }
    } catch {
      // Ignorar error de parsing
    }
  }

  // 2. Priorizar primer título en documentos Markdown
  const docFile = files.find((f) => /\.(md|txt)$/i.test(f.path));
  if (docFile) {
    const titleMatch = docFile.content.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1].trim()) {
      return titleMatch[1].trim();
    }
  }

  return fallbackName;
}

/**
 * Lee un archivo ZIP completo en el navegador.
 * Obtiene las rutas de todo el árbol y extrae hasta 300 archivos de texto (<= 1MB).
 */
export async function readZipFile(file: File): Promise<ProjectReadResult> {
  const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
  if (file.size > MAX_SIZE) {
    throw new Error('El archivo ZIP excede el tamaño máximo permitido de 50 MB.');
  }

  if (!file.name.toLowerCase().endsWith('.zip')) {
    throw new Error('Formato no válido. Solo se admiten archivos comprimidos con extensión .zip.');
  }

  const zip = new JSZip();
  let zipData: JSZip;
  try {
    zipData = await zip.loadAsync(file);
  } catch {
    throw new Error('No se pudo leer el archivo ZIP. Asegúrate de que no esté corrupto ni protegido por contraseña.');
  }

  const allPaths: string[] = [];
  const textCandidates: Array<{ path: string; entry: JSZip.JSZipObject }> = [];

  for (const [relativePath, entry] of Object.entries(zipData.files)) {
    if (entry.dir) continue;
    if (isIgnoredPath(relativePath)) continue;

    allPaths.push(relativePath);

    // Filtrar candidatos a leer su contenido (archivos de texto, no binarios)
    if (!isBinaryFile(relativePath)) {
      textCandidates.push({ path: relativePath, entry });
    }
  }

  const MAX_FILES_TO_READ = 300;
  const filesToRead = textCandidates.slice(0, MAX_FILES_TO_READ);
  const projectFiles: ProjectFile[] = [];

  for (const { path: filePath, entry } of filesToRead) {
    try {
      const content = await entry.async('string');
      // Limitar a archivos de hasta 1 MB de texto decodificado
      if (content.length <= 1024 * 1024) {
        projectFiles.push({
          path: filePath,
          content,
        });
      }
    } catch {
      // Ignorar archivo si falla la decodificación de texto
    }
  }

  const fallbackName = file.name.replace(/\.zip$/i, '');
  const projectName = extractProjectName(projectFiles, fallbackName);
  const partialSecretScan = textCandidates.length > MAX_FILES_TO_READ;

  return {
    projectName,
    paths: allPaths,
    files: projectFiles,
    confidence: 'high',
    isEstimated: false,
    partialSecretScan,
    totalFiles: allPaths.length,
  };
}

/**
 * Parsea una URL de GitHub pública (soporta ramas opcionales /tree/<branch>).
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } {
  const cleanUrl = url.trim().replace(/\/$/, '');
  const regex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/;
  const match = cleanUrl.match(regex);

  if (!match) {
    throw new Error('Formato de URL no válido. Usa el formato: https://github.com/usuario/repositorio');
  }

  const owner = match[1];
  let repo = match[2];
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }
  const branch = match[3];

  return { owner, repo, branch };
}

// Lista de archivos prioritarios para descargar de GitHub (hasta 25)
const GITHUB_PRIORITY_PATTERNS = [
  // 1. Manifiestos
  /(^|\/)package\.json$/i,
  /(^|\/)requirements\.txt$/i,
  /(^|\/)pyproject\.toml$/i,
  /(^|\/)composer\.json$/i,
  /(^|\/)pom\.xml$/i,
  /(^|\/)go\.mod$/i,
  /(^|\/)build\.gradle(\.kts)?$/i,
  /(^|\/)Gemfile$/i,
  /(^|\/)Pipfile$/i,
  // 3. README
  /(^|\/)readme(\.(md|txt|rst))?$/i,
  // 4. Dockerfile
  /(^|\/)dockerfile(\.[a-z0-9_-]+)?$/i,
  // 5. Docker Compose
  /(^|\/)(docker-compose|compose)\.ya?ml$/i,
  // 6. .gitignore
  /(^|\/)\.gitignore$/i,
  // 7. .env y plantillas
  /(^|\/)\.env(\.(example|sample|template|local|production|development))?$/i,
  // 8. Archivos de configuración
  /(^|\/)(tsconfig\.json|vite\.config\.[jt]s|webpack\.config\.[jt]s|settings\.py|config\.[jt]s)$/i,
  // 9. Workflows de CI
  /\.github\/workflows\/.*\.ya?ml$/i,
  /(^|\/)(\.gitlab-ci\.yml|jenkinsfile|azure-pipelines\.ya?ml|bitbucket-pipelines\.ya?ml)$/i,
];

// Lockfiles que solo deben verificarse por ruta (NO descargar contenido)
const LOCKFILE_PATTERNS = [
  /(^|\/)package-lock\.json$/i,
  /(^|\/)yarn\.lock$/i,
  /(^|\/)pnpm-lock\.yaml$/i,
  /(^|\/)poetry\.lock$/i,
  /(^|\/)pipfile\.lock$/i,
  /(^|\/)composer\.lock$/i,
  /(^|\/)go\.sum$/i,
  /(^|\/)gemfile\.lock$/i,
];

function isLockfileOnly(path: string): boolean {
  return LOCKFILE_PATTERNS.some((regex) => regex.test(path));
}

function matchesGitHubPriority(path: string): boolean {
  if (isLockfileOnly(path)) return false; // Solo se verifica por ruta
  return GITHUB_PRIORITY_PATTERNS.some((regex) => regex.test(path));
}

/**
 * Consulta la API pública de GitHub.
 * Usa /git/trees/<rama>?recursive=1 para obtener TODAS las rutas en una llamada,
 * y descarga como máximo 25 archivos priorizados.
 */
export async function readGitHubRepo(url: string): Promise<ProjectReadResult> {
  const { owner, repo, branch: requestedBranch } = parseGitHubUrl(url);

  // 1. Obtener metadatos del repositorio para determinar la rama por defecto
  let targetBranch = requestedBranch;
  try {
    if (!targetBranch) {
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (repoRes.status === 404) {
        throw new Error('Repositorio no encontrado o privado. Solo repositorios públicos de GitHub son accesibles.');
      }
      if (repoRes.status === 403) {
        throw new Error('Límite de consultas a la API de GitHub alcanzado. Intenta de nuevo en unos minutos.');
      }
      if (!repoRes.ok) {
        throw new Error(`Error de GitHub (${repoRes.status}): No se pudo acceder al repositorio.`);
      }

      const repoData = await repoRes.json();
      targetBranch = repoData.default_branch || 'main';
    }
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes('Repositorio') || err.message.includes('Límite'))) {
      throw err;
    }
    throw new Error('No se pudo conectar con GitHub. Verifica tu conexión a internet.');
  }

  // 2. Obtener árbol completo de archivos en una sola llamada
  let treeItems: Array<{ path: string; type: string }>;
  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`
    );
    if (treeRes.status === 404) {
      throw new Error(`Rama '${targetBranch}' o repositorio no encontrado en GitHub.`);
    }
    if (treeRes.status === 403) {
      throw new Error('Límite de consultas a la API de GitHub alcanzado. Intenta de nuevo en unos minutos.');
    }
    if (!treeRes.ok) {
      throw new Error('No se pudo obtener el árbol de archivos del repositorio.');
    }
    const treeData = await treeRes.json();
    treeItems = treeData.tree || [];
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('GitHub')) {
      throw err;
    }
    throw new Error('No se pudo conectar con la API de GitHub.');
  }

  // Filtrar blobs no ignorados para obtener TODAS las rutas
  const allPaths = treeItems
    .filter((item) => item.type === 'blob' && !isIgnoredPath(item.path))
    .map((item) => item.path);

  // Seleccionar hasta 25 archivos prioritarios para descargar contenido
  const priorityPaths = allPaths.filter(matchesGitHubPriority).slice(0, 25);

  const projectFiles: ProjectFile[] = [];
  const downloads = priorityPaths.map(async (filePath) => {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${targetBranch}/${filePath}`;
      const res = await fetch(rawUrl);
      if (res.ok) {
        const text = await res.text();
        if (text.length <= 1024 * 1024) {
          projectFiles.push({
            path: filePath,
            content: text,
          });
        }
      }
    } catch {
      // Ignorar fallo de descarga de un archivo individual
    }
  });

  await Promise.all(downloads);

  const projectName = extractProjectName(projectFiles, repo);

  return {
    projectName,
    paths: allPaths,
    files: projectFiles,
    confidence: 'high',
    isEstimated: false,
    partialSecretScan: true, // Al descargar solo un subconjunto no se escanearon todos los archivos de código
    totalFiles: allPaths.length,
  };
}

/**
 * Lee un documento local (.md, .txt) o texto pegado.
 */
export async function readDocument(
  fileOrText: File | { name: string; text: string }
): Promise<ProjectReadResult> {
  let docName = 'documento.txt';
  let docContent = '';

  if ('text' in fileOrText && typeof fileOrText.text === 'string') {
    docName = fileOrText.name || 'especificacion.txt';
    docContent = fileOrText.text;
  } else {
    const file = fileOrText as File;
    const MAX_DOC_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_DOC_SIZE) {
      throw new Error('El documento supera el tamaño máximo permitido de 2 MB.');
    }

    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.md') && !ext.endsWith('.txt')) {
      throw new Error('Formato no válido. Solo se admiten archivos de texto .md o .txt.');
    }

    docName = file.name;
    try {
      docContent = await file.text();
    } catch {
      throw new Error('No se pudo leer el contenido del documento.');
    }
  }

  const projectFile: ProjectFile = {
    path: docName,
    content: docContent,
  };

  const projectName = extractProjectName([projectFile], docName.replace(/\.(md|txt)$/i, ''));

  return {
    projectName,
    paths: [],
    files: [projectFile],
    confidence: 'low',
    isEstimated: true,
    partialSecretScan: false,
    totalFiles: 1,
  };
}

/**
 * Lee cualquier fuente de entrada (ZIP, GitHub o Documento) y unifica la salida.
 */
export async function readProjectInput(input: AnalyzerInput): Promise<ProjectReadResult> {
  switch (input.kind) {
    case 'zip':
      return readZipFile(input.file);
    case 'github':
      return readGitHubRepo(input.url);
    case 'document':
      return readDocument(input.file);
    default:
      throw new Error('Tipo de entrada de proyecto desconocido.');
  }
}
