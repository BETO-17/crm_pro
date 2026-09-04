# UI/UX Skill

## Propósito

Diseñar interfaces profesionales para RetailMetrics 360, manteniendo una experiencia SaaS B2B coherente, clara y orientada al análisis de datos.

---

# 1. Principio principal

La interfaz debe ayudar al usuario a tomar decisiones.

No agregar elementos visuales únicamente porque "se ven bien".

Cada componente debe responder:

```text
¿Qué información muestra?
¿Por qué es importante?
¿Qué acción permite realizar?
```

---

# 2. Jerarquía visual

Priorizar:

```text
Título
↓
Contexto
↓
Métrica principal
↓
Información secundaria
↓
Acciones
```

Las acciones principales deben destacar visualmente.

---

# 3. Dashboard

Un dashboard debe priorizar:

```text
KPIs
↓
Tendencias
↓
Comparaciones
↓
Alertas
↓
Detalles
```

No llenar una pantalla con gráficos innecesarios.

---

# 4. KPI Cards

Una métrica debe mostrar, cuando corresponda:

```text
Nombre
Valor
Variación
Dirección
Período
```

Ejemplo conceptual:

```text
Ventas Totales
S/ 245,800
↑ 12.4%
vs. período anterior
```

---

# 5. Gráficos

Cada gráfico debe responder una pregunta de negocio.

Ejemplos:

```text
¿Cuánto vendimos?
¿Cómo evolucionaron las ventas?
¿Qué categoría creció más?
¿Qué sector genera más ingresos?
¿Qué período presenta una caída?
```

Evitar gráficos redundantes.

---

# 6. Colores

Mantener consistencia con el sistema visual existente.

Usar color para comunicar:

```text
Success
Warning
Error
Info
Neutral
```

No utilizar demasiados colores simultáneamente.

---

# 7. Estados

Toda interfaz de datos debe diseñar:

### Loading

Mostrar que la información está procesándose.

### Empty

Explicar qué falta y qué puede hacer el usuario.

### Error

Explicar el problema y, cuando sea posible, ofrecer una acción para recuperarse.

### Success

Mostrar la información de forma clara.

---

# 8. Formularios

Los formularios deben:

* Tener labels.
* Indicar campos obligatorios.
* Mostrar errores cerca del campo.
* Mantener valores ingresados cuando sea posible.
* Evitar mensajes ambiguos.

No depender exclusivamente del color para mostrar errores.

---

# 9. Botones

Utilizar jerarquía:

```text
Primary
Secondary
Tertiary
Danger
```

Cada pantalla debe tener una acción principal clara.

No convertir todos los botones en Primary.

---

# 10. Modales

Usar modal para acciones puntuales:

* Crear.
* Editar.
* Confirmar.
* Ver información adicional.

No utilizar modales para páginas completas.

---

# 11. Tablas

Las tablas deben priorizar:

```text
Información importante
↓
Acciones
↓
Filtros
↓
Ordenamiento
```

Evitar demasiadas columnas.

Si existen demasiados datos, permitir:

* Filtros.
* Búsqueda.
* Ordenamiento.
* Paginación.

---

# 12. Sidebar

El sidebar debe:

* Mostrar claramente la sección activa.
* Agrupar navegación relacionada.
* Mantener jerarquía.
* Evitar demasiadas opciones simultáneas.

La navegación debe corresponder al rol.

---

# 13. Admin UX

El administrador debe poder entender rápidamente:

```text
Usuarios
Permisos
Workspaces
Tendencias
Reportes
```

Priorizar eficiencia y control.

---

# 14. Analyst UX

El flujo principal debe ser:

```text
Carga de datos
↓
Observación
↓
Comparación
↓
Análisis
↓
Informe
```

La interfaz debe facilitar este recorrido.

---

# 15. CSV UX

La carga debe explicar claramente:

```text
1. Qué archivo subir.
2. Qué formato acepta.
3. Qué está procesando.
4. Si existen errores.
5. Qué información fue cargada.
```

Utilizar drag & drop cuando corresponda.

---

# 16. Responsive

Desktop:

```text
Sidebar + Topbar + Content
```

Mobile:

```text
Topbar
↓
Navigation compacta
↓
Content
```

Las tablas, cards y gráficos deben adaptarse.

---

# 17. Accesibilidad

Considerar:

* HTML semántico.
* Labels.
* Focus.
* Keyboard navigation.
* Contraste.
* `aria-label`.
* Botones reales.
* Mensajes comprensibles.

Evitar:

```html
<div onClick={...}>
```

cuando corresponda utilizar:

```html
<button>
```

---

# 18. Consistencia

Todos los módulos deben sentirse parte de la misma plataforma.

Mantener consistencia en:

* Espaciado.
* Bordes.
* Radios.
* Tipografía.
* Botones.
* Cards.
* Iconos.
* Estados.
* Formularios.

---

# 19. Regla final

Antes de aprobar una interfaz preguntar:

```text
¿Es clara?
¿Es útil?
¿Es consistente?
¿Es responsive?
¿Es accesible?
¿Tiene estados de error/loading/empty?
¿El usuario sabe qué hacer después?
```

Si alguna respuesta es no, mejorar la interfaz antes de finalizar.

