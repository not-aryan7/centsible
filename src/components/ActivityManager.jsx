import { useState } from "react";
import { MaterialIcon, CATEGORIES, CATEGORY_MATERIAL_ICONS, formatDate } from "../utils/dashboardUtils";

export default function ActivityManager({
  filteredTransactions,
  recentTransactions,
  filterCategory,
  setFilterCategory,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  onEdit,
  onDelete,
  onViewAll,
  onExportCSV,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-7" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold font-headline">Activity Manager</h3>
        <div className="flex items-center gap-1.5">
          {/* CSV Export */}
          <button
            onClick={onExportCSV}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
            title="Export CSV"
          >
            <MaterialIcon name="download" className="text-[#5a6063] text-lg" />
          </button>
          <button
            onClick={onViewAll}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]"
            title="View all"
          >
            <MaterialIcon name="open_in_full" className="text-[#5a6063] text-lg" />
          </button>
          {/* Filters toggle */}
          <div className="relative">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1 text-[10px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                filtersOpen || filterCategory !== "All" || filterType !== "all"
                  ? "bg-[#e8603a] text-white"
                  : "bg-[#f5f5f7] text-[#5a6063] hover:bg-[#eef0f3]"
              }`}
            >
              <MaterialIcon name="filter_list" className="text-sm" /> Filters
            </button>
            {filtersOpen && (
              <div className="absolute top-9 right-0 bg-white rounded-2xl shadow-xl border border-black/6 p-4 z-30 w-56 animate-fadeIn">
                <p className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-2">Type</p>
                <div className="flex gap-1.5 mb-3">
                  {[
                    { value: "all", label: "All" },
                    { value: "income", label: "Income" },
                    { value: "expense", label: "Expense" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterType(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors ${
                        filterType === opt.value ? "bg-[#e8603a] text-white" : "bg-[#f5f5f7] text-[#5a6063] hover:bg-[#eef0f3]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["All", ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors ${
                        filterCategory === cat ? "bg-[#e8603a] text-white" : "bg-[#f5f5f7] text-[#5a6063] hover:bg-[#eef0f3]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setFilterCategory("All"); setFilterType("all"); setFiltersOpen(false); }}
                  className="w-full text-center text-[10px] text-[#e8603a] font-bold hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter pills */}
      {(filterCategory !== "All" || filterType !== "all" || searchQuery) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {searchQuery && (
            <span className="flex items-center gap-1 text-[10px] bg-[#e8603a]/10 text-[#e8603a] px-2.5 py-1 rounded-full font-medium">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")}><MaterialIcon name="close" className="text-[10px]" /></button>
            </span>
          )}
          {filterType !== "all" && (
            <span className="flex items-center gap-1 text-[10px] bg-[#e8603a]/10 text-[#e8603a] px-2.5 py-1 rounded-full font-medium">
              {filterType === "income" ? "Income" : "Expenses"}
              <button onClick={() => setFilterType("all")}><MaterialIcon name="close" className="text-[10px]" /></button>
            </span>
          )}
          {filterCategory !== "All" && (
            <span className="flex items-center gap-1 text-[10px] bg-[#e8603a]/10 text-[#e8603a] px-2.5 py-1 rounded-full font-medium">
              {filterCategory}
              <button onClick={() => setFilterCategory("All")}><MaterialIcon name="close" className="text-[10px]" /></button>
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        {recentTransactions.length === 0 ? (
          <p className="text-center text-[#5a6063] text-sm py-12">
            {searchQuery || filterCategory !== "All" || filterType !== "all"
              ? "No transactions match your filters."
              : "No transactions yet this month."}
          </p>
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
                  <button onClick={() => onEdit(t)} className="p-1 text-[#5a6063] hover:text-[#e8603a] rounded"><MaterialIcon name="edit" className="text-sm" /></button>
                  <button onClick={() => onDelete(t.id)} className="p-1 text-[#5a6063] hover:text-[#ac3434] rounded"><MaterialIcon name="delete" className="text-sm" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {filteredTransactions.length > 5 && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 text-center text-xs text-[#e8603a] font-bold hover:underline"
        >
          View all {filteredTransactions.length} transactions →
        </button>
      )}
    </div>
  );
}
