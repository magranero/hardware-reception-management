# Despliegue de DataCenter Manager

Este directorio contiene los archivos necesarios para desplegar la aplicación en un entorno de producción utilizando PM2 y Nginx.

## Requisitos

- Node.js 18.x o superior
- PM2 (instalación global: `npm install -g pm2`)
- Nginx
- Base de datos SQL Server

## Estructura de Directorios

```
datacenter-manager/
├── deploy/                  # Archivos de despliegue
│   ├── ecosystem.config.cjs # Configuración de PM2
│   ├── nginx.conf           # Configuración de Nginx
│   └── setup.sh             # Script de configuración
├── dist/                    # Archivos compilados del frontend (generado por npm run build)
├── server/                  # Código fuente del backend
├── src/                     # Código fuente del frontend
├── uploads/                 # Directorio para archivos subidos por los usuarios
└── logs/                    # Logs de la aplicación
```

## Pasos para el Despliegue

### 1. Preparación

1. Clona el repositorio en el servidor
2. Ejecuta el script de configuración:

```bash
bash deploy/setup.sh
```

3. Edita el archivo `.env` con los valores correctos para tu entorno

### 2. Configuración de Nginx

1. Edita el archivo `deploy/nginx.conf` y actualiza:
   - `server_name` con tu dominio
   - Rutas de los directorios para que coincidan con la ubicación en tu servidor

2. Copia el archivo de configuración a Nginx:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/datacenter-app
```

3. Crea un enlace simbólico:

```bash
sudo ln -s /etc/nginx/sites-available/datacenter-app /etc/nginx/sites-enabled/
```

4. Verifica la configuración de Nginx:

```bash
sudo nginx -t
```

5. Reinicia Nginx:

```bash
sudo systemctl restart nginx
```

### 3. Despliegue con PM2

1. Construye la aplicación:

```bash
npm run build
```

2. Inicia la aplicación con PM2:

```bash
npm run pm2:start
```

3. Para guardar la configuración de PM2 para que se inicie al reiniciar:

```bash
pm2 save
pm2 startup
```

### 4. Monitorización

- Monitorizar los procesos de PM2:

```bash
pm2 monit
```

- Ver los logs:

```bash
pm2 logs datacenter-api
```

### 5. Actualización de la Aplicación

Para actualizar la aplicación cuando haya cambios:

```bash
git pull
npm install
npm run deploy  # Esto ejecutará build y reiniciará PM2
```

## Solución de Problemas

### Problemas de Conexión con la Base de Datos

Verifica que:
- La instancia de SQL Server sea accesible desde el servidor
- Las credenciales en el archivo `.env` sean correctas
- Los puertos necesarios estén abiertos en el firewall

### Problemas con Nginx

Revisa los logs de error de Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```

### Problemas con PM2

Revisa los logs de PM2:

```bash
tail -f logs/pm2/error.log
tail -f logs/pm2/output.log
```

Para más información, consulta la documentación oficial de:
- [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx](https://nginx.org/en/docs/)