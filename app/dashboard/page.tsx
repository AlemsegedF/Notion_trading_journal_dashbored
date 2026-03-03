'use client';

/**
 * Dashboard Page
 * Main dashboard view with real Notion data
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User, Trade, Strategy, KpiMetrics, PerformanceMetrics, EquityCurvePoint } from '../types';

// Real data fetching from Notion
import {
  fetchTradesFromNotion,
  fetchTodaysTradesFromNotion,
  fetchStrategiesFromNotion,
  isNotionConfigured,
} from '../lib/notionData';

// Calculation utilities (work with any Trade[] data)
import {
  calculateTotalReturn,
  calculateWinRate,
  calculateWinRateLastN,
  calculateProfitFactor,
  getProfitFactorStatus,
  calculateExpectancy,
  calculateAvgWin,
  calculateAvgLoss,
  calculateMaxDrawdown,
  calculateAvgTradeDuration,
  generateEquityCurve,
} from '../lib/mockData';

// Fallback mock data (used if Notion is not configured)
import {
  mockUser,
  mockTrades,
  mockStrategies,
} from '../lib/mockData';

// Components
import AppShell from '../components/AppShell';
import DashboardHeader from '../components/DashboardHeader';
import KpiCardsRow from '../components/KpiCardsRow';
import EquityCurveCard from '../components/EquityCurveCard';
import PerformanceMetricsCard from '../components/PerformanceMetricsCard';
import RecentTradesCard from '../components/RecentTradesCard';
import TopStrategiesCard from '../components/TopStrategiesCard';

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0d12',
    color: '#e2e8f0',
    fontSize: '16px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0d12',
    color: '#e2e8f0',
    padding: '40px',
    textAlign: 'center' as const,
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#ef4444',
    marginBottom: '12px',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#a0aec0',
    maxWidth: '500px',
    marginBottom: '24px',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#f0b429',
    color: '#0a0d12',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  banner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bannerIcon: {
    fontSize: '18px',
  },
  bannerText: {
    fontSize: '13px',
    color: '#f59e0b',
    margin: 0,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    marginTop: '24px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // State for data
  const [user] = useState<User>(mockUser);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [todayTrades, setTodayTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch data from Notion
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if Notion is configured
        const notionReady = await isNotionConfigured();

        if (!notionReady) {
          console.warn('Notion not configured - falling back to mock data');
          setUsingMockData(true);
          setTrades(mockTrades);
          setStrategies(mockStrategies);
          
          // Get today's trades from mock
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todays = mockTrades.filter(trade => {
            const tradeDate = new Date(trade.exitTime);
            tradeDate.setHours(0, 0, 0, 0);
            return tradeDate.getTime() === today.getTime();
          });
          setTodayTrades(todays);
          setIsLoading(false);
          return;
        }

        // Fetch real data from Notion in parallel
        const [allTrades, todaysTrades, allStrategies] = await Promise.all([
          fetchTradesFromNotion(),
          fetchTodaysTradesFromNotion(),
          fetchStrategiesFromNotion(),
        ]);

        setTrades(allTrades);
        setTodayTrades(todaysTrades);
        setStrategies(allStrategies);
        setUsingMockData(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Fallback to mock data on error
        setUsingMockData(true);
        setTrades(mockTrades);
        setStrategies(mockStrategies);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate KPI metrics
  const kpiMetrics: KpiMetrics = useMemo(() => {
    const startingCapital = 50000;
    const totalReturn = calculateTotalReturn(trades, startingCapital);
    
    // Calculate change vs previous period
    // For real data, you might want to compare month-over-month or week-over-week
    const previousReturn = totalReturn * 0.9; // Placeholder
    const change = totalReturn - previousReturn;

    const overallWinRate = calculateWinRate(trades);
    const lastNWinRate = calculateWinRateLastN(trades, 20);
    const profitFactor = calculateProfitFactor(trades);

    const todaysPnl = todayTrades.reduce((sum, t) => sum + t.pnlCurrency, 0);

    return {
      totalReturn: {
        value: totalReturn,
        change: change,
      },
      winRate: {
        overall: overallWinRate,
        lastNTrades: lastNWinRate,
        lastNCount: 20,
      },
      profitFactor: {
        value: profitFactor,
        status: getProfitFactorStatus(profitFactor),
      },
      todaysPnl: {
        value: todaysPnl,
        tradeCount: todayTrades.length,
      },
    };
  }, [trades, todayTrades]);

  // Calculate performance metrics
  const performanceMetrics: PerformanceMetrics = useMemo(() => {
    return {
      expectancy: calculateExpectancy(trades),
      avgWin: calculateAvgWin(trades),
      avgLoss: calculateAvgLoss(trades),
      maxDrawdown: calculateMaxDrawdown(trades, 50000),
      avgTradeDuration: calculateAvgTradeDuration(trades),
      totalTrades: trades.length,
    };
  }, [trades]);

  // Generate equity curve data
  const equityCurveData: EquityCurvePoint[] = useMemo(() => {
    return generateEquityCurve(trades, 50000);
  }, [trades]);

  // Handle new trade button click
  const handleNewTrade = () => {
    alert('New Trade functionality coming soon! This will open a trade entry form.');
  };

  // Handle retry on error
  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        Loading dashboard...
      </div>
    );
  }

  if (error && trades.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Error Loading Data</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button style={styles.retryButton} onClick={handleRetry}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <AppShell user={user} onNewTrade={handleNewTrade}>
      {usingMockData && (
        <div style={styles.banner}>
          <span style={styles.bannerIcon}>⚠️</span>
          <p style={styles.bannerText}>
            Using demo data. Connect your Notion database to see real trades. 
            Add NOTION_TOKEN and NOTION_DATABASE_ID environment variables in Vercel.
          </p>
        </div>
      )}

      <DashboardHeader 
        user={user} 
        todayTradeCount={todayTrades.length} 
      />

      <KpiCardsRow metrics={kpiMetrics} />

      <div style={styles.mainGrid}>
        <div style={styles.leftColumn}>
          <EquityCurveCard 
            data={equityCurveData} 
            startingCapital={50000}
          />
          <PerformanceMetricsCard metrics={performanceMetrics} />
        </div>

        <div style={styles.rightColumn}>
          <RecentTradesCard trades={trades} maxTrades={5} />
          <TopStrategiesCard strategies={strategies} maxStrategies={4} />
        </div>
      </div>
    </AppShell>
  );
}
