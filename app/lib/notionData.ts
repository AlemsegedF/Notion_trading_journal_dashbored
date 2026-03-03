/**
 * Real data layer - Fetches from Notion API via /api/trades
 * Fixed for proper Notion API validation
 */

import { Trade, Strategy, TradeOutcome } from '../types';

// ─── API RESPONSE TYPE (from Notion) ─────────────────────────────────────────

interface NotionTradeResponse {
  id: string;
  name: string;
  date: string;
  pair: string;
  session: string;
  direction: string;
  setup: string;
  htfBias: string;
  phase: string;
  rrPlanned: number;
  outcome: string;
  pnl: number;
  rMultiple: number;
  execGrade: string;
  sopOk: boolean;
  sopViolation: string;
  whatWorked: string;
  whatToImprove: string;
  tags: string[];
}

interface ApiResponse {
  trades: NotionTradeResponse[];
  count: number;
}

// ─── DATA TRANSFORMATION ─────────────────────────────────────────────────────

function transformNotionTrade(notionTrade: NotionTradeResponse): Trade {
  const outcome: TradeOutcome = notionTrade.outcome?.toUpperCase() === 'WIN' 
    ? 'WIN' 
    : notionTrade.outcome?.toUpperCase() === 'LOSS' 
      ? 'LOSS' 
      : 'BREAKEVEN';

  const tradeDate = new Date(notionTrade.date || new Date());
  const entryTime = new Date(tradeDate);
  entryTime.setHours(10, 0, 0, 0);
  const exitTime = new Date(tradeDate);
  exitTime.setHours(11, 0, 0, 0);

  const direction = notionTrade.direction?.toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG';
  const strategyId = notionTrade.setup || notionTrade.tags?.[0] || 'default';

  return {
    id: notionTrade.id,
    userId: 'current_user',
    instrument: notionTrade.pair || 'UNKNOWN',
    direction,
    entryTime,
    exitTime,
    entryPrice: 0,
    exitPrice: 0,
    size: 1,
    pnlCurrency: notionTrade.pnl || 0,
    pnlR: notionTrade.rMultiple || 0,
    outcome,
    strategyId,
    tags: notionTrade.tags || [],
    setup: notionTrade.setup,
    session: notionTrade.session,
    notes: notionTrade.whatWorked || notionTrade.whatToImprove || '',
  };
}

function generateStrategiesFromTrades(trades: Trade[]): Strategy[] {
  const strategyMap = new Map<string, Trade[]>();

  trades.forEach(trade => {
    const key = trade.setup || trade.strategyId || 'Default';
    if (!strategyMap.has(key)) strategyMap.set(key, []);
    strategyMap.get(key)!.push(trade);
  });

  return Array.from(strategyMap.entries()).map(([name, strategyTrades], index) => {
    const wins = strategyTrades.filter(t => t.outcome === 'WIN').length;
    const totalPnl = strategyTrades.reduce((sum, t) => sum + t.pnlCurrency, 0);

    return {
      id: `strat_${index + 1}`,
      userId: 'current_user',
      name,
      description: `Trades using ${name} setup`,
      totalTrades: strategyTrades.length,
      winRate: strategyTrades.length > 0 ? Math.round((wins / strategyTrades.length) * 100) : 0,
      totalPnlCurrency: totalPnl,
      createdAt: new Date(),
    };
  });
}

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

export async function fetchTradesFromNotion(): Promise<Trade[]> {
  try {
    const response = await fetch('/api/trades');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch trades: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (!data.trades || !Array.isArray(data.trades)) {
      throw new Error('Invalid response format from API');
    }

    return data.trades.map(transformNotionTrade);
  } catch (error) {
    console.error('Error fetching trades from Notion:', error);
    throw error;
  }
}

export async function fetchTodaysTradesFromNotion(): Promise<Trade[]> {
  const trades = await fetchTradesFromNotion();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return trades.filter(trade => {
    const tradeDate = new Date(trade.exitTime);
    tradeDate.setHours(0, 0, 0, 0);
    return tradeDate.getTime() === today.getTime();
  });
}

export async function fetchStrategiesFromNotion(): Promise<Strategy[]> {
  const trades = await fetchTradesFromNotion();
  return generateStrategiesFromTrades(trades);
}

export async function fetchRecentTradesFromNotion(count: number = 5): Promise<Trade[]> {
  const trades = await fetchTradesFromNotion();
  return trades
    .sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime())
    .slice(0, count);
}

/**
 * Create a new trade in Notion - Fixed for proper API validation
 */
export async function createTradeInNotion(tradeData: {
  name: string;
  date: string;
  pair: string;
  session: string;
  direction: string;
  setup: string;
  htfBias: string;
  phase: string;
  outcome: string;
  pnl: number;
  rMultiple: number;
  rrPlanned: number;
  execGrade: string;
  sopOk: boolean;
  whatWorked: string;
  whatToImprove: string;
  sopViolation: string;
  tags: string[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('/api/trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Notion API error:', errorData);
      throw new Error(errorData.error || `Failed to create trade: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error creating trade in Notion:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function isNotionConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/trades');
    if (response.status === 400) {
      const data = await response.json().catch(() => ({}));
      if (data.error?.includes('Missing NOTION_TOKEN') || data.error?.includes('Missing NOTION_DATABASE_ID')) {
        return false;
      }
    }
    return response.ok;
  } catch {
    return false;
  }
}
