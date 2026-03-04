'use client';

/**
 * Analytics Page - Modern, Clean Design with Comprehensive Metrics
 * 
 * Features:
 * - Overview: Key performance indicators with trend indicators
 * - Performance: Detailed trade statistics and equity analysis  
 * - Instruments: Analysis by currency pair/asset
 * - Setups: Strategy performance breakdown
 * - Time: Session and day-of-week analysis
 * - Psychology: Streaks, R-multiples, behavioral metrics
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ComposedChart,
  ReferenceLine, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { User, Trade, TradeOutcome } from '../types';
import { mockUser, mockTrades } from '../lib/mockData';
import { useTrades } from '../hooks/useTrades';
import AppShell from '../components/AppShell';
import { SkeletonChart, SkeletonCard } from '../components/Skeleton';
import { formatCurrency, getValueColor } from '../lib/utils';

// ─── COLORS & THEME ───────────────────────────────────────────────────────────

const THEME = {
  win: '#22c55e',
  loss: '#ef4444', 
  breakeven: '#6b7280',
  gold: '#f0b429',
  blue: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899',
  orange: '#f97316',
  bg: '#0f1318',
  card: '#1c2230',
  border: 'rgba(28, 34, 48, 0.8)',
  text: {
    primary: '#e2e8f0',
    secondary: '#9ca3af',
    muted: '#6b7280'
  }
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TabType = 'overview' | 'performance' | 'instruments' | 'setups' | 'time' | 'psychology';

interface AnalyticsMetrics {
  // Basic stats
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  lossRate: number;
  
  // P&L
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  avgWin: number;
  avgLoss: number;
  avgTrade: number;
  profitFactor: number;
  
  // R-metrics
  totalR: number;
  avgR: number;
  avgWinR: number;
  avgLossR: number;
  expectancy: number;
  
  // Extremes
  maxWin: number;
  maxLoss: number;
  bestDay: number;
  worstDay: number;
  maxDrawdown: number;
  recoveryFactor: number;
  
  // Streaks
  maxWinStreak: number;
  maxLossStreak: number;
  currentStreak: number;
  currentStreakType: 'WIN' | 'LOSS' | null;
  
  // Distribution
  longTrades: number;
  shortTrades: number;
  longWinRate: number;
  shortWinRate: number;
}

interface TimeStats {
  hourly: Array<{ hour: string; trades: number; wins: number; pnl: number; winRate: number }>;
  daily: Array<{ day: string; trades: number; wins: number; pnl: number; winRate: number }>;
  monthly: Array<{ month: string; trades: number; wins: number; pnl: number; cumulative: number; winRate: number }>;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  header: { marginBottom: '28px' },
  title: { fontSize: '32px', fontWeight: 700, color: THEME.text.primary, margin: '0 0 8px 0', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '14px', color: THEME.text.secondary, margin: 0 },
  
  // Tabs
  tabs: { 
    display: 'flex', 
    gap: '4px', 
    marginBottom: '24px', 
    background: THEME.bg,
    padding: '4px',
    borderRadius: '12px',
    border: `1px solid ${THEME.border}`,
    width: 'fit-content'
  },
  tab: { 
    padding: '10px 20px', 
    background: 'transparent', 
    border: 'none', 
    borderRadius: '8px', 
    color: THEME.text.secondary, 
    fontSize: '13px', 
    fontWeight: 500, 
    cursor: 'pointer', 
    transition: 'all 0.2s ease' 
  },
  tabActive: { 
    background: THEME.card,
    color: THEME.gold,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  
  // Cards
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  
  card: { 
    background: `linear-gradient(135deg, ${THEME.bg} 0%, ${THEME.card} 100%)`, 
    border: `1px solid ${THEME.border}`, 
    borderRadius: '16px', 
    padding: '24px',
  },
  cardFull: { gridColumn: 'span 2' },
  cardTitle: { 
    fontSize: '14px', 
    fontWeight: 600, 
    color: THEME.text.primary, 
    margin: '0 0 20px 0', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  chartContainer: { height: '300px' },
  chartContainerSm: { height: '200px' },
  
  // Stat Cards
  statCard: { 
    background: `linear-gradient(135deg, ${THEME.bg} 0%, ${THEME.card} 100%)`, 
    border: `1px solid ${THEME.border}`, 
    borderRadius: '16px', 
    padding: '20px',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  statLabel: { 
    fontSize: '11px', 
    color: THEME.text.secondary, 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.08em', 
    marginBottom: '8px',
    fontWeight: 600 
  },
  statValue: { 
    fontSize: '28px', 
    fontWeight: 700, 
    fontFamily: "'JetBrains Mono', monospace", 
    letterSpacing: '-0.02em',
    marginBottom: '4px'
  },
  statSub: { 
    fontSize: '12px', 
    color: THEME.text.muted,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  
  // Metric rows
  metricRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '12px 0', 
    borderBottom: `1px solid ${THEME.border}` 
  },
  metricRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: 'none'
  },
  metricLabel: { fontSize: '13px', color: THEME.text.secondary },
  metricValue: { 
    fontSize: '14px', 
    fontWeight: 600, 
    fontFamily: "'JetBrains Mono', monospace" 
  },
  
  // Demo banner
  demoBanner: { 
    background: 'rgba(245, 158, 11, 0.1)', 
    border: '1px solid rgba(245, 158, 11, 0.3)', 
    borderRadius: '12px', 
    padding: '14px 18px', 
    marginBottom: '24px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px' 
  },
  demoIcon: { fontSize: '18px' },
  demoText: { fontSize: '13px', color: '#f59e0b', margin: 0, fontWeight: 500 },
  
  // Badge
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    marginLeft: '8px'
  },
  
  // Insights
  insightBox: { 
    background: 'rgba(240, 180, 41, 0.05)', 
    borderRadius: '12px', 
    padding: '16px', 
    marginTop: '20px',
    border: '1px solid rgba(240, 180, 41, 0.15)'
  },
  insightTitle: { 
    fontSize: '12px', 
    fontWeight: 600, 
    color: THEME.gold, 
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  insightText: { 
    fontSize: '13px', 
    color: THEME.text.secondary, 
    lineHeight: 1.6 
  },
  
  // Empty state
  emptyState: { 
    padding: '80px 40px', 
    textAlign: 'center' as const, 
    color: THEME.text.muted,
    background: THEME.card,
    borderRadius: '16px',
    border: `1px solid ${THEME.border}`
  },
};

// ─── CALCULATION FUNCTIONS ────────────────────────────────────────────────────

function calculateMetrics(trades: Trade[]): AnalyticsMetrics | null {
  if (!trades || trades.length === 0) return null;

  // Basic counts
  const wins = trades.filter(t => t.outcome === 'WIN');
  const losses = trades.filter(t => t.outcome === 'LOSS');
  const breakeven = trades.filter(t => t.outcome === 'BREAKEVEN');
  const longs = trades.filter(t => t.direction === 'LONG');
  const shorts = trades.filter(t => t.direction === 'SHORT');
  
  const totalTrades = trades.length;
  const winCount = wins.length;
  const lossCount = losses.length;
  const beCount = breakeven.length;
  
  // Win/loss rates
  const winRate = (winCount / totalTrades) * 100;
  const lossRate = (lossCount / totalTrades) * 100;
  
  // Directional win rates
  const longWins = longs.filter(t => t.outcome === 'WIN').length;
  const shortWins = shorts.filter(t => t.outcome === 'WIN').length;
  const longWinRate = longs.length > 0 ? (longWins / longs.length) * 100 : 0;
  const shortWinRate = shorts.length > 0 ? (shortWins / shorts.length) * 100 : 0;
  
  // P&L calculations
  const grossProfit = wins.reduce((sum, t) => sum + t.pnlCurrency, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnlCurrency, 0));
  const netProfit = grossProfit - grossLoss;
  
  const avgWin = winCount > 0 ? grossProfit / winCount : 0;
  const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;
  const avgTrade = netProfit / totalTrades;
  
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  
  // R-multiple calculations
  const totalR = trades.reduce((sum, t) => sum + t.pnlR, 0);
  const avgR = totalR / totalTrades;
  const avgWinR = winCount > 0 ? wins.reduce((sum, t) => sum + t.pnlR, 0) / winCount : 0;
  const avgLossR = lossCount > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnlR, 0)) / lossCount : 0;
  
  // Expectancy: (Win% * Avg Win R) - (Loss% * Avg Loss R)
  const expectancy = (winRate / 100 * avgWinR) - (lossRate / 100 * avgLossR);
  
  // Extremes
  const maxWin = trades.length > 0 ? Math.max(...trades.map(t => t.pnlCurrency), 0) : 0;
  const maxLoss = trades.length > 0 ? Math.min(...trades.map(t => t.pnlCurrency), 0) : 0;
  
  // Daily stats for best/worst day
  const dailyPnl = trades.reduce((acc, trade) => {
    const date = new Date(trade.exitTime).toDateString();
    if (!acc[date]) acc[date] = 0;
    acc[date] += trade.pnlCurrency;
    return acc;
  }, {} as Record<string, number>);
  
  const dailyValues = Object.values(dailyPnl);
  const bestDay = dailyValues.length > 0 ? Math.max(...dailyValues, 0) : 0;
  const worstDay = dailyValues.length > 0 ? Math.min(...dailyValues, 0) : 0;
  
  // Drawdown calculation
  let maxDrawdown = 0;
  let peak = 0;
  let runningPnl = 0;
  
  const sortedTrades = [...trades].sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());
  sortedTrades.forEach(trade => {
    runningPnl += trade.pnlCurrency;
    peak = Math.max(peak, runningPnl);
    const drawdown = peak - runningPnl;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });
  
  const recoveryFactor = maxDrawdown > 0 ? netProfit / maxDrawdown : 0;
  
  // Streaks
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentStreak = 0;
  let currentType: TradeOutcome | null = null;
  
  sortedTrades.forEach(trade => {
    if (trade.outcome === currentType && trade.outcome !== 'BREAKEVEN') {
      currentStreak++;
    } else if (trade.outcome !== 'BREAKEVEN') {
      currentStreak = 1;
      currentType = trade.outcome;
    }
    
    if (currentType === 'WIN') {
      maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else if (currentType === 'LOSS') {
      maxLossStreak = Math.max(maxLossStreak, currentStreak);
    }
  });
  
  // Current streak (most recent)
  const recent = [...trades].sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime());
  let currentStreakCount = 0;
  let currentStreakType: 'WIN' | 'LOSS' | null = null;
  
  for (const trade of recent) {
    if (trade.outcome === 'BREAKEVEN') continue;
    if (currentStreakType === null) {
      currentStreakType = trade.outcome as 'WIN' | 'LOSS';
      currentStreakCount = 1;
    } else if (trade.outcome === currentStreakType) {
      currentStreakCount++;
    } else {
      break;
    }
  }
  
  return {
    totalTrades,
    wins: winCount,
    losses: lossCount,
    breakeven: beCount,
    winRate,
    lossRate,
    grossProfit,
    grossLoss,
    netProfit,
    avgWin,
    avgLoss,
    avgTrade,
    profitFactor,
    totalR,
    avgR,
    avgWinR,
    avgLossR,
    expectancy,
    maxWin,
    maxLoss,
    bestDay,
    worstDay,
    maxDrawdown,
    recoveryFactor,
    maxWinStreak,
    maxLossStreak,
    currentStreak: currentStreakCount,
    currentStreakType,
    longTrades: longs.length,
    shortTrades: shorts.length,
    longWinRate,
    shortWinRate,
  };
}

function calculateTimeStats(trades: Trade[]): TimeStats {
  if (!trades || trades.length === 0) {
    return { hourly: [], daily: [], monthly: [] };
  }

  // Hourly stats
  const hourStats: Record<number, { trades: number; wins: number; pnl: number }> = {};
  for (let i = 0; i < 24; i++) hourStats[i] = { trades: 0, wins: 0, pnl: 0 };
  
  // Daily stats
  const dayStats: Record<string, { trades: number; wins: number; pnl: number }> = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(d => dayStats[d] = { trades: 0, wins: 0, pnl: 0 });
  
  // Monthly stats
  const monthStats: Record<string, { trades: number; wins: number; pnl: number }> = {};
  
  trades.forEach(trade => {
    const date = new Date(trade.exitTime);
    const hour = date.getHours();
    const day = days[date.getDay()];
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Hourly
    hourStats[hour].trades++;
    hourStats[hour].pnl += trade.pnlCurrency;
    if (trade.outcome === 'WIN') hourStats[hour].wins++;
    
    // Daily
    dayStats[day].trades++;
    dayStats[day].pnl += trade.pnlCurrency;
    if (trade.outcome === 'WIN') dayStats[day].wins++;
    
    // Monthly
    if (!monthStats[month]) monthStats[month] = { trades: 0, wins: 0, pnl: 0 };
    monthStats[month].trades++;
    monthStats[month].pnl += trade.pnlCurrency;
    if (trade.outcome === 'WIN') monthStats[month].wins++;
  });
  
  // Calculate cumulative for monthly
  let runningTotal = 0;
  const monthlyData = Object.keys(monthStats).sort().map(month => {
    const m = monthStats[month];
    runningTotal += m.pnl;
    return {
      month,
      trades: m.trades,
      wins: m.wins,
      pnl: m.pnl,
      cumulative: runningTotal,
      winRate: Math.round((m.wins / m.trades) * 100),
    };
  });
  
  return {
    hourly: Object.entries(hourStats)
      .filter(([_, v]) => v.trades > 0)
      .map(([hour, stats]) => ({
        hour: `${hour}:00`,
        trades: stats.trades,
        wins: stats.wins,
        pnl: stats.pnl,
        winRate: Math.round((stats.wins / stats.trades) * 100),
      })),
    daily: days.filter(d => dayStats[d].trades > 0).map(day => ({
      day,
      trades: dayStats[day].trades,
      wins: dayStats[day].wins,
      pnl: dayStats[day].pnl,
      winRate: Math.round((dayStats[day].wins / dayStats[day].trades) * 100),
    })),
    monthly: monthlyData,
  };
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [user] = useState<User>(mockUser);
  const { trades: apiTrades, isLoading, usingMockData, refresh } = useTrades();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Use API data or fall back to mock data
  const trades = apiTrades.length > 0 ? apiTrades : mockTrades;
  
  // Calculate all metrics
  const metrics = useMemo(() => calculateMetrics(trades), [trades]);
  const timeStats = useMemo(() => calculateTimeStats(trades), [trades]);
  
  // Derived data for charts
  const instrumentData = useMemo(() => {
    const stats = trades.reduce((acc, trade) => {
      const inst = trade.instrument;
      if (!acc[inst]) acc[inst] = { instrument: inst, trades: 0, wins: 0, pnl: 0, r: 0, longs: 0, shorts: 0 };
      acc[inst].trades++;
      acc[inst].pnl += trade.pnlCurrency;
      acc[inst].r += trade.pnlR;
      if (trade.direction === 'LONG') acc[inst].longs++;
      else acc[inst].shorts++;
      if (trade.outcome === 'WIN') acc[inst].wins++;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(stats)
      .map((d: any) => ({ 
        ...d, 
        winRate: Math.round((d.wins / d.trades) * 100),
        avgR: d.r / d.trades
      }))
      .sort((a: any, b: any) => b.pnl - a.pnl);
  }, [trades]);
  
  const setupData = useMemo(() => {
    const stats = trades.reduce((acc, trade) => {
      const setup = trade.setup || 'Unknown';
      if (!acc[setup]) acc[setup] = { setup, trades: 0, wins: 0, pnl: 0, r: 0 };
      acc[setup].trades++;
      acc[setup].pnl += trade.pnlCurrency;
      acc[setup].r += trade.pnlR;
      if (trade.outcome === 'WIN') acc[setup].wins++;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(stats)
      .map((s: any) => ({ 
        ...s, 
        winRate: Math.round((s.wins / s.trades) * 100),
        avgR: s.r / s.trades
      }))
      .sort((a: any, b: any) => b.pnl - a.pnl);
  }, [trades]);
  
  // Trade distribution data (scatter plot)
  const tradeScatterData = useMemo(() => {
    return trades.map(t => ({
      r: t.pnlR,
      pnl: t.pnlCurrency,
      outcome: t.outcome,
      instrument: t.instrument,
    }));
  }, [trades]);
  
  // Loading state
  if (isLoading && trades.length === 0) {
    return (
      <AppShell user={user}>
        <div style={styles.header}>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>Loading performance data...</p>
        </div>
        <div style={styles.grid4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={styles.statCard}><SkeletonCard height={100} /></div>
          ))}
        </div>
        <div style={{ marginTop: '24px' }}><SkeletonChart height={400} /></div>
      </AppShell>
    );
  }
  
  if (!metrics) {
    return (
      <AppShell user={user}>
        <div style={styles.header}>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>No data available</p>
        </div>
        <div style={styles.emptyState}>
          <p>No trade data found. Please check your connection or add trades.</p>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell user={user} onTradeCreated={refresh}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>Deep insights into your trading performance</p>
      </div>
      
      {/* Demo Banner */}
      {usingMockData && (
        <div style={styles.demoBanner}>
          <span style={styles.demoIcon}>⚡</span>
          <p style={styles.demoText}>Demo Mode: Using sample data. Connect Notion for real data.</p>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        {(['overview', 'performance', 'instruments', 'setups', 'time', 'psychology'] as TabType[]).map((tab) => (
          <button
            key={tab}
            style={{ 
              ...styles.tab, 
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* ─── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row */}
          <div style={styles.grid4}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Net Profit</div>
              <div style={{ ...styles.statValue, color: getValueColor(metrics.netProfit) }}>
                {formatCurrency(metrics.netProfit)}
              </div>
              <div style={styles.statSub}>
                <span style={{ ...styles.statIndicator, background: metrics.netProfit >= 0 ? THEME.win : THEME.loss }} />
                {metrics.totalTrades} total trades
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Win Rate</div>
              <div style={{ 
                ...styles.statValue, 
                color: metrics.winRate >= 50 ? THEME.win : metrics.winRate >= 40 ? THEME.gold : THEME.loss 
              }}>
                {metrics.winRate.toFixed(1)}%
              </div>
              <div style={styles.statSub}>
                <span style={{ ...styles.statIndicator, background: THEME.blue }} />
                {metrics.wins}W / {metrics.losses}L / {metrics.breakeven}BE
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Profit Factor</div>
              <div style={{ 
                ...styles.statValue, 
                color: metrics.profitFactor >= 1.5 ? THEME.win : metrics.profitFactor >= 1 ? THEME.gold : THEME.loss 
              }}>
                {metrics.profitFactor.toFixed(2)}
              </div>
              <div style={styles.statSub}>
                <span style={{ ...styles.statIndicator, background: THEME.purple }} />
                {metrics.profitFactor >= 2 ? 'Excellent' : metrics.profitFactor >= 1.5 ? 'Good' : 'Needs Work'}
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Expectancy</div>
              <div style={{ ...styles.statValue, color: metrics.expectancy > 0 ? THEME.win : THEME.loss }}>
                {metrics.expectancy > 0 ? '+' : ''}{metrics.expectancy.toFixed(2)}R
              </div>
              <div style={styles.statSub}>
                <span style={{ ...styles.statIndicator, background: THEME.cyan }} />
                Average edge per trade
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div style={{ ...styles.grid2, marginTop: '24px' }}>
            {/* Equity Curve */}
            <div style={{ ...styles.card, ...styles.cardFull }}>
              <div style={styles.cardTitle}>📈 Equity Curve</div>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeStats.monthly}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.gold} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={THEME.gold} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                    <XAxis 
                      dataKey="month" 
                      stroke={THEME.text.muted} 
                      tickFormatter={(v) => {
                        const [y, m] = v.split('-');
                        return `${m}/${y.slice(2)}`;
                      }}
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke={THEME.text.muted} 
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      style={{ fontSize: '11px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: THEME.bg, 
                        border: `1px solid ${THEME.border}`, 
                        borderRadius: '8px' 
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke={THEME.gold} 
                      fill="url(#equityGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Bottom Row */}
          <div style={{ ...styles.grid2, marginTop: '20px' }}>
            {/* Outcome Distribution */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>🎯 Outcome Distribution</div>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Wins', value: metrics.wins, color: THEME.win },
                        { name: 'Losses', value: metrics.losses, color: THEME.loss },
                        { name: 'Breakeven', value: metrics.breakeven, color: THEME.breakeven },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[THEME.win, THEME.loss, THEME.breakeven].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: THEME.bg, 
                        border: `1px solid ${THEME.border}`, 
                        borderRadius: '8px' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: THEME.win }} />
                  <span style={{ fontSize: '12px', color: THEME.text.secondary }}>Wins ({metrics.wins})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: THEME.loss }} />
                  <span style={{ fontSize: '12px', color: THEME.text.secondary }}>Losses ({metrics.losses})</span>
                </div>
                {metrics.breakeven > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: THEME.breakeven }} />
                    <span style={{ fontSize: '12px', color: THEME.text.secondary }}>BE ({metrics.breakeven})</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Monthly Performance */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>📊 Monthly P&L</div>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeStats.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                    <XAxis 
                      dataKey="month" 
                      stroke={THEME.text.muted}
                      tickFormatter={(v) => {
                        const [y, m] = v.split('-');
                        return `${m}/${y.slice(2)}`;
                      }}
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke={THEME.text.muted}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      style={{ fontSize: '11px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: THEME.bg, 
                        border: `1px solid ${THEME.border}`, 
                        borderRadius: '8px' 
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {timeStats.monthly.map((entry, index) => (
                        <Cell key={index} fill={entry.pnl >= 0 ? THEME.win : THEME.loss} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* ─── PERFORMANCE TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'performance' && (
        <>
          <div style={styles.grid3}>
            {/* Averages Card */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>📐 Averages</div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Win</span>
                <span style={{ ...styles.metricValue, color: THEME.win }}>{formatCurrency(metrics.avgWin)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Loss</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>{formatCurrency(-metrics.avgLoss)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Trade</span>
                <span style={{ ...styles.metricValue, color: getValueColor(metrics.avgTrade) }}>{formatCurrency(metrics.avgTrade)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Risk:Reward Ratio</span>
                <span style={styles.metricValue}>{(metrics.avgWin / metrics.avgLoss).toFixed(2)}:1</span>
              </div>
              <div style={styles.metricRowLast}>
                <span style={styles.metricLabel}>Avg Win R</span>
                <span style={{ ...styles.metricValue, color: THEME.win }}>+{metrics.avgWinR.toFixed(2)}R</span>
              </div>
            </div>
            
            {/* Extremes Card */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>🔥 Extremes</div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Best Trade</span>
                <span style={{ ...styles.metricValue, color: THEME.win }}>{formatCurrency(metrics.maxWin)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Worst Trade</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>{formatCurrency(metrics.maxLoss)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Best Day</span>
                <span style={{ ...styles.metricValue, color: THEME.win }}>{formatCurrency(metrics.bestDay)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Worst Day</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>{formatCurrency(metrics.worstDay)}</span>
              </div>
              <div style={styles.metricRowLast}>
                <span style={styles.metricLabel}>Max Drawdown</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>{formatCurrency(-metrics.maxDrawdown)}</span>
              </div>
            </div>
            
            {/* Advanced Card */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>🔬 Advanced</div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Gross Profit</span>
                <span style={{ ...styles.metricValue, color: THEME.win }}>{formatCurrency(metrics.grossProfit)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Gross Loss</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>{formatCurrency(-metrics.grossLoss)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Recovery Factor</span>
                <span style={styles.metricValue}>{metrics.recoveryFactor.toFixed(2)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Total R Captured</span>
                <span style={{ ...styles.metricValue, color: getValueColor(metrics.totalR) }}>
                  {metrics.totalR > 0 ? '+' : ''}{metrics.totalR.toFixed(2)}R
                </span>
              </div>
              <div style={styles.metricRowLast}>
                <span style={styles.metricLabel}>Avg Loss R</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>-{metrics.avgLossR.toFixed(2)}R</span>
              </div>
            </div>
          </div>
          
          {/* P&L Distribution Scatter */}
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <div style={styles.cardTitle}>🎯 Trade Distribution (R-Multiples)</div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={tradeScatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                  <XAxis 
                    type="number" 
                    dataKey="r" 
                    name="R-Multiple" 
                    stroke={THEME.text.muted}
                    tickFormatter={(v) => `${v}R`}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="pnl" 
                    name="P&L" 
                    stroke={THEME.text.muted}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ background: THEME.bg, border: `1px solid ${THEME.border}`, padding: '8px', borderRadius: '6px' }}>
                            <p style={{ margin: 0, fontSize: '12px' }}>{data.instrument}</p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: getValueColor(data.pnl) }}>
                              {formatCurrency(data.pnl)} ({data.r.toFixed(2)}R)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={0} stroke={THEME.border} />
                  <ReferenceLine x={0} stroke={THEME.border} />
                  <Scatter dataKey="pnl" fill={THEME.gold}>
                    {tradeScatterData.map((entry, index) => (
                      <Cell key={index} fill={entry.outcome === 'WIN' ? THEME.win : entry.outcome === 'LOSS' ? THEME.loss : THEME.breakeven} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
      
      {/* ─── INSTRUMENTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'instruments' && (
        <>
          <div style={styles.card}>
            <div style={styles.cardTitle}>💱 Performance by Instrument</div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={instrumentData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                  <XAxis dataKey="instrument" stroke={THEME.text.muted} />
                  <YAxis 
                    yAxisId="left" 
                    stroke={THEME.text.muted}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke={THEME.text.muted}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: THEME.bg, 
                      border: `1px solid ${THEME.border}`, 
                      borderRadius: '8px' 
                    }}
                    formatter={(v: number, n: string) => {
                      if (n === 'pnl') return formatCurrency(v);
                      if (n === 'winRate') return `${v}%`;
                      return v;
                    }}
                  />
                  <Bar yAxisId="left" dataKey="pnl" name="Total P&L" radius={[4, 4, 0, 0]}>
                    {instrumentData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.pnl >= 0 ? THEME.win : THEME.loss} />
                    ))}
                  </Bar>
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="winRate" 
                    name="Win Rate %" 
                    stroke={THEME.gold} 
                    strokeWidth={2}
                    dot={{ r: 4, fill: THEME.gold }}
                  />
                  <ReferenceLine yAxisId="right" y={50} stroke={THEME.text.muted} strokeDasharray="3 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Instrument Details Table */}
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <div style={styles.cardTitle}>📋 Instrument Breakdown</div>
            {instrumentData.map((inst: any, i: number) => (
              <div key={inst.instrument} style={{ ...styles.metricRow, borderBottom: i === instrumentData.length - 1 ? 'none' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: THEME.text.primary }}>{inst.instrument}</span>
                  <span style={{ fontSize: '11px', color: THEME.text.muted }}>{inst.trades} trades</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '12px', color: THEME.text.secondary }}>
                    {inst.longs}L / {inst.shorts}S
                  </span>
                  <span style={{ fontSize: '12px', color: inst.winRate >= 50 ? THEME.win : THEME.loss, fontWeight: 600 }}>
                    {inst.winRate}% WR
                  </span>
                  <span style={{ ...styles.metricValue, color: getValueColor(inst.pnl), minWidth: '100px', textAlign: 'right' }}>
                    {formatCurrency(inst.pnl)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Directional Bias */}
          <div style={{ ...styles.grid2, marginTop: '20px' }}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>📈 Long vs Short Performance</div>
              <div style={styles.chartContainerSm}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { type: 'Long', trades: metrics.longTrades, winRate: metrics.longWinRate, pnl: trades.filter((t: Trade) => t.direction === 'LONG').reduce((s, t) => s + t.pnlCurrency, 0) },
                    { type: 'Short', trades: metrics.shortTrades, winRate: metrics.shortWinRate, pnl: trades.filter((t: Trade) => t.direction === 'SHORT').reduce((s, t) => s + t.pnlCurrency, 0) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                    <XAxis dataKey="type" stroke={THEME.text.muted} />
                    <YAxis stroke={THEME.text.muted} />
                    <Tooltip 
                      contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '8px' }}
                      formatter={(v: number, n: string) => n === 'pnl' ? formatCurrency(v) : v}
                    />
                    <Bar dataKey="winRate" fill={THEME.blue} radius={[4, 4, 0, 0]} name="Win Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardTitle}>📊 Directional Stats</div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Long Trades</span>
                <span style={styles.metricValue}>{metrics.longTrades}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Long Win Rate</span>
                <span style={{ ...styles.metricValue, color: metrics.longWinRate >= 50 ? THEME.win : THEME.loss }}>{metrics.longWinRate.toFixed(1)}%</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Short Trades</span>
                <span style={styles.metricValue}>{metrics.shortTrades}</span>
              </div>
              <div style={styles.metricRowLast}>
                <span style={styles.metricLabel}>Short Win Rate</span>
                <span style={{ ...styles.metricValue, color: metrics.shortWinRate >= 50 ? THEME.win : THEME.loss }}>{metrics.shortWinRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* ─── SETUPS TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'setups' && (
        <>
          <div style={styles.card}>
            <div style={styles.cardTitle}>🎯 Performance by Setup Type</div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setupData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                  <XAxis type="number" stroke={THEME.text.muted} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="setup" type="category" stroke={THEME.text.muted} width={90} />
                  <Tooltip 
                    contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '8px' }}
                    formatter={(v: number, n: string) => {
                      if (n === 'pnl') return formatCurrency(v);
                      if (n === 'winRate') return `${v}%`;
                      if (n === 'avgR') return `${v.toFixed(2)}R`;
                      return v;
                    }}
                  />
                  <Bar dataKey="pnl" name="P&L" radius={[0, 4, 4, 0]}>
                    {setupData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.pnl >= 0 ? THEME.gold : THEME.loss} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Setup Details */}
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <div style={styles.cardTitle}>📋 Setup Analysis</div>
            {setupData.map((setup: any, i: number) => (
              <div key={setup.setup} style={{ ...styles.metricRow, borderBottom: i === setupData.length - 1 ? 'none' : undefined }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: THEME.text.primary }}>{setup.setup}</span>
                  <span style={{ fontSize: '11px', color: THEME.text.muted, marginLeft: '8px' }}>{setup.trades} trades</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '12px', color: THEME.text.secondary }}>Avg: {setup.avgR.toFixed(2)}R</span>
                  <span style={{ fontSize: '12px', color: setup.winRate >= 50 ? THEME.win : THEME.loss, fontWeight: 600, minWidth: '50px' }}>
                    {setup.winRate}% WR
                  </span>
                  <span style={{ ...styles.metricValue, color: getValueColor(setup.pnl), minWidth: '100px', textAlign: 'right' }}>
                    {formatCurrency(setup.pnl)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Setup Insights */}
          {setupData.length > 0 && (
            <div style={styles.insightBox}>
              <div style={styles.insightTitle}>💡 Setup Insights</div>
              <div style={styles.insightText}>
                Your best performing setup is <strong style={{ color: THEME.gold }}>{setupData[0]?.setup}</strong> with {formatCurrency(setupData[0]?.pnl || 0)} profit across {setupData[0]?.trades || 0} trades ({setupData[0]?.winRate}% win rate).
                {setupData.length > 1 && setupData[setupData.length - 1]?.pnl < 0 && (
                  <> Consider reviewing <strong style={{ color: THEME.loss }}>{setupData[setupData.length - 1]?.setup}</strong> which shows {formatCurrency(setupData[setupData.length - 1]?.pnl || 0)} losses.</>
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* ─── TIME TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'time' && (
        <>
          <div style={styles.grid2}>
            {/* Hourly Analysis */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>⏰ Performance by Hour</div>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeStats.hourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                    <XAxis dataKey="hour" stroke={THEME.text.muted} style={{ fontSize: '10px' }} />
                    <YAxis yAxisId="left" stroke={THEME.text.muted} tickFormatter={(v) => `$${v}`} />
                    <YAxis yAxisId="right" orientation="right" stroke={THEME.text.muted} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '8px' }}
                      formatter={(v: number, n: string) => n === 'pnl' ? formatCurrency(v) : `${v}%`}
                    />
                    <Bar yAxisId="left" dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {timeStats.hourly.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? THEME.win : THEME.loss} />)}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="winRate" stroke={THEME.gold} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Day of Week Analysis */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>📅 Performance by Day</div>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeStats.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                    <XAxis dataKey="day" stroke={THEME.text.muted} />
                    <YAxis yAxisId="left" stroke={THEME.text.muted} tickFormatter={(v) => `$${v}`} />
                    <YAxis yAxisId="right" orientation="right" stroke={THEME.text.muted} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      contentStyle={{ background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '8px' }}
                      formatter={(v: number, n: string) => n === 'pnl' ? formatCurrency(v) : `${v}%`}
                    />
                    <Bar yAxisId="left" dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {timeStats.daily.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? THEME.win : THEME.loss} />)}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="winRate" stroke={THEME.gold} strokeWidth={2} dot={{ r: 4 }} />
                    <ReferenceLine yAxisId="right" y={50} stroke={THEME.text.muted} strokeDasharray="3 3" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Best Times Summary */}
          <div style={{ ...styles.grid2, marginTop: '20px' }}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>⭐ Best Hours</div>
              {timeStats.hourly
                .sort((a, b) => b.pnl - a.pnl)
                .slice(0, 5)
                .map((h, i) => (
                  <div key={h.hour} style={{ ...styles.metricRow, borderBottom: i === 4 ? 'none' : undefined }}>
                    <span style={styles.metricLabel}>{h.hour}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: THEME.text.muted }}>{h.trades} trades</span>
                      <span style={{ fontSize: '12px', color: h.winRate >= 50 ? THEME.win : THEME.loss }}>{h.winRate}% WR</span>
                      <span style={{ ...styles.metricValue, color: getValueColor(h.pnl), minWidth: '80px', textAlign: 'right' }}>
                        {formatCurrency(h.pnl)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardTitle}>⭐ Best Days</div>
              {timeStats.daily
                .sort((a, b) => b.pnl - a.pnl)
                .map((d, i) => (
                  <div key={d.day} style={{ ...styles.metricRow, borderBottom: i === 6 ? 'none' : undefined }}>
                    <span style={styles.metricLabel}>{d.day}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: THEME.text.muted }}>{d.trades} trades</span>
                      <span style={{ fontSize: '12px', color: d.winRate >= 50 ? THEME.win : THEME.loss }}>{d.winRate}% WR</span>
                      <span style={{ ...styles.metricValue, color: getValueColor(d.pnl), minWidth: '80px', textAlign: 'right' }}>
                        {formatCurrency(d.pnl)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
      
      {/* ─── PSYCHOLOGY TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'psychology' && (
        <>
          <div style={styles.grid3}>
            {/* Streaks Card */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>🔥 Streaks</div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Current Streak</span>
                <span style={{ 
                  ...styles.metricValue, 
                  color: metrics.currentStreakType === 'WIN' ? THEME.win : metrics.currentStreakType === 'LOSS' ? THEME.loss : THEME.text.muted 
                }}>
                  {metrics.currentStreak > 0 ? `${metrics.currentStreak} ${metrics.currentStreakType}` : 'None'}
                </span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Max Win Streak</span>
                <span style={{ ...styles.metricValue, color: THEME.win }}>{metrics.maxWinStreak}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Max Loss Streak</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>{metrics.maxLossStreak}</span>
              </div>
              <div style={styles.metricRowLast}>
                <span style={styles.metricLabel}>Streak Ratio</span>
                <span style={styles.metricValue}>
                  {(metrics.maxWinStreak / Math.max(metrics.maxLossStreak, 1)).toFixed(1)}:1
                </span>
              </div>
            </div>
            
            {/* R-Metrics Card */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>📊 R-Multiples</div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Total R</span>
                <span style={{ ...styles.metricValue, color: getValueColor(metrics.totalR) }}>
                  {metrics.totalR > 0 ? '+' : ''}{metrics.totalR.toFixed(2)}R
                </span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average R</span>
                <span style={{ ...styles.metricValue, color: getValueColor(metrics.avgR) }}>
                  {metrics.avgR > 0 ? '+' : ''}{metrics.avgR.toFixed(2)}R
                </span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Win R</span>
                <span style={{ ...styles.metricValue, color: THEME.win }}>+{metrics.avgWinR.toFixed(2)}R</span>
              </div>
              <div style={styles.metricRowLast}>
                <span style={styles.metricLabel}>Average Loss R</span>
                <span style={{ ...styles.metricValue, color: THEME.loss }}>-{metrics.avgLossR.toFixed(2)}R</span>
              </div>
            </div>
            
            {/* Psychology Insights Card */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>🧠 Insights</div>
              <div style={{ fontSize: '13px', color: THEME.text.secondary, lineHeight: 1.7 }}>
                <p style={{ marginBottom: '10px' }}>
                  <strong style={{ color: THEME.text.primary }}>Edge Frequency:</strong><br/>
                  You gain 1R every ~<strong style={{ color: THEME.gold }}>{Math.ceil(1 / Math.abs(metrics.expectancy || 0.1))}</strong> trades
                </p>
                <p style={{ marginBottom: '10px' }}>
                  <strong style={{ color: THEME.text.primary }}>Risk of Ruin:</strong><br/>
                  <span style={{ color: metrics.expectancy > 0 ? THEME.win : THEME.loss }}>
                    {metrics.expectancy > 0 ? 'Low' : 'High'}
                  </span> with current stats
                </p>
                <p>
                  <strong style={{ color: THEME.text.primary }}>Consistency:</strong><br/>
                  {metrics.profitFactor >= 2 ? 'Excellent profit factor' : metrics.profitFactor >= 1.5 ? 'Good profit factor' : 'Improve risk management'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Psychology Tips */}
          <div style={styles.insightBox}>
            <div style={styles.insightTitle}>💡 Psychology Tips</div>
            <div style={styles.insightText}>
              {metrics.currentStreakType === 'LOSS' && metrics.currentStreak >= 3 && (
                <p>⚠️ You're on a {metrics.currentStreak}-trade loss streak. Consider taking a break and reviewing your setup criteria before continuing.</p>
              )}
              {metrics.currentStreakType === 'WIN' && metrics.currentStreak >= 5 && (
                <p>🎉 Great job! You're on a {metrics.currentStreak}-trade win streak. Stay humble and stick to your process - don't get overconfident.</p>
              )}
              {metrics.expectancy < 0.2 && (
                <p>📉 Your expectancy is low. Focus on improving your win rate or increasing your risk:reward ratio on winning trades.</p>
              )}
              {metrics.maxLossStreak >= 5 && (
                <p>⚡ You've experienced a {metrics.maxLossStreak}-trade losing streak in the past. Make sure your position sizing can handle similar streaks.</p>
              )}
              {metrics.expectancy >= 0.5 && metrics.profitFactor >= 1.5 && (
                <p>✅ Your trading edge is solid. Focus on consistency and process execution rather than individual trade outcomes.</p>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
