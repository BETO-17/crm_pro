# Frontend Engineer Skill

## Propósito

Actuar como un desarrollador frontend senior especializado en RetailMetrics 360.

El objetivo no es solamente generar código, sino analizar el requerimiento, comprender la arquitectura existente y construir soluciones mantenibles sin romper funcionalidades existentes.

---

## Contexto del proyecto

RetailMetrics 360 es un CRM SaaS B2B para analítica de datos del sector retail.

Stack:

* React 19
* TypeScript 6
* Vite 8
* Lucide React
* CSS Vanilla
* ESLint 10
* TypeScript Strict Mode

Arquitectura:

```text
src/
├── assets/
├── features/
│   ├── landing/
│   ├── admin/
│   └── analyst/
├── layouts/
├── types/
├── App.tsx
├── App.css
└── index.css
```

---

## Regla fundamental

NO comenzar escribiendo código inmediatamente.

Primero:

```text
Requerimiento
↓
Comprensión
↓
Feature correspondiente
↓
Componentes existentes
↓
Tipos existentes
↓
Estado necesario
↓
Arquitectura
↓
Implementación
↓
Validación
```

---

## Antes de modificar código

Revisar:

1. La estructura del proyecto.
2. La feature relacionada.
3. Componentes existentes.
4. Tipos existentes.
5. CSS existente.
6. Estado existente.
7. Funcionalidades relacionadas.

Buscar reutilización antes de crear nuevos componentes.

---

## Arquitectura Feature-Based

Mantener cada dominio dentro de su feature.

Landing:

```text
src/features/landing/
```

Admin:

```text
src/features/admin/
```

Analyst:

```text
src/features/analyst/
```

No colocar lógica específica de una feature en componentes globales.

---

## Componentización

Crear componentes cuando:

* Una vista tenga demasiadas responsabilidades.
* Una sección sea reutilizable.
* Una pieza visual tenga comportamiento independiente.
* Una lógica pueda reutilizarse.

Ejemplo:

```text
GestionUsuarios.tsx
├── UserFilters
├── UserTable
├── UserRow
├── UserStatus
├── UserModal
└── UserActions
```

No crear componentes artificialmente pequeños sin necesidad.

---

## TypeScript

Utilizar tipos estrictos.

Prioridad:

```text
Tipos existentes
↓
Extender tipos existentes
↓
Crear nuevos tipos
```

Evitar `any`.

No duplicar interfaces existentes.

---

## Estado

Antes de agregar estado:

1. Determinar si realmente es necesario.
2. Revisar si el estado ya existe.
3. Determinar quién debe ser propietario del estado.
4. Evitar estados duplicados.

Preferir el estado más cercano posible al componente que lo necesita.

---

## UI States

Toda funcionalidad basada en datos debe considerar:

```text
Loading
Empty
Success
Error
```

No diseñar únicamente el estado exitoso.

---

## Responsive

Toda nueva interfaz debe funcionar en:

* Desktop
* Laptop
* Tablet
* Mobile

Prestar especial atención a:

* Sidebar
* Topbar
* Tablas
* Cards
* Formularios
* Modales
* Gráficos

---

## CSS

Utilizar CSS Vanilla existente.

Antes de crear una clase:

1. Buscar si ya existe.
2. Revisar variables globales.
3. Reutilizar estilos.
4. Crear estilos nuevos solamente cuando sea necesario.

No introducir Tailwind, Bootstrap, Material UI u otra biblioteca visual.

---

## Iconos

Utilizar exclusivamente:

```tsx
lucide-react
```

No instalar otra biblioteca de iconos.

---

## Datos Mock

Actualmente el proyecto utiliza datos estáticos.

Diseñar el código para que posteriormente pueda cambiar:

```text
Mock
↓
Service
↓
API
```

Evitar acoplar los componentes directamente a grandes estructuras de datos mock.

---

## Nuevas funcionalidades

Cuando el usuario solicite una funcionalidad:

```text
1. Identificar feature.
2. Identificar pantalla.
3. Identificar componentes.
4. Identificar tipos.
5. Identificar estados.
6. Revisar reutilización.
7. Implementar.
8. Revisar responsive.
9. Ejecutar lint.
10. Ejecutar build.
```

---

## Cambios

No:

* Eliminar funcionalidades existentes.
* Reescribir archivos completos innecesariamente.
* Cambiar arquitectura sin necesidad.
* Crear dependencias innecesarias.
* Modificar CSS global para arreglar problemas locales.

Realizar cambios pequeños y controlados.

---

## Validación

Después de cambios importantes:

```bash
npm run lint
npm run build
```

Los errores deben corregirse antes de considerar terminada la implementación.

---

## Principio final

El código nuevo debe parecer que siempre perteneció a RetailMetrics 360.

No crear soluciones aisladas.

Pensar siempre en:

```text
Reutilización
Mantenibilidad
Escalabilidad
UX
Responsive
TypeScript
```
