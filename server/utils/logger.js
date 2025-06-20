import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'winston-daily-rotate-file';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const pm2LogDir = path.join(logDir, 'pm2');
if (!fs.existsSync(pm2LogDir)) {
  fs.mkdirSync(pm2LogDir, { recursive: true });
}

// Application instance identifier (useful for cluster mode)
const instanceId = process.env.NODE_APP_INSTANCE || '0';

// Define log format with detailed information
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  winston.format.printf(info => {
    const { timestamp, level, message, metadata, stack } = info;
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] [Instance:${instanceId}]: ${message}`;
    
    // Add metadata if available
    if (metadata && Object.keys(metadata).length > 0 && metadata.constructor === Object) {
      logMessage += ` | ${JSON.stringify(metadata)}`;
    }
    
    // Add stack trace if available
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    return logMessage;
  })
);

// Create file transport configuration for daily rotation
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Create PM2-specific rotate file transport
const pm2RotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(pm2LogDir, 'pm2-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Create HTTP-specific rotate file transport
const httpRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'http'
});

// Create error-specific rotate file transport
const errorRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});

// Create logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { 
    service: 'datacenter-api',
    environment: process.env.NODE_ENV || 'development',
    host: process.env.HOSTNAME || 'unknown'
  },
  transports: [
    // Write to all logs with level 'info' and below
    dailyRotateFileTransport,
    
    // Write errors to error log
    errorRotateFileTransport,
    
    // Write PM2-specific logs
    pm2RotateFileTransport,
    
    // Write HTTP logs to separate file
    httpRotateFileTransport
  ],
  exitOnError: false  // Do not exit on handled exceptions
});

// Add transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
} else {
  // In production, also log to console with limited information (for PM2 to capture)
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(info => {
        return `[${info.timestamp}] [${info.level}] [${info.service}]: ${info.message}`;
      })
    ),
  }));
}

// Create specialized loggers for different components
export const httpLogger = logger.child({ component: 'http' });
export const dbLogger = logger.child({ component: 'database' });
export const authLogger = logger.child({ component: 'auth' });
export const apiLogger = logger.child({ component: 'api' });

// Log startup information
logger.info(`Logger initialized in ${process.env.NODE_ENV || 'development'} mode`);