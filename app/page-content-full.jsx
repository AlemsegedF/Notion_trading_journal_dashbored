'use client'

import { useState, useEffect, useMemo } from "react";
import TradeLogModal from "./components/TradeLogModal";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

// ─── COLOURS ─────────────────────────────────────────────────────────────────
const C = {
  bg:      "#0a0d12",
  card:    "#0f1318",
  border:  "#1c2230",
  accent:  "#f0b429",
  green:   "#22c55e",
  red:     "#ef4444",
  blue:    "#3b82f6",
  muted:   "#4a5568",
  text:    "#e2e8f0",
  sub:     "#718096",
};

const PAIR_COLORS  = { "EUR/USD":"#3b82f6","GBP/USD":"#a78bfa","USD/JPY":"#fbbf24","GBP/JPY":"#34d399","XAU/USD":"#fb923c" };
const SETUP_COLORS = { "FVG Entry":"#22c55e","Order Block":"#3b82f6","Liquidity Sweep":"#a78bfa","Breaker Block":"#fbbf24","OTE Fib":"#fb923c","CISD":"#f43f5e" };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt$ = v => v >= 0 ? `+$${v.toFixed(0)}` : `-$${Math.abs(v).toFixed(0)}`;
const fmtR = v => v >= 0 ? `+${v.toFixed(2)}R` : `${v.toFixed(2)}R`;
const week = d => { const dt = new Date(d); const jan1 = new Date(dt.getFullYear(),0,1); return `W${Math.ceil(((dt-jan1)/86400000+jan1.getDay()+1)/7)}`; };
const month = d => new Date(d).toLocaleString("default",{month:"short", year:"2-digit"});

function computeEquityCurve(trades) {
  let bal = 0;
  return trades.map((t,i) => { bal += t.pnl; return { n: i+1, balance: bal, pnl: t.pnl, date: t.date }; });
}

function groupBy(trades, keyFn) {
  const map = {};
  trades.forEach(t => {
    const k = keyFn(t) || "Unknown";
    if (!map[k]) map[k] = { label: k, trades:[], wins:0, total:0, pnl:0, r:0 };
    map[k].trades.push(t);
    map[k].total++;
    map[k].pnl += t.pnl || 0;
    map[k].r   += t.rMultiple || 0;
    if (t.outcome === "Win") map[k].wins++;
  });
  return Object.values(map).map(g => ({ ...g, winRate: g.total > 0 ? Math.round(g.wins/g.total*100) : 0, avgR: g.total > 0 ? +(g.r/g.total).toFixed(2) : 0 }));
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", fontSize:12 }}>
      <p style={{ color: C.sub, marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color: p.color || C.text }}>{p.name}: <b>{typeof p.value==="number" && p.name.includes("$") ? fmt$(p.value) : p.value}</b></p>
      ))}
    </div>
  );
};

const MetricCard = ({ label, value, sub, color, size = "normal" }) => {
  if (size === "large") {
    return (
      <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"24px", position:"relative" }}>
        <p style={{ color: C.sub, fontSize:12, margin:"0 0 8px" }}>{label}</p>
        <p style={{ color: color || C.text, fontSize:36, fontWeight:700, fontFamily:"'DM Mono', monospace", margin:0 }}>{value}</p>
        {sub && <p style={{ color: C.muted, fontSize:12, margin:"8px 0 0" }}>{sub}</p>}
      </div>
    );
  }
  
  return (
    <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
      <p style={{ color: C.sub, fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", margin:"0 0 8px" }}>{label}</p>
      <p style={{ color: color || C.text, fontSize:18, fontWeight:700, fontFamily:"'DM Mono', monospace", margin:0 }}>{value}</p>
      {sub && <p style={{ color: C.muted, fontSize:11, margin:"6px 0 0" }}>{sub}</p>}
    </div>
  );
};

export default function TradingDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch trades
  useEffect(() => {
    async function fetchTrades() {
      try {
        const response = await fetch("/api/trades");
        if (!response.ok) throw new Error("Failed to fetch trades");
        const data = await response.json();
        setTrades(data.trades || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching trades:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrades();
  }, []);

  // Calculate all metrics BEFORE any conditional returns
  const wins      = trades.filter(t=>t.outcome==="Win");
  const losses    = trades.filter(t=>t.outcome==="Loss");
  const winRate   = trades.length > 0 ? Math.round(wins.length/trades.length*100) : 0;
  const totalPnL  = trades.reduce((s,t)=>s+t.pnl,0);
  const avgR      = trades.length > 0 ? +(trades.reduce((s,t)=>s+t.rMultiple,0)/trades.length).toFixed(2) : 0;
  const avgWinR   = wins.length > 0 ? +(wins.reduce((s,t)=>s+t.rMultiple,0)/wins.length).toFixed(2) : 0;
  const avgLossR  = losses.length > 0 ? +(Math.abs(losses.reduce((s,t)=>s+t.rMultiple,0)/losses.length)).toFixed(2) : 0;
  const expectancy= +((winRate/100*avgWinR)-((100-winRate)/100*avgLossR)).toFixed(3);
  const profFactor= wins.length > 0 && losses.length > 0 ? +(wins.reduce((s,t)=>s+t.pnl,0)/Math.abs(losses.reduce((s,t)=>s+t.pnl,0))).toFixed(2) : 0;
  const violations= trades.filter(t=>!t.sopOk).length;
  const equity    = computeEquityCurve(trades);
  const todayTrades = trades.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).length;
  const todayPnL = trades.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).reduce((s,t)=>s+t.pnl,0);

  const bySetup = useMemo(()=>{ try { return groupBy(trades,t=>t.setup).sort((a,b)=>b.pnl-a.pnl); } catch(e) { return []; } },[trades]);

  // Recent trades (last 5)
  const recentTrades = trades.slice(-5).reverse();

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.text }}>
        <p>Loading your trades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}>
        <div style={{ textAlign: "center" }}>
          <p>⚠️ Error: {error}</p>
          <p style={{ color: C.sub, marginTop: "10px", fontSize: "14px" }}>Make sure NOTION_TOKEN and NOTION_DATABASE_ID are configured</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight:"100vh", fontFamily:"'DM Sans', sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"28px 40px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:700, letterSpacing:"-0.02em" }}>
            Welcome back, <span style={{ color:C.accent }}>Trader</span>!
          </h1>
          <p style={{ color:C.sub, fontSize:14, margin:"6px 0 0" }}>
            {todayTrades === 0 ? "No trades today. Great job!" : `You have ${todayTrades} trade${todayTrades===1?"":"s"} today.`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: C.accent,
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          + New Trade
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding:"28px 40px" }}>
        {trades.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:C.sub }}>
            <p style={{ fontSize:16 }}>No trades found. Start by logging your first trade!</p>
          </div>
        ) : (
          <>
            {/* TOP METRICS */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:32 }}>
              <MetricCard label="Total Return" value={fmt$(totalPnL)} sub={totalPnL >= 0 ? "+2.4%" : ""} color={totalPnL >= 0 ? C.green : C.red} size="large" />
              <MetricCard label="Win Rate" value={`${winRate}%`} sub={`${trades.length >= 20 ? Math.round(wins.slice(-20).length/20*100) : winRate}% (last 20)`} color={winRate >= 50 ? C.green : C.red} size="large" />
              <MetricCard label="Profit Factor" value={profFactor || "N/A"} sub={profFactor >= 1.5 ? "Healthy" : "Target 1.5"} color={profFactor >= 1.5 ? C.green : C.accent} size="large" />
              <MetricCard label="Today's P&L" value={fmt$(todayPnL)} sub={`${todayTrades} trades`} color={todayPnL >= 0 ? C.green : C.red} size="large" />
            </div>

            {/* EQUITY CURVE */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"24px", marginBottom:32 }}>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:C.text }}>Equity Curve</h2>
                <p style={{ margin:"4px 0 0", fontSize:12, color:C.sub }}>Cumulative P&L over time</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={equity}>
                  <defs>
                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" stroke={C.sub} style={{ fontSize:11 }} />
                  <YAxis stroke={C.sub} style={{ fontSize:11 }} />
                  <Tooltip content={<TT />} />
                  <Area type="monotone" dataKey="balance" stroke={C.green} fillOpacity={1} fill="url(#eq)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* PERFORMANCE METRICS */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"24px", marginBottom:32 }}>
              <h2 style={{ margin:"0 0 20px", fontSize:16, fontWeight:700, color:C.text }}>Performance Metrics</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:16 }}>
                <MetricCard label="Expectancy" value={`${expectancy}R`} color={expectancy > 0 ? C.green : C.red} />
                <MetricCard label="Avg Win" value={`${avgWinR}R`} color={C.green} />
                <MetricCard label="Avg Loss" value={`-${avgLossR}R`} color={C.red} />
                <MetricCard label="Max Drawdown" value={"-Infinity%"} color={C.red} />
                <MetricCard label="Avg Trade Duration" value={"3h"} color={C.blue} />
                <MetricCard label="Total Trades" value={trades.length} color={C.text} />
              </div>
            </div>

            {/* RECENT TRADES */}
            {recentTrades.length > 0 && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"24px", marginBottom:32 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                  <h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>Recent Trades</h2>
                  <a href="#" style={{ color:C.accent, textDecoration:"none", fontSize:13, fontWeight:600 }}>View All →</a>
                </div>
                
                <div>
                  {recentTrades.map((t, i) => (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr 1fr", gap:16, padding:"12px 0", borderBottom: i < recentTrades.length - 1 ? `1px solid ${C.border}` : "none", alignItems:"center" }}>
                      <div>
                        <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.text }}>{t.pair}</p>
                        <p style={{ margin:"2px 0 0", fontSize:11, color:C.sub }}>{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString().slice(0,5)}</p>
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ background:t.outcome==="Win"?`${C.green}20`:t.outcome==="Loss"?`${C.red}20`:C.muted, padding:"4px 10px", borderRadius:4, fontSize:11, color:C.text }}>{t.outcome}</span>
                        {t.setup && <span style={{ fontSize:11, color:C.sub }}>{t.setup}</span>}
                      </div>
                      <p style={{ margin:0, fontSize:14, fontWeight:600, color: t.pnl >= 0 ? C.green : C.red, textAlign:"right" }}>{fmt$(t.pnl)}</p>
                      <p style={{ margin:0, fontSize:13, fontWeight:600, color: t.rMultiple >= 0 ? C.green : C.red, textAlign:"right" }}>{fmtR(t.rMultiple)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOP STRATEGIES */}
            {bySetup.length > 0 && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"24px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                  <h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>Top Strategies</h2>
                  <a href="#" style={{ color:C.accent, textDecoration:"none", fontSize:13, fontWeight:600 }}>View All →</a>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
                  {bySetup.slice(0, 4).map((s, i) => (
                    <div key={i} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"16px" }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.text }}>{i+1}. {s.label}</p>
                      <div style={{ display:"flex", gap:16, margin:"12px 0 0", fontSize:11, color:C.sub }}>
                        <span>{s.total} trades</span>
                        <span>• {s.winRate}% win</span>
                      </div>
                      <p style={{ margin:"12px 0 0", fontSize:16, fontWeight:700, color: s.pnl >= 0 ? C.green : C.red }}>{fmt$(s.pnl)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* TRADE LOG MODAL */}
      <TradeLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Refetch trades
          fetch("/api/trades")
            .then(r => r.json())
            .then(d => setTrades(d.trades || []))
            .catch(console.error);
        }}
      />
    </div>
  );
}
