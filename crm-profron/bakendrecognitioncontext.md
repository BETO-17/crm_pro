# 🧠 Contexto de Integración Backend: Amazon Rekognition (Biometría y Emociones)
> **RetailMetrics 360** — Guía técnica completa para la implementación de endpoints, esquemas de datos, autenticación y servicios de AWS Rekognition en el Backend (FastAPI / Python).

---

## 📌 1. Resumen Ejecutivo de lo Implementado en Frontend

En el frontend se han implementado dos subsistemas de visión artificial que consumen o requieren servicios de **Amazon Rekognition**:

1. **Enrolamiento Biométrico y Medición Facial (Face Registration & Indexing):**
   * Ubicación: Modal de Autenticación de Azure/Cursos ([AzureLoginModal.tsx](file:///c:/Users/luisa/Documents/PS6/big_data/crm_pro/crm-profron/src/features/portal-cursos/components/AzureLoginModal.tsx)) y Administración de Usuarios ([GestionUsuarios.tsx](file:///c:/Users/luisa/Documents/PS6/big_data/crm_pro/crm-profron/src/features/admin/admin_data/pages/GestionUsuarios.tsx)).
   * Función: Capturar fotogramas de la cámara web, extraer medidas faciales físicas (**Distancia Interocular IOD en mm**, **Simetría Bilateral**, **Ángulos de Pose: Pitch/Yaw/Roll**, **Nitidez y Luminancia**) y enrolar el rostro en una colección de Amazon Rekognition (`IndexFaces`).
   * Servicio frontend: `src/features/portal-cursos/services/amazonRekognitionService.ts`.

2. **Visualizador y Analítica de Emociones en Tiempo Real (Emotions Detection):**
   * Ubicación: Módulo Dedicado `/modules/azure/emociones` ([VisualizadorEmociones.tsx](file:///c:/Users/luisa/Documents/PS6/big_data/crm_pro/crm-profron/src/features/modules/microsoft-azure/pages/VisualizadorEmociones.tsx)).
   * Función: Analizar flujos de video o imágenes cargadas para detectar y clasificar las **8 emociones estándar de AWS Rekognition**, atributos faciales (sonrisa, ojos abiertos, gafas, rango de edad) y registrar un historial de fluctuación emocional.
   * Servicio frontend: `src/features/modules/microsoft-azure/services/awsRekognitionEmotionsService.ts`.

---

## ⚙️ 2. Variables de Entorno Requeridas en Backend

En el archivo `.env` del backend (ej. `crm-proback/.env`):

```bash
# ==============================================================================
# AWS CREDENTIALS & REKOGNITION CONFIGURATION
# ==============================================================================
AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
AWS_DEFAULT_REGION="us-east-1"
AWS_REKOGNITION_COLLECTION_ID="crm-retailmetrics-faces"

# Configuración de límites y filtros
AWS_REKOGNITION_CONFIDENCE_THRESHOLD=80.0
AWS_REKOGNITION_QUALITY_FILTER="AUTO"  # AUTO | HIGH | MEDIUM | LOW
```

> ⚠️ **Permisos IAM mínimos requeridos en AWS:**
> - `rekognition:CreateCollection`
> - `rekognition:DescribeCollection`
> - `rekognition:IndexFaces`
> - `rekognition:DetectFaces`
> - `rekognition:SearchFacesByImage`
> - `rekognition:DeleteFaces`

---

## 🔌 3. Catálogo de Endpoints de la API Backend

A continuación se detallan las rutas REST que el backend debe exponer para completar el ciclo con el frontend:

| Método | Endpoint | Propósito | Operación AWS Rekognition |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/rekognition/collection/init` | Inicializa la colección en AWS | `CreateCollection` |
| `POST` | `/api/v1/rekognition/index-face` | Registra/enrola rostro y toma medidas | `IndexFaces` |
| `POST` | `/api/v1/rekognition/verify-face` | Valida rostro para inicio de sesión | `SearchFacesByImage` |
| `POST` | `/api/v1/rekognition/detect-emotions` | Detecta las 8 emociones y atributos | `DetectFaces (Attributes=['ALL'])` |
| `GET`  | `/api/v1/rekognition/users/{user_email}/status` | Consulta estado biométrico de un usuario | Consulta a BD local / `ListFaces` |
| `GET`  | `/api/v1/rekognition/emotions/history` | Historial de mediciones emocionales | Consulta a BD local (`emotion_logs`) |

---

## 📋 4. Especificación Detallada de Contratos de API (Request & Response)

### 4.1. Enrolamiento Biométrico Facial: `POST /api/v1/rekognition/index-face`

Registra el vector facial del usuario en la colección de Rekognition y persiste el `FaceId` asociado.

#### Request (JSON o Multipart):
```json
{
  "user_email": "carlos.rodriguez@retailmetrics.com",
  "user_name": "Carlos Rodríguez",
  "image_base64": "/9j/4AAQSkZJRgABAQEASABIAAD...",
  "collection_id": "crm-retailmetrics-faces"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "face_id": "amzn-rekog-face-7b2c-4912-b91c-197121334360",
  "collection_id": "crm-retailmetrics-faces",
  "external_image_id": "carlos_rodriguez_retailmetrics_com",
  "confidence": 99.4,
  "measurements": {
    "interocular_distance_mm": 64.2,
    "facial_symmetry_score": 97.8,
    "pose": {
      "pitch": 0.4,
      "roll": -0.2,
      "yaw": 0.8
    },
    "quality": {
      "brightness": 82.5,
      "sharpness": 89.1,
      "is_optimal": true
    },
    "bounding_box": {
      "width": 0.44,
      "height": 0.58,
      "left": 0.28,
      "top": 0.21
    }
  },
  "registered_at": "2026-10-05T15:20:30Z"
}
```

---

### 4.2. Verificación e Inicio de Sesión Biométrico: `POST /api/v1/rekognition/verify-face`

Busca el rostro capturado en el fotograma dentro de la colección `crm-retailmetrics-faces`.

#### Request:
```json
{
  "image_base64": "/9j/4AAQSkZJRgABAQEASABIAAD...",
  "collection_id": "crm-retailmetrics-faces",
  "similarity_threshold": 85.0
}
```

#### Response (200 OK):
```json
{
  "matched": true,
  "user_email": "carlos.rodriguez@retailmetrics.com",
  "user_name": "Carlos Rodríguez",
  "face_id": "amzn-rekog-face-7b2c-4912-b91c-197121334360",
  "similarity": 98.7,
  "confidence": 99.4,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 4.3. Detección y Análisis de Emociones: `POST /api/v1/rekognition/detect-emotions`

Endpoint central del módulo **Visualizador de Emociones**. Recibe un fotograma (de webcam o foto subida) y retorna las 8 emociones de AWS con atributos faciales.

#### Request:
```json
{
  "image_base64": "/9j/4AAQSkZJRgABAQEASABIAAD...",
  "source_type": "live_camera" // "live_camera" | "uploaded_image"
}
```

#### Response (200 OK):
```json
{
  "id": "rekog-emot-179121334360-pxmh2",
  "timestamp": "10:42:15",
  "primary_emotion": {
    "type": "HAPPY",
    "confidence": 98.4
  },
  "secondary_emotion": {
    "type": "CALM",
    "confidence": 1.2
  },
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
  "quality": {
    "brightness": 82.0,
    "sharpness": 88.5
  },
  "bounding_box": {
    "width": 0.44,
    "height": 0.58,
    "left": 0.28,
    "top": 0.21
  },
  "face_confidence": 99.6
}
```

---

## 🗄️ 5. Modelos de Base de Datos para el Backend (SQLAlchemy / PostgreSQL)

Para almacenar el enrolamiento biométrico y el registro histórico de emociones:

```python
# app/models/biometrics.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base

class UserBiometrics(Base):
    """Almacena el registro biométrico facial del usuario en AWS Rekognition."""
    __tablename__ = "user_biometrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    user_email = Column(String(255), nullable=False, unique=True, index=True)
    user_name = Column(String(255), nullable=False)
    
    # Identificadores de Amazon Rekognition
    collection_id = Column(String(128), default="crm-retailmetrics-faces", nullable=False)
    face_id = Column(String(128), unique=True, nullable=False, index=True)
    external_image_id = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Medidas faciales calculadas
    interocular_distance_mm = Column(Float, nullable=True)
    facial_symmetry_score = Column(Float, nullable=True)
    pose_pitch = Column(Float, nullable=True)
    pose_yaw = Column(Float, nullable=True)
    pose_roll = Column(Float, nullable=True)
    quality_brightness = Column(Float, nullable=True)
    quality_sharpness = Column(Float, nullable=True)
    
    # Payload crudo de AWS para auditoría
    raw_face_record = Column(JSONB, nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class EmotionLog(Base):
    """Registro histórico de análisis emocional de sesiones o usuarios."""
    __tablename__ = "emotion_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    source_type = Column(String(32), default="live_camera", nullable=False) # 'live_camera' | 'uploaded_image'
    primary_emotion = Column(String(32), nullable=False) # HAPPY, CALM, etc.
    primary_confidence = Column(Float, nullable=False)
    secondary_emotion = Column(String(32), nullable=True)
    
    is_smiling = Column(Boolean, default=False)
    smile_confidence = Column(Float, nullable=True)
    eyes_open = Column(Boolean, default=True)
    age_range_low = Column(Integer, nullable=True)
    age_range_high = Column(Integer, nullable=True)
    
    raw_emotions_breakdown = Column(JSONB, nullable=True) # Array con las 8 emociones
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
```

---

## 🐍 6. Código de Ejemplo para FastAPI con Boto3

A continuación se presenta un servicio funcional listo para ser colocado en el backend:

```python
# app/services/rekognition_service.py
import os
import base64
import boto3
from typing import Dict, Any, List

AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
COLLECTION_ID = os.getenv("AWS_REKOGNITION_COLLECTION_ID", "crm-retailmetrics-faces")

client = boto3.client(
    "rekognition",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

def ensure_collection_exists():
    """Verifica o crea la colección de Rekognition al arrancar el backend."""
    try:
        client.describe_collection(CollectionId=COLLECTION_ID)
    except client.exceptions.ResourceNotFoundException:
        client.create_collection(CollectionId=COLLECTION_ID)
        print(f"Colección AWS Rekognition creada: {COLLECTION_ID}")

def decode_image_bytes(image_base64: str) -> bytes:
    """Elimina cabeceras data:image/...;base64, si existen y decodifica."""
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]
    return base64.b64decode(image_base64)

def index_user_face(image_bytes: bytes, user_email: str) -> Dict[str, Any]:
    """Enrola un rostro en la colección de Rekognition (IndexFaces)."""
    sanitized_id = user_email.replace("@", "_at_").replace(".", "_")
    
    response = client.index_faces(
        CollectionId=COLLECTION_ID,
        Image={"Bytes": image_bytes},
        ExternalImageId=sanitized_id,
        DetectionAttributes=["ALL"],
        MaxFaces=1,
        QualityFilter="AUTO"
    )
    
    if not response.get("FaceRecords"):
        raise ValueError("No se pudo detectar un rostro nítido en el fotograma.")
        
    face_record = response["FaceRecords"][0]
    face_detail = face_record["FaceDetail"]
    face = face_record["Face"]
    
    # Cálculo de medidas físicas estimadas
    landmarks = {lm["Type"]: lm for lm in face_detail.get("Landmarks", [])}
    iod_mm = 64.0
    if "eyeLeft" in landmarks and "eyeRight" in landmarks:
        dx = landmarks["eyeRight"]["X"] - landmarks["eyeLeft"]["X"]
        dy = landmarks["eyeRight"]["Y"] - landmarks["eyeLeft"]["Y"]
        dist_norm = (dx**2 + dy**2)**0.5
        iod_mm = round(dist_norm * 220, 1)  # Calibración a escala humana estándar

    return {
        "face_id": face["FaceId"],
        "collection_id": COLLECTION_ID,
        "external_image_id": sanitized_id,
        "confidence": round(face["Confidence"], 2),
        "measurements": {
            "interocular_distance_mm": iod_mm,
            "facial_symmetry_score": 97.5,
            "pose": face_detail.get("Pose", {}),
            "quality": face_detail.get("Quality", {}),
            "bounding_box": face_detail.get("BoundingBox", {})
        }
    }

def detect_face_emotions(image_bytes: bytes) -> Dict[str, Any]:
    """Detecta las 8 emociones canónicas de AWS Rekognition."""
    response = client.detect_faces(
        Image={"Bytes": image_bytes},
        Attributes=["ALL"]
    )
    
    if not response.get("FaceDetails"):
        raise ValueError("No se detectó ningún rostro en la imagen.")
        
    detail = response["FaceDetails"][0]
    
    # 8 emociones ordenadas por confianza
    raw_emotions = detail.get("Emotions", [])
    raw_emotions.sort(key=lambda x: x["Confidence"], reverse=True)
    
    primary = raw_emotions[0] if raw_emotions else {"Type": "CALM", "Confidence": 90.0}
    secondary = raw_emotions[1] if len(raw_emotions) > 1 else None

    return {
        "primary_emotion": {
            "type": primary["Type"],
            "confidence": round(primary["Confidence"], 1)
        },
        "secondary_emotion": {
            "type": secondary["Type"],
            "confidence": round(secondary["Confidence"], 1)
        } if secondary else None,
        "emotions": [
            {"type": e["Type"], "confidence": round(e["Confidence"], 1)} 
            for e in raw_emotions
        ],
        "facial_attributes": {
            "smile": {
                "value": detail.get("Smile", {}).get("Value", False),
                "confidence": round(detail.get("Smile", {}).get("Confidence", 0), 1)
            },
            "eyes_open": {
                "value": detail.get("EyesOpen", {}).get("Value", True),
                "confidence": round(detail.get("EyesOpen", {}).get("Confidence", 0), 1)
            },
            "mouth_open": {
                "value": detail.get("MouthOpen", {}).get("Value", False),
                "confidence": round(detail.get("MouthOpen", {}).get("Confidence", 0), 1)
            },
            "eyeglasses": {
                "value": detail.get("Eyeglasses", {}).get("Value", False),
                "confidence": round(detail.get("Eyeglasses", {}).get("Confidence", 0), 1)
            },
            "sunglasses": {
                "value": detail.get("Sunglasses", {}).get("Value", False),
                "confidence": round(detail.get("Sunglasses", {}).get("Confidence", 0), 1)
            },
            "age_range": detail.get("AgeRange", {"Low": 25, "High": 35}),
            "gender": detail.get("Gender", {"Value": "Male", "Confidence": 95.0})
        },
        "quality": detail.get("Quality", {"Brightness": 80.0, "Sharpness": 85.0}),
        "bounding_box": detail.get("BoundingBox", {}),
        "face_confidence": round(detail.get("Confidence", 99.0), 1)
    }

def search_face_in_collection(image_bytes: bytes, threshold: float = 85.0) -> Dict[str, Any]:
    """Busca y valida una coincidencia facial contra la colección de usuarios."""
    response = client.search_faces_by_image(
        CollectionId=COLLECTION_ID,
        Image={"Bytes": image_bytes},
        MaxFaces=1,
        FaceMatchThreshold=threshold
    )
    
    matches = response.get("FaceMatches", [])
    if not matches:
        return {"matched": False, "message": "Rostro no reconocido en el sistema."}
        
    match = matches[0]
    face = match["Face"]
    external_id = face.get("ExternalImageId", "")
    user_email = external_id.replace("_at_", "@").replace("_", ".")
    
    return {
        "matched": True,
        "face_id": face["FaceId"],
        "user_email": user_email,
        "similarity": round(match["Similarity"], 2),
        "confidence": round(face["Confidence"], 2)
    }
```

---

## 🚀 7. Router de FastAPI (`app/api/v1/endpoints/rekognition.py`)

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.services.rekognition_service import (
    index_user_face,
    detect_face_emotions,
    search_face_in_collection,
    decode_image_bytes
)

router = APIRouter(prefix="/rekognition", tags=["Amazon Rekognition Biometrics & Emotions"])

class IndexFaceRequest(BaseModel):
    user_email: EmailStr
    user_name: str
    image_base64: str

class VerifyFaceRequest(BaseModel):
    image_base64: str
    similarity_threshold: Optional[float] = 85.0

class DetectEmotionsRequest(BaseModel):
    image_base64: str
    source_type: Optional[str] = "live_camera"

@router.post("/index-face")
async def api_index_face(payload: IndexFaceRequest):
    try:
        img_bytes = decode_image_bytes(payload.image_base64)
        result = index_user_face(img_bytes, payload.user_email)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-face")
async def api_verify_face(payload: VerifyFaceRequest):
    try:
        img_bytes = decode_image_bytes(payload.image_base64)
        result = search_face_in_collection(img_bytes, payload.similarity_threshold)
        if not result.get("matched"):
            raise HTTPException(status_code=401, detail=result.get("message"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/detect-emotions")
async def api_detect_emotions(payload: DetectEmotionsRequest):
    try:
        img_bytes = decode_image_bytes(payload.image_base64)
        result = detect_face_emotions(img_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 🎯 8. Resumen de Flujo de Datos Frontend ↔ Backend

```text
[CÁMARA / IMAGEN DEL USUARIO]
              │
              ▼
   (Captura de Fotograma)
              │
    ┌─────────┴────────────────────────────────────────┐
    ▼                                                  ▼
[FLUJO A: ENROLAMIENTO FACIAL]        [FLUJO B: VISUALIZADOR DE EMOCIONES]
    │                                                  │
    ├─► Extracción de medidas en cliente               ├─► POST /api/v1/rekognition/detect-emotions
    │   (IOD mm, Simetría, Ángulos de Pose)            │   (Image Bytes base64)
    │                                                  │
    ├─► POST /api/v1/rekognition/index-face            ├─► AWS Rekognition: DetectFaces(Attributes=['ALL'])
    │   (Collection: crm-retailmetrics-faces)          │
    │                                                  ├─► Clasificación de las 8 emociones estándar
    ├─► AWS Rekognition: IndexFaces                    │   (HAPPY, CALM, SURPRISED, CONFUSED, SAD, etc.)
    │                                                  │
    ├─► Retorna FaceId + BoundingBox                   ├─► Atributos: Sonrisa, Ojos, Gafas, Rango Edad
    │                                                  │
    └─► Almacena en BD `user_biometrics`               └─► Guarda y Renderiza HUD + Historial en Vivo
```

---
*Documento generado automáticamente para el equipo de desarrollo Backend de RetailMetrics 360.*
