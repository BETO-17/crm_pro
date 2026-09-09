# AGENTS.md — RetailMetrics 360 Backend

## 1. Propósito

Este archivo define las reglas de desarrollo para el backend de **RetailMetrics 360**, una plataforma CRM SaaS B2B orientada al análisis de datos del sector retail.

El backend debe exponer una API REST segura, mantenible y escalable para:
- autenticación y autorización RBAC;
- gestión de usuarios y workspaces;
- carga y procesamiento de CSV;
- almacenamiento y consulta de datasets;
- métricas, comparaciones y tendencias;
- generación de reportes;
- aislamiento multi-tenant por `workspace_id`.

El contexto funcional del proyecto establece `/api/v1` como prefijo base y contempla módulos de `auth`, `users`, `workspaces`, `datasets`, `analytics` y `reports`. También define PostgreSQL como base relacional y el uso de JWT, bcrypt y CORS. 

## 2. Stack obligatorio

- Python **3.12**
- FastAPI
- Pydantic v2 / pydantic-settings
- SQLAlchemy 2.x
- PostgreSQL
- Supabase como plataforma de PostgreSQL y servicios asociados
- Alembic para migraciones
- JWT para autenticación
- bcrypt/Argon2 para hashing de contraseñas
- pandas para procesamiento de CSV
- pytest para pruebas
- httpx para pruebas de API

### Principio importante sobre Supabase

Usar **Supabase principalmente como infraestructura PostgreSQL y servicios gestionados**. La lógica de negocio debe permanecer en FastAPI.

No duplicar innecesariamente autenticación entre Supabase Auth y un sistema JWT propio. Antes de implementar Auth, elegir explícitamente una estrategia. Para este proyecto, si FastAPI emite y valida los JWT, mantener la autenticación centralizada en FastAPI y usar Supabase como PostgreSQL/Storage cuando corresponda.

## 3. Arquitectura

Usar una arquitectura modular por dominio:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── dependencies.py
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── workspaces.py
│   │       ├── datasets.py
│   │       ├── analytics.py
│   │       └── reports.py
│   └── utils/
├── tests/
├── alembic/
├── .env.example
├── requirements.txt
└── README.md
```

Reglas:
- `api`: HTTP, validación de entrada y respuesta.
- `services`: reglas de negocio.
- `repositories`: acceso a datos.
- `models`: modelos SQLAlchemy.
- `schemas`: DTOs Pydantic.
- `core`: configuración, seguridad, DB y dependencias.
- No colocar consultas SQL complejas directamente dentro de los routers.
- Evitar routers gigantes.

## 4. Multi-tenant

Todo recurso perteneciente a un cliente debe estar asociado a un `workspace_id`.

Reglas obligatorias:
1. Nunca devolver datos de otro workspace.
2. El `workspace_id` no debe confiarse ciegamente al frontend.
3. Obtener el usuario autenticado desde el JWT.
4. Verificar que el usuario pertenece al workspace solicitado.
5. Aplicar el aislamiento también en repositorios/servicios.
6. Las consultas de datasets y analytics deben filtrar por workspace.

## 5. Roles

Roles iniciales:
- `admin`
- `analyst`

Rol futuro:
- `manager`

Permisos principales:
- `admin`: usuarios, workspaces, datasets, analytics y reportes.
- `analyst`: datasets y analytics de sus workspaces.
- `manager`: reservar diseño hasta que se especifique formalmente.

Implementar RBAC mediante dependencias reutilizables de FastAPI.

## 6. API

Prefijo:

```text
/api/v1
```

Módulos esperados:

```text
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /users
POST   /users
PUT    /users/{id}
DELETE /users/{id}

GET    /workspaces
POST   /workspaces
GET    /workspaces/{id}
PUT    /workspaces/{id}

GET    /datasets
POST   /datasets/upload
GET    /datasets/{id}
DELETE /datasets/{id}

GET    /analytics/dataset/{id}/data
POST   /analytics/compare
GET    /analytics/trends

GET    /reports
POST   /reports/generate
GET    /reports/{id}/download
```

Seguir REST y usar códigos HTTP correctos.

## 7. Base de datos

Modelo inicial:

```text
users
workspaces
user_workspaces
datasets
dataset_rows
```

`datasets` debe almacenar al menos:
- id
- workspace_id
- uploaded_by
- filename
- status
- created_at

Estados de dataset:
- `processing`
- `ready`
- `error`

Para datasets dinámicos se puede usar PostgreSQL JSONB, pero no sacrificar rendimiento sin evaluar el volumen. Para consultas analíticas frecuentes, preferir columnas tipadas o estructuras optimizadas.

## 8. CSV

El flujo esperado es:

```text
Upload
  ↓
Validación
  ↓
Parsing
  ↓
Normalización
  ↓
Bulk Insert
  ↓
Resumen
  ↓
Dataset ready/error
```

La respuesta debe informar como mínimo:
- dataset_id
- filas procesadas
- filas rechazadas
- errores de validación
- estado

No cargar archivos completos en memoria si el tamaño puede crecer considerablemente.

## 9. Seguridad

Obligatorio:
- secretos únicamente mediante variables de entorno;
- nunca subir `.env`;
- contraseñas hasheadas;
- JWT con expiración;
- validación de payloads con Pydantic;
- CORS limitado al frontend autorizado;
- autorización por rol;
- autorización por workspace;
- consultas parametrizadas mediante SQLAlchemy;
- validación de archivos y límites de tamaño;
- manejo consistente de errores.

Nunca:
- guardar contraseñas en texto plano;
- devolver `password_hash` en respuestas;
- aceptar permisos enviados por el frontend como fuente de verdad;
- imprimir tokens o secretos en logs.

## 10. Configuración

Usar `.env` y `pydantic-settings`.

Variables esperadas:

```env
APP_NAME=RetailMetrics 360 API
ENVIRONMENT=development
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CORS_ORIGINS=
```

Nunca incluir valores reales en el repositorio.

## 11. Calidad de código

- Type hints obligatorios.
- Funciones pequeñas y con una responsabilidad.
- Nombres claros.
- Evitar código duplicado.
- Async donde aporte valor, especialmente en I/O.
- SQLAlchemy 2.x style.
- Pydantic v2.
- Docstrings para servicios públicos complejos.
- Errores de dominio diferenciados de errores HTTP cuando sea útil.

## 12. Testing

Cada módulo nuevo debe considerar:
- unit tests para servicios;
- tests de repositorios críticos;
- tests de endpoints;
- tests de autenticación;
- tests de RBAC;
- tests de aislamiento por workspace;
- tests de validación CSV.

Casos críticos:
1. usuario válido obtiene JWT;
2. usuario sin permisos recibe `403`;
3. usuario no autenticado recibe `401`;
4. usuario no puede consultar otro workspace;
5. CSV válido se procesa;
6. CSV inválido se rechaza;
7. dataset inexistente devuelve `404`.

## 13. Desarrollo incremental

Implementar en este orden:

### Fase 1
- configuración;
- conexión PostgreSQL/Supabase;
- SQLAlchemy;
- Alembic;
- health check.

### Fase 2
- users;
- workspaces;
- relaciones;
- seed inicial.

### Fase 3
- login;
- JWT;
- password hashing;
- RBAC;
- `/auth/me`.

### Fase 4
- upload CSV;
- validación;
- almacenamiento;
- estados de procesamiento.

### Fase 5
- exploración;
- filtros;
- paginación;
- agregaciones.

### Fase 6
- comparación;
- tendencias;
- KPIs.

### Fase 7
- reportes;
- procesamiento asíncrono si el volumen lo requiere.

### Fase 8
- pruebas;
- seguridad;
- observabilidad;
- documentación;
- Docker/deployment.

## 14. Documentación

FastAPI debe mantener OpenAPI actualizado.

Cada endpoint nuevo debe documentar:
- propósito;
- autenticación requerida;
- roles;
- parámetros;
- request body;
- respuestas;
- errores posibles.

## 15. Regla de implementación

Antes de crear código:
1. identificar el dominio afectado;
2. revisar el modelo de datos;
3. definir schema Pydantic;
4. definir servicio;
5. definir repository si corresponde;
6. crear router;
7. agregar autorización;
8. agregar tests.

No introducir dependencias nuevas sin justificar su necesidad.

## 16. Definition of Done

Una funcionalidad está terminada cuando:
- funciona;
- está integrada con `/api/v1`;
- respeta RBAC;
- respeta multi-tenancy;
- valida entradas;
- maneja errores;
- tiene tests relevantes;
- no expone secretos;
- está documentada en OpenAPI;
- no rompe funcionalidades existentes.
