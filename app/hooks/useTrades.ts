'use client';

/**
 * Custom hook for trade data fetching with caching
 * Optimized for performance with stale-while-revalidate pattern
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Trade, Strategy } from '../types';
import { fetchTradesFromNotion, fetchStrategiesFromNotion, isNotionConfigured } from '../lib/notionData';
import { mockTrades, mockStrategies } from '../lib/mockData';

interface UseTradesReturn {
  trades: Trade[];
  strategies: Strategy[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  usingMockData: boolean;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Global cache
let globalCache: {
  trades: Trade[] | null;
  strategies: Strategy[] | null;
  timestamp: number;
  promise: Promise<void> | null;
} = {
  trades: null,
  strategies: null,
  timestamp: 0,
  promise: null,
};

export function useTrades(autoRefresh = true): UseTradesReturn {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mounted = useRef(true);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && globalCache.trades && globalCache.strategies && 
        (now - globalCache.timestamp) < CACHE_DURATION) {
      setTrades(globalCache.trades);
      setStrategies(globalCache.strategies);
      setIsLoading(false);
      setLastUpdated(new Date(globalCache.timestamp));
      return;
    }

    // If there's an existing promise, wait for it
    if (globalCache.promise) {
      await globalCache.promise;
      if (globalCache.trades && globalCache.strategies) {
        setTrades(globalCache.trades);
        setStrategies(globalCache.strategies);
        setIsLoading(false);
        setLastUpdated(new Date(globalCache.timestamp));
      }
      return;
    }

    // Create new fetch promise
    const fetchPromise = (async () => {
      try {
        const notionReady = await isNotionConfigured();

        if (!notionReady) {
          setUsingMockData(true);
          setTrades(mockTrades);
          setStrategies(mockStrategies);
          globalCache.trades = mockTrades;
          globalCache.strategies = mockStrategies;
          globalCache.timestamp = now;
          return;
        }

        // Fetch in parallel
        const [tradesData, strategiesData] = await Promise.all([
          fetchTradesFromNotion(),
          fetchStrategiesFromNotion(),
        ]);

        if (mounted.current) {
          setTrades(tradesData);
          setStrategies(strategiesData);
          setUsingMockData(false);
          setError(null);
          
          // Update cache
          globalCache.trades = tradesData;
          globalCache.strategies = strategiesData;
          globalCache.timestamp = now;
          setLastUpdated(new Date(now));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (mounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          // Fallback to mock data
          setUsingMockData(true);
          setTrades(mockTrades);
          setStrategies(mockStrategies);
        }
      }
    })();

    globalCache.promise = fetchPromise;
    await fetchPromise;
    globalCache.promise = null;
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(true);
    setIsRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    mounted.current = true;
    
    const load = async () => {
      setIsLoading(true);
      await fetchData();
      if (mounted.current) {
        setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  return {
    trades,
    strategies,
    isLoading,
    isRefreshing,
    error,
    usingMockData,
    refresh,
    lastUpdated,
  };
}
