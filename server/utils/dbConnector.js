import { Pool } from 'pg';
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
  
  try {
    // First check for Railway's DATABASE_URL
    if (process.env.DATABASE_URL) {
      logger.info('Using Railway DATABASE_URL for connection');
      const newPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      // Test the connection
      const client = await newPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      logger.info('Connected to PostgreSQL database using connection string');
      return newPool;
    } 
    
    // If no DATABASE_URL, use individual parameters
    const config = {
      host: process.env.DB_HOST || process.env.PGHOST || process.env.DATABASE_HOST || process.env.VITE_DB_HOST,
      database: process.env.DB_NAME || process.env.PGDATABASE || process.env.DATABASE_NAME || process.env.VITE_DB_NAME,
      user: process.env.DB_USER || process.env.PGUSER || process.env.DATABASE_USERNAME || process.env.VITE_DB_USER,
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || process.env.DATABASE_PASSWORD || process.env.VITE_DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || process.env.PGPORT || process.env.DATABASE_PORT || process.env.VITE_DB_PORT || '5432'),
      ssl: process.env.DB_SSL === 'true' || process.env.VITE_DB_SSL === 'true' ? 
        { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
      connectionTimeoutMillis: 2000, // How long to wait for a new client
    };
    
    logger.info('Creating new PostgreSQL connection pool');
    const newPool = new Pool(config);
    
    // Test the connection
    const client = await newPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    // Log success but don't expose connection details
    logger.info(`Connected to database ${config.database} on ${config.host}`);
    
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
      await pool.end();
      pool = null;
      logger.info('PostgreSQL connection pool closed');
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
  
  // Convert named parameters like @param0 to positional parameters $1, $2, etc.
  let convertedQuery = query;
  if (params.length > 0) {
    // Replace @paramX with $X+1 (PostgreSQL uses 1-based indexing)
    convertedQuery = query.replace(/@param(\d+)/g, (match, index) => `$${parseInt(index) + 1}`);
  }
  
  try {
    const result = await connection.query(convertedQuery, params);
    return result.rows;
  } catch (error) {
    logger.error('Error executing query:', error);
    logger.error('Query:', convertedQuery);
    logger.error('Params:', params);
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
  
  try {
    // Convert parameters object to arrays
    const paramNames = Object.keys(params);
    const paramValues = Object.values(params);
    
    // Convert stored procedure name from SQL Server to PostgreSQL format
    // SQL Server: sp_CreateProject -> PostgreSQL: sp_createproject
    const pgProcedureName = procedureName.toLowerCase();
    
    // Construct the function call
    // In PostgreSQL, we call a function with SELECT * FROM function_name($1, $2, ...)
    const placeholders = paramNames.map((_, index) => `$${index + 1}`).join(', ');
    const functionCall = `SELECT * FROM ${pgProcedureName}(${placeholders})`;
    
    logger.debug(`Calling PostgreSQL function: ${functionCall}`, { params: paramValues });
    
    const result = await connection.query(functionCall, paramValues);
    
    // Format results to match SQL Server format
    // PostgreSQL returns column names in lowercase, convert to match SQL Server camelCase
    const formattedRows = result.rows.map(row => {
      const newRow = {};
      for (const [key, value] of Object.entries(row)) {
        // Convert 'id' to 'Id', etc.
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
        newRow[formattedKey] = value;
      }
      return newRow;
    });
    
    return formattedRows.length > 0 ? formattedRows : [{ Id: null }];
  } catch (error) {
    logger.error('Error executing stored procedure:', error);
    logger.error('Procedure:', procedureName);
    logger.error('Params:', params);
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
  const client = await connection.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const queryObj of queries) {
      // Each query can be { text: "SQL query", values: [param1, param2, ...] }
      // or a string for simple queries
      if (typeof queryObj === 'string') {
        await client.query(queryObj);
      } else {
        // Convert SQL Server @param style to PostgreSQL $1, $2 style
        let convertedText = queryObj.text;
        if (queryObj.values && queryObj.values.length > 0) {
          convertedText = queryObj.text.replace(/@param(\d+)/g, (match, index) => `$${parseInt(index) + 1}`);
        }
        await client.query(convertedText, queryObj.values || []);
      }
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
};