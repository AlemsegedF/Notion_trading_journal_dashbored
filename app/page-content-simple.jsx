'use client'

import { useState } from "react"

export default function TradingDashboard() {
  const [view, setView] = useState("overview")
  
  return (
    <div style={{ background: '#0a0d12', color: '#e2e8f0', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#f0b429', margin: 0 }}>🎯 Trading Journal Dashboard</h1>
      <p style={{ color: '#718096' }}>Interactive trading analytics dashboard</p>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => setView("overview")}
          style={{
            background: view === "overview" ? '#f0b429' : 'transparent',
            color: view === "overview" ? '#000' : '#718096',
            border: `1px solid ${view === "overview" ? '#f0b429' : '#1c2230'}`,
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Overview
        </button>
      </div>

      <div style={{
        background: '#0f1318',
        border: '1px solid #1c2230',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h2>Dashboard Status</h2>
        <p>✅ Dashboard is successfully deployed to Vercel!</p>
        <p style={{ color: '#22c55e' }}>Ready for Notion integration</p>
        
        <h3 style={{ marginTop: '20px' }}>Next Steps:</h3>
        <ol style={{ color: '#e2e8f0' }}>
          <li>Connect your Notion database</li>
          <li>Add Notion API credentials to Vercel environment variables</li>
          <li>Start tracking your trades</li>
        </ol>

        <p style={{ marginTop: '20px', color: '#718096', fontSize: '14px' }}>
          Sample data is displayed until Notion integration is configured.
        </p>
      </div>
    </div>
  )
}
