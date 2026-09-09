# Skill: Analytics

## Objetivo
Construir consultas y servicios para exploración, comparación y tendencias.

## Capacidades
- paginación;
- filtros;
- ordenamiento;
- agregaciones;
- sumas;
- promedios;
- agrupaciones;
- comparación entre datasets;
- KPIs.

## Reglas
- Validar todos los parámetros.
- No permitir SQL arbitrario desde query params.
- Usar allowlists para campos filtrables y ordenables.
- Aplicar `workspace_id`.
- Limitar cantidad de filas.
- Preferir agregaciones SQL cuando sean más eficientes que transportar datos crudos a Python.

## Endpoint base
```text
GET /api/v1/analytics/dataset/{id}/data
POST /api/v1/analytics/compare
GET /api/v1/analytics/trends
```
