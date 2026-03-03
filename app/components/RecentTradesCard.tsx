'use client';

/**
 * RecentTradesCard Component
 * Displays the last 5 trades with instrument, date, P&L, and R-multiple
 */

import React from 'react';
import Link from 'next/link';
import { Trade } from '../types';
import { formatCurrency, formatR, formatDateTime, getValueColor } from '../lib/utils';

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
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
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background-color 0.15s',
  },
  tradeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  tradeItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 12px',
    backgroundColor: '#1c2230',
    borderRadius: '8px',
    marginBottom: '8px',
    transition: 'background-color 0.15s',
  },
  tradeInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
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
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: '#718096',
    fontSize: '14px',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

interface RecentTradesCardProps {
  trades: Trade[];
  maxTrades?: number;
}

export default function RecentTradesCard({ trades, maxTrades = 5 }: RecentTradesCardProps) {
  // Sort by exit time descending and take most recent
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
          style={styles.viewAllLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0b42922';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
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
          {recentTrades.map((trade) => (
            <div 
              key={trade.id} 
              style={styles.tradeItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#252d3d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1c2230';
              }}
            >
              <div style={styles.tradeInfo}>
                <span style={styles.instrument}>{trade.instrument}</span>
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
