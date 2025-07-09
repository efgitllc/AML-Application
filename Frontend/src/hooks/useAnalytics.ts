import { useState } from 'react';
import type { UseAnalyticsReturn } from '../types';
import { analyticsService } from '../services/analytics.service';

export function useAnalytics<T>(): UseAnalyticsReturn<T> {
  const [metrics, setMetrics] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getMetrics();
      setMetrics(data as T);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    fetchMetrics,
    loading,
    error,
  };
} 