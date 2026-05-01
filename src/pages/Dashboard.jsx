import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { getAutoInsight } from "../services/ai";
import { MONTH_NAMES, CATEGORIES, getMonthYear, downloadCSV, MaterialIcon } from "../utils/dashboardUtils";
import { seedDemoData } from "../utils/seedDemoData";

// Components
import DashboardHeader from "../components/DashboardHeader";
import SidebarMenu from "../components/SidebarMenu";
import FinancialCards from "../components/FinancialCards";
import ActivityManager from "../components/ActivityManager";
import AchievementBadges from "../components/AchievementBadges";
import CategoryChart from "../components/CategoryChart";
import SavingsGoals from "../components/SavingsGoals";
import CentsiCoach from "../components/CentsiCoach";
import MobileBottomNav from "../components/MobileBottomNav";
import MonthlySummary from "../components/MonthlySummary";
import SpendingForecast from "../components/SpendingForecast";
import ReceiptScanner from "../components/ReceiptScanner";
import { AddTransactionModal, EditTransactionModal, AllTransactionsModal } from "../components/TransactionModals";

export default function Dashboard() {
  // ─── State ───
  const [transactions, setTransactions] = useState([]);
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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [receiptPrefill, setReceiptPrefill] = useState(null);

  const navigate = useNavigate();
  const user = auth.currentUser;

  // ─── Firestore Subscriptions ───
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

  // ─── Computed Values ───
  const [selYear, selMonth] = selectedMonth.split("-").map(Number);

  const monthlyTransactions = transactions.filter((t) => {
    const my = getMonthYear(t.createdAt);
    return my && my.month === selMonth && my.year === selYear;
  });

  // Previous month transactions (for Monthly Summary comparison)
  const prevMonthTransactions = useMemo(() => {
    const pm = selMonth === 0 ? 11 : selMonth - 1;
    const py = selMonth === 0 ? selYear - 1 : selYear;
    return transactions.filter((t) => {
      const my = getMonthYear(t.createdAt);
      return my && my.month === pm && my.year === py;
    });
  }, [transactions, selMonth, selYear]);

  const filteredTransactions = useMemo(() => {
    let txns = monthlyTransactions;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      txns = txns.filter((t) => t.desc.toLowerCase().includes(q));
    }
    if (filterCategory !== "All") txns = txns.filter((t) => t.category === filterCategory);
    if (filterType !== "all") txns = txns.filter((t) => t.type === filterType);
    return txns;
  }, [monthlyTransactions, searchQuery, filterCategory, filterType]);

  const availableMonths = [...new Set(transactions.map((t) => {
    const my = getMonthYear(t.createdAt);
    return my ? `${my.year}-${my.month}` : null;
  }).filter(Boolean))].sort().reverse();

  const currentKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
  if (!availableMonths.includes(currentKey)) availableMonths.unshift(currentKey);

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

  const recentTransactions = filteredTransactions.slice(0, 5);
  const today = new Date();

  // ─── Handlers ───
  function handleLogout() { signOut(auth).then(() => navigate("/")); }

  async function handleAdd({ desc, amount, type, category }) {
    if (!desc || !amount || !user) return;
    await addDoc(collection(db, "users", user.uid, "transactions"), {
      desc, amount, type, category, createdAt: new Date(),
    });
    setShowAddForm(false);
  }

  async function handleDelete(id) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  }

  function startEdit(t) { setEditingTxn(t); }

  async function handleSaveEdit(id, data) {
    if (!user || !id) return;
    await updateDoc(doc(db, "users", user.uid, "transactions", id), data);
    setEditingTxn(null);
  }

  async function handleSaveBudget(e) {
    e.preventDefault();
    if (!user || !budgetInput) return;
    const amt = parseFloat(budgetInput);
    await setDoc(doc(db, "users", user.uid, "settings", "budget"), { amount: amt });
    setMonthlyBudget(amt); setBudgetInput(""); setEditingBudget(false);
  }

  // ─── Render ───
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-body text-[#2e3336]">

      <SidebarMenu
        user={user}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEditBudget={() => setEditingBudget(true)}
        onShowCoach={() => setShowCoach(true)}
        onLogout={handleLogout}
        navigate={navigate}
      />

      <DashboardHeader
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        onAddClick={() => setShowAddForm(true)}
        onMenuClick={() => setMenuOpen(true)}
      />

      {/* ─── Sub-header ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-5 lg:px-10 py-6 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full border-2 border-[#2e3336] flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-black font-headline">{today.getDate()}</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold font-headline text-lg">{new Intl.DateTimeFormat("en", { weekday: "short" }).format(today)},</p>
            <p className="font-bold font-headline text-lg">{MONTH_NAMES[selMonth]}</p>
          </div>
          <div className="h-10 w-px bg-black/10 hidden md:block" />
          <button onClick={() => setShowAddForm(true)} className="bg-[#e8603a] text-white pl-6 pr-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ boxShadow: "0 4px 16px rgba(232,96,58,0.25)" }}>
            Add Transaction <MaterialIcon name="arrow_forward" className="text-base" />
          </button>
          {/* Month Picker */}
          <MonthPicker
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            availableMonths={availableMonths}
          />
          {/* Monthly Report Button */}
          <button
            onClick={() => setShowMonthlySummary(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 hover:bg-white transition-colors relative"
            title="Monthly Report"
          >
            <MaterialIcon name="summarize" className="text-xl text-[#5a6063]" />
          </button>
          {/* Load Demo Data Button */}
          {monthlyTransactions.length === 0 && (
            <button
              onClick={async () => {
                if (!user) return;
                try {
                  await seedDemoData(user.uid);
                  setSelectedMonth("2026-2");
                } catch (err) {
                  console.error("Seed error:", err);
                  alert("Error loading demo data: " + err.message);
                }
              }}
              className="flex items-center gap-2 bg-[#2e3336] text-white px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-[#1a1d1f] transition-colors"
            >
              <MaterialIcon name="science" className="text-base" /> Load Demo Data
            </button>
          )}
        </div>
        {/* Inline CentsiCoach Card */}
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

        <FinancialCards
          balance={balance}
          income={income}
          expenses={expenses}
          monthlyBudget={monthlyBudget}
          savingsScore={savingsScore}
          scoreLabel={scoreLabel}
          savingsRate={savingsRate}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          availableMonths={availableMonths}
          monthlyTransactions={monthlyTransactions}
          monthlyBarData={monthlyBarData}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          editingBudget={editingBudget}
          setEditingBudget={setEditingBudget}
          budgetInput={budgetInput}
          setBudgetInput={setBudgetInput}
          onSaveBudget={handleSaveBudget}
        />

        {/* ─── Middle Row: Category Chart + Activity + North Star ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_2fr_1fr] gap-5 mb-5">
          <div className="bg-white rounded-3xl p-7" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
            <CategoryChart transactions={monthlyTransactions} />
          </div>

          <ActivityManager
            filteredTransactions={filteredTransactions}
            recentTransactions={recentTransactions}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterType={filterType}
            setFilterType={setFilterType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onEdit={startEdit}
            onDelete={handleDelete}
            onViewAll={() => setShowAllTransactions(true)}
            onExportCSV={() => downloadCSV(monthlyTransactions, MONTH_NAMES[selMonth])}
          />

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
            <div className="bg-white rounded-3xl p-6 flex-1" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <p className="text-[10px] text-[#e8603a] font-bold uppercase tracking-wider mb-3">AI Review</p>
              <h4 className="font-bold font-headline text-sm mb-3">How&apos;s your spending?</h4>
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

        {/* ─── Bottom Row: Achievements + Savings Goals + Spending Forecast ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
          <AchievementBadges monthlyBudget={monthlyBudget} savingsScore={savingsScore} />
          <div className="bg-white rounded-3xl p-7" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
            <SavingsGoals />
          </div>
          <SpendingForecast
            monthlyTransactions={monthlyTransactions}
            monthlyBudget={monthlyBudget}
            selectedMonth={selectedMonth}
            allTransactions={transactions}
          />
        </div>

        {/* ─── CentsiCoach Section ─── */}
        <div className="mt-5 bg-white rounded-3xl p-8 lg:p-10" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
        <button onClick={() => downloadCSV(monthlyTransactions, MONTH_NAMES[selMonth])} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} title="Export CSV">
          <MaterialIcon name="download" className="text-lg text-[#5a6063]" />
        </button>
        <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <MaterialIcon name="logout" className="text-lg text-[#5a6063]" />
        </button>
      </div>

      {/* ─── Modals ─── */}
      <AddTransactionModal
        open={showAddForm}
        onClose={() => { setShowAddForm(false); setReceiptPrefill(null); }}
        onAdd={handleAdd}
        prefill={receiptPrefill}
        onScanReceipt={() => setShowReceiptScanner(true)}
      />
      <EditTransactionModal transaction={editingTxn} onClose={() => setEditingTxn(null)} onSave={handleSaveEdit} />
      <ReceiptScanner
        open={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
        onScanned={async (data) => {
          // Save directly to Firestore
          await handleAdd({
            desc: data.desc,
            amount: parseFloat(data.amount),
            type: 'expense',
            category: data.category || 'Other',
          });
          setShowReceiptScanner(false);
        }}
      />
      <AllTransactionsModal
        open={showAllTransactions}
        onClose={() => setShowAllTransactions(false)}
        filteredTransactions={filteredTransactions}
        onEdit={(t) => { startEdit(t); setShowAllTransactions(false); }}
        onDelete={handleDelete}
        selectedMonth={selectedMonth}
      />
      <MonthlySummary
        open={showMonthlySummary}
        onClose={() => setShowMonthlySummary(false)}
        monthlyTransactions={monthlyTransactions}
        prevMonthTransactions={prevMonthTransactions}
        selectedMonth={selectedMonth}
        monthlyBudget={monthlyBudget}
        savingsScore={savingsScore}
      />

      {/* Quick Coach Modal */}
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

      <MobileBottomNav
        onAddClick={() => setShowAddForm(true)}
        onBudgetClick={() => setEditingBudget(true)}
        onCoachClick={() => setShowCoach(true)}
        onLogout={handleLogout}
      />
    </div>
  );
}

// ─── Month Picker (small inline component) ───

function MonthPicker({ selectedMonth, setSelectedMonth, availableMonths }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 hover:bg-white transition-colors relative">
        <MaterialIcon name="calendar_month" className="text-xl text-[#5a6063]" />
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#e8603a] rounded-full border-2 border-[#f5f5f7]" />
      </button>
      {open && (
        <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-black/6 p-3 z-30 w-56 animate-fadeIn">
          <p className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-2 px-2">Select Month</p>
          <div className="max-h-52 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "thin" }}>
            {availableMonths.map((key) => {
              const [y, m] = key.split("-").map(Number);
              const isSelected = key === selectedMonth;
              return (
                <button
                  key={key}
                  onClick={() => { setSelectedMonth(key); setOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isSelected ? "bg-[#e8603a] text-white" : "hover:bg-[#f5f5f7] text-[#2e3336]"
                  }`}
                >
                  {MONTH_NAMES[m]} {y}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
