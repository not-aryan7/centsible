import { useState, useEffect } from "react";
import { MaterialIcon, MONTH_NAMES, CATEGORY_COLORS, downloadCSV } from "../utils/dashboardUtils";
import { getAutoInsight } from "../services/ai";

export default function MonthlySummary({
  open,
  onClose,
  monthlyTransactions,
  prevMonthTransactions,
  selectedMonth,
  monthlyBudget,
  savingsScore,
}) {
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [, selMonth] = selectedMonth.split("-").map(Number);
  const monthName = MONTH_NAMES[selMonth];

  // Current month stats
  const income = monthlyTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  // Previous month stats
  const prevIncome = prevMonthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Month-over-month changes
  const incomeChange = prevIncome > 0 ? Math.round(((income - prevIncome) / prevIncome) * 100) : null;
  const expenseChange = prevExpenses > 0 ? Math.round(((expenses - prevExpenses) / prevExpenses) * 100) : null;

  // Top 3 spending categories
  const categoryTotals = {};
  monthlyTransactions.filter((t) => t.type === "expense").forEach((t) => {
    const cat = t.category || "Other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
  });
  const topCategories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  const maxCategoryAmount = topCategories.length > 0 ? topCategories[0].amount : 1;

  // Fetch AI summary when modal opens
  useEffect(() => {
    if (!open) return;
    setAiLoading(true);
    setAiSummary("");

    const context = {
      budget: monthlyBudget,
      income,
      expenses,
      balance,
      score: savingsScore,
      recentTransactions: monthlyTransactions
        .slice(0, 8)
        .map((t) => `${t.desc} ($${t.amount})`)
        .join(", ") || "none yet",
    };

    getAutoInsight(context)
      .then((text) => setAiSummary(text))
      .catch(() => setAiSummary("Couldn't generate a summary right now. Try again later!"))
      .finally(() => setAiLoading(false));
  }, [open]);

  if (!open) return null;

  // Score gauge
  const gaugeRadius = 36;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeDashoffset = gaugeCircumference - (gaugeCircumference * savingsScore) / 100;
  const scoreLabel = savingsScore >= 90 ? "Excellent" : savingsScore >= 70 ? "Good" : savingsScore >= 50 ? "Fair" : savingsScore >= 30 ? "Poor" : "Needs Work";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:w-[520px] sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#e8603a] mb-0.5">Monthly Report</p>
            <h3 className="text-xl font-bold font-headline">{monthName} Summary</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCSV(monthlyTransactions, monthName)}
              className="flex items-center gap-1 text-[10px] text-[#e8603a] font-bold bg-[#e8603a]/10 px-3 py-1.5 rounded-full hover:bg-[#e8603a]/20 transition-colors"
            >
              <MaterialIcon name="download" className="text-sm" /> CSV
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
              <MaterialIcon name="close" className="text-[#5a6063]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6" style={{ scrollbarWidth: "thin" }}>

          {/* Income vs Expenses */}
          <div>
            <p className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-4">Income vs. Expenses</p>
            <div className="grid grid-cols-2 gap-4">
              {/* Income bar */}
              <div className="bg-[#e0faf1] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MaterialIcon name="payments" className="text-[#006d50] text-base" fill />
                  <span className="text-[10px] font-bold text-[#006d50] uppercase tracking-wider">Income</span>
                </div>
                <p className="text-2xl font-black font-headline text-[#006d50]">${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                {incomeChange !== null && (
                  <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${incomeChange >= 0 ? "text-[#006d50]" : "text-[#e8603a]"}`}>
                    <MaterialIcon name={incomeChange >= 0 ? "trending_up" : "trending_down"} className="text-sm" />
                    {incomeChange >= 0 ? "+" : ""}{incomeChange}% vs. last month
                  </div>
                )}
              </div>
              {/* Expenses bar */}
              <div className="bg-[#fff0e8] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MaterialIcon name="shopping_cart" className="text-[#e8603a] text-base" fill />
                  <span className="text-[10px] font-bold text-[#e8603a] uppercase tracking-wider">Expenses</span>
                </div>
                <p className="text-2xl font-black font-headline text-[#e8603a]">${expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                {expenseChange !== null && (
                  <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${expenseChange <= 0 ? "text-[#006d50]" : "text-[#e8603a]"}`}>
                    <MaterialIcon name={expenseChange <= 0 ? "trending_down" : "trending_up"} className="text-sm" />
                    {expenseChange >= 0 ? "+" : ""}{expenseChange}% vs. last month
                  </div>
                )}
              </div>
            </div>
            {/* Net savings bar */}
            <div className="mt-4 bg-[#f5f5f7] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name={balance >= 0 ? "savings" : "warning"} className={`text-lg ${balance >= 0 ? "text-[#006d50]" : "text-[#e8603a]"}`} fill />
                <span className="text-sm font-bold">Net Savings</span>
              </div>
              <span className={`text-lg font-black font-headline ${balance >= 0 ? "text-[#006d50]" : "text-[#e8603a]"}`}>
                {balance >= 0 ? "+" : "-"}${Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Top Spending Categories */}
          <div>
            <p className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-4">Top Spending Categories</p>
            {topCategories.length === 0 ? (
              <p className="text-sm text-[#adb3b6] text-center py-4">No expenses logged this month.</p>
            ) : (
              <div className="space-y-3">
                {topCategories.map((cat, i) => {
                  const pct = expenses > 0 ? Math.round((cat.amount / expenses) * 100) : 0;
                  const barWidth = Math.max(8, Math.round((cat.amount / maxCategoryAmount) * 100));
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat.name] || "#6b7280" }} />
                          <span className="text-sm font-bold">{cat.name}</span>
                          {i === 0 && <span className="text-[8px] font-bold bg-[#e8603a]/10 text-[#e8603a] px-1.5 py-0.5 rounded-full uppercase">Top</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">${cat.amount.toFixed(2)}</span>
                          <span className="text-[10px] text-[#adb3b6] font-medium w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: CATEGORY_COLORS[cat.name] || "#6b7280",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Savings Score + Budget */}
          <div className="flex gap-4">
            {/* Savings Score Gauge */}
            <div className="flex-1 bg-[#f5f5f7] rounded-2xl p-5 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 84 84">
                  <circle cx="42" cy="42" r={gaugeRadius} fill="transparent" stroke="#e5e7eb" strokeWidth="7" />
                  <circle cx="42" cy="42" r={gaugeRadius} fill="transparent" stroke="#e8603a" strokeWidth="7"
                    strokeDasharray={gaugeCircumference} strokeDashoffset={gaugeDashoffset}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black font-headline">{savingsScore}</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider">{scoreLabel}</p>
              <p className="text-[9px] text-[#adb3b6] mt-0.5">Wellness Score</p>
            </div>

            {/* Budget status */}
            <div className="flex-1 bg-[#f5f5f7] rounded-2xl p-5 flex flex-col justify-center">
              <MaterialIcon name="account_balance_wallet" className="text-xl text-[#e8603a] mb-2" fill />
              <p className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-1">Budget</p>
              {monthlyBudget > 0 ? (
                <>
                  <p className="text-lg font-black font-headline">${monthlyBudget}</p>
                  <div className="mt-2 w-full h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.round((expenses / monthlyBudget) * 100))}%`,
                        background: expenses > monthlyBudget
                          ? "#ef4444"
                          : expenses > monthlyBudget * 0.85
                            ? "#f59e0b"
                            : "#10b981",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#5a6063] mt-1">
                    ${expenses.toFixed(0)} of ${monthlyBudget} spent ({Math.min(100, Math.round((expenses / monthlyBudget) * 100))}%)
                  </p>
                </>
              ) : (
                <p className="text-xs text-[#adb3b6]">Not set yet</p>
              )}
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-br from-[#2e3336] to-[#1a1d1f] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#e8603a] rounded-lg flex items-center justify-center">
                <MaterialIcon name="psychology" className="text-base text-white" fill />
              </div>
              <div>
                <p className="text-xs font-bold">CentsiCoach Summary</p>
                <p className="text-[9px] text-white/50 uppercase tracking-widest font-semibold">AI Generated</p>
              </div>
            </div>
            {aiLoading ? (
              <div className="flex gap-2 py-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#e8603a]"
                    style={{
                      animation: "centsi-bounce 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes centsi-bounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                    40% { transform: translateY(-6px); opacity: 1; }
                  }
                `}</style>
              </div>
            ) : (
              <p className="text-sm text-white/85 leading-relaxed italic">
                &ldquo;{aiSummary}&rdquo;
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-[#f5f5f7] rounded-xl p-3">
              <p className="text-lg font-black font-headline">{monthlyTransactions.length}</p>
              <p className="text-[9px] text-[#5a6063] font-bold uppercase tracking-wider">Transactions</p>
            </div>
            <div className="text-center bg-[#f5f5f7] rounded-xl p-3">
              <p className="text-lg font-black font-headline">{Object.keys(categoryTotals).length}</p>
              <p className="text-[9px] text-[#5a6063] font-bold uppercase tracking-wider">Categories</p>
            </div>
            <div className="text-center bg-[#f5f5f7] rounded-xl p-3">
              <p className="text-lg font-black font-headline">{savingsRate > 0 ? `${savingsRate}%` : "—"}</p>
              <p className="text-[9px] text-[#5a6063] font-bold uppercase tracking-wider">Saved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
