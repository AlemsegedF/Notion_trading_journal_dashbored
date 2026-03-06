'use client';

/**
 * Settings Page - Modern with professional styling
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    animation: 'fadeIn 0.5s ease-out',
  },
  card: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.3s ease',
  },
  cardFull: {
    gridColumn: 'span 2',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 24px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  field: {
    marginBottom: '20px',
  },
  fieldLast: {
    marginBottom: 0,
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  checkbox: {
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    accentColor: '#f0b429',
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
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid rgba(28, 34, 48, 0.8)',
  },
  infoRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0 0 0',
    borderBottom: 'none',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  saveButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #f0b429 0%, #f59e0b 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#0a0d12',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(240, 180, 41, 0.3)',
  },
  resetButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '10px',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  successMessage: {
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '20px',
    color: '#22c55e',
    fontSize: '14px',
    fontWeight: 500,
    animation: 'fadeIn 0.3s ease-out',
  },
  dangerZone: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(239, 68, 68, 0.3)',
  },
  dangerTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#ef4444',
    margin: '0 0 16px 0',
  },
  dangerButton: {
    padding: '10px 18px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  sectionIcon: {
    width: '24px',
    height: '24px',
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
};

export default function SettingsPage() {
  const [user] = useState<User>(mockUser);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

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
          ✓ Settings saved successfully!
        </div>
      )}

      <div style={styles.grid}>
        {/* Trading Settings */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span style={styles.sectionIcon}>💰</span>
            Trading Settings
          </h2>

          <div style={styles.field}>
            <label style={styles.label}>Account Currency</label>
            <select
              style={styles.select}
              value={settings.currency}
              onChange={e => handleChange('currency', e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>
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
          <h2 style={styles.cardTitle}>
            <span style={styles.sectionIcon}>🎨</span>
            Display
          </h2>

          <div style={styles.field}>
            <div 
              style={styles.checkboxGroup}
              onClick={() => handleChange('compactMode', !settings.compactMode)}
            >
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={settings.compactMode}
                onChange={() => {}}
                id="compactMode"
              />
              <label htmlFor="compactMode" style={styles.checkboxLabel}>
                Compact Mode (smaller cards)
              </label>
            </div>
          </div>

          <div style={{ ...styles.field, ...styles.fieldLast }}>
            <div 
              style={styles.checkboxGroup}
              onClick={() => handleChange('notifications', !settings.notifications)}
            >
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={settings.notifications}
                onChange={() => {}}
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
          <h2 style={styles.cardTitle}>
            <span style={styles.sectionIcon}>👤</span>
            Account
          </h2>

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
            <span style={{ ...styles.infoValue, color: '#f0b429' }}>{user.plan}</span>
          </div>

          <div style={{ ...styles.infoRow, ...styles.infoRowLast }}>
            <span style={styles.infoLabel}>Data Source</span>
            <span style={styles.infoValue}>Notion Database</span>
          </div>
        </div>

        {/* Data Management */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span style={styles.sectionIcon}>💾</span>
            Data
          </h2>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Cache</span>
            <button
              style={{ ...styles.dangerButton, fontSize: '12px', padding: '8px 14px' }}
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
              style={{ ...styles.saveButton, fontSize: '12px', padding: '8px 14px' }}
              onClick={() => {
                const data = {
                  settings: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user_settings') || '{}') : {},
                  strategies: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('trading_strategies') || '[]') : [],
                  checklist: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('trading_checklist') || '[]') : [],
                  strategyChecklists: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('trading_strategy_checklists') || '{}') : {},
                  exportDate: new Date().toISOString(),
                  version: '1.0'
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `trading-journal-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('Data exported successfully!');
              }}
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
