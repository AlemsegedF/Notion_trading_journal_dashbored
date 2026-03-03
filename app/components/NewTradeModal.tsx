'use client';

/**
 * NewTradeModal Component - Fixed for Notion API
 * Modal for entering new trades with proper validation
 */

import React, { useState } from 'react';
import { createTradeInNotion } from '../lib/notionData';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeCreated?: () => void;
}

const PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'ETHUSD', 'BTCUSD', 'GBPJPY', 'AUDUSD', 'USDCAD'];
const SESSIONS = ['London', 'NY', 'Asia', 'Overlap'];
const DIRECTIONS = ['Long', 'Short'];
const SETUPS = ['FVG Entry', 'Order Block', 'Liquidity Sweep', 'Breaker Block', 'OTE Fib', 'Momentum Breakout', 'Support Bounce', 'Trend Following'];
const OUTCOMES = ['Win', 'Loss', 'Breakeven'];
const HTF_BIASES = ['Bullish', 'Bearish', 'Neutral'];
const PHASES = ['Demo', 'Evaluation', 'Live'];
const EXEC_GRADES = ['A+', 'A', 'B', 'C', 'D'];

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto' as const,
    animation: 'fadeInScale 0.3s ease-out',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    borderBottom: '1px solid rgba(28, 34, 48, 0.8)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: 0,
  },
  closeBtn: {
    background: 'rgba(28, 34, 48, 0.5)',
    border: 'none',
    borderRadius: '10px',
    color: '#9ca3af',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'all 0.2s ease',
  },
  body: {
    padding: '28px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  fieldFull: {
    gridColumn: 'span 3',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  input: {
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
  textarea: {
    padding: '12px 14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
    transition: 'all 0.2s ease',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#f0b429',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#e2e8f0',
    cursor: 'pointer',
    flex: 1,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px 28px',
    borderTop: '1px solid rgba(28, 34, 48, 0.8)',
  },
  cancelBtn: {
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
  submitBtn: {
    padding: '12px 28px',
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
  error: {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '20px',
    color: '#ef4444',
    fontSize: '13px',
  },
  success: {
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '20px',
    color: '#22c55e',
    fontSize: '13px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#f0b429',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '12px',
    marginTop: '8px',
    gridColumn: 'span 3',
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
    htfBias: 'Bullish',
    phase: 'Demo',
    outcome: 'Win',
    pnl: '',
    rMultiple: '',
    rrPlanned: '2',
    execGrade: 'A',
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
      // Prepare data for Notion API with ALL required fields
      const tradeData = {
        name: formData.name || `Trade ${formData.date}`,
        date: formData.date,
        pair: formData.pair,
        session: formData.session,
        direction: formData.direction,
        setup: formData.setup,
        htfBias: formData.htfBias,
        phase: formData.phase,
        outcome: formData.outcome,
        pnl: parseFloat(formData.pnl) || 0,
        rMultiple: parseFloat(formData.rMultiple) || 0,
        rrPlanned: parseFloat(formData.rrPlanned) || 2,
        execGrade: formData.execGrade,
        sopOk: formData.sopOk,
        whatWorked: formData.outcome === 'Win' ? formData.notes : '',
        whatToImprove: formData.outcome !== 'Win' ? formData.notes : '',
        sopViolation: formData.sopOk ? '' : formData.notes,
        tags: [formData.setup, formData.direction, formData.pair],
      };

      console.log('Creating trade with data:', tradeData);

      const result = await createTradeInNotion(tradeData);

      if (result.success) {
        setSuccess('✓ Trade created successfully!');
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
            htfBias: 'Bullish',
            phase: 'Demo',
            outcome: 'Win',
            pnl: '',
            rMultiple: '',
            rrPlanned: '2',
            execGrade: 'A',
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
      console.error('Error creating trade:', err);
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
            <h2 style={styles.title}>📝 New Trade Entry</h2>
            <button type="button" style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          <div style={styles.body}>
            {error && <div style={styles.error}>⚠️ {error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <div style={styles.sectionTitle}>Trade Details</div>
            <div style={styles.grid}>
              <div style={{ ...styles.field, ...styles.fieldFull }}>
                <label style={styles.label}>Trade Name / Description</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g., EURUSD London Session Breakout"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Pair *</label>
                <select
                  style={styles.select}
                  value={formData.pair}
                  onChange={e => handleChange('pair', e.target.value)}
                >
                  {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Session *</label>
                <select
                  style={styles.select}
                  value={formData.session}
                  onChange={e => handleChange('session', e.target.value)}
                >
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Direction *</label>
                <select
                  style={styles.select}
                  value={formData.direction}
                  onChange={e => handleChange('direction', e.target.value)}
                >
                  {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Setup Type *</label>
                <select
                  style={styles.select}
                  value={formData.setup}
                  onChange={e => handleChange('setup', e.target.value)}
                >
                  {SETUPS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>HTF Bias *</label>
                <select
                  style={styles.select}
                  value={formData.htfBias}
                  onChange={e => handleChange('htfBias', e.target.value)}
                >
                  {HTF_BIASES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.sectionTitle}>Performance</div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Outcome *</label>
                <select
                  style={styles.select}
                  value={formData.outcome}
                  onChange={e => handleChange('outcome', e.target.value)}
                >
                  {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>P&L (USD) *</label>
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
                <label style={styles.label}>R Multiple *</label>
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
                <label style={styles.label}>Planned R:R</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={formData.rrPlanned}
                  onChange={e => handleChange('rrPlanned', e.target.value)}
                  placeholder="2.0"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phase *</label>
                <select
                  style={styles.select}
                  value={formData.phase}
                  onChange={e => handleChange('phase', e.target.value)}
                >
                  {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Exec Grade</label>
                <select
                  style={styles.select}
                  value={formData.execGrade}
                  onChange={e => handleChange('execGrade', e.target.value)}
                >
                  {EXEC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.field}>
                <div style={styles.checkboxGroup} onClick={() => handleChange('sopOk', !formData.sopOk)}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={formData.sopOk}
                    onChange={() => {}}
                    id="sopOk"
                  />
                  <label htmlFor="sopOk" style={styles.checkboxLabel}>
                    ✅ Followed Trading Plan (SOP)
                  </label>
                </div>
              </div>

              <div style={{ ...styles.field, ...styles.fieldFull }}>
                <label style={styles.label}>Notes / Review</label>
                <textarea
                  style={styles.textarea}
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder={formData.outcome === 'Win' 
                    ? "What worked well? Key takeaways from this winning trade..." 
                    : "What went wrong? Lessons learned from this trade..."}
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
                transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Saving...' : '💾 Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
