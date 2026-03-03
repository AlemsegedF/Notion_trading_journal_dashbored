'use client';

/**
 * PerformanceMetricsCard Component
 * Displays performance metrics in a grid layout
 */

import React from 'react';
import { PerformanceMetrics } from '../types';
import { formatCurrency, formatR, formatPercent } from '../lib/utils';

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
  },
  header: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  metric: {
    padding: '12px',
    backgroundColor: '#1c2230',
    borderRadius: '8px',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#718096',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '6px',
    fontWeight: 500,
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    letterSpacing: '-0.01em',
  },
  positive: {
    color: '#22c55e',
  },
  negative: {
    color: '#ef4444',
  },
  neutral: {
    color: '#e2e8f0',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

interface PerformanceMetricsCardProps {
  metrics: PerformanceMetrics;
}

export default function PerformanceMetricsCard({ metrics }: PerformanceMetricsCardProps) {
  const getValueStyle = (value: number) => {
    if (value > 0) return { ...styles.metricValue, ...styles.positive };
    if (value < 0) return { ...styles.metricValue, ...styles.negative };
    return { ...styles.metricValue, ...styles.neutral };
  };

  const getValueStyleWithNeutral = (value: number) => {
    if (value > 0) return { ...styles.metricValue, ...styles.positive };
    if (value < 0) return { ...styles.metricValue, ...styles.negative };
    return { ...styles.metricValue, ...styles.neutral };
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Performance Metrics</h2>
      </div>

      <div style={styles.grid}>
        {/* Expectancy */}
        <div style={styles.metric}>
          <p style={styles.metricLabel}>Expectancy</p>
          <p style={getValueStyleWithNeutral(metrics.expectancy)}>
            {formatR(metrics.expectancy)}
          </p>
        </div>

        {/* Avg Win */}
        <div style={styles.metric}>
          <p style={styles.metricLabel}>Avg Win</p>
          <p style={{ ...styles.metricValue, ...styles.positive }}>
            {formatCurrency(metrics.avgWin)}
          </p>
        </div>

        {/* Avg Loss */}
        <div style={styles.metric}>
          <p style={styles.metricLabel}>Avg Loss</p>
          <p style={{ ...styles.metricValue, ...styles.negative }}>
            {formatCurrency(metrics.avgLoss)}
          </p>
        </div>

        {/* Max Drawdown */}
        <div style={styles.metric}>
          <p style={styles.metricLabel}>Max Drawdown</p>
          <p style={{ ...styles.metricValue, ...styles.negative }}>
            {formatPercent(-metrics.maxDrawdown)}
          </p>
        </div>

        {/* Avg Trade Duration */}
        <div style={styles.metric}>
          <p style={styles.metricLabel}>Avg Trade Duration</p>
          <p style={{ ...styles.metricValue, ...styles.neutral }}>
            {metrics.avgTradeDuration}
          </p>
        </div>

        {/* Total Trades */}
        <div style={styles.metric}>
          <p style={styles.metricLabel}>Total Trades</p>
          <p style={{ ...styles.metricValue, ...styles.neutral }}>
            {metrics.totalTrades.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
