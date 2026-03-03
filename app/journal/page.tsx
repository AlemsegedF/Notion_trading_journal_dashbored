'use client';

/**
 * Journal Page
 * Full trade journal with all trades listed
 */

import React, { useState } from 'react';
import { User, Trade } from '../types';
import { mockUser, mockTrades } from '../lib/mockData';
import AppShell from '../components/AppShell';
import { formatCurrency, formatR, formatDateTime, formatShortDate, getValueColor } from '../lib/utils';

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
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#718096',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    backgroundColor: '#1c2230',
    borderBottom: '1px solid #1c2230',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#e2e8f0',
    borderBottom: '1px solid #1c2230',
  },
  instrument: {
    fontWeight: 600,
  },
  outcome: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
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
};

export default function JournalPage() {
  const [user] = useState<User>(mockUser);
  const [trades] = useState<Trade[]>(mockTrades);

  const handleNewTrade = () => {
    alert('New Trade button clicked!');
  };

  // Sort trades by exit time descending
  const sortedTrades = trades.slice().sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime());

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'WIN':
        return styles.outcomeWin;
      case 'LOSS':
        return styles.outcomeLoss;
      default:
        return styles.outcomeBreakeven;
    }
  };

  return (
    <AppShell user={user} onNewTrade={handleNewTrade}>
      <div style={styles.header}>
        <h1 style={styles.title}>Trade Journal</h1>
        <p style={styles.subtitle}>View and manage all your trades</p>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Instrument</th>
              <th style={styles.th}>Direction</th>
              <th style={styles.th}>Entry</th>
              <th style={styles.th}>Exit</th>
              <th style={styles.th}>Outcome</th>
              <th style={styles.th}>P&L ($)</th>
              <th style={styles.th}>R-Multiple</th>
              <th style={styles.th}>Strategy</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => (
              <tr key={trade.id}>
                <td style={styles.td}>{formatShortDate(trade.exitTime)}</td>
                <td style={{ ...styles.td, ...styles.instrument }}>{trade.instrument}</td>
                <td style={styles.td}>{trade.direction}</td>
                <td style={{ ...styles.td, fontFamily: 'JetBrains Mono' }}>
                  {trade.entryPrice.toFixed(4)}
                </td>
                <td style={{ ...styles.td, fontFamily: 'JetBrains Mono' }}>
                  {trade.exitPrice.toFixed(4)}
                </td>
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
                <td style={styles.td}>{trade.tags[0] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
