import uuid
from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class UserBiometrics(Base):
    """Almacena el registro biometrico facial del usuario en AWS Rekognition."""
    __tablename__ = "user_biometrics"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String(255), nullable=False, unique=True, index=True)
    user_name = Column(String(255), nullable=False)

    # Identificadores de Amazon Rekognition
    collection_id = Column(String(128), default="crm-retailmetrics-faces", nullable=False)
    face_id = Column(String(128), unique=True, nullable=False, index=True)
    external_image_id = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=False)

    # Medidas faciales calculadas (extrapolacion fisica e indices)
    interocular_distance_mm = Column(Float, nullable=True)
    facial_symmetry_score = Column(Float, nullable=True)
    pose_pitch = Column(Float, nullable=True)
    pose_yaw = Column(Float, nullable=True)
    pose_roll = Column(Float, nullable=True)
    quality_brightness = Column(Float, nullable=True)
    quality_sharpness = Column(Float, nullable=True)

    # Payload crudo de AWS para auditoria y trazabilidad
    raw_face_record = Column(JSON, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    user = relationship("User", foreign_keys=[user_id])


class EmotionLog(Base):
    """Registro historico de analisis emocional de sesiones o usuarios."""
    __tablename__ = "emotion_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    source_type = Column(String(32), default="live_camera", nullable=False)  # 'live_camera' | 'uploaded_image'
    primary_emotion = Column(String(32), nullable=False)  # HAPPY, CALM, SURPRISED, etc.
    primary_confidence = Column(Float, nullable=False)
    secondary_emotion = Column(String(32), nullable=True)

    is_smiling = Column(Boolean, default=False)
    smile_confidence = Column(Float, nullable=True)
    eyes_open = Column(Boolean, default=True)
    mouth_open = Column(Boolean, default=False)
    age_range_low = Column(Integer, nullable=True)
    age_range_high = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)

    raw_emotions_breakdown = Column(JSON, nullable=True)  # Array con las 8 emociones
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relaciones
    user = relationship("User", foreign_keys=[user_id])
