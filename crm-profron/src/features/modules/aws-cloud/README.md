# CloudOps Dashboard — Sistema web para la planificación y visualización de una solución Cloud

## 1. Descripción del Proyecto

### El Problema
Antes de migrar sistemas críticos a Amazon Web Services (AWS), las organizaciones enfrentan incertidumbre técnica y financiera: sobredimensionamiento de infraestructura, falta de visibilidad del modelo de responsabilidad compartida de seguridad, presupuestos impredecibles y topologías de red complejas que no contemplan alta disponibilidad Multi-AZ desde el día cero.

### La Solución
**CloudOps Dashboard** es una plataforma web frontend interactiva orientada a la planificación arquitectónica, estimación económica y validación de seguridad de soluciones en AWS. Opera con datos simulados y reactivos sin requerir credenciales reales de AWS ni incurrir en costos de nube, permitiendo a arquitectos, analistas y decisores diseñar, cotizar y visualizar su infraestructura corporativa en tiempo real.

---

## 2. Tecnologías Utilizadas

Basado en las dependencias oficiales del proyecto (`package.json`):

| Tecnología / Biblioteca | Versión | Uso en el Módulo |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Biblioteca base para la interfaz reactiva y componentes funcionales. |
| **React DOM** | `^19.2.8` | Renderizado web en el árbol DOM. |
| **TypeScript** | `~6.0.2` | Tipado estático estricto para modelos cloud, servicios y contratos de estado. |
| **Vite** | `^8.2.2` | Bundler de ultra-alta velocidad y entorno de desarrollo local. |
| **React Router DOM** | `^7.18.3` | Enrutamiento SPA dinámico para los 7 módulos del sector AWS. |
| **Lucide React** | `^1.39.0` | Conjunto consistente de iconografía vectorial sin emojis. |
| **@amcharts/amcharts5** | `^5.21.0` | Motor gráfico para la esfera orbital 3D interactiva de la infraestructura global. |
| **@amcharts/amcharts5-geodata** | `^5.1.6` | Coordenadas vectoriales de geolocalización mundial (`worldLow`). |
| **Three.js** | `^0.186.1` | Renderizado 3D WebGL complementario. |
| **FossFLOW** | *MIT License* | Editor de diagramas y topologías isométricas (integración en pestaña Diseñar mi arquitectura). |
| **Vanilla CSS & Tokens** | *Estándar* | Diseño responsive fluido, variables de color y breakpoints adaptativos. |

---

## 3. Instalación y Ejecución

### Requisitos Previos
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior

### Comandos de Ejecución
Desde la raíz del repositorio frontend (`crm-profron`):

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar entorno de desarrollo local
npm run dev

# 3. Compilar bundle de producción / Verificación TypeScript
npm run build
# o alternativamente:
npx tsc --noEmit
```

### Ruta de Acceso
- **URL Base Local**: `http://localhost:5173/`
- **Ruta Directa al Módulo AWS**: `http://localhost:5173/modules/aws/dashboard`
- **Navegación desde el portal**: Desde el `Portal de Cursos` o el menú de módulos, selecciona **AWS Cloud / CloudOps**.

---

## 4. Funcionalidades por Módulo

### 1. Dashboard (`/modules/aws/dashboard`)
Panel de mando unificado con KPIs en tiempo real (Costo Mensual con proyección anual, Servicios en Solución, Región y Postura de Seguridad). Incluye un widget donut de distribución porcentual de costos por categoría y accesos rápidos directos a los pasos del flujo arquitectónico.

### 2. Planificación Cloud (`/modules/aws/planning`)
Herramienta de definición de alcance donde se registra la propuesta comercial: nombre de solución, tipo de aplicación, región primaria, número de usuarios concurrentes, nivel de SLA (hasta 99.99%) y metas de modernización. Sincroniza automáticamente los servicios seleccionados con toda la suite.

### 3. Costos y Economía Cloud (`/modules/aws/costs`)
Calculadora interactiva de costos operacionales basada en precios unitarios de AWS (computación por hora, almacenamiento por GB-mes, transferencia y solicitudes). Permite modelar escenarios de 730 horas/mes, vaciar cotizaciones, exportar resúmenes y sincronizar partidas con la propuesta activa.

### 4. Infraestructura Global (`/modules/aws/infrastructure`)
Globo terráqueo orbital 3D interactivo que mapea las regiones geográficas mundiales de AWS y sus Zonas de Disponibilidad (AZs). Presenta el estado de cada región ("En uso", "Requiere revisión" o "Disponible") sincronizado con un grid de tarjetas técnicas de región.

### 5. Seguridad e IAM (`/modules/aws/security`)
Evaluador de postura de seguridad (0 a 100 puntos) con colorimetría semafórica. Implementa la Matriz de Responsabilidad Compartida (seguridad *DE* la nube vs. *EN* la nube), catálogo de certificaciones oficiales consultables en AWS Artifact, interruptores reales de controles IAM y diseño arquitectónico basado en el principio de menor privilegio.

### 6. Arquitectura de Red (`/modules/aws/network`)
Diagrama interactivo de topología en Amazon VPC que traza el flujo perimetral desde Internet Público, Route 53, CloudFront CDN e Internet Gateway (IGW) hacia la Subred Pública (Application Load Balancer y NAT Gateway) y Subredes Privadas distribuidas en arquitectura Multi-AZ (AZ-a y AZ-b para EC2 y RDS). Incluye simulador paso a paso del flujo de paquetes e inspector lateral sticky.

### 7. Catálogo de Servicios AWS (`/modules/aws/services`)
Explorador técnico de los servicios fundamentales de AWS con filtros por categoría con contador, buscador en tiempo real, especificación de función principal (`mainFunction`), SLA de disponibilidad, tarifas por unidad y modales de ficha técnica detallada con botón de aprovisionamiento en un clic.

---

## 5. Arquitectura del Código

### Estructura de Carpetas (`src/features/modules/aws-cloud/`)

```text
aws-cloud/
├── components/                  # Componentes específicos y tarjetas del módulo
│   ├── AwsAiRegionAdvisor.tsx   # Panel lateral de asesoría asistida por IA
│   ├── AwsCostCalculator.tsx    # Calculadora de precios y distribución de costos
│   ├── AwsNetworkDiagram.tsx    # Diagrama de topología de red interactivo en VPC
│   ├── AwsRegionMap.tsx         # Globo terráqueo 3D amCharts con regiones AWS
│   ├── AwsSecurityMatrix.tsx    # Matriz de responsabilidad y controles de seguridad
│   ├── AwsServiceCard.tsx       # Tarjeta de servicio del catálogo con modal de ficha
│   ├── CostCard.tsx             # Tarjeta de métrica de costos
│   ├── RegionCard.tsx           # Tarjeta de región con estado y botón de asignación
│   ├── SecurityCard.tsx         # Tarjeta de control de seguridad con toggle real
│   ├── StatCard.tsx             # Tarjeta genérica de KPI con drill-down
│   └── StatusBadge.tsx          # Badge de estado semafórico uniforme
├── context/
│   └── AwsContext.tsx           # Fuente única de verdad global y estado persistente
├── data/
│   ├── awsCostsPresets.ts       # Valores iniciales y presets de costos
│   ├── awsDemoData.ts           # Datos de demostración de la propuesta y servicios
│   ├── awsRegionsData.ts        # Catálogo de 11 regiones mundiales de AWS
│   └── awsServicesData.ts       # Catálogo maestro de servicios AWS con precios
├── layout/
│   ├── AwsHeader.tsx            # Barra superior con selector de región, IA y menú
│   ├── AwsLayout.css            # Estilos del layout, responsive drawer y header
│   ├── AwsLayout.tsx            # Contenedor estructural principal
│   └── AwsSidebar.tsx           # Navegación lateral con Cargar Demo y Limpiar Todo
├── pages/
│   ├── AwsCosts.tsx             # Página de Costos y Economía Cloud
│   ├── AwsDashboard.tsx         # Página principal de Dashboard
│   ├── AwsInfrastructure.tsx    # Página de Infraestructura Global
│   ├── AwsNetwork.tsx           # Página de Arquitectura de Red
│   ├── AwsPlanning.tsx          # Página de Planificación Cloud
│   ├── AwsSecurity.tsx          # Página de Seguridad e IAM
│   └── AwsServicesCatalog.tsx   # Página de Catálogo de Servicios AWS
├── types/
│   └── awsTypes.ts              # Interfaces TypeScript compartidas
├── aws.css                      # Reglas de estilo globales del sector y responsive
└── README.md                    # Documentación técnica del módulo
```

### AwsContext — Fuente Única de Verdad
El estado completo del sector se gestiona a través de `AwsContext.tsx`. Garantiza que ninguna página duplique información:
- **Estado Maestro**: Almacena `proposal` (propuesta activa), `services` (códigos de servicios incluidos), `costItems` (partidas cotizadas) y `securityControls` (flags de seguridad).
- **Valores Derivados**: `totalMonthlyCost`, `totalAnnualCost`, `securityScore`, `region`, `deployedServices` y `slaPercent` se computan dinámicamente mediante `useMemo` sin escrituras redundantes.
- **Persistencia Aislada en localStorage**:
  - `crm_aws_proposal`: Propuesta actual.
  - `crm_aws_services`: Arreglo de servicios en solución.
  - `crm_aws_cost_items`: Partidas de la calculadora.
  - `crm_aws_security`: Interruptores de controles de seguridad.
  *Al ejecutar "Limpiar Todo", únicamente se eliminan las claves con el prefijo `crm_aws_`, protegiendo el resto del CRM.*

---

## 6. Componentes Reutilizables

1. **`StatusBadge`**: Etiqueta visual de estado con variantes (`success`, `warning`, `danger`, `neutral`, `info`) y tamaños configurables.
2. **`StatCard` (`AwsStatCard`)**: Muestra métricas clave con valor numérico, subtítulo descriptivo, badge, icono y soporte para modales drill-down.
3. **`AwsServiceCard`**: Representa un servicio del catálogo; muestra categoría, descripción, función principal, precio por unidad, `StatusBadge` y botones de "Añadir/Quitar" y "Ficha técnica".
4. **`CostCard`**: Card de costo con desglose mensual/anual, indicador de categoría y botón de eliminación.
5. **`SecurityCard`**: Interruptor de control de seguridad con toggle real (track + thumb), puntaje ponderado, descripción activa/inactiva y validación de servicio aplicable.
6. **`RegionCard`**: Card de región geográfica con código, ubicación física, conteo de AZs, servicios desplegados y botón reactivo para asignarla como región de la propuesta.
7. **`AwsSidebar`**: Barra lateral fija en escritorio y drawer modal animado en dispositivos móviles con accesos directos y controles de entorno ("Limpiar Todo" y "Cargar Demo").
8. **`AwsHeader`**: Encabezado responsive con botón hamburguesa en móviles, breadcrumb inteligente, selector dropdown de regiones AWS, botón de asistente IA y perfil.
9. **`AwsNetworkDiagram`**: Tablero visual de topología con representación de subredes públicas, privadas y Multi-AZ, con inspector lateral adaptable.
10. **`AwsRegionMap`**: Componente de integración con amCharts 5 para la visualización del globo terráqueo y pines de latencia de regiones.
11. **`AwsCostCalculator`**: Motor de cotización por cargas de trabajo y distribución gráfica de presupuesto cloud.
12. **`AwsSecurityMatrix`**: Tabla interactiva de responsabilidad compartida entre AWS y el cliente según dominios CIS/Well-Architected.

---

## 7. Paleta de Colores Corporativa

Paleta de diseño estricta basada en el sistema de diseño CloudOps:

| Nombre | Código Hex | Uso en la Aplicación |
| :--- | :--- | :--- |
| **Fondo Principal** | `#F8FAFC` | Fondo de página general (Slate 50). |
| **Sidebar** | `#0F172A` | Barra de navegación lateral y menús oscuros (Slate 900). |
| **Color Principal** | `#2563EB` | Botones primarios, enlaces activos, branding y acentos (Blue 600). |
| **Seguridad / Éxito** | `#16A34A` | Estados "En uso", "Cumplido", postura verde >= 80 (Green 600). |
| **Costos / Advertencia**| `#F59E0B` | Costos, postura ámbar 40–79, estados "Requiere revisión" (Amber 500).|
| **Alertas / Error** | `#DC2626` | Acciones de borrado, estados "En riesgo", postura roja < 40 (Red 600).|
| **Texto Principal** | `#1E293B` | Títulos, encabezados y cifras destacadas (Slate 800). |
| **Texto Secundario** | `#64748B` | Subtítulos, labels y descripciones de contexto (Slate 500). |
| **Bordes** | `#E2E8F0` | Líneas divisorias, bordes de cards e inputs (Slate 200). |
| **Cards** | `#FFFFFF` | Contenedores de contenido y tarjetas modulares (White). |

---

## 8. Capturas del Sistema

Estructura de capturas disponibles en la carpeta `docs/capturas/`:

| Módulo / Vista | Archivo |
| :--- | :--- |
| **Dashboard Principal** | ![Dashboard](docs/capturas/01-dashboard.png) |
| **Planificación Cloud** | ![Planificación](docs/capturas/02-planificacion.png) |
| **Costos y Calculadora** | ![Costos](docs/capturas/03-costos.png) |
| **Infraestructura Global** | ![Infraestructura](docs/capturas/04-infraestructura.png) |
| **Seguridad e IAM** | ![Seguridad](docs/capturas/05-seguridad.png) |
| **Arquitectura de Red** | ![Red](docs/capturas/06-red.png) |
| **Catálogo de Servicios** | ![Catálogo](docs/capturas/07-catalogo.png) |
| **Vista Responsive Móvil** | ![Responsive](docs/capturas/08-responsive.png) |

---

## 9. Nota de Referencia de Precios

> **Aviso Importante**: Los precios presentados en este simulador corresponden a valores referenciales basados en la región de referencia de AWS EE. UU. Este (N. Virginia, `us-east-1`) bajo el modelo bajo demanda. Para obtener cotizaciones oficiales de producción sujetas a acuerdos empresariales y variaciones por región, consulta la herramienta oficial [AWS Pricing Calculator](https://calculator.aws).
