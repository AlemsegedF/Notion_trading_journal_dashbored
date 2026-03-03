'use client';

/**
 * Dashboard Page - Modern & Optimized
 * Fast loading with caching and skeleton states
 */

import React, { useMemo } from 'react';
import { User, KpiMetrics, PerformanceMetrics, EquityCurvePoint } from '../types';
import { mockUser } from '../lib/mockData';
import { useTrades } from '../hooks/useTrades';
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

// Components
import AppShell from '../components/AppShell';
import DashboardHeader from '../components/DashboardHeader';
import KpiCardsRow from '../components/KpiCardsRow';
import EquityCurveCard from '../components/EquityCurveCard';
import PerformanceMetricsCard from '../components/PerformanceMetricsCard';
import RecentTradesCard from '../components/RecentTradesCard';
import TopStrategiesCard from '../components/TopStrategiesCard';
import { SkeletonDashboard, SkeletonKpiCards, SkeletonChart, SkeletonTradeList } from '../components/Skeleton';

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  refreshIndicator: {
    position: 'fixed' as const,
    top: '80px',
    right: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: 'rgba(15, 19, 24, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#718096',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    zIndex: 30,
    animation: 'fadeIn 0.3s ease-out',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid #1c2230',
    borderTopColor: '#f0b429',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  demoBanner: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(240, 180, 41, 0.1) 100%)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'fadeIn 0.4s ease-out',
  },
  demoIcon: {
    fontSize: '20px',
  },
  demoText: {
    fontSize: '13px',
    color: '#f59e0b',
    margin: 0,
    fontWeight: 500,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    marginTop: '24px',
    animation: 'fadeIn 0.5s ease-out',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    animation: 'slideInLeft 0.5s ease-out',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    animation: 'slideInRight 0.5s ease-out',
  },
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
    border: 'none',
    borderRadius: '8px',
    color: '#0a0d12',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { trades, strategies, isLoading, isRefreshing, error, usingMockData, refresh, lastUpdated } = useTrades();

  // Get today's trades
  const todayTrades = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trades.filter(trade => {
      const tradeDate = new Date(trade.exitTime);
      tradeDate.setHours(0, 0, 0, 0);
      return tradeDate.getTime() === today.getTime();
    });
  }, [trades]);

  // Calculate KPI metrics
  const kpiMetrics: KpiMetrics = useMemo(() => {
    const startingCapital = 50000;
    const totalReturn = calculateTotalReturn(trades, startingCapital);
    const previousReturn = totalReturn * 0.9;
    const change = totalReturn - previousReturn;
    const overallWinRate = calculateWinRate(trades);
    const lastNWinRate = calculateWinRateLastN(trades, 20);
    const profitFactor = calculateProfitFactor(trades);
    const todaysPnl = todayTrades.reduce((sum, t) => sum + t.pnlCurrency, 0);

    return {
      totalReturn: { value: totalReturn, change },
      winRate: { overall: overallWinRate, lastNTrades: lastNWinRate, lastNCount: 20 },
      profitFactor: { value: profitFactor, status: getProfitFactorStatus(profitFactor) },
      todaysPnl: { value: todaysPnl, tradeCount: todayTrades.length },
    };
  }, [trades, todayTrades]);

  // Calculate performance metrics
  const performanceMetrics: PerformanceMetrics = useMemo(() => ({
    expectancy: calculateExpectancy(trades),
    avgWin: calculateAvgWin(trades),
    avgLoss: calculateAvgLoss(trades),
    maxDrawdown: calculateMaxDrawdown(trades, 50000),
    avgTradeDuration: calculateAvgTradeDuration(trades),
    totalTrades: trades.length,
  }), [trades]);

  // Generate equity curve data
  const equityCurveData: EquityCurvePoint[] = useMemo(() => 
    generateEquityCurve(trades, 50000),
  [trades]);

  // Handle retry
  const handleRetry = () => {
    refresh();
  };

  if (isLoading && trades.length === 0) {
    return (
      <AppShell user={mockUser}>
        <SkeletonDashboard />
      </AppShell>
    );
  }

  if (error && trades.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Error Loading Data</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button style={styles.retryButton} onClick={handleRetry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell user={mockUser} onTradeCreated={refresh}>
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div style={styles.refreshIndicator}>
          <div style={styles.spinner} />
          <span>Refreshing...</span>
        </div>
      )}

      {/* Demo Banner */}
      {usingMockData && (
        <div style={styles.demoBanner}>
          <span style={styles.demoIcon}>⚡</span>
          <p style={styles.demoText}>
            Demo Mode: Add NOTION_TOKEN and NOTION_DATABASE_ID to use real data
          </p>
        </div>
      )}

      <DashboardHeader 
        user={mockUser} 
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
