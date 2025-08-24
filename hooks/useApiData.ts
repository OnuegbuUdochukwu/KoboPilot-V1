import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoadingState, AppError } from '@/types';

interface UseApiDataOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
  refreshInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
}

interface UseApiDataReturn<T> extends LoadingState {
  data: T | undefined;
  refetch: () => Promise<void>;
  updateData: (updater: (currentData: T | undefined) => T) => void;
  clearError: () => void;
}

export function useApiData<T>(
  fetchFunction: () => Promise<T>,
  options: UseApiDataOptions<T> = {}
): UseApiDataReturn<T> {
  const {
    initialData,
    autoFetch = true,
    refreshInterval,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(result);
      setLastUpdated(new Date());
      onSuccess?.(result);
    } catch (err) {
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const appError: AppError = {
        code: err instanceof Error ? err.name : 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        details: err,
        timestamp: new Date().toISOString(),
      };

      setError(appError);
      onError?.(appError);
    } finally {
      // Check if request was cancelled
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetchFunction]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const updateData = useCallback((updater: (currentData: T | undefined) => T) => {
    setData(updater);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refetch();
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval, refetch]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch,
    updateData,
    clearError,
  };
}

// Specialized hooks for common use cases
export function useAccounts() {
  const { accountsService } = require('@/api/services/accounts');
  
  const fetchAccounts = React.useCallback(() => accountsService.getAccounts(), []);
  
  return useApiData(fetchAccounts, {
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export function useTransactions(
  page: number = 1,
  limit: number = 20,
  filters?: any
) {
  const { transactionsService } = require('@/api/services/transactions');
  
  const fetchTransactions = React.useCallback(
    () => transactionsService.getTransactions(page, limit, filters),
    [page, limit, filters]
  );
  
  return useApiData(fetchTransactions, {
    autoFetch: true,
    refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

export function useSubscriptions(filters?: any) {
  const { subscriptionsService } = require('@/api/services/subscriptions');
  
  const fetchSubscriptions = React.useCallback(
    () => subscriptionsService.getSubscriptions(filters),
    [filters]
  );
  
  return useApiData(fetchSubscriptions, {
    autoFetch: true,
    refreshInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
}

export function useDashboard() {
  const { dashboardService } = require('@/api/services/dashboard');
  
  const fetchDashboard = React.useCallback(() => dashboardService.getDashboardData(), []);
  
  return useApiData(fetchDashboard, {
    autoFetch: true,
    refreshInterval: 3 * 60 * 1000, // Refresh every 3 minutes
  });
}

export function useQuickStats() {
  const { dashboardService } = require('@/api/services/dashboard');
  
  const fetchQuickStats = React.useCallback(() => dashboardService.getQuickStats(), []);
  
  return useApiData(fetchQuickStats, {
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  updateFunction: (data: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: AppError) => void
) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const update = useCallback(async (data: T) => {
    setIsUpdating(true);
    setError(null);

    try {
      await updateFunction(data);
      onSuccess?.();
    } catch (err) {
      const appError: AppError = {
        code: err instanceof Error ? err.name : 'UPDATE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to update data',
        details: err,
        timestamp: new Date().toISOString(),
      };

      setError(appError);
      onError?.(appError);
    } finally {
      setIsUpdating(false);
    }
  }, [updateFunction, onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    update,
    isUpdating,
    error,
    clearError,
  };
}
