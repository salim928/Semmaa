import { useState, useEffect, useCallback } from 'react';
import { api } from '../config/api';
import { AxiosRequestConfig, AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  endpoint: string,
  options?: UseApiOptions
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = true, onSuccess, onError } = options || {};

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<T>(endpoint);
      setData(response.data);
      onSuccess?.(response.data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate]);

  return { data, loading, error, refetch: fetchData };
}

export function useApiMutation<TData = any, TPayload = any>(
  endpoint: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      payload?: TPayload,
      config?: AxiosRequestConfig
    ): Promise<{ data?: TData; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api[method]<TData>(endpoint, payload, config);
        return { data: response.data };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method]
  );

  return { mutate, loading, error };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Custom hooks for specific API calls
export function useMarketPrices(crop: string) {
  return useApi(`/market/prices?crop=${crop}`, {
    immediate: !!crop,
  });
}

export function useWeather(location: string) {
  return useApi(`/weather?loc=${location}`, {
    immediate: !!location,
  });
}

export function useAskQuestion() {
  return useApiMutation('/ask', 'post');
}

export function useFeedback() {
  return useApiMutation('/feedback', 'post');
}