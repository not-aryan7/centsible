import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CATEGORY_COLORS = {
  Food: "#e8603a",
  Transport: "#f59e0b",
  Entertainment: "#8b5cf6",
  Shopping: "#06b6d4",
  Bills: "#ef4444",
  Education: "#10b981",
  Other: "#6b7280",
};

export default function CategoryChart({ transactions }) {
  const expenseTxns = transactions.filter((t) => t.type === "expense");

  if (expenseTxns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-symbols-outlined text-4xl text-[#dee3e7] mb-3">pie_chart</span>
        <p className="text-sm text-[#5a6063]">No expenses to chart yet.</p>
        <p className="text-[10px] text-[#adb3b6] mt-1">Start logging to see your breakdown!</p>
      </div>
    );
  }

  // Group by category
  const grouped = {};
  expenseTxns.forEach((t) => {
    const cat = t.category || "Other";
    grouped[cat] = (grouped[cat] || 0) + t.amount;
  });

  const data = Object.entries(grouped)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold font-headline">Spending Breakdown</h3>
        <span className="text-[10px] text-[#5a6063] font-medium bg-[#f5f5f7] px-2.5 py-1 rounded-full">
          This Month
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="w-36 h-36 flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#6b7280"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, ""]}
                contentStyle={{
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black font-headline">${total.toFixed(0)}</span>
            <span className="text-[8px] text-[#5a6063] uppercase tracking-wider font-bold">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((entry) => {
            const pct = ((entry.value / total) * 100).toFixed(0);
            return (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[entry.name] || "#6b7280" }}
                  />
                  <span className="text-xs font-medium text-[#2e3336]">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2e3336]">${entry.value.toFixed(0)}</span>
                  <span className="text-[10px] text-[#adb3b6] font-medium w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
