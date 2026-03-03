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

      <div style={{ padding:"24px 28px" }}>

        {/* ── OVERVIEW ── */}
        {view==="overview" && <>
          {/* Stats Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:28 }}>
            <StatCard label="Total P&L" value={fmt$(totalPnL)} color={C.green} glow />
            <StatCard label="Win Rate" value={`${winRate}%`} sub={`${wins.length}W / ${losses.length}L`} color={winRate>=50?C.green:C.red} />
            <StatCard label="Expectancy" value={`${expectancy}R`} sub="Target > 0.3R" color={expectancy>0?C.green:C.red} />
            <StatCard label="Profit Factor" value={profFactor} sub="Target > 1.5" color={profFactor>=1.5?C.green:C.accent} />
            <StatCard label="Avg R:R" value={`${avgR}R`} color={C.blue} />
            <StatCard label="Trades" value={trades.length} sub="Total" />
            <StatCard label="SOP Violations" value={violations} sub={`${trades.length-violations} clean`} color={violations===0?C.green:C.red} />
            <StatCard label="Best Trade" value={trades.length > 0 ? `+${Math.max(...trades.map(t=>t.rMultiple))}R` : "N/A"} color={C.accent} glow />
          </div>

          {/* Equity + Pie */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:28 }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
              <SectionHeader title="📈 Equity Curve" sub="Cumulative P&L — every trade" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={equity}>
                  <defs>
                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis dataKey="n" stroke={C.muted} tick={{fontSize:10}} label={{value:"Trade #",position:"insideBottom",offset:-2,fill:C.sub,fontSize:10}} />
                  <YAxis stroke={C.muted} tick={{fontSize:10}} tickFormatter={v=>`$${v}`} />
                  <Tooltip content={<TT/>} formatter={(v)=>[fmt$(v),"Balance"]} />
                  <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="balance" name="Balance $" stroke={C.green} fill="url(#eq)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
              <SectionHeader title="🎯 Trade Outcomes" />
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieDat} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieDat.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
                {pieDat.map(d=>(
                  <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:d.color }}/>
                      <span style={{ fontSize:12, color:C.sub }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, fontFamily:"'DM Mono',monospace", color:d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* P&L per trade bar */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:28 }}>
            <SectionHeader title="💹 P&L Per Trade" sub="Green = win, Red = loss" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trades.map((t,i)=>({n:i+1,pnl:t.pnl,r:t.rMultiple}))}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke={C.muted} tick={{fontSize:9}} />
                <YAxis stroke={C.muted} tick={{fontSize:10}} tickFormatter={v=>`$${v}`} />
                <Tooltip formatter={(v,n)=>[n==="pnl"?fmt$(v):fmtR(v),n]} />
                <ReferenceLine y={0} stroke={C.muted} />
                <Bar dataKey="pnl" name="P&L $" radius={[3,3,0,0]}>
                  {trades.map((t,i)=><Cell key={i} fill={t.pnl>=0?C.green:C.red}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Session breakdown */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
            <SectionHeader title="🕐 Session Performance" sub="London vs NY" />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={bySess} layout="vertical">
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis type="number" stroke={C.muted} tick={{fontSize:10}} />
                <YAxis dataKey="label" type="category" stroke={C.muted} tick={{fontSize:11}} width={70} />
                <Tooltip />
                <Bar dataKey="pnl" name="P&L $" fill={C.blue} radius={[0,4,4,0]} />
                <Bar dataKey="winRate" name="Win %" fill={C.accent} radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>}

        {/* ── EQUITY ── */}
        {view==="equity" && <>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:20 }}>
            <SectionHeader title="📈 Full Equity Curve" sub="Cumulative balance growth — every trade" />
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={equity}>
                <defs>
                  <linearGradient id="eq2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke={C.muted} tick={{fontSize:11}} label={{value:"Trade #",position:"insideBottomRight",offset:-10,fill:C.sub,fontSize:11}} />
                <YAxis stroke={C.muted} tick={{fontSize:11}} tickFormatter={v=>`$${v}`} />
                <Tooltip formatter={(v)=>[fmt$(v),"Balance"]} labelFormatter={l=>`Trade #${l}`} />
                <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 4" label={{value:"Start",fill:C.sub,fontSize:10}} />
                <Area type="monotone" dataKey="balance" name="Balance" stroke={C.green} fill="url(#eq2)" strokeWidth={2.5} dot={false} activeDot={{r:5,fill:C.green}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:20 }}>
            <SectionHeader title="📊 R-Multiple Per Trade" sub="How many R you gained or lost on each trade" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trades.map((t,i)=>({n:i+1,r:t.rMultiple,pair:t.pair}))}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke={C.muted} tick={{fontSize:10}} />
                <YAxis stroke={C.muted} tick={{fontSize:11}} tickFormatter={v=>`${v}R`} />
                <Tooltip formatter={v=>[fmtR(v),"R-Multiple"]} labelFormatter={l=>`Trade #${l}`} />
                <ReferenceLine y={0} stroke={C.muted} />
                <Bar dataKey="r" name="R Multiple" radius={[3,3,0,0]}>
                  {trades.map((t,i)=><Cell key={i} fill={t.rMultiple>=0?C.green:C.red}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <StatCard label="Total R Earned" value={trades.length > 0 ? fmtR(trades.reduce((s,t)=>s+t.rMultiple,0)) : "0R"} color={C.green} glow />
            <StatCard label="Max Drawdown" value={trades.length > 0 ? `$${Math.abs(Math.min(...equity.map(e=>e.balance)))?.toFixed(0) || 0}` : "N/A"} color={C.red} />
            <StatCard label="Avg Win (R)" value={`+${avgWinR}R`} color={C.green} />
            <StatCard label="Avg Loss (R)" value={`-${avgLossR}R`} color={C.red} />
          </div>
        </>}

        {/* ── PAIRS ── */}
        {view==="pairs" && <>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:20 }}>
            <SectionHeader title="💱 P&L by Currency Pair" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byPair}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke={C.muted} tick={{fontSize:11}} />
                <YAxis stroke={C.muted} tick={{fontSize:11}} tickFormatter={v=>`$${v}`} />
                <Tooltip />
                <Bar dataKey="pnl" name="P&L $" radius={[4,4,0,0]}>
                  {byPair.map((d,i)=><Cell key={i} fill={PAIR_COLORS[d.label]||C.blue}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:20 }}>
            <SectionHeader title="🎯 Win Rate by Pair" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byPair}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke={C.muted} tick={{fontSize:11}} />
                <YAxis stroke={C.muted} tick={{fontSize:10}} tickFormatter={v=>`${v}%`} domain={[0,100]} />
                <Tooltip formatter={v=>[`${v}%`,"Win Rate"]} />
                <ReferenceLine y={50} stroke={C.accent} strokeDasharray="4 4" label={{value:"50%",fill:C.accent,fontSize:10}} />
                <Bar dataKey="winRate" name="Win %" radius={[4,4,0,0]}>
                  {byPair.map((d,i)=><Cell key={i} fill={d.winRate>=50?C.green:C.red}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
            <SectionHeader title="📋 Pair Breakdown Table" />
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["Pair","Trades","Wins","Win %","Avg R","P&L"].map(h=>(
                    <th key={h} style={{ textAlign:"left", color:C.sub, fontWeight:500, padding:"8px 10px", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byPair.sort((a,b)=>b.pnl-a.pnl).map(d=>(
                  <tr key={d.label} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"10px", color:PAIR_COLORS[d.label]||C.text, fontWeight:600 }}>{d.label}</td>
                    <td style={{ padding:"10px", color:C.sub }}>{d.total}</td>
                    <td style={{ padding:"10px", color:C.green }}>{d.wins}</td>
                    <td style={{ padding:"10px", color:d.winRate>=50?C.green:C.red, fontFamily:"'DM Mono',monospace" }}>{d.winRate}%</td>
                    <td style={{ padding:"10px", color:d.avgR>=0?C.green:C.red, fontFamily:"'DM Mono',monospace" }}>{fmtR(d.avgR)}</td>
                    <td style={{ padding:"10px", color:d.pnl>=0?C.green:C.red, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{fmt$(d.pnl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* ── SETUPS ── */}
        {view==="setups" && <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
              <SectionHeader title="🧠 P&L by Setup Type" />
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bySetup} layout="vertical">
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis type="number" stroke={C.muted} tick={{fontSize:10}} tickFormatter={v=>`$${v}`} />
                  <YAxis dataKey="label" type="category" stroke={C.muted} tick={{fontSize:10}} width={110} />
                  <Tooltip />
                  <Bar dataKey="pnl" name="P&L $" radius={[0,4,4,0]}>
                    {bySetup.map((d,i)=><Cell key={i} fill={SETUP_COLORS[d.label]||C.blue}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
              <SectionHeader title="📡 Setup Win Rate Radar" />
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarDat}>
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis dataKey="setup" tick={{fill:C.sub,fontSize:10}} />
                  <Radar name="Win Rate" dataKey="winRate" stroke={C.green} fill={C.green} fillOpacity={0.2} />
                  <Radar name="Avg R×25" dataKey="avgR" stroke={C.accent} fill={C.accent} fillOpacity={0.15} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
            <SectionHeader title="📋 Setup Breakdown Table" />
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["Setup","Trades","Win %","Avg R","P&L","Verdict"].map(h=>(
                    <th key={h} style={{ textAlign:"left", color:C.sub, fontWeight:500, padding:"8px 10px", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bySetup.sort((a,b)=>b.pnl-a.pnl).map(d=>(
                  <tr key={d.label} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"10px", color:SETUP_COLORS[d.label]||C.text, fontWeight:600 }}>{d.label}</td>
                    <td style={{ padding:"10px", color:C.sub }}>{d.total}</td>
                    <td style={{ padding:"10px", color:d.winRate>=50?C.green:C.red, fontFamily:"'DM Mono',monospace" }}>{d.winRate}%</td>
                    <td style={{ padding:"10px", color:d.avgR>=0?C.green:C.red, fontFamily:"'DM Mono',monospace" }}>{fmtR(d.avgR)}</td>
                    <td style={{ padding:"10px", color:d.pnl>=0?C.green:C.red, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{fmt$(d.pnl)}</td>
                    <td style={{ padding:"10px" }}>
                      <span style={{ background:d.winRate>=55?`${C.green}22`:d.winRate>=45?`${C.accent}22`:`${C.red}22`, color:d.winRate>=55?C.green:d.winRate>=45?C.accent:C.red, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
                        {d.winRate>=55?"✅ Edge":d.winRate>=45?"⚠️ Neutral":"❌ Review"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* ── WEEKLY ── */}
        {view==="weekly" && <>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:20 }}>
            <SectionHeader title="📅 Weekly P&L" sub="Profit and loss by week" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke={C.muted} tick={{fontSize:11}} />
                <YAxis stroke={C.muted} tick={{fontSize:11}} tickFormatter={v=>`$${v}`} />
                <Tooltip formatter={(v,n)=>[n==="pnl"?fmt$(v):`${v}%`,n==="pnl"?"P&L":"Win Rate"]} />
                <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 4" />
                <Bar dataKey="pnl" name="pnl" radius={[4,4,0,0]}>
                  {weeklyData.map((d,i)=><Cell key={i} fill={d.pnl>=0?C.green:C.red}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:20 }}>
            <SectionHeader title="🎯 Weekly Win Rate" sub="Target ≥ 50% every week" />
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weeklyData}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke={C.muted} tick={{fontSize:11}} />
                <YAxis stroke={C.muted} tick={{fontSize:11}} tickFormatter={v=>`${v}%`} domain={[0,100]} />
                <Tooltip formatter={v=>[`${v}%`,"Win Rate"]} />
                <ReferenceLine y={50} stroke={C.accent} strokeDasharray="5 5" label={{value:"Target 50%",fill:C.accent,fontSize:10,position:"right"}} />
                <Line type="monotone" dataKey="winRate" name="Win Rate" stroke={C.blue} strokeWidth={2.5} dot={{fill:C.blue,r:5}} activeDot={{r:7}} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
            <SectionHeader title="📋 Weekly Summary" />
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["Week","Trades","Wins","Win %","P&L","Status"].map(h=>(
                    <th key={h} style={{ textAlign:"left", color:C.sub, fontWeight:500, padding:"8px 10px", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyData.map(d=>(
                  <tr key={d.week} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"10px", fontFamily:"'DM Mono',monospace", color:C.text }}>{d.week}</td>
                    <td style={{ padding:"10px", color:C.sub }}>{d.trades}</td>
                    <td style={{ padding:"10px", color:C.green }}>{d.wins}</td>
                    <td style={{ padding:"10px", color:d.winRate>=50?C.green:C.red, fontFamily:"'DM Mono',monospace" }}>{d.winRate}%</td>
                    <td style={{ padding:"10px", color:d.pnl>=0?C.green:C.red, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{fmt$(d.pnl)}</td>
                    <td style={{ padding:"10px" }}>
                      <span style={{ background:d.pnl>0?`${C.green}22`:`${C.red}22`, color:d.pnl>0?C.green:C.red, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
                        {d.pnl>0?"✅ Profitable":"❌ Loss week"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* ── MONTHLY ── */}
        {view==="monthly" && <>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px", marginBottom:20 }}>
            <SectionHeader title="📆 Monthly P&L" sub="Profit and loss per month — target consistency" />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="gbar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={C.green} stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke={C.muted} tick={{fontSize:12}} />
                <YAxis stroke={C.muted} tick={{fontSize:11}} tickFormatter={v=>`$${v}`} />
                <Tooltip formatter={v=>[fmt$(v),"P&L"]} />
                <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 4" />
                <Bar dataKey="pnl" name="Monthly P&L" radius={[6,6,0,0]}>
                  {monthlyData.map((d,i)=><Cell key={i} fill={d.pnl>=0?"url(#gbar)":C.red}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
              <SectionHeader title="📈 Monthly Win Rate Trend" />
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthlyData}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke={C.muted} tick={{fontSize:11}} />
                  <YAxis stroke={C.muted} tick={{fontSize:10}} tickFormatter={v=>`${v}%`} domain={[0,100]} />
                  <Tooltip formatter={v=>[`${v}%`,"Win Rate"]} />
                  <ReferenceLine y={50} stroke={C.accent} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="winRate" stroke={C.accent} strokeWidth={2.5} dot={{r:6,fill:C.accent}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
              <SectionHeader title="📊 Trades Per Month" />
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke={C.muted} tick={{fontSize:11}} />
                  <YAxis stroke={C.muted} tick={{fontSize:10}} />
                  <Tooltip />
                  <Bar dataKey="trades" name="Trades" fill={C.blue} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 16px" }}>
            <SectionHeader title="📋 Monthly Scoreboard" sub="Your trading progress" />
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["Month","Trades","Win %","P&L","Running Total"].map(h=>(
                    <th key={h} style={{ textAlign:"left", color:C.sub, fontWeight:500, padding:"8px 10px", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyData.reduce((acc,d)=>{
                  const running=(acc.length>0?acc[acc.length-1].running:0)+d.pnl;
                  return [...acc,{...d,running}];
                },[]).map(d=>(
                  <tr key={d.month} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"10px", fontWeight:600 }}>{d.month}</td>
                    <td style={{ padding:"10px", color:C.sub }}>{d.trades}</td>
                    <td style={{ padding:"10px", color:d.winRate>=50?C.green:C.red, fontFamily:"'DM Mono',monospace" }}>{d.winRate}%</td>
                    <td style={{ padding:"10px", color:d.pnl>=0?C.green:C.red, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{fmt$(d.pnl)}</td>
                    <td style={{ padding:"10px", color:C.accent, fontFamily:"'DM Mono',monospace" }}>{fmt$(d.running)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding:"0 28px", borderTop:`1px solid ${C.border}`, paddingTop:16, marginTop:8 }}>
        <p style={{ color:C.muted, fontSize:11, textAlign:"center" }}>
          Data from your Notion Trading Journal · Real-time analytics · Built for success
        </p>
      </div>
    </div>
  );
}
