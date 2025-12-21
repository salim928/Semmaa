import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that delays updating a value until after a specified delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for debounced search
 */
export function useDebouncedSearch(
  searchFunction: (query: string) => void | Promise<void>,
  delay: number = 500
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, delay);

  useEffect(() => {
    if (debouncedQuery) {
      setIsSearching(true);
      const performSearch = async () => {
        try {
          await searchFunction(debouncedQuery);
        } finally {
          setIsSearching(false);
        }
      };
      performSearch();
    } else {
      setIsSearching(false);
    }
  }, [debouncedQuery, searchFunction]);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    debouncedQuery,
  };
}