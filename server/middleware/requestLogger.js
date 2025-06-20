import { httpLogger as logger } from '../utils/logger.js';
import { getSettings } from '../utils/settings.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;
  
  // Log request start
  logger.http(`Request started: ${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    ip,
    userAgent: headers['user-agent'] || '-',
    contentType: headers['content-type'],
    contentLength: headers['content-length'],
    requestId: req.id || '-'
  });
  
  // Add response finish handler
  res.on('finish', () => {
    const { debugMode } = getSettings();
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log basic request info for all requests
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';
    
    logger[logLevel](`Request completed: ${method} ${originalUrl} ${statusCode} ${duration}ms`, {
      method,
      url: originalUrl,
      status: statusCode,
      duration: duration,
      contentLength: res.getHeader('content-length'),
      requestId: req.id || '-'
    });
    
    // Log detailed info if debug mode is enabled
    if (debugMode) {
      const log = {
        method,
        url: originalUrl,
        status: statusCode,
        duration: `${duration}ms`,
        ip,
        userAgent: req.get('user-agent') || '-',
        // Only include body for non-GET requests and if debugMode is true
        body: method === 'GET' ? undefined : req.body
      };
      
      logger.debug('API Request Details', log);
      
      // For extra visibility in dev tools
      if (process.env.NODE_ENV === 'development') {
        console.log(`${method} ${originalUrl} ${statusCode} ${duration}ms`);
      }
    }
  });
  
  // Add response error handler
  res.on('error', (err) => {
    const duration = Date.now() - start;
    
    logger.error(`Request error: ${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      duration,
      error: err.message,
      stack: err.stack,
      requestId: req.id || '-'
    });
  });

  next();
};