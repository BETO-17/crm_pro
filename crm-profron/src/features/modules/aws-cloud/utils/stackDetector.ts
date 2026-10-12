import type {
  DetectedTech,
  ServiceRecommendation,
  UnsupportedTech,
  AnalysisResult,
} from '../types/awsTypes';
import { awsServicesCatalog } from '../data/awsServicesData';
import type { ProjectFile } from './projectReaders';

// Catálogo de IDs válidos para verificación
const VALID_SERVICE_IDS = new Set(awsServicesCatalog.map((s) => s.id));

interface TechRule {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'storage' | 'container' | 'other';
  matchers: {
    // Coincidencias en archivos de dependencias o configuración
    keywords: string[];
    filenames?: string[];
  };
  recommends: Array<{
    serviceId: string;
    reason: string;
  }>;
  unsupported?: Array<{
    name: string;
    suggestedAwsService: string;
    note: string;
  }>;
}

const TECH_RULES: TechRule[] = [
  // --- FRONTEND ESTÁTICO ---
  {
    id: 'rule-react',
    name: 'React',
    category: 'frontend',
    matchers: { keywords: ['"react"', "'react'", 'react:', 'react@', 'react'] },
    recommends: [
      {
        serviceId: 'srv-s3',
        reason: 'Sitio estático: S3 aloja los archivos compilados del bundle frontend.',
      },
      {
        serviceId: 'srv-cloudfront',
        reason: 'Distribución perimetral: CloudFront distribuye el sitio con baja latencia y caché global.',
      },
    ],
  },
  {
    id: 'rule-vue',
    name: 'Vue.js',
    category: 'frontend',
    matchers: { keywords: ['"vue"', "'vue'", 'vue:', 'vue@'] },
    recommends: [
      {
        serviceId: 'srv-s3',
        reason: 'Sitio estático: S3 aloja los archivos compilados del bundle SPA.',
      },
      {
        serviceId: 'srv-cloudfront',
        reason: 'Distribución perimetral: CloudFront distribuye el sitio con baja latencia y caché global.',
      },
    ],
  },
  {
    id: 'rule-angular',
    name: 'Angular',
    category: 'frontend',
    matchers: { keywords: ['@angular/core', '"@angular/core"'] },
    recommends: [
      {
        serviceId: 'srv-s3',
        reason: 'Sitio estático: S3 aloja los archivos compilados del bundle SPA.',
      },
      {
        serviceId: 'srv-cloudfront',
        reason: 'Distribución perimetral: CloudFront distribuye el sitio con baja latencia y caché global.',
      },
    ],
  },
  {
    id: 'rule-svelte',
    name: 'Svelte',
    category: 'frontend',
    matchers: { keywords: ['"svelte"', "'svelte'", 'svelte:'] },
    recommends: [
      {
        serviceId: 'srv-s3',
        reason: 'Sitio estático: S3 aloja los archivos HTML, CSS y JS compilados.',
      },
      {
        serviceId: 'srv-cloudfront',
        reason: 'Distribución perimetral: CloudFront distribuye el sitio con baja latencia y caché global.',
      },
    ],
  },
  {
    id: 'rule-vite',
    name: 'Vite',
    category: 'frontend',
    matchers: { keywords: ['"vite"', "'vite'", 'vite:'] },
    recommends: [
      {
        serviceId: 'srv-s3',
        reason: 'Sitio estático: S3 aloja los activos web estáticos generados por el build.',
      },
      {
        serviceId: 'srv-cloudfront',
        reason: 'Distribución perimetral: CloudFront distribuye el sitio con baja latencia y compresión Brotli/Gzip.',
      },
    ],
  },

  // --- FRONTEND SSR ---
  {
    id: 'rule-nextjs',
    name: 'Next.js',
    category: 'frontend',
    matchers: { keywords: ['"next"', "'next'", 'nextjs', 'next:'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Requiere servidor para renderizado del lado del servidor (SSR) y rutas de API.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceo de carga: ALB distribuye el tráfico web entrante hacia el clúster Node.js.',
      },
      {
        serviceId: 'srv-s3',
        reason: 'Almacenamiento de assets estáticos y archivos multimedia generados.',
      },
    ],
  },
  {
    id: 'rule-nuxtjs',
    name: 'Nuxt',
    category: 'frontend',
    matchers: { keywords: ['"nuxt"', "'nuxt'", 'nuxtjs', 'nuxt:'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Requiere servidor para renderizado del lado del servidor (SSR) en Node.js.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceo de carga: ALB distribuye el tráfico web entrante hacia las instancias.',
      },
    ],
  },

  // --- BACKEND ---
  {
    id: 'rule-express',
    name: 'Express',
    category: 'backend',
    matchers: { keywords: ['"express"', "'express'", 'express:'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para alojar el runtime de Node.js y la API REST.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para alta disponibilidad y terminación SSL.',
      },
    ],
  },
  {
    id: 'rule-nestjs',
    name: 'NestJS',
    category: 'backend',
    matchers: { keywords: ['@nestjs/core', '"@nestjs/core"'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para alojar el runtime de NestJS modular.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para distribución HTTP/HTTPS.',
      },
    ],
  },
  {
    id: 'rule-fastify',
    name: 'Fastify',
    category: 'backend',
    matchers: { keywords: ['"fastify"', "'fastify'", 'fastify:'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para alojar la API de alta velocidad.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para balanceo y redundancia Multi-AZ.',
      },
    ],
  },
  {
    id: 'rule-django',
    name: 'Django',
    category: 'backend',
    matchers: { keywords: ['django', 'django==', 'django>=', 'django~='] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para ejecutar WSGI/ASGI (Gunicorn/Uvicorn).',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para distribución HTTP/HTTPS y terminación TLS.',
      },
    ],
  },
  {
    id: 'rule-flask',
    name: 'Flask',
    category: 'backend',
    matchers: { keywords: ['flask', 'flask==', 'flask>='] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para alojar la aplicación Python.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para soportar múltiples instancias.',
      },
    ],
  },
  {
    id: 'rule-fastapi',
    name: 'FastAPI',
    category: 'backend',
    matchers: { keywords: ['fastapi', 'fastapi==', 'fastapi>=', 'uvicorn'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para ejecutar el worker asíncrono Uvicorn.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para balancear peticiones a la API.',
      },
    ],
  },
  {
    id: 'rule-laravel',
    name: 'Laravel',
    category: 'backend',
    matchers: { keywords: ['laravel/framework', '"laravel/framework"', 'laravel'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para ejecutar PHP-FPM / Nginx.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para balanceo y redundancia.',
      },
    ],
  },
  {
    id: 'rule-springboot',
    name: 'Spring Boot',
    category: 'backend',
    matchers: { keywords: ['spring-boot', 'org.springframework.boot'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para la JVM y el contenedor de aplicaciones embebido.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para tráfico hacia instancias Java.',
      },
    ],
  },
  {
    id: 'rule-gin',
    name: 'Gin (Go)',
    category: 'backend',
    matchers: { keywords: ['github.com/gin-gonic/gin'] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para binario compilado de Go de alto desempeño.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para distribuir peticiones concurrentes.',
      },
    ],
  },
  {
    id: 'rule-rails',
    name: 'Ruby on Rails',
    category: 'backend',
    matchers: { keywords: ['"rails"', "'rails'", 'gem "rails"', "gem 'rails'"] },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Servidor virtual EC2 para ejecutar Puma y el backend Rails.',
      },
      {
        serviceId: 'srv-alb',
        reason: 'Balanceador de carga (ALB) para escalabilidad horizontal.',
      },
    ],
  },

  // --- BASES DE DATOS RELACIONALES ---
  {
    id: 'rule-postgres',
    name: 'PostgreSQL',
    category: 'database',
    matchers: {
      keywords: ['psycopg2', 'psycopg2-binary', '"pg"', "'pg'", 'asyncpg', 'postgresql', 'postgres'],
    },
    recommends: [
      {
        serviceId: 'srv-rds',
        reason: 'Base de datos relacional administrada: RDS PostgreSQL Multi-AZ con backups automáticos.',
      },
    ],
  },
  {
    id: 'rule-mysql',
    name: 'MySQL',
    category: 'database',
    matchers: {
      keywords: ['mysql', 'mysql2', 'pymysql', '"mysql"', "'mysql2'"],
    },
    recommends: [
      {
        serviceId: 'srv-rds',
        reason: 'Base de datos relacional administrada: RDS MySQL Multi-AZ con réplicas de lectura.',
      },
    ],
  },

  // --- BASES DE DATOS NO RELACIONALES & CACHÉ (UNSUPPORTED) ---
  {
    id: 'rule-mongodb',
    name: 'MongoDB',
    category: 'database',
    matchers: { keywords: ['mongoose', '"mongodb"', "'mongodb'", 'pymongo'] },
    recommends: [],
    unsupported: [
      {
        name: 'MongoDB',
        suggestedAwsService: 'Amazon DocumentDB (compatible con MongoDB)',
        note: 'No disponible en este simulador.',
      },
    ],
  },
  {
    id: 'rule-redis',
    name: 'Redis',
    category: 'database',
    matchers: { keywords: ['redis', '"ioredis"', "'ioredis'", 'redis-py'] },
    recommends: [],
    unsupported: [
      {
        name: 'Redis',
        suggestedAwsService: 'Amazon ElastiCache for Redis',
        note: 'No disponible en este simulador.',
      },
    ],
  },

  // --- COLAS Y MENSAJERÍA ---
  {
    id: 'rule-queues',
    name: 'Colas y Mensajería (Celery/RabbitMQ/Kafka)',
    category: 'other',
    matchers: { keywords: ['celery', 'amqplib', 'pika', 'kafka', 'kafkajs'] },
    recommends: [
      {
        serviceId: 'srv-sqs',
        reason: 'Colas de mensajería asíncronas administradas con escalado automático.',
      },
    ],
    unsupported: [
      {
        name: 'Apache Kafka / RabbitMQ',
        suggestedAwsService: 'Amazon MSK (Managed Streaming for Kafka) / Amazon MQ',
        note: 'Servicio avanzado no disponible en el simulador; se recomienda SQS como alternativa.',
      },
    ],
  },

  // --- GESTIÓN DE ARCHIVOS / STORAGE ---
  {
    id: 'rule-file-uploads',
    name: 'Almacenamiento de Archivos',
    category: 'storage',
    matchers: {
      keywords: ['multer', 'boto3', '@aws-sdk/client-s3', 'django-storages', 'uploads', 'active_storage'],
    },
    recommends: [
      {
        serviceId: 'srv-s3',
        reason: 'Almacenamiento masivo: S3 aloja archivos subidos por usuarios y blobs persistentes.',
      },
    ],
  },

  // --- SERVERLESS ---
  {
    id: 'rule-serverless',
    name: 'Serverless Functions',
    category: 'other',
    matchers: {
      keywords: ['serverless.yml', 'serverless.yaml', '@aws-lambda', 'aws-lambda'],
      filenames: ['serverless.yml', 'serverless.yaml'],
    },
    recommends: [
      {
        serviceId: 'srv-lambda',
        reason: 'Ejecución sin servidor basada en eventos y funciones de microservicios.',
      },
    ],
  },

  // --- CONTENEDORES ---
  {
    id: 'rule-docker',
    name: 'Docker / Contenedores',
    category: 'container',
    matchers: {
      keywords: ['dockerfile', 'docker-compose', 'version:', 'services:'],
      filenames: ['dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
    },
    recommends: [
      {
        serviceId: 'srv-ec2',
        reason: 'Los contenedores pueden desplegarse en instancias EC2 con Docker Engine.',
      },
    ],
    unsupported: [
      {
        name: 'Docker Containers',
        suggestedAwsService: 'Amazon Elastic Container Service (ECS) o EKS',
        note: 'Puede desplegarse en EC2; Amazon ECS/EKS no está en el simulador.',
      },
    ],
  },
];

/**
 * Motor puro de detección de stack tecnológico a partir de archivos de proyecto.
 */
export function detectStackFromFiles(
  files: ProjectFile[],
  sourceLabel: string
): AnalysisResult {
  const detected: DetectedTech[] = [];
  const recommendationMap = new Map<string, { serviceId: string; reason: string; triggeredBy: Set<string> }>();
  const unsupportedList: UnsupportedTech[] = [];
  const warnings: string[] = [];

  const detectedTechIds = new Set<string>();

  // Analizar cada archivo frente a las reglas
  for (const file of files) {
    const filenameLower = file.path.split('/').pop()?.toLowerCase() || '';
    const contentLower = file.content.toLowerCase();

    for (const rule of TECH_RULES) {
      if (detectedTechIds.has(rule.id)) continue;

      let matched = false;
      let matchedSnippet = '';

      // 1. Chequeo por nombre de archivo específico si está indicado
      if (rule.matchers.filenames?.some((fn) => filenameLower === fn)) {
        matched = true;
        matchedSnippet = filenameLower;
      }

      // 2. Chequeo por palabras clave / dependencias en el contenido
      if (!matched) {
        for (const kw of rule.matchers.keywords) {
          const index = contentLower.indexOf(kw.toLowerCase());
          if (index !== -1) {
            matched = true;
            // Extraer un snippet de contexto (hasta 35 caracteres alrededor)
            const start = Math.max(0, index - 5);
            const end = Math.min(file.content.length, index + kw.length + 15);
            matchedSnippet = file.content.substring(start, end).replace(/\r?\n/g, ' ').trim();
            break;
          }
        }
      }

      // Si hubo coincidencia
      if (matched) {
        detectedTechIds.add(rule.id);
        detected.push({
          id: rule.id,
          name: rule.name,
          category: rule.category,
          evidence: {
            file: file.path,
            match: matchedSnippet || rule.name,
          },
        });

        // Registrar recomendaciones soportadas
        for (const rec of rule.recommends) {
          if (VALID_SERVICE_IDS.has(rec.serviceId)) {
            const existing = recommendationMap.get(rec.serviceId);
            if (existing) {
              existing.triggeredBy.add(rule.name);
            } else {
              recommendationMap.set(rec.serviceId, {
                serviceId: rec.serviceId,
                reason: rec.reason,
                triggeredBy: new Set([rule.name]),
              });
            }
          }
        }

        // Registrar servicios no soportados en el simulador
        if (rule.unsupported) {
          for (const uns of rule.unsupported) {
            if (!unsupportedList.some((u) => u.name === uns.name)) {
              unsupportedList.push(uns);
            }
          }
        }
      }
    }
  }

  // Si no se detectó nada
  if (detected.length === 0) {
    return {
      source: sourceLabel,
      filesAnalyzed: files.length,
      detected: [],
      recommendations: [],
      unsupported: [],
      suggestedAppType: 'Portal Web Empresarial',
      suggestedDescription: 'No encontramos archivos de configuración reconocibles.',
      warnings: ['No encontramos archivos de configuración reconocibles para generar sugerencias.'],
    };
  }

  // --- REGLAS TRANSVERSALES DE AWS OBLIGATORIAS ---
  // 1. VPC + IAM + CloudWatch: siempre que haya al menos una detección
  const allTriggeredNames = detected.map((d) => d.name).slice(0, 3);
  if (VALID_SERVICE_IDS.has('srv-vpc')) {
    const existing = recommendationMap.get('srv-vpc');
    if (!existing) {
      recommendationMap.set('srv-vpc', {
        serviceId: 'srv-vpc',
        reason: 'Base de toda arquitectura: red virtual aislada, subredes seguras y control de tráfico.',
        triggeredBy: new Set(allTriggeredNames),
      });
    }
  }

  if (VALID_SERVICE_IDS.has('srv-iam')) {
    const existing = recommendationMap.get('srv-iam');
    if (!existing) {
      recommendationMap.set('srv-iam', {
        serviceId: 'srv-iam',
        reason: 'Base de toda arquitectura: control de acceso granular y menor privilegio para recursos.',
        triggeredBy: new Set(allTriggeredNames),
      });
    }
  }

  if (VALID_SERVICE_IDS.has('srv-cloudwatch')) {
    const existing = recommendationMap.get('srv-cloudwatch');
    if (!existing) {
      recommendationMap.set('srv-cloudwatch', {
        serviceId: 'srv-cloudwatch',
        reason: 'Base de toda arquitectura: observabilidad, logs centralizados y alarmas de rendimiento.',
        triggeredBy: new Set(allTriggeredNames),
      });
    }
  }

  // 2. Route 53 si hay frontend o backend público
  const hasPublicFacing = detected.some((d) => d.category === 'frontend' || d.category === 'backend');
  if (hasPublicFacing && VALID_SERVICE_IDS.has('srv-route53')) {
    if (!recommendationMap.has('srv-route53')) {
      recommendationMap.set('srv-route53', {
        serviceId: 'srv-route53',
        reason: 'Enrutamiento del dominio público corporativo y resolución DNS de alta resiliencia.',
        triggeredBy: new Set(detected.filter((d) => d.category === 'frontend' || d.category === 'backend').map((d) => d.name)),
      });
    }
  }

  // Formatear recomendaciones finales
  const recommendations: ServiceRecommendation[] = Array.from(recommendationMap.values()).map((r) => ({
    serviceId: r.serviceId,
    reason: r.reason,
    triggeredBy: Array.from(r.triggeredBy),
  }));

  // Generar descripción y tipo sugeridos
  const frontNames = detected.filter((d) => d.category === 'frontend').map((d) => d.name);
  const backNames = detected.filter((d) => d.category === 'backend').map((d) => d.name);
  const dbNames = detected.filter((d) => d.category === 'database').map((d) => d.name);

  let suggestedDescription = 'Solución cloud';
  const parts: string[] = [];
  if (frontNames.length > 0) parts.push(`frontend en ${frontNames.join(', ')}`);
  if (backNames.length > 0) parts.push(`API backend en ${backNames.join(', ')}`);
  if (dbNames.length > 0) parts.push(`base de datos ${dbNames.join(', ')}`);

  if (parts.length > 0) {
    suggestedDescription = `Aplicación con ${parts.join(', ')}.`;
  } else {
    suggestedDescription = `Solución basada en ${detected.map((d) => d.name).join(', ')}.`;
  }

  let suggestedAppType: AnalysisResult['suggestedAppType'] = 'Portal Web Empresarial';
  if (backNames.length > 0 && frontNames.length === 0) {
    suggestedAppType = 'API REST / Backend';
  } else if (detected.some((d) => d.id === 'rule-serverless' || d.id === 'rule-queues')) {
    suggestedAppType = 'Microservicios Cloud';
  } else if (frontNames.length > 0 && backNames.length > 0) {
    suggestedAppType = 'Portal Web Empresarial';
  }

  return {
    source: sourceLabel,
    filesAnalyzed: files.length,
    detected,
    recommendations,
    unsupported: unsupportedList,
    suggestedAppType,
    suggestedDescription,
    warnings,
  };
}
