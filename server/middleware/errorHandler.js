import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Generate a unique error ID for tracking
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  // Log detailed error information
  logger.error({
    message: `Error handling request: ${err.message}`,
    errorId,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
    ip: req.ip,
    userId: req.user?.id || 'unauthenticated',
    userAgent: req.get('user-agent'),
    requestBody: req.method !== 'GET' ? req.body : undefined,
    requestQuery: req.query,
    requestParams: req.params,
    stack: err.stack
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Prepare response
  const errorResponse = {
    error: true,
    errorId,
    message: err.message || 'Error interno del servidor',
    status: statusCode
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  // Log the error in more human-readable format to console for PM2 to capture
  console.error(`[ERROR ${errorId}] ${err.message || 'Error interno del servidor'}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};