# 📊 RetailMetrics 360 — Resumen del Proyecto

## Descripción General

**RetailMetrics 360** es una plataforma **CRM SaaS B2B** de analítica de datos para el sector retail. Permite a administradores gestionar usuarios y módulos, y a analistas cargar, explorar y comparar datasets (CSV), visualizar tendencias y generar informes — todo desde una interfaz moderna con paneles diferenciados por rol.

---

## 🛠️ Stack Tecnológico

| Capa            | Tecnología                        |
| --------------- | --------------------------------- |
| **Framework**   | React 19 + TypeScript 6           |
| **Bundler**     | Vite 8                            |
| **Iconos**      | Lucide React                      |
| **Estilos**     | CSS vanilla (archivos `.css` por feature) |
| **Linter**      | ESLint 10 + eslint-plugin-react   |
| **Tipado**      | TypeScript estricto (`src/types/`) |

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura Feature-Based** donde cada dominio funcional está aislado en su propia carpeta dentro de `src/features/`.

### Diagrama de estructura

```
crm-profron/
├── public/
├── src/
│   ├── assets/               # Recursos estáticos globales
│   ├── features/             # Lógica y UI por dominio
│   │   ├── landing/          # Landing page pública
│   │   ├── admin/            # Panel de administración
│   │   └── analyst/          # Espacio de trabajo del analista
│   ├── layouts/              # Layouts por rol (Admin, Analyst)
│   ├── types/                # Tipos globales de TypeScript
│   ├── App.tsx               # Orquestador principal y enrutamiento
│   ├── main.tsx              # Punto de entrada
│   ├── App.css               # Estilos globales de la app
│   └── index.css             # Reset y estilos base
├── package.json
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

---

## 👥 Roles del Sistema

La plataforma maneja **control de acceso basado en roles (RBAC)** con tres roles definidos:

| Rol               | Descripción                                                     |
| ----------------- | --------------------------------------------------------------- |
| **Administrador** | Gestiona usuarios, asigna módulos, ve tendencias y reportes     |
| **Analista**      | Carga datos CSV, observa/compara datasets, genera informes      |
| **Gerente**       | Rol definido en tipos (extensible a futuro)                     |

El cambio de rol se hace con un **role-switcher** en la barra superior, sin autenticación real aún (estado local en `App.tsx`).

---

## 📦 Módulos y Páginas

### 🔑 Landing (Público)

| Componente              | Archivo                         | Descripción                           |
| ----------------------- | ------------------------------- | ------------------------------------- |
| Landing Page            | `LandingPage.tsx`               | Composición de todas las secciones    |
| Navbar                  | `LandingNavbar.tsx`             | Barra de navegación pública           |
| Hero                    | `HeroSection.tsx`               | Sección principal con CTA             |
| Módulos                 | `ModulesSection.tsx`            | Características de la plataforma      |
| Pilares                 | `PillarsSection.tsx`            | Propuesta de valor                    |
| Preview del Dashboard   | `DashboardPreview.tsx`          | Vista previa interactiva              |
| Testimonios             | `TestimonialsSection.tsx`       | Opiniones de clientes                 |
| Precios                 | `PricingSection.tsx`            | Planes y pricing                      |
| Footer                  | `FooterLanding.tsx`             | Pie de página                         |

### 🛡️ Admin

| Página                  | Archivo                         | Descripción                                     |
| ----------------------- | ------------------------------- | ----------------------------------------------- |
| Gestión de Usuarios     | `GestionUsuarios.tsx`           | CRUD de usuarios del sistema                    |
| Asignación de Módulos   | `AsignacionModulos.tsx`         | Permisos de módulos por usuario                 |
| Workspaces              | `Workspaces.tsx`                | Gestión de espacios de trabajo                  |
| Tendencias              | `Tendencias.tsx`                | Métricas globales y gráficas de tendencia       |
| Centro de Reportes      | `CentroReportes.tsx`            | Generación y exportación de reportes            |

> Las sub-vistas de "Usuarios" (Gestión, Asignación, Workspaces) se controlan con tabs en la barra superior.

### 📈 Analyst

| Página                  | Archivo                         | Descripción                                     |
| ----------------------- | ------------------------------- | ----------------------------------------------- |
| Perfil de Usuario       | `PerfilUsuario.tsx`             | Datos y configuración del analista              |
| Carga de Datos          | `CargaDatos.tsx`                | Upload drag-and-drop de archivos CSV            |
| Observación de Datos    | `ObservacionDatos.tsx`          | Tablas con filtros para explorar datasets        |
| Comparación y Análisis  | `ComparacionAnalisis.tsx`       | Comparación lado a lado de datasets             |
| Workspaces del Analista | `AnalystWorkspaces.tsx`         | Espacios de trabajo personales                  |
| Informes                | `Informes.tsx`                  | Generación y descarga de informes               |

---

## 🧩 Layouts

| Layout            | Archivo              | Descripción                                        |
| ----------------- | -------------------- | -------------------------------------------------- |
| **AdminLayout**   | `AdminLayout.tsx`    | Sidebar oscuro + topbar con tabs, para el admin     |
| **AnalystLayout** | `AnalystLayout.tsx`  | Sidebar + topbar adaptado al flujo del analista     |

Cada layout recibe el contenido como `children` y la barra superior como prop `topBar`.

---

## 📐 Modelo de Datos (TypeScript)

Los tipos principales definidos en `src/types/index.ts`:

| Tipo / Interface      | Propósito                                      |
| --------------------- | ---------------------------------------------- |
| `Role`                | Roles: Administrador, Analista, Gerente        |
| `User`                | Usuario con id, nombre, email, rol, permisos   |
| `Module`              | Módulo del sistema (id, nombre, status)        |
| `ModulePermissions`   | Permisos por módulo: carga, análisis, tendencias |
| `Strategy`            | Estrategia operativa con estado                |
| `TrendMetric`         | Métrica de tendencia (valor, dirección)        |
| `Report`              | Reporte con categoría, período y formatos      |
| `Workspace`           | Sesión de workspace con colaboradores          |
| `SectorDistribution`  | Distribución por sector para gráficas          |
| `NavItem`             | Ítem de navegación del sidebar                 |

---

## 🎨 Estilos

El proyecto utiliza **CSS vanilla** organizado por feature:

- `src/index.css` — Reset y variables CSS globales
- `src/App.css` — Estilos compartidos de la aplicación
- `src/features/landing/landing.css` — Estilos de la landing page (~32 KB)
- `src/features/admin/admin.css` — Estilos del panel admin (~31 KB)
- `src/features/analyst/analyst.css` — Estilos del workspace del analista (~21 KB)
- `src/layouts/AdminLayout.css` — Layout del admin (~7 KB)
- `src/layouts/AnalystLayout.css` — Layout del analista (~2 KB)

---

## 🚀 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo con HMR (Vite)
npm run build     # Compilación TypeScript + build de producción
npm run lint      # Linting con ESLint
npm run preview   # Preview del build de producción
```

---

## 📌 Estado Actual y Notas

- **Sin enrutamiento real**: La navegación se maneja con estado local (`useState`) en `App.tsx`, sin React Router.
- **Sin backend**: Todos los datos son mock/estáticos dentro de los componentes.
- **Sin autenticación**: El login de la landing solo cambia el rol a `'admin'`.
- **Diseño responsive**: Los layouts usan CSS con sidebar fijo y contenido scrollable.
- **Preparado para escalar**: La arquitectura feature-based y los tipos estrictos facilitan agregar React Router, Zustand, y conexión a API.
