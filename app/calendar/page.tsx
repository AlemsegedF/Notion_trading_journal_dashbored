'use client';

/**
 * Calendar Page
 * Trading calendar with trade history
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User, Trade } from '../types';
import { mockUser } from '../lib/mockData';
import { fetchTradesFromNotion, isNotionConfigured } from '../lib/notionData';
import AppShell from '../components/AppShell';
import { formatCurrency, formatShortDate, getValueColor } from '../lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const styles = {
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navButton: {
    padding: '8px 12px',
    backgroundColor: '#1c2230',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '16px',
    cursor: 'pointer',
  },
  monthTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e2e8f0',
    minWidth: '200px',
    textAlign: 'center' as const,
  },
  todayButton: {
    padding: '8px 16px',
    backgroundColor: '#f0b429',
    border: 'none',
    borderRadius: '8px',
    color: '#0a0d12',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  calendar: {
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
  },
  weekDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '8px',
  },
  weekDay: {
    textAlign: 'center' as const,
    fontSize: '12px',
    fontWeight: 600,
    color: '#718096',
    textTransform: 'uppercase' as const,
    padding: '8px',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  dayCell: {
    aspectRatio: '1',
    backgroundColor: '#1c2230',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.15s',
    position: 'relative' as const,
  },
  dayCellEmpty: {
    backgroundColor: 'transparent',
    cursor: 'default',
  },
  dayCellToday: {
    border: '2px solid #f0b429',
  },
  dayNumber: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  dayNumberMuted: {
    color: '#4a5568',
  },
  dayTrades: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    marginTop: '4px',
    width: '100%',
  },
  dayTrade: {
    fontSize: '10px',
    padding: '2px 4px',
    borderRadius: '3px',
    textAlign: 'center' as const,
    fontWeight: 600,
  },
  tradeList: {
    marginTop: '24px',
    backgroundColor: '#0f1318',
    border: '1px solid #1c2230',
    borderRadius: '12px',
    padding: '20px',
  },
  tradeListTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 16px 0',
  },
  tradeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#1c2230',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  tradeInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  tradeInstrument: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  tradeSetup: {
    fontSize: '12px',
    color: '#718096',
  },
  tradeOutcome: {
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '6px',
  },
  loading: {
    padding: '60px',
    textAlign: 'center' as const,
    color: '#718096',
  },
};

export default function CalendarPage() {
  const [user] = useState<User>(mockUser);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const notionReady = await isNotionConfigured();
      if (notionReady) {
        const realTrades = await fetchTradesFromNotion();
        setTrades(realTrades);
      } else {
        const { mockTrades } = await import('../lib/mockData');
        setTrades(mockTrades);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      const { mockTrades } = await import('../lib/mockData');
      setTrades(mockTrades);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calendar calculations
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.exitTime);
        return tradeDate.getDate() === day &&
               tradeDate.getMonth() === month &&
               tradeDate.getFullYear() === year;
      });
      days.push({ date, trades: dayTrades });
    }

    return { days, year, month };
  }, [currentDate, trades]);

  // Selected date trades
  const selectedDateTrades = useMemo(() => {
    if (!selectedDate) return [];
    return trades.filter(trade => {
      const tradeDate = new Date(trade.exitTime);
      return tradeDate.getDate() === selectedDate.getDate() &&
             tradeDate.getMonth() === selectedDate.getMonth() &&
             tradeDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [selectedDate, trades]);

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  if (isLoading) {
    return (
      <AppShell user={user} onTradeCreated={loadData}>
        <div style={styles.loading}>Loading calendar...</div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div style={styles.header}>
        <h1 style={styles.title}>Calendar</h1>
        <p style={styles.subtitle}>View your trading activity by date</p>
      </div>

      <div style={styles.controls}>
        <div style={styles.monthSelector}>
          <button style={styles.navButton} onClick={() => navigateMonth(-1)}>←</button>
          <div style={styles.monthTitle}>
            {MONTHS[calendarData.month]} {calendarData.year}
          </div>
          <button style={styles.navButton} onClick={() => navigateMonth(1)}>→</button>
        </div>
        <button style={styles.todayButton} onClick={goToToday}>Today</button>
      </div>

      <div style={styles.calendar}>
        <div style={styles.weekDays}>
          {DAYS.map(day => (
            <div key={day} style={styles.weekDay}>{day}</div>
          ))}
        </div>
        <div style={styles.daysGrid}>
          {calendarData.days.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} style={{ ...styles.dayCell, ...styles.dayCellEmpty }} />;
            }

            const { date, trades: dayTrades } = dayData;
            const winCount = dayTrades.filter(t => t.outcome === 'WIN').length;
            const lossCount = dayTrades.filter(t => t.outcome === 'LOSS').length;
            const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnlCurrency, 0);

            return (
              <div
                key={date.toISOString()}
                style={{
                  ...styles.dayCell,
                  ...(isToday(date) ? styles.dayCellToday : {}),
                  ...(selectedDate?.getTime() === date.getTime() ? { backgroundColor: '#252d3d' } : {}),
                }}
                onClick={() => setSelectedDate(date)}
              >
                <span style={{
                  ...styles.dayNumber,
                  ...(date.getMonth() !== calendarData.month ? styles.dayNumberMuted : {}),
                }}>
                  {date.getDate()}
                </span>
                {dayTrades.length > 0 && (
                  <div style={styles.dayTrades}>
                    {dayTrades.slice(0, 3).map((trade, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.dayTrade,
                          backgroundColor: trade.outcome === 'WIN' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: trade.outcome === 'WIN' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {trade.instrument}
                      </div>
                    ))}
                    {dayTrades.length > 3 && (
                      <div style={{ ...styles.dayTrade, backgroundColor: '#252d3d', color: '#718096' }}>
                        +{dayTrades.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedDateTrades.length > 0 && (
        <div style={styles.tradeList}>
          <h3 style={styles.tradeListTitle}>
            Trades on {formatShortDate(selectedDate)}
          </h3>
          {selectedDateTrades.map((trade) => (
            <div key={trade.id} style={styles.tradeItem}>
              <div style={styles.tradeInfo}>
                <span style={styles.tradeInstrument}>{trade.instrument}</span>
                <span style={styles.tradeSetup}>{trade.setup} • {trade.direction}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: getValueColor(trade.pnlCurrency) }}>
                  {formatCurrency(trade.pnlCurrency)}
                </span>
                <span style={{
                  ...styles.tradeOutcome,
                  backgroundColor: trade.outcome === 'WIN' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: trade.outcome === 'WIN' ? '#22c55e' : '#ef4444',
                }}>
                  {trade.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
