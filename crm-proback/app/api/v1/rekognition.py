import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import EmailStr

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.models.biometrics import UserBiometrics, EmotionLog
from app.schemas.rekognition import (
    InitCollectionRequest,
    InitCollectionResponse,
    IndexFaceRequest,
    IndexFaceResponse,
    VerifyFaceRequest,
    VerifyFaceResponse,
    DetectEmotionsRequest,
    DetectEmotionsResponse,
    BiometricStatusResponse,
    EmotionHistoryResponse,
    EmotionLogItem,
    MeasurementsModel,
    BoundingBoxModel,
    PoseModel,
    QualityModel,
)
from app.services.rekognition_service import (
    ensure_collection_exists,
    index_user_face,
    detect_face_emotions,
    search_face_in_collection,
    decode_image_bytes,
    delete_face_from_collection,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Buffer en memoria para historial reciente en caso de desconexion o mantenimiento de DB
_IN_MEMORY_EMOTIONS_HISTORY: List[Dict[str, Any]] = []

# ==============================================================================
# 1. INICIALIZACION DE COLECCION
# ==============================================================================

@router.post(
    "/collection/init",
    response_model=InitCollectionResponse,
    summary="Inicializar Coleccion de Amazon Rekognition",
    description="Verifica si la coleccion de rostros existe en AWS Rekognition o la crea si no existe."
)
def api_init_collection(payload: Optional[InitCollectionRequest] = None):
    col_id = payload.collection_id if payload else None
    try:
        res = ensure_collection_exists(col_id)
        return InitCollectionResponse(
            success=res["success"],
            collection_id=res["collection_id"],
            status_code=res.get("status_code", 200),
            message=res.get("message", "Coleccion lista")
        )
    except Exception as e:
        logger.error("Error al inicializar coleccion en AWS Rekognition: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en AWS Rekognition CreateCollection: {str(e)}"
        )


# ==============================================================================
# 2. ENROLAMIENTO BIOMETRICO (INDEX FACES)
# ==============================================================================

@router.post(
    "/index-face",
    response_model=IndexFaceResponse,
    summary="Enrolar Rostro en Amazon Rekognition",
    description="Extrae vectores faciales, calcula medidas antropometricas (IOD mm, simetria) y persiste el FaceId."
)
@router.post(
    "/index-faces",
    response_model=IndexFaceResponse,
    include_in_schema=False
)
async def api_index_face(
    request: Request,
    db: Session = Depends(get_db)
):
    content_type = request.headers.get("content-type", "")
    user_email = ""
    user_name = ""
    collection_id = None
    image_bytes = b""

    if "multipart/form-data" in content_type:
        form = await request.form()
        user_email = str(form.get("user_email") or form.get("email") or "")
        user_name = str(form.get("user_name") or form.get("name") or "Usuario")
        collection_id = form.get("collection_id")
        file_obj = form.get("image") or form.get("file")
        if file_obj and hasattr(file_obj, "read"):
            image_bytes = await file_obj.read()
        elif form.get("image_base64"):
            image_bytes = decode_image_bytes(str(form.get("image_base64")))
    else:
        body = await request.json()
        user_email = body.get("user_email") or body.get("userEmail") or body.get("email") or ""
        user_name = body.get("user_name") or body.get("userName") or body.get("userFullName") or "Usuario"
        collection_id = body.get("collection_id") or body.get("collectionId") or body.get("CollectionId")
        img_raw = body.get("image_base64") or body.get("imageBase64")
        if not img_raw and isinstance(body.get("Image"), dict):
            img_raw = body["Image"].get("Bytes")
        if not img_raw:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Se requiere el campo 'image_base64' con el fotograma capturado."
            )
        image_bytes = decode_image_bytes(img_raw)

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Se requiere el campo 'user_email' para identificar el enrolamiento."
        )

    try:
        # Enrolamiento en AWS Rekognition
        res = index_user_face(
            image_input=image_bytes,
            user_email=user_email,
            collection_id=collection_id
        )

        # Persistir en base de datos si esta disponible
        try:
            # Buscar usuario por email si existe
            user_rec = db.query(User).filter(User.email == user_email).first()
            user_id = user_rec.id if user_rec else None

            # Buscar registro biometrico existente
            bio = db.query(UserBiometrics).filter(UserBiometrics.user_email == user_email).first()
            m = res["measurements"]
            p = m.get("pose", {})
            q = m.get("quality", {})

            if bio:
                bio.user_id = user_id or bio.user_id
                bio.user_name = user_name or bio.user_name
                bio.collection_id = res["collection_id"]
                bio.face_id = res["face_id"]
                bio.external_image_id = res["external_image_id"]
                bio.confidence = res["confidence"]
                bio.interocular_distance_mm = m.get("interocular_distance_mm")
                bio.facial_symmetry_score = m.get("facial_symmetry_score")
                bio.pose_pitch = p.get("pitch")
                bio.pose_yaw = p.get("yaw")
                bio.pose_roll = p.get("roll")
                bio.quality_brightness = q.get("brightness")
                bio.quality_sharpness = q.get("sharpness")
                bio.raw_face_record = res.get("raw_record")
                bio.is_active = True
                bio.updated_at = datetime.now(timezone.utc)
            else:
                bio = UserBiometrics(
                    user_id=user_id,
                    user_email=user_email,
                    user_name=user_name,
                    collection_id=res["collection_id"],
                    face_id=res["face_id"],
                    external_image_id=res["external_image_id"],
                    confidence=res["confidence"],
                    interocular_distance_mm=m.get("interocular_distance_mm"),
                    facial_symmetry_score=m.get("facial_symmetry_score"),
                    pose_pitch=p.get("pitch"),
                    pose_yaw=p.get("yaw"),
                    pose_roll=p.get("roll"),
                    quality_brightness=q.get("brightness"),
                    quality_sharpness=q.get("sharpness"),
                    raw_face_record=res.get("raw_record"),
                    is_active=True,
                )
                db.add(bio)

            db.commit()
            logger.info("Registro biometrico guardado en BD para: %s (FaceId: %s)", user_email, res["face_id"])
        except Exception as db_err:
            logger.warning("No se pudo persistir UserBiometrics en BD relacional (reintentando o modo fallback): %s", str(db_err))
            db.rollback()

        # Construir DTO de respuesta
        meas = res["measurements"]
        meas_dto = MeasurementsModel(
            interocular_distance_mm=meas["interocular_distance_mm"],
            facial_symmetry_score=meas["facial_symmetry_score"],
            pose=PoseModel(**meas.get("pose", {})),
            quality=QualityModel(**meas.get("quality", {})),
            bounding_box=BoundingBoxModel(**meas.get("bounding_box", {})),
            confidence=meas.get("confidence")
        )

        return IndexFaceResponse(
            success=True,
            face_id=res["face_id"],
            collection_id=res["collection_id"],
            external_image_id=res["external_image_id"],
            confidence=res["confidence"],
            measurements=meas_dto,
            registered_at=res["registered_at"],
            provider=res.get("provider", "Amazon Rekognition")
        )

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Error al procesar index-face: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==============================================================================
# 3. VERIFICACION E INICIO DE SESION BIOMETRICO (SEARCH FACES BY IMAGE)
# ==============================================================================

@router.post(
    "/verify-face",
    response_model=VerifyFaceResponse,
    summary="Verificacion Facial e Inicio de Sesion",
    description="Compara el fotograma contra la coleccion de Amazon Rekognition y emite JWT si coincide."
)
async def api_verify_face(
    request: Request,
    db: Session = Depends(get_db)
):
    content_type = request.headers.get("content-type", "")
    collection_id = None
    similarity_threshold = 85.0
    image_bytes = b""

    if "multipart/form-data" in content_type:
        form = await request.form()
        collection_id = form.get("collection_id")
        thresh_val = form.get("similarity_threshold")
        if thresh_val:
            similarity_threshold = float(thresh_val)
        file_obj = form.get("image") or form.get("file")
        if file_obj and hasattr(file_obj, "read"):
            image_bytes = await file_obj.read()
        elif form.get("image_base64"):
            image_bytes = decode_image_bytes(str(form.get("image_base64")))
    else:
        body = await request.json()
        collection_id = body.get("collection_id") or body.get("collectionId")
        similarity_threshold = float(body.get("similarity_threshold") or body.get("similarityThreshold") or 85.0)
        img_raw = body.get("image_base64") or body.get("imageBase64")
        if not img_raw:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Se requiere el campo 'image_base64' para la verificacion."
            )
        image_bytes = decode_image_bytes(img_raw)

    try:
        search_res = search_face_in_collection(
            image_input=image_bytes,
            collection_id=collection_id,
            threshold=similarity_threshold
        )

        if not search_res.get("matched"):
            return VerifyFaceResponse(
                matched=False,
                message=search_res.get("message", "Rostro no reconocido en la coleccion de biometria.")
            )

        user_email = search_res.get("user_email", "")
        face_id = search_res.get("face_id", "")
        similarity = search_res.get("similarity")
        confidence = search_res.get("confidence")

        # Buscar usuario en BD para obtener nombre y roles
        user_name = user_email
        access_token = None

        try:
            user = db.query(User).filter(User.email == user_email).first()
            if user:
                user_name = user.full_name or user.username
                # Generar JWT autenticado
                expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = create_access_token(
                    data={"sub": str(user.id), "role": user.role, "email": user.email},
                    expires_delta=expires
                )
            else:
                # Generar token con subject de email si el usuario aun no esta en tabla users
                expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = create_access_token(
                    data={"sub": user_email, "role": "analyst", "email": user_email},
                    expires_delta=expires
                )
        except Exception as db_err:
            logger.warning("Fallo al consultar usuario en base de datos: %s", str(db_err))
            expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user_email, "role": "analyst", "email": user_email},
                expires_delta=expires
            )

        return VerifyFaceResponse(
            matched=True,
            user_email=user_email,
            user_name=user_name,
            face_id=face_id,
            similarity=similarity,
            confidence=confidence,
            access_token=access_token,
            token_type="bearer",
            message="Identidad biometrica verificada exitosamente con Amazon Rekognition."
        )

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Error en verify-face: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==============================================================================
# 4. DETECCION DE EMOCIONES (DETECT FACES)
# ==============================================================================

@router.post(
    "/detect-emotions",
    response_model=DetectEmotionsResponse,
    summary="Detectar Emociones y Atributos Faciales",
    description="Analiza un fotograma o imagen para clasificar las 8 emociones canonicas de AWS Rekognition y atributos."
)
async def api_detect_emotions(
    request: Request,
    db: Session = Depends(get_db)
):
    content_type = request.headers.get("content-type", "")
    source_type = "live_camera"
    image_bytes = b""

    if "multipart/form-data" in content_type:
        form = await request.form()
        source_type = str(form.get("source_type") or form.get("sourceType") or "uploaded_image")
        file_obj = form.get("image") or form.get("file")
        if file_obj and hasattr(file_obj, "read"):
            image_bytes = await file_obj.read()
        elif form.get("image_base64"):
            image_bytes = decode_image_bytes(str(form.get("image_base64")))
    else:
        body = await request.json()
        source_type = body.get("source_type") or body.get("sourceType") or "live_camera"
        img_raw = body.get("image_base64") or body.get("imageBase64")
        if not img_raw and isinstance(body.get("Image"), dict):
            img_raw = body["Image"].get("Bytes")
        if not img_raw:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Se requiere el campo 'image_base64' para analizar emociones."
            )
        image_bytes = decode_image_bytes(img_raw)

    try:
        detection = detect_face_emotions(image_bytes, source_type=source_type)

        # Guardar en memoria para historial rapido
        _IN_MEMORY_EMOTIONS_HISTORY.insert(0, {
            "id": detection["id"],
            "timestamp": detection["timestamp"],
            "source_type": source_type,
            "primary_emotion": detection["primary_emotion"]["type"],
            "primary_confidence": detection["primary_emotion"]["confidence"],
            "secondary_emotion": detection["secondary_emotion"]["type"] if detection.get("secondary_emotion") else None,
            "is_smiling": detection["facial_attributes"]["smile"]["value"],
            "eyes_open": detection["facial_attributes"]["eyes_open"]["value"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "raw_emotions_breakdown": detection["emotions"],
        })
        if len(_IN_MEMORY_EMOTIONS_HISTORY) > 50:
            _IN_MEMORY_EMOTIONS_HISTORY.pop()

        # Persistir en BD si esta disponible
        try:
            primary = detection["primary_emotion"]
            secondary = detection.get("secondary_emotion")
            attrs = detection["facial_attributes"]
            age = attrs.get("age_range", {})

            log_entry = EmotionLog(
                source_type=source_type,
                primary_emotion=primary["type"],
                primary_confidence=primary["confidence"],
                secondary_emotion=secondary["type"] if secondary else None,
                is_smiling=attrs["smile"]["value"],
                smile_confidence=attrs["smile"]["confidence"],
                eyes_open=attrs["eyes_open"]["value"],
                mouth_open=attrs["mouth_open"]["value"],
                age_range_low=age.get("low"),
                age_range_high=age.get("high"),
                gender=attrs.get("gender", {}).get("value"),
                raw_emotions_breakdown=detection["emotions"],
            )
            db.add(log_entry)
            db.commit()
        except Exception as db_err:
            logger.debug("Persistencia de EmotionLog en BD omitida: %s", str(db_err))
            db.rollback()

        return DetectEmotionsResponse(**detection)

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Error en detect-emotions: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==============================================================================
# 5. ESTADO BIOMETRICO DEL USUARIO
# ==============================================================================

@router.get(
    "/users/{user_email}/status",
    response_model=BiometricStatusResponse,
    summary="Consultar Estado Biometrico",
    description="Devuelve si el usuario posee un vector facial enrolado y sus medidas calibradas."
)
def api_get_user_biometric_status(
    user_email: str,
    db: Session = Depends(get_db)
):
    try:
        bio = db.query(UserBiometrics).filter(
            UserBiometrics.user_email == user_email,
            UserBiometrics.is_active == True
        ).first()

        if bio:
            return BiometricStatusResponse(
                enrolled=True,
                user_email=bio.user_email,
                user_name=bio.user_name,
                face_id=bio.face_id,
                collection_id=bio.collection_id,
                confidence=bio.confidence,
                registered_at=bio.created_at.isoformat() if bio.created_at else None,
                interocular_distance_mm=bio.interocular_distance_mm,
                facial_symmetry_score=bio.facial_symmetry_score,
            )

        return BiometricStatusResponse(
            enrolled=False,
            user_email=user_email,
            collection_id=settings.AWS_REKOGNITION_COLLECTION_ID or "crm-retailmetrics-faces"
        )
    except Exception as e:
        logger.warning("Fallo en consulta de status biometrico en BD: %s", str(e))
        return BiometricStatusResponse(
            enrolled=False,
            user_email=user_email,
            collection_id=settings.AWS_REKOGNITION_COLLECTION_ID or "crm-retailmetrics-faces"
        )


# ==============================================================================
# 6. HISTORIAL DE EMOCIONES
# ==============================================================================

@router.get(
    "/emotions/history",
    response_model=EmotionHistoryResponse,
    summary="Historial de Mediciones Emocionales",
    description="Devuelve el registro historico de fluctuaciones emocionales registradas."
)
def api_get_emotions_history(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    try:
        logs = db.query(EmotionLog).order_by(EmotionLog.created_at.desc()).limit(limit).all()
        if logs:
            items = [
                EmotionLogItem(
                    id=log.id,
                    user_id=log.user_id,
                    source_type=log.source_type,
                    primary_emotion=log.primary_emotion,
                    primary_confidence=log.primary_confidence,
                    secondary_emotion=log.secondary_emotion,
                    is_smiling=log.is_smiling,
                    eyes_open=log.eyes_open,
                    created_at=log.created_at,
                    raw_emotions_breakdown=log.raw_emotions_breakdown,
                )
                for log in logs
            ]
            return EmotionHistoryResponse(total=len(items), items=items)
    except Exception as e:
        logger.warning("Fallo al leer EmotionLog de BD, usando fallback en memoria: %s", str(e))

    # Fallback con memoria
    cached_items = []
    for item in _IN_MEMORY_EMOTIONS_HISTORY[:limit]:
        cached_items.append(
            EmotionLogItem(
                id=item["id"],
                user_id=None,
                source_type=item["source_type"],
                primary_emotion=item["primary_emotion"],
                primary_confidence=item["primary_confidence"],
                secondary_emotion=item.get("secondary_emotion"),
                is_smiling=item["is_smiling"],
                eyes_open=item["eyes_open"],
                created_at=datetime.fromisoformat(item["created_at"]),
                raw_emotions_breakdown=item.get("raw_emotions_breakdown"),
            )
        )
    return EmotionHistoryResponse(total=len(cached_items), items=cached_items)
