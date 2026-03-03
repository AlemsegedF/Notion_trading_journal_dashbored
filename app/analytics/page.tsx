'use client';

/**
 * Analytics Page
 * Detailed trading analytics with charts
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { User, Trade } from '../types';
import { mockUser } from '../lib/mockData';
import { fetchTradesFromNotion, isNotionConfigured } from '../lib/notionData';
import AppShell from '../components/AppShell';
import { formatCurrency, formatShortDate, getValueColor } from '../lib/utils';

const COLORS = {
  win: '#22c55e',
  loss: '#ef4444',
  breakeven: '#6b7280',
  gold: '#f0b429',
  blue: '#3b82f6',
  purple: '#a855f7',
};

const styles = {
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #1c2230',
    paddingBottom: '12px',
  },
  tab: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #1c2230',
    borderRadius: '8px',
    color: '#718096',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    backgroundColor: '#1c2230',
    borderColor: '#f0b429',
    color: '#f0b429',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
  },
  cardFull: {
    gridColumn: 'span 2',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 16px 0',
  },
  chartContainer: {
    height: '250px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '16px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#718096',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#a0aec0',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  loading: {
    padding: '60px',
    textAlign: 'center' as const,
    color: '#718096',
  },
  empty: {
    padding: '60px',
    textAlign: 'center' as const,
    color: '#718096',
  },
};

type TabType = 'overview' | 'pairs' | 'setups' | 'monthly';

export default function AnalyticsPage() {
  const [user] = useState<User>(mockUser);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const notionReady = await isNotionConfigured();
      if (notionReady) {
        const realTrades = await fetchTradesFromNotion();
        setTrades(realTrades);
      } else {
        const { mockTrades } = await import('../lib/mockData');
        setTrades(mockTrades);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      const { mockTrades } = await import('../lib/mockData');
      setTrades(mockTrades);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (trades.length === 0) return null;

    // Overall stats
    const wins = trades.filter(t => t.outcome === 'WIN').length;
    const losses = trades.filter(t => t.outcome === 'LOSS').length;
    const breakeven = trades.filter(t => t.outcome === 'BREAKEVEN').length;
    const totalPnl = trades.reduce((sum, t) => sum + t.pnlCurrency, 0);
    const avgWin = wins > 0 
      ? trades.filter(t => t.outcome === 'WIN').reduce((sum, t) => sum + t.pnlCurrency, 0) / wins 
      : 0;
    const avgLoss = losses > 0 
      ? trades.filter(t => t.outcome === 'LOSS').reduce((sum, t) => sum + t.pnlCurrency, 0) / losses 
      : 0;

    // By Pair
    const pairStats = trades.reduce((acc, trade) => {
      const pair = trade.instrument;
      if (!acc[pair]) acc[pair] = { pair, trades: 0, wins: 0, pnl: 0 };
      acc[pair].trades++;
      if (trade.outcome === 'WIN') acc[pair].wins++;
      acc[pair].pnl += trade.pnlCurrency;
      return acc;
    }, {} as Record<string, { pair: string; trades: number; wins: number; pnl: number }>);

    const pairData = Object.values(pairStats)
      .map(p => ({ ...p, winRate: Math.round((p.wins / p.trades) * 100) }))
      .sort((a, b) => b.pnl - a.pnl);

    // By Setup
    const setupStats = trades.reduce((acc, trade) => {
      const setup = trade.setup || 'Unknown';
      if (!acc[setup]) acc[setup] = { setup, trades: 0, wins: 0, pnl: 0 };
      acc[setup].trades++;
      if (trade.outcome === 'WIN') acc[setup].wins++;
      acc[setup].pnl += trade.pnlCurrency;
      return acc;
    }, {} as Record<string, { setup: string; trades: number; wins: number; pnl: number }>);

    const setupData = Object.values(setupStats)
      .map(s => ({ ...s, winRate: Math.round((s.wins / s.trades) * 100) }))
      .sort((a, b) => b.pnl - a.pnl);

    // Monthly data
    const monthlyStats = trades.reduce((acc, trade) => {
      const date = new Date(trade.exitTime);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[month]) acc[month] = { month, trades: 0, wins: 0, pnl: 0 };
      acc[month].trades++;
      if (trade.outcome === 'WIN') acc[month].wins++;
      acc[month].pnl += trade.pnlCurrency;
      return acc;
    }, {} as Record<string, { month: string; trades: number; wins: number; pnl: number }>);

    const monthlyData = Object.values(monthlyStats)
      .map(m => ({ ...m, winRate: Math.round((m.wins / m.trades) * 100) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      wins,
      losses,
      breakeven,
      totalPnl,
      avgWin,
      avgLoss,
      pairData,
      setupData,
      monthlyData,
    };
  }, [trades]);

  if (isLoading) {
    return (
      <AppShell user={user} onTradeCreated={loadData}>
        <div style={styles.loading}>Loading analytics...</div>
      </AppShell>
    );
  }

  if (!analytics) {
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
    <AppShell user={user}>
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>Detailed trading performance analysis</p>
      </div>

      {/* Overview Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Trades</div>
          <div style={{ ...styles.statValue, color: '#e2e8f0' }}>{trades.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Win Rate</div>
          <div style={{ ...styles.statValue, color: analytics.wins / trades.length >= 0.5 ? '#22c55e' : '#ef4444' }}>
            {Math.round((analytics.wins / trades.length) * 100)}%
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total P&L</div>
          <div style={{ ...styles.statValue, color: getValueColor(analytics.totalPnl) }}>
            {formatCurrency(analytics.totalPnl)}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Avg Win/Loss</div>
          <div style={{ ...styles.statValue, fontSize: '18px' }}>
            <span style={{ color: '#22c55e' }}>{formatCurrency(analytics.avgWin)}</span>
            <span style={{ color: '#718096', margin: '0 4px' }}>/</span>
            <span style={{ color: '#ef4444' }}>{formatCurrency(analytics.avgLoss)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['overview', 'pairs', 'setups', 'monthly'] as TabType[]).map((tab) => (
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Outcome Distribution</h3>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Wins', value: analytics.wins, color: COLORS.win },
                      { name: 'Losses', value: analytics.losses, color: COLORS.loss },
                      { name: 'Breakeven', value: analytics.breakeven, color: COLORS.breakeven },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { color: COLORS.win },
                      { color: COLORS.loss },
                      { color: COLORS.breakeven },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1318',
                      border: '1px solid #1c2230',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, backgroundColor: COLORS.win }} />
                Wins ({analytics.wins})
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, backgroundColor: COLORS.loss }} />
                Losses ({analytics.losses})
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, backgroundColor: COLORS.breakeven }} />
                Breakeven ({analytics.breakeven})
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>P&L by Outcome</h3>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Wins', pnl: analytics.avgWin * analytics.wins },
                    { name: 'Losses', pnl: analytics.avgLoss * analytics.losses },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                  <XAxis type="number" stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                  <YAxis dataKey="name" type="category" stroke="#a0aec0" width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1318',
                      border: '1px solid #1c2230',
                      borderRadius: '8px',
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                    <Cell fill={COLORS.win} />
                    <Cell fill={COLORS.loss} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pairs' && (
        <div style={{ ...styles.card, ...styles.cardFull }}>
          <h3 style={styles.cardTitle}>Performance by Pair</h3>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.pairData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                <XAxis dataKey="pair" stroke="#a0aec0" />
                <YAxis stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1318',
                    border: '1px solid #1c2230',
                    borderRadius: '8px',
                  }}
                  formatter={(v: number, n: string) => 
                    n === 'pnl' ? formatCurrency(v) : `${v}%`
                  }
                />
                <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                  {analytics.pairData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? COLORS.win : COLORS.loss} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'setups' && (
        <div style={{ ...styles.card, ...styles.cardFull }}>
          <h3 style={styles.cardTitle}>Performance by Setup</h3>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.setupData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                <XAxis type="number" stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="setup" type="category" stroke="#a0aec0" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1318',
                    border: '1px solid #1c2230',
                    borderRadius: '8px',
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="pnl" name="P&L" radius={[0, 4, 4, 0]}>
                  {analytics.setupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? COLORS.gold : COLORS.loss} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div style={{ ...styles.card, ...styles.cardFull }}>
          <h3 style={styles.cardTitle}>Monthly Performance</h3>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2230" />
                <XAxis 
                  dataKey="month" 
                  stroke="#a0aec0" 
                  tickFormatter={(v) => {
                    const [year, month] = v.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis stroke="#4a5568" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1318',
                    border: '1px solid #1c2230',
                    borderRadius: '8px',
                  }}
                  formatter={(v: number, n: string) =>
                    n === 'pnl' ? formatCurrency(v) : `${v}%`
                  }
                  labelFormatter={(l) => `Month: ${l}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="pnl" 
                  name="P&L" 
                  stroke={COLORS.gold} 
                  strokeWidth={2}
                  dot={{ r: 4, fill: COLORS.gold }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AppShell>
  );
}
