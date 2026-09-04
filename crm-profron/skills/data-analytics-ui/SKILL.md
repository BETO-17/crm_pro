# Data Analytics UI Skill

## Propósito

Esta skill define cómo diseñar, implementar y mejorar las interfaces de analítica de datos de **RetailMetrics 360**.

El agente debe comportarse como un desarrollador frontend especializado en:

* Data Analytics
* Dashboards
* CRM
* Retail
* CSV/Datasets
* KPIs
* Tablas analíticas
* Tendencias
* Comparación de datos
* Reportes

El objetivo es convertir datos complejos en interfaces claras, útiles y accionables.

---

# 1. CONTEXTO DEL PROYECTO

RetailMetrics 360 es un CRM SaaS B2B para analítica de datos del sector retail.

El flujo principal del analista es:

```text
Carga de datos
      ↓
Validación
      ↓
Exploración
      ↓
Filtrado
      ↓
Comparación
      ↓
Análisis
      ↓
Visualización
      ↓
Informe
```

Las principales funcionalidades relacionadas con datos son:

```text
CargaDatos.tsx
ObservacionDatos.tsx
ComparacionAnalisis.tsx
Tendencias.tsx
CentroReportes.tsx
Informes.tsx
```

---

# 2. PRINCIPIO FUNDAMENTAL

Los datos deben ayudar al usuario a responder preguntas de negocio.

No crear una visualización solamente porque es técnicamente posible.

Antes de crear una tabla, métrica o gráfico preguntar:

```text
¿Qué pregunta de negocio responde?
¿Qué decisión ayuda a tomar?
¿Qué información necesita el usuario?
```

---

# 3. FUENTE DE VERDAD

Nunca inventar datos reales.

Actualmente RetailMetrics 360 utiliza datos mock.

Diferenciar siempre:

```text
Mock
Datos procesados localmente
Datos provenientes de API
Datos provenientes de CSV
```

Nunca presentar datos mock como si fueran datos reales.

Cuando una métrica sea simulada, mantener la arquitectura preparada para reemplazarla posteriormente por datos reales.

---

# 4. DATASET

Un dataset puede representarse conceptualmente como:

```text
Dataset
├── id
├── nombre
├── archivo
├── fechaCarga
├── cantidadFilas
├── cantidadColumnas
├── columnas
├── estado
└── datos
```

Antes de mostrar datos analizar:

* Nombre del dataset.
* Cantidad de registros.
* Cantidad de columnas.
* Tipos de datos.
* Valores faltantes.
* Columnas relevantes.
* Posibles errores.

---

# 5. CARGA DE CSV

La interfaz de carga debe seguir:

```text
Seleccionar archivo
       ↓
Validar archivo
       ↓
Procesar
       ↓
Validar estructura
       ↓
Mostrar preview
       ↓
Confirmar carga
       ↓
Dataset disponible
```

---

# 6. VALIDACIÓN DEL ARCHIVO

Validar como mínimo:

### Extensión

Aceptar:

```text
.csv
```

Rechazar archivos incompatibles.

### Archivo vacío

Mostrar un mensaje comprensible.

### Dataset vacío

Informar cuando el CSV no contiene registros útiles.

### Columnas

Detectar columnas faltantes cuando exista una estructura esperada.

### Errores

Mostrar qué ocurrió y cómo solucionarlo.

---

# 7. DRAG & DROP

La zona de carga debe comunicar claramente:

```text
Arrastra tu archivo CSV aquí
o
Selecciona un archivo
```

Mostrar:

* Tipo de archivo permitido.
* Tamaño máximo si está definido.
* Estado de selección.
* Estado de procesamiento.
* Estado de éxito.
* Estado de error.

---

# 8. PREVISUALIZACIÓN

Después de cargar un dataset, mostrar una preview.

La preview debe permitir comprender rápidamente:

```text
Nombre del dataset
Registros
Columnas
Fecha de carga
Estado
Primeros registros
```

No mostrar miles de filas de una sola vez.

Utilizar paginación o virtualización cuando sea necesario.

---

# 9. CALIDAD DE DATOS

Cuando sea posible, mostrar indicadores como:

```text
Registros totales
Valores completos
Valores faltantes
Columnas válidas
Duplicados
Errores
```

Ejemplo conceptual:

```text
Calidad del dataset

98.4% completo

Registros       12,540
Columnas        18
Valores nulos   1.6%
Duplicados      23
```

No inventar estos valores si no existe información para calcularlos.

---

# 10. TABLAS ANALÍTICAS

Las tablas deben facilitar la exploración.

Considerar:

* Búsqueda.
* Filtros.
* Ordenamiento.
* Paginación.
* Selección de filas.
* Columnas relevantes.
* Formateo de números.
* Formateo de fechas.
* Estados vacíos.

Evitar tablas con demasiadas columnas visibles simultáneamente.

---

# 11. FILTROS

Los filtros deben ser comprensibles para el usuario.

Tipos posibles:

```text
Texto
Categoría
Fecha
Rango numérico
Estado
Región
Producto
Cliente
Canal
```

Cuando existan múltiples filtros, permitir:

```text
Aplicar
Limpiar filtros
```

o actualización automática cuando resulte apropiado.

Mostrar los filtros activos cuando ayude a comprender el resultado.

---

# 12. BÚSQUEDA

La búsqueda debe indicar qué campos analiza.

Ejemplo:

```text
Buscar producto, cliente o categoría...
```

Evitar placeholders genéricos como:

```text
Buscar...
```

cuando el contexto permita ser más específico.

---

# 13. KPIs

Un KPI debe contener información suficiente para interpretar su valor.

Estructura recomendada:

```text
Título
Valor
Variación
Dirección
Período
Contexto
```

Ejemplo:

```text
Ventas totales

S/ 245,800

↑ 12.4%

vs. período anterior
```

---

# 14. TIPOS DE KPIs RETAIL

Cuando existan datos suficientes, pueden utilizarse métricas como:

### Ventas

```text
Ventas totales
Ventas promedio
Crecimiento de ventas
```

### Clientes

```text
Clientes activos
Nuevos clientes
Clientes recurrentes
```

### Productos

```text
Productos vendidos
Producto más vendido
Categoría líder
```

### Operaciones

```text
Número de transacciones
Ticket promedio
Unidades vendidas
```

No asumir que todos los datasets contienen información suficiente para calcular estos indicadores.

---

# 15. CÁLCULO DE MÉTRICAS

Antes de calcular una métrica:

```text
Identificar columnas
↓
Validar tipos
↓
Validar valores
↓
Definir fórmula
↓
Calcular
↓
Formatear
```

Ejemplo:

```text
Ticket promedio =
Ventas totales / Número de transacciones
```

No realizar cálculos sobre columnas incorrectas solamente porque sus nombres parecen similares.

---

# 16. FORMATOS NUMÉRICOS

Utilizar formatos adecuados para el contexto.

Ejemplos:

```text
S/ 245,800.00
12.4%
1,250 unidades
4.8
```

No mostrar:

```text
245800
0.124
1250
```

si el contexto requiere una presentación más legible.

---

# 17. MONEDA

RetailMetrics 360 está orientado al contexto peruano cuando se utilicen datos financieros en soles.

Cuando corresponda:

```text
S/
```

Sin embargo, no asumir que todos los datasets están expresados en soles.

La moneda debe provenir del dataset, configuración o contexto definido.

---

# 18. TENDENCIAS

Una tendencia debe mostrar:

```text
Valor actual
Valor anterior
Variación
Dirección
Período
```

Direcciones:

```text
↑ Crecimiento
↓ Disminución
→ Estable
```

No etiquetar una métrica como "crecimiento" si no existe un período de comparación.

---

# 19. GRÁFICOS

Elegir el gráfico según la pregunta.

### Línea

Para:

```text
Evolución temporal
Ventas por mes
Tendencias
```

### Barras

Para:

```text
Comparación entre categorías
Productos
Regiones
Canales
```

### Barras horizontales

Para rankings.

### Circular / Donut

Utilizar solamente cuando existan pocas categorías y sea importante mostrar composición.

### Área

Para evolución y volumen acumulado cuando tenga sentido.

---

# 20. REGLA DE VISUALIZACIÓN

No utilizar gráficos innecesarios.

Ejemplo incorrecto:

```text
Ventas por mes
→ gráfico de líneas

Ventas por mes
→ gráfico circular

Ventas por mes
→ gráfico de barras

Ventas por mes
→ otro gráfico
```

Tres o cuatro gráficos mostrando exactamente la misma información no aportan valor.

---

# 21. COHERENCIA ENTRE DATOS Y GRÁFICOS

El gráfico debe representar exactamente los datos mostrados.

Si una tabla contiene:

```text
Enero
Febrero
Marzo
```

el gráfico correspondiente debe utilizar la misma fuente de datos.

No mantener valores duplicados manualmente en diferentes componentes.

---

# 22. COMPARACIÓN DE DATASETS

La pantalla `ComparacionAnalisis.tsx` debe permitir comparar datasets de manera clara.

Flujo:

```text
Dataset A
       +
Dataset B
       ↓
Identificar dimensiones comparables
       ↓
Comparar métricas
       ↓
Detectar diferencias
       ↓
Mostrar resultados
```

---

# 23. COMPARACIONES

Las comparaciones pueden incluir:

```text
Ventas
Unidades
Clientes
Productos
Categorías
Períodos
Regiones
Canales
```

Siempre verificar que ambos datasets contengan información comparable.

---

# 24. SIDE-BY-SIDE

Para comparación visual:

```text
┌────────────────┬────────────────┐
│ Dataset A      │ Dataset B      │
├────────────────┼────────────────┤
│ Ventas         │ Ventas         │
│ Clientes       │ Clientes       │
│ Productos      │ Productos      │
│ Crecimiento    │ Crecimiento    │
└────────────────┴────────────────┘
```

Las diferencias importantes deben ser fáciles de identificar.

---

# 25. INSIGHTS

Los insights deben derivarse de los datos.

Ejemplo conceptual:

```text
Las ventas aumentaron 14.2% respecto al período anterior.
```

Solamente mostrarlo si el cálculo realmente respalda esa afirmación.

No generar insights inventados.

---

# 26. INSIGHTS AUTOMÁTICOS

Si se implementa generación automática de insights:

```text
Datos
↓
Análisis
↓
Detección de cambios
↓
Reglas
↓
Insight
```

Los insights deben indicar, cuando sea posible:

```text
Qué ocurrió
Cuánto cambió
En qué período
Dónde ocurrió
```

Ejemplo:

```text
Las ventas de la categoría Laptops crecieron 18.6%
durante el último período analizado.
```

---

# 27. ALERTAS

Las alertas pueden utilizarse para:

```text
Caídas importantes
Crecimientos relevantes
Valores anormales
Datos faltantes
Problemas de calidad
```

No convertir cualquier pequeña variación en una alerta.

---

# 28. ESTADOS DE ANALÍTICA

Todas las vistas analíticas deben contemplar:

### Sin dataset

```text
No hay datasets disponibles.
Carga un CSV para comenzar el análisis.
```

### Procesando

```text
Analizando dataset...
```

### Sin resultados

```text
No encontramos datos para los filtros seleccionados.
```

### Error

```text
No pudimos procesar los datos.
```

### Datos disponibles

Mostrar la analítica.

---

# 29. GRANDES DATASETS

No asumir que todos los CSV serán pequeños.

Para datasets grandes:

* Evitar renderizar miles de filas.
* Utilizar paginación.
* Considerar virtualización.
* Evitar cálculos pesados en cada render.
* Procesar solamente la información necesaria.

---

# 30. FECHAS

Las fechas deben mostrarse de forma comprensible.

Ejemplo:

```text
04/09/2026
```

o:

```text
4 sep 2026
```

según el contexto visual.

Mantener consistencia en toda la aplicación.

---

# 31. REPORTES

Los reportes deben comunicar:

```text
Nombre
Categoría
Período
Estado
Fecha
Formato
```

Formatos posibles:

```text
PDF
CSV
Excel
```

No mostrar formatos como disponibles si todavía no están implementados.

---

# 32. EXPORTACIÓN

Antes de exportar:

```text
Datos actuales
+
Filtros activos
+
Período
↓
Dataset final
↓
Exportación
```

El usuario debe entender qué información está exportando.

---

# 33. DASHBOARD ANALÍTICO

Una estructura recomendada:

```text
┌─────────────────────────────────────────┐
│ Título + período + filtros              │
├──────────┬──────────┬──────────┬────────┤
│ KPI      │ KPI      │ KPI      │ KPI    │
├─────────────────────┬───────────────────┤
│ Tendencia           │ Distribución      │
│                     │                   │
├─────────────────────┴───────────────────┤
│ Tabla / Ranking / Detalle               │
└─────────────────────────────────────────┘
```

No utilizar esta estructura obligatoriamente.

Adaptarla a cada caso de uso.

---

# 34. FILTROS GLOBALES

Si varios gráficos dependen de los mismos filtros, evitar implementar filtros independientes que produzcan resultados inconsistentes.

Preferir:

```text
Filtros globales
       ↓
Estado compartido
       ↓
KPIs
Gráficos
Tablas
Insights
```

Todos deben representar el mismo contexto filtrado.

---

# 35. CONSISTENCIA ANALÍTICA

Una pantalla debe mantener un único contexto de análisis.

Si el usuario selecciona:

```text
Período: Enero - Marzo
Región: Lima
Categoría: Laptops
```

los KPIs, gráficos, tablas e insights deben respetar esos filtros.

No mostrar datos de otro contexto accidentalmente.

---

# 36. RESPONSIVE ANALYTICS

En desktop:

```text
Filtros
↓
KPIs
↓
Gráficos
↓
Tablas
```

En mobile:

```text
Filtros colapsables
↓
KPIs apilados
↓
Gráficos adaptados
↓
Tablas con scroll
```

Nunca permitir que un gráfico o tabla rompa el layout móvil.

---

# 37. ACCESIBILIDAD DE GRÁFICOS

No depender únicamente del color.

Cuando sea posible:

* Mostrar valores.
* Utilizar etiquetas.
* Proporcionar contexto textual.
* Utilizar iconos para dirección.
* Mantener suficiente contraste.

---

# 38. RENDIMIENTO

Evitar recalcular todo el dataset en cada render.

Cuando existan cálculos costosos:

* Evaluar `useMemo`.
* Procesar datos antes de renderizar.
* Dividir responsabilidades.
* Evitar transformar grandes arrays innecesariamente.

No utilizar optimizaciones sin necesidad.

---

# 39. SEPARACIÓN DE RESPONSABILIDADES

Evitar:

```text
Componente
├── leer CSV
├── validar CSV
├── calcular KPIs
├── filtrar datos
├── generar gráficos
├── renderizar UI
└── exportar
```

Preferir:

```text
Carga
  ↓
Procesamiento
  ↓
Transformación
  ↓
Métricas
  ↓
UI
```

Preparar la arquitectura para futuros services/hooks.

---

# 40. MOCK DATA

Los datos mock deben permitir probar:

```text
Estado normal
Estado vacío
Estado con crecimiento
Estado con disminución
Estado con datos faltantes
Estado con errores
```

Esto permite verificar correctamente la UI analítica.

---

# 41. NO INVENTAR MÉTRICAS

Regla crítica:

> Si no existe información suficiente para calcular una métrica, no inventarla.

Ejemplo:

Si el dataset no tiene:

```text
cantidad de clientes
```

no mostrar:

```text
Clientes activos: 5,240
```

salvo que ese valor provenga de otra fuente definida.

---

# 42. NO CONFUNDIR CORRELACIÓN CON CAUSALIDAD

Un cambio simultáneo no demuestra que una variable sea causa de otra.

Evitar insights como:

```text
Las ventas aumentaron porque aumentó el tráfico.
```

si solamente se observa que ambas variables aumentaron.

Preferir:

```text
Las ventas y el tráfico aumentaron durante el mismo período.
```

---

# 43. PRECISIÓN

No mostrar demasiados decimales.

Ejemplo:

```text
12.4%
```

es generalmente más útil visualmente que:

```text
12.438291847%
```

La precisión debe depender del tipo de métrica.

---

# 44. EXPERIENCIA DEL ANALISTA

El analista debe poder responder rápidamente:

```text
¿Qué pasó?
¿Por qué es relevante?
¿Dónde ocurrió?
¿Cuánto cambió?
¿En qué período?
¿Qué puedo hacer con esta información?
```

La UI debe facilitar estas respuestas.

---

# 45. VALIDACIÓN FINAL

Antes de considerar terminada una funcionalidad analítica:

```text
□ Los datos son correctos.
□ Las métricas tienen una fórmula válida.
□ Los filtros funcionan.
□ Los gráficos coinciden con los datos.
□ Las tablas coinciden con los filtros.
□ Los insights no inventan información.
□ Loading funciona.
□ Empty funciona.
□ Error funciona.
□ Responsive funciona.
□ TypeScript no tiene errores.
□ ESLint no tiene errores.
□ Build funciona.
```

Ejecutar:

```bash
npm run lint
npm run build
```

---

# 46. PRINCIPIO FINAL

RetailMetrics 360 debe convertir:

```text
DATOS
  ↓
INFORMACIÓN
  ↓
ANÁLISIS
  ↓
INSIGHT
  ↓
DECISIÓN
```

La interfaz no debe limitarse a mostrar datos.

Debe ayudar al usuario a comprenderlos.
