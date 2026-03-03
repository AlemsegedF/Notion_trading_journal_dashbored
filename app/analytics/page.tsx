'use client';

/**
 * Analytics Page
 * Detailed trading analytics and reports
 */

import React, { useState } from 'react';
import { User } from '../types';
import { mockUser } from '../lib/mockData';
import AppShell from '../components/AppShell';

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
    padding: '40px',
    textAlign: 'center' as const,
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 8px 0',
  },
  cardText: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
};

export default function AnalyticsPage() {
  const [user] = useState<User>(mockUser);

  const handleNewTrade = () => {
    alert('New Trade button clicked!');
  };

  return (
    <AppShell user={user} onNewTrade={handleNewTrade}>
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>Advanced trading analytics and reports</p>
      </div>

      <div style={styles.card}>
        <div style={styles.icon}>📊</div>
        <h2 style={styles.cardTitle}>Analytics Coming Soon</h2>
        <p style={styles.cardText}>
          Detailed analytics including monthly/weekly reports, setup analysis, 
          session performance, and more are being developed.
        </p>
      </div>
    </AppShell>
  );
}
