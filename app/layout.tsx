import type { Metadata } from 'next';
import './globals.css';

/**
 * Root Layout
 * Provides the base HTML structure and global styles
 */

export const metadata: Metadata = {
  title: 'TradeJournal Pro - Professional Trading Analytics',
  description: 'Track, analyze, and improve your trading performance with professional-grade analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts - Inter and JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
