import { apiService } from '../services/apiService';

/**
 * Utility to check API connectivity
 */
export const checkApiConnectivity = async (
  setStatusCallback?: (status: 'checking' | 'connected' | 'failed') => void
): Promise<{
  success: boolean;
  error?: string;
  details?: any;
  statusCode?: number;
}> => {
  if (setStatusCallback) {
    setStatusCallback('checking');
  }
  
  try {
    console.log('Checking API connectivity...');
    
    const result = await apiService.healthCheck();
    
    console.log('API connectivity check result:', {
      success: result.success,
      statusCode: result.statusCode,
      details: result.data || result.error
    });
    
    if (result.success) {
      if (setStatusCallback) {
        setStatusCallback('connected');
      }
      
      return {
        success: true,
        details: result.data
      };
    } else {
      if (setStatusCallback) {
        setStatusCallback('failed');
      }
      
      return {
        success: false,
        error: result.error || 'Unknown error',
        statusCode: result.statusCode,
        details: result.details
      };
    }
  } catch (error) {
    console.error('API connectivity check failed with exception:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (setStatusCallback) {
      setStatusCallback('failed');
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Utility to periodically check API connectivity
 */
export const startApiConnectivityCheck = (
  intervalMs: number,
  setStatusCallback: (status: 'checking' | 'connected' | 'failed') => void
): () => void => {
  checkApiConnectivity(setStatusCallback);
  
  const intervalId = setInterval(
    () => checkApiConnectivity(setStatusCallback), 
    intervalMs
  );
  
  return () => clearInterval(intervalId);
};