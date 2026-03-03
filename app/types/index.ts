/**
 * Core data models for the TradeJournal Pro application
 * These types define the shape of all entities in the system
 */

/** User subscription plan */
export type UserPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

/** Represents a user of the application */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: UserPlan;
  createdAt: Date;
}

/** Trade direction - Long or Short */
export type TradeDirection = 'LONG' | 'SHORT';

/** Trade outcome */
export type TradeOutcome = 'WIN' | 'LOSS' | 'BREAKEVEN';

/** Represents a single trade */
export interface Trade {
  id: string;
  userId: string;
  instrument: string;        // e.g., "US30", "ETHUSD", "EURUSD"
  direction: TradeDirection;
  entryTime: Date;
  exitTime: Date;
  entryPrice: number;
  exitPrice: number;
  size: number;              // Position size/lots
  pnlCurrency: number;       // P&L in account currency
  pnlR: number;              // P&L in R-multiples
  outcome: TradeOutcome;
  strategyId: string;
  tags: string[];
  setup?: string;            // Setup type (e.g., "FVG Entry", "Order Block")
  session?: string;          // Trading session (e.g., "London", "NY")
  notes?: string;
}

/** Represents a trading strategy */
export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalTrades: number;
  winRate: number;           // Percentage (0-100)
  totalPnlCurrency: number;
  createdAt: Date;
}

/** Equity curve data point */
export interface EquityCurvePoint {
  date: Date;
  balance: number;
  pnl: number;
}

/** KPI metrics for the dashboard */
export interface KpiMetrics {
  totalReturn: {
    value: number;           // Percentage
    change: number;          // Change vs previous period
  };
  winRate: {
    overall: number;         // Percentage
    lastNTrades: number;     // Win rate over last N trades
    lastNCount: number;      // N value
  };
  profitFactor: {
    value: number;
    status: 'Healthy' | 'Good' | 'Poor' | 'Critical';
  };
  todaysPnl: {
    value: number;
    tradeCount: number;
  };
}

/** Performance metrics for the dashboard */
export interface PerformanceMetrics {
  expectancy: number;        // In R
  avgWin: number;            // In currency
  avgLoss: number;           // In currency (negative value)
  maxDrawdown: number;       // Percentage
  avgTradeDuration: string;  // Human readable duration
  totalTrades: number;
}

/** Recent trade display item */
export interface RecentTradeItem {
  id: string;
  instrument: string;
  exitTime: Date;
  pnlCurrency: number;
  pnlR: number;
}

/** Top strategy display item */
export interface TopStrategyItem {
  rank: number;
  strategyId: string;
  name: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
}

/** Navigation item for the sidebar */
export interface NavItem {
  label: string;
  href: string;
  icon: string;              // Icon name or component
}
