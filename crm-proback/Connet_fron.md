# Integración con el Frontend (CRM Pro) - API Endpoints

Este documento describe todos los endpoints disponibles en el backend de FastAPI (CRM Pro) para consumirlos desde el frontend.

## Configuración Base

1. **URL Base del API:**
   El backend se ejecuta por defecto en `http://localhost:8000`.
   Para todas las peticiones a la API, el prefijo base es `/api/v1`.

2. **Autenticación (JWT):**
   La mayoría de endpoints (excepto login/OTP) requieren que envíes un token de acceso en los headers:
   ```http
   Authorization: Bearer <tu_token_aqui>
   ```

---

## 🔐 1. Autenticación (Auth)

### Solicitar Código OTP
- **Método:** `POST`
- **URL:** `/api/v1/auth/request-otp`
- **Body (JSON):**
  ```json
  { "email": "usuario@ejemplo.com" }
  ```
- **Descripción:** Envía un código OTP al correo. Si el usuario no existe, lo crea.

### Verificar Código OTP
- **Método:** `POST`
- **URL:** `/api/v1/auth/verify-otp`
- **Body (JSON):**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "code": "123456"
  }
  ```
- **Descripción:** Verifica el OTP y devuelve el token de acceso JWT.
- **Respuesta:**
  ```json
  {
    "access_token": "eyJhb...",
    "token_type": "bearer"
  }
  ```

### Login con Contraseña (Alternativo)
- **Método:** `POST`
- **URL:** `/api/v1/auth/login`
- **Body (Form-Data):** `username` y `password`
- **Descripción:** Permite iniciar sesión de manera tradicional.

---

## 👥 2. Gestión de Usuarios (Users)

*Requieren token de autenticación.*

### Listar Usuarios
- **Método:** `GET`
- **URL:** `/api/v1/users/`
- **Descripción:** Devuelve una lista de todos los usuarios registrados.

### Crear Usuario
- **Método:** `POST`
- **URL:** `/api/v1/users/`
- **Body (JSON):**
  ```json
  {
    "email": "nuevo@ejemplo.com",
    "password": "password123",
    "full_name": "Nombre Apellido",
    "role": "analyst",
    "status": "active"
  }
  ```

### Obtener Usuario por ID
- **Método:** `GET`
- **URL:** `/api/v1/users/{user_id}`
- **Descripción:** Devuelve los datos de un usuario específico.

### Actualizar Usuario
- **Método:** `PUT`
- **URL:** `/api/v1/users/{user_id}`
- **Body (JSON):** Campos a actualizar (ej. `full_name`, `status`, etc).

### Eliminar Usuario
- **Método:** `DELETE`
- **URL:** `/api/v1/users/{user_id}`
- **Descripción:** Elimina un usuario por su ID.

---

## 🏢 3. Espacios de Trabajo (Workspaces)

*Requieren token de autenticación.*

### Listar Workspaces
- **Método:** `GET`
- **URL:** `/api/v1/workspaces/`
- **Descripción:** Devuelve la lista de workspaces a los que el usuario tiene acceso.

### Crear Workspace
- **Método:** `POST`
- **URL:** `/api/v1/workspaces/`
- **Body (JSON):**
  ```json
  {
    "name": "Mi Espacio",
    "description": "Descripción opcional"
  }
  ```

### Obtener Workspace por ID
- **Método:** `GET`
- **URL:** `/api/v1/workspaces/{workspace_id}`

### Actualizar Workspace
- **Método:** `PUT`
- **URL:** `/api/v1/workspaces/{workspace_id}`
- **Body (JSON):** Campos a actualizar.

### Eliminar Workspace
- **Método:** `DELETE`
- **URL:** `/api/v1/workspaces/{workspace_id}`

---

## 📊 4. Datasets

*Requieren token de autenticación.*

### Subir Dataset (CSV)
- **Método:** `POST`
- **URL:** `/api/v1/datasets/upload`
- **Headers:** `Content-Type: multipart/form-data`, `Authorization: Bearer <tu_token_aqui>`
- **Body:** Archivo `.csv` en el campo `file`.
- **Descripción:** Sube un archivo CSV y lo guarda como una tabla dinámica en PostgreSQL. También registra la información del archivo en la tabla maestra `datasets`.
- **Respuesta Exitosa:**
  ```json
  {
    "message": "Dataset uploaded and processed successfully",
    "dataset_id": 1,
    "table_name": "dataset_ventas_q3",
    "rows": 1500,
    "columns": ["col_1", "col_2"]
  }
  ```

### Listar Datasets
- **Método:** `GET`
- **URL:** `/api/v1/datasets/`
- **Headers:** `Authorization: Bearer <tu_token_aqui>`
- **Descripción:** Devuelve una lista de los datasets subidos por el usuario autenticado.

### Eliminar Dataset
- **Método:** `DELETE`
- **URL:** `/api/v1/datasets/{dataset_id}`
- **Headers:** `Authorization: Bearer <tu_token_aqui>`
- **Descripción:** Elimina un dataset (sus metadatos) basado en el ID proporcionado, asegurando que pertenezca al usuario.

---

## 🤖 5. Analítica e Inteligencia Artificial (Analytics)

*Requieren token de autenticación.*

### Chat con el Dataset (Gemini)
- **Método:** `POST`
- **URL:** `/api/v1/analytics/chat`
- **Body (JSON):**
  ```json
  {
    "query": "¿Cuál fue la tasa de conversión promedio por sucursal durante el Q3 y cómo se compara con el Q2?",
    "table_name": "dataset_ventas"
  }
  ```
- **Descripción:** Toma una pregunta en lenguaje natural, analiza los datos de la tabla especificada (usando un servicio como Google Gemini) y devuelve una respuesta contextual con la métrica o la respuesta solicitada.

  **Ejemplos de consultas analíticas avanzadas (Sector Retail / CRM):**
  - *Tendencias:* "Muestra la tendencia de ventas semanales del producto X durante los últimos 6 meses."
  - *Comparaciones:* "Compara el ticket promedio de los clientes recurrentes vs nuevos clientes en la región Norte."
  - *KPIs:* "¿Cuál es el Lifetime Value (LTV) estimado de los clientes adquiridos en la campaña de verano?"
  - *Análisis de Cohortes:* "Genera un análisis de retención mensual para los usuarios que se registraron en enero."
  - *Segmentación:* "Identifica el top 5% de clientes por volumen de compra y describe sus categorías preferidas."

---

## 🧠 6. Biometría y Emociones (Amazon Rekognition)

Módulo integral de visión computacional y biometría facial soportado por Amazon Rekognition.

### 6.1 Inicializar Colección
- **Método:** `POST`
- **URL:** `/api/v1/rekognition/collection/init`
- **Body (JSON - Opcional):**
  ```json
  { "collection_id": "crm-retailmetrics-faces" }
  ```
- **Descripción:** Verifica o crea la colección en AWS Rekognition.

### 6.2 Enrolamiento Biométrico Facial (Index Faces)
- **Método:** `POST`
- **URL:** `/api/v1/rekognition/index-face` (o `/index-faces`)
- **Body (JSON o Multipart FormData):**
  ```json
  {
    "user_email": "usuario@retailmetrics.com",
    "user_name": "Nombre Usuario",
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "collection_id": "crm-retailmetrics-faces"
  }
  ```
- **Respuesta (200 OK):** Retorna `face_id`, medidas antropométricas (`interocular_distance_mm`, `facial_symmetry_score`, `pose`, `quality`), confianza y persiste en `user_biometrics`.

### 6.3 Verificación Facial y Login Biométrico
- **Método:** `POST`
- **URL:** `/api/v1/rekognition/verify-face`
- **Body (JSON o Multipart):**
  ```json
  {
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "collection_id": "crm-retailmetrics-faces",
    "similarity_threshold": 85.0
  }
  ```
- **Respuesta (200 OK):** Si hay coincidencia, retorna `matched: true`, `user_email`, `user_name`, `face_id`, `similarity`, `confidence`, y emite el `access_token` JWT.

### 6.4 Detección de Emociones y Atributos Faciales
- **Método:** `POST`
- **URL:** `/api/v1/rekognition/detect-emotions`
- **Body (JSON o Multipart con campo 'image'):**
  ```json
  {
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "source_type": "live_camera"
  }
  ```
- **Respuesta (200 OK):** Clasificación de las 8 emociones estándar de AWS (`HAPPY`, `CALM`, `SURPRISED`, `CONFUSED`, `SAD`, `ANGRY`, `DISGUSTED`, `FEAR`), atributos faciales (sonrisa, ojos abiertos, boca abierta, gafas, lentes de sol, rango de edad, género) y métricas de calidad.

### 6.5 Consultar Estado Biométrico de Usuario
- **Método:** `GET`
- **URL:** `/api/v1/rekognition/users/{user_email}/status`
- **Respuesta:** `{ "enrolled": true/false, "user_email": "...", "face_id": "...", ... }`

### 6.6 Historial de Emociones
- **Método:** `GET`
- **URL:** `/api/v1/rekognition/emotions/history?limit=20`
- **Respuesta:** Registro histórico de fluctuaciones emocionales registradas.
