'use client';

/**
 * KpiCardsRow Component
 * Displays four KPI cards: Total Return, Win Rate, Profit Factor, Today's P&L
 */

import React from 'react';
import { KpiMetrics } from '../types';
import { formatPercent, formatCurrency, formatNumber } from '../lib/utils';

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute' as const,
    top: '-30px',
    right: '-30px',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    opacity: 0.08,
    filter: 'blur(20px)',
  },
  label: {
    fontSize: '12px',
    color: '#718096',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px',
    fontWeight: 500,
  },
  mainValue: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  },
  secondaryValue: {
    fontSize: '13px',
    color: '#a0aec0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  positive: {
    color: '#22c55e',
  },
  negative: {
    color: '#ef4444',
  },
  neutral: {
    color: '#6b7280',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  badgeHealthy: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
  },
  badgeGood: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
  },
  badgePoor: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
  },
  badgeCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

interface KpiCardsRowProps {
  metrics: KpiMetrics;
}

export default function KpiCardsRow({ metrics }: KpiCardsRowProps) {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Healthy':
        return styles.badgeHealthy;
      case 'Good':
        return styles.badgeGood;
      case 'Poor':
        return styles.badgePoor;
      case 'Critical':
        return styles.badgeCritical;
      default:
        return styles.badgeHealthy;
    }
  };

  const getValueStyle = (value: number) => {
    if (value > 0) return { ...styles.mainValue, ...styles.positive };
    if (value < 0) return { ...styles.mainValue, ...styles.negative };
    return { ...styles.mainValue, ...styles.neutral };
  };

  return (
    <div style={styles.container}>
      {/* Total Return Card */}
      <div style={styles.card}>
        <div style={{ ...styles.cardGlow, backgroundColor: '#22c55e' }} />
        <p style={styles.label}>Total Return</p>
        <p style={getValueStyle(metrics.totalReturn.value)}>
          {formatPercent(metrics.totalReturn.value)}
        </p>
        <p style={styles.secondaryValue}>
          <span style={metrics.totalReturn.change >= 0 ? styles.positive : styles.negative}>
            {formatPercent(metrics.totalReturn.change)}
          </span>
          <span>vs last period</span>
        </p>
      </div>

      {/* Win Rate Card */}
      <div style={styles.card}>
        <div style={{ ...styles.cardGlow, backgroundColor: '#3b82f6' }} />
        <p style={styles.label}>Win Rate</p>
        <p style={{ ...styles.mainValue, color: '#e2e8f0' }}>
          {formatPercentAbs(metrics.winRate.overall)}
        </p>
        <p style={styles.secondaryValue}>
          <span style={metrics.winRate.lastNTrades >= 50 ? styles.positive : styles.negative}>
            {formatPercentAbs(metrics.winRate.lastNTrades)}
          </span>
          <span>(last {metrics.winRate.lastNCount})</span>
        </p>
      </div>

      {/* Profit Factor Card */}
      <div style={styles.card}>
        <div style={{ ...styles.cardGlow, backgroundColor: '#f0b429' }} />
        <p style={styles.label}>Profit Factor</p>
        <p style={{ ...styles.mainValue, color: '#e2e8f0' }}>
          {metrics.profitFactor.value.toFixed(2)}
        </p>
        <p style={styles.secondaryValue}>
          <span style={{ ...styles.badge, ...getBadgeStyle(metrics.profitFactor.status) }}>
            {metrics.profitFactor.status}
          </span>
        </p>
      </div>

      {/* Today's P&L Card */}
      <div style={styles.card}>
        <div style={{ ...styles.cardGlow, backgroundColor: metrics.todaysPnl.value >= 0 ? '#22c55e' : '#ef4444' }} />
        <p style={styles.label}>Today's P&L</p>
        <p style={getValueStyle(metrics.todaysPnl.value)}>
          {formatCurrency(metrics.todaysPnl.value)}
        </p>
        <p style={styles.secondaryValue}>
          <span>{formatNumber(metrics.todaysPnl.tradeCount)}</span>
          <span>trade{metrics.todaysPnl.tradeCount !== 1 ? 's' : ''} today</span>
        </p>
      </div>
    </div>
  );
}

// Helper to format percentage without sign
function formatPercentAbs(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}
