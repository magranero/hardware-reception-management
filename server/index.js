import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';

// Routes
import projectRoutes from './routes/projects.js';
import orderRoutes from './routes/orders.js';
import deliveryNoteRoutes from './routes/deliveryNotes.js';
import equipmentRoutes from './routes/equipment.js';
import incidentRoutes from './routes/incidents.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import utilsRoutes from './routes/utils.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Utils
import { logger } from './utils/logger.js';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const app = express();
const PORT = process.env.PORT || 3002;
const IP_ADDRESS = process.env.IP_ADDRESS || '0.0.0.0';

logger.info(`Starting server with Node.js ${process.version}`);
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Server binding to IP: ${IP_ADDRESS} and port: ${PORT}`);

// Create necessary directories if they don't exist
const createDirIfNotExists = (dirPath) => {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (!fs.existsSync(fullPath)) {
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      logger.info(`Created directory: ${dirPath}`);
    } catch (error) {
      logger.error(`Failed to create directory: ${dirPath}`, { error: error.message });
    }
  } else {
    logger.debug(`Directory already exists: ${dirPath}`);
  }
};

// Create required directories
logger.info('Initializing required directories');
createDirIfNotExists('uploads');
createDirIfNotExists('logs/pm2');
createDirIfNotExists('uploads/excel');

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fullPath = path.join(__dirname, '..', 'uploads');
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename = uniqueSuffix + extension;
    logger.debug(`Generating filename for upload: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'image/jpeg',
      'image/png'
    ];
    
    logger.debug(`Checking file type: ${file.mimetype} for file: ${file.originalname}`);
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten PDF, Excel, JPG y PNG.`);
      logger.warn(`File upload rejected: ${file.originalname} (${file.mimetype})`, { 
        reason: 'invalid_mimetype', 
        allowed: allowedTypes.join(', ') 
      });
      cb(error, false);
    }
  }
});

// Log all uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  console.error('UNCAUGHT EXCEPTION:', error);
  // In production, you might want to perform a graceful shutdown
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { 
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
  console.error('UNHANDLED REJECTION:', reason);
});

// Define health check routes before any other middleware that might interfere
// IMPORTANT: This needs to come before the SPA routing middleware
app.get(['/api/health', '/health'], (req, res) => {
  // Log the health check request
  logger.info(`Health check requested from ${req.ip} at path ${req.path}`);
  
  const healthData = {
    status: 'ok', 
    version: '1.0.2', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    // Simplified responses to reduce payload size
    memoryUsage: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
    }
  };
  
  logger.debug('Health check requested', { 
    endpoint: req.path,
    requestId: req.id,
    result: healthData.status
  });
  
  res.status(200).json(healthData);
});

// Middleware setup
logger.info('Configuring middleware');

// Apply security headers
app.use(helmet({ 
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false 
}));
logger.debug('Helmet security middleware configured');

// Configure CORS
const corsOptions = {
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-Mode', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
};
app.use(cors(corsOptions));
logger.debug('CORS middleware configured');

// Enable compression
app.use(compression());
logger.debug('Compression middleware configured');

// Setup request logging with Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));
logger.debug('Morgan HTTP logging configured');

// Parse request bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
logger.debug('Request body parsing configured');

// Custom request logger middleware
app.use(requestLogger);
logger.debug('Custom request logger configured');

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 // Cache for 1 day in production
}));
logger.debug('Static uploads directory configured');

// API Routes
logger.info('Registering API routes');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-notes', deliveryNoteRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes(upload));
app.use('/api/utils', utilsRoutes);

// Simple root endpoint for testing
app.get(['/api', '/'], (req, res) => {
  const apiInfo = {
    message: 'Welcome to DataCenter Manager API',
    apiVersion: '1.0.2',
    environment: process.env.NODE_ENV,
    serverTime: new Date().toISOString(),
    nodeVersion: process.version
  };
  
  logger.debug('Root endpoint requested', {
    endpoint: req.path,
    requestId: req.id
  });
  
  res.json(apiInfo);
});

// CORS preflight
app.options('*', cors());
logger.debug('CORS preflight handling configured');

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist');

  logger.info(`Checking for frontend static files at ${distDir}`);
  
  logger.info(`Checking for frontend static files at ${distDir}`);
  
  // Check if the dist directory exists
  if (fs.existsSync(distDir)) {
    logger.info(`Serving static frontend from ${distDir}`);
    app.use(express.static(distDir, { 
      maxAge: '1d', // Cache static assets for 1 day
      index: false  // Don't serve index.html automatically
    }));

    // API routes should be processed before the SPA catch-all
    app.use('/api', (req, res, next) => next());
    
    // SPA routing - send all requests to index.html
    app.get('*', (req, res, next) => {
      // Don't serve index.html for API routes or static assets
      if (req.path.startsWith('/api/') || 
          req.path.startsWith('/uploads/') || 
          req.path.includes('.')) {
        return next();
      }
      
      logger.debug(`SPA route requested: ${req.path}`);
      
      // Check if index.html exists
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      } else {
        logger.error(`Index file not found at ${indexPath}`);
        return res.status(500).json({ error: 'Frontend assets missing' });
      }
    });
  } else {
    logger.warn(`Static frontend directory not found at ${distDir}`);
  }
}

// Error handler middleware (must be last)
app.use(errorHandler);
logger.debug('Error handler middleware configured');

// Start the server with specific IP binding
const server = app.listen(PORT, IP_ADDRESS, () => {
  logger.info(`Server started successfully on ${IP_ADDRESS}:${PORT}`);
  
  // Generate user-friendly access URLs
  const isLocalhost = IP_ADDRESS === '127.0.0.1' || IP_ADDRESS === '0.0.0.0' || IP_ADDRESS === 'localhost';
  const accessUrl = isLocalhost ? `http://localhost:${PORT}` : `http://${IP_ADDRESS}:${PORT}`;
  
  logger.info(`API accessible at ${accessUrl}/api`);
  logger.info(`Frontend accessible at ${accessUrl}`);
  logger.info(`Health check endpoint at ${accessUrl}/health`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API accessible at ${accessUrl}/api`);
  console.log(`Health check endpoint at ${accessUrl}/health`);
  console.log(`Frontend accessible at ${accessUrl}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds if server hasn't closed
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

export default app;