'use client';

/**
 * Skeleton Loading Components
 * Modern loading placeholders for better UX
 */

import React from 'react';

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
`;

const baseStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #1c2230 25%, #252d3d 50%, #1c2230 75%)',
  backgroundSize: '1000px 100%',
  animation: 'shimmer 2s infinite linear',
  borderRadius: '4px',
};

export const SkeletonCard: React.FC<{ height?: number; className?: string }> = ({ 
  height = 120, 
  className 
}) => (
  <>
    <style>{shimmer}</style>
    <div 
      className={className}
      style={{ 
        ...baseStyle, 
        height, 
        borderRadius: '12px',
        width: '100%',
      }} 
    />
  </>
);

export const SkeletonText: React.FC<{ width?: string | number; height?: number; lines?: number }> = ({ 
  width = '100%', 
  height = 16,
  lines = 1 
}) => (
  <>
    <style>{shimmer}</style>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          style={{ 
            ...baseStyle, 
            width, 
            height,
            opacity: 1 - (i * 0.1),
          }} 
        />
      ))}
    </div>
  </>
);

export const SkeletonCircle: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <>
    <style>{shimmer}</style>
    <div 
      style={{ 
        ...baseStyle, 
        width: size, 
        height: size,
        borderRadius: '50%',
      }} 
    />
  </>
);

export const SkeletonKpiCards: React.FC = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={i} height={100} />
    ))}
  </div>
);

export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 280 }) => (
  <SkeletonCard height={height} />
);

export const SkeletonTradeList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i}
        style={{ 
          ...baseStyle, 
          height: 60,
          borderRadius: '8px',
        }} 
      />
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
    {/* Header */}
    <div style={{ ...baseStyle, height: 48, borderRadius: '8px 8px 0 0' }} />
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div 
        key={i}
        style={{ 
          ...baseStyle, 
          height: 52,
          borderRadius: i === rows - 1 ? '0 0 8px 8px' : '0',
          opacity: 0.8 - (i * 0.05),
        }} 
      />
    ))}
  </div>
);

export const SkeletonCalendar: React.FC = () => (
  <div>
    <div style={{ ...baseStyle, height: 40, width: 200, marginBottom: '16px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
      {Array.from({ length: 35 }).map((_, i) => (
        <div 
          key={i}
          style={{ 
            ...baseStyle, 
            aspectRatio: '1',
            borderRadius: '8px',
            opacity: Math.random() > 0.7 ? 0.4 : 0.2,
          }} 
        />
      ))}
    </div>
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
    {/* Header */}
    <div style={{ marginBottom: '24px' }}>
      <SkeletonText width={200} height={20} />
      <div style={{ marginTop: '8px' }}>
        <SkeletonText width={300} height={32} />
      </div>
    </div>
    
    {/* KPI Cards */}
    <SkeletonKpiCards />
    
    {/* Main Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SkeletonChart height={280} />
        <SkeletonCard height={200} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SkeletonTradeList count={5} />
        <SkeletonTradeList count={4} />
      </div>
    </div>
  </div>
);
