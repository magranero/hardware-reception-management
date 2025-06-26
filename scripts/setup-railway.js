#!/usr/bin/env node

/**
 * Script para la configuración inicial de Railway
 * Este script se encarga de preparar el entorno para Railway 
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.cyan}=== Configuración de Railway para DataCenter Manager ===${colors.reset}\n`);

// Comprobar si railway CLI está instalado
try {
  console.log(`${colors.yellow}Comprobando si Railway CLI está instalado...${colors.reset}`);
  execSync('railway --version', { stdio: 'ignore' });
  console.log(`${colors.green}✓ Railway CLI está instalado${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}⚠ Railway CLI no está instalado. Instalando...${colors.reset}`);
  try {
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Railway CLI instalado correctamente${colors.reset}`);
  } catch (installError) {
    console.error(`${colors.red}✗ No se pudo instalar Railway CLI. Por favor, instálelo manualmente: npm install -g @railway/cli${colors.reset}`);
    process.exit(1);
  }
}

// Verificar inicio de sesión en Railway
console.log(`\n${colors.yellow}Comprobando inicio de sesión en Railway...${colors.reset}`);
try {
  execSync('railway whoami', { stdio: 'ignore' });
  console.log(`${colors.green}✓ Sesión iniciada en Railway${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}⚠ No hay sesión iniciada en Railway. Iniciando sesión...${colors.reset}`);
  try {
    execSync('railway login', { stdio: 'inherit' });
  } catch (loginError) {
    console.error(`${colors.red}✗ Error al iniciar sesión en Railway. Por favor, inicie sesión manualmente: railway login${colors.reset}`);
    process.exit(1);
  }
}

// Comprobar si ya existe un proyecto vinculado
console.log(`\n${colors.yellow}Comprobando si hay un proyecto de Railway vinculado...${colors.reset}`);
let projectExists = false;
try {
  execSync('railway status', { stdio: 'ignore' });
  projectExists = true;
  console.log(`${colors.green}✓ Proyecto de Railway vinculado${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}⚠ No hay proyecto de Railway vinculado.${colors.reset}`);
}

// Si no hay proyecto vinculado, ofrecer opciones
if (!projectExists) {
  console.log(`\n${colors.cyan}Opciones disponibles:${colors.reset}`);
  console.log(`${colors.cyan}1. Crear un nuevo proyecto en Railway${colors.reset}`);
  console.log(`${colors.cyan}2. Vincular a un proyecto existente${colors.reset}`);
  console.log(`${colors.cyan}3. Salir sin vincular${colors.reset}`);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(`\n${colors.bright}Seleccione una opción (1-3): ${colors.reset}`, (option) => {
    readline.close();
    
    switch (option.trim()) {
      case '1':
        console.log(`\n${colors.yellow}Creando nuevo proyecto en Railway...${colors.reset}`);
        try {
          execSync('railway project create', { stdio: 'inherit' });
          console.log(`${colors.green}✓ Proyecto creado correctamente${colors.reset}`);
          linkAndSetup();
        } catch (createError) {
          console.error(`${colors.red}✗ Error al crear el proyecto. ${createError.message}${colors.reset}`);
        }
        break;
      case '2':
        console.log(`\n${colors.yellow}Vinculando a proyecto existente...${colors.reset}`);
        try {
          execSync('railway link', { stdio: 'inherit' });
          console.log(`${colors.green}✓ Proyecto vinculado correctamente${colors.reset}`);
          linkAndSetup();
        } catch (linkError) {
          console.error(`${colors.red}✗ Error al vincular el proyecto. ${linkError.message}${colors.reset}`);
        }
        break;
      case '3':
        console.log(`\n${colors.yellow}Saliendo sin vincular proyecto.${colors.reset}`);
        break;
      default:
        console.log(`\n${colors.red}Opción no válida. Saliendo.${colors.reset}`);
    }
  });
} else {
  // Si ya hay un proyecto vinculado, continuar con la configuración
  linkAndSetup();
}

function linkAndSetup() {
  // Comprobar si existe un servicio PostgreSQL
  console.log(`\n${colors.yellow}Comprobando si existe un servicio PostgreSQL...${colors.reset}`);
  
  try {
    const plugins = execSync('railway service list').toString();
    if (plugins.toLowerCase().includes('postgresql')) {
      console.log(`${colors.green}✓ Servicio PostgreSQL encontrado${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ No se encontró servicio PostgreSQL. Creando uno nuevo...${colors.reset}`);
      try {
        execSync('railway add --plugin postgresql', { stdio: 'inherit' });
        console.log(`${colors.green}✓ Servicio PostgreSQL creado correctamente${colors.reset}`);
      } catch (pgError) {
        console.error(`${colors.red}✗ Error al crear el servicio PostgreSQL: ${pgError.message}${colors.reset}`);
      }
    }
  } catch (listError) {
    console.error(`${colors.red}✗ Error al listar servicios: ${listError.message}${colors.reset}`);
  }

  // Mostrar variables requeridas
  console.log(`\n${colors.cyan}${colors.bright}Variables requeridas en Railway:${colors.reset}`);
  console.log(`${colors.yellow}1. JWT_SECRET${colors.reset} - Una cadena segura para firmar tokens JWT`);
  console.log(`${colors.yellow}2. MISTRAL_API_KEY${colors.reset} - Tu clave API de Mistral AI`);

  // Instrucciones finales
  console.log(`\n${colors.bright}${colors.green}Configuración completada. Próximos pasos:${colors.reset}`);
  console.log(`${colors.cyan}1. Configura las variables de entorno en Railway:${colors.reset}`);
  console.log(`   railway vars set JWT_SECRET=tu_clave_secreta_aqui MISTRAL_API_KEY=tu_clave_api_mistral`);
  console.log(`${colors.cyan}2. Despliega la aplicación:${colors.reset}`);
  console.log(`   railway up`);
  console.log(`${colors.cyan}3. Abre la aplicación:${colors.reset}`);
  console.log(`   railway open`);
}