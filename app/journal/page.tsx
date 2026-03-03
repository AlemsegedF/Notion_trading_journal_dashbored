'use client';

/**
 * Journal Page
 * Full trade journal with all trades from Notion
 */

import React, { useState, useEffect } from 'react';
import { User, Trade } from '../types';
import { mockUser } from '../lib/mockData';
import { fetchTradesFromNotion, isNotionConfigured } from '../lib/notionData';
import AppShell from '../components/AppShell';
import { formatCurrency, formatR, formatShortDate, getValueColor } from '../lib/utils';

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
  banner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bannerIcon: {
    fontSize: '18px',
  },
  bannerText: {
    fontSize: '13px',
    color: '#f59e0b',
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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        const notionReady = await isNotionConfigured();

        if (!notionReady) {
          setUsingMockData(true);
          // Import mock data dynamically
          const { mockTrades } = await import('../lib/mockData');
          setTrades(mockTrades);
        } else {
          const realTrades = await fetchTradesFromNotion();
          setTrades(realTrades);
          setUsingMockData(false);
        }
      } catch (error) {
        console.error('Error loading trades:', error);
        // Fallback to mock data
        const { mockTrades } = await import('../lib/mockData');
        setTrades(mockTrades);
        setUsingMockData(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNewTrade = () => {
    alert('New Trade functionality coming soon!');
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

      {usingMockData && (
        <div style={styles.banner}>
          <span style={styles.bannerIcon}>⚠️</span>
          <p style={styles.bannerText}>
            Using demo data. Connect your Notion database to see real trades.
          </p>
        </div>
      )}

      <div style={styles.card}>
        {isLoading ? (
          <div style={styles.loading}>Loading trades...</div>
        ) : sortedTrades.length === 0 ? (
          <div style={styles.empty}>No trades found. Add your first trade!</div>
        ) : (
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
                <tr key={trade.id}>
                  <td style={styles.td}>{formatShortDate(trade.exitTime)}</td>
                  <td style={{ ...styles.td, ...styles.instrument }}>{trade.instrument}</td>
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
        )}
      </div>
    </AppShell>
  );
}
