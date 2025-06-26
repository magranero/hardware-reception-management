# Migraciones de Base de Datos

Este directorio contiene los scripts de migración para la base de datos PostgreSQL.

## Propósito

Estos scripts definen el esquema completo de la base de datos y se ejecutan en orden para crear la estructura necesaria para la aplicación DataCenter Manager.

## Estructura

- `20250626104640_misty_portal.sql`: Esquema inicial de la base de datos (tablas)
- `20250626104707_cool_leaf.sql`: Funciones almacenadas (equivalentes a procedimientos almacenados)
- `20250626104755_warm_waterfall.sql`: Datos iniciales para nombres de dispositivos

## Migraciones SQL Server a PostgreSQL

Estos scripts ya han sido convertidos de SQL Server a PostgreSQL, incluyendo:

1. Cambios de sintaxis:
   - `uniqueidentifier` → `UUID`
   - `NEWID()` → `gen_random_uuid()`
   - `bit` → `BOOLEAN`
   - `nvarchar` → `VARCHAR`
   - `datetime2` → `TIMESTAMP`

2. Cambios en procedimientos almacenados:
   - `CREATE PROCEDURE` → `CREATE FUNCTION`
   - Parámetros nombrados con `@` → parámetros posicionales (`$1`, `$2`, etc.)
   - Implementación de funciones que devuelven valores (`RETURNS`)

3. Convenciones de PostgreSQL:
   - Nombres de tabla y columna en minúsculas con guiones bajos (snake_case)
   - Uso de extensiones nativas de PostgreSQL (`uuid-ossp`, `pgcrypto`)