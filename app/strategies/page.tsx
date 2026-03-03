'use client';

/**
 * Strategies Page - Modern with optimized loading
 * Manage and analyze trading strategies
 */

import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { mockUser } from '../lib/mockData';
import { useTrades } from '../hooks/useTrades';
import AppShell from '../components/AppShell';
import { SkeletonCard } from '../components/Skeleton';
import { formatCurrency, getValueColor } from '../lib/utils';

const styles = {
  header: {
    marginBottom: '24px',
    animation: 'fadeIn 0.4s ease-out',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    animation: 'fadeIn 0.5s ease-out',
  },
  card: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(240, 180, 41, 0.1)',
    borderColor: 'rgba(240, 180, 41, 0.3)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  strategyName: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: 0,
  },
  strategyDesc: {
    fontSize: '13px',
    color: '#718096',
    margin: '6px 0 20px 0',
    lineHeight: 1.5,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  stat: {
    textAlign: 'center' as const,
    padding: '14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  statHover: {
    backgroundColor: 'rgba(28, 34, 48, 0.8)',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#e2e8f0',
    marginBottom: '4px',
    letterSpacing: '-0.01em',
  },
  statLabel: {
    fontSize: '10px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  loading: {
    padding: '60px',
    textAlign: 'center' as const,
    color: '#718096',
  },
  demoBanner: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(240, 180, 41, 0.1) 100%)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '20px',
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
};

export default function StrategiesPage() {
  const [user] = useState<User>(mockUser);
  const { strategies, isLoading, usingMockData, refresh } = useTrades();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const sortedStrategies = useMemo(() => 
    strategies.slice().sort((a, b) => b.totalPnlCurrency - a.totalPnlCurrency),
  [strategies]);

  if (isLoading && strategies.length === 0) {
    return (
      <AppShell user={user}>
        <div style={styles.header}>
          <h1 style={styles.title}>Strategies</h1>
          <p style={styles.subtitle}>Manage and analyze your trading strategies</p>
        </div>
        <div style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height={200} />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user} onTradeCreated={refresh}>
      <div style={styles.header}>
        <h1 style={styles.title}>Strategies</h1>
        <p style={styles.subtitle}>Manage and analyze your trading strategies</p>
      </div>

      {usingMockData && (
        <div style={styles.demoBanner}>
          <span style={styles.demoIcon}>⚡</span>
          <p style={styles.demoText}>Demo Mode: Add NOTION_TOKEN to use real data</p>
        </div>
      )}

      <div style={styles.grid}>
        {sortedStrategies.map((strategy) => (
          <div 
            key={strategy.id} 
            style={{ ...styles.card, ...(hoveredCard === strategy.id ? styles.cardHover : {}) }}
            onMouseEnter={() => setHoveredCard(strategy.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardHeader}>
              <h2 style={styles.strategyName}>{strategy.name}</h2>
            </div>
            <p style={styles.strategyDesc}>{strategy.description || 'No description provided'}</p>
            <div style={styles.stats}>
              <div style={{ ...styles.stat, ...(hoveredCard === strategy.id ? styles.statHover : {}) }}>
                <div style={{ ...styles.statValue, color: getValueColor(strategy.totalPnlCurrency) }}>
                  {formatCurrency(strategy.totalPnlCurrency)}
                </div>
                <div style={styles.statLabel}>Total P&L</div>
              </div>
              <div style={{ ...styles.stat, ...(hoveredCard === strategy.id ? styles.statHover : {}) }}>
                <div style={{ ...styles.statValue, color: strategy.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                  {strategy.winRate}%
                </div>
                <div style={styles.statLabel}>Win Rate</div>
              </div>
              <div style={{ ...styles.stat, ...(hoveredCard === strategy.id ? styles.statHover : {}) }}>
                <div style={styles.statValue}>{strategy.totalTrades}</div>
                <div style={styles.statLabel}>Trades</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
