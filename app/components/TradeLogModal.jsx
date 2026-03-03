'use client';

import { useState } from 'react';

const SESSIONS = ['London', 'NY', 'Asia', 'Pre-London'];
const PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'NZDUSD', 'AUDUSD', 'USDCAD'];
const DIRECTIONS = ['Long', 'Short'];
const SETUPS = ['Range Break', 'BR Retest', 'HMA Cross', 'Support/Resistance', 'Trend Follow', 'Counter-Trend'];
const BIASES = ['Bullish', 'Bearish', 'Neutral'];
const PHASES = ['Entry', 'Average Down', 'Exit'];
const OUTCOMES = ['Win', 'Loss', 'Break Even'];
const GRADES = ['A', 'B', 'C', 'D', 'F'];

function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b4a9ff', marginBottom: '4px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#1a1f2e',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          color: '#ffffff',
          fontSize: '14px',
          fontFamily: 'inherit',
        }}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({ label, value, onChange, required = false, min = null, step = 'any' }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b4a9ff', marginBottom: '4px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        step={step}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#1a1f2e',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          color: '#ffffff',
          fontSize: '14px',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function DateField({ label, value, onChange, required = false }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b4a9ff', marginBottom: '4px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#1a1f2e',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          color: '#ffffff',
          fontSize: '14px',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder = '', required = false, multiline = false }) {
  const Component = multiline ? 'textarea' : 'input';
  const inputProps = multiline
    ? { rows: 3 }
    : { type: 'text' };

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b4a9ff', marginBottom: '4px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <Component
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#1a1f2e',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          color: '#ffffff',
          fontSize: '14px',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          resize: multiline ? 'vertical' : 'none',
        }}
        {...inputProps}
      />
    </div>
  );
}

function CheckboxField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            marginRight: '8px',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: '14px', color: '#b4a9ff' }}>{label}</span>
      </label>
    </div>
  );
}

export default function TradeLogModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    pair: '',
    session: '',
    direction: '',
    setup: '',
    htfBias: '',
    phase: '',
    rrPlanned: '',
    outcome: '',
    pnl: '',
    rMultiple: '',
    execGrade: '',
    sopOk: true,
    sopViolation: '',
    whatWorked: '',
    whatToImprove: '',
    tags: '',
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter((t) => t),
      };

      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create trade');
      }

      setSuccess(true);
      setForm({
        name: '',
        date: new Date().toISOString().split('T')[0],
        pair: '',
        session: '',
        direction: '',
        setup: '',
        htfBias: '',
        phase: '',
        rrPlanned: '',
        outcome: '',
        pnl: '',
        rMultiple: '',
        execGrade: '',
        sopOk: true,
        sopViolation: '',
        whatWorked: '',
        whatToImprove: '',
        tags: '',
      });

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0a0d12',
          borderRadius: '8px',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
          maxWidth: '500px',
          width: '90%',
          border: '1px solid #2d3748',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>Log New Trade</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              font: 'inherit',
              cursor: 'pointer',
              color: '#8b8fa3',
              fontSize: '20px',
            }}
          >
            ✕
          </button>
        </div>

        {success && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #22c55e',
              borderRadius: '6px',
              marginBottom: '16px',
              color: '#22c55e',
              fontSize: '14px',
            }}
          >
            ✓ Trade logged successfully!
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              marginBottom: '16px',
              color: '#ef4444',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <DateField
            label="Date"
            value={form.date}
            onChange={(val) => updateForm('date', val)}
            required
          />

          <SelectField
            label="Pair"
            value={form.pair}
            onChange={(val) => updateForm('pair', val)}
            options={PAIRS}
            required
          />

          <SelectField
            label="Session"
            value={form.session}
            onChange={(val) => updateForm('session', val)}
            options={SESSIONS}
          />

          <SelectField
            label="Direction"
            value={form.direction}
            onChange={(val) => updateForm('direction', val)}
            options={DIRECTIONS}
          />

          <SelectField
            label="Setup Type"
            value={form.setup}
            onChange={(val) => updateForm('setup', val)}
            options={SETUPS}
          />

          <SelectField
            label="HTF Bias"
            value={form.htfBias}
            onChange={(val) => updateForm('htfBias', val)}
            options={BIASES}
          />

          <SelectField
            label="Phase"
            value={form.phase}
            onChange={(val) => updateForm('phase', val)}
            options={PHASES}
          />

          <NumberField
            label="RR Planned"
            value={form.rrPlanned}
            onChange={(val) => updateForm('rrPlanned', val)}
            step="0.1"
          />

          <SelectField
            label="Outcome"
            value={form.outcome}
            onChange={(val) => updateForm('outcome', val)}
            options={OUTCOMES}
            required
          />

          <NumberField
            label="PnL USD"
            value={form.pnl}
            onChange={(val) => updateForm('pnl', val)}
          />

          <NumberField
            label="R Multiple"
            value={form.rMultiple}
            onChange={(val) => updateForm('rMultiple', val)}
            step="0.1"
          />

          <SelectField
            label="Execution Grade"
            value={form.execGrade}
            onChange={(val) => updateForm('execGrade', val)}
            options={GRADES}
          />

          <CheckboxField
            label="SOP Followed?"
            value={form.sopOk}
            onChange={(val) => updateForm('sopOk', val)}
          />

          <TextField
            label="SOP Violation"
            value={form.sopViolation}
            onChange={(val) => updateForm('sopViolation', val)}
            placeholder="e.g., Entered without confirmation signal"
          />

          <TextField
            label="What Worked"
            value={form.whatWorked}
            onChange={(val) => updateForm('whatWorked', val)}
            placeholder="e.g., Good entry timing, strong HTF bias confluence"
            multiline
          />

          <TextField
            label="What To Improve"
            value={form.whatToImprove}
            onChange={(val) => updateForm('whatToImprove', val)}
            placeholder="e.g., Should have waited for HMA cross confirmation"
            multiline
          />

          <TextField
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(val) => updateForm('tags', val)}
            placeholder="e.g., breakout, recovery, eur"
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading || success}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: loading || success ? '#6b5b95' : '#f0b429',
                color: '#0a0d12',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: loading || success ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading || success ? 0.6 : 1,
              }}
            >
              {loading ? 'Logging...' : success ? 'Success!' : 'Log Trade'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#2d3748',
                color: '#ffffff',
                border: '1px solid #4a5568',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
