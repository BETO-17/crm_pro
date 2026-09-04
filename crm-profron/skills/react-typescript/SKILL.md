# React + TypeScript Skill

## Propósito

Desarrollar funcionalidades de RetailMetrics 360 utilizando React 19 y TypeScript 6 de forma estricta, reutilizable y mantenible.

---

# 1. React

Utilizar:

* Functional Components
* Hooks
* Props tipadas
* Composición
* Event handlers tipados

Evitar componentes de clase.

---

# 2. Componentes

Un componente debe tener una responsabilidad clara.

Ejemplo:

```tsx
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}
```

Evitar componentes que mezclen:

```text
UI
+
datos
+
validaciones
+
navegación
+
lógica compleja
```

Cuando sea necesario, dividir responsabilidades.

---

# 3. Props

Siempre tipar las props.

Preferir:

```tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
}
```

Evitar:

```tsx
function MetricCard(props: any)
```

---

# 4. Hooks

Utilizar hooks solamente cuando resuelvan una necesidad real.

Hooks frecuentes:

```text
useState
useEffect
useMemo
useCallback
useRef
```

No utilizar `useMemo` o `useCallback` automáticamente.

---

# 5. useEffect

Antes de utilizar `useEffect`, determinar si realmente existe un efecto externo.

Evitar utilizar `useEffect` simplemente para calcular valores derivados.

Preferir:

```tsx
const total = items.reduce(...)
```

en lugar de almacenar `total` como estado si puede calcularse directamente.

---

# 6. Eventos

Tipar correctamente eventos.

Ejemplo:

```tsx
const handleChange = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  ...
};
```

Para botones:

```tsx
const handleClick = (
  event: React.MouseEvent<HTMLButtonElement>
) => {
  ...
};
```

---

# 7. Formularios

Los formularios deben contemplar:

```text
Initial
↓
Editing
↓
Validation
↓
Submitting
↓
Success / Error
```

No permitir múltiples envíos accidentales.

---

# 8. CSV

Para CargaDatos:

```text
Seleccionar archivo
↓
Validar archivo
↓
Leer archivo
↓
Procesar contenido
↓
Mostrar preview
↓
Mostrar resultado
```

Considerar:

* Archivo inexistente.
* Archivo incorrecto.
* CSV vacío.
* Columnas inválidas.
* Dataset grande.
* Error durante procesamiento.

---

# 9. Tablas

Las tablas deben soportar, cuando corresponda:

* Loading
* Empty
* Error
* Filtros
* Ordenamiento
* Paginación
* Responsive

En móvil:

```text
Tabla
↓
Scroll horizontal
```

o una representación alternativa cuando sea necesario.

---

# 10. Tipos

Utilizar los tipos existentes:

```text
src/types/index.ts
```

Principales entidades:

```text
Role
User
Module
ModulePermissions
Strategy
TrendMetric
Report
Workspace
SectorDistribution
NavItem
```

No duplicarlos.

---

# 11. Roles

Respetar:

```text
admin
analyst
manager
```

No inventar permisos.

Actualmente el cambio de rol se realiza mediante estado local.

No implementar autenticación real a menos que el usuario lo solicite.

---

# 12. Componentes reutilizables

Antes de crear:

```text
Button
Card
Modal
Table
Badge
Input
Select
MetricCard
```

buscar si ya existe una implementación reutilizable.

Si no existe y será utilizada en múltiples lugares, crearla de forma reutilizable.

---

# 13. Navegación

Actualmente App.tsx controla la navegación mediante estado.

No introducir React Router automáticamente.

Si el usuario solicita routing:

```text
Public Routes
Protected Routes
Admin Routes
Analyst Routes
Manager Routes
```

diseñar la migración antes de implementarla.

---

# 14. Performance

Evitar:

* Renderizados innecesarios.
* Arrays enormes recreados innecesariamente.
* Cálculos pesados durante cada render.
* Componentes monolíticos.

No optimizar prematuramente.

---

# 15. Código

Preferir código:

* Legible.
* Predecible.
* Explícito.
* Tipado.
* Fácil de modificar.

No sacrificar legibilidad por reducir líneas.

---

# 16. Validación

Después de implementar:

```bash
npm run lint
npm run build
```

No considerar terminada una funcionalidad si rompe el build.
