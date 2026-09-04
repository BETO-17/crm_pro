# Vistas de Analista — RetailMetrics 360

Crear las 6 vistas del workspace del analista, basándose en las imágenes proporcionadas.

## Resumen de Vistas

| # | Vista | Descripción clave |
|---|-------|-------------------|
| 1 | **Perfil de Usuario** | Info personal editable, informe de actividad (12 reportes), actividad reciente con descargas |
| 2 | **Carga de Datos** | Selector de sector, drag-and-drop para CSV/XLSX, cola de archivos con estados (Listo/Validando/Error) |
| 3 | **Observación de Datos** | Tabla de datos con selector de dataset, análisis de columna (stats), y chat AI Assistant |
| 4 | **Comparación y Análisis** | Dos archivos side-by-side con tabs (Precios/Ofertas/Artículos), chat AI con respuestas de análisis |
| 5 | **Workspaces de Análisis** | Filtros por sector/fecha, workspace reciente destacado, grid de todos los workspaces |
| 6 | **Informes** | (Referenciado en sidebar, generación de reportes del analista) |

## Decisiones de Diseño

- **Sidebar diferente**: El analista tiene su propio sidebar con nav items distintos (Mi Perfil, Carga de Datos, Observación, Comparación, Workspace, Informes)
- **Cambio de rol**: Se añade un toggle Admin ↔ Analista en App.tsx para navegar entre los dos layouts
- **Chat AI simulado**: Mensajes pre-cargados con respuestas automáticas simuladas al escribir
- **Drag & Drop**: Implementado con estado local (sin `react-dropzone` por ahora, se puede migrar)
- **Datos de tabla**: ~20 filas mock con transacciones, filtrable y sorteable

## Proposed Changes

### Feature: Analyst

#### [NEW] `src/features/analyst/analyst.css`
- Estilos para todas las vistas del analista (perfil, dropzone, tabla de datos, chat AI, comparación)

#### [NEW] `src/features/analyst/pages/PerfilUsuario.tsx`
- Avatar con iniciales + info del usuario (Carlos Ruiz, carlosruiz@gmail.com)
- Badge "Rol: Usuario Analista"
- Último acceso, Departamento
- Panel derecho: Información Personal editable (Nombre, Correo)
- Informe de Actividad: Total de Reportes (12), Último Informe
- Actividad Reciente: lista de reportes con acciones (Descargar/Ver)

#### [NEW] `src/features/analyst/pages/CargaDatos.tsx`
- Breadcrumb: Espacio de Trabajo > Carga de Datos
- Selector "Sector de Destino"
- Zona drag-and-drop con icono de upload, badges .CSV .XLSX
- Tabla "Archivos en cola" con columnas: Nombre, Tamaño, Tipo, Estado, Acción
- Estados simulados: Listo (verde), Validando (amarillo animado), Error de Formato (rojo)
- Botones: Cancelar, Guardar en Base de Datos

#### [NEW] `src/features/analyst/pages/ObservacionDatos.tsx`
- Top bar: Selector de dataset, badge "1.4M Rows · 24 Columns", botones Filtrar y Guardar Vista
- Layout 3 columnas: Análisis de Columna (izq) | Tabla de datos (centro) | Asistente AI (der)
- Análisis de columna: nombre, tipo, badges (NUMERIC, 100% VALID), stats (Min, Max, Promedio, Nulos), mini gráfico de distribución
- Tabla con datos mock de transacciones (TRX-xxxx, store_code, revenue_usd, date)
- Chat AI: mensajes pre-cargados + input funcional con respuestas simuladas

#### [NEW] `src/features/analyst/pages/ComparacionAnalisis.tsx`
- Selector de Rubro + botón "Añadir Archivo a Comparar" + "Guardar Análisis"
- Tabs: Precios, Ofertas, Artículos
- Dos tablas side-by-side con datos de SKUs (Precio Base, Descuento) con celdas destacadas
- Chat AI con análisis de comparación pre-cargado

#### [NEW] `src/features/analyst/pages/AnalystWorkspaces.tsx`
- Filtros: Sector (checkboxes), Fecha (dropdown)
- "Análisis Reciente" — workspace destacado con badge, archivos asociados, botón "Continuar Análisis"
- "Todos los Workspaces" — grid de cards con archivos, fechas, estados

#### [NEW] `src/features/analyst/pages/Informes.tsx`
- Vista de informes generados por el analista

---

### Layout

#### [NEW] `src/layouts/AnalystLayout.tsx`
- Sidebar con branding "Executive Analytics / Data Management Console"
- Perfil "Carlos Ruiz, Usuario Analista"
- Nav items: Mi Perfil, Carga de Datos, Observación de Datos, Comparación y Análisis, Workspace, Informes
- Footer: + New Load, Settings, Support

#### [NEW] `src/layouts/AnalystLayout.css`
- Estilos específicos del layout del analista (reutiliza variables del admin)

---

### App.tsx

#### [MODIFY] `src/App.tsx`
- Añadir toggle de rol (Admin ↔ Analista) visible en el topbar
- Renderizar AdminLayout o AnalystLayout según el rol seleccionado
- Gestionar navegación del analista

## Verification Plan

### Manual Verification
- `npm run dev` y navegar por las 6 vistas del analista
- Probar drag-and-drop de archivos simulados
- Probar chat AI con mensajes
- Probar cambio de rol Admin ↔ Analista
