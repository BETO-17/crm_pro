-- =============================================
-- BASE DE DATOS: RetailMetrics 360
-- PostgreSQL 15+
-- =============================================

-- Eliminar tablas si existen (en orden correcto por dependencias)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS dataset_rows CASCADE;
DROP TABLE IF EXISTS datasets CASCADE;
DROP TABLE IF EXISTS report_schedules CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS user_workspaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- =============================================
-- 1. TABLA: workspaces
-- =============================================
CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE workspaces IS 'Espacios de trabajo multi-tenant';
COMMENT ON COLUMN workspaces.config IS 'Configuración específica del workspace (métricas, dashboard, etc.)';

-- =============================================
-- 2. TABLA: users
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'analyst', 'manager', 'viewer')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{"theme": "light", "notifications": true}',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Usuarios del sistema';
COMMENT ON COLUMN users.preferences IS 'Preferencias de usuario (theme, dashboard config, etc.)';

-- =============================================
-- 3. TABLA: user_workspaces (Relación N:M)
-- =============================================
CREATE TABLE user_workspaces (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    role_override VARCHAR(50) CHECK (role_override IN ('admin', 'analyst', 'manager', 'viewer')),
    is_default BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workspace_id)
);

COMMENT ON TABLE user_workspaces IS 'Asignación de usuarios a workspaces con permisos específicos';

-- =============================================
-- 4. TABLA: datasets
-- =============================================
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT, -- Tamaño en bytes
    file_hash VARCHAR(64), -- SHA-256 para validación
    mime_type VARCHAR(100),
    description TEXT,
    schema_definition JSONB, -- Definición del esquema (columnas, tipos)
    total_rows INTEGER DEFAULT 0,
    total_columns INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error', 'deleted')),
    processing_error TEXT,
    metadata JSONB DEFAULT '{}', -- Metadatos adicionales (fecha rango, etc.)
    processed_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    parent_dataset_id INTEGER REFERENCES datasets(id),
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE datasets IS 'Datasets cargados al sistema';
COMMENT ON COLUMN datasets.schema_definition IS 'Estructura del dataset: {columns: [{name, type, nullable}]}';
COMMENT ON COLUMN datasets.metadata IS 'Metadatos: {date_range: {min, max}, null_count, etc.}';

-- =============================================
-- 5. TABLA: dataset_rows (Datos particionados)
-- =============================================
-- Creación de particiones por dataset_id (opcional)
CREATE TABLE dataset_rows (
    id BIGSERIAL,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    row_index INTEGER NOT NULL, -- Índice de la fila en el CSV
    data JSONB NOT NULL, -- Datos en formato JSON
    raw_data TEXT, -- Datos crudos originales (para depuración)
    validation_errors JSONB, -- Errores de validación por campo
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, dataset_id)
) PARTITION BY HASH (dataset_id);

COMMENT ON TABLE dataset_rows IS 'Filas de datos de los datasets (particionado)';
COMMENT ON COLUMN dataset_rows.data IS 'Datos completos de la fila en formato JSON';
COMMENT ON COLUMN dataset_rows.validation_errors IS 'Errores de validación: {field: error_message}';

-- Creación de particiones iniciales (10 particiones)
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 0..9 LOOP
        EXECUTE format('
            CREATE TABLE dataset_rows_partition_%s PARTITION OF dataset_rows
            FOR VALUES WITH (MODULUS 10, REMAINDER %s)
        ', i, i);
    END LOOP;
END $$;

-- =============================================
-- 6. TABLA: reports
-- =============================================
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('pdf', 'excel', 'csv', 'dashboard')),
    config JSONB NOT NULL DEFAULT '{}', -- Configuración del reporte (filtros, columnas, etc.)
    file_path VARCHAR(500), -- Ruta del archivo generado
    file_size BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error', 'expired')),
    error_message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE, -- Fecha de expiración del reporte
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE reports IS 'Reportes generados por los usuarios';

-- =============================================
-- 7. TABLA: report_schedules (Programación de reportes)
-- =============================================
CREATE TABLE report_schedules (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_config JSONB NOT NULL,
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'custom')),
    cron_expression VARCHAR(100), -- Para schedule_type = 'custom'
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status VARCHAR(50) CHECK (last_run_status IN ('success', 'error', 'running')),
    is_active BOOLEAN DEFAULT true,
    recipients JSONB, -- Lista de emails para enviar reportes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE report_schedules IS 'Programación de reportes automáticos';

-- =============================================
-- 8. TABLA: audit_logs (Auditoría)
-- =============================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'warning')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones';

-- =============================================
-- 9. TABLA: user_sessions (Sesiones activas)
-- =============================================
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE NOT NULL,
    access_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios';

-- =============================================
-- 10. TABLA: notifications
-- =============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notifications IS 'Notificaciones para usuarios';

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para workspaces
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_by ON users(created_by);

-- Índices para user_workspaces
CREATE INDEX idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX idx_user_workspaces_workspace_id ON user_workspaces(workspace_id);
CREATE INDEX idx_user_workspaces_is_default ON user_workspaces(is_default);

-- Índices para datasets
CREATE INDEX idx_datasets_workspace_id ON datasets(workspace_id);
CREATE INDEX idx_datasets_uploaded_by ON datasets(uploaded_by);
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_datasets_created_at ON datasets(created_at);
CREATE INDEX idx_datasets_tags ON datasets USING GIN(tags);
CREATE INDEX idx_datasets_metadata ON datasets USING GIN(metadata);

-- Índices para dataset_rows
CREATE INDEX idx_dataset_rows_dataset_id ON dataset_rows(dataset_id);
CREATE INDEX idx_dataset_rows_row_index ON dataset_rows(dataset_id, row_index);
CREATE INDEX idx_dataset_rows_data ON dataset_rows USING GIN(data);

-- Índices para reports
CREATE INDEX idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Índices para user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_workspace_id ON notifications(workspace_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas relevantes
CREATE TRIGGER update_workspaces_updated_at 
    BEFORE UPDATE ON workspaces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at 
    BEFORE UPDATE ON datasets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at 
    BEFORE UPDATE ON report_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCIÓN: Obtener métricas de un dataset
-- =============================================
CREATE OR REPLACE FUNCTION get_dataset_metrics(
    p_dataset_id INTEGER
) RETURNS JSONB AS $$
DECLARE
    v_metrics JSONB;
    v_total_rows BIGINT;
    v_total_columns INTEGER;
    v_null_counts JSONB;
BEGIN
    -- Obtener total de filas
    SELECT COUNT(*) INTO v_total_rows 
    FROM dataset_rows 
    WHERE dataset_id = p_dataset_id;
    
    -- Obtener columnas del dataset
    SELECT total_columns INTO v_total_columns
    FROM datasets 
    WHERE id = p_dataset_id;
    
    -- Contar nulos por columna
    SELECT jsonb_object_agg(
        key,
        (SELECT COUNT(*) FROM dataset_rows WHERE dataset_id = p_dataset_id AND data->>key IS NULL)
    ) INTO v_null_counts
    FROM (
        SELECT DISTINCT key
        FROM dataset_rows, jsonb_each(data)
        WHERE dataset_id = p_dataset_id
    ) AS t;
    
    v_metrics = jsonb_build_object(
        'total_rows', v_total_rows,
        'total_columns', v_total_columns,
        'null_counts', v_null_counts,
        'completeness', CASE WHEN v_total_rows > 0 THEN 
            (v_total_rows * v_total_columns - 
            (SELECT SUM(value) FROM jsonb_each_text(v_null_counts)))::FLOAT / 
            (v_total_rows * v_total_columns) 
            ELSE 0 END
    );
    
    RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: Obtener usuarios por workspace
-- =============================================
CREATE OR REPLACE FUNCTION get_workspace_users(
    p_workspace_id INTEGER
) RETURNS TABLE(
    user_id INTEGER,
    email VARCHAR,
    full_name VARCHAR,
    role VARCHAR,
    joined_at TIMESTAMP,
    is_default BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        COALESCE(uw.role_override, u.role) AS role,
        uw.joined_at,
        uw.is_default
    FROM users u
    JOIN user_workspaces uw ON u.id = uw.user_id
    WHERE uw.workspace_id = p_workspace_id
        AND u.status = 'active'
        AND u.deleted_at IS NULL
    ORDER BY uw.is_default DESC, u.full_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VISTAS PARA REPORTES Y DASHBOARDS
-- =============================================

-- Vista: Usuarios activos por workspace
CREATE OR REPLACE VIEW vw_workspace_user_stats AS
SELECT 
    w.id AS workspace_id,
    w.name AS workspace_name,
    COUNT(DISTINCT uw.user_id) AS total_users,
    COUNT(DISTINCT CASE WHEN u.role = 'admin' OR uw.role_override = 'admin' THEN u.id END) AS admin_count,
    COUNT(DISTINCT CASE WHEN u.role = 'analyst' OR uw.role_override = 'analyst' THEN u.id END) AS analyst_count,
    COUNT(DISTINCT CASE WHEN u.role = 'manager' OR uw.role_override = 'manager' THEN u.id END) AS manager_count,
    COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.id END) AS active_users
FROM workspaces w
LEFT JOIN user_workspaces uw ON w.id = uw.workspace_id
LEFT JOIN users u ON uw.user_id = u.id
WHERE w.deleted_at IS NULL
GROUP BY w.id, w.name;

-- Vista: Resumen de datasets por workspace
CREATE OR REPLACE VIEW vw_workspace_dataset_stats AS
SELECT 
    d.workspace_id,
    COUNT(d.id) AS total_datasets,
    COUNT(CASE WHEN d.status = 'ready' THEN 1 END) AS active_datasets,
    COUNT(CASE WHEN d.status = 'processing' THEN 1 END) AS processing_datasets,
    COUNT(CASE WHEN d.status = 'error' THEN 1 END) AS error_datasets,
    COALESCE(SUM(d.total_rows), 0) AS total_rows,
    AVG(d.total_rows) AS avg_rows_per_dataset,
    MAX(d.created_at) AS last_upload_at,
    COUNT(DISTINCT d.uploaded_by) AS uploaders
FROM datasets d
WHERE d.is_active = true AND d.deleted_at IS NULL
GROUP BY d.workspace_id;

-- Vista: Actividad reciente del sistema
CREATE OR REPLACE VIEW vw_recent_activity AS
SELECT 
    al.id,
    al.user_id,
    u.full_name,
    u.email,
    al.workspace_id,
    w.name AS workspace_name,
    al.action,
    al.resource_type,
    al.resource_id,
    al.details,
    al.status,
    al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
LEFT JOIN workspaces w ON al.workspace_id = w.id
WHERE al.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY al.created_at DESC
LIMIT 100;

-- =============================================
-- DATOS DE PRUEBA (Opcional)
-- =============================================

-- Insertar un workspace de prueba
INSERT INTO workspaces (name, description, status) 
VALUES ('RetailMetrics Demo', 'Workspace de demostración', 'active');

-- Insertar usuarios de prueba
INSERT INTO users (email, username, password_hash, full_name, role, status)
VALUES 
    ('admin@retailmetrics.com', 'admin', '$2b$12$hashed_password_here', 'Administrador', 'admin', 'active'),
    ('analyst@retailmetrics.com', 'analyst', '$2b$12$hashed_password_here', 'Analista', 'analyst', 'active'),
    ('manager@retailmetrics.com', 'manager', '$2b$12$hashed_password_here', 'Gerente', 'manager', 'active');

-- Asignar usuarios al workspace
INSERT INTO user_workspaces (user_id, workspace_id, is_default)
SELECT u.id, w.id, true
FROM users u, workspaces w
WHERE w.name = 'RetailMetrics Demo';

-- =============================================
-- PERMISOS Y SEGURIDAD (Opcional)
-- =============================================

-- Crear roles de base de datos
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
--         CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
--     END IF;
-- END $$;

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =============================================
-- CONSULTAS DE EJEMPLO
-- =============================================

-- 1. Obtener todos los datasets de un workspace con sus métricas
/*
SELECT 
    d.*,
    get_dataset_metrics(d.id) AS metrics
FROM datasets d
WHERE d.workspace_id = 1
    AND d.status = 'ready'
ORDER BY d.created_at DESC;
*/

-- 2. Obtener datos de un dataset con paginación
/*
SELECT 
    row_index,
    data
FROM dataset_rows
WHERE dataset_id = 1
    AND is_valid = true
ORDER BY row_index
LIMIT 50 OFFSET 0;
*/

-- 3. Filtrar datos por condiciones
/*
SELECT 
    row_index,
    data
FROM dataset_rows
WHERE dataset_id = 1
    AND data->>'sales' > '1000'
    AND data->>'region' = 'North'
ORDER BY row_index;
*/

-- 4. Agregaciones por categoría
/*
SELECT 
    data->>'category' AS category,
    COUNT(*) AS count,
    SUM((data->>'sales')::NUMERIC) AS total_sales,
    AVG((data->>'sales')::NUMERIC) AS avg_sales
FROM dataset_rows
WHERE dataset_id = 1
GROUP BY data->>'category'
ORDER BY total_sales DESC;
*/

-- 5. Obtener usuarios con sus workspaces
/*
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role AS global_role,
    w.id AS workspace_id,
    w.name AS workspace_name,
    COALESCE(uw.role_override, u.role) AS workspace_role,
    uw.is_default
FROM users u
LEFT JOIN user_workspaces uw ON u.id = uw.user_id
LEFT JOIN workspaces w ON uw.workspace_id = w.id
WHERE u.status = 'active'
ORDER BY u.full_name, uw.is_default DESC;
*/

-- =============================================
-- MANTENIMIENTO Y LIMPIEZA
-- =============================================

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP 
        OR is_active = false;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar audit logs antiguos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
    p_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLA: dataset_columns (Información de columnas)
-- =============================================
CREATE TABLE dataset_columns (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    column_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- text, numeric, date, boolean, json
    nullable BOOLEAN DEFAULT true,
    is_unique BOOLEAN DEFAULT false,
    min_value TEXT,
    max_value TEXT,
    null_count INTEGER DEFAULT 0,
    distinct_count INTEGER DEFAULT 0,
    stats JSONB, -- Estadísticas adicionales (mean, median, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dataset_id, column_name)
);

COMMENT ON TABLE dataset_columns IS 'Metadatos de las columnas de cada dataset';

CREATE INDEX idx_dataset_columns_dataset_id ON dataset_columns(dataset_id);

-- =============================================
-- TABLA: user_dashboard_configs (Configuración de dashboards)
-- =============================================
CREATE TABLE user_dashboard_configs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL DEFAULT '{"widgets": []}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_dashboard_configs IS 'Configuración personalizada de dashboards por usuario';

CREATE INDEX idx_user_dashboard_configs_user_id ON user_dashboard_configs(user_id);

-- =============================================
-- FIN DEL SCRIPT
-- =============================================