# Skill: CSV Data Processing

## Objetivo
Procesar datasets CSV de RetailMetrics 360 con Python y pandas de forma segura y eficiente.

## Flujo
```text
Upload
 -> file validation
 -> size/type checks
 -> parse
 -> schema validation
 -> normalize
 -> bulk insert
 -> summary
```

## Validaciones
- extensión y MIME cuando sea posible;
- tamaño máximo;
- columnas requeridas;
- tipos;
- valores nulos;
- duplicados según reglas del dataset;
- filas inválidas.

## Rendimiento
- Evitar `read_csv` sin considerar el tamaño.
- Para archivos grandes, usar procesamiento por chunks.
- Usar inserciones masivas.
- No mantener todo el dataset en memoria innecesariamente.

## Resultado
Retornar:
- `dataset_id`
- `status`
- `rows_processed`
- `rows_rejected`
- `errors`
