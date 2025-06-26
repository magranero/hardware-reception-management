# DataCenter Manager

Una aplicación moderna para la gestión eficiente del ciclo de vida de equipamiento en datacenters, desde la planificación hasta la integración con DCIM.

![DataCenter Manager Banner](https://images.unsplash.com/photo-1733036363190-fd1f5410d9f2?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

## Características Principales

- ✅ **Gestión de proyectos completa**: Centraliza toda la información desde la fase de planificación
- 🔍 **Verificación inteligente de equipos**: OCR y IA para el reconocimiento automatizado de albaranes
- 📋 **Control de inventario**: Seguimiento de equipamiento desde recepción hasta instalación
- 🤖 **Procesamiento con IA**: Utiliza Mistral AI para análisis inteligente de documentación
- 🔄 **Integración DCIM**: Exportación directa al sistema de gestión del datacenter
- 📱 **Responsive**: Interfaz adaptable para uso en dispositivos móviles
- 🌐 **Backend API**: Arquitectura cliente-servidor escalable

## Guía Rápida de Inicio

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/your-username/datacenter-manager.git
cd datacenter-manager

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
cp server/.env.example server/.env
# Editar los archivos .env con tus valores
```

## Despliegue en Railway

DataCenter Manager está configurado para ser desplegado en Railway con PostgreSQL.

### Configuración Inicial

1. Ejecuta el script de configuración de Railway:

```bash
node scripts/setup-railway.js
```

Este script guiará en el proceso de:
- Instalar Railway CLI si es necesario
- Iniciar sesión en Railway
- Crear un nuevo proyecto o vincular uno existente
- Configurar una base de datos PostgreSQL

### Variables de Entorno

Railway necesita las siguientes variables de entorno:

```bash
# Autenticación y seguridad
JWT_SECRET=un_valor_secreto_seguro_para_produccion

# API Keys
MISTRAL_API_KEY=tu_clave_api_de_mistral

# Otras variables opcionales que puedes personalizar
CONTACT_EMAIL=tu_email@ejemplo.com
LOG_LEVEL=info
CORS_ORIGIN=https://tu-dominio.com
```

> Las variables de base de datos (DATABASE_URL, etc.) son proporcionadas automáticamente por Railway.

### Despliegue Manual

Si prefieres desplegar manualmente:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Iniciar sesión
railway login

# Vincular al proyecto
railway link

# Configurar variables de entorno
railway variables set JWT_SECRET=tu_clave_secreta MISTRAL_API_KEY=tu_clave_api_mistral

# Desplegar
railway up
```

### Despliegue Automático

Para configurar despliegues automáticos con GitHub:

1. En GitHub, ve a Settings → Secrets → New repository secret
2. Añade un nuevo secreto llamado `RAILWAY_TOKEN`
3. El valor debe ser tu token de API de Railway (obtenible con `railway login --generate-token`)
4. Cada push a la rama principal (`main`) activará un despliegue automático

### Configuración

Copia el archivo de ejemplo `.env.development` a `.env`:

```
cp .env.development .env
```

Luego edita el archivo `.env` con tus propias credenciales.

### Ejecución

#### Modo Desarrollo

```bash
# Frontend (Vite)
npm run dev

# Backend (Express)
npm run dev:backend
```

#### Modo Producción

```bash
# Construir frontend
npm run build

# Iniciar servidor completo
npm run start:backend
```

#### Usando PM2 (para producción)

```bash
# Iniciar aplicación con PM2
npm run start:pm2

# Detener aplicación
npm run stop:pm2

# Reiniciar aplicación
npm run restart:pm2
```

### Despliegue en Railway

#### Requisitos

1. Cuenta en [Railway](https://railway.app/)
2. Repositorio en GitHub

#### Pasos para desplegar

1. **Configura tu proyecto en Railway**:
   - Inicia sesión en Railway con tu cuenta de GitHub
   - Crea un nuevo proyecto
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio

2. **Configura las variables de entorno**:
   - En el panel de Railway, ve a la sección "Variables"
   - Añade todas las variables requeridas (ver archivo `.env.example`)
   - Railway proporciona automáticamente las variables de base de datos (`DATABASE_URL`, `DATABASE_HOST`, etc.)

3. **Configura el despliegue automático**:
   - En GitHub, ve a "Settings" → "Secrets and variables" → "Actions"
   - Añade un secreto llamado `RAILWAY_TOKEN` con tu token de API de Railway
   (Puedes obtener el token en Railway: Dashboard → Account Settings → API Tokens)

4. **Despliegue manual inicial**:
   ```bash
   # Instalar Railway CLI
   npm install -g @railway/cli
   
   # Iniciar sesión
   railway login
   
   # Vincular al proyecto
   railway link
   
   # Desplegar
   railway up
   ```

5. **Despliegue automático**:
   - Cada push a la rama principal (`main`) activará un despliegue automático
   - También puedes desplegar manualmente desde la interfaz de GitHub Actions

## Estructura del Proyecto

```
datacenter-manager/
├── src/                # Código fuente frontend (React)
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas/rutas de la aplicación 
│   ├── services/       # Servicios de API y utilidades
│   ├── store/          # Estado global con Zustand
│   └── types/          # Definiciones TypeScript
├── server/             # Código fuente backend (Express)
│   ├── controllers/    # Controladores de API
│   ├── routes/         # Rutas de API
│   ├── middleware/     # Middleware Express
│   ├── utils/          # Utilidades del servidor
│   └── data/           # Datos de muestra
├── public/             # Activos públicos estáticos
├── dist/               # Archivos compilados para producción
├── uploads/            # Archivos subidos por los usuarios
└── logs/               # Logs del sistema
```

## Base de Datos

El proyecto utiliza PostgreSQL para almacenar los datos.

### Migraciones

La estructura de la base de datos se define en los scripts de migración ubicados en el directorio `supabase/migrations`. Estos scripts se ejecutan automáticamente en Railway durante el despliegue.

### Modelo de Datos

El modelo de datos incluye las siguientes entidades principales:

- `projects` - Información de proyectos
- `orders` - Pedidos asociados a proyectos
- `delivery_notes` - Albaranes de entrega
- `equipments` - Equipos individuales recibidos
- `estimated_equipments` - Equipos esperados para un proyecto
- `incidents` - Incidencias reportadas para equipos

Todas las tablas utilizan UUIDs como clave primaria y tienen campos para seguimiento de fechas de creación y actualización.

## API Backend

La aplicación incluye un servidor Express con las siguientes rutas API:

```
GET  /api/health                     # Estado del servidor
GET  /api/projects                   # Listar proyectos
POST /api/projects                   # Crear proyecto
GET  /api/projects/:id               # Obtener proyecto
POST /api/delivery-notes             # Crear albarán
POST /api/equipment/:id/verify       # Verificar equipo
```

## Modos de Funcionamiento

### Modo Demo

La aplicación viene configurada por defecto en "Modo Demo", lo que permite utilizarla sin conexión a una base de datos real, usando datos de muestra para demostración.

Para desactivar el modo demo y conectar a su propia base de datos:

1. En la interfaz, vaya a Ajustes > Backend
2. Desactive la opción "Usar Datos de Demostración"
3. Configure las credenciales de conexión en el archivo .env

### Modo Debug

Para activar logs detallados de las interacciones frontend-backend:

1. En la interfaz, vaya a Ajustes > Backend
2. Active la opción "Mostrar Interacciones Frontend-Backend"

## Usuarios de Prueba

| Email                     | Contraseña  | Rol            |
|---------------------------|-------------|----------------|
| admin@datacenter.com      | admin123    | Administrador  |
| tecnico@datacenter.com    | tecnico123  | Técnico        |
| supervisor@datacenter.com | supervisor123 | Supervisor   |
| junior@datacenter.com     | junior123   | Técnico Junior |

## Tecnologías Utilizadas

- **Frontend**: React, Zustand, TailwindCSS, Vite
- **Backend**: Node.js, Express, SQL Server
- **IA y OCR**: Mistral AI, Tesseract.js
- **DevOps**: PM2, Winston

## Licencia

Copyright © 2025 DataCenter Manager. Todos los derechos reservados.