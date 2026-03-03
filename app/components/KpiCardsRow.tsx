'use client';

/**
 * KpiCardsRow Component - Modern with hover effects
 * Displays four KPI cards: Total Return, Win Rate, Profit Factor, Today's P&L
 */

import React, { useState } from 'react';
import { KpiMetrics } from '../types';
import { formatPercent, formatCurrency, formatNumber } from '../lib/utils';

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    padding: '20px',
    position: 'relative' as const,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(240, 180, 41, 0.1)',
    borderColor: 'rgba(240, 180, 41, 0.3)',
  },
  cardGlow: {
    position: 'absolute' as const,
    top: '-50%',
    right: '-50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(240, 180, 41, 0.08) 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  cardGlowVisible: {
    opacity: 1,
  },
  label: {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '10px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  mainValue: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: '6px',
    letterSpacing: '-0.02em',
    transition: 'transform 0.2s ease',
  },
  secondaryValue: {
    fontSize: '13px',
    color: '#9ca3af',
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
    color: '#e2e8f0',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
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
  trendIcon: {
    fontSize: '10px',
  },
};

interface KpiCardsRowProps {
  metrics: KpiMetrics;
}

export default function KpiCardsRow({ metrics }: KpiCardsRowProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Healthy': return styles.badgeHealthy;
      case 'Good': return styles.badgeGood;
      case 'Poor': return styles.badgePoor;
      case 'Critical': return styles.badgeCritical;
      default: return styles.badgeHealthy;
    }
  };

  const getValueStyle = (value: number) => ({
    ...styles.mainValue,
    ...(value > 0 ? styles.positive : value < 0 ? styles.negative : styles.neutral),
    transform: hoveredCard !== null ? 'scale(1.02)' : 'scale(1)',
  });

  const cards = [
    {
      label: 'Total Return',
      mainValue: formatPercent(metrics.totalReturn.value),
      secondary: `${formatPercent(metrics.totalReturn.change)} vs last period`,
      isPositive: metrics.totalReturn.change >= 0,
      color: metrics.totalReturn.value >= 0 ? '#22c55e' : '#ef4444',
    },
    {
      label: 'Win Rate',
      mainValue: `${formatPercentAbs(metrics.winRate.overall)}`,
      secondary: `${formatPercentAbs(metrics.winRate.lastNTrades)} (last ${metrics.winRate.lastNCount})`,
      isPositive: metrics.winRate.lastNTrades >= 50,
      color: '#3b82f6',
    },
    {
      label: 'Profit Factor',
      mainValue: metrics.profitFactor.value.toFixed(2),
      secondary: metrics.profitFactor.status,
      isBadge: true,
      badgeStatus: metrics.profitFactor.status,
      color: '#f0b429',
    },
    {
      label: "Today's P&L",
      mainValue: formatCurrency(metrics.todaysPnl.value),
      secondary: `${formatNumber(metrics.todaysPnl.tradeCount)} trade${metrics.todaysPnl.tradeCount !== 1 ? 's' : ''}`,
      isPositive: metrics.todaysPnl.value >= 0,
      color: metrics.todaysPnl.value >= 0 ? '#22c55e' : '#ef4444',
    },
  ];

  return (
    <div style={styles.container}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            ...styles.card,
            ...(hoveredCard === index ? styles.cardHover : {}),
          }}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{
            ...styles.cardGlow,
            ...(hoveredCard === index ? styles.cardGlowVisible : {}),
          }} />
          <p style={styles.label}>{card.label}</p>
          <p style={getValueStyle(parseFloat(card.mainValue))}>
            {card.mainValue}
          </p>
          <p style={styles.secondaryValue}>
            {card.isBadge ? (
              <span style={{ ...styles.badge, ...getBadgeStyle(card.badgeStatus!) }}>
                {card.secondary}
              </span>
            ) : (
              <>
                <span style={card.isPositive ? styles.positive : styles.negative}>
                  {card.isPositive ? '↑' : '↓'} {card.secondary}
                </span>
              </>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatPercentAbs(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}
