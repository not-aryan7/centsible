import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { format } from "date-fns";
import CentsiCoach from "../components/CentsiCoach";
import { getAutoInsight } from "../services/gemini";

const CATEGORIES = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Education", "Other"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Category icons using Material Symbols names
const CATEGORY_MATERIAL_ICONS = {
  Food: "restaurant",
  Transport: "directions_car",
  Entertainment: "movie",
  Shopping: "shopping_cart",
  Bills: "receipt_long",
  Education: "school",
  Other: "more_horiz",
  Income: "payments",
};

// Badge definitions matching the Stitch design
const BADGES = [
  { icon: "workspace_premium", name: "Saver Pro", desc: "7 Day Streak", bgColor: "bg-[#60fcc7]", textColor: "text-[#005e45]", condition: (b) => b > 0 },
  { icon: "local_fire_department", name: "Budget King", desc: "Under Limit", bgColor: "bg-[#ffd0b8]", textColor: "text-[#7a2e10]", condition: (_, s) => s >= 50 },
  { icon: "school", name: "Scholar", desc: "Applied 5x", bgColor: "bg-[#e4e7fe]", textColor: "text-[#505467]", condition: (_, s) => s >= 80 },
  { icon: "lock", name: "Investment", desc: "Locked", bgColor: "bg-[#dee3e7]", textColor: "text-[#5a6063]/40", condition: (_, s) => s >= 100 },
];

function formatDate(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `Today • ${format(date, "h:mm a")}`;
  if (days < 2) return `Yesterday • ${format(date, "h:mm a")}`;
  return `${format(date, "d MMM")} • ${format(date, "h:mm a")}`;
}

function getMonthYear(ts) {
  if (!ts) return null;
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return { month: date.getMonth(), year: date.getFullYear() };
}

function MaterialIcon({ name, className = "", fill = false, style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: fill ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400", ...style }}
    >
      {name}
    </span>
  );
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [inlineInsight, setInlineInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const insightFetched = useRef(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("expense");
  const [editCategory, setEditCategory] = useState("Food");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid, "settings", "budget")).then((snap) => {
      if (snap.exists()) setMonthlyBudget(snap.data().amount || 0);
    });
  }, [user]);

  useEffect(() => {
    if (insightFetched.current) return;
    insightFetched.current = true;
    setInsightLoading(true);
    getAutoInsight({ budget: monthlyBudget, income: 0, expenses: 0, balance: 0, score: 0, recentTransactions: "none yet" })
      .then((text) => setInlineInsight(text))
      .catch(() => setInlineInsight("Ready to help with your finances! Ask me anything. 💡"))
      .finally(() => setInsightLoading(false));
  }, []);

  const [selYear, selMonth] = selectedMonth.split("-").map(Number);

  const monthlyTransactions = transactions.filter((t) => {
    const my = getMonthYear(t.createdAt);
    return my && my.month === selMonth && my.year === selYear;
  });

  const availableMonths = [...new Set(transactions.map((t) => {
    const my = getMonthYear(t.createdAt);
    return my ? `${my.year}-${my.month}` : null;
  }).filter(Boolean))].sort().reverse();

  const currentKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
  if (!availableMonths.includes(currentKey)) availableMonths.unshift(currentKey);

  function handleLogout() { signOut(auth).then(() => navigate("/")); }

  async function handleAdd(e) {
    e.preventDefault();
    if (!desc || !amount || !user) return;
    await addDoc(collection(db, "users", user.uid, "transactions"), {
      desc, amount: parseFloat(amount), type,
      category: type === "expense" ? category : "Income",
      createdAt: new Date(),
    });
    setDesc(""); setAmount(""); setShowAddForm(false);
  }

  async function handleDelete(id) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  }

  function startEdit(t) {
    setEditingTxn(t.id); setEditDesc(t.desc); setEditAmount(String(t.amount));
    setEditType(t.type); setEditCategory(t.category || "Food");
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!user || !editingTxn || !editDesc || !editAmount) return;
    await updateDoc(doc(db, "users", user.uid, "transactions", editingTxn), {
      desc: editDesc, amount: parseFloat(editAmount), type: editType,
      category: editType === "expense" ? editCategory : "Income",
    });
    setEditingTxn(null);
  }

  async function handleSaveBudget(e) {
    e.preventDefault();
    if (!user || !budgetInput) return;
    const amt = parseFloat(budgetInput);
    await setDoc(doc(db, "users", user.uid, "settings", "budget"), { amount: amt });
    setMonthlyBudget(amt); setBudgetInput(""); setEditingBudget(false);
  }

  const income = monthlyTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  const budgetAdherence = monthlyBudget > 0 ? Math.max(0, Math.min(100, Math.round(((monthlyBudget - expenses) / monthlyBudget) * 100))) : 0;
  const savingsRate = income > 0 ? Math.max(0, Math.min(100, Math.round(((income - expenses) / income) * 100))) : 0;
  const expenseTxns = monthlyTransactions.filter((t) => t.type === "expense");
  const usedCategories = new Set(expenseTxns.map((t) => t.category)).size;
  const categoryBalance = expenseTxns.length > 0 ? Math.min(100, Math.round((usedCategories / Math.min(CATEGORIES.length, 4)) * 100)) : 0;
  const canCalculate = monthlyBudget > 0 || income > 0;
  const savingsScore = canCalculate ? Math.max(0, Math.min(100, Math.round(budgetAdherence * 0.40 + savingsRate * 0.35 + categoryBalance * 0.25))) : 0;
  const scoreLabel = savingsScore >= 90 ? "Excellent" : savingsScore >= 70 ? "Good" : savingsScore >= 50 ? "Fair" : savingsScore >= 30 ? "Poor" : "Needs Work";

  // Monthly bar chart data from all transactions
  const monthlyBarData = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const my = getMonthYear(t.createdAt);
      if (!my) return;
      const key = `${my.year}-${my.month}`;
      if (!map[key]) map[key] = { income: 0, expenses: 0 };
      if (t.type === "income") map[key].income += t.amount;
      else map[key].expenses += t.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({ key, net: val.income - val.expenses }))
      .slice(-12);
  }, [transactions]);
  const maxBarNet = Math.max(...monthlyBarData.map((d) => Math.abs(d.net)), 1);

  // SVG gauge calculations
  const gaugeRadius = 52;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeDashoffset = gaugeCircumference - (gaugeCircumference * savingsScore) / 100;

  // Recent transactions (last 5)
  const recentTransactions = monthlyTransactions.slice(0, 5);
  const today = new Date();
  const cardShadow = { boxShadow: "0 2px 20px rgba(0,0,0,0.06)" };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-body text-[#2e3336]">

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 lg:px-10 h-16 bg-white/80 backdrop-blur-xl" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <MaterialIcon name="menu" className="text-xl" />
          </button>
          <div className="w-10 h-10 bg-[#2e3336] rounded-full flex items-center justify-center text-white font-black text-sm font-headline">C</div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-[#2e3336] font-headline leading-tight">Centsible</h1>
            <p className="text-[10px] text-[#5a6063] font-medium">Financial Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddForm(true)} className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10 hover:bg-[#f5f5f7] transition-colors">
            <MaterialIcon name="add" className="text-lg" />
          </button>
          <div className="flex items-center gap-2.5 ml-2 pl-4" style={{ borderLeft: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#e8603a] to-[#c94e2a] flex items-center justify-center text-white font-bold text-xs">
                  {user?.displayName?.[0] || "U"}
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold leading-tight">{user?.displayName || "User"}</p>
              <p className="text-[10px] text-[#5a6063]">Student</p>
            </div>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <MaterialIcon name="search" className="text-[#5a6063] text-xl" />
          </button>
          <div className="hidden lg:flex items-center bg-[#f5f5f7] rounded-full px-4 py-2 text-sm text-[#adb3b6] cursor-text min-w-[180px]">
            Start searching here ...
          </div>
        </div>
      </header>

      {/* ─── Sub-header ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-5 lg:px-10 py-6 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full border-2 border-[#2e3336] flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-black font-headline">{today.getDate()}</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold font-headline text-lg">{format(today, "EEE,")}</p>
            <p className="font-bold font-headline text-lg">{MONTH_NAMES[selMonth]}</p>
          </div>
          <div className="h-10 w-px bg-black/10 hidden md:block" />
          <button onClick={() => setShowAddForm(true)} className="bg-[#e8603a] text-white pl-6 pr-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ boxShadow: "0 4px 16px rgba(232,96,58,0.25)" }}>
            Add Transaction <MaterialIcon name="arrow_forward" className="text-base" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 hover:bg-white transition-colors relative">
            <MaterialIcon name="calendar_month" className="text-xl text-[#5a6063]" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#e8603a] rounded-full border-2 border-[#f5f5f7]" />
          </button>
        </div>
        {/* ─── Inline CentsiCoach Card ─── */}
        <button
          onClick={() => setShowCoach(true)}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 hover:shadow-md transition-all text-left max-w-xs lg:max-w-sm"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}
        >
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-[#e8603a] flex items-center justify-center text-white">
              <MaterialIcon name="smart_toy" className="text-xl" fill />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#e8603a] mb-0.5">Centsi AI Coach</p>
            <p className="text-xs text-[#2e3336] font-medium leading-snug line-clamp-2">
              {insightLoading ? "Thinking…" : inlineInsight ? `"${inlineInsight.replace(/^["']+|["']+$/g, "")}"` : "Ask me anything about your finances!"}
            </p>
          </div>
        </button>
      </div>

      {/* ─── Main Bento Grid ─── */}
      <main className="px-5 lg:px-10 pb-24 md:pb-10">

        {/* ─── Top Row: Financial Overview ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">

          {/* Card 1: Current Balance */}
          <div className="bg-white rounded-3xl p-7 flex flex-col justify-between min-h-[240px]" style={cardShadow}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black tracking-[0.2em] text-[#5a6063] uppercase">Centsible</span>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#f5f5f7] text-[#5a6063] text-[10px] font-medium px-3 py-1.5 rounded-full appearance-none cursor-pointer focus:outline-none">
                  {availableMonths.map((key) => { const [y, m] = key.split("-").map(Number); return <option key={key} value={key}>{MONTH_NAMES[m]}</option>; })}
                </select>
              </div>
              <p className="text-xs text-[#5a6063] mb-1">Current Balance</p>
              <h2 className="text-3xl font-black font-headline tracking-tight">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            </div>
            <div>
              <div className="flex items-center gap-3 mt-5">
                <span className="bg-[#e8603a] text-white px-5 py-2 rounded-full text-[10px] font-bold">Income</span>
                <span className="border border-black/10 px-5 py-2 rounded-full text-[10px] font-bold">Expenses</span>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
                {income > 0 && expenses > 0 ? (
                  balance >= 0 ? (
                    <span className="flex items-center gap-1 text-[#006d50]"><MaterialIcon name="trending_up" className="text-sm" /> Saving {savingsRate}% this month</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#e8603a]"><MaterialIcon name="trending_down" className="text-sm" /> Over budget by ${Math.abs(balance).toFixed(0)}</span>
                  )
                ) : (
                  <span className="text-[#5a6063]">Start tracking to see trends</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Income + Expenses stacked */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-6 flex-1" style={cardShadow}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 bg-[#e0faf1] rounded-full flex items-center justify-center">
                  <MaterialIcon name="payments" className="text-[#006d50] text-base" fill />
                </div>
                <span className="text-[10px] text-[#5a6063] font-medium bg-[#f5f5f7] px-2.5 py-1 rounded-full">Monthly ▾</span>
              </div>
              <p className="text-xs text-[#5a6063] mb-0.5">Total Income</p>
              <h3 className="text-2xl font-black font-headline">${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 flex-1" style={cardShadow}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 bg-[#fff0e8] rounded-full flex items-center justify-center">
                  <MaterialIcon name="shopping_cart" className="text-[#e8603a] text-base" fill />
                </div>
                <span className="text-[10px] text-[#5a6063] font-medium bg-[#f5f5f7] px-2.5 py-1 rounded-full">Monthly ▾</span>
              </div>
              <p className="text-xs text-[#5a6063] mb-0.5">Total Expenses</p>
              <h3 className="text-2xl font-black font-headline">${expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-[#e8603a] font-semibold mt-3 flex items-center gap-1 cursor-pointer hover:underline">
                <MaterialIcon name="bar_chart" className="text-xs" /> View on chart mode
              </p>
            </div>
          </div>

          {/* Card 3: Budget Lock + Wellness Gauge */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-5 text-center" style={cardShadow}>
              <div className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-2">
                <MaterialIcon name="lock" className="text-lg text-[#2e3336]" />
              </div>
              <p className="text-xs font-bold">Budget Lock</p>
              <p className="text-[10px] text-[#5a6063]">{monthlyBudget > 0 ? `$${monthlyBudget}/mo` : "Not set"}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 flex-1 flex flex-col items-center justify-center relative" style={cardShadow}>
              <button onClick={() => setShowInfo(!showInfo)} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
                <MaterialIcon name="info" className="text-[#adb3b6] text-sm" />
              </button>
              {showInfo && (
                <div className="absolute inset-0 bg-white/95 z-10 p-4 rounded-3xl text-left text-[11px] space-y-2 flex flex-col justify-center backdrop-blur-sm">
                  <p className="font-bold text-xs mb-1">How it works</p>
                  <p><strong className="text-[#e8603a]">Budget (40%)</strong> Under limit</p>
                  <p><strong className="text-[#e8603a]">Savings (35%)</strong> % kept</p>
                  <p><strong className="text-[#e8603a]">Balance (25%)</strong> Category spread</p>
                  <button onClick={() => setShowInfo(false)} className="mt-1 font-bold text-[#e8603a] text-[10px]">GOT IT</button>
                </div>
              )}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={gaugeRadius} fill="transparent" stroke="#eef0f3" strokeWidth="10" />
                  <circle cx="60" cy="60" r={gaugeRadius} fill="transparent" stroke="#e8603a" strokeWidth="10"
                    strokeDasharray={gaugeCircumference} strokeDashoffset={gaugeDashoffset}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black font-headline">{savingsScore}%</span>
                  <span className="text-[9px] font-bold text-[#5a6063] uppercase tracking-wide">{scoreLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Month Tracker + Net Savings */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-5" style={cardShadow}>
              <div className="flex items-center justify-between mb-2">
                <MaterialIcon name="schedule" className="text-lg text-[#2e3336]" />
                <MaterialIcon name="bar_chart" className="text-lg text-[#5a6063]" />
              </div>
              <h3 className="text-2xl font-black font-headline">{MONTH_NAMES[selMonth]}</h3>
              <p className="text-[10px] text-[#5a6063] mt-0.5">{monthlyTransactions.length} transactions</p>
            </div>
            <div className="bg-white rounded-3xl p-5 flex-1" style={cardShadow}>
              <div className="flex items-center justify-between mb-2">
                <MaterialIcon name="trending_up" className="text-[#006d50]" />
                {savingsRate > 0 && <span className="text-[10px] text-[#006d50] font-bold bg-[#e0faf1] px-2 py-0.5 rounded-full">+{savingsRate}%</span>}
              </div>
              <p className="text-xl font-black font-headline">${Math.max(0, balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-[#5a6063] mt-0.5">Net Savings</p>
              <div className="mt-3 flex items-end gap-[3px] h-10">
                {monthlyBarData.length > 0 ? monthlyBarData.map((d) => {
                  const isSelected = d.key === selectedMonth;
                  const heightPct = Math.max(8, Math.round((Math.abs(d.net) / maxBarNet) * 100));
                  return (
                    <div key={d.key} className="flex-1 rounded-sm transition-all duration-500"
                      style={{ height: `${heightPct}%`, background: isSelected ? '#e8603a' : d.net >= 0 ? 'rgba(232,96,58,0.25)' : 'rgba(232,96,58,0.1)' }}
                      title={`${MONTH_NAMES[parseInt(d.key.split("-")[1])]}: $${d.net.toFixed(0)}`}
                    />
                  );
                }) : (
                  <p className="text-[10px] text-[#adb3b6]">No data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row: Activity & Goals ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_2fr_1fr] gap-5">

          {/* Achievements (bubble style) */}
          <div className="bg-white rounded-3xl p-7" style={cardShadow}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold font-headline">Achievements</h3>
              <button className="text-[#e8603a] text-[10px] font-bold uppercase tracking-wider hover:underline">View All</button>
            </div>
            <div className="relative h-52">
              {BADGES.map((badge, i) => {
                const earned = badge.condition(monthlyBudget, savingsScore);
                const configs = [
                  { size: 110, left: 0,   top: 80,  opacity: 0.25 },
                  { size: 90,  left: 95,  top: 20,  opacity: 0.2  },
                  { size: 70,  left: 30,  top: 10,  opacity: 0.15 },
                  { size: 58,  left: 140, top: 115, opacity: 0.12 },
                ];
                const c = configs[i];
                return (
                  <div key={badge.name} className="absolute rounded-full flex flex-col items-center justify-center text-center cursor-pointer group transition-transform hover:scale-105"
                    style={{ width: c.size, height: c.size, left: c.left, top: c.top, background: earned ? undefined : `rgba(0,0,0,${c.opacity * 0.3})` }}
                  >
                    {earned && <div className="absolute inset-0 rounded-full" style={{ background: `rgba(0,0,0,0.04)` }} />}
                    <div className={`absolute inset-0 rounded-full ${earned ? badge.bgColor + "/25" : ""}`} />
                    <div className="relative z-10 flex flex-col items-center">
                      <MaterialIcon name={badge.icon} className={`text-lg mb-0.5 ${earned ? badge.textColor : "text-[#5a6063]/40"}`} fill={earned} />
                      <p className={`text-[9px] font-bold leading-tight ${earned ? "" : "text-[#5a6063]/60"}`}>{badge.name}</p>
                      <p className="text-[7px] text-[#5a6063]/60">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Manager */}
          <div className="bg-white rounded-3xl p-7" style={cardShadow}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold font-headline">Activity Manager</h3>
              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
                  <MaterialIcon name="more_vert" className="text-[#5a6063] text-lg" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
                  <MaterialIcon name="tune" className="text-[#5a6063] text-lg" />
                </button>
                <button className="flex items-center gap-1 text-[10px] text-[#5a6063] font-medium bg-[#f5f5f7] px-3 py-1.5 rounded-full hover:bg-[#eef0f3]">
                  <MaterialIcon name="filter_list" className="text-sm" /> Filters
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-center text-[#5a6063] text-sm py-12">No transactions yet this month.</p>
              ) : (
                recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center">
                        <MaterialIcon name={CATEGORY_MATERIAL_ICONS[t.type === "income" ? "Income" : t.category] || "more_horiz"} className="text-lg text-[#5a6063]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.desc}</p>
                        <p className="text-[10px] text-[#5a6063]">{formatDate(t.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${t.type === "income" ? "text-[#006d50]" : "text-[#e8603a]"}`}>
                        {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                      </p>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(t)} className="p-1 text-[#5a6063] hover:text-[#e8603a] rounded"><MaterialIcon name="edit" className="text-sm" /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1 text-[#5a6063] hover:text-[#ac3434] rounded"><MaterialIcon name="delete" className="text-sm" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* North Star + AI Review stacked */}
          <div className="flex flex-col gap-5">
            <div className="bg-[#2e3336] rounded-3xl p-6 text-white">
              <div className="w-10 h-10 bg-[#e8603a] rounded-full flex items-center justify-center mb-4">
                <MaterialIcon name="flag" className="text-white text-xl" />
              </div>
              <h3 className="font-bold font-headline text-base mb-1">Monthly North Star</h3>
              <p className="text-[11px] text-[#adb3b6] mb-5 leading-relaxed">Your #1 priority for {MONTH_NAMES[selMonth]}.</p>
              {!editingBudget ? (
                <button onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : ""); }}
                  className="bg-white text-[#2e3336] w-full py-3 rounded-full font-bold text-sm hover:bg-[#ffd0b8] transition-colors">
                  {monthlyBudget > 0 ? `Budget: $${monthlyBudget}` : "Start Planning"}
                </button>
              ) : (
                <form onSubmit={handleSaveBudget} className="flex gap-2">
                  <input type="number" placeholder="e.g. 500" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 rounded-full bg-white text-[#2e3336] font-bold text-sm focus:outline-none" required />
                  <button type="submit" className="bg-[#e8603a] text-white px-4 py-3 rounded-full font-bold text-sm">Save</button>
                  <button type="button" onClick={() => setEditingBudget(false)} className="text-[#adb3b6] hover:text-white">&#10005;</button>
                </form>
              )}
            </div>
            <div className="bg-white rounded-3xl p-6 flex-1" style={cardShadow}>
              <p className="text-[10px] text-[#e8603a] font-bold uppercase tracking-wider mb-3">AI Review</p>
              <h4 className="font-bold font-headline text-sm mb-3">How's your spending?</h4>
              <p className="text-xs text-[#5a6063] leading-relaxed mb-4">
                {savingsScore >= 70 ? "Excellent! You're in the top 5% of students." :
                 savingsScore >= 40 ? "Making progress! Keep tracking your habits." :
                 "Set a budget and start tracking to improve."}
              </p>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((level) => {
                  const active = level <= Math.ceil(savingsScore / 20);
                  return (
                    <div key={level} className={`flex-1 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${active ? "border-[#e8603a] bg-[#e8603a]/5" : "border-black/8"}`}>
                      <svg width="16" height="10" viewBox="0 0 16 10">
                        <path d={level <= 2 ? "M3 3 Q8 9 13 3" : level === 3 ? "M3 5 L13 5" : "M3 7 Q8 1 13 7"}
                          fill="none" stroke={active ? "#e8603a" : "#ccc"} strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── CentsiCoach Section ─── */}
        <div className="mt-5 bg-white rounded-3xl p-8 lg:p-10" style={cardShadow}>
          <CentsiCoach
            totals={{ income, expenses, balance }}
            budget={monthlyBudget}
            score={savingsScore}
            transactions={monthlyTransactions}
            stitch
          />
        </div>
      </main>

      {/* ─── Mini Side Actions (desktop) ─── */}
      <div className="hidden xl:flex flex-col gap-4 fixed left-4 top-1/2 -translate-y-1/2 z-30">
        <button onClick={() => setShowAddForm(true)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <MaterialIcon name="add" className="text-lg" />
        </button>
        <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <MaterialIcon name="logout" className="text-lg text-[#5a6063]" />
        </button>
      </div>

      {/* ─── Add Transaction Modal ─── */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-headline">New Transaction</h3>
              <button onClick={() => setShowAddForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
                <MaterialIcon name="close" className="text-[#5a6063]" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" placeholder="What did you spend on?" value={desc} onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all" required />
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none appearance-none cursor-pointer">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              {type === "expense" && (
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none appearance-none cursor-pointer">
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              )}
              <button type="submit" className="w-full py-4 bg-[#e8603a] text-white rounded-full font-semibold hover:opacity-90 transition-opacity" style={{ boxShadow: "0 8px 24px rgba(232,96,58,0.2)" }}>
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Transaction Modal ─── */}
      {editingTxn && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingTxn(null)}>
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-headline mb-6">Edit Transaction</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                  className="bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20" required />
                <select value={editType} onChange={(e) => setEditType(e.target.value)}
                  className="bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none appearance-none cursor-pointer">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              {editType === "expense" && (
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none appearance-none cursor-pointer">
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-4 bg-[#e8603a] text-white rounded-full font-semibold">Save</button>
                <button type="button" onClick={() => setEditingTxn(null)} className="flex-1 py-4 bg-[#f5f5f7] text-[#5a6063] rounded-full font-semibold hover:bg-[#eef0f3]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Quick Coach Modal (from header/nav buttons) ─── */}
      {showCoach && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowCoach(false)}>
          <div className="bg-white w-full sm:w-[500px] sm:max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e8603a] to-[#c94e2a] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MaterialIcon name="psychology" className="text-xl" fill />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-sm">CentsiCoach</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">AI Financial Advisor</p>
                </div>
              </div>
              <button onClick={() => setShowCoach(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                <MaterialIcon name="close" className="text-lg" />
              </button>
            </div>
            <div className="p-6">
              <CentsiCoach
                totals={{ income, expenses, balance }}
                budget={monthlyBudget}
                score={savingsScore}
                transactions={monthlyTransactions}
                stitch
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl flex justify-around items-center h-20 px-4 z-40" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <button className="flex flex-col items-center gap-1 text-[#e8603a]">
          <MaterialIcon name="grid_view" fill /> <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setEditingBudget(true)} className="flex flex-col items-center gap-1 text-[#5a6063]">
          <MaterialIcon name="account_balance_wallet" /> <span className="text-[10px] font-bold">Budget</span>
        </button>
        <div className="relative -top-8">
          <button onClick={() => setShowAddForm(true)} className="w-14 h-14 bg-[#e8603a] text-white rounded-full shadow-lg flex items-center justify-center" style={{ boxShadow: "0 8px 24px rgba(232,96,58,0.3)" }}>
            <MaterialIcon name="add" className="text-3xl" />
          </button>
        </div>
        <button onClick={() => setShowCoach(true)} className="flex flex-col items-center gap-1 text-[#5a6063]">
          <MaterialIcon name="psychology" /> <span className="text-[10px] font-bold">AI</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-[#5a6063]">
          <MaterialIcon name="logout" /> <span className="text-[10px] font-bold">Logout</span>
        </button>
      </nav>
    </div>
  );
}
