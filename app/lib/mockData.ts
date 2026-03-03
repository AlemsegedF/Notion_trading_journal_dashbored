/**
 * Mock data layer for TradeJournal Pro
 * This simulates a backend database until real data source is connected
 * 
 * TODO: Replace these functions with actual API calls to:
 * - Notion API
 * - Database (PostgreSQL, MongoDB, etc.)
 * - External trading platform APIs
 */

import { User, Trade, Strategy, EquityCurvePoint, UserPlan, TradeDirection, TradeOutcome } from '../types';

// ─── MOCK USER ───────────────────────────────────────────────────────────────

export const mockUser: User = {
  id: 'user_001',
  name: 'Alex Trader',
  email: 'alex@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  plan: 'PRO',
  createdAt: new Date('2025-01-15'),
};

// ─── MOCK STRATEGIES ─────────────────────────────────────────────────────────

export const mockStrategies: Strategy[] = [
  {
    id: 'strat_001',
    userId: 'user_001',
    name: 'Momentum Breakout',
    description: 'Trading breakouts from key levels with momentum confirmation',
    totalTrades: 48,
    winRate: 58,
    totalPnlCurrency: 15420.50,
    createdAt: new Date('2025-01-20'),
  },
  {
    id: 'strat_002',
    userId: 'user_001',
    name: 'Support Bounce',
    description: 'Buying at support levels with rejection confirmation',
    totalTrades: 59,
    winRate: 53,
    totalPnlCurrency: -3250.75,
    createdAt: new Date('2025-02-01'),
  },
  {
    id: 'strat_003',
    userId: 'user_001',
    name: 'Trend Following',
    description: 'Following established trends on higher timeframes',
    totalTrades: 64,
    winRate: 55,
    totalPnlCurrency: 28450.25,
    createdAt: new Date('2025-01-25'),
  },
  {
    id: 'strat_004',
    userId: 'user_001',
    name: 'News Fade',
    description: 'Fading initial news spikes for reversion plays',
    totalTrades: 51,
    winRate: 55,
    totalPnlCurrency: 8750.00,
    createdAt: new Date('2025-02-10'),
  },
];

// ─── MOCK TRADES ─────────────────────────────────────────────────────────────

// Generate realistic trade data
function generateMockTrades(): Trade[] {
  const trades: Trade[] = [];
  const instruments = ['US30', 'ETHUSD', 'EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY'];
  const strategies = mockStrategies;
  
  // Starting balance for equity curve calculation
  let currentBalance = 50000;
  const startingBalance = currentBalance;
  
  // Generate trades from Jan 2026 to present (March 4, 2026)
  const startDate = new Date('2026-01-01');
  const endDate = new Date('2026-03-04');
  
  let tradeId = 1;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    
    // Random number of trades per day (0-3)
    const tradesToday = Math.floor(Math.random() * 3);
    
    for (let t = 0; t < tradesToday; t++) {
      const instrument = instruments[Math.floor(Math.random() * instruments.length)];
      const strategy = strategies[Math.floor(Math.random() * strategies.length)];
      const direction: TradeDirection = Math.random() > 0.5 ? 'LONG' : 'SHORT';
      
      // Generate realistic P&L based on win rate bias
      const isWin = Math.random() < 0.58; // 58% win rate
      const pnlR = isWin 
        ? 1 + Math.random() * 3 // Wins: 1R to 4R
        : -(0.5 + Math.random() * 0.7); // Losses: -0.5R to -1.2R
      
      const riskAmount = currentBalance * 0.01; // 1% risk per trade
      const pnlCurrency = pnlR * riskAmount;
      
      // Entry/exit times
      const entryTime = new Date(d);
      entryTime.setHours(9 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));
      
      const exitTime = new Date(entryTime);
      exitTime.setHours(exitTime.getHours() + 1 + Math.floor(Math.random() * 4));
      
      // Price calculation
      let basePrice = 100;
      if (instrument === 'EURUSD' || instrument === 'GBPUSD') basePrice = 1.05 + Math.random() * 0.1;
      else if (instrument === 'USDJPY') basePrice = 148 + Math.random() * 5;
      else if (instrument === 'XAUUSD') basePrice = 2000 + Math.random() * 200;
      else if (instrument === 'ETHUSD') basePrice = 3000 + Math.random() * 500;
      else if (instrument === 'US30') basePrice = 42000 + Math.random() * 2000;
      
      const entryPrice = basePrice;
      const priceMove = (pnlCurrency / 100) / basePrice;
      const exitPrice = direction === 'LONG' 
        ? entryPrice + priceMove 
        : entryPrice - priceMove;
      
      const trade: Trade = {
        id: `trade_${tradeId.toString().padStart(3, '0')}`,
        userId: 'user_001',
        instrument,
        direction,
        entryTime,
        exitTime,
        entryPrice,
        exitPrice,
        size: 1,
        pnlCurrency,
        pnlR,
        outcome: pnlR > 0 ? 'WIN' : pnlR < 0 ? 'LOSS' : 'BREAKEVEN',
        strategyId: strategy.id,
        tags: [strategy.name, direction, instrument],
        setup: ['FVG Entry', 'Order Block', 'Liquidity Sweep', 'Breaker Block', 'OTE Fib'][Math.floor(Math.random() * 5)],
        session: Math.random() > 0.5 ? 'London' : 'NY',
      };
      
      trades.push(trade);
      currentBalance += pnlCurrency;
      tradeId++;
    }
  }
  
  return trades.sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());
}

export const mockTrades: Trade[] = generateMockTrades();

// ─── MOCK DATA API FUNCTIONS ─────────────────────────────────────────────────

/**
 * Fetches the current user
 * TODO: Replace with actual auth/user API call
 */
export async function fetchCurrentUser(): Promise<User> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockUser;
}

/**
 * Fetches all trades for the current user
 * TODO: Replace with actual trades API call
 */
export async function fetchTrades(): Promise<Trade[]> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return mockTrades;
}

/**
 * Fetches all strategies for the current user
 * TODO: Replace with actual strategies API call
 */
export async function fetchStrategies(): Promise<Strategy[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockStrategies;
}

/**
 * Fetches trades for today
 */
export async function fetchTodaysTrades(): Promise<Trade[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return mockTrades.filter(trade => {
    const tradeDate = new Date(trade.exitTime);
    tradeDate.setHours(0, 0, 0, 0);
    return tradeDate.getTime() === today.getTime();
  });
}

/**
 * Fetches recent trades (last N trades)
 */
export async function fetchRecentTrades(count: number = 5): Promise<Trade[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockTrades
    .slice()
    .sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime())
    .slice(0, count);
}

/**
 * Calculates total return percentage
 */
export function calculateTotalReturn(trades: Trade[], startingCapital: number = 50000): number {
  const totalPnl = trades.reduce((sum, t) => sum + t.pnlCurrency, 0);
  return (totalPnl / startingCapital) * 100;
}

/**
 * Calculates win rate over all trades
 */
export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.outcome === 'WIN').length;
  return (wins / trades.length) * 100;
}

/**
 * Calculates win rate over last N trades
 */
export function calculateWinRateLastN(trades: Trade[], n: number): number {
  const sorted = trades.slice().sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime());
  const lastN = sorted.slice(0, n);
  return calculateWinRate(lastN);
}

/**
 * Calculates profit factor (gross profit / gross loss)
 */
export function calculateProfitFactor(trades: Trade[]): number {
  const grossProfit = trades
    .filter(t => t.pnlCurrency > 0)
    .reduce((sum, t) => sum + t.pnlCurrency, 0);
  const grossLoss = Math.abs(trades
    .filter(t => t.pnlCurrency < 0)
    .reduce((sum, t) => sum + t.pnlCurrency, 0));
  
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/**
 * Gets qualitative status for profit factor
 */
export function getProfitFactorStatus(pf: number): 'Healthy' | 'Good' | 'Poor' | 'Critical' {
  if (pf >= 2.0) return 'Healthy';
  if (pf >= 1.5) return 'Good';
  if (pf >= 1.0) return 'Poor';
  return 'Critical';
}

/**
 * Calculates expectancy in R-multiples
 * Expectancy = (Win% × Avg Win R) - (Loss% × Avg Loss R)
 */
export function calculateExpectancy(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  
  const wins = trades.filter(t => t.outcome === 'WIN');
  const losses = trades.filter(t => t.outcome === 'LOSS');
  
  if (wins.length === 0 || losses.length === 0) return 0;
  
  const winRate = wins.length / trades.length;
  const lossRate = losses.length / trades.length;
  
  const avgWinR = wins.reduce((sum, t) => sum + t.pnlR, 0) / wins.length;
  const avgLossR = Math.abs(losses.reduce((sum, t) => sum + t.pnlR, 0) / losses.length);
  
  return (winRate * avgWinR) - (lossRate * avgLossR);
}

/**
 * Calculates average win in currency
 */
export function calculateAvgWin(trades: Trade[]): number {
  const wins = trades.filter(t => t.outcome === 'WIN');
  if (wins.length === 0) return 0;
  return wins.reduce((sum, t) => sum + t.pnlCurrency, 0) / wins.length;
}

/**
 * Calculates average loss in currency (returns negative value)
 */
export function calculateAvgLoss(trades: Trade[]): number {
  const losses = trades.filter(t => t.outcome === 'LOSS');
  if (losses.length === 0) return 0;
  return losses.reduce((sum, t) => sum + t.pnlCurrency, 0) / losses.length;
}

/**
 * Calculates maximum drawdown percentage
 */
export function calculateMaxDrawdown(trades: Trade[], startingCapital: number = 50000): number {
  let peak = startingCapital;
  let maxDrawdown = 0;
  let currentBalance = startingCapital;
  
  // Sort trades chronologically
  const sortedTrades = trades.slice().sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());
  
  for (const trade of sortedTrades) {
    currentBalance += trade.pnlCurrency;
    
    if (currentBalance > peak) {
      peak = currentBalance;
    }
    
    const drawdown = ((peak - currentBalance) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

/**
 * Calculates average trade duration
 */
export function calculateAvgTradeDuration(trades: Trade[]): string {
  if (trades.length === 0) return '0h';
  
  const totalMs = trades.reduce((sum, t) => {
    return sum + (t.exitTime.getTime() - t.entryTime.getTime());
  }, 0);
  
  const avgMs = totalMs / trades.length;
  const hours = Math.floor(avgMs / (1000 * 60 * 60));
  const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Generates equity curve data points
 */
export function generateEquityCurve(trades: Trade[], startingCapital: number = 50000): EquityCurvePoint[] {
  let balance = startingCapital;
  
  // Sort trades chronologically
  const sortedTrades = trades.slice().sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());
  
  return sortedTrades.map(trade => {
    balance += trade.pnlCurrency;
    return {
      date: trade.exitTime,
      balance: balance,
      pnl: trade.pnlCurrency,
    };
  });
}

/**
 * Gets top performing strategies
 */
export function getTopStrategies(strategies: Strategy[], limit: number = 4): Strategy[] {
  return strategies
    .slice()
    .sort((a, b) => b.totalPnlCurrency - a.totalPnlCurrency)
    .slice(0, limit);
}
