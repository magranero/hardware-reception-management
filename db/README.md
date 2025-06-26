# Migración a PostgreSQL

Este directorio contiene los scripts de migración para convertir la base de datos de SQL Server a PostgreSQL.

## Estructura

- `migrations/`: Contiene los scripts de migración SQL
  - `postgresql/`: Scripts específicos para PostgreSQL
    - `initial_schema.sql`: Esquema inicial de la base de datos
    - `stored_functions.sql`: Funciones almacenadas (equivalente a los procedimientos almacenados de SQL Server)
    - `init_device_names.sql`: Datos iniciales para la tabla de nombres de dispositivos

## Proceso de Migración

1. **Preparación**: 
   - Instalar PostgreSQL (o usar un servicio gestionado como Railway)
   - Crear una base de datos nueva

2. **Ejecución**:
   ```bash
   # Conectar a la base de datos PostgreSQL
   psql -h <host> -p <port> -U <username> -d <database_name>
   
   # Ejecutar los scripts en el siguiente orden:
   \i db/migrations/postgresql/initial_schema.sql
   \i db/migrations/postgresql/stored_functions.sql
   \i db/migrations/postgresql/init_device_names.sql
   ```

3. **Verificación**:
   - Verificar que todas las tablas se hayan creado correctamente
   - Comprobar que las funciones almacenadas estén disponibles

## Diferencias Principales con SQL Server

### Cambios en la Sintaxis

| SQL Server | PostgreSQL |
|------------|------------|
| `GETDATE()` | `CURRENT_TIMESTAMP` |
| `NEWID()` | `gen_random_uuid()` |
| `@param` | `$1`, `$2`, etc. (parámetros posicionales) |
| `CONVERT(nvarchar(255), HASHBYTES('SHA2_256', @Password), 2)` | `crypt(p_password, gen_salt('bf'))` |
| `uniqueidentifier` | `UUID` |
| `bit` | `BOOLEAN` |
| `nvarchar(n)` | `VARCHAR(n)` |
| `datetime2` | `TIMESTAMP` |
| `COALESCE(@param1, Column)` | `COALESCE($1, column)` |
| `WITH (NOLOCK)` | No existe (PostgreSQL tiene MVCC) |
| `TOP n` | `LIMIT n` |
| `ISNULL(value, 0)` | `COALESCE(value, 0)` |

### Cambios en Procedimientos Almacenados

- SQL Server usa `CREATE PROCEDURE`, PostgreSQL usa `CREATE FUNCTION`
- PostgreSQL requiere que las funciones devuelvan un valor (`RETURNS void` como mínimo)
- Las transacciones en PostgreSQL son explícitas (`BEGIN`, `COMMIT`, `ROLLBACK`)
- Los nombres de parámetros en PostgreSQL empiezan con `p_` por convención (aunque no es obligatorio)
- PostgreSQL usa `$$` para delimitar bloques de código en funciones

### Cambios en Nombres de Tablas y Columnas

- En PostgreSQL es convencional usar nombres en minúsculas separados por guiones bajos (snake_case)
- SQL Server: `UserId` → PostgreSQL: `user_id`
- SQL Server: `UserGroups` → PostgreSQL: `user_groups`

## Consideraciones Adicionales

- PostgreSQL es sensible a mayúsculas/minúsculas en los nombres de columnas y tablas
- PostgreSQL usa `TRUE`/`FALSE` para valores booleanos (en lugar de `1`/`0`)
- PostgreSQL no requiere "cerrar" procedimientos con `GO`
- PostgreSQL tiene soporte nativo para UUID
- PostgreSQL requiere extensiones para ciertas funcionalidades (`uuid-ossp` para UUIDs, `pgcrypto` para encriptación)