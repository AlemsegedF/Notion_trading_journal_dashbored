'use client';

/**
 * NewTradeModal Component - Complete Trading Journal Entry
 * Matches the comprehensive trade log template
 */

import React, { useState, useEffect } from 'react';
import { createTradeInNotion } from '../lib/notionData';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeCreated?: () => void;
}

const PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'XAU/USD', 'US30', 'ETH/USD', 'BTC/USD', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP'];
const SESSIONS = ['London Open (15:00-17:00 HKT)', 'NY Open (20:30-23:00 HKT)', 'London-NY Overlap', 'Asia', 'Outside Window (Violation)'];
const DIRECTIONS = ['Long 📈', 'Short 📉'];
const SETUPS = ['FVG Entry', 'Order Block Entry', 'Liquidity Sweep + MSS', 'Breaker Block', 'OTE (62-79% Fib)', 'Momentum Breakout', 'Support Bounce', 'Trend Following'];
const OUTCOMES = ['Win', 'Loss', 'Breakeven'];
const HTF_BIASES = ['Bullish', 'Bearish', 'Neutral'];
const DXY_DIRECTIONS = ['Up', 'Down', 'Neutral'];
const PHASES = ['Demo', 'Evaluation', 'Live'];
const EXEC_GRADES = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1a1f2e 100%)',
    border: '1px solid rgba(240, 180, 41, 0.2)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '95vh',
    overflow: 'auto' as const,
    animation: 'fadeInScale 0.3s ease-out',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(240, 180, 41, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    borderBottom: '1px solid rgba(240, 180, 41, 0.2)',
    background: 'linear-gradient(90deg, rgba(240, 180, 41, 0.1) 0%, transparent 100%)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#f0b429',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeBtn: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '8px 14px',
    transition: 'all 0.2s ease',
  },
  body: {
    padding: '28px',
  },
  section: {
    marginBottom: '28px',
    padding: '20px',
    backgroundColor: 'rgba(28, 34, 48, 0.4)',
    borderRadius: '14px',
    border: '1px solid rgba(28, 34, 48, 0.6)',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#f0b429',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
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
    letterSpacing: '0.06em',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: 'rgba(15, 19, 24, 0.8)',
    border: '1px solid rgba(240, 180, 41, 0.2)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  select: {
    padding: '12px 14px',
    backgroundColor: 'rgba(15, 19, 24, 0.8)',
    border: '1px solid rgba(240, 180, 41, 0.2)',
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
    backgroundColor: 'rgba(15, 19, 24, 0.8)',
    border: '1px solid rgba(240, 180, 41, 0.2)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '100px',
    transition: 'all 0.2s ease',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '10px',
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: 'rgba(15, 19, 24, 0.6)',
    border: '1px solid rgba(240, 180, 41, 0.15)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkboxItemChecked: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#22c55e',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#e2e8f0',
    cursor: 'pointer',
    flex: 1,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px 28px',
    borderTop: '1px solid rgba(240, 180, 41, 0.2)',
    background: 'linear-gradient(90deg, transparent 0%, rgba(240, 180, 41, 0.05) 100%)',
  },
  cancelBtn: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #f0b429 0%, #f59e0b 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#0a0d12',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(240, 180, 41, 0.4)',
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
  calcBox: {
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
    border: '1px solid rgba(240, 180, 41, 0.2)',
    borderRadius: '10px',
    padding: '12px',
    marginTop: '8px',
  },
  calcText: {
    fontSize: '12px',
    color: '#f0b429',
    fontFamily: "'JetBrains Mono', monospace",
  },
};

export default function NewTradeModal({ isOpen, onClose, onTradeCreated }: NewTradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Trade identification
  const [tradeNum, setTradeNum] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  
  // Trade setup
  const [pair, setPair] = useState('EUR/USD');
  const [session, setSession] = useState('London Open (15:00-17:00 HKT)');
  const [direction, setDirection] = useState('Long 📈');
  const [setupType, setSetupType] = useState('FVG Entry');
  const [htfBias, setHtfBias] = useState('Bullish');
  const [dxyDirection, setDxyDirection] = useState('Up');
  
  // 5-Point Lock
  const [point1, setPoint1] = useState(false);
  const [point2, setPoint2] = useState(false);
  const [point3, setPoint3] = useState(false);
  const [point4, setPoint4] = useState(false);
  const [point5, setPoint5] = useState(false);
  
  // Entry/Exit details
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit1, setTakeProfit1] = useState('');
  const [takeProfit2, setTakeProfit2] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [riskPercent, setRiskPercent] = useState('1');
  const [riskDollar, setRiskDollar] = useState('');
  const [rrPlanned, setRrPlanned] = useState('2');
  
  // Outcome
  const [outcome, setOutcome] = useState('Win');
  const [exitPrice, setExitPrice] = useState('');
  const [pnl, setPnl] = useState('');
  const [rMultiple, setRMultiple] = useState('');
  const [mfe, setMfe] = useState('');
  const [mae, setMae] = useState('');
  
  // Review
  const [execGrade, setExecGrade] = useState('8');
  const [sopFollowed, setSopFollowed] = useState(true);
  const [violation, setViolation] = useState('');
  const [marketDid, setMarketDid] = useState('');
  const [didWell, setDidWell] = useState('');
  const [improve, setImprove] = useState('');
  const [chartNote, setChartNote] = useState('');
  const [phase, setPhase] = useState('Demo');

  // Auto-calculate risk dollar when entry/stop/lot change
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const lot = parseFloat(lotSize);
    
    if (entry && stop && lot) {
      const pipValue = pair.includes('JPY') ? 0.01 : 0.0001;
      const stopPips = Math.abs(entry - stop) / pipValue;
      const risk = stopPips * lot * 10; // Simplified calculation
      setRiskDollar(risk.toFixed(2));
    }
  }, [entryPrice, stopLoss, lotSize, pair]);

  // Auto-calculate R multiple when P&L and risk change
  useEffect(() => {
    const profit = parseFloat(pnl);
    const risk = parseFloat(riskDollar);
    if (profit && risk && risk > 0) {
      setRMultiple((profit / risk).toFixed(2));
    }
  }, [pnl, riskDollar]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const tradeData = {
        name: `Trade #${tradeNum || '001'}`,
        date,
        pair: pair.replace('/', ''),
        session: session.split('(')[0].trim(),
        direction: direction.split(' ')[0],
        setup: setupType,
        htfBias,
        phase,
        outcome,
        pnl: parseFloat(pnl) || 0,
        rMultiple: parseFloat(rMultiple) || 0,
        rrPlanned: parseFloat(rrPlanned) || 2,
        execGrade: `${execGrade}/10`,
        sopOk: sopFollowed,
        whatWorked: didWell,
        whatToImprove: improve,
        sopViolation: sopFollowed ? '' : violation,
        tags: [setupType, direction.split(' ')[0], pair.replace('/', '')],
      };

      const result = await createTradeInNotion(tradeData);

      if (result.success) {
        setSuccess('✅ Trade logged successfully!');
        setTimeout(() => {
          onTradeCreated?.();
          onClose();
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

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div style={styles.header}>
            <h2 style={styles.title}>📝 Trade Entry Log</h2>
            <button type="button" style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          <div style={styles.body}>
            {error && <div style={styles.error}>⚠️ {error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            {/* Trade Identification */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📋 Trade Identification</div>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Trade #</label>
                  <input type="text" style={styles.input} value={tradeNum} onChange={e => setTradeNum(e.target.value)} placeholder="001" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date *</label>
                  <input type="date" style={styles.input} value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Time (HKT)</label>
                  <input type="time" style={styles.input} value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Trade Setup */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>🎯 Trade Setup</div>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Pair *</label>
                  <select style={styles.select} value={pair} onChange={e => setPair(e.target.value)}>
                    {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Session *</label>
                  <select style={styles.select} value={session} onChange={e => setSession(e.target.value)}>
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Direction *</label>
                  <select style={styles.select} value={direction} onChange={e => setDirection(e.target.value)}>
                    {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Setup Type *</label>
                  <select style={styles.select} value={setupType} onChange={e => setSetupType(e.target.value)}>
                    {SETUPS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>HTF Bias</label>
                  <select style={styles.select} value={htfBias} onChange={e => setHtfBias(e.target.value)}>
                    {HTF_BIASES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>DXY Direction</label>
                  <select style={styles.select} value={dxyDirection} onChange={e => setDxyDirection(e.target.value)}>
                    {DXY_DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phase</label>
                  <select style={styles.select} value={phase} onChange={e => setPhase(e.target.value)}>
                    {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 5-Point Lock */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>🔒 5-Point Lock Checklist</div>
              <div style={styles.checkboxGrid}>
                <div 
                  style={{ ...styles.checkboxItem, ...(point1 ? styles.checkboxItemChecked : {}) }}
                  onClick={() => setPoint1(!point1)}
                >
                  <input type="checkbox" style={styles.checkbox} checked={point1} onChange={() => {}} />
                  <span style={styles.checkboxLabel}>Price at valid PD Array</span>
                </div>
                <div 
                  style={{ ...styles.checkboxItem, ...(point2 ? styles.checkboxItemChecked : {}) }}
                  onClick={() => setPoint2(!point2)}
                >
                  <input type="checkbox" style={styles.checkbox} checked={point2} onChange={() => {}} />
                  <span style={styles.checkboxLabel}>Liquidity swept</span>
                </div>
                <div 
                  style={{ ...styles.checkboxItem, ...(point3 ? styles.checkboxItemChecked : {}) }}
                  onClick={() => setPoint3(!point3)}
                >
                  <input type="checkbox" style={styles.checkbox} checked={point3} onChange={() => {}} />
                  <span style={styles.checkboxLabel}>MSS / CHoCH confirmed</span>
                </div>
                <div 
                  style={{ ...styles.checkboxItem, ...(point4 ? styles.checkboxItemChecked : {}) }}
                  onClick={() => setPoint4(!point4)}
                >
                  <input type="checkbox" style={styles.checkbox} checked={point4} onChange={() => {}} />
                  <span style={styles.checkboxLabel}>Displacement candle visible</span>
                </div>
                <div 
                  style={{ ...styles.checkboxItem, ...(point5 ? styles.checkboxItemChecked : {}) }}
                  onClick={() => setPoint5(!point5)}
                >
                  <input type="checkbox" style={styles.checkbox} checked={point5} onChange={() => {}} />
                  <span style={styles.checkboxLabel}>R:R ≥ 1:2</span>
                </div>
              </div>
            </div>

            {/* Entry/Exit Details */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📊 Entry & Risk Management</div>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Entry Price</label>
                  <input type="number" step="0.00001" style={styles.input} value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="1.08500" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Stop Loss</label>
                  <input type="number" step="0.00001" style={styles.input} value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="1.08400" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Take Profit 1</label>
                  <input type="number" step="0.00001" style={styles.input} value={takeProfit1} onChange={e => setTakeProfit1(e.target.value)} placeholder="1.08700" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Take Profit 2</label>
                  <input type="number" step="0.00001" style={styles.input} value={takeProfit2} onChange={e => setTakeProfit2(e.target.value)} placeholder="1.08900" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Lot Size</label>
                  <input type="number" step="0.01" style={styles.input} value={lotSize} onChange={e => setLotSize(e.target.value)} placeholder="0.10" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Risk %</label>
                  <input type="number" step="0.1" style={styles.input} value={riskPercent} onChange={e => setRiskPercent(e.target.value)} placeholder="1.0" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Risk ($)</label>
                  <input type="number" step="0.01" style={styles.input} value={riskDollar} onChange={e => setRiskDollar(e.target.value)} placeholder="Auto-calculated" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Planned R:R</label>
                  <input type="number" step="0.1" style={styles.input} value={rrPlanned} onChange={e => setRrPlanned(e.target.value)} placeholder="2.0" />
                </div>
              </div>
            </div>

            {/* Outcome */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>✅ Outcome</div>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Outcome *</label>
                  <select style={styles.select} value={outcome} onChange={e => setOutcome(e.target.value)}>
                    {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Exit Price</label>
                  <input type="number" step="0.00001" style={styles.input} value={exitPrice} onChange={e => setExitPrice(e.target.value)} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>P&L (USD) *</label>
                  <input type="number" step="0.01" style={styles.input} value={pnl} onChange={e => setPnl(e.target.value)} placeholder="+123.45" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>R-Multiple *</label>
                  <input type="number" step="0.01" style={styles.input} value={rMultiple} onChange={e => setRMultiple(e.target.value)} placeholder="+2.5" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Max Favourable Excursion</label>
                  <input type="number" step="0.01" style={styles.input} value={mfe} onChange={e => setMfe(e.target.value)} placeholder="In R" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Max Adverse Excursion</label>
                  <input type="number" step="0.01" style={styles.input} value={mae} onChange={e => setMae(e.target.value)} placeholder="In R" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Execution Grade (1-10)</label>
                  <select style={styles.select} value={execGrade} onChange={e => setExecGrade(e.target.value)}>
                    {EXEC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SOP & Review */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>🧠 Trade Review</div>
              <div style={styles.grid2}>
                <div style={styles.field}>
                  <div 
                    style={{ ...styles.checkboxItem, ...(sopFollowed ? styles.checkboxItemChecked : {}) }}
                    onClick={() => setSopFollowed(!sopFollowed)}
                  >
                    <input type="checkbox" style={styles.checkbox} checked={sopFollowed} onChange={() => {}} />
                    <span style={styles.checkboxLabel}>✅ Followed SOP Fully</span>
                  </div>
                </div>
                {!sopFollowed && (
                  <div style={{ ...styles.field, ...styles.fieldFull }}>
                    <label style={styles.label}>Violation Details</label>
                    <textarea style={styles.textarea} value={violation} onChange={e => setViolation(e.target.value)} placeholder="What SOP rule did you violate?" />
                  </div>
                )}
                <div style={{ ...styles.field, ...styles.fieldFull }}>
                  <label style={styles.label}>What the market did</label>
                  <textarea style={styles.textarea} value={marketDid} onChange={e => setMarketDid(e.target.value)} placeholder="Describe price action after entry..." />
                </div>
                <div style={{ ...styles.field, ...styles.fieldFull }}>
                  <label style={styles.label}>What I did well</label>
                  <textarea style={styles.textarea} value={didWell} onChange={e => setDidWell(e.target.value)} placeholder="Positive aspects of this trade..." />
                </div>
                <div style={{ ...styles.field, ...styles.fieldFull }}>
                  <label style={styles.label}>What I'll improve</label>
                  <textarea style={styles.textarea} value={improve} onChange={e => setImprove(e.target.value)} placeholder="Lessons learned for next time..." />
                </div>
                <div style={{ ...styles.field, ...styles.fieldFull }}>
                  <label style={styles.label}>Chart Screenshot / Notes</label>
                  <textarea style={styles.textarea} value={chartNote} onChange={e => setChartNote(e.target.value)} placeholder="Link to chart or additional notes..." />
                </div>
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
              {isSubmitting ? '⏳ Saving...' : '💾 Save Trade Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
