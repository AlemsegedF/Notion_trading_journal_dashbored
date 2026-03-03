'use client';

/**
 * DashboardHeader Component
 * Shows welcome message, date, and user info
 */

import React from 'react';
import { User } from '../types';
import { formatFullDate, getFirstName } from '../lib/utils';

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  container: {
    marginBottom: '24px',
  },
  date: {
    fontSize: '13px',
    color: '#718096',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  greeting: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em',
  },
  subtext: {
    fontSize: '14px',
    color: '#a0aec0',
    margin: 0,
  },
  tradeCount: {
    color: '#f0b429',
    fontWeight: 600,
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  user: User;
  todayTradeCount: number;
}

export default function DashboardHeader({ user, todayTradeCount }: DashboardHeaderProps) {
  const today = new Date();
  const firstName = getFirstName(user.name);
  
  return (
    <div style={styles.container}>
      <p style={styles.date}>{formatFullDate(today)}</p>
      <h1 style={styles.greeting}>Welcome back, {firstName}!</h1>
      <p style={styles.subtext}>
        You have <span style={styles.tradeCount}>{todayTradeCount} trade{todayTradeCount !== 1 ? 's' : ''}</span> today. Great job!
      </p>
    </div>
  );
}
