# Skill: Backend Architecture

## Objetivo
Diseñar e implementar módulos del backend de RetailMetrics 360 con separación clara entre API, servicios, repositorios, modelos y schemas.

## Reglas
- Router = HTTP.
- Service = negocio.
- Repository = persistencia.
- Model = SQLAlchemy.
- Schema = Pydantic.
- Evitar lógica de negocio en routers.
- Mantener módulos pequeños.
- Respetar `/api/v1`.
- Todo dominio multi-tenant debe validar `workspace_id`.

## Patrón recomendado
```text
Request
  -> Router
  -> Dependency/Auth
  -> Service
  -> Repository
  -> SQLAlchemy/PostgreSQL
  -> Service
  -> Schema
  -> Response
```

## Checklist
- [ ] dominio identificado
- [ ] schema definido
- [ ] autorización aplicada
- [ ] servicio creado
- [ ] persistencia separada
- [ ] errores controlados
- [ ] tests
