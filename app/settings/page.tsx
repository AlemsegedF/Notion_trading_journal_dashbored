'use client';

/**
 * Settings Page
 * Application settings and configuration
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { mockUser } from '../lib/mockData';
import AppShell from '../components/AppShell';

interface AppSettings {
  currency: string;
  riskPerTrade: number;
  startingCapital: number;
  theme: 'dark' | 'light';
  notifications: boolean;
  compactMode: boolean;
}

const defaultSettings: AppSettings = {
  currency: 'USD',
  riskPerTrade: 1,
  startingCapital: 50000,
  theme: 'dark',
  notifications: true,
  compactMode: false,
};

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '24px',
  },
  cardFull: {
    gridColumn: 'span 2',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 20px 0',
  },
  field: {
    marginBottom: '16px',
  },
  fieldLast: {
    marginBottom: 0,
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: '#a0aec0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#1c2230',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#1c2230',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#1c2230',
    border: '1px solid #2d3748',
    borderRadius: '8px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#e2e8f0',
    cursor: 'pointer',
    flex: 1,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #1c2230',
  },
  infoRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0 0 0',
    borderBottom: 'none',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#a0aec0',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#e2e8f0',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#f0b429',
    border: 'none',
    borderRadius: '8px',
    color: '#0a0d12',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    color: '#a0aec0',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  successMessage: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    color: '#22c55e',
    fontSize: '14px',
  },
  dangerZone: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #1c2230',
  },
  dangerTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#ef4444',
    margin: '0 0 12px 0',
  },
  dangerButton: {
    padding: '10px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default function SettingsPage() {
  const [user] = useState<User>(mockUser);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tradejournal_settings');
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('tradejournal_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default?')) {
      setSettings(defaultSettings);
      localStorage.removeItem('tradejournal_settings');
    }
  };

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell user={user} onTradeCreated={() => {}}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Configure your account and preferences</p>
      </div>

      {saved && (
        <div style={styles.successMessage}>
          Settings saved successfully!
        </div>
      )}

      <div style={styles.grid}>
        {/* Trading Settings */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Trading Settings</h2>

          <div style={styles.field}>
            <label style={styles.label}>Account Currency</label>
            <select
              style={styles.select}
              value={settings.currency}
              onChange={e => handleChange('currency', e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Starting Capital</label>
            <input
              type="number"
              style={styles.input}
              value={settings.startingCapital}
              onChange={e => handleChange('startingCapital', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={{ ...styles.field, ...styles.fieldLast }}>
            <label style={styles.label}>Risk Per Trade (%)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              style={styles.input}
              value={settings.riskPerTrade}
              onChange={e => handleChange('riskPerTrade', parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Display Settings */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Display</h2>

          <div style={styles.field}>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={settings.compactMode}
                onChange={e => handleChange('compactMode', e.target.checked)}
                id="compactMode"
              />
              <label htmlFor="compactMode" style={styles.checkboxLabel}>
                Compact Mode (smaller cards)
              </label>
            </div>
          </div>

          <div style={{ ...styles.field, ...styles.fieldLast }}>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={settings.notifications}
                onChange={e => handleChange('notifications', e.target.checked)}
                id="notifications"
              />
              <label htmlFor="notifications" style={styles.checkboxLabel}>
                Enable Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Account</h2>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Name</span>
            <span style={styles.infoValue}>{user.name}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{user.email}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Plan</span>
            <span style={styles.infoValue}>{user.plan}</span>
          </div>

          <div style={{ ...styles.infoRow, ...styles.infoRowLast }}>
            <span style={styles.infoLabel}>Data Source</span>
            <span style={styles.infoValue}>Notion Database</span>
          </div>
        </div>

        {/* Data Management */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Data</h2>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Cache</span>
            <button
              style={{ ...styles.dangerButton, fontSize: '12px', padding: '6px 12px' }}
              onClick={() => {
                localStorage.removeItem('tradejournal_settings');
                alert('Cache cleared!');
              }}
            >
              Clear Cache
            </button>
          </div>

          <div style={{ ...styles.infoRow, ...styles.infoRowLast }}>
            <span style={styles.infoLabel}>Export</span>
            <button
              style={{ ...styles.saveButton, fontSize: '12px', padding: '6px 12px' }}
              onClick={() => alert('Export feature coming soon!')}
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.saveButton} onClick={handleSave}>
          Save Settings
        </button>
        <button style={styles.resetButton} onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </AppShell>
  );
}
