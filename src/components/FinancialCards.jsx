import { MaterialIcon, MONTH_NAMES } from "../utils/dashboardUtils";

export default function FinancialCards({
  balance,
  income,
  expenses,
  monthlyBudget,
  savingsScore,
  scoreLabel,
  savingsRate,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  monthlyTransactions,
  monthlyBarData,
  showInfo,
  setShowInfo,
  editingBudget,
  setEditingBudget,
  budgetInput,
  setBudgetInput,
  onSaveBudget,
}) {
  const [, selMonth] = selectedMonth.split("-").map(Number);

  // SVG gauge calculations
  const gaugeRadius = 52;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeDashoffset = gaugeCircumference - (gaugeCircumference * savingsScore) / 100;
  const maxBarNet = Math.max(...monthlyBarData.map((d) => Math.abs(d.net)), 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">

      {/* Card 1: Current Balance */}
      <div className="bg-white rounded-3xl p-7 flex flex-col justify-between min-h-[240px]" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
        <div className="bg-white rounded-3xl p-6 flex-1" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-[#e0faf1] rounded-full flex items-center justify-center">
              <MaterialIcon name="payments" className="text-[#006d50] text-base" fill />
            </div>
            <span className="text-[10px] text-[#5a6063] font-medium bg-[#f5f5f7] px-2.5 py-1 rounded-full">Monthly ▾</span>
          </div>
          <p className="text-xs text-[#5a6063] mb-0.5">Total Income</p>
          <h3 className="text-2xl font-black font-headline">${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-white rounded-3xl p-6 flex-1" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
        <div className="bg-white rounded-3xl p-5 text-center" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
          <div className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-2">
            <MaterialIcon name="lock" className="text-lg text-[#2e3336]" />
          </div>
          <p className="text-xs font-bold">Budget Lock</p>
          <p className="text-[10px] text-[#5a6063]">{monthlyBudget > 0 ? `$${monthlyBudget}/mo` : "Not set"}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 flex-1 flex flex-col items-center justify-center relative" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
        <div className="bg-white rounded-3xl p-5" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-2">
            <MaterialIcon name="schedule" className="text-lg text-[#2e3336]" />
            <MaterialIcon name="bar_chart" className="text-lg text-[#5a6063]" />
          </div>
          <h3 className="text-2xl font-black font-headline">{MONTH_NAMES[selMonth]}</h3>
          <p className="text-[10px] text-[#5a6063] mt-0.5">{monthlyTransactions.length} transactions</p>
        </div>
        <div className="bg-white rounded-3xl p-5 flex-1" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
  );
}
