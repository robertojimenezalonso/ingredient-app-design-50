import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RateLimitOptions {
  maxCalls: number;
  windowMs: number;
  errorMessage?: string;
}

/**
 * Hook for client-side rate limiting of function calls
 * @param options Configuration for rate limiting
 * @returns Function to check if an action is rate limited
 */
export const useRateLimit = (options: RateLimitOptions) => {
  const { maxCalls, windowMs, errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento.' } = options;
  const callTimestamps = useRef<number[]>([]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Remove timestamps outside the current window
    callTimestamps.current = callTimestamps.current.filter(
      timestamp => now - timestamp < windowMs
    );

    // Check if we've exceeded the limit
    if (callTimestamps.current.length >= maxCalls) {
      toast.error(errorMessage);
      return false;
    }

    // Add current timestamp
    callTimestamps.current.push(now);
    return true;
  }, [maxCalls, windowMs, errorMessage]);

  return { checkRateLimit };
};
