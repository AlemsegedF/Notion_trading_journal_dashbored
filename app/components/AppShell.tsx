'use client';

/**
 * AppShell Component
 * Provides the global layout with top bar and left navigation
 * Responsive design - desktop first
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, NavItem } from '../types';
import { getInitials } from '../lib/utils';
import NewTradeModal from './NewTradeModal';

// ─── NAVIGATION CONFIG ───────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Journal', href: '/journal', icon: 'journal' },
  { label: 'Analytics', href: '/analytics', icon: 'analytics' },
  { label: 'Calendar', href: '/calendar', icon: 'calendar' },
  { label: 'Strategies', href: '/strategies', icon: 'strategies' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

// ─── ICON COMPONENTS ─────────────────────────────────────────────────────────

const Icons: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  dashboard: ({ className, style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  journal: ({ className, style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  analytics: ({ className, style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  calendar: ({ className, style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  strategies: ({ className, style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  settings: ({ className, style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  plus: ({ className, style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0a0d12',
    color: '#e2e8f0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#0f1318',
    borderRight: '1px solid #1c2230',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 50,
  },
  sidebarHeader: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid #1c2230',
  },
  appName: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#f0b429',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  appTagline: {
    fontSize: '11px',
    color: '#718096',
    marginTop: '2px',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#a0aec0',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },
  navLinkActive: {
    backgroundColor: '#1c2230',
    color: '#f0b429',
  },
  navIcon: {
    width: '20px',
    height: '20px',
  },
  sidebarFooter: {
    padding: '16px 12px',
    borderTop: '1px solid #1c2230',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#1c2230',
    borderRadius: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f0b429',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0a0d12',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: 0,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '11px',
    color: '#718096',
    margin: 0,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  planBadge: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#0a0d12',
    backgroundColor: '#f0b429',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.02em',
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  },
  topBar: {
    height: '64px',
    backgroundColor: '#0f1318',
    borderBottom: '1px solid #1c2230',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 40,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  breadcrumb: {
    fontSize: '14px',
    color: '#718096',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  newTradeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f0b429',
    color: '#0a0d12',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  content: {
    flex: 1,
    padding: '24px',
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode;
  user: User;
  onTradeCreated?: () => void;
}

export default function AppShell({ children, user, onTradeCreated }: AppShellProps) {
  const pathname = usePathname();
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false);

  const getNavLinkStyle = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return {
      ...styles.navLink,
      ...(isActive ? styles.navLinkActive : {}),
    };
  };

  return (
    <div style={styles.shell}>
      {/* ─── SIDEBAR ─── */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.sidebarHeader}>
          <h1 style={styles.appName}>TradeJournal Pro</h1>
          <p style={styles.appTagline}>Professional Trading Analytics</p>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const Icon = Icons[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                style={getNavLinkStyle(item.href)}
              >
                <Icon style={styles.navIcon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userCard}>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatar}>{getInitials(user.name)}</div>
            )}
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user.name}</p>
              <p style={styles.userEmail}>{user.email}</p>
            </div>
            {user.plan === 'PRO' && (
              <span style={styles.planBadge}>PRO</span>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main style={styles.main}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            {/* Can add breadcrumbs here if needed */}
          </div>
          <div style={styles.topBarRight}>
            <button
              style={styles.newTradeBtn}
              onClick={() => setIsNewTradeModalOpen(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5c446';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0b429';
              }}
            >
              <Icons.plus style={{ width: '16px', height: '16px' }} />
              New Trade
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={styles.content}>
          {children}
        </div>
      </main>

      {/* New Trade Modal */}
      <NewTradeModal
        isOpen={isNewTradeModalOpen}
        onClose={() => setIsNewTradeModalOpen(false)}
        onTradeCreated={onTradeCreated}
      />
    </div>
  );
}
