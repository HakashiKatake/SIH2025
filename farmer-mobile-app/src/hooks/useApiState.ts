import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiStateReturn<T> {
  state: ApiState<T>;
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export function useApiState<T = any>(initialData: T | null = null): UseApiStateReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState(prev => ({ ...prev, data: result, loading: false, error: null }));
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  return {
    state,
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
}

export default useApiState;