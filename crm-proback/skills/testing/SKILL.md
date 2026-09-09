# Skill: Testing

## Objetivo
Garantizar calidad del backend mediante pytest.

## Capas
- unit tests;
- integration tests;
- API tests.

## Prioridad
1. autenticación;
2. RBAC;
3. aislamiento multi-tenant;
4. datasets;
5. analytics;
6. CRUD.

## Casos mínimos
- `401` sin token;
- `403` con rol insuficiente;
- `404` recurso inexistente;
- acceso cross-workspace rechazado;
- payload inválido rechazado;
- CSV válido aceptado;
- CSV inválido rechazado.

## Principio
Cada bug corregido en una funcionalidad crítica debería incorporar una prueba de regresión.
