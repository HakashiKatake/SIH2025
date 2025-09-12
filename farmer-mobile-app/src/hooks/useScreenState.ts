import { useState, useCallback } from 'react';
import { ScreenState } from '../types/ui';

export const useScreenState = <T = any>(initialData?: T) => {
  const [state, setState] = useState<ScreenState>({
    isLoading: false,
    error: null,
    data: initialData || null,
    refreshing: false,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, error: null, isLoading: false }));
  }, []);

  const setRefreshing = useCallback((refreshing: boolean) => {
    setState(prev => ({ ...prev, refreshing }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: initialData || null,
      refreshing: false,
    });
  }, [initialData]);

  return {
    ...state,
    setLoading,
    setError,
    setData,
    setRefreshing,
    reset,
  };
};