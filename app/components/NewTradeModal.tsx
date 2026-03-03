'use client';

/**
 * NewTradeModal Component
 * Modal for entering new trades
 */

import React, { useState } from 'react';
import { createTradeInNotion } from '../lib/notionData';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeCreated?: () => void;
}

const PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'ETHUSD', 'BTCUSD'];
const SESSIONS = ['London', 'NY', 'Asia'];
const DIRECTIONS = ['Long', 'Short'];
const SETUPS = ['FVG Entry', 'Order Block', 'Liquidity Sweep', 'Breaker Block', 'OTE Fib', 'Momentum Breakout'];
const OUTCOMES = ['Win', 'Loss', 'Breakeven'];

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #1c2230',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#718096',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
  body: {
    padding: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#a0aec0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
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
  fullWidth: {
    gridColumn: 'span 2',
  },
  textarea: {
    padding: '10px 12px',
    backgroundColor: '#1c2230',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#1c2230',
    border: '1px solid #2d3748',
    borderRadius: '8px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#e2e8f0',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #1c2230',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    color: '#a0aec0',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#f0b429',
    border: 'none',
    borderRadius: '8px',
    color: '#0a0d12',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    color: '#ef4444',
    fontSize: '13px',
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    color: '#22c55e',
    fontSize: '13px',
  },
};

export default function NewTradeModal({ isOpen, onClose, onTradeCreated }: NewTradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    pair: 'EURUSD',
    session: 'London',
    direction: 'Long',
    setup: 'FVG Entry',
    outcome: 'Win',
    pnl: '',
    rMultiple: '',
    sopOk: true,
    notes: '',
    tags: [] as string[],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createTradeInNotion({
        name: formData.name || `Trade ${formData.date}`,
        date: formData.date,
        pair: formData.pair,
        session: formData.session,
        direction: formData.direction,
        setup: formData.setup,
        outcome: formData.outcome,
        pnl: parseFloat(formData.pnl) || 0,
        rMultiple: parseFloat(formData.rMultiple) || 0,
        sopOk: formData.sopOk,
        whatWorked: formData.notes,
        tags: formData.tags,
      });

      if (result.success) {
        setSuccess('Trade created successfully!');
        setTimeout(() => {
          onTradeCreated?.();
          onClose();
          // Reset form
          setFormData({
            name: '',
            date: new Date().toISOString().split('T')[0],
            pair: 'EURUSD',
            session: 'London',
            direction: 'Long',
            setup: 'FVG Entry',
            outcome: 'Win',
            pnl: '',
            rMultiple: '',
            sopOk: true,
            notes: '',
            tags: [],
          });
          setSuccess(null);
        }, 1500);
      } else {
        setError(result.error || 'Failed to create trade');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div style={styles.header}>
            <h2 style={styles.title}>New Trade</h2>
            <button type="button" style={styles.closeBtn} onClick={onClose}>×</button>
          </div>

          <div style={styles.body}>
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Trade Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g., EURUSD London Session"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Pair</label>
                <select
                  style={styles.select}
                  value={formData.pair}
                  onChange={e => handleChange('pair', e.target.value)}
                >
                  {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Session</label>
                <select
                  style={styles.select}
                  value={formData.session}
                  onChange={e => handleChange('session', e.target.value)}
                >
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Direction</label>
                <select
                  style={styles.select}
                  value={formData.direction}
                  onChange={e => handleChange('direction', e.target.value)}
                >
                  {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Setup Type</label>
                <select
                  style={styles.select}
                  value={formData.setup}
                  onChange={e => handleChange('setup', e.target.value)}
                >
                  {SETUPS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Outcome</label>
                <select
                  style={styles.select}
                  value={formData.outcome}
                  onChange={e => handleChange('outcome', e.target.value)}
                >
                  {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>P&L (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  style={styles.input}
                  value={formData.pnl}
                  onChange={e => handleChange('pnl', e.target.value)}
                  placeholder="+123.45 or -50.00"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>R Multiple</label>
                <input
                  type="number"
                  step="0.01"
                  style={styles.input}
                  value={formData.rMultiple}
                  onChange={e => handleChange('rMultiple', e.target.value)}
                  placeholder="+2.5 or -1.0"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>SOP Followed</label>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={formData.sopOk}
                    onChange={e => handleChange('sopOk', e.target.checked)}
                    id="sopOk"
                  />
                  <label htmlFor="sopOk" style={styles.checkboxLabel}>
                    Yes, followed my trading plan
                  </label>
                </div>
              </div>

              <div style={{ ...styles.field, ...styles.fullWidth }}>
                <label style={styles.label}>Notes / Review</label>
                <textarea
                  style={styles.textarea}
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder="What worked? What to improve?"
                />
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
