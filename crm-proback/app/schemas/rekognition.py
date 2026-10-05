from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==============================================================================
# SUB-MODELOS DE MEDICIONES Y ATRIBUTOS
# ==============================================================================

class BoundingBoxModel(BaseModel):
    width: float = 0.0
    height: float = 0.0
    left: float = 0.0
    top: float = 0.0

class PoseModel(BaseModel):
    pitch: float = 0.0
    roll: float = 0.0
    yaw: float = 0.0

class QualityModel(BaseModel):
    brightness: float = 0.0
    sharpness: float = 0.0
    is_optimal: Optional[bool] = None

class LandmarkModel(BaseModel):
    type: str
    x: float
    y: float

class MeasurementsModel(BaseModel):
    interocular_distance_mm: float
    facial_symmetry_score: float
    pose: PoseModel
    quality: QualityModel
    bounding_box: BoundingBoxModel
    confidence: Optional[float] = None
    landmarks: Optional[List[LandmarkModel]] = None

class EmotionItem(BaseModel):
    type: str
    confidence: float

class BooleanAttributeModel(BaseModel):
    value: bool
    confidence: float

class AgeRangeModel(BaseModel):
    low: int
    high: int

class GenderAttributeModel(BaseModel):
    value: str
    confidence: float

# ==============================================================================
# REQUEST SCHEMAS
# ==============================================================================

class InitCollectionRequest(BaseModel):
    collection_id: Optional[str] = None

class IndexFaceRequest(BaseModel):
    user_email: EmailStr
    user_name: str
    image_base64: str
    collection_id: Optional[str] = None

class VerifyFaceRequest(BaseModel):
    image_base64: str
    collection_id: Optional[str] = None
    similarity_threshold: Optional[float] = 85.0

class DetectEmotionsRequest(BaseModel):
    image_base64: str
    source_type: Optional[str] = "live_camera"

# ==============================================================================
# RESPONSE SCHEMAS
# ==============================================================================

class InitCollectionResponse(BaseModel):
    success: bool
    collection_id: str
    status_code: int
    message: str

class IndexFaceResponse(BaseModel):
    success: bool = True
    face_id: str
    collection_id: str
    external_image_id: str
    confidence: float
    measurements: MeasurementsModel
    registered_at: str
    provider: str = "Amazon Rekognition"

class VerifyFaceResponse(BaseModel):
    matched: bool
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    face_id: Optional[str] = None
    similarity: Optional[float] = None
    confidence: Optional[float] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    message: Optional[str] = None

class DetectEmotionsResponse(BaseModel):
    id: str
    timestamp: str
    primary_emotion: EmotionItem
    secondary_emotion: Optional[EmotionItem] = None
    emotions: List[EmotionItem]
    facial_attributes: Dict[str, Any]
    quality: QualityModel
    bounding_box: BoundingBoxModel
    face_confidence: float
    source_type: str = "live_camera"

    # Propiedades adicionales para compatibilidad directa con camelCase de frontend
    primaryEmotion: Optional[EmotionItem] = None
    secondaryEmotion: Optional[EmotionItem] = None
    smile: Optional[BooleanAttributeModel] = None
    eyesOpen: Optional[BooleanAttributeModel] = None
    mouthOpen: Optional[BooleanAttributeModel] = None
    eyeglasses: Optional[BooleanAttributeModel] = None
    sunglasses: Optional[BooleanAttributeModel] = None
    ageRange: Optional[AgeRangeModel] = None
    gender: Optional[GenderAttributeModel] = None
    boundingBox: Optional[BoundingBoxModel] = None
    faceConfidence: Optional[float] = None

class BiometricStatusResponse(BaseModel):
    enrolled: bool
    user_email: str
    user_name: Optional[str] = None
    face_id: Optional[str] = None
    collection_id: Optional[str] = None
    confidence: Optional[float] = None
    registered_at: Optional[str] = None
    interocular_distance_mm: Optional[float] = None
    facial_symmetry_score: Optional[float] = None

from pydantic import BaseModel, EmailStr, Field, ConfigDict

class EmotionLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[int] = None
    source_type: str
    primary_emotion: str
    primary_confidence: float
    secondary_emotion: Optional[str] = None
    is_smiling: bool
    eyes_open: bool
    created_at: datetime
    raw_emotions_breakdown: Optional[List[Dict[str, Any]]] = None

class EmotionHistoryResponse(BaseModel):
    total: int
    items: List[EmotionLogItem]
