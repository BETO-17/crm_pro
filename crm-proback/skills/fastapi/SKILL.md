# Skill: FastAPI

## Objetivo
Construir APIs REST con FastAPI, Python 3.13 y Pydantic v2.

## Convenciones
- Usar `APIRouter`.
- Prefijo global `/api/v1`.
- Usar `Depends` para autenticación, DB y RBAC.
- Usar `response_model`.
- Validar entrada con Pydantic.
- No retornar modelos SQLAlchemy directamente cuando se requiera un contrato API estable.
- Usar `HTTPException` o excepciones de dominio traducidas mediante handlers.

## Estructura
```text
app/api/v1/
app/schemas/
app/services/
app/repositories/
```

## Endpoints
Documentar propósito, permisos, parámetros y respuestas.

## Seguridad
Toda ruta protegida debe declarar una dependencia de autenticación/autorización.
