'use client';

/**
 * Analytics Page - Comprehensive & Realistic
 * Advanced trading analytics with detailed metrics
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import { User, Trade } from '../types';
import { mockUser } from '../lib/mockData';
import { useTrades } from '../hooks/useTrades';
import AppShell from '../components/AppShell';
import { SkeletonChart, SkeletonCard } from '../components/Skeleton';
import { formatCurrency, formatShortDate, getValueColor, formatPercent } from '../lib/utils';

const COLORS = {
  win: '#22c55e',
  loss: '#ef4444',
  breakeven: '#6b7280',
  gold: '#f0b429',
  blue: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899',
};

const styles = {
  header: { marginBottom: '24px', animation: 'fadeIn 0.4s ease-out' },
  title: { fontSize: '28px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px 0', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '14px', color: '#718096', margin: 0 },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(28, 34, 48, 0.8)', paddingBottom: '12px', animation: 'fadeIn 0.4s ease-out' },
  tab: { padding: '10px 18px', backgroundColor: 'transparent', border: '1px solid transparent', borderRadius: '10px', color: '#9ca3af', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' },
  tabActive: { backgroundColor: 'rgba(240, 180, 41, 0.1)', borderColor: 'rgba(240, 180, 41, 0.3)', color: '#f0b429' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)', border: '1px solid rgba(28, 34, 48, 0.8)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s ease' },
  cardFull: { gridColumn: 'span 2' },
  cardTitle: { fontSize: '16px', fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' },
  chartContainer: { height: '280px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px', animation: 'fadeIn 0.4s ease-out' },
  statCard: { background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)', border: '1px solid rgba(28, 34, 48, 0.8)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s ease' },
  statLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px', fontWeight: 600 },
  statValue: { fontSize: '26px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' },
  statSub: { fontSize: '12px', color: '#718096', marginTop: '4px' },
  legend: { display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a0aec0' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%' },
  insightBox: { backgroundColor: 'rgba(28, 34, 48, 0.5)', borderRadius: '12px', padding: '16px', marginTop: '16px' },
  insightTitle: { fontSize: '13px', fontWeight: 600, color: '#f0b429', marginBottom: '8px' },
  insightText: { fontSize: '13px', color: '#a0aec0', lineHeight: 1.6 },
  metricRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(28, 34, 48, 0.5)' },
  metricLabel: { fontSize: '13px', color: '#9ca3af' },
  metricValue: { fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" },
  demoBanner: { background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(240, 180, 41, 0.1) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.4s ease-out' },
  demoIcon: { fontSize: '20px' },
  demoText: { fontSize: '13px', color: '#f59e0b', margin: 0, fontWeight: 500 },
};

type TabType = 'overview' | 'performance' | 'pairs' | 'setups' | 'time' | 'psychology';

// ─── ADVANCED CALCULATIONS ───────────────────────────────────────────────────

function calculateAdvancedMetrics(trades: Trade[]) {
  if (trades.length === 0) return null;

  const wins = trades.filter(t => t.outcome === 'WIN');
  const losses = trades.filter(t => t.outcome === 'LOSS');
  const breakeven = trades.filter(t => t.outcome === 'BREAKEVEN');
  
  // Basic stats
  const winRate = (wins.length / trades.length) * 100;
  const lossRate = (losses.length / trades.length) * 100;
  
  // Profit metrics
  const grossProfit = wins.reduce((sum, t) => sum + t.pnlCurrency, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnlCurrency, 0));
  const netProfit = grossProfit - grossLoss;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  
  // Average metrics
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const avgTrade = netProfit / trades.length;
  
  // R-multiples
  const avgR = trades.reduce((sum, t) => sum + t.pnlR, 0) / trades.length;
  const avgWinR = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnlR, 0) / wins.length : 0;
  const avgLossR = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnlR, 0)) / losses.length : 0;
  
  // Expectancy
  const expectancy = (winRate / 100 * avgWinR) - (lossRate / 100 * avgLossR);
  
  // Consecutive stats
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentStreak = 0;
  let currentType: string | null = null;
  
  trades.forEach(trade => {
    if (trade.outcome === currentType && trade.outcome !== 'BREAKEVEN') {
      currentStreak++;
    } else if (trade.outcome !== 'BREAKEVEN') {
      currentStreak = 1;
      currentType = trade.outcome;
    }
    
    if (currentType === 'WIN') {
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentStreak);
    } else if (currentType === 'LOSS') {
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
    }
  });
  
  // Current streak
  const sortedTrades = [...trades].sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime());
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  
  for (const trade of sortedTrades) {
    if (trade.outcome === 'WIN') currentWinStreak++;
    else if (trade.outcome === 'LOSS') currentLossStreak++;
    else continue;
    break;
  }
  
  // Risk metrics
  const maxWin = Math.max(...trades.map(t => t.pnlCurrency), 0);
  const maxLoss = Math.min(...trades.map(t => t.pnlCurrency), 0);
  
  // Recovery factor
  const sortedByDate = [...trades].sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());
  let maxDrawdown = 0;
  let peak = 0;
  let runningPnl = 0;
  
  sortedByDate.forEach(trade => {
    runningPnl += trade.pnlCurrency;
    peak = Math.max(peak, runningPnl);
    const drawdown = peak - runningPnl;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });
  
  const recoveryFactor = maxDrawdown > 0 ? netProfit / maxDrawdown : 0;
  
  // Sharpe-like ratio (simplified)
  const pnlValues = trades.map(t => t.pnlCurrency);
  const avgPnl = pnlValues.reduce((a, b) => a + b, 0) / pnlValues.length;
  const variance = pnlValues.reduce((sum, val) => sum + Math.pow(val - avgPnl, 2), 0) / pnlValues.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgPnl / stdDev) * Math.sqrt(trades.length) : 0;
  
  // Best/worst day
  const dailyPnl = trades.reduce((acc, trade) => {
    const date = new Date(trade.exitTime).toDateString();
    if (!acc[date]) acc[date] = 0;
    acc[date] += trade.pnlCurrency;
    return acc;
  }, {} as Record<string, number>);
  
  const dailyPnlValues = Object.values(dailyPnl);
  const bestDay = Math.max(...dailyPnlValues, 0);
  const worstDay = Math.min(...dailyPnlValues, 0);
  
  return {
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    winRate,
    lossRate,
    grossProfit,
    grossLoss,
    netProfit,
    profitFactor,
    avgWin,
    avgLoss,
    avgTrade,
    avgR,
    avgWinR,
    avgLossR,
    expectancy,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    currentWinStreak,
    currentLossStreak,
    maxWin,
    maxLoss,
    maxDrawdown,
    recoveryFactor,
    sharpeRatio,
    bestDay,
    worstDay,
    totalTrades: trades.length,
  };
}

function generateTimeAnalysis(trades: Trade[]) {
  // Hour of day analysis
  const hourStats: Record<number, { trades: number; wins: number; pnl: number }> = {};
  for (let i = 0; i < 24; i++) hourStats[i] = { trades: 0, wins: 0, pnl: 0 };
  
  // Day of week analysis
  const dayStats: Record<string, { trades: number; wins: number; pnl: number }> = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(d => dayStats[d] = { trades: 0, wins: 0, pnl: 0 });
  
  trades.forEach(trade => {
    const date = new Date(trade.exitTime);
    const hour = date.getHours();
    const day = days[date.getDay()];
    
    hourStats[hour].trades++;
    hourStats[hour].pnl += trade.pnlCurrency;
    if (trade.outcome === 'WIN') hourStats[hour].wins++;
    
    dayStats[day].trades++;
    dayStats[day].pnl += trade.pnlCurrency;
    if (trade.outcome === 'WIN') dayStats[day].wins++;
  });
  
  return {
    hourly: Object.entries(hourStats)
      .filter(([_, v]) => v.trades > 0)
      .map(([hour, stats]) => ({
        hour: `${hour}:00`,
        trades: stats.trades,
        winRate: Math.round((stats.wins / stats.trades) * 100),
        pnl: stats.pnl,
      })),
    daily: days.filter(d => dayStats[d].trades > 0).map(day => ({
      day,
      trades: dayStats[day].trades,
      winRate: Math.round((dayStats[day].wins / dayStats[day].trades) * 100),
      pnl: dayStats[day].pnl,
    })),
  };
}

export default function AnalyticsPage() {
  const [user] = useState<User>(mockUser);
  const { trades, isLoading, usingMockData, refresh } = useTrades();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const metrics = useMemo(() => calculateAdvancedMetrics(trades), [trades]);
  const timeAnalysis = useMemo(() => generateTimeAnalysis(trades), [trades]);

  // Pair analysis
  const pairData = useMemo(() => {
    const stats = trades.reduce((acc, trade) => {
      const pair = trade.instrument;
      if (!acc[pair]) acc[pair] = { pair, trades: 0, wins: 0, pnl: 0, r: 0 };
      acc[pair].trades++;
      acc[pair].pnl += trade.pnlCurrency;
      acc[pair].r += trade.pnlR;
      if (trade.outcome === 'WIN') acc[pair].wins++;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(stats)
      .map((p: any) => ({ ...p, winRate: Math.round((p.wins / p.trades) * 100), avgR: p.r / p.trades }))
      .sort((a: any, b: any) => b.pnl - a.pnl);
  }, [trades]);

  // Setup analysis
  const setupData = useMemo(() => {
    const stats = trades.reduce((acc, trade) => {
      const setup = trade.setup || 'Unknown';
      if (!acc[setup]) acc[setup] = { setup, trades: 0, wins: 0, pnl: 0 };
      acc[setup].trades++;
      acc[setup].pnl += trade.pnlCurrency;
      if (trade.outcome === 'WIN') acc[setup].wins++;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(stats)
      .map((s: any) => ({ ...s, winRate: Math.round((s.wins / s.trades) * 100) }))
      .sort((a: any, b: any) => b.pnl - a.pnl);
  }, [trades]);

  // Monthly progression
  const monthlyData = useMemo(() => {
    const stats = trades.reduce((acc, trade) => {
      const date = new Date(trade.exitTime);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[month]) acc[month] = { month, trades: 0, wins: 0, pnl: 0, cumulative: 0 };
      acc[month].trades++;
      acc[month].pnl += trade.pnlCurrency;
      if (trade.outcome === 'WIN') acc[month].wins++;
      return acc;
    }, {} as Record<string, any>);
    
    let runningTotal = 0;
    return Object.values(stats)
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .map((m: any) => {
        runningTotal += m.pnl;
        return { ...m, cumulative: runningTotal, winRate: Math.round((m.wins / m.trades) * 100) };
      });
  }, [trades]);

  if (isLoading && trades.length === 0) {
    return (
      <AppShell user={user}>
        <div style={styles.header}>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>Comprehensive trading analysis</p>
        </div>
        <div style={styles.statsGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={styles.statCard}><SkeletonCard height={100} /></div>
          ))}
        </div>
        <SkeletonChart height={400} />
      </AppShell>
    );
  }

  if (!metrics) {
    return (
      <AppShell user={user}>
        <div style={styles.header}>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>No trade data available</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user} onTradeCreated={refresh}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Advanced Analytics</h1>
        <p style={styles.subtitle}>Deep insights into your trading performance</p>
      </div>

      {usingMockData && (
        <div style={styles.demoBanner}>
          <span style={styles.demoIcon}>⚡</span>
          <p style={styles.demoText}>Demo Mode: Add NOTION_TOKEN to use real data</p>
        </div>
      )}

      {/* Key Metrics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Net Profit</div>
          <div style={{ ...styles.statValue, color: getValueColor(metrics.netProfit) }}>
            {formatCurrency(metrics.netProfit)}
          </div>
          <div style={styles.statSub}>{metrics.totalTrades} trades total</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Win Rate</div>
          <div style={{ ...styles.statValue, color: metrics.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
            {metrics.winRate.toFixed(1)}%
          </div>
          <div style={styles.statSub}>{metrics.wins}W / {metrics.losses}L / {metrics.breakeven}BE</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Profit Factor</div>
          <div style={{ ...styles.statValue, color: metrics.profitFactor >= 1.5 ? '#22c55e' : '#f59e0b' }}>
            {metrics.profitFactor.toFixed(2)}
          </div>
          <div style={styles.statSub}>{metrics.profitFactor >= 2 ? 'Excellent' : metrics.profitFactor >= 1.5 ? 'Good' : 'Needs Work'}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Expectancy</div>
          <div style={{ ...styles.statValue, color: metrics.expectancy > 0 ? '#22c55e' : '#ef4444' }}>
            {metrics.expectancy > 0 ? '+' : ''}{metrics.expectancy.toFixed(2)}R
          </div>
          <div style={styles.statSub}>Avg per trade edge</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['overview', 'performance', 'pairs', 'setups', 'time', 'psychology'] as TabType[]).map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📈 Outcome Distribution</h3>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Wins', value: metrics.wins, color: COLORS.win },
                        { name: 'Losses', value: metrics.losses, color: COLORS.loss },
                        { name: 'Breakeven', value: metrics.breakeven, color: COLORS.breakeven },
                      ]}
                      cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={3} dataKey="value"
                    >
                      {[COLORS.win, COLORS.loss, COLORS.breakeven].map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.legend}>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, backgroundColor: COLORS.win }} />Wins ({metrics.wins})</div>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, backgroundColor: COLORS.loss }} />Losses ({metrics.losses})</div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💰 P&L Distribution</h3>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trades.map(t => ({ pnl: t.pnlCurrency })).sort((a, b) => a.pnl - b.pnl)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                    <XAxis hide />
                    <YAxis stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {trades.map((t, i) => <Cell key={i} fill={t.pnlCurrency >= 0 ? COLORS.win : COLORS.loss} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, ...styles.cardFull, marginTop: '20px' }}>
            <h3 style={styles.cardTitle}>📊 Cumulative Equity Curve</h3>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="month" stroke="#a0aec0" tickFormatter={(v) => { const [y, m] = v.split('-'); return `${m}/${y.slice(2)}`; }} />
                  <YAxis stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} formatter={(v: number) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="cumulative" stroke={COLORS.gold} fillOpacity={1} fill="url(#colorPnl)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'performance' && (
        <>
          <div style={styles.grid3}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📈 Averages</h3>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Win</span>
                <span style={{ ...styles.metricValue, color: '#22c55e' }}>{formatCurrency(metrics.avgWin)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Loss</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>{formatCurrency(metrics.avgLoss)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Trade</span>
                <span style={{ ...styles.metricValue, color: getValueColor(metrics.avgTrade) }}>{formatCurrency(metrics.avgTrade)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Risk:Reward</span>
                <span style={styles.metricValue}>{Math.abs(metrics.avgWin / metrics.avgLoss).toFixed(2)}:1</span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🔥 Extremes</h3>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Best Trade</span>
                <span style={{ ...styles.metricValue, color: '#22c55e' }}>{formatCurrency(metrics.maxWin)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Worst Trade</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>{formatCurrency(metrics.maxLoss)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Best Day</span>
                <span style={{ ...styles.metricValue, color: '#22c55e' }}>{formatCurrency(metrics.bestDay)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Worst Day</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>{formatCurrency(metrics.worstDay)}</span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Advanced</h3>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Max Drawdown</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>{formatCurrency(-metrics.maxDrawdown)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Recovery Factor</span>
                <span style={styles.metricValue}>{metrics.recoveryFactor.toFixed(2)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Sharpe Ratio</span>
                <span style={styles.metricValue}>{metrics.sharpeRatio.toFixed(2)}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Avg R-Multiple</span>
                <span style={{ ...styles.metricValue, color: metrics.avgR > 0 ? '#22c55e' : '#ef4444' }}>{metrics.avgR > 0 ? '+' : ''}{metrics.avgR.toFixed(2)}R</span>
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, ...styles.cardFull, marginTop: '20px' }}>
            <h3 style={styles.cardTitle}>📈 Monthly Performance</h3>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis dataKey="month" stroke="#a0aec0" tickFormatter={(v) => { const [y, m] = v.split('-'); return `${m}/${y.slice(2)}`; }} />
                  <YAxis yAxisId="left" stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} />
                  <Bar yAxisId="left" dataKey="pnl" name="Monthly P&L" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? COLORS.win : COLORS.loss} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate %" stroke={COLORS.gold} strokeWidth={2} dot={{ r: 4 }} />
                  <ReferenceLine yAxisId="right" y={50} stroke="#9ca3af" strokeDasharray="3 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'pairs' && (
        <div style={{ ...styles.card, ...styles.cardFull }}>
          <h3 style={styles.cardTitle}>💱 Performance by Currency Pair</h3>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                <XAxis dataKey="pair" stroke="#a0aec0" />
                <YAxis yAxisId="left" stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} formatter={(v: number, n: string) => n.includes('pnl') ? formatCurrency(v) : `${v}%`} />
                <Bar yAxisId="left" dataKey="pnl" name="Total P&L" radius={[4, 4, 0, 0]}>
                  {pairData.map((entry: any, index: number) => <Cell key={index} fill={entry.pnl >= 0 ? COLORS.win : COLORS.loss} />)}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate" stroke={COLORS.gold} strokeWidth={2} dot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'setups' && (
        <div style={{ ...styles.card, ...styles.cardFull }}>
          <h3 style={styles.cardTitle}>🎯 Performance by Setup Type</h3>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setupData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                <XAxis type="number" stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="setup" type="category" stroke="#a0aec0" width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="pnl" name="P&L" radius={[0, 4, 4, 0]}>
                  {setupData.map((entry: any, index: number) => <Cell key={index} fill={entry.pnl >= 0 ? COLORS.gold : COLORS.loss} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.insightBox}>
            <div style={styles.insightTitle}>💡 Setup Insights</div>
            <div style={styles.insightText}>
              Best performing setup: <strong style={{ color: COLORS.gold }}>{setupData[0]?.setup || 'N/A'}</strong> with {formatCurrency(setupData[0]?.pnl || 0)} profit across {setupData[0]?.trades || 0} trades.
              {setupData.length > 1 && ` Worst: ${setupData[setupData.length - 1]?.setup} at ${formatCurrency(setupData[setupData.length - 1]?.pnl || 0)}.`}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⏰ Performance by Hour</h3>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeAnalysis.hourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                    <XAxis dataKey="hour" stroke="#a0aec0" />
                    <YAxis stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} formatter={(v: number, n: string) => n === 'pnl' ? formatCurrency(v) : v} />
                    <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                      {timeAnalysis.hourly.map((e: any, i: number) => <Cell key={i} fill={e.pnl >= 0 ? COLORS.win : COLORS.loss} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📅 Performance by Day</h3>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeAnalysis.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                    <XAxis dataKey="day" stroke="#a0aec0" />
                    <YAxis stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1318', border: '1px solid #1c2230', borderRadius: '8px' }} formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                      {timeAnalysis.daily.map((e: any, i: number) => <Cell key={i} fill={e.pnl >= 0 ? COLORS.win : COLORS.loss} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'psychology' && (
        <>
          <div style={styles.grid3}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🔥 Streaks</h3>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Current Win Streak</span>
                <span style={{ ...styles.metricValue, color: metrics.currentWinStreak > 0 ? '#22c55e' : '#718096' }}>{metrics.currentWinStreak}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Current Loss Streak</span>
                <span style={{ ...styles.metricValue, color: metrics.currentLossStreak > 0 ? '#ef4444' : '#718096' }}>{metrics.currentLossStreak}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Max Win Streak</span>
                <span style={{ ...styles.metricValue, color: '#22c55e' }}>{metrics.maxConsecutiveWins}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Max Loss Streak</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>{metrics.maxConsecutiveLosses}</span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🎯 R-Multiples</h3>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Win (R)</span>
                <span style={{ ...styles.metricValue, color: '#22c55e' }}>+{metrics.avgWinR.toFixed(2)}R</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Average Loss (R)</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>-{metrics.avgLossR.toFixed(2)}R</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Total R Captured</span>
                <span style={{ ...styles.metricValue, color: trades.reduce((s, t) => s + t.pnlR, 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                  {trades.reduce((s, t) => s + t.pnlR, 0) > 0 ? '+' : ''}{trades.reduce((s, t) => s + t.pnlR, 0).toFixed(2)}R
                </span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💡 Trading Insights</h3>
              <div style={{ fontSize: '13px', color: '#a0aec0', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '8px' }}>• You need <strong style={{ color: '#f0b429' }}>{Math.ceil(1 / (metrics.expectancy || 0.1))}</strong> trades to make 1R profit on average</p>
                <p style={{ marginBottom: '8px' }}>• Your edge manifests every <strong style={{ color: '#f0b429' }}>{Math.ceil(1 / (metrics.winRate / 100))}</strong> trades</p>
                <p>• Risk of ruin with current stats: <strong style={{ color: metrics.expectancy > 0 ? '#22c55e' : '#ef4444' }}>{metrics.expectancy > 0 ? 'Low' : 'High'}</strong></p>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
