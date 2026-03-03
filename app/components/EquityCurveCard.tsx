'use client';

/**
 * EquityCurveCard Component
 * Displays a line chart of cumulative P&L over time
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { EquityCurvePoint } from '../types';
import { formatLargeCurrency, formatShortDate } from '../lib/utils';

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  card: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
  },
  header: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },
  chartContainer: {
    height: '280px',
  },
  tooltip: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '12px',
  },
  tooltipLabel: {
    color: '#718096',
    marginBottom: '4px',
  },
  tooltipValue: {
    color: '#22c55e',
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
};

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; color: string }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const date = label ? new Date(label) : new Date();
    
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{formatShortDate(date)}</p>
        <p style={styles.tooltipValue}>
          {formatLargeCurrency(value)}
        </p>
      </div>
    );
  }
  return null;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

interface EquityCurveCardProps {
  data: EquityCurvePoint[];
  startingCapital?: number;
}

export default function EquityCurveCard({ data, startingCapital = 50000 }: EquityCurveCardProps) {
  // Transform data for the chart
  const chartData = data.map(point => ({
    date: point.date.toISOString(),
    balance: point.balance,
    pnl: point.pnl,
  }));

  // Find min and max for better y-axis scaling
  const balances = data.map(d => d.balance);
  const minBalance = Math.min(...balances, startingCapital);
  const maxBalance = Math.max(...balances, startingCapital);
  const padding = (maxBalance - minBalance) * 0.1;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Equity Curve</h2>
        <p style={styles.subtitle}>Cumulative P&L over time</p>
      </div>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#1c2230" 
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              stroke="#4a5568"
              tick={{ fill: '#718096', fontSize: 11 }}
              axisLine={{ stroke: '#1c2230' }}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              tickFormatter={(value) => formatLargeCurrency(value)}
              stroke="#4a5568"
              tick={{ fill: '#718096', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[minBalance - padding, maxBalance + padding]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={startingCapital} 
              stroke="#f0b429" 
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#equityGradient)"
              dot={false}
              activeDot={{ 
                r: 5, 
                stroke: '#0a0d12', 
                strokeWidth: 2,
                fill: '#22c55e'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
