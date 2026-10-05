# 🧠 Contexto de Integración Técnica: Amazon Rekognition (Biometría y Emociones)
> **RetailMetrics 360** — Resumen exhaustivo de la arquitectura, modelos, esquemas, servicios, endpoints REST y conectividad frontend creados e implementados para visión computacional con **AWS Rekognition**.

---

## 📌 1. Resumen Ejecutivo de la Implementación

Se ha desarrollado y desplegado la capa de backend completa para dar soporte a dos capacidades biométricas críticas del sistema:

1. **Enrolamiento Biométrico y Medición Facial (Face Registration & Indexing):**
   * **AWS Rekognition:** `CreateCollection`, `IndexFaces`.
   * **Base de Datos:** Tabla `user_biometrics` en PostgreSQL.
   * **Medidas Antropométricas Calculadas:**
     * Distancia Interocular (IOD) extrapolada a escala humana física (~62-66 mm).
     * Simetría facial bilateral (% de balance respecto al eje nasal).
     * Ángulos cefálicos de pose (`Pitch`, `Roll`, `Yaw`).
     * Calidad de fotograma (`Brightness`, `Sharpness`, `is_optimal`).
     * Coordenadas de delimitación normalizada (`BoundingBox`).

2. **Verificación Facial e Inicio de Sesión Biométrico (Biometric Login):**
   * **AWS Rekognition:** `SearchFacesByImage` con umbral configurable (`similarity_threshold: 85.0%`).
   * **Autenticación:** Al confirmar la coincidencia facial, busca al usuario en la base de datos y **emite un JWT `access_token`** válido con roles asignados.

3. **Detección y Clasificación Emocional (Emotions Detection):**
   * **AWS Rekognition:** `DetectFaces` con `Attributes=['ALL']`.
   * **Base de Datos:** Tabla `emotion_logs` para auditoría y analítica.
   * **Clasificación:** Las 8 emociones canónicas ordenadas por confianza descendente:
     `HAPPY`, `CALM`, `SURPRISED`, `CONFUSED`, `SAD`, `ANGRY`, `DISGUSTED`, `FEAR`.
   * **Atributos Faciales:** Sonrisa, ojos abiertos, boca abierta, gafas, lentes de sol, rango de edad y género.

---

## ⚙️ 2. Variables de Entorno Configuradas

### Backend (`crm-proback/.env`)
```bash
# ==============================================================================
# AWS CREDENTIALS & REKOGNITION CONFIGURATION
# ==============================================================================
AWS_DEFAULT_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIASJVITMJ6WYVTDGJ3"
AWS_SECRET_ACCESS_KEY="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"
AWS_REKOGNITION_COLLECTION_ID="crm-retailmetrics-faces"
AWS_REKOGNITION_CONFIDENCE_THRESHOLD=80.0
AWS_REKOGNITION_QUALITY_FILTER="AUTO"
```

### Frontend (`crm-profron/.env`)
```bash
# ==============================================================================
# BACKEND API & AWS REKOGNITION ENDPOINTS
# ==============================================================================
VITE_API_BASE_URL="http://localhost:8000"
VITE_AWS_REGION="us-east-1"
VITE_AWS_REKOGNITION_COLLECTION_ID="crm-retailmetrics-faces"
VITE_AWS_REKOGNITION_EMOTIONS_ENDPOINT="http://localhost:8000/api/v1/rekognition/detect-emotions"
```

---

## 🗄️ 3. Modelos de Base de Datos Creados (`app/models/biometrics.py`)

Tablas creadas y migradas en PostgreSQL:

### 3.1. Tabla `user_biometrics`
```python
class UserBiometrics(Base):
    __tablename__ = "user_biometrics"

    id = Column(String(64), primary_key=True)                      # UUID generado
    user_id = Column(Integer, ForeignKey("users.id"), index=True) # Referencia opcional al usuario
    user_email = Column(String(255), nullable=False, unique=True) # Correo corporativo
    user_name = Column(String(255), nullable=False)               # Nombre completo
    collection_id = Column(String(128), nullable=False)           # crm-retailmetrics-faces
    face_id = Column(String(128), unique=True, index=True)        # FaceId de AWS Rekognition
    external_image_id = Column(String(255), nullable=False)       # ID sanitizado (ej: ana_silva_retailmetrics_com)
    confidence = Column(Float, nullable=False)                    # Confianza de detección (>98%)
    interocular_distance_mm = Column(Float, nullable=True)        # IOD mm calibrado
    facial_symmetry_score = Column(Float, nullable=True)          # Índice de simetría bilateral (0-100)
    pose_pitch = Column(Float, nullable=True)                     # Inclinación vertical
    pose_yaw = Column(Float, nullable=True)                       # Giro horizontal
    pose_roll = Column(Float, nullable=True)                      # Rotación en el plano
    quality_brightness = Column(Float, nullable=True)             # Luminancia (0-100)
    quality_sharpness = Column(Float, nullable=True)              # Nitidez (0-100)
    raw_face_record = Column(JSON, nullable=True)                 # Payload crudo AWS
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

### 3.2. Tabla `emotion_logs`
```python
class EmotionLog(Base):
    __tablename__ = "emotion_logs"

    id = Column(String(64), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    source_type = Column(String(32), default="live_camera")       # 'live_camera' | 'uploaded_image'
    primary_emotion = Column(String(32), nullable=False)          # HAPPY, CALM, SURPRISED, etc.
    primary_confidence = Column(Float, nullable=False)
    secondary_emotion = Column(String(32), nullable=True)
    is_smiling = Column(Boolean, default=False)
    smile_confidence = Column(Float, nullable=True)
    eyes_open = Column(Boolean, default=True)
    mouth_open = Column(Boolean, default=False)
    age_range_low = Column(Integer, nullable=True)
    age_range_high = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    raw_emotions_breakdown = Column(JSON, nullable=True)          # Array con las 8 emociones completas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
```

---

## 🐍 4. Servicio AWS Rekognition (`app/services/rekognition_service.py`)

Encapsula la interacción con Boto3 y los algoritmos biométricos:

- **`get_rekognition_client()`**: Factoría autenticada con credenciales de `app.core.config.settings`.
- **`decode_image_bytes(image_input)`**: Normaliza y decodifica Base64 eliminando encabezados `data:image/...;base64,` o recibe `bytes` de multipart.
- **`ensure_collection_exists(collection_id)`**: Inicializa automáticamente la colección `crm-retailmetrics-faces` mediante `DescribeCollection` y `CreateCollection`.
- **`index_user_face(image_input, user_email, collection_id)`**: Ejecuta `IndexFaces`, extrae landmarks faciales y calcula la distancia interocular (IOD mm), simetría bilateral y pose.
- **`search_face_in_collection(image_input, collection_id, threshold)`**: Ejecuta `SearchFacesByImage` para buscar al usuario por vector biométrico.
- **`detect_face_emotions(image_input, source_type)`**: Ejecuta `DetectFaces` con `Attributes=['ALL']`, ordena las 8 emociones estándar y mapea los atributos faciales en formatos *snake_case* y *camelCase*.

---

## 🔌 5. Catálogo Completo de Endpoints REST

Prefijo base: `http://localhost:8000/api/v1/rekognition`

| Método | Endpoint | Propósito | Formatos de Entrada |
| :--- | :--- | :--- | :--- |
| `POST` | `/collection/init` | Inicializa/verifica la colección en AWS | JSON |
| `POST` | `/index-face` | Enrola rostro y calcula medidas biométricas | JSON (`image_base64`) o `FormData` |
| `POST` | `/verify-face` | Login biométrico y emisión de JWT | JSON (`image_base64`) o `FormData` |
| `POST` | `/detect-emotions` | Detección de las 8 emociones y atributos | JSON (`image_base64`) o `FormData` |
| `GET`  | `/users/{user_email}/status` | Consulta estado biométrico de un usuario | Path Parameter |
| `GET`  | `/emotions/history` | Historial de fluctuación emocional | Query Param `?limit=20` |

---

## 📋 6. Especificación de Contratos de Entrada y Salida

### 6.1. `POST /api/v1/rekognition/index-face`
#### Request:
```json
{
  "user_email": "carlos.rodriguez@retailmetrics.com",
  "user_name": "Carlos Rodríguez",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "collection_id": "crm-retailmetrics-faces"
}
```
#### Response (200 OK):
```json
{
  "success": true,
  "face_id": "c8942b03-91c8-47bc-8a42-7a0984920194",
  "collection_id": "crm-retailmetrics-faces",
  "external_image_id": "carlos_rodriguez_retailmetrics_com",
  "confidence": 99.4,
  "measurements": {
    "interocular_distance_mm": 64.2,
    "facial_symmetry_score": 97.8,
    "pose": { "pitch": 0.4, "roll": -0.2, "yaw": 0.8 },
    "quality": { "brightness": 82.5, "sharpness": 89.1, "is_optimal": true },
    "bounding_box": { "width": 0.44, "height": 0.58, "left": 0.28, "top": 0.21 },
    "confidence": 99.4
  },
  "registered_at": "2026-10-05T17:30:00.000Z",
  "provider": "Amazon Rekognition"
}
```

---

### 6.2. `POST /api/v1/rekognition/verify-face`
#### Request:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "similarity_threshold": 85.0
}
```
#### Response (200 OK):
```json
{
  "matched": true,
  "user_email": "carlos.rodriguez@retailmetrics.com",
  "user_name": "Carlos Rodríguez",
  "face_id": "c8942b03-91c8-47bc-8a42-7a0984920194",
  "similarity": 98.7,
  "confidence": 99.4,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Identidad biometrica verificada exitosamente con Amazon Rekognition."
}
```

---

### 6.3. `POST /api/v1/rekognition/detect-emotions`
#### Request:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "source_type": "live_camera"
}
```
#### Response (200 OK):
```json
{
  "id": "rekog-emot-1791218000-84a1e9",
  "timestamp": "12:45:10",
  "primary_emotion": { "type": "HAPPY", "confidence": 98.4 },
  "secondary_emotion": { "type": "CALM", "confidence": 1.2 },
  "emotions": [
    { "type": "HAPPY", "confidence": 98.4 },
    { "type": "CALM", "confidence": 1.2 },
    { "type": "SURPRISED", "confidence": 0.2 },
    { "type": "CONFUSED", "confidence": 0.1 },
    { "type": "SAD", "confidence": 0.05 },
    { "type": "ANGRY", "confidence": 0.03 },
    { "type": "DISGUSTED", "confidence": 0.01 },
    { "type": "FEAR", "confidence": 0.01 }
  ],
  "facial_attributes": {
    "smile": { "value": true, "confidence": 99.1 },
    "eyes_open": { "value": true, "confidence": 98.7 },
    "mouth_open": { "value": false, "confidence": 94.2 },
    "eyeglasses": { "value": false, "confidence": 96.5 },
    "sunglasses": { "value": false, "confidence": 99.0 },
    "age_range": { "low": 24, "high": 34 },
    "gender": { "value": "Male", "confidence": 98.4 }
  },
  "quality": { "brightness": 82.0, "sharpness": 88.5, "is_optimal": true },
  "bounding_box": { "width": 0.44, "height": 0.58, "left": 0.28, "top": 0.21 },
  "face_confidence": 99.6,
  "source_type": "live_camera"
}
```

---

## 💻 7. Consumo en Frontend (React / TypeScript)

### 7.1. Servicio `amazonRekognitionService.ts`
Ubicación: `crm-profron/src/features/portal-cursos/services/amazonRekognitionService.ts`

- **Enrolamiento:**
  ```typescript
  import { registerFaceWithAmazonRekognition } from './amazonRekognitionService';

  const result = await registerFaceWithAmazonRekognition({
    userFullName: "Carlos Rodríguez",
    userEmail: "carlos.rodriguez@retailmetrics.com",
    videoEl: videoRef.current
  });
  console.log("Enrolado con FaceId:", result.faceId);
  ```

- **Login Biométrico:**
  ```typescript
  import { verifyFaceWithAmazonRekognition } from './amazonRekognitionService';

  const authResult = await verifyFaceWithAmazonRekognition({
    videoEl: videoRef.current,
    similarityThreshold: 85.0
  });

  if (authResult.matched && authResult.accessToken) {
    localStorage.setItem('token', authResult.accessToken);
    // Usuario autenticado exitosamente
  }
  ```

### 7.2. Servicio `awsRekognitionEmotionsService.ts`
Ubicación: `crm-profron/src/features/modules/microsoft-azure/services/awsRekognitionEmotionsService.ts`

- **Detección de emociones desde Blob o imagen subida:**
  ```typescript
  import { detectEmotionsFromBlob } from './awsRekognitionEmotionsService';

  const detection = await detectEmotionsFromBlob(imageBlob);
  console.log("Emoción principal detectada:", detection.primaryEmotion.Type);
  ```

---

## 🧪 8. Pruebas Unitarias Automatizadas (`tests/test_rekognition.py`)

Se implementó una suite con **6 pruebas automatizadas** que validan:
1. `test_collection_init`: Creación y verificación de la colección AWS.
2. `test_get_user_biometric_status_not_found`: Respuesta controlada para usuarios no enrolados.
3. `test_emotions_history`: Consulta del historial emocional.
4. `test_detect_emotions_validation`: Rechazo HTTP 422 para payloads vacíos.
5. `test_index_face_mock_flow`: Enrolamiento completo con cálculo antropométrico.
6. `test_verify_face_mock_flow`: Verificación biométrica facial y generación de token JWT.

**Resultado de ejecución:**
```bash
python -m pytest tests/test_rekognition.py
# ======================== 6 passed in 11.54s ========================
```

---

## 📂 9. Archivos Creados y Modificados

### Archivos Creados
- `crm-proback/app/api/v1/rekognition.py`: Router FastAPI con los 6 endpoints biométricos.
- `crm-proback/app/models/biometrics.py`: Modelos SQLAlchemy `UserBiometrics` y `EmotionLog`.
- `crm-proback/app/schemas/rekognition.py`: Esquemas Pydantic V2 de validación y respuesta.
- `crm-proback/app/services/rekognition_service.py`: Lógica Boto3 y cálculos antropométricos.
- `crm-proback/tests/test_rekognition.py`: Suite de tests unitarios Pytest.
- `crm-proback/contextaws.md`: Este documento técnico integral.

### Archivos Modificados
- `crm-proback/app/main.py`: Registro del router `/api/v1/rekognition` y verificación de tablas en `lifespan`.
- `crm-proback/app/core/config.py`: Definición de variables AWS Rekognition en `pydantic-settings`.
- `crm-proback/app/models/__init__.py`: Exportación de `UserBiometrics` y `EmotionLog`.
- `crm-proback/app/api/v1/__init__.py`: Exportación del módulo `rekognition`.
- `crm-proback/requirements.txt`: Agregado `boto3>=1.34.0`.
- `crm-proback/.env`: Variables AWS y colección.
- `crm-proback/Connet_fron.md`: Documentación de integración de API para frontend.
- `crm-profron/.env`: Variables `VITE_API_BASE_URL` y `VITE_AWS_REKOGNITION_EMOTIONS_ENDPOINT`.
- `crm-profron/src/features/portal-cursos/services/amazonRekognitionService.ts`: Conectado a `/index-face` y `/verify-face`.
- `crm-profron/src/features/modules/microsoft-azure/services/awsRekognitionEmotionsService.ts`: Conectado a `/detect-emotions`.

---
*RetailMetrics 360 — Documento de Arquitectura y Referencia Técnica de AWS Rekognition.*
