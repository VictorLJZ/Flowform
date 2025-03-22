/**
 * Retry Configuration
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  shouldRetry: (error: any) => boolean;
}

/**
 * Execute an operation with configurable retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config: RetryOptions = {
    maxRetries: 3,
    initialDelay: 300,
    maxDelay: 3000,
    backoffFactor: 2,
    shouldRetry: (error) => {
      // Default retry conditions
      if (error.status === 429) return true; // Rate limiting
      if (error.status >= 500) return true;  // Server errors
      if (error.message?.includes('timeout')) return true;
      if (error.message?.includes('network')) return true;
      return false;
    },
    ...options
  };
  
  let lastError: any;
  let attempt = 0;
  
  while (attempt <= config.maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;
      
      // Check if we should retry
      if (attempt > config.maxRetries || !config.shouldRetry(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay * (0.8 + Math.random() * 0.4);
      
      console.warn(
        `Attempt ${attempt}/${config.maxRetries} failed. Retrying in ${Math.round(jitteredDelay)}ms`,
        error
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  // All retries failed
  throw lastError;
}
