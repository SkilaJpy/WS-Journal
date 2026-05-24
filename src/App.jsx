import { useState, useRef, useEffect } from "react";

const INITIAL_TRADES = [
  { id: 1, date: "2026-05-20", pair: "BTC/USDT", direction: "Long", entry: 67400, exit: 71200, pnl: 3800, result: "Win", notes: "Clean breakout above resistance with volume confirmation.", before: null, after: null },
  { id: 2, date: "2026-05-22", pair: "ETH/USDT", direction: "Short", entry: 3520, exit: 3610, pnl: -90, result: "Loss", notes: "Stopped out. Failed to hold the breakdown level.", before: null, after: null },
];

const INITIAL_WATCHLIST = [
  { id: 1, coin: "SOL/USDT", bias: "Bullish", keyLevel: 172, notes: "Watching for retest of breakout zone" },
  { id: 2, coin: "AVAX/USDT", bias: "Bearish", keyLevel: 38.5, notes: "Rejection at descending trendline" },
];

const INITIAL_RULES = [
  "Only enter when my setup is fully confirmed — no guessing.",
  "Max 2% risk per trade. Always.",
  "Set SL before entry, never after.",
  "No trading in the first 30 mins of NY open.",
  "Never revenge trade after a loss.",
];

const INITIAL_SETUPS = [
  { id: 1, week: "2026-W21", pair: "BTC/USDT", bias: "Bullish", thesis: "Expecting retest of $67k support before continuation. Looking for rejection wick + volume.", chart: null, status: "Active" },
];

const TABS = ["Journal", "Watchlist", "Setups", "Rules"];

function useStorage(key, fallback) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch { return fallback; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

function Badge({ label }) {
  const colors = {
    Win: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Loss: "bg-red-500/20 text-red-300 border-red-500/30",
    BE: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    Long: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    Short: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Bullish: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Bearish: "bg-red-500/20 text-red-300 border-red-500/30",
    Neutral: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    Active: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    Played: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Invalidated: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${colors[label] || "bg-zinc-700 text-zinc-300 border-zinc-600"}`}>
      {label}
    </span>
  );
}

function ImageUpload({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{label}</span>
      {value ? (
        <div className="relative group">
          <img src={value} alt={label} className="w-full h-28 object-cover rounded-lg border border-zinc-700" />
          <button onClick={() => onChange(null)} className="absolute top-1 right-1 bg-black/70 text-zinc-300 rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
        </div>
      ) : (
        <button onClick={() => ref.current.click()} className="w-full h-28 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 flex flex-col items-center justify-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors text-xs font-mono">
          <span className="text-2xl">+</span>
          Upload
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => onChange(ev.target.result);
            reader.readAsDataURL(file);
          }} />
        </button>
      )}
    </div>
  );
}

function TradeCard({ trade, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const pnlPos = trade.pnl >= 0;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
        <div className={`w-1 h-8 rounded-full shrink-0 ${pnlPos ? "bg-emerald-400" : "bg-red-400"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-white text-sm">{trade.pair}</span>
            <Badge label={trade.direction} />
            <Badge label={trade.result} />
          </div>
          <div className="text-xs text-zinc-500 font-mono mt-0.5">{trade.date}</div>
        </div>
        <div className={`font-mono font-bold text-sm tabular-nums shrink-0 ${pnlPos ? "text-emerald-400" : "text-red-400"}`}>
          {pnlPos ? "+" : ""}${trade.pnl.toLocaleString()}
        </div>
        <span className="text-zinc-600 text-xs ml-1">{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div className="border-t border-zinc-800 px-4 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {[["Entry", "entry"], ["Exit", "exit"], ["P&L ($)", "pnl"]].map(([lbl, key]) => (
              <div key={key}>
                <div className="text-zinc-500 uppercase tracking-widest mb-1">{lbl}</div>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none focus:border-zinc-500" type="number" value={trade[key]} onChange={e => onUpdate({ ...trade, [key]: +e.target.value })} />
              </div>
            ))}
            <div>
              <div className="text-zinc-500 uppercase tracking-widest mb-1">Result</div>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none focus:border-zinc-500" value={trade.result} onChange={e => onUpdate({ ...trade, result: e.target.value })}>
                {["Win", "Loss", "BE"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-1">Notes</div>
            <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs font-mono resize-none focus:outline-none focus:border-zinc-500" rows={2} value={trade.notes} onChange={e => onUpdate({ ...trade, notes: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ImageUpload label="Before" value={trade.before} onChange={v => onUpdate({ ...trade, before: v })} />
            <ImageUpload label="After" value={trade.after} onChange={v => onUpdate({ ...trade, after: v })} />
          </div>
          <button onClick={onDelete} className="text-xs text-red-500/60 hover:text-red-400 font-mono transition-colors text-left">Delete trade</button>
        </div>
      )}
    </div>
  );
}

function AddTradeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), pair: "", direction: "Long", entry: "", exit: "", pnl: "", result: "Win", notes: "", before: null, after: null });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 my-4">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-white text-sm uppercase tracking-widest">New Trade</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          {[{ label: "Date", key: "date", type: "date" }, { label: "Pair", key: "pair", type: "text", placeholder: "BTC/USDT" }, { label: "Entry", key: "entry", type: "number" }, { label: "Exit", key: "exit", type: "number" }, { label: "P&L ($)", key: "pnl", type: "number" }].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <div className="text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
              <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white focus:outline-none focus:border-zinc-500" type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} />
            </div>
          ))}
          <div>
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Direction</div>
            <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white" value={form.direction} onChange={set("direction")}>
              <option>Long</option><option>Short</option>
            </select>
          </div>
          <div className="col-span-2">
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Result</div>
            <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white" value={form.result} onChange={set("result")}>
              <option>Win</option><option>Loss</option><option>BE</option>
            </select>
          </div>
          <div className="col-span-2">
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Notes</div>
            <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white resize-none focus:outline-none focus:border-zinc-500" rows={2} value={form.notes} onChange={set("notes")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ImageUpload label="Before" value={form.before} onChange={v => setForm(f => ({ ...f, before: v }))} />
          <ImageUpload label="After" value={form.after} onChange={v => setForm(f => ({ ...f, after: v }))} />
        </div>
        <button onClick={() => { onAdd({ ...form, id: Date.now(), entry: +form.entry, exit: +form.exit, pnl: +form.pnl }); onClose(); }} className="bg-white text-black font-mono font-bold text-xs py-2.5 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-widest">
          Add Trade
        </button>
      </div>
    </div>
  );
}

function SetupCard({ setup, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
        <div className={`w-1 h-8 rounded-full shrink-0 ${setup.bias === "Bullish" ? "bg-emerald-400" : setup.bias === "Bearish" ? "bg-red-400" : "bg-zinc-500"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-white text-sm">{setup.pair}</span>
            <Badge label={setup.bias} />
            <Badge label={setup.status} />
          </div>
          <div className="text-xs text-zinc-500 font-mono mt-0.5">{setup.week}</div>
        </div>
        <span className="text-zinc-600 text-xs ml-1">{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div className="border-t border-zinc-800 px-4 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-zinc-500 uppercase tracking-widest mb-1">Week</div>
              <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none focus:border-zinc-500" value={setup.week} onChange={e => onUpdate({ ...setup, week: e.target.value })} />
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-widest mb-1">Pair</div>
              <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none focus:border-zinc-500" value={setup.pair} onChange={e => onUpdate({ ...setup, pair: e.target.value })} />
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-widest mb-1">Bias</div>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white" value={setup.bias} onChange={e => onUpdate({ ...setup, bias: e.target.value })}>
                <option>Bullish</option><option>Bearish</option><option>Neutral</option>
              </select>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-widest mb-1">Status</div>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white" value={setup.status} onChange={e => onUpdate({ ...setup, status: e.target.value })}>
                <option>Active</option><option>Played</option><option>Invalidated</option>
              </select>
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-1">Thesis / Plan</div>
            <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs font-mono resize-none focus:outline-none focus:border-zinc-500" rows={3} value={setup.thesis} onChange={e => onUpdate({ ...setup, thesis: e.target.value })} />
          </div>
          <ImageUpload label="Chart Screenshot" value={setup.chart} onChange={v => onUpdate({ ...setup, chart: v })} />
          <button onClick={onDelete} className="text-xs text-red-500/60 hover:text-red-400 font-mono transition-colors text-left">Delete setup</button>
        </div>
      )}
    </div>
  );
}

function AddSetupModal({ onAdd, onClose }) {
  const now = new Date();
  const week = `${now.getFullYear()}-W${String(Math.ceil((now.getDate()) / 7)).padStart(2, "0")}`;
  const [form, setForm] = useState({ week, pair: "", bias: "Bullish", thesis: "", chart: null, status: "Active" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 my-4">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-white text-sm uppercase tracking-widest">New Weekly Setup</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Week</div>
            <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white focus:outline-none" placeholder="2026-W21" value={form.week} onChange={set("week")} />
          </div>
          <div>
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Pair</div>
            <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white focus:outline-none" placeholder="BTC/USDT" value={form.pair} onChange={set("pair")} />
          </div>
          <div>
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Bias</div>
            <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white" value={form.bias} onChange={set("bias")}>
              <option>Bullish</option><option>Bearish</option><option>Neutral</option>
            </select>
          </div>
          <div>
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Status</div>
            <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white" value={form.status} onChange={set("status")}>
              <option>Active</option><option>Played</option><option>Invalidated</option>
            </select>
          </div>
          <div className="col-span-2">
            <div className="text-zinc-500 uppercase tracking-widest mb-1">Thesis / Plan</div>
            <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white resize-none focus:outline-none" rows={3} placeholder="What's the plan this week? Key levels, catalysts, triggers..." value={form.thesis} onChange={set("thesis")} />
          </div>
        </div>
        <ImageUpload label="Chart Screenshot" value={form.chart} onChange={v => setForm(f => ({ ...f, chart: v }))} />
        <button onClick={() => { if (!form.pair) return; onAdd({ ...form, id: Date.now() }); onClose(); }} className="bg-white text-black font-mono font-bold text-xs py-2.5 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-widest">
          Add Setup
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Journal");
  const [trades, setTrades] = useStorage("cj_trades", INITIAL_TRADES);
  const [watchlist, setWatchlist] = useStorage("cj_watchlist", INITIAL_WATCHLIST);
  const [rules, setRules] = useStorage("cj_rules", INITIAL_RULES);
  const [setups, setSetups] = useStorage("cj_setups", INITIAL_SETUPS);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showAddSetup, setShowAddSetup] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [newCoin, setNewCoin] = useState({ coin: "", bias: "Bullish", keyLevel: "", notes: "" });

  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const wins = trades.filter(t => t.result === "Win").length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div style={{ fontFamily: "Syne, sans-serif" }} className="text-lg font-extrabold tracking-tight">CRYPTO JOURNAL</div>
            <div className="text-xs text-zinc-500">trading workspace</div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <div className={`text-lg font-bold tabular-nums ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">total P&L</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{winRate}%</div>
              <div className="text-xs text-zinc-500">win rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{trades.length}</div>
              <div className="text-xs text-zinc-500">trades</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 px-4">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-3 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors ${activeTab === t ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* JOURNAL */}
        {activeTab === "Journal" && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button onClick={() => setShowAddTrade(true)} className="bg-white text-black text-xs font-mono font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-widest">+ New Trade</button>
            </div>
            {trades.length === 0 && <div className="text-center text-zinc-600 font-mono text-sm py-16">No trades yet. Add your first one.</div>}
            {trades.map(trade => (
              <TradeCard key={trade.id} trade={trade}
                onUpdate={u => setTrades(ts => ts.map(t => t.id === u.id ? u : t))}
                onDelete={() => setTrades(ts => ts.filter(t => t.id !== trade.id))}
              />
            ))}
          </div>
        )}

        {/* WATCHLIST */}
        {activeTab === "Watchlist" && (
          <div className="flex flex-col gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Add Coin</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white col-span-2 focus:outline-none focus:border-zinc-500" placeholder="SOL/USDT" value={newCoin.coin} onChange={e => setNewCoin(c => ({ ...c, coin: e.target.value }))} />
                <select className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white" value={newCoin.bias} onChange={e => setNewCoin(c => ({ ...c, bias: e.target.value }))}>
                  <option>Bullish</option><option>Bearish</option><option>Neutral</option>
                </select>
                <input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white" placeholder="Key level" type="number" value={newCoin.keyLevel} onChange={e => setNewCoin(c => ({ ...c, keyLevel: e.target.value }))} />
                <input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white col-span-2 focus:outline-none focus:border-zinc-500" placeholder="Notes" value={newCoin.notes} onChange={e => setNewCoin(c => ({ ...c, notes: e.target.value }))} />
              </div>
              <button onClick={() => { if (!newCoin.coin) return; setWatchlist(w => [...w, { ...newCoin, id: Date.now(), keyLevel: +newCoin.keyLevel }]); setNewCoin({ coin: "", bias: "Bullish", keyLevel: "", notes: "" }); }} className="bg-white text-black font-mono font-bold text-xs py-2 rounded-lg hover:bg-zinc-200 transition-colors">Add</button>
            </div>
            {watchlist.length === 0 && <div className="text-center text-zinc-600 font-mono text-sm py-10">Watchlist empty.</div>}
            {watchlist.map(item => (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white text-sm">{item.coin}</span>
                    <Badge label={item.bias} />
                  </div>
                  {item.keyLevel && <div className="text-xs text-zinc-500 font-mono mt-0.5">Key level: <span className="text-zinc-300">${item.keyLevel}</span></div>}
                  {item.notes && <div className="text-xs text-zinc-500 font-mono mt-1">{item.notes}</div>}
                </div>
                <button onClick={() => setWatchlist(w => w.filter(x => x.id !== item.id))} className="text-zinc-700 hover:text-red-400 transition-colors text-xs mt-0.5">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* WEEKLY SETUPS */}
        {activeTab === "Setups" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Weekly Setups</div>
                <div className="text-xs text-zinc-600 font-mono mt-0.5">Your bias & plan before the week starts</div>
              </div>
              <button onClick={() => setShowAddSetup(true)} className="bg-white text-black text-xs font-mono font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-widest">+ New Setup</button>
            </div>
            {setups.length === 0 && <div className="text-center text-zinc-600 font-mono text-sm py-16">No setups yet. Plan your week.</div>}
            {setups.map(setup => (
              <SetupCard key={setup.id} setup={setup}
                onUpdate={u => setSetups(ss => ss.map(s => s.id === u.id ? u : s))}
                onDelete={() => setSetups(ss => ss.filter(s => s.id !== setup.id))}
              />
            ))}
          </div>
        )}

        {/* RULES */}
        {activeTab === "Rules" && (
          <div className="flex flex-col gap-3">
            {rules.map((rule, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-zinc-600 font-mono text-xs mt-0.5 w-4 shrink-0">{i + 1}.</span>
                <span className="text-zinc-200 font-mono text-sm flex-1">{rule}</span>
                <button onClick={() => setRules(r => r.filter((_, j) => j !== i))} className="text-zinc-700 hover:text-red-400 transition-colors text-xs mt-0.5">✕</button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <input className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-zinc-500 placeholder-zinc-600" placeholder="Add a rule..." value={newRule} onChange={e => setNewRule(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newRule.trim()) { setRules(r => [...r, newRule.trim()]); setNewRule(""); } }} />
              <button onClick={() => { if (!newRule.trim()) return; setRules(r => [...r, newRule.trim()]); setNewRule(""); }} className="bg-white text-black font-mono font-bold text-xs px-4 rounded-xl hover:bg-zinc-200 transition-colors">Add</button>
            </div>
          </div>
        )}
      </div>

      {showAddTrade && <AddTradeModal onAdd={t => setTrades(ts => [t, ...ts])} onClose={() => setShowAddTrade(false)} />}
      {showAddSetup && <AddSetupModal onAdd={s => setSetups(ss => [s, ...ss])} onClose={() => setShowAddSetup(false)} />}
    </div>
  );
}
