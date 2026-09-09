# Skill: Supabase

## Objetivo
Integrar RetailMetrics 360 con Supabase de manera segura.

## Uso
- PostgreSQL gestionado para persistencia.
- Supabase Storage para archivos cuando sea necesario.
- Supabase Auth solo si se decide explícitamente utilizarlo como proveedor de identidad.

## Regla de secretos
- `SUPABASE_SERVICE_ROLE_KEY` es secreto de backend.
- Nunca enviarlo al frontend.
- Nunca incluirlo en logs.
- Nunca incluirlo en Git.

## Decisión de autenticación
No mezclar sin diseño:
- JWT propio de FastAPI
- Supabase Auth

Elegir una fuente de verdad para identidad y autorización.

## Archivos
Para CSV grandes, evaluar Supabase Storage en lugar de guardar el binario en PostgreSQL.
