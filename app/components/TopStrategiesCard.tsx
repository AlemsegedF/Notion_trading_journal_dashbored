'use client';

/**
 * TopStrategiesCard Component
 * Displays ranked list of top performing strategies
 */

import React from 'react';
import Link from 'next/link';
import { Strategy } from '../types';
import { formatCurrency, getValueColor } from '../lib/utils';

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
  strategyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  strategyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px',
    backgroundColor: '#1c2230',
    borderRadius: '10px',
    transition: 'background-color 0.15s',
  },
  rank: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  rank1: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
  },
  rank2: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    color: '#9ca3af',
  },
  rank3: {
    backgroundColor: 'rgba(180, 83, 9, 0.2)',
    color: '#b45309',
  },
  rankOther: {
    backgroundColor: '#252d3d',
    color: '#718096',
  },
  strategyInfo: {
    flex: 1,
    minWidth: 0,
  },
  strategyName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  strategyStats: {
    fontSize: '12px',
    color: '#718096',
  },
  statHighlight: {
    color: '#a0aec0',
  },
  pnl: {
    fontSize: '15px',
    fontWeight: 600,
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

interface TopStrategiesCardProps {
  strategies: Strategy[];
  maxStrategies?: number;
}

export default function TopStrategiesCard({ strategies, maxStrategies = 4 }: TopStrategiesCardProps) {
  // Sort by total P&L descending and take top N
  const topStrategies = strategies
    .slice()
    .sort((a, b) => b.totalPnlCurrency - a.totalPnlCurrency)
    .slice(0, maxStrategies);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.rank1;
      case 2:
        return styles.rank2;
      case 3:
        return styles.rank3;
      default:
        return styles.rankOther;
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Top Strategies</h2>
          <p style={styles.subtitle}>Performance by strategy</p>
        </div>
        <Link 
          href="/strategies" 
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

      {topStrategies.length === 0 ? (
        <div style={styles.emptyState}>
          No strategies yet. Create your first strategy to start tracking!
        </div>
      ) : (
        <div style={styles.strategyList}>
          {topStrategies.map((strategy, index) => {
            const rank = index + 1;
            return (
              <div 
                key={strategy.id} 
                style={styles.strategyItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#252d3d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1c2230';
                }}
              >
                <div style={{ ...styles.rank, ...getRankStyle(rank) }}>
                  {rank}
                </div>
                <div style={styles.strategyInfo}>
                  <p style={styles.strategyName}>{strategy.name}</p>
                  <p style={styles.strategyStats}>
                    <span style={styles.statHighlight}>{strategy.totalTrades}</span> trades
                    {' • '}
                    <span style={styles.statHighlight}>{strategy.winRate}%</span> win
                  </p>
                </div>
                <span style={{ ...styles.pnl, color: getValueColor(strategy.totalPnlCurrency) }}>
                  {formatCurrency(strategy.totalPnlCurrency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
