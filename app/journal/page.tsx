'use client';

/**
 * Journal Page - Modern with optimized loading
 * Full trade journal with all trades listed
 */

import React, { useState, useMemo } from 'react';
import { User, Trade } from '../types';
import { mockUser } from '../lib/mockData';
import { useTrades } from '../hooks/useTrades';
import AppShell from '../components/AppShell';
import { SkeletonTable } from '../components/Skeleton';
import { formatCurrency, formatR, formatShortDate, getValueColor } from '../lib/utils';

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
  card: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    overflow: 'hidden',
    animation: 'fadeIn 0.5s ease-out',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '16px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    borderBottom: '1px solid rgba(28, 34, 48, 0.8)',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#e2e8f0',
    borderBottom: '1px solid rgba(28, 34, 48, 0.5)',
    transition: 'background-color 0.15s ease',
  },
  tr: {
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  trHover: {
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
  },
  instrument: {
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  outcomeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  outcome: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  },
  outcomeWin: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
  },
  outcomeLoss: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  outcomeBreakeven: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    color: '#6b7280',
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

export default function JournalPage() {
  const [user] = useState<User>(mockUser);
  const { trades, isLoading, usingMockData, refresh } = useTrades();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const sortedTrades = useMemo(() => 
    trades.slice().sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime()),
  [trades]);

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'WIN': return styles.outcomeWin;
      case 'LOSS': return styles.outcomeLoss;
      default: return styles.outcomeBreakeven;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'WIN': return '#22c55e';
      case 'LOSS': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading && trades.length === 0) {
    return (
      <AppShell user={user}>
        <div style={styles.header}>
          <h1 style={styles.title}>Trade Journal</h1>
          <p style={styles.subtitle}>View and manage all your trades</p>
        </div>
        <SkeletonTable rows={8} />
      </AppShell>
    );
  }

  return (
    <AppShell user={user} onTradeCreated={refresh}>
      <div style={styles.header}>
        <h1 style={styles.title}>Trade Journal</h1>
        <p style={styles.subtitle}>View and manage all your trades</p>
      </div>

      {usingMockData && (
        <div style={styles.demoBanner}>
          <span style={styles.demoIcon}>⚡</span>
          <p style={styles.demoText}>Demo Mode: Add NOTION_TOKEN to use real data</p>
        </div>
      )}

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Instrument</th>
              <th style={styles.th}>Direction</th>
              <th style={styles.th}>Setup</th>
              <th style={styles.th}>Session</th>
              <th style={styles.th}>Outcome</th>
              <th style={styles.th}>P&L ($)</th>
              <th style={styles.th}>R-Multiple</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => (
              <tr 
                key={trade.id}
                style={{
                  ...styles.tr,
                  ...(hoveredRow === trade.id ? styles.trHover : {}),
                }}
                onMouseEnter={() => setHoveredRow(trade.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td style={styles.td}>{formatShortDate(trade.exitTime)}</td>
                <td style={{ ...styles.td, ...styles.instrument }}>
                  <span style={{ ...styles.outcomeDot, backgroundColor: getOutcomeColor(trade.outcome) }} />
                  {trade.instrument}
                </td>
                <td style={styles.td}>{trade.direction}</td>
                <td style={styles.td}>{trade.setup || '-'}</td>
                <td style={styles.td}>{trade.session || '-'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.outcome, ...getOutcomeStyle(trade.outcome) }}>
                    {trade.outcome}
                  </span>
                </td>
                <td style={{ ...styles.td, fontFamily: 'JetBrains Mono', color: getValueColor(trade.pnlCurrency) }}>
                  {formatCurrency(trade.pnlCurrency)}
                </td>
                <td style={{ ...styles.td, fontFamily: 'JetBrains Mono', color: getValueColor(trade.pnlR) }}>
                  {formatR(trade.pnlR)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
