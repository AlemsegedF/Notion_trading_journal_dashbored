'use client';

/**
 * Dashboard Page
 * Main dashboard view with all KPI cards and data visualization
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User, Trade, Strategy, KpiMetrics, PerformanceMetrics, EquityCurvePoint } from '../types';
import {
  mockUser,
  mockTrades,
  mockStrategies,
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
  fetchTodaysTrades,
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
  fullWidthSection: {
    marginTop: '24px',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // State for data
  const [user] = useState<User>(mockUser);
  const [trades] = useState<Trade[]>(mockTrades);
  const [strategies] = useState<Strategy[]>(mockStrategies);
  const [todayTrades, setTodayTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      // In a real app, these would be API calls
      const todays = await fetchTodaysTrades();
      setTodayTrades(todays);
      setIsLoading(false);
    };

    // Simulate slight delay for realistic loading experience
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate KPI metrics
  const kpiMetrics: KpiMetrics = useMemo(() => {
    const startingCapital = 50000;
    const totalReturn = calculateTotalReturn(trades, startingCapital);
    
    // Mock previous period return (for comparison)
    const previousReturn = totalReturn * 0.8; // Assume 80% of current for demo
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
    // TODO: Open trade entry modal or navigate to trade entry page
    alert('New Trade button clicked! In production, this would open a trade entry form.');
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <AppShell user={user} onNewTrade={handleNewTrade}>
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
