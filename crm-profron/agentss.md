# AGENTS.md

## RetailMetrics 360

Este archivo define las reglas y contexto que los agentes de IA deben seguir al trabajar en el frontend de **RetailMetrics 360**.

---

# 1. OBJETIVO DEL PROYECTO

RetailMetrics 360 es una plataforma CRM SaaS B2B orientada al análisis de datos del sector retail.

El frontend debe proporcionar una experiencia moderna, profesional, responsive y escalable para:

* Administradores
* Analistas
* Gerentes

La aplicación permite:

* Gestionar usuarios.
* Gestionar permisos y módulos.
* Gestionar workspaces.
* Cargar datasets CSV.
* Explorar datos.
* Filtrar información.
* Comparar datasets.
* Visualizar tendencias.
* Generar informes.
* Mostrar métricas.
* Preparar la aplicación para futura conexión con un backend/API.

---

# 2. STACK TECNOLÓGICO

Utilizar exclusivamente las tecnologías existentes en el proyecto, salvo que el usuario solicite explícitamente otra tecnología.

* React 19
* TypeScript 6
* Vite 8
* Lucide React
* CSS Vanilla
* ESLint 10
* TypeScript Strict Mode

No introducir Tailwind, Bootstrap, Material UI, Ant Design u otras librerías de UI sin autorización explícita.

---

# 3. ARQUITECTURA

El proyecto utiliza arquitectura Feature-Based.

Estructura principal:

```text
src/
├── assets/
├── features/
│   ├── landing/
│   ├── admin/
│   └── analyst/
├── layouts/
│   ├── AdminLayout.tsx
│   └── AnalystLayout.tsx
├── types/
│   └── index.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

Cada funcionalidad debe permanecer dentro de su feature correspondiente.

Ejemplo:

```text
features/
└── analyst/
    ├── CargaDatos.tsx
    ├── ObservacionDatos.tsx
    ├── ComparacionAnalisis.tsx
    ├── Informes.tsx
    ├── AnalystWorkspaces.tsx
    └── analyst.css
```

No mover archivos entre features sin una razón arquitectónica válida.

---

# 4. REGLA PRINCIPAL: ANALIZAR ANTES DE CODIFICAR

Antes de modificar o crear código:

1. Comprender el requerimiento.
2. Identificar qué feature corresponde.
3. Revisar componentes existentes.
4. Revisar tipos existentes.
5. Revisar estilos existentes.
6. Determinar si existe un componente reutilizable.
7. Identificar dependencias entre componentes.
8. Definir la solución.
9. Implementar.
10. Verificar que no se rompan funcionalidades existentes.

No crear código duplicado cuando ya existe una solución reutilizable.

---

# 5. PRINCIPIOS DE FRONTEND

Priorizar:

* Componentes reutilizables.
* Código limpio.
* TypeScript estricto.
* Separación de responsabilidades.
* Bajo acoplamiento.
* Alta cohesión.
* Accesibilidad.
* Responsive design.
* Consistencia visual.
* Escalabilidad.
* Mantenibilidad.

Evitar:

* Código duplicado.
* `any` innecesario.
* Componentes gigantes.
* Lógica de negocio mezclada con UI.
* CSS inline excesivo.
* Valores mágicos.
* Estados duplicados.
* Funciones innecesariamente complejas.

---

# 6. REACT

Utilizar componentes funcionales y Hooks.

Preferir:

```tsx
function UserCard({ user }: UserCardProps) {
  return (
    <article>
      ...
    </article>
  );
}
```

Evitar componentes excesivamente grandes.

Si un componente supera considerablemente la responsabilidad de una sola vista, evaluar dividirlo en componentes especializados.

Ejemplo:

```text
GestionUsuarios.tsx
├── UserTable
├── UserFilters
├── UserModal
├── UserStatusBadge
└── UserActions
```

---

# 7. TYPESCRIPT

TypeScript debe utilizarse de forma estricta.

Los datos deben tener tipos explícitos.

Ejemplo:

```tsx
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}
```

Utilizar los tipos existentes en:

```text
src/types/index.ts
```

No duplicar interfaces que ya existen.

Evitar:

```tsx
const user: any = ...
```

Preferir:

```tsx
const user: User = ...
```

Cuando sea necesario crear un nuevo tipo, determinar primero si pertenece a:

```text
src/types/index.ts
```

o si debe permanecer local al feature.

---

# 8. ROLES Y RBAC

Actualmente existen tres roles:

```text
admin
analyst
manager
```

Conceptualmente:

### Administrador

Puede:

* Gestionar usuarios.
* Asignar módulos.
* Gestionar workspaces.
* Visualizar tendencias.
* Generar reportes.

### Analista

Puede:

* Cargar CSV.
* Explorar datasets.
* Comparar información.
* Analizar datos.
* Gestionar workspaces.
* Generar informes.

### Gerente

Actualmente está preparado para futura expansión.

No asumir permisos del gerente si no están definidos.

---

# 9. NAVEGACIÓN

Actualmente la navegación utiliza estado local en:

```text
App.tsx
```

No introducir React Router automáticamente.

Si el usuario solicita implementar routing real, evaluar:

* React Router.
* Rutas protegidas.
* Rutas por rol.
* Layouts.
* Manejo de rutas desconocidas.

La implementación debe conservar la navegación existente mientras se realiza la migración.

---

# 10. LANDING PAGE

La landing pertenece a:

```text
src/features/landing/
```

Componentes principales:

```text
LandingPage.tsx
LandingNavbar.tsx
HeroSection.tsx
ModulesSection.tsx
PillarsSection.tsx
DashboardPreview.tsx
TestimonialsSection.tsx
PricingSection.tsx
FooterLanding.tsx
```

La landing debe ser:

* Pública.
* Responsive.
* Visualmente profesional.
* Orientada a conversión B2B.
* Coherente con la identidad de RetailMetrics 360.

No convertir la landing en un dashboard administrativo.

---

# 11. ADMIN

El panel administrativo utiliza:

```text
src/features/admin/
```

Y:

```text
src/layouts/AdminLayout.tsx
```

Módulos:

```text
GestionUsuarios
AsignacionModulos
Workspaces
Tendencias
CentroReportes
```

Mantener una experiencia visual consistente entre todas las vistas administrativas.

---

# 12. ANALYST

El espacio del analista utiliza:

```text
src/features/analyst/
```

Y:

```text
src/layouts/AnalystLayout.tsx
```

Módulos:

```text
PerfilUsuario
CargaDatos
ObservacionDatos
ComparacionAnalisis
AnalystWorkspaces
Informes
```

El flujo conceptual del analista es:

```text
Cargar datos
     ↓
Explorar datos
     ↓
Filtrar
     ↓
Comparar
     ↓
Analizar
     ↓
Generar informe
```

Las nuevas funcionalidades relacionadas con análisis deben respetar este flujo.

---

# 13. CSV Y DATASETS

La carga de CSV debe considerar:

* Drag & drop.
* Selección manual de archivo.
* Validación de extensión.
* Estado de carga.
* Estado de error.
* Estado vacío.
* Vista previa.
* Información del dataset.

Preparar la arquitectura para futura integración con API.

No asumir que los datos permanecerán estáticos.

---

# 14. ESTADOS DE UI

Toda vista que trabaje con datos debe considerar:

### Loading

```text
Cargando información...
```

### Empty

```text
No hay datos disponibles.
```

### Error

```text
No pudimos cargar la información.
```

### Success

Mostrar los datos correctamente.

Evitar interfaces que solamente contemplen el estado exitoso.

---

# 15. CSS

El proyecto utiliza CSS Vanilla.

Respetar la organización actual:

```text
src/index.css
src/App.css
src/features/landing/landing.css
src/features/admin/admin.css
src/features/analyst/analyst.css
src/layouts/AdminLayout.css
src/layouts/AnalystLayout.css
```

Antes de crear estilos nuevos:

1. Revisar si existe una clase reutilizable.
2. Revisar variables CSS.
3. Mantener consistencia con el diseño actual.
4. Evitar duplicación.

No crear estilos inline salvo casos justificados.

---

# 16. RESPONSIVE DESIGN

Todas las interfaces nuevas deben funcionar correctamente en:

* Desktop.
* Laptop.
* Tablet.
* Mobile.

No diseñar únicamente para escritorio.

Considerar especialmente:

* Sidebar.
* Topbar.
* Tablas.
* Formularios.
* Cards.
* Gráficos.
* Modales.
* Menús.

En mobile, las tablas pueden requerir:

* Scroll horizontal.
* Reorganización.
* Vista alternativa.

---

# 17. ICONOS

Utilizar:

```text
lucide-react
```

No introducir otra biblioteca de iconos.

Ejemplo:

```tsx
import { Users, Settings, BarChart3 } from "lucide-react";
```

Los iconos deben tener una función clara y no utilizarse solamente como decoración innecesaria.

---

# 18. UX

Toda nueva funcionalidad debe responder:

* ¿Qué puede hacer el usuario?
* ¿Qué información necesita?
* ¿Cuál es la acción principal?
* ¿Qué ocurre después de hacer clic?
* ¿Qué ocurre si falla?
* ¿Qué ocurre si no existen datos?

Priorizar interfaces simples y claras.

Evitar sobrecargar las pantallas con elementos visuales innecesarios.

---

# 19. DASHBOARDS

Los dashboards deben priorizar:

1. KPIs importantes.
2. Tendencias.
3. Comparaciones.
4. Alertas.
5. Acciones relevantes.

No llenar el dashboard de gráficos solamente porque existe espacio.

Cada gráfico debe responder una pregunta de negocio.

---

# 20. DATOS MOCK

Actualmente el proyecto utiliza datos mock.

Los mocks deben mantenerse separados de la presentación cuando sea posible.

Evitar llenar componentes con grandes cantidades de objetos estáticos.

Preparar las estructuras para posteriormente reemplazar:

```text
Mock
↓
Service/API
↓
Backend
```

sin tener que reescribir toda la interfaz.

---

# 21. API FUTURA

El frontend debe prepararse para una futura API.

Una arquitectura futura recomendada:

```text
components
     ↓
hooks
     ↓
services
     ↓
API
```

No colocar llamadas HTTP directamente dentro de múltiples componentes si posteriormente serán reutilizadas.

---

# 22. SEGURIDAD FRONTEND

Nunca almacenar:

* Contraseñas.
* Tokens sensibles en código fuente.
* Secretos.
* API keys privadas.

No asumir que ocultar una opción visual equivale a seguridad real.

La autorización real deberá ser validada posteriormente por el backend.

---

# 23. ACCESIBILIDAD

Las interfaces deben considerar:

* HTML semántico.
* Labels en formularios.
* `aria-label` cuando sea necesario.
* Navegación mediante teclado.
* Contraste adecuado.
* Estados de focus.
* Botones con propósito claro.

No utilizar un `<div>` como botón cuando pueda utilizarse `<button>`.

---

# 24. PERFORMANCE

Evitar optimizaciones prematuras.

Sin embargo:

* Evitar renders innecesarios.
* Evitar cálculos pesados durante cada render.
* Dividir componentes grandes.
* Optimizar imágenes cuando corresponda.
* Utilizar memoización solamente cuando tenga una razón clara.

---

# 25. CAMBIOS EXISTENTES

Cuando se solicite modificar una funcionalidad:

* No reescribir archivos completos innecesariamente.
* No eliminar funcionalidades existentes sin autorización.
* No cambiar nombres públicos de componentes sin necesidad.
* No modificar estilos globales para solucionar un problema local.
* No romper otras features.

Realizar cambios mínimos y controlados.

---

# 26. CREACIÓN DE NUEVAS FUNCIONALIDADES

Antes de crear una funcionalidad:

```text
1. Identificar feature.
2. Revisar componentes existentes.
3. Revisar tipos.
4. Revisar CSS.
5. Determinar reutilización.
6. Diseñar componente.
7. Implementar.
8. Revisar responsive.
9. Ejecutar lint.
10. Ejecutar build.
```

---

# 27. VALIDACIÓN

Después de realizar cambios importantes ejecutar:

```bash
npm run lint
```

y:

```bash
npm run build
```

Si alguno falla:

1. Identificar el error.
2. Corregirlo.
3. Ejecutar nuevamente.
4. No ignorar errores de TypeScript o ESLint.

---

# 28. REGLA CONTRA SOBREINGENIERÍA

No introducir:

* Librerías innecesarias.
* Arquitecturas complejas.
* Patrones que el proyecto todavía no necesita.
* Abstracciones prematuras.

La solución debe ser proporcional al problema.

---

# 29. FORMA DE TRABAJO DEL AGENTE

Cuando el usuario solicite una nueva funcionalidad, responder internamente siguiendo este proceso:

```text
REQUERIMIENTO
     ↓
ANÁLISIS
     ↓
ARQUITECTURA
     ↓
COMPONENTES
     ↓
TIPOS
     ↓
ESTADOS
     ↓
ESTILOS
     ↓
IMPLEMENTACIÓN
     ↓
VALIDACIÓN
```

Si existe una ambigüedad importante, preguntar antes de realizar cambios destructivos.

Si el requerimiento es suficientemente claro, no realizar preguntas innecesarias.

---

# 30. PRIORIDADES

Cuando existan conflictos entre decisiones, priorizar:

1. Funcionalidad.
2. Mantenibilidad.
3. TypeScript.
4. UX.
5. Accesibilidad.
6. Responsive.
7. Consistencia visual.
8. Performance.

---

# 31. REGLA FINAL

RetailMetrics 360 debe sentirse como un producto SaaS B2B profesional.

Cada cambio debe parecer parte del mismo producto.

No crear componentes aislados que solamente funcionen individualmente.

Antes de implementar, preguntarse:

> "¿Esto encaja realmente dentro de RetailMetrics 360 y su arquitectura actual?"

Si la respuesta es no, replantear la solución.
