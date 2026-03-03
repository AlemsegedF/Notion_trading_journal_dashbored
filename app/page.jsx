'use client'

import dynamic from 'next/dynamic'

const TradingDashboard = dynamic(() => import('./page-content-full.jsx'), {
  loading: () => <div style={{ padding: '40px', textAlign: 'center', color: '#e2e8f0' }}>Loading dashboard...</div>,
  ssr: false
})

export default function Home() {
  return (
    <div>
      <TradingDashboard />
    </div>
  )
}
