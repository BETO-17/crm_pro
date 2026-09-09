# Skill: Security & RBAC

## Objetivo
Implementar autenticación, autorización y aislamiento multi-tenant.

## Roles
- admin
- analyst
- manager (futuro)

## Flujo
```text
Credentials
 -> verify password
 -> create JWT
 -> authenticate request
 -> authorize role
 -> authorize workspace
 -> execute service
```

## Reglas
- Hash de contraseñas con algoritmo seguro.
- JWT con expiración.
- Secretos por variables de entorno.
- `401` para falta de autenticación.
- `403` para falta de permisos.
- Nunca confiar en `role` o `workspace_id` enviados por el cliente.
- Nunca retornar `password_hash`.

## Multi-tenant
La pertenencia a workspace debe comprobarse antes de leer o modificar recursos.
