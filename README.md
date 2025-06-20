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

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/datacenter-manager.git
cd datacenter-manager

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
cp server/.env.example server/.env
# Editar los archivos .env con tus valores
```

### Configuración

Edita el archivo `.env` con tus propias credenciales:

```
# API Keys
VITE_MISTRAL_API_KEY=tu_clave_api_mistral

# Configuración de Base de Datos
VITE_DB_SERVER=nombre_de_tu_servidor
VITE_DB_NAME=QEIS1DAT
VITE_DB_USER=tu_usuario
VITE_DB_PASSWORD=tu_contraseña
```

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