'use client';

/**
 * Tools Page - Trading Calculators & Utilities
 * Position size, risk, expectancy calculators
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { mockUser } from '../lib/mockData';
import AppShell from '../components/AppShell';

const styles = {
  header: { marginBottom: '24px', animation: 'fadeIn 0.4s ease-out' },
  title: { fontSize: '28px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px 0', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '14px', color: '#718096', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', animation: 'fadeIn 0.5s ease-out' },
  card: { background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)', border: '1px solid rgba(28, 34, 48, 0.8)', borderRadius: '16px', padding: '24px' },
  cardFull: { gridColumn: 'span 2' },
  cardTitle: { fontSize: '18px', fontWeight: 600, color: '#f0b429', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 14px', backgroundColor: 'rgba(15, 19, 24, 0.8)', border: '1px solid rgba(240, 180, 41, 0.2)', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
  select: { width: '100%', padding: '12px 14px', backgroundColor: 'rgba(15, 19, 24, 0.8)', border: '1px solid rgba(240, 180, 41, 0.2)', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
  resultBox: { backgroundColor: 'rgba(240, 180, 41, 0.1)', border: '1px solid rgba(240, 180, 41, 0.3)', borderRadius: '12px', padding: '16px', marginTop: '16px' },
  resultLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px' },
  resultValue: { fontSize: '24px', fontWeight: 700, color: '#f0b429', fontFamily: "'JetBrains Mono', monospace" },
  resultSub: { fontSize: '12px', color: '#718096', marginTop: '4px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  infoBox: { backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', padding: '12px', marginTop: '12px' },
  infoText: { fontSize: '12px', color: '#22c55e', lineHeight: 1.5 },
  warningBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px', marginTop: '12px' },
  warningText: { fontSize: '12px', color: '#ef4444', lineHeight: 1.5 },
  divider: { height: '1px', backgroundColor: 'rgba(28, 34, 48, 0.8)', margin: '20px 0' },
};

export default function ToolsPage() {
  const [user] = useState<User>(mockUser);
  
  // Position Size Calculator
  const [accountBalance, setAccountBalance] = useState('50000');
  const [riskPercent, setRiskPercent] = useState('1');
  const [entryPrice, setEntryPrice] = useState('1.08500');
  const [stopLoss, setStopLoss] = useState('1.08400');
  const [pair, setPair] = useState('EURUSD');
  const [positionSize, setPositionSize] = useState('');
  const [riskAmount, setRiskAmount] = useState('');
  const [stopPips, setStopPips] = useState('');

  // Expectancy Calculator
  const [winRate, setWinRate] = useState('55');
  const [avgWin, setAvgWin] = useState('2');
  const [avgLoss, setAvgLoss] = useState('1');
  const [expectancy, setExpectancy] = useState('');

  // Profit Factor Calculator
  const [grossProfit, setGrossProfit] = useState('10000');
  const [grossLoss, setGrossLoss] = useState('4000');
  const [profitFactor, setProfitFactor] = useState('');

  // R:R Calculator
  const [targetPrice, setTargetPrice] = useState('1.08700');
  const [rewardPips, setRewardPips] = useState('');
  const [riskRewardRatio, setRiskRewardRatio] = useState('');

  // Position Size Calculation
  useEffect(() => {
    const balance = parseFloat(accountBalance);
    const risk = parseFloat(riskPercent);
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);

    if (balance && risk && entry && stop) {
      const riskAmt = balance * (risk / 100);
      const isJPY = pair.includes('JPY');
      const pipSize = isJPY ? 0.01 : 0.0001;
      const pips = Math.abs(entry - stop) / pipSize;
      const pipValue = riskAmt / pips;
      const lots = pipValue / 10;

      setRiskAmount(riskAmt.toFixed(2));
      setStopPips(pips.toFixed(1));
      setPositionSize(lots.toFixed(2));
    }
  }, [accountBalance, riskPercent, entryPrice, stopLoss, pair]);

  // Expectancy Calculation
  useEffect(() => {
    const wr = parseFloat(winRate) / 100;
    const aw = parseFloat(avgWin);
    const al = parseFloat(avgLoss);

    if (!isNaN(wr) && !isNaN(aw) && !isNaN(al)) {
      const exp = (wr * aw) - ((1 - wr) * al);
      setExpectancy(exp.toFixed(3));
    }
  }, [winRate, avgWin, avgLoss]);

  // Profit Factor Calculation
  useEffect(() => {
    const gp = parseFloat(grossProfit);
    const gl = parseFloat(grossLoss);

    if (gp && gl) {
      setProfitFactor((gp / gl).toFixed(2));
    }
  }, [grossProfit, grossLoss]);

  // R:R Calculation
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const target = parseFloat(targetPrice);

    if (entry && stop && target) {
      const isJPY = pair.includes('JPY');
      const pipSize = isJPY ? 0.01 : 0.0001;
      const riskPips = Math.abs(entry - stop) / pipSize;
      const reward = Math.abs(target - entry) / pipSize;
      
      setRewardPips(reward.toFixed(1));
      setRiskRewardRatio((reward / riskPips).toFixed(2));
    }
  }, [entryPrice, stopLoss, targetPrice, pair]);

  const getExpectancyInsight = () => {
    const exp = parseFloat(expectancy);
    if (exp > 0.3) return { type: 'success', text: '✅ Excellent! Your system has a strong edge (>0.3R expectancy).' };
    if (exp > 0) return { type: 'success', text: '⚠️ Positive expectancy but aim for >0.3R for a stronger edge.' };
    return { type: 'warning', text: '❌ Negative expectancy. Your system is losing money over time.' };
  };

  const getPFInsight = () => {
    const pf = parseFloat(profitFactor);
    if (pf >= 2) return { type: 'success', text: '✅ Excellent! Profit factor ≥ 2.0 is professional grade.' };
    if (pf >= 1.5) return { type: 'success', text: '⚠️ Good profit factor. Aim for 2.0+ for consistency.' };
    if (pf >= 1) return { type: 'warning', text: '⚠️ Breaking even. Need to improve edge or reduce losses.' };
    return { type: 'warning', text: '❌ Losing system. Review your strategy immediately.' };
  };

  return (
    <AppShell user={user}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛠️ Trading Tools</h1>
        <p style={styles.subtitle}>Position size, risk, and expectancy calculators</p>
      </div>

      <div style={styles.grid}>
        {/* Position Size Calculator */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📐 Position Size Calculator</h2>
          
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Account Balance ($)</label>
              <input type="number" style={styles.input} value={accountBalance} onChange={e => setAccountBalance(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Risk %</label>
              <input type="number" step="0.1" style={styles.input} value={riskPercent} onChange={e => setRiskPercent(e.target.value)} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Pair</label>
            <select style={styles.select} value={pair} onChange={e => setPair(e.target.value)}>
              <option value="EURUSD">EUR/USD</option>
              <option value="GBPUSD">GBP/USD</option>
              <option value="USDJPY">USD/JPY</option>
              <option value="GBPJPY">GBP/JPY</option>
              <option value="XAUUSD">XAU/USD</option>
            </select>
          </div>

          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Entry Price</label>
              <input type="number" step="0.00001" style={styles.input} value={entryPrice} onChange={e => setEntryPrice(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Stop Loss</label>
              <input type="number" step="0.00001" style={styles.input} value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
            </div>
          </div>

          <div style={styles.resultBox}>
            <div style={styles.grid3}>
              <div>
                <div style={styles.resultLabel}>Position Size</div>
                <div style={styles.resultValue}>{positionSize || '0.00'} lots</div>
              </div>
              <div>
                <div style={styles.resultLabel}>Risk Amount</div>
                <div style={styles.resultValue}>${riskAmount || '0.00'}</div>
              </div>
              <div>
                <div style={styles.resultLabel}>Stop Distance</div>
                <div style={styles.resultValue}>{stopPips || '0'} pips</div>
              </div>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoText}>
              💡 Risking {riskPercent}% of ${accountBalance} = ${riskAmount} per trade
            </div>
          </div>
        </div>

        {/* R:R Calculator */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⚖️ Risk:Reward Calculator</h2>
          
          <div style={styles.field}>
            <label style={styles.label}>Take Profit</label>
            <input type="number" step="0.00001" style={styles.input} value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
          </div>

          <div style={styles.resultBox}>
            <div style={styles.grid2}>
              <div>
                <div style={styles.resultLabel}>Reward</div>
                <div style={styles.resultValue}>{rewardPips || '0'} pips</div>
              </div>
              <div>
                <div style={styles.resultLabel}>R:R Ratio</div>
                <div style={styles.resultValue}>1:{riskRewardRatio || '0'}</div>
              </div>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoText}>
              ✅ Minimum recommended: 1:2 R:R for positive expectancy
            </div>
          </div>
        </div>

        {/* Expectancy Calculator */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎯 Expectancy Calculator</h2>
          
          <div style={styles.grid3}>
            <div style={styles.field}>
              <label style={styles.label}>Win Rate %</label>
              <input type="number" style={styles.input} value={winRate} onChange={e => setWinRate(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Avg Win (R)</label>
              <input type="number" step="0.1" style={styles.input} value={avgWin} onChange={e => setAvgWin(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Avg Loss (R)</label>
              <input type="number" step="0.1" style={styles.input} value={avgLoss} onChange={e => setAvgLoss(e.target.value)} />
            </div>
          </div>

          <div style={styles.resultBox}>
            <div style={styles.resultLabel}>Expectancy per Trade</div>
            <div style={{...styles.resultValue, color: parseFloat(expectancy) > 0 ? '#22c55e' : '#ef4444'}}>
              {expectancy ? `${parseFloat(expectancy) > 0 ? '+' : ''}${expectancy}R` : '0R'}
            </div>
            <div style={styles.resultSub}>
              Expected return per trade in R-multiples
            </div>
          </div>

          {expectancy && (
            <div style={getExpectancyInsight().type === 'success' ? styles.infoBox : styles.warningBox}>
              <div style={getExpectancyInsight().type === 'success' ? styles.infoText : styles.warningText}>
                {getExpectancyInsight().text}
              </div>
            </div>
          )}
        </div>

        {/* Profit Factor Calculator */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Profit Factor Calculator</h2>
          
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Gross Profit ($)</label>
              <input type="number" style={styles.input} value={grossProfit} onChange={e => setGrossProfit(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Gross Loss ($)</label>
              <input type="number" style={styles.input} value={grossLoss} onChange={e => setGrossLoss(e.target.value)} />
            </div>
          </div>

          <div style={styles.resultBox}>
            <div style={styles.resultLabel}>Profit Factor</div>
            <div style={{...styles.resultValue, color: parseFloat(profitFactor) >= 1.5 ? '#22c55e' : '#ef4444'}}>
              {profitFactor || '0.00'}
            </div>
            <div style={styles.resultSub}>
              Gross Profit ÷ Gross Loss
            </div>
          </div>

          {profitFactor && (
            <div style={getPFInsight().type === 'success' ? styles.infoBox : styles.warningBox}>
              <div style={getPFInsight().type === 'success' ? styles.infoText : styles.warningText}>
                {getPFInsight().text}
              </div>
            </div>
          )}
        </div>

        {/* Quick Reference */}
        <div style={{ ...styles.card, ...styles.cardFull }}>
          <h2 style={styles.cardTitle}>📚 Quick Reference Guide</h2>
          
          <div style={styles.grid2}>
            <div>
              <h3 style={{ fontSize: '14px', color: '#f0b429', marginBottom: '12px' }}>🎯 Key Metrics Targets</h3>
              <div style={{ fontSize: '13px', color: '#a0aec0', lineHeight: 1.8 }}>
                <div>• Win Rate: 50%+ (with good R:R)</div>
                <div>• Profit Factor: 1.5+ (2.0+ excellent)</div>
                <div>• Expectancy: 0.3R+ (minimum edge)</div>
                <div>• Risk per trade: 1-2% max</div>
                <div>• R:R Ratio: 1:2 minimum</div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', color: '#f0b429', marginBottom: '12px' }}>🚦 Go Live Criteria</h3>
              <div style={{ fontSize: '13px', color: '#a0aec0', lineHeight: 1.8 }}>
                <div>✓ 2 consecutive profitable months</div>
                <div>✓ 50%+ win rate over 30+ trades</div>
                <div>✓ Positive expectancy (0R+)</div>
                <div>✓ Zero SOP violations (2 weeks)</div>
                <div>✓ Consistent emotional control</div>
              </div>
            </div>
          </div>

          <div style={styles.divider} />

          <div>
            <h3 style={{ fontSize: '14px', color: '#f0b429', marginBottom: '12px' }}>📐 Formulas Used</h3>
            <div style={{ fontSize: '12px', color: '#718096', lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace" }}>
              <div>Position Size = Risk Amount ÷ (Stop Pips × Pip Value)</div>
              <div>Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss)</div>
              <div>Profit Factor = Gross Profit ÷ Gross Loss</div>
              <div>R:R Ratio = Reward Pips ÷ Risk Pips</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
