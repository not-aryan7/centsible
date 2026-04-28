import { useState } from "react";
import { MaterialIcon, CATEGORIES, CATEGORY_MATERIAL_ICONS, formatDate, downloadCSV, MONTH_NAMES } from "../utils/dashboardUtils";

// ─── Add Transaction Modal ───

export function AddTransactionModal({ open, onClose, onAdd, prefill, onScanReceipt }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [prefillApplied, setPrefillApplied] = useState(false);

  // Apply prefill data when it changes
  if (prefill && !prefillApplied) {
    if (prefill.desc) setDesc(prefill.desc);
    if (prefill.amount) setAmount(prefill.amount);
    if (prefill.category) setCategory(prefill.category);
    setType("expense");
    setPrefillApplied(true);
  }

  // Reset prefillApplied when modal closes
  if (!open && prefillApplied) {
    setPrefillApplied(false);
  }

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!desc || !amount) return;
    onAdd({ desc, amount: parseFloat(amount), type, category: type === "expense" ? category : "Income" });
    setDesc("");
    setAmount("");
    setPrefillApplied(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-headline">New Transaction</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <MaterialIcon name="close" className="text-[#5a6063]" />
          </button>
        </div>

        {/* Scan Receipt Button */}
        {onScanReceipt && (
          <button
            type="button"
            onClick={() => { onClose(); onScanReceipt(); }}
            className="w-full flex items-center justify-center gap-2 py-3 mb-5 bg-gradient-to-r from-[#e8603a]/10 to-[#f59e0b]/10 rounded-2xl text-sm font-semibold text-[#e8603a] hover:from-[#e8603a]/15 hover:to-[#f59e0b]/15 transition-all border border-[#e8603a]/10"
          >
            <MaterialIcon name="document_scanner" className="text-lg" />
            Scan Receipt with AI
          </button>
        )}

        {/* Prefill indicator */}
        {prefill && (
          <div className="flex items-center gap-2 bg-[#10b981]/10 text-[#006d50] rounded-xl px-3 py-2 mb-4">
            <MaterialIcon name="check_circle" className="text-sm" fill />
            <p className="text-[10px] font-bold">Auto-filled from receipt scan</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="What did you spend on?" value={desc} onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
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
  );
}

// ─── Edit Transaction Modal ───

export function EditTransactionModal({ transaction, onClose, onSave }) {
  const [desc, setDesc] = useState(transaction?.desc || "");
  const [amount, setAmount] = useState(String(transaction?.amount || ""));
  const [type, setType] = useState(transaction?.type || "expense");
  const [category, setCategory] = useState(transaction?.category || "Food");

  if (!transaction) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!desc || !amount) return;
    onSave(transaction.id, {
      desc,
      amount: parseFloat(amount),
      type,
      category: type === "expense" ? category : "Income",
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold font-headline mb-6">Edit Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="bg-[#f5f5f7] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20" required />
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
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-4 bg-[#e8603a] text-white rounded-full font-semibold">Save</button>
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-[#f5f5f7] text-[#5a6063] rounded-full font-semibold hover:bg-[#eef0f3]">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── All Transactions Modal (paginated) ───

export function AllTransactionsModal({ open, onClose, filteredTransactions, onEdit, onDelete, selectedMonth }) {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  if (!open) return null;

  const [, selMonth] = selectedMonth.split("-").map(Number);
  const monthName = MONTH_NAMES[selMonth];
  const totalPages = Math.ceil(filteredTransactions.length / PER_PAGE);
  const paginatedTxns = filteredTransactions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <h3 className="text-lg font-bold font-headline">All Transactions</h3>
            <p className="text-[10px] text-[#5a6063] mt-0.5">{filteredTransactions.length} transactions • {monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCSV(filteredTransactions, monthName)}
              className="flex items-center gap-1 text-[10px] text-[#e8603a] font-bold bg-[#e8603a]/10 px-3 py-1.5 rounded-full hover:bg-[#e8603a]/20 transition-colors"
            >
              <MaterialIcon name="download" className="text-sm" /> Export CSV
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
              <MaterialIcon name="close" className="text-[#5a6063]" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-7 space-y-3" style={{ scrollbarWidth: "thin" }}>
          {paginatedTxns.length === 0 ? (
            <p className="text-center text-[#5a6063] text-sm py-8">No transactions found.</p>
          ) : (
            paginatedTxns.map((t) => (
              <div key={t.id} className="flex items-center justify-between group py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center flex-shrink-0">
                    <MaterialIcon name={CATEGORY_MATERIAL_ICONS[t.type === "income" ? "Income" : t.category] || "more_horiz"} className="text-lg text-[#5a6063]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.desc}</p>
                    <p className="text-[10px] text-[#5a6063]">{formatDate(t.createdAt)} • {t.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold ${t.type === "income" ? "text-[#006d50]" : "text-[#e8603a]"}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </p>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { onEdit(t); onClose(); }} className="p-1 text-[#5a6063] hover:text-[#e8603a] rounded"><MaterialIcon name="edit" className="text-sm" /></button>
                    <button onClick={() => onDelete(t.id)} className="p-1 text-[#5a6063] hover:text-[#ac3434] rounded"><MaterialIcon name="delete" className="text-sm" /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-7 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <MaterialIcon name="chevron_left" className="text-lg" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  p === page ? "bg-[#e8603a] text-white" : "hover:bg-[#f5f5f7] text-[#5a6063]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <MaterialIcon name="chevron_right" className="text-lg" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
