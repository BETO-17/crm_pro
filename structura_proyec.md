# Arquitectura y Estructura Completa del Proyecto: RetailMetrics 360

Este documento detalla de manera minuciosa y comentada la estructura integral del proyecto **RetailMetrics 360**, una solución CRM SaaS B2B orientada a la ingesta, observación, análisis comparativo y generación de estrategias sobre grandes volúmenes de datos retail.

---

## 1. Visión General del Ecosistema

El proyecto opera bajo una arquitectura de monorepo desacoplado compuesto por:
1. **Frontend (`crm-profron`)**: Aplicación SPA moderna desarrollada con React 19, TypeScript 6, Vite 8 y CSS Vanilla, estructurada mediante arquitectura *Feature-Based*.
2. **Backend (`crm-proback`)**: API REST de alto rendimiento basada en Python 3.11/3.12, FastAPI, SQLAlchemy 2.x, Pydantic v2 y Google Gemini GenAI SDK.
3. **Base de Datos & Almacenamiento**: PostgreSQL gestionado en la nube a través de **Supabase**, con soporte de lectura directa mediante `@supabase/supabase-js` y conexión transaccional vía SQLAlchemy.

```text
                                 ┌───────────────────────────────┐
                                 │   Frontend (React 19 + Vite)  │
                                 │          crm-profron          │
                                 └───────┬───────────────┬───────┘
                                         │               │
                     Lectura Directa de  │               │ Solicitudes REST /
                     Tablas y Datasets   │               │ Métricas y Auth
                                         ▼               ▼
                ┌─────────────────────────────┐    ┌───────────────────────────┐
                │     Supabase PostgreSQL     │◄───┤   Backend FastAPI (API)   │
                │  (Tables, Auth & Storage)   │    │        crm-proback        │
                └─────────────────────────────┘    └─────────────┬─────────────┘
                                                                 │
                                                                 ▼
                                                   ┌───────────────────────────┐
                                                   │    Google Gemini AI       │
                                                   │ (Modelos 2.5/Flash)       │
                                                   └───────────────────────────┘
```

---

## 2. Árbol Completo de Directorios Comentado

```text
crm_pro/
│
├── .gitignore                       # Configuración de exclusiones de Git para el monorepo
├── context_backend.md               # Documento con el contexto técnico del backend
├── structura_proyec.md              # [ESTE ARCHIVO] Especificación detallada de la arquitectura
│
├── crm-proback/                     # ================= BACKEND FASTAPI =================
│   ├── .env                         # Variables de entorno secretas (DB URL, JWT, Gemini, SMTP)
│   ├── .example.env                 # Plantilla de variables de entorno requeridas
│   ├── AGENTS.md                    # Reglas de desarrollo, principios y arquitectura del backend
│   ├── alembic.ini                  # Archivo de configuración de migraciones Alembic
│   ├── dockerfile                   # Configuración para despliegue en contenedor Docker
│   ├── requirements.txt             # Dependencias del backend (FastAPI, SQLAlchemy, pandas, etc.)
│   ├── reset_db.py                  # Script utilitario para reinicializar esquemas o tablas
│   ├── alembic/                     # Migraciones de base de datos relacional
│   │   ├── env.py                   # Script de conexión e introspección de modelos para Alembic
│   │   ├── README                   # Documentación interna de Alembic
│   │   └── script.py.mako           # Plantilla de generación de scripts de migración
│   │
│   └── app/                         # Código fuente principal de la aplicación FastAPI
│       ├── main.py                  # Punto de entrada, configuración de CORS, lifespan y rutas
│       │
│       ├── core/                    # Módulo central del sistema
│       │   ├── config.py            # Carga y validación de variables de entorno (pydantic-settings)
│       │   ├── database.py          # Configuración del Engine de SQLAlchemy y SessionLocal
│       │   ├── dependencies.py      # Inyección de dependencias de seguridad y usuario autenticado
│       │   └── security.py          # Funciones de hashing bcrypt y emisión/validación de JWT
│       │
│       ├── models/                  # Modelos relacionales ORM (SQLAlchemy Declarative)
│       │   ├── base.py              # Clase base declarativa compartida
│       │   ├── user.py              # Entidades User, UserWorkspace, UserSession (RBAC)
│       │   ├── workspace.py         # Entidad Workspace (aislamiento multi-tenant)
│       │   ├── dataset.py           # Metadatos de datasets, columnas y filas procesadas
│       │   ├── report.py            # Entidades de informes generados y planificados
│       │   ├── notification.py      # Notificaciones del sistema y alertas
│       │   ├── audit.py             # Registro de auditoría de acciones de usuarios
│       │   └── dashboard.py         # Configuraciones personalizadas de dashboard por analista
│       │
│       ├── schemas/                 # DTOs y validación de esquemas (Pydantic v2)
│       │   ├── auth.py              # Esquemas para login, verificación OTP y tokens
│       │   ├── user.py              # Esquemas para creación, actualización y lectura de usuarios
│       │   └── workspace.py         # Esquemas de entrada y salida para workspaces
│       │
│       ├── services/                # Capa de lógica de negocio
│       │   ├── gemini_service.py    # Integración con Google Gemini (SQL dinámico y comparativas)
│       │   ├── user.py              # Operaciones de negocio para gestión de usuarios
│       │   └── workspace.py         # Operaciones de negocio para gestión de espacios de trabajo
│       │
│       ├── api/                     # Capa de controladores y enrutamiento HTTP
│       │   └── v1/                  # Endpoints versión 1 de la API (/api/v1)
│       │       ├── auth.py          # Autenticación, envío de código OTP y validación JWT
│       │       ├── users.py         # CRUD de usuarios y asignación de roles
│       │       ├── workspaces.py    # Creación y administración de workspaces
│       │       ├── datasets.py      # Carga de archivos CSV, parsing con pandas e inserción en Supabase
│       │       └── analytics.py     # Endpoints de consulta AI (/chat) y comparativa de datasets (/compare)
│       │
│       └── utils/                   # Módulos utilitarios auxiliares
│           └── email.py             # Enlace con servidor SMTP para envío de correos con códigos OTP
│
└── crm-profron/                     # ================= FRONTEND REACT ==================
    ├── .env                         # Variables públicas del cliente Vite (Supabase URL, Anon Key, etc.)
    ├── AGENTS.md                    # Reglas de desarrollo, diseño y principios de UI del frontend
    ├── package.json                 # Dependencias (React 19, Lucide, Supabase-js) y scripts
    ├── tsconfig.json                # Configuración global del compilador TypeScript
    ├── tsconfig.app.json            # Configuración estricta de TypeScript para la aplicación
    ├── vite.config.ts               # Configuración del bundler Vite
    ├── eslint.config.js             # Reglas estrictas de linting para React y TypeScript
    ├── index.html                   # HTML base con fuentes y contenedor raíz `#root`
    │
    ├── public/                      # Archivos estáticos servidos directamente
    │
    └── src/                         # Código fuente TypeScript / TSX
        ├── main.tsx                 # Entrada de ejecución React, montaje en el DOM
        ├── App.tsx                  # Enrutador principal de vistas por estado, RBAC y sesión
        ├── index.css                # Variables de diseño globales (paleta HSL, tipografía, reset)
        ├── App.css                  # Estilos base de layout y contenedores principales
        │
        ├── lib/                     # Librerías y clientes de terceros
        │   └── supabaseClient.ts    # Inicialización del cliente Supabase mediante claves públicas
        │
        │--- ERP/

                  ---big data/
                  │        │
                  │        ├── types/                   # Definiciones de tipos TypeScript compartidos
                          │   └── index.ts             # Interfaces para User, Role, Workspace, Dataset, Activity, etc.
                          │
                          ├── components/              # Componentes comunes y de control de acceso
                          │   └── ProtectedRoute.tsx   # Wrapper para verificar autenticación y permisos de rol
                          │
                          ├── layouts/                 # Layouts envolventes por rol
                          │   ├── AdminLayout.tsx      # Sidebar, Topbar y estructura del panel de administración
                          │   ├── AdminLayout.css      # Estilos visuales del layout de administrador
                          │   ├── AnalystLayout.tsx    # Sidebar interactiva, perfil y navegación para analistas
                          │   └── AnalystLayout.css    # Estilos visuales del layout de analista
                          │
                          └── features/                # Arquitectura Feature-Based
                              │
                              ├── landing/             # Módulo público: Landing Page comercial
                              │   ├── LandingPage.tsx  # Vista unificada de la página de inicio
                              │   ├── landing.css      # Estilos premium, animaciones, gradientes y temas
                              │   └── components/      # Secciones individuales de la Landing
                              │       ├── LandingNavbar.tsx     # Barra de navegación con accesos directos
                              │       ├── HeroSection.tsx       # Sección principal de bienvenida y llamado a la acción
                              │       ├── DashboardPreview.tsx  # Demostración interactiva previa del panel
                              │       ├── ModulesSection.tsx    # Presentación de módulos clave de la plataforma
                              │       ├── PillarsSection.tsx    # Pilares tecnológicos y ventajas competitivas
                              │       ├── PricingSection.tsx    # Tabla comparativa de planes de suscripción
                              │       ├── TestimonialsSection.tsx# Reseñas de clientes empresariales
                              │       ├── FooterLanding.tsx     # Pie de página institucional y enlaces
                              │       ├── LoginModal.tsx        # Modal de inicio de sesión con flujo de código OTP
                              │       ├── AdminLoginModal.tsx   # Modal de inicio de sesión administrativo con OTP
                              │       └── WhatsAppBubble.tsx    # Botón flotante para contacto directo vía WhatsApp
                              │
                              ├── admin/               # Módulo privado: Panel de Control Administrativo
                              │   ├── admin.css        # Estilos compartidos para las vistas del administrador
                              │   └── pages/           # Vistas operativas del rol Admin
                              │       ├── GestionUsuarios.tsx   # Creación, edición, borrado y estado de usuarios
                              │       ├── AsignacionModulos.tsx # Activación/desactivación granular de permisos por usuario
                              │       ├── Workspaces.tsx        # Creación y administración de espacios multi-tenant
                              │       ├── Tendencias.tsx        # Visualización de métricas globales y volumen de actividad
                              │       └── CentroReportes.tsx    # Catálogo y control de reportes generados
                              │
                              └── analyst/             # Módulo privado: Espacio de Trabajo del Analista
                                  ├── analyst.css      # Estilos avanzados para tablas, KPIs, modal y chat AI
                                  └── pages/           # Vistas funcionales del flujo del analista
                                      ├── PerfilUsuario.tsx     # Configuración y visualización del perfil del usuario
                                      ├── CargaDatos.tsx        # Ingesta Drag & Drop de CSV hacia backend y Supabase
                                      ├── ObservacionDatos.tsx  # Exploración detallada de datos y consultas directas
                                      ├── ComparacionAnalisis.tsx# Comparativa multidimensional de tablas, precios y AI
                                      ├── AnalystWorkspaces.tsx # Exploración y filtrado de workspaces asignados
                                      └── Informes.tsx          # Exportación y gestión de informes analíticos
                  microsof asure/


                        carpetas 



```
>
---

## 3. Desglose Minucioso de Módulos Críticos

### 3.1 Backend (`crm-proback`)

#### `app/core/` (Infraestructura y Seguridad)
* **`config.py`**: Utiliza `pydantic-settings` para cargar y validar variables de entorno obligatorias como `DATABASE_URL`, `JWT_SECRET_KEY`, `GEMINI_API_KEY` y `CORS_ORIGINS`.
* **`database.py`**: Configura la conexión transaccional hacia el pooler de Supabase AWS PostgreSQL (`aws-0-us-west-2.pooler.supabase.com`) mediante SQLAlchemy 2.0 y genera la factoría de sesiones `get_db`.
* **`security.py`**: Implementa el cifrado de contraseñas mediante `pwd_context` (bcrypt) y la firma de tokens JWT (`encode_access_token`, `decode_access_token`) con expiración configurable.
* **`dependencies.py`**: Intercepta encabezados `Authorization: Bearer <token>`, valida la autenticidad del JWT y expone la dependencia `get_current_user` para proteger rutas.

#### `app/services/` (Reglas de Negocio)
* **`gemini_service.py`**:
  * Orquesta la conexión con Google Gemini (`genai.Client`).
  * `generate_sql_and_analysis`: Transforma preguntas en lenguaje natural en consultas SQL precisas basadas en el esquema de la tabla de Supabase.
  * `compare_datasets`: Realiza inferencia comparativa ejecutiva entre dos tablas de Supabase contrastando esquemas, distribuciones de precios, descuentos y volúmenes de venta.

#### `app/api/v1/` (Controladores HTTP)
* **`datasets.py`**:
  * `POST /datasets/upload`: Recibe archivos CSV vía `UploadFile`, normaliza nombres de columnas mediante expresiones regulares, crea dinámicamente la tabla en Supabase PostgreSQL (`dataset_<nombre>`), otorga permisos públicos de lectura a usuarios autenticados/anónimos de Supabase y registra los metadatos en la tabla `datasets`.
  * `GET /datasets/`: Lista datasets asociados al workspace del usuario.
* **`analytics.py`**:
  * `POST /analytics/chat`: Ejecuta consultas inteligentes sobre un dataset individual devolviendo la explicación y los datos resultantes.
  * `POST /analytics/compare`: Recibe `table_a` y `table_b`, ejecuta consultas analíticas consolidadas de promedios, mínimos y máximos en PostgreSQL y genera una evaluación estratégica completa con Gemini.

---

### 3.2 Frontend (`crm-profron`)

#### `src/lib/supabaseClient.ts`
Establece la conexión de cliente mediante `@supabase/supabase-js` utilizando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Permite que los módulos de analistas consulten directamente los registros de PostgreSQL sin sobrecargar el backend para operaciones de lectura masiva.

#### `src/features/analyst/pages/ComparacionAnalisis.tsx`
Es la pieza central para el análisis competitivo y multidimensional:
* **Lectura Supabase en Tiempo Real**: Consume `supabase.from(table).select('*').limit(30)` para poblar las tablas de forma instantánea.
* **Selectores y Modal de Selección**: Permite contrastar cualquier par de datasets (ej. `dataset_gadgetcorp_ventas` vs `dataset_ventas_tienda_tech_4000`) o abrir el catálogo general mediante el modal interactivo con búsqueda en vivo.
* **Pestañas Especializadas**:
  1. **Precios**: Enfoque en precios base, unitarios y diferencias relativas.
  2. **Ventas**: Comparativa de volúmenes, artículos y facturación total estimada.
  3. **Ofertas y Descuentos**: Análisis de políticas de rebajas, resaltando en color amarillo (`highlight-yellow`) aquellas promociones con descuentos superiores al 15%.
  4. **Estrategias de Mercado**: Panel de resumen ejecutivo asistido por IA (Gemini) sobre posicionamiento, costos y márgenes.
  5. **Todos los datos**: Tabla detallada con todas las columnas originales.
* **KPI Cards Comparativas**: Tarjetas ejecutivas en la parte superior con cálculo de promedios ponderados y badges de variación porcentual (`+X%` / `-X%`).
* **Asistente AI**: Panel lateral de chat conectado con el backend para responder inquietudes analíticas o ejecutar preguntas rápidas predefinidas.
* **Exportación**: Generación y descarga directa en formato CSV de la matriz comparativa.

#### `src/features/landing/`
Diseñada con estética oscura y toques de color azul/violeta (*glassmorphism*), incluye flujo de autenticación de doble factor mediante contraseña y código temporal OTP enviado por correo electrónico.

---

## 4. Flujo de Datos y Conectividad

```text
[ Usuario / Analista ]
        │
        ├── 1. Ingesta CSV ───────► [ Backend FastAPI: /datasets/upload ]
        │                                        │
        │                                        ▼
        │                            Normalización en Pandas
        │                                        │
        │                                        ▼
        │                           Crea tabla "dataset_*" e inserta
        │                           metadatos en PostgreSQL (Supabase)
        │
        ├── 2. Lectura y Vista ───► [ Supabase Client: supabase.from(...) ]
        │                                        │
        │                                        ▼
        │                            Retorno directo de filas JSON
        │                            hacia tablas interactivas en React
        │
        └── 3. Comparación e IA ──► [ Backend FastAPI: /analytics/compare ]
                                                 │
                                                 ▼
                                     Extracción de agregaciones SQL +
                                     Consulta a Google Gemini AI
                                                 │
                                                 ▼
                                     Retorno de síntesis ejecutiva
                                     y KPIs comparativos al Frontend
```

---

## 5. Variables de Entorno Requeridas

### Backend (`crm-proback/.env`)
```env
APP_NAME=RetailMetrics 360 API
ENVIRONMENT=development
DATABASE_URL=postgresql://<usuario>:<password>@<host>:5432/<dbname>
JWT_SECRET_KEY=<clave_secreta_jwt>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
SUPABASE_URL=https://<id-proyecto>.supabase.co
SUPABASE_ANON_KEY=<clave_anonima_jwt>
SUPABASE_SERVICE_ROLE_KEY=<clave_servicio_jwt>
GEMINI_API_KEY=<clave_api_gemini>
CORS_ORIGINS=http://localhost:5173
OTP_EXPIRATION_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USE_SSL=true
EMAIL_USER=<correo_remitente>
EMAIL_PASSWORD=<password_aplicacion_smtp>
EMAIL_FROM=<correo_remitente>
```

### Frontend (`crm-profron/.env`)
```env
VITE_SUPABASE_URL=https://<id-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<clave_anonima_jwt>
VITE_GEMINI_API_KEY=<clave_api_gemini>
VITE_WHATSAPP_NUMBER=573001234567
VITE_WHATSAPP_MESSAGE="Hola, me gustaría recibir más información y una demo sobre RetailMetrics 360"
```

---

## 6. Comandos para Ejecución y Verificación

### Backend
```bash
# Activar entorno virtual (Windows)
.venv\Scripts\activate

# Iniciar servidor de desarrollo con autoreload
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
# Iniciar servidor de desarrollo Vite
npm run dev

# Verificación de linter (ESLint)
npm run lint

# Compilación y chequeo de tipos estricto (TypeScript + Vite)
npm run build
```
