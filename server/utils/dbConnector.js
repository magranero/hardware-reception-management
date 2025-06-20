import sql from 'mssql';
import { logger } from './logger.js';
import { getSettings } from './settings.js';

// Pool configuration
let pool = null;

// Create a new connection pool
const createPool = async () => {
  const { demoMode } = getSettings();
  
  // If demo mode is enabled, don't create actual DB connection
  if (demoMode) {
    logger.info('Running in demo mode - no actual DB connection established');
    return null;
  }
  
  const config = {
    server: process.env.VITE_DB_SERVER,
    database: process.env.VITE_DB_NAME,
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    port: parseInt(process.env.VITE_DB_PORT || '1433'),
    options: {
      encrypt: process.env.VITE_DB_ENCRYPT === 'true',
      trustServerCertificate: true,
      connectTimeout: 30000,
      requestTimeout: 30000
    }
  };
  
  try {
    logger.info('Creating new SQL connection pool');
    const newPool = await new sql.ConnectionPool(config).connect();
    
    // Log success but don't expose connection details
    logger.info(`Connected to database ${config.database} on ${config.server}`);
    
    return newPool;
  } catch (error) {
    logger.error('Error creating connection pool:', error);
    throw error;
  }
};

// Get connection from the pool
export const getConnection = async () => {
  const { demoMode } = getSettings();
  
  // In demo mode, return null
  if (demoMode) {
    return null;
  }
  
  // Create a new pool if needed
  if (!pool) {
    pool = await createPool();
  }
  
  return pool;
};

// Close the connection pool
export const closePool = async () => {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      logger.info('SQL connection pool closed');
    } catch (error) {
      logger.error('Error closing connection pool:', error);
      throw error;
    }
  }
};

// Execute a SQL query
export const executeQuery = async (query, params = []) => {
  const { demoMode } = getSettings();
  
  // In demo mode, return mock data
  if (demoMode) {
    logger.info('Demo mode: Skipping actual DB query', { query });
    return [];
  }
  
  const connection = await getConnection();
  const request = connection.request();
  
  // Add parameters to request
  params.forEach((param, index) => {
    request.input(`param${index}`, param);
  });
  
  try {
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    logger.error('Error executing query:', error);
    throw error;
  }
};

// Execute a stored procedure
export const executeStoredProcedure = async (procedureName, params = {}) => {
  const { demoMode } = getSettings();
  
  // In demo mode, return mock data
  if (demoMode) {
    logger.info('Demo mode: Skipping stored procedure execution', { procedureName });
    return [{ Id: 'demo-id-' + Date.now() }];
  }
  
  const connection = await getConnection();
  const request = connection.request();
  
  // Add parameters to request
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });
  
  try {
    const result = await request.execute(procedureName);
    return result.recordset;
  } catch (error) {
    logger.error('Error executing stored procedure:', error);
    throw error;
  }
};

// Execute a transaction
export const executeTransaction = async (queries = []) => {
  const { demoMode } = getSettings();
  
  // In demo mode, don't execute transaction
  if (demoMode) {
    logger.info('Demo mode: Skipping transaction execution', { queryCount: queries.length });
    return;
  }
  
  const connection = await getConnection();
  const transaction = new sql.Transaction(connection);
  
  try {
    await transaction.begin();
    
    for (const query of queries) {
      await transaction.request().query(query);
    }
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    logger.error('Transaction error:', error);
    throw error;
  }
};