'use client';

/**
 * Trade Management Page
 * 
 * Features:
 * - Strategy Management: Create, edit, view trading strategies
 * - Trading Checklists: Pre-trade, During-trade, Post-trade checklists
 * - Trade Plans: Structured approach to each trade
 * - Modern, professional UI with glassmorphism design
 */

import React, { useState, useEffect } from 'react';
import { mockUser } from '../lib/mockData';
import { User } from '../types';
import AppShell from '../components/AppShell';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Strategy {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  bestPairs: string[];
  entryRules: string[];
  exitRules: string[];
  riskRules: string[];
  winRate: number;
  totalTrades: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'before' | 'during' | 'after' | 'entry' | 'exit' | 'risk';
}

interface StrategyChecklist {
  strategyId: string;
  entryRules: { id: string; text: string; checked: boolean }[];
  exitRules: { id: string; text: string; checked: boolean }[];
  riskRules: { id: string; text: string; checked: boolean }[];
}

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────

const DEFAULT_STRATEGIES: Strategy[] = [
  {
    id: 'strat_001',
    name: 'ICT Silver Bullet',
    description: 'High-probability setups during specific killzone times (9:50-10:10, 13:50-14:10, 19:50-20:10 EST)',
    timeframe: '5m / 1m',
    bestPairs: ['EURUSD', 'GBPUSD', 'XAUUSD'],
    entryRules: [
      'Price is in a premium/discount array (PD Array)',
      'Fair Value Gap (FVG) is present on 5m or 1m',
      'Killzone time window is active',
      'Displacement/MSS (Market Structure Shift) has occurred',
      'Price retraces to 50% of the dealing range or FVG'
    ],
    exitRules: [
      'Target opposing liquidity pool',
      'Exit at next major SR level',
      'If price retraces 50% of move, move stop to breakeven',
      'Time-based exit if trade goes stagnant for 30+ min'
    ],
    riskRules: [
      'Risk 1-2% per trade maximum',
      'Stop loss goes above/below swing point',
      'Minimum 1:2 Risk:Reward required',
      'Max 2 trades per killzone session'
    ],
    winRate: 62,
    totalTrades: 48,
    notes: 'Best performed during London/NY overlap. Avoid high-impact news.',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15'
  },
  {
    id: 'strat_002',
    name: 'Fair Value Gap (FVG) Entry',
    description: 'Enter on retracement to imbalance zones created by strong displacement',
    timeframe: '15m / 5m / 1m',
    bestPairs: ['US30', 'EURUSD', 'GBPUSD'],
    entryRules: [
      'Clear displacement candle creating FVG',
      'FVG is not mitigated yet',
      'Price returns to FVG zone (50-70% fill ideal)',
      'Market structure supports direction (BOS/CHoCH)',
      'Volume confirmation on displacement'
    ],
    exitRules: [
      'Target next liquidity sweep',
      'Previous day high/low as target',
      'Trail stop below new swing points',
      'Exit if FVG is fully mitigated'
    ],
    riskRules: [
      'Risk 1% per trade',
      'Stop below/above the FVG zone',
      'Only trade FVGs in direction of HTF bias',
      'No entry if FVG is more than 50% filled'
    ],
    winRate: 58,
    totalTrades: 67,
    notes: 'Works best with trend alignment. Avoid ranging markets.',
    createdAt: '2025-01-20',
    updatedAt: '2025-02-10'
  },
  {
    id: 'strat_003',
    name: 'Order Block (OB) Entry',
    description: 'Trade from institutional order blocks with mitigation confirmation',
    timeframe: '1H / 15m / 5m',
    bestPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'],
    entryRules: [
      'Identified valid Order Block (impulse origin)',
      'OB is in premium/discount of dealing range',
      'Price mitigates OB zone',
      'Lower timeframe confirms rejection (pin bar, engulfing)',
      'Aligned with daily bias direction'
    ],
    exitRules: [
      'Target opposing OB or liquidity',
      'Trail stop under new structure points',
      'Scale out 50% at 1:1, let remainder run',
      'Exit on session close if target not hit'
    ],
    riskRules: [
      'Risk 1-1.5% maximum',
      'Stop beyond the OB extreme',
      'Only trade fresh OBs (not re-tested multiple times)',
      'Avoid OBs during consolidation'
    ],
    winRate: 55,
    totalTrades: 82,
    notes: 'Most reliable on 1H and 15m timeframes. Requires patience for proper mitigation.',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-28'
  },
  {
    id: 'strat_004',
    name: 'Liquidity Sweep + MSS',
    description: 'Trade the reversal after liquidity sweep with market structure shift',
    timeframe: '15m / 5m / 1m',
    bestPairs: ['GBPUSD', 'EURUSD', 'US30'],
    entryRules: [
      'Clear liquidity sweep (equal highs/lows taken)',
      'Market Structure Shift occurs (break of structure)',
      'Displacement candle confirming reversal',
      'FVG or OB present for entry',
      'Not against strong HTF trend'
    ],
    exitRules: [
      'Target next major PD array',
      'Previous consolidation zone',
      'Move stop to BE after 1:1 RR achieved',
      'Scale out partials at key levels'
    ],
    riskRules: [
      'Risk 1-2% depending on setup quality',
      'Stop beyond the sweep wick',
      'Minimum 1:2 RR required',
      'No trade if sweep is >2x ATR'
    ],
    winRate: 60,
    totalTrades: 55,
    notes: 'High probability setup. Best during London/NY sessions.',
    createdAt: '2025-02-15',
    updatedAt: '2025-03-01'
  }
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // BEFORE TRADING
  { id: 'before_001', text: 'Checked economic calendar for high-impact news', checked: false, category: 'before' },
  { id: 'before_002', text: 'Identified HTF bias (Daily/4H structure)', checked: false, category: 'before' },
  { id: 'before_003', text: 'Marked out key support/resistance levels', checked: false, category: 'before' },
  { id: 'before_004', text: 'Identified liquidity pools (buy/sell stops)', checked: false, category: 'before' },
  { id: 'before_005', text: 'Checked DXY correlation and direction', checked: false, category: 'before' },
  { id: 'before_006', text: 'In the right mental state (no revenge trading)', checked: false, category: 'before' },
  { id: 'before_007', text: 'Reviewed trading plan and rules', checked: false, category: 'before' },
  { id: 'before_008', text: 'Set daily loss limit and trade limit', checked: false, category: 'before' },
  
  // DURING TRADING
  { id: 'during_001', text: 'Waited for setup confirmation (no FOMO)', checked: false, category: 'during' },
  { id: 'during_002', text: 'Entry aligns with strategy rules', checked: false, category: 'during' },
  { id: 'during_003', text: 'Risk:Reward is at least 1:2', checked: false, category: 'during' },
  { id: 'during_004', text: 'Position size calculated correctly', checked: false, category: 'during' },
  { id: 'during_005', text: 'Stop loss placed at logical level', checked: false, category: 'during' },
  { id: 'during_006', text: 'Take profit targets are realistic', checked: false, category: 'during' },
  { id: 'during_007', text: 'Not overtrading (sticking to max trades)', checked: false, category: 'during' },
  { id: 'during_008', text: 'Managing emotions (sticking to plan)', checked: false, category: 'during' },
  
  // AFTER TRADING
  { id: 'after_001', text: 'Logged trade in journal immediately', checked: false, category: 'after' },
  { id: 'after_002', text: 'Took screenshot of setup and result', checked: false, category: 'after' },
  { id: 'after_003', text: 'Reviewed what went well', checked: false, category: 'after' },
  { id: 'after_004', text: 'Identified areas for improvement', checked: false, category: 'after' },
  { id: 'after_005', text: 'Noted any SOP violations', checked: false, category: 'after' },
  { id: 'after_006', text: 'Updated strategy stats if needed', checked: false, category: 'after' },
  { id: 'after_007', text: 'Stepped away from screens (break)', checked: false, category: 'after' },
  { id: 'after_008', text: 'Mental reset complete for next session', checked: false, category: 'after' },
];

// ─── THEME & STYLES ───────────────────────────────────────────────────────────

const THEME = {
  bg: '#0a0d12',
  card: '#11141b',
  cardHover: '#1a1f29',
  border: 'rgba(240, 180, 41, 0.15)',
  borderActive: 'rgba(240, 180, 41, 0.4)',
  gold: '#f0b429',
  goldDim: 'rgba(240, 180, 41, 0.2)',
  text: { primary: '#f0f2f5', secondary: '#9ca3af', muted: '#6b7280' },
  win: '#22c55e',
  loss: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7'
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '28px' },
  title: { fontSize: '32px', fontWeight: 700, color: THEME.text.primary, margin: '0 0 8px 0' },
  subtitle: { fontSize: '14px', color: THEME.text.secondary, margin: 0 },
  
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    padding: '4px',
    background: THEME.card,
    borderRadius: '12px',
    width: 'fit-content',
    border: `1px solid ${THEME.border}`
  },
  tab: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: THEME.text.secondary,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tabActive: {
    background: THEME.goldDim,
    color: THEME.gold,
    boxShadow: '0 2px 8px rgba(240, 180, 41, 0.1)'
  },
  
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  
  card: {
    background: THEME.card,
    border: `1px solid ${THEME.border}`,
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.2s ease'
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: THEME.text.primary,
    margin: '0 0 16px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  strategyCard: {
    background: THEME.card,
    border: `1px solid ${THEME.border}`,
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const
  },
  strategyName: {
    fontSize: '16px',
    fontWeight: 600,
    color: THEME.gold,
    margin: '0 0 8px 0'
  },
  strategyMeta: {
    fontSize: '12px',
    color: THEME.text.muted,
    marginBottom: '12px'
  },
  strategyStats: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px'
  },
  statBadge: {
    padding: '4px 10px',
    background: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: THEME.win
  },
  
  button: {
    padding: '10px 20px',
    background: `linear-gradient(135deg, ${THEME.gold} 0%, #f59e0b 100%)`,
    border: 'none',
    borderRadius: '10px',
    color: '#0a0d12',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  buttonSecondary: {
    padding: '10px 20px',
    background: 'transparent',
    border: `1px solid ${THEME.border}`,
    borderRadius: '10px',
    color: THEME.text.secondary,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  buttonDanger: {
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: THEME.loss,
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  
  form: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label: { fontSize: '12px', fontWeight: 600, color: THEME.text.secondary, textTransform: 'uppercase' as const },
  input: {
    padding: '12px 14px',
    background: THEME.bg,
    border: `1px solid ${THEME.border}`,
    borderRadius: '10px',
    color: THEME.text.primary,
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  textarea: {
    padding: '12px 14px',
    background: THEME.bg,
    border: `1px solid ${THEME.border}`,
    borderRadius: '10px',
    color: THEME.text.primary,
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical' as const,
    outline: 'none',
    fontFamily: 'inherit'
  },
  select: {
    padding: '12px 14px',
    background: THEME.bg,
    border: `1px solid ${THEME.border}`,
    borderRadius: '10px',
    color: THEME.text.primary,
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  
  checklistSection: {
    background: THEME.card,
    border: `1px solid ${THEME.border}`,
    borderRadius: '16px',
    padding: '20px'
  },
  checklistTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: THEME.text.primary,
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  checklistItemChecked: {
    background: 'rgba(34, 197, 94, 0.1)',
    opacity: 0.7
  },
  checklistItemUnchecked: {
    background: 'rgba(255, 255, 255, 0.02)'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: `2px solid ${THEME.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  checkboxChecked: {
    background: THEME.win,
    borderColor: THEME.win
  },
  checklistText: {
    fontSize: '14px',
    color: THEME.text.primary,
    transition: 'all 0.2s ease'
  },
  checklistTextChecked: {
    textDecoration: 'line-through',
    color: THEME.text.muted
  },
  
  progressBar: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '8px'
  },
  progressFill: {
    height: '100%',
    background: THEME.gold,
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  
  modalOverlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: THEME.card,
    border: `1px solid ${THEME.border}`,
    borderRadius: '20px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto' as const
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: `1px solid ${THEME.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalBody: {
    padding: '24px'
  },
  modalFooter: {
    padding: '20px 24px',
    borderTop: `1px solid ${THEME.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  
  tagContainer: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '8px' },
  tag: {
    padding: '4px 10px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '6px',
    fontSize: '11px',
    color: THEME.blue,
    fontWeight: 500
  },
  
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 40px',
    color: THEME.text.muted
  }
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function TradeManagementPage() {
  const [user] = useState<User>(mockUser);
  const [activeTab, setActiveTab] = useState<'strategies' | 'checklist' | 'plan'>('strategies');
  
  const [strategies, setStrategies] = useLocalStorage<Strategy[]>('trading_strategies', DEFAULT_STRATEGIES);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [checklist, setChecklist] = useLocalStorage<ChecklistItem[]>('trading_checklist', DEFAULT_CHECKLIST);
  
  // Strategy checklist state
  const [selectedStrategyId, setSelectedStrategyId] = useLocalStorage<string>('trading_checklist_selected_strategy', '');
  const [strategyChecklists, setStrategyChecklists] = useLocalStorage<Record<string, StrategyChecklist>>('trading_strategy_checklists', {});
  
  const [formData, setFormData] = useState<Partial<Strategy>>({
    name: '',
    description: '',
    timeframe: '',
    bestPairs: [],
    entryRules: [''],
    exitRules: [''],
    riskRules: [''],
    notes: ''
  });

  const beforeProgress = Math.round((checklist.filter((i: ChecklistItem) => i.category === 'before' && i.checked).length / checklist.filter((i: ChecklistItem) => i.category === 'before').length) * 100) || 0;
  const duringProgress = Math.round((checklist.filter((i: ChecklistItem) => i.category === 'during' && i.checked).length / checklist.filter((i: ChecklistItem) => i.category === 'during').length) * 100) || 0;
  const afterProgress = Math.round((checklist.filter((i: ChecklistItem) => i.category === 'after' && i.checked).length / checklist.filter((i: ChecklistItem) => i.category === 'after').length) * 100) || 0;
  const totalProgress = Math.round((checklist.filter((i: ChecklistItem) => i.checked).length / checklist.length) * 100) || 0;

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev: ChecklistItem[]) => prev.map((item: ChecklistItem) => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const resetChecklist = () => {
    setChecklist((prev: ChecklistItem[]) => prev.map((item: ChecklistItem) => ({ ...item, checked: false })));
  };

  const handleSaveStrategy = () => {
    if (!formData.name) return;
    
    const now = new Date().toISOString().split('T')[0];
    
    if (editingStrategy) {
      setStrategies((prev: Strategy[]) => prev.map((s: Strategy) => 
        s.id === editingStrategy.id 
          ? { ...s, ...formData, updatedAt: now } as Strategy
          : s
      ));
    } else {
      const newStrategy: Strategy = {
        id: `strat_${Date.now()}`,
        name: formData.name || 'New Strategy',
        description: formData.description || '',
        timeframe: formData.timeframe || '',
        bestPairs: formData.bestPairs || [],
        entryRules: formData.entryRules?.filter((r: string) => r) || [],
        exitRules: formData.exitRules?.filter((r: string) => r) || [],
        riskRules: formData.riskRules?.filter((r: string) => r) || [],
        winRate: 0,
        totalTrades: 0,
        notes: formData.notes || '',
        createdAt: now,
        updatedAt: now
      };
      setStrategies((prev: Strategy[]) => [...prev, newStrategy]);
    }
    
    setIsModalOpen(false);
    setEditingStrategy(null);
    setFormData({ name: '', description: '', timeframe: '', bestPairs: [], entryRules: [''], exitRules: [''], riskRules: [''], notes: '' });
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description,
      timeframe: strategy.timeframe,
      bestPairs: strategy.bestPairs,
      entryRules: strategy.entryRules.length > 0 ? strategy.entryRules : [''],
      exitRules: strategy.exitRules.length > 0 ? strategy.exitRules : [''],
      riskRules: strategy.riskRules.length > 0 ? strategy.riskRules : [''],
      notes: strategy.notes
    });
    setIsModalOpen(true);
  };

  const handleDeleteStrategy = (id: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      setStrategies((prev: Strategy[]) => prev.filter((s: Strategy) => s.id !== id));
    }
  };

  const addRuleField = (type: 'entry' | 'exit' | 'risk') => {
    setFormData(prev => ({ ...prev, [`${type}Rules`]: [...(prev[`${type}Rules`] || []), ''] }));
  };

  const updateRuleField = (type: 'entry' | 'exit' | 'risk', index: number, value: string) => {
    setFormData(prev => {
      const rules = [...(prev[`${type}Rules`] || [])];
      rules[index] = value;
      return { ...prev, [`${type}Rules`]: rules };
    });
  };

  const removeRuleField = (type: 'entry' | 'exit' | 'risk', index: number) => {
    setFormData(prev => {
      const rules = (prev[`${type}Rules`] || []).filter((_, i) => i !== index);
      return { ...prev, [`${type}Rules`]: rules.length > 0 ? rules : [''] };
    });
  };

  // Get or initialize strategy checklist
  const getStrategyChecklist = (strategyId: string): StrategyChecklist => {
    const strategy = strategies.find((s: Strategy) => s.id === strategyId);
    if (!strategy) return { strategyId, entryRules: [], exitRules: [], riskRules: [] };
    
    const existing = strategyChecklists[strategyId];
    if (existing) return existing;
    
    // Initialize from strategy rules
    const newChecklist: StrategyChecklist = {
      strategyId,
      entryRules: strategy.entryRules.map((text: string, i: number) => ({ 
        id: `entry_${i}`, text, checked: false 
      })),
      exitRules: strategy.exitRules.map((text: string, i: number) => ({ 
        id: `exit_${i}`, text, checked: false 
      })),
      riskRules: strategy.riskRules.map((text: string, i: number) => ({ 
        id: `risk_${i}`, text, checked: false 
      })),
    };
    
    setStrategyChecklists(prev => ({ ...prev, [strategyId]: newChecklist }));
    return newChecklist;
  };

  // Toggle strategy rule check
  const toggleStrategyRule = (strategyId: string, ruleType: 'entry' | 'exit' | 'risk', ruleId: string) => {
    setStrategyChecklists(prev => {
      const current = prev[strategyId] || getStrategyChecklist(strategyId);
      return {
        ...prev,
        [strategyId]: {
          ...current,
          [`${ruleType}Rules`]: current[`${ruleType}Rules`].map((rule: { id: string; checked: boolean }) => 
            rule.id === ruleId ? { ...rule, checked: !rule.checked } : rule
          )
        }
      };
    });
  };

  // Calculate strategy checklist progress
  const getStrategyProgress = (strategyId: string): { entry: number; exit: number; risk: number; overall: number } => {
    const checklist = strategyChecklists[strategyId];
    if (!checklist) return { entry: 0, exit: 0, risk: 0, overall: 0 };
    
    const entryTotal = checklist.entryRules.length;
    const exitTotal = checklist.exitRules.length;
    const riskTotal = checklist.riskRules.length;
    const total = entryTotal + exitTotal + riskTotal;
    
    if (total === 0) return { entry: 0, exit: 0, risk: 0, overall: 0 };
    
    const entryChecked = checklist.entryRules.filter((r: { checked: boolean }) => r.checked).length;
    const exitChecked = checklist.exitRules.filter((r: { checked: boolean }) => r.checked).length;
    const riskChecked = checklist.riskRules.filter((r: { checked: boolean }) => r.checked).length;
    const totalChecked = entryChecked + exitChecked + riskChecked;
    
    return {
      entry: entryTotal > 0 ? Math.round((entryChecked / entryTotal) * 100) : 0,
      exit: exitTotal > 0 ? Math.round((exitChecked / exitTotal) * 100) : 0,
      risk: riskTotal > 0 ? Math.round((riskChecked / riskTotal) * 100) : 0,
      overall: Math.round((totalChecked / total) * 100)
    };
  };

  // Reset strategy checklist
  const resetStrategyChecklist = (strategyId: string) => {
    const strategy = strategies.find((s: Strategy) => s.id === strategyId);
    if (!strategy) return;
    
    setStrategyChecklists(prev => ({
      ...prev,
      [strategyId]: {
        strategyId,
        entryRules: strategy.entryRules.map((text: string, i: number) => ({ 
          id: `entry_${i}`, text, checked: false 
        })),
        exitRules: strategy.exitRules.map((text: string, i: number) => ({ 
          id: `exit_${i}`, text, checked: false 
        })),
        riskRules: strategy.riskRules.map((text: string, i: number) => ({ 
          id: `risk_${i}`, text, checked: false 
        })),
      }
    }));
  };

  const selectedStrategy = selectedStrategyId ? strategies.find((s: Strategy) => s.id === selectedStrategyId) : null;
  const currentStrategyChecklist = selectedStrategyId ? getStrategyChecklist(selectedStrategyId) : null;
  const strategyProgress = selectedStrategyId ? getStrategyProgress(selectedStrategyId) : null;

  return (
    <AppShell user={user}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Trade Management</h1>
          <p style={styles.subtitle}>Strategies, checklists, and trade planning tools</p>
        </div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(activeTab === 'strategies' ? styles.tabActive : {}) }} onClick={() => setActiveTab('strategies')}>
            Strategies ({strategies.length})
          </button>
          <button style={{ ...styles.tab, ...(activeTab === 'checklist' ? styles.tabActive : {}) }} onClick={() => setActiveTab('checklist')}>
            Checklist ({totalProgress}%)
          </button>
          <button style={{ ...styles.tab, ...(activeTab === 'plan' ? styles.tabActive : {}) }} onClick={() => setActiveTab('plan')}>
            Trade Plan
          </button>
        </div>

        {/* STRATEGIES TAB */}
        {activeTab === 'strategies' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: THEME.text.primary, margin: 0 }}>Your Strategies</h2>
                <p style={{ fontSize: '13px', color: THEME.text.secondary, margin: '4px 0 0 0' }}>Click a strategy to edit • Create detailed rules for consistent execution</p>
              </div>
              <button style={styles.button} onClick={() => { setEditingStrategy(null); setFormData({ name: '', description: '', timeframe: '', bestPairs: [], entryRules: [''], exitRules: [''], riskRules: [''], notes: '' }); setIsModalOpen(true); }}>
                + New Strategy
              </button>
            </div>

            <div style={styles.grid2}>
              {strategies.map((strategy: Strategy) => (
                <div key={strategy.id} style={styles.strategyCard} onClick={() => handleEditStrategy(strategy)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={styles.strategyName}>{strategy.name}</h3>
                      <p style={styles.strategyMeta}>{strategy.timeframe} • {strategy.totalTrades} trades • Updated {strategy.updatedAt}</p>
                    </div>
                    <button style={{ ...styles.buttonDanger, padding: '6px 12px' }} onClick={(e) => { e.stopPropagation(); handleDeleteStrategy(strategy.id); }}>Delete</button>
                  </div>
                  <p style={{ fontSize: '13px', color: THEME.text.secondary, margin: '0 0 12px 0', lineHeight: 1.5 }}>{strategy.description}</p>
                  <div style={styles.tagContainer}>
                    {strategy.bestPairs.map((pair: string) => <span key={pair} style={styles.tag}>{pair}</span>)}
                  </div>
                  <div style={styles.strategyStats}>
                    <span style={styles.statBadge}>{strategy.winRate}% Win Rate</span>
                    <span style={{ ...styles.statBadge, background: 'rgba(59, 130, 246, 0.1)', color: THEME.blue }}>{strategy.entryRules.length} Entry Rules</span>
                    <span style={{ ...styles.statBadge, background: 'rgba(168, 85, 247, 0.1)', color: THEME.purple }}>{strategy.riskRules.length} Risk Rules</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <>
            {/* Strategy Selector */}
            <div style={{ ...styles.card, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <label style={{ ...styles.label, marginBottom: '8px', display: 'block' }}>Select Strategy for Trade Checklist</label>
                  <select 
                    style={{ ...styles.select, width: '100%' }} 
                    value={selectedStrategyId} 
                    onChange={(e) => setSelectedStrategyId(e.target.value)}
                  >
                    <option value="">-- Choose a Strategy --</option>
                    {strategies.map((s: Strategy) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <button style={styles.buttonSecondary} onClick={resetChecklist}>Reset General</button>
                  {selectedStrategyId && (
                    <button style={styles.buttonSecondary} onClick={() => resetStrategyChecklist(selectedStrategyId)}>Reset Strategy</button>
                  )}
                </div>
              </div>
              
              {selectedStrategy && strategyProgress && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${THEME.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: THEME.gold }}>{selectedStrategy.name} Progress</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: THEME.text.primary }}>{strategyProgress.overall}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${strategyProgress.overall}%`, background: THEME.gold }} />
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: THEME.blue }}>Entry: {strategyProgress.entry}%</span>
                    <span style={{ fontSize: '12px', color: THEME.purple }}>Exit: {strategyProgress.exit}%</span>
                    <span style={{ fontSize: '12px', color: THEME.win }}>Risk: {strategyProgress.risk}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* General Trading Checklist */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: THEME.text.primary, margin: 0 }}>General Trading Checklist</h2>
              <p style={{ fontSize: '13px', color: THEME.text.secondary, margin: '4px 0 0 0' }}>Follow this checklist before, during, and after every trading session</p>
            </div>

            <div style={{ ...styles.card, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: THEME.text.primary }}>Overall Progress: {totalProgress}%</span>
                <span style={{ fontSize: '12px', color: THEME.text.muted }}>{checklist.filter((i: ChecklistItem) => i.checked).length} / {checklist.length} items</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${totalProgress}%` }} />
              </div>
            </div>

            <div style={styles.grid3}>
              {/* Before Trading */}
              <div style={styles.checklistSection}>
                <div style={styles.checklistTitle}>Before Trading <span style={{ marginLeft: 'auto', fontSize: '12px', color: THEME.gold }}>{beforeProgress}%</span></div>
                <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${beforeProgress}%` }} /></div>
                <div style={{ marginTop: '16px' }}>
                  {checklist.filter((i: ChecklistItem) => i.category === 'before').map((item: ChecklistItem) => (
                    <div key={item.id} style={{ ...styles.checklistItem, ...(item.checked ? styles.checklistItemChecked : styles.checklistItemUnchecked) }} onClick={() => toggleChecklistItem(item.id)}>
                      <div style={{ ...styles.checkbox, ...(item.checked ? styles.checkboxChecked : {}) }}>{item.checked && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}</div>
                      <span style={{ ...styles.checklistText, ...(item.checked ? styles.checklistTextChecked : {}) }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* During Trading */}
              <div style={styles.checklistSection}>
                <div style={styles.checklistTitle}>During Trading <span style={{ marginLeft: 'auto', fontSize: '12px', color: THEME.gold }}>{duringProgress}%</span></div>
                <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${duringProgress}%` }} /></div>
                <div style={{ marginTop: '16px' }}>
                  {checklist.filter((i: ChecklistItem) => i.category === 'during').map((item: ChecklistItem) => (
                    <div key={item.id} style={{ ...styles.checklistItem, ...(item.checked ? styles.checklistItemChecked : styles.checklistItemUnchecked) }} onClick={() => toggleChecklistItem(item.id)}>
                      <div style={{ ...styles.checkbox, ...(item.checked ? styles.checkboxChecked : {}) }}>{item.checked && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}</div>
                      <span style={{ ...styles.checklistText, ...(item.checked ? styles.checklistTextChecked : {}) }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* After Trading */}
              <div style={styles.checklistSection}>
                <div style={styles.checklistTitle}>After Trading <span style={{ marginLeft: 'auto', fontSize: '12px', color: THEME.gold }}>{afterProgress}%</span></div>
                <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${afterProgress}%` }} /></div>
                <div style={{ marginTop: '16px' }}>
                  {checklist.filter((i: ChecklistItem) => i.category === 'after').map((item: ChecklistItem) => (
                    <div key={item.id} style={{ ...styles.checklistItem, ...(item.checked ? styles.checklistItemChecked : styles.checklistItemUnchecked) }} onClick={() => toggleChecklistItem(item.id)}>
                      <div style={{ ...styles.checkbox, ...(item.checked ? styles.checkboxChecked : {}) }}>{item.checked && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}</div>
                      <span style={{ ...styles.checklistText, ...(item.checked ? styles.checklistTextChecked : {}) }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategy-Specific Rules Checklist */}
            {selectedStrategy && currentStrategyChecklist && (
              <>
                <div style={{ marginTop: '32px', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: THEME.text.primary, margin: 0 }}>
                    {selectedStrategy.name} Rules Checklist
                  </h2>
                  <p style={{ fontSize: '13px', color: THEME.text.secondary, margin: '4px 0 0 0' }}>
                    Verify each rule before executing this strategy • {strategyProgress?.overall || 0}% Complete
                  </p>
                </div>

                <div style={styles.grid3}>
                  {/* Entry Rules */}
                  <div style={styles.checklistSection}>
                    <div style={styles.checklistTitle}>
                      <span style={{ color: THEME.blue }}>📥 Entry Rules</span>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: THEME.blue }}>{strategyProgress?.entry || 0}%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${strategyProgress?.entry || 0}%`, background: THEME.blue }} />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      {currentStrategyChecklist.entryRules.length > 0 ? (
                        currentStrategyChecklist.entryRules.map((rule: { id: string; text: string; checked: boolean }) => (
                          <div key={rule.id} style={{ ...styles.checklistItem, ...(rule.checked ? styles.checklistItemChecked : styles.checklistItemUnchecked) }} onClick={() => toggleStrategyRule(selectedStrategy.id, 'entry', rule.id)}>
                            <div style={{ ...styles.checkbox, ...(rule.checked ? { ...styles.checkboxChecked, background: THEME.blue, borderColor: THEME.blue } : {}) }}>
                              {rule.checked && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                            </div>
                            <span style={{ ...styles.checklistText, ...(rule.checked ? styles.checklistTextChecked : {}) }}>{rule.text}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '13px', color: THEME.text.muted, textAlign: 'center', padding: '20px' }}>No entry rules defined</p>
                      )}
                    </div>
                  </div>

                  {/* Exit Rules */}
                  <div style={styles.checklistSection}>
                    <div style={styles.checklistTitle}>
                      <span style={{ color: THEME.purple }}>📤 Exit Rules</span>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: THEME.purple }}>{strategyProgress?.exit || 0}%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${strategyProgress?.exit || 0}%`, background: THEME.purple }} />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      {currentStrategyChecklist.exitRules.length > 0 ? (
                        currentStrategyChecklist.exitRules.map((rule: { id: string; text: string; checked: boolean }) => (
                          <div key={rule.id} style={{ ...styles.checklistItem, ...(rule.checked ? styles.checklistItemChecked : styles.checklistItemUnchecked) }} onClick={() => toggleStrategyRule(selectedStrategy.id, 'exit', rule.id)}>
                            <div style={{ ...styles.checkbox, ...(rule.checked ? { ...styles.checkboxChecked, background: THEME.purple, borderColor: THEME.purple } : {}) }}>
                              {rule.checked && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                            </div>
                            <span style={{ ...styles.checklistText, ...(rule.checked ? styles.checklistTextChecked : {}) }}>{rule.text}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '13px', color: THEME.text.muted, textAlign: 'center', padding: '20px' }}>No exit rules defined</p>
                      )}
                    </div>
                  </div>

                  {/* Risk Rules */}
                  <div style={styles.checklistSection}>
                    <div style={styles.checklistTitle}>
                      <span style={{ color: THEME.win }}>🛡️ Risk Management</span>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: THEME.win }}>{strategyProgress?.risk || 0}%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${strategyProgress?.risk || 0}%`, background: THEME.win }} />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      {currentStrategyChecklist.riskRules.length > 0 ? (
                        currentStrategyChecklist.riskRules.map((rule: { id: string; text: string; checked: boolean }) => (
                          <div key={rule.id} style={{ ...styles.checklistItem, ...(rule.checked ? styles.checklistItemChecked : styles.checklistItemUnchecked) }} onClick={() => toggleStrategyRule(selectedStrategy.id, 'risk', rule.id)}>
                            <div style={{ ...styles.checkbox, ...(rule.checked ? { ...styles.checkboxChecked, background: THEME.win, borderColor: THEME.win } : {}) }}>
                              {rule.checked && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                            </div>
                            <span style={{ ...styles.checklistText, ...(rule.checked ? styles.checklistTextChecked : {}) }}>{rule.text}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '13px', color: THEME.text.muted, textAlign: 'center', padding: '20px' }}>No risk rules defined</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!selectedStrategy && (
              <div style={{ ...styles.card, marginTop: '32px', textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '16px', color: THEME.text.secondary, margin: 0 }}>
                  Select a strategy above to see its specific entry, exit, and risk management rules
                </p>
              </div>
            )}
          </>
        )}

        {/* TRADE PLAN TAB */}
        {activeTab === 'plan' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: THEME.text.primary, margin: 0 }}>Trade Planning Worksheet</h2>
              <p style={{ fontSize: '13px', color: THEME.text.secondary, margin: '4px 0 0 0' }}>Plan your trade before executing. If it is not on paper, it does not exist.</p>
            </div>

            <div style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Pre-Trade Analysis</div>
                <div style={styles.form}>
                  <div style={styles.field}>
                    <label style={styles.label}>Pair / Instrument</label>
                    <select style={styles.select}>
                      <option>Select pair...</option>
                      <option>EUR/USD</option>
                      <option>GBP/USD</option>
                      <option>USD/JPY</option>
                      <option>XAU/USD</option>
                      <option>US30</option>
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Strategy</label>
                    <select style={styles.select}>
                      <option>Select strategy...</option>
                      {strategies.map((s: Strategy) => <option key={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={styles.grid2}>
                    <div style={styles.field}>
                      <label style={styles.label}>Direction</label>
                      <select style={styles.select}>
                        <option>Long</option>
                        <option>Short</option>
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Session</label>
                      <select style={styles.select}>
                        <option>London</option>
                        <option>New York</option>
                        <option>Asia</option>
                        <option>Overlap</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardTitle}>Risk Management</div>
                <div style={styles.form}>
                  <div style={styles.grid2}>
                    <div style={styles.field}>
                      <label style={styles.label}>Account Size ($)</label>
                      <input type="number" style={styles.input} placeholder="50000" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Risk %</label>
                      <select style={styles.select}>
                        <option>0.5%</option>
                        <option>1.0%</option>
                        <option>1.5%</option>
                        <option>2.0%</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.grid2}>
                    <div style={styles.field}>
                      <label style={styles.label}>Entry Price</label>
                      <input type="number" style={styles.input} placeholder="1.0850" step="0.0001" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Stop Loss</label>
                      <input type="number" style={styles.input} placeholder="1.0820" step="0.0001" />
                    </div>
                  </div>
                  <div style={styles.grid2}>
                    <div style={styles.field}>
                      <label style={styles.label}>Take Profit</label>
                      <input type="number" style={styles.input} placeholder="1.0920" step="0.0001" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Position Size</label>
                      <input type="text" style={styles.input} placeholder="Auto-calculated" readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.card, ...{ gridColumn: 'span 2' } }}>
                <div style={styles.cardTitle}>Setup Confirmation</div>
                <div style={styles.grid3}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: THEME.text.secondary }}>
                    <input type="checkbox" /> HTF bias aligned
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: THEME.text.secondary }}>
                    <input type="checkbox" /> Clear setup present
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: THEME.text.secondary }}>
                    <input type="checkbox" /> Risk:Reward 1:2
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: THEME.text.secondary }}>
                    <input type="checkbox" /> No high-impact news
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: THEME.text.secondary }}>
                    <input type="checkbox" /> Within session time
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: THEME.text.secondary }}>
                    <input type="checkbox" /> Mental state good
                  </label>
                </div>
                <button style={{ ...styles.button, marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                  Save Trade Plan
                </button>
              </div>
            </div>
          </>
        )}

        {/* STRATEGY MODAL */}
        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: THEME.text.primary, margin: 0 }}>
                  {editingStrategy ? 'Edit Strategy' : 'New Strategy'}
                </h3>
                <button style={{ background: 'none', border: 'none', color: THEME.text.muted, fontSize: '20px', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.form}>
                  <div style={styles.field}>
                    <label style={styles.label}>Strategy Name *</label>
                    <input type="text" style={styles.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., ICT Silver Bullet" />
                  </div>

                  <div style={styles.grid2}>
                    <div style={styles.field}>
                      <label style={styles.label}>Timeframe</label>
                      <input type="text" style={styles.input} value={formData.timeframe} onChange={e => setFormData({ ...formData, timeframe: e.target.value })} placeholder="e.g., 5m / 1m" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Best Pairs (comma separated)</label>
                      <input type="text" style={styles.input} value={formData.bestPairs?.join(', ')} onChange={e => setFormData({ ...formData, bestPairs: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="EURUSD, GBPUSD" />
                    </div>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Description</label>
                    <textarea style={styles.textarea} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the strategy..." />
                  </div>

                  {/* Entry Rules */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={styles.label}>Entry Rules</label>
                      <button style={{ ...styles.buttonSecondary, padding: '6px 12px' }} onClick={() => addRuleField('entry')}>+ Add Rule</button>
                    </div>
                    {formData.entryRules?.map((rule, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" style={styles.input} value={rule} onChange={e => updateRuleField('entry', i, e.target.value)} placeholder={`Entry rule ${i + 1}`} />
                        <button style={styles.buttonDanger} onClick={() => removeRuleField('entry', i)}>Remove</button>
                      </div>
                    ))}
                  </div>

                  {/* Exit Rules */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={styles.label}>Exit Rules</label>
                      <button style={{ ...styles.buttonSecondary, padding: '6px 12px' }} onClick={() => addRuleField('exit')}>+ Add Rule</button>
                    </div>
                    {formData.exitRules?.map((rule, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" style={styles.input} value={rule} onChange={e => updateRuleField('exit', i, e.target.value)} placeholder={`Exit rule ${i + 1}`} />
                        <button style={styles.buttonDanger} onClick={() => removeRuleField('exit', i)}>Remove</button>
                      </div>
                    ))}
                  </div>

                  {/* Risk Rules */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={styles.label}>Risk Management Rules</label>
                      <button style={{ ...styles.buttonSecondary, padding: '6px 12px' }} onClick={() => addRuleField('risk')}>+ Add Rule</button>
                    </div>
                    {formData.riskRules?.map((rule, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" style={styles.input} value={rule} onChange={e => updateRuleField('risk', i, e.target.value)} placeholder={`Risk rule ${i + 1}`} />
                        <button style={styles.buttonDanger} onClick={() => removeRuleField('risk', i)}>Remove</button>
                      </div>
                    ))}
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Additional Notes</label>
                    <textarea style={styles.textarea} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes or observations..." />
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.buttonSecondary} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button style={styles.button} onClick={handleSaveStrategy}>
                  {editingStrategy ? 'Save Changes' : 'Create Strategy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
