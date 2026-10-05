import pytest
import asyncio
from unittest.mock import patch, MagicMock
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_collection_init():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/rekognition/collection/init", json={"collection_id": "crm-retailmetrics-faces"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["collection_id"] == "crm-retailmetrics-faces"

@pytest.mark.asyncio
async def test_get_user_biometric_status_not_found():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/rekognition/users/nonexistent@retailmetrics.com/status")
        assert response.status_code == 200
        data = response.json()
        assert data["enrolled"] is False
        assert data["user_email"] == "nonexistent@retailmetrics.com"

@pytest.mark.asyncio
async def test_emotions_history():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/rekognition/emotions/history")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "items" in data

@pytest.mark.asyncio
async def test_detect_emotions_validation():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/rekognition/detect-emotions", json={})
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_index_face_mock_flow():
    mock_result = {
        "success": True,
        "face_id": "test-face-12345",
        "collection_id": "crm-retailmetrics-faces",
        "external_image_id": "ana_silva_retailmetrics_com",
        "confidence": 99.4,
        "measurements": {
            "interocular_distance_mm": 63.8,
            "facial_symmetry_score": 98.1,
            "pose": {"pitch": 0.2, "roll": -0.1, "yaw": 0.5},
            "quality": {"brightness": 82.0, "sharpness": 89.0, "is_optimal": True},
            "bounding_box": {"width": 0.44, "height": 0.58, "left": 0.28, "top": 0.21},
            "confidence": 99.4,
        },
        "raw_record": {},
        "registered_at": "2026-10-05T12:00:00Z",
        "provider": "Amazon Rekognition",
    }

    with patch("app.api.v1.rekognition.index_user_face", return_value=mock_result):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            payload = {
                "user_email": "ana.silva@retailmetrics.com",
                "user_name": "Ana Silva",
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            }
            response = await client.post("/api/v1/rekognition/index-face", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["face_id"] == "test-face-12345"
            assert data["measurements"]["interocular_distance_mm"] == 63.8

@pytest.mark.asyncio
async def test_verify_face_mock_flow():
    mock_search = {
        "matched": True,
        "face_id": "test-face-12345",
        "user_email": "ana.silva@retailmetrics.com",
        "similarity": 98.6,
        "confidence": 99.5,
        "collection_id": "crm-retailmetrics-faces",
        "external_image_id": "ana_silva_retailmetrics_com",
    }

    with patch("app.api.v1.rekognition.search_face_in_collection", return_value=mock_search):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            payload = {
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                "similarity_threshold": 80.0
            }
            response = await client.post("/api/v1/rekognition/verify-face", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["matched"] is True
            assert data["user_email"] == "ana.silva@retailmetrics.com"
            assert data["access_token"] is not None
            assert data["token_type"] == "bearer"
