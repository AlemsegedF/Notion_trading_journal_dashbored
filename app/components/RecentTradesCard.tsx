'use client';

/**
 * RecentTradesCard Component - Modern with hover effects
 * Displays the last 5 trades with instrument, date, P&L, and R-multiple
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Trade } from '../types';
import { formatCurrency, formatR, formatDateTime, getValueColor } from '../lib/utils';

const styles = {
  card: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    padding: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardHover: {
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  titleSection: {},
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },
  viewAllLink: {
    fontSize: '13px',
    color: '#f0b429',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
  },
  viewAllLinkHover: {
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
  },
  tradeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  tradeItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    borderRadius: '12px',
    border: '1px solid transparent',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  tradeItemHover: {
    backgroundColor: 'rgba(28, 34, 48, 0.8)',
    borderColor: 'rgba(240, 180, 41, 0.2)',
    transform: 'translateX(4px)',
  },
  tradeInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
  },
  instrument: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  date: {
    fontSize: '12px',
    color: '#718096',
  },
  tradeMetrics: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '2px',
  },
  pnl: {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
  rMultiple: {
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', monospace",
  },
  outcomeBadge: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: '#718096',
    fontSize: '14px',
  },
};

interface RecentTradesCardProps {
  trades: Trade[];
  maxTrades?: number;
}

export default function RecentTradesCard({ trades, maxTrades = 5 }: RecentTradesCardProps) {
  const [hoveredTrade, setHoveredTrade] = useState<string | null>(null);
  const [linkHovered, setLinkHovered] = useState(false);

  const recentTrades = trades
    .slice()
    .sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime())
    .slice(0, maxTrades);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Recent Trades</h2>
          <p style={styles.subtitle}>Your last {maxTrades} trades</p>
        </div>
        <Link 
          href="/journal" 
          style={{
            ...styles.viewAllLink,
            ...(linkHovered ? styles.viewAllLinkHover : {}),
          }}
          onMouseEnter={() => setLinkHovered(true)}
          onMouseLeave={() => setLinkHovered(false)}
        >
          View All →
        </Link>
      </div>

      {recentTrades.length === 0 ? (
        <div style={styles.emptyState}>
          No trades yet. Start by adding your first trade!
        </div>
      ) : (
        <div style={styles.tradeList}>
          {recentTrades.map((trade, index) => (
            <div 
              key={trade.id} 
              style={{
                ...styles.tradeItem,
                ...(hoveredTrade === trade.id ? styles.tradeItemHover : {}),
                animationDelay: `${index * 0.05}s`,
              }}
              onMouseEnter={() => setHoveredTrade(trade.id)}
              onMouseLeave={() => setHoveredTrade(null)}
            >
              <div style={styles.tradeInfo}>
                <span style={styles.instrument}>
                  <span style={{
                    ...styles.outcomeBadge,
                    backgroundColor: trade.outcome === 'WIN' ? '#22c55e' : trade.outcome === 'LOSS' ? '#ef4444' : '#6b7280',
                  }} />
                  {trade.instrument}
                </span>
                <span style={styles.date}>{formatDateTime(trade.exitTime)}</span>
              </div>
              <div style={styles.tradeMetrics}>
                <span style={{ ...styles.pnl, color: getValueColor(trade.pnlCurrency) }}>
                  {formatCurrency(trade.pnlCurrency)}
                </span>
                <span style={{ ...styles.rMultiple, color: getValueColor(trade.pnlR) }}>
                  {formatR(trade.pnlR)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
