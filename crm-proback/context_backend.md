# Contexto Backend: RetailMetrics 360

## 1. Resumen del Proyecto Backend

El backend de **RetailMetrics 360** debe ser una API robusta y escalable diseñada para soportar una plataforma CRM SaaS B2B orientada al análisis de datos del sector retail. Su principal responsabilidad será manejar la lógica de negocio, la seguridad (autenticación y autorización basada en roles), el procesamiento de archivos pesados (CSV), y la provisión de datos estadísticos para el frontend (React 19).

### Objetivos Clave:
*   **Gestión de Accesos (RBAC):** Control estricto de roles (`admin`, `analyst`, `manager` futuro).
*   **Procesamiento de Datos:** Recepción, validación y almacenamiento eficiente de datasets (CSV).
*   **Análisis y Métricas:** Proveer endpoints optimizados para filtrado, comparación y visualización de tendencias.
*   **Multi-tenant (Workspaces):** Aislamiento de datos mediante "workspaces" para diferentes equipos o clientes.

---

## 2. Flujos de Trabajo y Lógica de Programación

### A. Flujo de Autenticación y Autorización
1.  **Login:** El usuario envía credenciales. El backend valida y retorna un JWT (JSON Web Token) con el rol y los workspaces asignados.
2.  **Protección de Rutas (Middleware):** Cada petición a la API pasa por un middleware que verifica la validez del token y los permisos (ej. solo el `admin` puede crear usuarios).

### B. Flujo de Procesamiento de CSV (Analista)
1.  **Carga (Upload):** El analista sube un CSV (multipart/form-data).
2.  **Validación y Parsing:** El backend valida el formato, tamaño y estructura esperada del dataset.
3.  **Almacenamiento:** Los datos se insertan en masa (Bulk Insert) en la base de datos, asociados al `workspace_id`.
4.  **Confirmación:** El backend responde con un resumen (filas procesadas, errores) y el ID del dataset.

### C. Flujo de Exploración y Análisis
1.  **Petición:** El frontend solicita datos de un dataset específico, enviando parámetros de filtrado, paginación u ordenamiento.
2.  **Consulta Dinámica:** El backend construye una consulta SQL/NoSQL eficiente aplicando los filtros.
3.  **Respuesta:** Devuelve un JSON optimizado con los datos crudos o agregaciones (sumas, promedios, agrupaciones) para los gráficos.

---

## 3. Endpoints de la API (RESTful)

A continuación, se detallan los endpoints propuestos estructurados por módulos funcionales. El prefijo base de la API será `/api/v1`.

### 3.1. Autenticación (`/auth`)
*   `POST /auth/login` - Inicia sesión y devuelve un JWT.
*   `POST /auth/logout` - Invalida el token (opcional, dependiendo de la estrategia).
*   `GET /auth/me` - Obtiene el perfil del usuario autenticado.

### 3.2. Gestión de Usuarios (`/users`) - *Requiere rol Admin*
*   `GET /users` - Lista todos los usuarios (con paginación).
*   `POST /users` - Crea un nuevo usuario (asigna rol y workspace).
*   `PUT /users/:id` - Actualiza información de un usuario.
*   `DELETE /users/:id` - Desactiva o elimina un usuario.

### 3.3. Workspaces (`/workspaces`)
*   `GET /workspaces` - Lista los espacios de trabajo accesibles por el usuario.
*   `POST /workspaces` - (Admin) Crea un nuevo espacio de trabajo.
*   `GET /workspaces/:id` - Obtiene detalles y métricas resumidas del workspace.
*   `PUT /workspaces/:id` - (Admin) Actualiza el workspace.

### 3.4. Datasets y CSV (`/datasets`) - *Requiere rol Analyst/Admin*
*   `GET /datasets` - Lista los datasets cargados en el workspace activo.
*   `POST /datasets/upload` - Endpoint para cargar el archivo CSV. Requiere validación de esquema.
*   `GET /datasets/:id` - Obtiene metadata del dataset (fecha, columnas, filas).
*   `DELETE /datasets/:id` - Elimina un dataset.

### 3.5. Exploración y Análisis (`/analytics`)
*   `GET /analytics/dataset/:id/data` - Obtiene los datos tabulares del dataset (soporta query params: `?page=1&limit=50&filter_by=sales>100`).
*   `POST /analytics/compare` - Recibe dos IDs de datasets y devuelve un objeto con diferencias o comparaciones métricas.
*   `GET /analytics/trends` - (Admin) Devuelve datos agregados para dashboards principales (KPIs globales).

### 3.6. Reportes (`/reports`)
*   `GET /reports` - Lista los informes generados.
*   `POST /reports/generate` - Inicia la generación de un informe PDF o Excel de forma asíncrona.
*   `GET /reports/:id/download` - Descarga el archivo del informe generado.

---

## 4. Estructura de Base de Datos Recomendada (Relacional - PostgreSQL)

*   **Users:** `id`, `name`, `email`, `password_hash`, `role` (admin, analyst, manager), `created_at`.
*   **Workspaces:** `id`, `name`, `description`, `created_at`.
*   **User_Workspaces:** Tabla pivote para relación muchos a muchos entre usuarios y workspaces.
*   **Datasets:** `id`, `workspace_id`, `uploaded_by`, `filename`, `status` (processing, ready, error), `created_at`.
*   **Dataset_Rows (o estructura particionada):** `id`, `dataset_id`, `json_data` (o columnas tipadas).

## 5. Recomendaciones de Stack Backend
*   **Lenguaje/Framework:** Node.js (Express o NestJS) o Python (FastAPI o Django), ideales para manejar JSON y procesamiento de datos.
*   **Base de Datos:** PostgreSQL (excelente soporte relacional y JSONB para los datasets dinámicos).
*   **Seguridad:** JWT, encriptación bcrypt, CORS configurado para aceptar peticiones solo del dominio frontend.
