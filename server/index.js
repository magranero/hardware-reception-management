import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
const IP_ADDRESS = process.env.IP_ADDRESS || '0.0.0.0'; // Use specific IP from environment or all interfaces as fallback

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'image/jpeg',
      'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, Excel, JPG y PNG.'), false);
    }
  }
});

// Middleware setup
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for development
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-Mode', 'Accept', 'Origin'],
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-notes', deliveryNoteRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes(upload));
app.use('/api/utils', utilsRoutes);

// Health check endpoint - allow access to both /api/health and /health
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    version: '1.0.2', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Simple Hello World for testing
app.get(['/api', '/'], (req, res) => {
  res.json({ 
    message: 'Welcome to DataCenter Manager API',
    apiVersion: '1.0.2',
    environment: process.env.NODE_ENV,
    serverTime: new Date().toISOString()
  });
});

// CORS preflight
app.options('*', cors());

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist directory (built frontend)
  app.use(express.static(path.join(__dirname, '..', 'dist')));

  // Handle SPA routing - send all requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Error handler middleware (must be last)
app.use(errorHandler);

// Start the server with specific IP binding
app.listen(PORT, IP_ADDRESS, () => {
  logger.info(`Server running on port ${PORT} and IP ${IP_ADDRESS}`);
  console.log(`Server running on port ${PORT} and IP ${IP_ADDRESS}`);
  console.log(`API accessible at http://localhost:${PORT}/api`);
});

export default app;