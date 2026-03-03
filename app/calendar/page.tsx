'use client';

/**
 * Calendar Page - Modern with optimized loading
 * Trading calendar with trade history
 */

import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { mockUser } from '../lib/mockData';
import { useTrades } from '../hooks/useTrades';
import AppShell from '../components/AppShell';
import { SkeletonCalendar } from '../components/Skeleton';
import { formatCurrency, formatShortDate, getValueColor } from '../lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const styles = {
  header: {
    marginBottom: '24px',
    animation: 'fadeIn 0.4s ease-out',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em',
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
    animation: 'fadeIn 0.4s ease-out',
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navButton: {
    padding: '10px 14px',
    backgroundColor: 'rgba(28, 34, 48, 0.8)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonHover: {
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
    borderColor: 'rgba(240, 180, 41, 0.3)',
  },
  monthTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#e2e8f0',
    minWidth: '220px',
    textAlign: 'center' as const,
  },
  todayButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #f0b429 0%, #f59e0b 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#0a0d12',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(240, 180, 41, 0.3)',
  },
  calendar: {
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    padding: '24px',
    animation: 'fadeIn 0.5s ease-out',
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
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    padding: '10px',
    letterSpacing: '0.05em',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  dayCell: {
    aspectRatio: '1',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    border: '2px solid transparent',
  },
  dayCellEmpty: {
    backgroundColor: 'transparent',
    cursor: 'default',
  },
  dayCellToday: {
    borderColor: '#f0b429',
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
  },
  dayCellSelected: {
    borderColor: 'rgba(240, 180, 41, 0.5)',
    backgroundColor: 'rgba(28, 34, 48, 0.8)',
  },
  dayCellHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
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
    gap: '3px',
    marginTop: '6px',
    width: '100%',
  },
  dayTrade: {
    fontSize: '10px',
    padding: '3px 6px',
    borderRadius: '4px',
    textAlign: 'center' as const,
    fontWeight: 600,
  },
  tradeList: {
    marginTop: '24px',
    background: 'linear-gradient(135deg, #0f1318 0%, #1c2230 100%)',
    border: '1px solid rgba(28, 34, 48, 0.8)',
    borderRadius: '16px',
    padding: '24px',
    animation: 'fadeIn 0.4s ease-out',
  },
  tradeListTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 16px 0',
  },
  tradeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    backgroundColor: 'rgba(28, 34, 48, 0.5)',
    borderRadius: '12px',
    marginBottom: '10px',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  tradeItemHover: {
    backgroundColor: 'rgba(28, 34, 48, 0.8)',
    borderColor: 'rgba(240, 180, 41, 0.2)',
    transform: 'translateX(4px)',
  },
  tradeInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
  },
  tradeInstrument: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tradeSetup: {
    fontSize: '13px',
    color: '#718096',
  },
  tradeOutcome: {
    fontSize: '12px',
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: '20px',
  },
  loading: {
    padding: '60px',
    textAlign: 'center' as const,
    color: '#718096',
  },
  demoBanner: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(240, 180, 41, 0.1) 100%)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'fadeIn 0.4s ease-out',
  },
  demoIcon: {
    fontSize: '20px',
  },
  demoText: {
    fontSize: '13px',
    color: '#f59e0b',
    margin: 0,
    fontWeight: 500,
  },
};

export default function CalendarPage() {
  const [user] = useState<User>(mockUser);
  const { trades, isLoading, usingMockData, refresh } = useTrades();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredTrade, setHoveredTrade] = useState<string | null>(null);
  const [navBtnHovered, setNavBtnHovered] = useState<number | null>(null);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.exitTime);
        return tradeDate.getDate() === day && tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
      });
      days.push({ date, trades: dayTrades });
    }
    return { days, year, month };
  }, [currentDate, trades]);

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
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  if (isLoading && trades.length === 0) {
    return (
      <AppShell user={user}>
        <div style={styles.header}>
          <h1 style={styles.title}>Calendar</h1>
          <p style={styles.subtitle}>View your trading activity by date</p>
        </div>
        <SkeletonCalendar />
      </AppShell>
    );
  }

  return (
    <AppShell user={user} onTradeCreated={refresh}>
      <div style={styles.header}>
        <h1 style={styles.title}>Calendar</h1>
        <p style={styles.subtitle}>View your trading activity by date</p>
      </div>

      {usingMockData && (
        <div style={styles.demoBanner}>
          <span style={styles.demoIcon}>⚡</span>
          <p style={styles.demoText}>Demo Mode: Add NOTION_TOKEN to use real data</p>
        </div>
      )}

      <div style={styles.controls}>
        <div style={styles.monthSelector}>
          <button 
            style={{ ...styles.navButton, ...(navBtnHovered === -1 ? styles.navButtonHover : {}) }}
            onClick={() => navigateMonth(-1)}
            onMouseEnter={() => setNavBtnHovered(-1)}
            onMouseLeave={() => setNavBtnHovered(null)}
          >←</button>
          <div style={styles.monthTitle}>{MONTHS[calendarData.month]} {calendarData.year}</div>
          <button 
            style={{ ...styles.navButton, ...(navBtnHovered === 1 ? styles.navButtonHover : {}) }}
            onClick={() => navigateMonth(1)}
            onMouseEnter={() => setNavBtnHovered(1)}
            onMouseLeave={() => setNavBtnHovered(null)}
          >→</button>
        </div>
        <button style={styles.todayButton} onClick={goToToday}>Today</button>
      </div>

      <div style={styles.calendar}>
        <div style={styles.weekDays}>
          {DAYS.map(day => <div key={day} style={styles.weekDay}>{day}</div>)}
        </div>
        <div style={styles.daysGrid}>
          {calendarData.days.map((dayData, index) => {
            if (!dayData) return <div key={`empty-${index}`} style={{ ...styles.dayCell, ...styles.dayCellEmpty }} />;
            const { date, trades: dayTrades } = dayData;
            return (
              <div
                key={date.toISOString()}
                style={{
                  ...styles.dayCell,
                  ...(isToday(date) ? styles.dayCellToday : {}),
                  ...(selectedDate?.getTime() === date.getTime() ? styles.dayCellSelected : {}),
                  ...(hoveredDay === index ? styles.dayCellHover : {}),
                }}
                onClick={() => setSelectedDate(date)}
                onMouseEnter={() => setHoveredDay(index)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <span style={{ ...styles.dayNumber, ...(date.getMonth() !== calendarData.month ? styles.dayNumberMuted : {}) }}>
                  {date.getDate()}
                </span>
                {dayTrades.length > 0 && (
                  <div style={styles.dayTrades}>
                    {dayTrades.slice(0, 3).map((trade, i) => (
                      <div key={i} style={{ ...styles.dayTrade, backgroundColor: trade.outcome === 'WIN' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: trade.outcome === 'WIN' ? '#22c55e' : '#ef4444' }}>
                        {trade.instrument}
                      </div>
                    ))}
                    {dayTrades.length > 3 && (
                      <div style={{ ...styles.dayTrade, backgroundColor: '#252d3d', color: '#718096' }}>+{dayTrades.length - 3}</div>
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
          <h3 style={styles.tradeListTitle}>Trades on {formatShortDate(selectedDate)}</h3>
          {selectedDateTrades.map((trade) => (
            <div 
              key={trade.id} 
              style={{ ...styles.tradeItem, ...(hoveredTrade === trade.id ? styles.tradeItemHover : {}) }}
              onMouseEnter={() => setHoveredTrade(trade.id)}
              onMouseLeave={() => setHoveredTrade(null)}
            >
              <div style={styles.tradeInfo}>
                <span style={styles.tradeInstrument}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: trade.outcome === 'WIN' ? '#22c55e' : '#ef4444' }} />
                  {trade.instrument}
                </span>
                <span style={styles.tradeSetup}>{trade.setup} • {trade.direction}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: getValueColor(trade.pnlCurrency) }}>
                  {formatCurrency(trade.pnlCurrency)}
                </span>
                <span style={{ ...styles.tradeOutcome, backgroundColor: trade.outcome === 'WIN' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: trade.outcome === 'WIN' ? '#22c55e' : '#ef4444' }}>
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
