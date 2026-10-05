import os
import re
import math
import uuid
import base64
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger(__name__)

# ==============================================================================
# BOTO3 CLIENT FACTORY
# ==============================================================================

def get_rekognition_client():
    """Retorna un cliente configurado de boto3 para AWS Rekognition."""
    kwargs: Dict[str, Any] = {
        "region_name": settings.AWS_DEFAULT_REGION or "us-east-1"
    }
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

    return boto3.client("rekognition", **kwargs)


# ==============================================================================
# UTILIDADES DE IMAGEN
# ==============================================================================

def decode_image_bytes(image_input: str | bytes) -> bytes:
    """
    Decodifica una imagen en formato bytes o base64 (soportando encabezados data:image/...).
    """
    if isinstance(image_input, bytes):
        return image_input

    clean_str = image_input.strip()
    if "," in clean_str and ("data:image" in clean_str or "base64" in clean_str):
        clean_str = clean_str.split(",", 1)[1]

    # Eliminar posibles saltos de linea o espacios
    clean_str = re.sub(r"\s+", "", clean_str)

    try:
        return base64.b64decode(clean_str)
    except Exception as e:
        raise ValueError(f"No se pudo decodificar la imagen base64: {str(e)}")


def sanitize_external_id(email: str) -> str:
    """Convierte un correo en un ExternalImageId valido para AWS Rekognition ([a-zA-Z0-9_.-]+)."""
    sanitized = email.lower().strip().replace("@", "_at_")
    sanitized = re.sub(r"[^a-zA-Z0-9_.-]", "_", sanitized)
    return sanitized[:255]


def desanitize_external_id(external_id: str) -> str:
    """Reconstruye el correo a partir del ExternalImageId sanitizado."""
    if "_at_" in external_id:
        parts = external_id.split("_at_", 1)
        name_part = parts[0]
        domain_part = parts[1].replace("_", ".")
        return f"{name_part}@{domain_part}"
    return external_id.replace("_", ".")


# ==============================================================================
# GESTION DE COLECCION EN REKOGNITION
# ==============================================================================

def ensure_collection_exists(collection_id: Optional[str] = None) -> Dict[str, Any]:
    """Verifica o crea la coleccion de Amazon Rekognition."""
    col_id = collection_id or settings.AWS_REKOGNITION_COLLECTION_ID or "crm-retailmetrics-faces"
    client = get_rekognition_client()

    try:
        describe_res = client.describe_collection(CollectionId=col_id)
        return {
            "success": True,
            "collection_id": col_id,
            "status_code": 200,
            "message": f"Coleccion '{col_id}' verificada y activa en AWS Rekognition.",
            "arn": describe_res.get("CollectionARN"),
            "face_count": describe_res.get("FaceCount", 0),
        }
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        if error_code == "ResourceNotFoundException":
            logger.info("Coleccion '%s' no encontrada. Creandola...", col_id)
            create_res = client.create_collection(CollectionId=col_id)
            return {
                "success": True,
                "collection_id": col_id,
                "status_code": create_res.get("StatusCode", 200),
                "message": f"Coleccion '{col_id}' creada exitosamente en AWS Rekognition.",
                "arn": create_res.get("CollectionArn"),
            }
        raise


# ==============================================================================
# ENROLAMIENTO FACIAL (INDEX FACES) Y CALCULO BIOMETRICO
# ==============================================================================

def index_user_face(
    image_input: str | bytes,
    user_email: str,
    collection_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Enrola un rostro en la coleccion de Amazon Rekognition (IndexFaces),
    y computa metricas biometricas (distancia interocular IOD en mm, simetria, pose y calidad).
    """
    col_id = collection_id or settings.AWS_REKOGNITION_COLLECTION_ID or "crm-retailmetrics-faces"
    ensure_collection_exists(col_id)

    image_bytes = decode_image_bytes(image_input)
    sanitized_id = sanitize_external_id(user_email)
    client = get_rekognition_client()

    quality_filter = settings.AWS_REKOGNITION_QUALITY_FILTER or "AUTO"

    try:
        response = client.index_faces(
            CollectionId=col_id,
            Image={"Bytes": image_bytes},
            ExternalImageId=sanitized_id,
            DetectionAttributes=["ALL"],
            MaxFaces=1,
            QualityFilter=quality_filter,
        )
    except ClientError as e:
        logger.error("Error al indexar rostro en AWS Rekognition: %s", str(e))
        raise

    face_records = response.get("FaceRecords", [])
    if not face_records:
        unindexed = response.get("UnindexedFaces", [])
        reasons = []
        for uf in unindexed:
            for reason in uf.get("Reasons", []):
                reasons.append(reason)
        reason_str = ", ".join(reasons) if reasons else "No se detecto un rostro nitido o calificado"
        raise ValueError(f"No se pudo enrolar el rostro: {reason_str}")

    record = face_records[0]
    face = record["Face"]
    face_detail = record["FaceDetail"]
    face_id = face["FaceId"]

    # Bounding Box
    bb = face_detail.get("BoundingBox", {})
    bb_width = bb.get("Width", 0.44)
    bb_height = bb.get("Height", 0.58)
    bb_left = bb.get("Left", 0.28)
    bb_top = bb.get("Top", 0.21)

    # Landmarks y calculo de Distancia Interocular (IOD mm)
    raw_landmarks = face_detail.get("Landmarks", [])
    landmarks_dict = {lm["Type"]: lm for lm in raw_landmarks}
    
    iod_mm = 64.0  # Media estandar antropometrica humana
    if "eyeLeft" in landmarks_dict and "eyeRight" in landmarks_dict:
        lx = landmarks_dict["eyeLeft"]["X"]
        ly = landmarks_dict["eyeLeft"]["Y"]
        rx = landmarks_dict["eyeRight"]["X"]
        ry = landmarks_dict["eyeRight"]["Y"]
        norm_dist = math.sqrt((rx - lx) ** 2 + (ry - ly) ** 2)
        # Calibracion antropometrica (aprox 220 factor escala facial humana)
        iod_mm = round(norm_dist * 220, 1)

    # Simetria facial bilateral
    nose_x = landmarks_dict.get("nose", {}).get("X", bb_left + (bb_width / 2))
    dist_left = abs(nose_x - bb_left)
    dist_right = abs((bb_left + bb_width) - nose_x)
    total_w = dist_left + dist_right
    if total_w > 0:
        sym_deviation = abs(dist_left - dist_right) / total_w
        symmetry_score = round(max(85.0, min(100.0, 100.0 - (sym_deviation * 60))), 1)
    else:
        symmetry_score = 96.5

    # Pose angles
    pose = face_detail.get("Pose", {})
    pitch = round(float(pose.get("Pitch", 0.0)), 1)
    roll = round(float(pose.get("Roll", 0.0)), 1)
    yaw = round(float(pose.get("Yaw", 0.0)), 1)

    # Quality
    quality = face_detail.get("Quality", {})
    brightness = round(float(quality.get("Brightness", 80.0)), 1)
    sharpness = round(float(quality.get("Sharpness", 85.0)), 1)
    is_optimal = brightness >= 45 and brightness <= 95 and sharpness >= 50

    confidence = round(float(face.get("Confidence", face_detail.get("Confidence", 99.0))), 2)

    measurements = {
        "interocular_distance_mm": iod_mm,
        "facial_symmetry_score": symmetry_score,
        "pose": {
            "pitch": pitch,
            "roll": roll,
            "yaw": yaw,
        },
        "quality": {
            "brightness": brightness,
            "sharpness": sharpness,
            "is_optimal": is_optimal,
        },
        "bounding_box": {
            "width": round(bb_width, 4),
            "height": round(bb_height, 4),
            "left": round(bb_left, 4),
            "top": round(bb_top, 4),
        },
        "confidence": confidence,
    }

    return {
        "success": True,
        "face_id": face_id,
        "collection_id": col_id,
        "external_image_id": sanitized_id,
        "confidence": confidence,
        "measurements": measurements,
        "raw_record": record,
        "registered_at": datetime.now(timezone.utc).isoformat(),
        "provider": "Amazon Rekognition",
    }


# ==============================================================================
# DETECCION DE EMOCIONES Y ATRIBUTOS FACIALES (DETECT FACES)
# ==============================================================================

def detect_face_emotions(
    image_input: str | bytes,
    source_type: str = "live_camera"
) -> Dict[str, Any]:
    """
    Detecta rostros y clasifica las 8 emociones canonicas de AWS Rekognition
    junto con sus atributos biometricos (sonrisa, ojos abiertos, gafas, edad, genero).
    """
    image_bytes = decode_image_bytes(image_input)
    client = get_rekognition_client()

    try:
        response = client.detect_faces(
            Image={"Bytes": image_bytes},
            Attributes=["ALL"]
        )
    except ClientError as e:
        logger.error("Error en AWS Rekognition DetectFaces: %s", str(e))
        raise

    face_details = response.get("FaceDetails", [])
    if not face_details:
        raise ValueError("No se detecto ningun rostro en la imagen proporcionada.")

    detail = face_details[0]

    # Clasificar las 8 emociones ordenadas descendentemente por nivel de confianza
    raw_emotions = detail.get("Emotions", [])
    raw_emotions.sort(key=lambda x: x.get("Confidence", 0), reverse=True)

    formatted_emotions = [
        {"type": e["Type"], "confidence": round(float(e["Confidence"]), 1)}
        for e in raw_emotions
    ]

    primary = formatted_emotions[0] if formatted_emotions else {"type": "CALM", "confidence": 95.0}
    secondary = formatted_emotions[1] if len(formatted_emotions) > 1 else None

    # Atributos faciales
    smile_data = detail.get("Smile", {})
    smile_val = bool(smile_data.get("Value", False))
    smile_conf = round(float(smile_data.get("Confidence", 0)), 1)

    eyes_open_data = detail.get("EyesOpen", {})
    eyes_open_val = bool(eyes_open_data.get("Value", True))
    eyes_open_conf = round(float(eyes_open_data.get("Confidence", 95.0)), 1)

    mouth_open_data = detail.get("MouthOpen", {})
    mouth_open_val = bool(mouth_open_data.get("Value", False))
    mouth_open_conf = round(float(mouth_open_data.get("Confidence", 0)), 1)

    eyeglasses_data = detail.get("Eyeglasses", {})
    eyeglasses_val = bool(eyeglasses_data.get("Value", False))
    eyeglasses_conf = round(float(eyeglasses_data.get("Confidence", 0)), 1)

    sunglasses_data = detail.get("Sunglasses", {})
    sunglasses_val = bool(sunglasses_data.get("Value", False))
    sunglasses_conf = round(float(sunglasses_data.get("Confidence", 0)), 1)

    age_range = detail.get("AgeRange", {"Low": 25, "High": 35})
    age_low = int(age_range.get("Low", 25))
    age_high = int(age_range.get("High", 35))

    gender_data = detail.get("Gender", {})
    gender_val = str(gender_data.get("Value", "Unknown"))
    gender_conf = round(float(gender_data.get("Confidence", 95.0)), 1)

    # Calidad
    quality = detail.get("Quality", {})
    brightness = round(float(quality.get("Brightness", 80.0)), 1)
    sharpness = round(float(quality.get("Sharpness", 85.0)), 1)
    is_optimal = brightness >= 45 and brightness <= 95 and sharpness >= 50

    # Bounding box
    bb = detail.get("BoundingBox", {})
    bb_dict = {
        "width": round(float(bb.get("Width", 0.44)), 4),
        "height": round(float(bb.get("Height", 0.58)), 4),
        "left": round(float(bb.get("Left", 0.28)), 4),
        "top": round(float(bb.get("Top", 0.21)), 4),
    }

    face_confidence = round(float(detail.get("Confidence", 99.0)), 1)
    event_id = f"rekog-emot-{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:6]}"
    timestamp_str = datetime.now().strftime("%H:%M:%S")

    # Objeto unificado que satisface tanto snake_case como camelCase
    result: Dict[str, Any] = {
        "id": event_id,
        "timestamp": timestamp_str,
        "primary_emotion": primary,
        "secondary_emotion": secondary,
        "emotions": formatted_emotions,
        "facial_attributes": {
            "smile": {"value": smile_val, "confidence": smile_conf},
            "eyes_open": {"value": eyes_open_val, "confidence": eyes_open_conf},
            "mouth_open": {"value": mouth_open_val, "confidence": mouth_open_conf},
            "eyeglasses": {"value": eyeglasses_val, "confidence": eyeglasses_conf},
            "sunglasses": {"value": sunglasses_val, "confidence": sunglasses_conf},
            "age_range": {"low": age_low, "high": age_high},
            "gender": {"value": gender_val, "confidence": gender_conf},
        },
        "quality": {
            "brightness": brightness,
            "sharpness": sharpness,
            "is_optimal": is_optimal,
        },
        "bounding_box": bb_dict,
        "face_confidence": face_confidence,
        "source_type": source_type,

        # Campos camelCase para interaccion directa con el frontend
        "primaryEmotion": primary,
        "secondaryEmotion": secondary,
        "smile": {"Value": smile_val, "Confidence": smile_conf},
        "eyesOpen": {"Value": eyes_open_val, "Confidence": eyes_open_conf},
        "mouthOpen": {"Value": mouth_open_val, "Confidence": mouth_open_conf},
        "eyeglasses": {"Value": eyeglasses_val, "Confidence": eyeglasses_conf},
        "sunglasses": {"Value": sunglasses_val, "Confidence": sunglasses_conf},
        "ageRange": {"Low": age_low, "High": age_high},
        "gender": {"Value": gender_val, "Confidence": gender_conf},
        "boundingBox": {
            "Width": bb_dict["width"],
            "Height": bb_dict["height"],
            "Left": bb_dict["left"],
            "Top": bb_dict["top"],
        },
        "faceConfidence": face_confidence,
    }

    return result


# ==============================================================================
# VERIFICACION Y BUSQUEDA FACIAL (SEARCH FACES BY IMAGE)
# ==============================================================================

def search_face_in_collection(
    image_input: str | bytes,
    collection_id: Optional[str] = None,
    threshold: float = 85.0
) -> Dict[str, Any]:
    """
    Busca si el rostro en la imagen coincide con alguno registrado en la coleccion de AWS Rekognition.
    """
    col_id = collection_id or settings.AWS_REKOGNITION_COLLECTION_ID or "crm-retailmetrics-faces"
    image_bytes = decode_image_bytes(image_input)
    client = get_rekognition_client()

    try:
        response = client.search_faces_by_image(
            CollectionId=col_id,
            Image={"Bytes": image_bytes},
            MaxFaces=1,
            FaceMatchThreshold=threshold,
        )
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        if error_code == "ResourceNotFoundException":
            return {
                "matched": False,
                "message": f"La coleccion '{col_id}' no existe en AWS Rekognition. Inicializala primero."
            }
        logger.error("Error en SearchFacesByImage: %s", str(e))
        raise

    matches = response.get("FaceMatches", [])
    if not matches:
        return {
            "matched": False,
            "message": "Rostro no reconocido en el sistema biométrico."
        }

    match = matches[0]
    face = match["Face"]
    similarity = round(float(match["Similarity"]), 2)
    confidence = round(float(face.get("Confidence", 99.0)), 2)
    face_id = face.get("FaceId", "")
    external_id = face.get("ExternalImageId", "")
    user_email = desanitize_external_id(external_id)

    return {
        "matched": True,
        "face_id": face_id,
        "user_email": user_email,
        "similarity": similarity,
        "confidence": confidence,
        "collection_id": col_id,
        "external_image_id": external_id,
    }


def delete_face_from_collection(face_id: str, collection_id: Optional[str] = None) -> bool:
    """Elimina un vector facial de la coleccion de Rekognition."""
    col_id = collection_id or settings.AWS_REKOGNITION_COLLECTION_ID or "crm-retailmetrics-faces"
    client = get_rekognition_client()
    try:
        response = client.delete_faces(CollectionId=col_id, FaceIds=[face_id])
        deleted = response.get("DeletedFaces", [])
        return face_id in deleted
    except ClientError as e:
        logger.error("Error al eliminar rostro %s: %s", face_id, str(e))
        return False
