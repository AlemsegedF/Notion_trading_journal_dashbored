'use client';

/**
 * Strategies Page
 * Manage and analyze trading strategies
 */

import React, { useState } from 'react';
import { User, Strategy } from '../types';
import { mockUser, mockStrategies } from '../lib/mockData';
import AppShell from '../components/AppShell';
import { formatCurrency, getValueColor } from '../lib/utils';

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  strategyName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: 0,
  },
  strategyDesc: {
    fontSize: '13px',
    color: '#718096',
    margin: '4px 0 16px 0',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  stat: {
    textAlign: 'center' as const,
    padding: '10px',
    backgroundColor: '#1c2230',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#e2e8f0',
    marginBottom: '2px',
  },
  statLabel: {
    fontSize: '10px',
    color: '#718096',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
};

export default function StrategiesPage() {
  const [user] = useState<User>(mockUser);
  const [strategies] = useState<Strategy[]>(mockStrategies);

  const handleNewTrade = () => {
    alert('New Trade button clicked!');
  };

  return (
    <AppShell user={user} onNewTrade={handleNewTrade}>
      <div style={styles.header}>
        <h1 style={styles.title}>Strategies</h1>
        <p style={styles.subtitle}>Manage and analyze your trading strategies</p>
      </div>

      <div style={styles.grid}>
        {strategies.map((strategy) => (
          <div key={strategy.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.strategyName}>{strategy.name}</h2>
            </div>
            <p style={styles.strategyDesc}>
              {strategy.description || 'No description provided'}
            </p>
            <div style={styles.stats}>
              <div style={styles.stat}>
                <div style={{ ...styles.statValue, color: getValueColor(strategy.totalPnlCurrency) }}>
                  {formatCurrency(strategy.totalPnlCurrency)}
                </div>
                <div style={styles.statLabel}>Total P&L</div>
              </div>
              <div style={styles.stat}>
                <div style={{ ...styles.statValue, color: strategy.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                  {strategy.winRate}%
                </div>
                <div style={styles.statLabel}>Win Rate</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>
                  {strategy.totalTrades}
                </div>
                <div style={styles.statLabel}>Trades</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
