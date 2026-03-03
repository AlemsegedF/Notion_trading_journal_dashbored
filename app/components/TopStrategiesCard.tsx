'use client';

/**
 * TopStrategiesCard Component - Modern with hover effects
 * Displays ranked list of top performing strategies
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Strategy } from '../types';
import { formatCurrency, getValueColor } from '../lib/utils';

const styles = {
  card: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    padding: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
  },
  viewAllLinkHover: {
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
  },
  strategyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  strategyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    borderRadius: '12px',
    border: '1px solid transparent',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  strategyItemHover: {
    backgroundColor: 'rgba(28, 34, 48, 0.8)',
    borderColor: 'rgba(240, 180, 41, 0.2)',
    transform: 'translateX(4px)',
  },
  rank: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  rank1: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)',
    color: '#f59e0b',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
  },
  rank2: {
    background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.1) 100%)',
    color: '#9ca3af',
  },
  rank3: {
    background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.3) 0%, rgba(180, 83, 9, 0.1) 100%)',
    color: '#b45309',
  },
  rankOther: {
    backgroundColor: 'rgba(37, 45, 61, 0.8)',
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
    fontWeight: 500,
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

interface TopStrategiesCardProps {
  strategies: Strategy[];
  maxStrategies?: number;
}

export default function TopStrategiesCard({ strategies, maxStrategies = 4 }: TopStrategiesCardProps) {
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null);
  const [linkHovered, setLinkHovered] = useState(false);

  const topStrategies = strategies
    .slice()
    .sort((a, b) => b.totalPnlCurrency - a.totalPnlCurrency)
    .slice(0, maxStrategies);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return styles.rank1;
      case 2: return styles.rank2;
      case 3: return styles.rank3;
      default: return styles.rankOther;
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
                style={{
                  ...styles.strategyItem,
                  ...(hoveredStrategy === strategy.id ? styles.strategyItemHover : {}),
                }}
                onMouseEnter={() => setHoveredStrategy(strategy.id)}
                onMouseLeave={() => setHoveredStrategy(null)}
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
