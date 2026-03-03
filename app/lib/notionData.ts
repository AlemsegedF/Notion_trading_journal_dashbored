/**
 * Real data layer - Fetches from Notion API via /api/trades
 * Replace mock data with actual database queries
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

/**
 * Transform Notion API response to Trade type
 */
function transformNotionTrade(notionTrade: NotionTradeResponse): Trade {
  // Map Notion outcome to TradeOutcome
  const outcome: TradeOutcome = notionTrade.outcome?.toUpperCase() === 'WIN' 
    ? 'WIN' 
    : notionTrade.outcome?.toUpperCase() === 'LOSS' 
      ? 'LOSS' 
      : 'BREAKEVEN';

  // Parse date - use date as both entry and exit for now
  // If you have separate entry/exit dates in Notion, update this
  const tradeDate = new Date(notionTrade.date || new Date());

  // Generate entry/exit times (exit is same day, 1 hour later as placeholder)
  const entryTime = new Date(tradeDate);
  entryTime.setHours(10, 0, 0, 0);
  
  const exitTime = new Date(tradeDate);
  exitTime.setHours(11, 0, 0, 0);

  // Map direction to LONG/SHORT
  const direction = notionTrade.direction?.toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG';

  // Generate strategy ID from setup type or tags
  const strategyId = notionTrade.setup || notionTrade.tags?.[0] || 'default';

  // Generate placeholder prices (Notion API doesn't have these)
  // You can add these fields to your Notion database if needed
  const basePrice = 100;
  const priceMove = (notionTrade.pnl || 0) / 100;
  const entryPrice = basePrice;
  const exitPrice = direction === 'LONG' ? basePrice + priceMove : basePrice - priceMove;

  return {
    id: notionTrade.id,
    userId: 'current_user', // Will be replaced with actual auth
    instrument: notionTrade.pair || 'UNKNOWN',
    direction,
    entryTime,
    exitTime,
    entryPrice,
    exitPrice,
    size: 1, // Default size
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

/**
 * Generate strategies from trade data
 * Extracts unique setups/strategies from trades
 */
function generateStrategiesFromTrades(trades: Trade[]): Strategy[] {
  const strategyMap = new Map<string, Trade[]>();

  // Group trades by strategy/setup
  trades.forEach(trade => {
    const key = trade.setup || trade.strategyId || 'Default';
    if (!strategyMap.has(key)) {
      strategyMap.set(key, []);
    }
    strategyMap.get(key)!.push(trade);
  });

  // Calculate strategy stats
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

/**
 * Fetch all trades from Notion via API
 */
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

/**
 * Fetch today's trades
 */
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

/**
 * Fetch strategies (derived from trade setups)
 */
export async function fetchStrategiesFromNotion(): Promise<Strategy[]> {
  const trades = await fetchTradesFromNotion();
  return generateStrategiesFromTrades(trades);
}

/**
 * Fetch recent trades (last N)
 */
export async function fetchRecentTradesFromNotion(count: number = 5): Promise<Trade[]> {
  const trades = await fetchTradesFromNotion();
  return trades
    .sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime())
    .slice(0, count);
}

/**
 * Create a new trade in Notion
 */
export async function createTradeInNotion(tradeData: Partial<NotionTradeResponse>): Promise<{ success: boolean; id?: string; error?: string }> {
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

// ─── FALLBACK FOR MISSING ENV VARS ───────────────────────────────────────────

/**
 * Check if Notion is configured
 */
export async function isNotionConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/trades');
    // If we get a 400 with "Missing NOTION_TOKEN", Notion is not configured
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
