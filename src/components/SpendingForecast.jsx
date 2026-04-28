import { useState, useEffect, useMemo } from "react";
import { MaterialIcon, CATEGORIES, CATEGORY_COLORS, CATEGORY_MATERIAL_ICONS } from "../utils/dashboardUtils";
import { getSpendingForecast } from "../services/ai";

export default function SpendingForecast({ monthlyTransactions, monthlyBudget, selectedMonth, allTransactions }) {
  const [aiWarning, setAiWarning] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [selYear, selMonth] = selectedMonth.split("-").map(Number);

  // Calculate projections
  const projections = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
    const isCurrentMonth = now.getFullYear() === selYear && now.getMonth() === selMonth;
    const daysSoFar = isCurrentMonth ? now.getDate() : daysInMonth;

    if (daysSoFar === 0) return [];

    // Current month category totals
    const categorySpend = {};
    monthlyTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        categorySpend[cat] = (categorySpend[cat] || 0) + t.amount;
      });

    // Historical averages (last 3 months, excluding current)
    const historyAverages = {};
    if (allTransactions) {
      const historyCounts = {};
      allTransactions
        .filter((t) => {
          if (t.type !== "expense") return false;
          const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
          const tMonth = d.getMonth();
          const tYear = d.getFullYear();
          // Exclude current month, look at last 3 months
          if (tYear === selYear && tMonth === selMonth) return false;
          const monthsAgo = (selYear - tYear) * 12 + (selMonth - tMonth);
          return monthsAgo > 0 && monthsAgo <= 3;
        })
        .forEach((t) => {
          const cat = t.category || "Other";
          const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!historyAverages[cat]) historyAverages[cat] = {};
          if (!historyAverages[cat][key]) historyAverages[cat][key] = 0;
          historyAverages[cat][key] += t.amount;
          historyCounts[cat] = historyCounts[cat] || new Set();
          historyCounts[cat].add(key);
        });

      // Average per category
      Object.keys(historyAverages).forEach((cat) => {
        const months = Object.values(historyAverages[cat]);
        historyAverages[cat] = months.reduce((s, v) => s + v, 0) / months.length;
      });
    }

    // Build projections for categories that have spending
    const results = Object.entries(categorySpend)
      .map(([category, spent]) => {
        const dailyRate = spent / daysSoFar;
        const projected = isCurrentMonth ? dailyRate * daysInMonth : spent;
        const historicalAvg = historyAverages[category] || null;
        const isAnomaly = historicalAvg && projected > historicalAvg * 2;

        // Budget allocation estimate: proportional to historical or even split
        const budgetShare = monthlyBudget > 0
          ? monthlyBudget / Math.max(Object.keys(categorySpend).length, 1)
          : null;

        const pctOfBudget = budgetShare ? Math.round((projected / budgetShare) * 100) : null;

        return {
          category,
          spent,
          projected: Math.round(projected * 100) / 100,
          dailyRate: Math.round(dailyRate * 100) / 100,
          historicalAvg: historicalAvg ? Math.round(historicalAvg * 100) / 100 : null,
          isAnomaly,
          pctOfBudget,
          // Status: green/amber/red based on budget pace
          status: !isCurrentMonth ? "complete"
            : pctOfBudget && pctOfBudget > 100 ? "over"
            : pctOfBudget && pctOfBudget > 80 ? "warning"
            : "good",
        };
      })
      .sort((a, b) => b.projected - a.projected);

    return results;
  }, [monthlyTransactions, allTransactions, monthlyBudget, selectedMonth, selYear, selMonth]);

  // Fetch AI warning
  useEffect(() => {
    if (projections.length === 0) return;

    const riskiest = projections.find((p) => p.status === "over") || projections.find((p) => p.status === "warning");
    if (!riskiest && !projections.some((p) => p.isAnomaly)) {
      setAiWarning("");
      return;
    }

    setAiLoading(true);
    const context = {
      budget: monthlyBudget,
      projections: projections.slice(0, 5).map((p) =>
        `${p.category}: spent $${p.spent}, projected $${p.projected}${p.isAnomaly ? " (2x+ above average)" : ""}`
      ).join("; "),
    };

    getSpendingForecast(context)
      .then((text) => setAiWarning(text))
      .catch(() => setAiWarning(""))
      .finally(() => setAiLoading(false));
  }, [projections, monthlyBudget]);

  const totalProjected = projections.reduce((s, p) => s + p.projected, 0);
  const totalSpent = projections.reduce((s, p) => s + p.spent, 0);
  const maxProjected = projections.length > 0 ? projections[0].projected : 1;

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === selYear && now.getMonth() === selMonth;
  const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
  const daysSoFar = isCurrentMonth ? now.getDate() : daysInMonth;

  const statusColor = (status) => {
    switch (status) {
      case "over": return "#ef4444";
      case "warning": return "#f59e0b";
      case "good": return "#10b981";
      default: return "#6b7280";
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case "over": return "Over Pace";
      case "warning": return "At Risk";
      case "good": return "On Track";
      default: return "Done";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-7" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="font-bold font-headline">Spending Forecast</h3>
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
        </div>
        {isCurrentMonth && (
          <span className="text-[10px] text-[#5a6063] font-medium bg-[#f5f5f7] px-2.5 py-1 rounded-full">
            Day {daysSoFar}/{daysInMonth}
          </span>
        )}
      </div>

      {projections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-3">
            <MaterialIcon name="query_stats" className="text-2xl text-[#adb3b6]" />
          </div>
          <p className="text-sm text-[#5a6063] mb-1">No expenses to forecast</p>
          <p className="text-[10px] text-[#adb3b6]">Start spending to see predictions!</p>
        </div>
      ) : (
        <>
          {/* Projected total */}
          <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider">
                Projected Total Expenses
              </span>
              <MaterialIcon name="trending_up" className="text-sm text-[#5a6063]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-headline">
                ${totalProjected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              {monthlyBudget > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  totalProjected > monthlyBudget
                    ? "bg-[#ef4444]/10 text-[#ef4444]"
                    : totalProjected > monthlyBudget * 0.85
                      ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                      : "bg-[#10b981]/10 text-[#10b981]"
                }`}>
                  {totalProjected > monthlyBudget ? "Over" : "Under"} ${Math.abs(monthlyBudget - totalProjected).toFixed(0)} vs budget
                </span>
              )}
            </div>
            {monthlyBudget > 0 && (
              <div className="mt-2 w-full h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((totalProjected / monthlyBudget) * 100))}%`,
                    background: totalProjected > monthlyBudget
                      ? "#ef4444"
                      : totalProjected > monthlyBudget * 0.85
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                />
              </div>
            )}
          </div>

          {/* Category projections */}
          <div className="space-y-3 mb-5">
            {projections.slice(0, 5).map((p) => (
              <div key={p.category} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${CATEGORY_COLORS[p.category] || "#6b7280"}15` }}
                    >
                      <MaterialIcon
                        name={CATEGORY_MATERIAL_ICONS[p.category] || "more_horiz"}
                        className="text-xs"
                        style={{ color: CATEGORY_COLORS[p.category] || "#6b7280" }}
                      />
                    </div>
                    <span className="text-sm font-bold">{p.category}</span>
                    {p.isAnomaly && (
                      <div className="flex items-center gap-0.5 text-[8px] font-bold bg-[#ef4444]/10 text-[#ef4444] px-1.5 py-0.5 rounded-full">
                        <MaterialIcon name="warning" className="text-[10px]" />
                        Anomaly
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold">${p.projected.toFixed(0)}</p>
                      <p className="text-[9px] text-[#adb3b6]">${p.spent.toFixed(0)} spent</p>
                    </div>
                    {isCurrentMonth && (
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${statusColor(p.status)}15`,
                          color: statusColor(p.status),
                        }}
                      >
                        {statusLabel(p.status)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Progress bar showing spent vs projected */}
                <div className="w-full h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                  <div className="h-full rounded-full relative overflow-hidden" style={{ width: `${Math.min(100, Math.round((p.projected / maxProjected) * 100))}%` }}>
                    {/* Spent portion (solid) */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{
                        width: `${p.projected > 0 ? Math.round((p.spent / p.projected) * 100) : 0}%`,
                        backgroundColor: CATEGORY_COLORS[p.category] || "#6b7280",
                      }}
                    />
                    {/* Projected remainder (translucent) */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[p.category] || "#6b7280"}30`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Warning */}
          {(aiLoading || aiWarning) && (
            <div className="bg-gradient-to-br from-[#2e3336] to-[#1a1d1f] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#e8603a] rounded-lg flex items-center justify-center">
                  <MaterialIcon name="psychology" className="text-xs text-white" fill />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">AI Forecast</p>
              </div>
              {aiLoading ? (
                <div className="flex gap-2 py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#e8603a]"
                      style={{
                        animation: "centsi-bounce 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/85 leading-relaxed italic">
                  &ldquo;{aiWarning}&rdquo;
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
