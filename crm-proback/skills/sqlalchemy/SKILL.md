# Skill: SQLAlchemy 2.x

## Objetivo
Gestionar PostgreSQL mediante SQLAlchemy 2.x.

## Reglas
- Usar SQLAlchemy 2.x style.
- Declarar modelos con `Mapped` y `mapped_column`.
- Usar relaciones explícitas.
- Mantener sesiones mediante dependency injection.
- Evitar N+1 queries.
- Usar paginación para listados.
- Usar transacciones para operaciones multi-tabla.
- Usar índices para campos consultados frecuentemente.

## Multi-tenant
Las consultas sobre recursos del cliente deben incluir el filtro por `workspace_id`.

## Migraciones
Usar Alembic. No modificar producción manualmente sin migración versionada.

## PostgreSQL
Aprovechar JSONB únicamente cuando el modelo dinámico lo justifique.
