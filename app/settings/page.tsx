'use client';

/**
 * Settings Page
 * Application settings and configuration
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
  section: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 16px 0',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #1c2230',
  },
  settingRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0 0 0',
  },
  settingLabel: {
    fontSize: '14px',
    color: '#e2e8f0',
  },
  settingValue: {
    fontSize: '14px',
    color: '#718096',
  },
};

export default function SettingsPage() {
  const [user] = useState<User>(mockUser);

  const handleNewTrade = () => {
    alert('New Trade button clicked!');
  };

  return (
    <AppShell user={user} onNewTrade={handleNewTrade}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Configure your account and preferences</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Account</h2>
        <div style={styles.settingRow}>
          <span style={styles.settingLabel}>Name</span>
          <span style={styles.settingValue}>{user.name}</span>
        </div>
        <div style={styles.settingRow}>
          <span style={styles.settingLabel}>Email</span>
          <span style={styles.settingValue}>{user.email}</span>
        </div>
        <div style={styles.settingRowLast}>
          <span style={styles.settingLabel}>Plan</span>
          <span style={styles.settingValue}>{user.plan}</span>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Data Source</h2>
        <div style={styles.settingRowLast}>
          <span style={styles.settingLabel}>Current Source</span>
          <span style={styles.settingValue}>Mock Data (Demo)</span>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Preferences</h2>
        <div style={styles.settingRow}>
          <span style={styles.settingLabel}>Currency</span>
          <span style={styles.settingValue}>USD ($)</span>
        </div>
        <div style={styles.settingRowLast}>
          <span style={styles.settingLabel}>Theme</span>
          <span style={styles.settingValue}>Dark</span>
        </div>
      </div>
    </AppShell>
  );
}
