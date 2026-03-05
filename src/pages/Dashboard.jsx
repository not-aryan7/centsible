import { useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  function handleAdd(e) {
    e.preventDefault();
    if (!desc || !amount) return;
    setTransactions([
      ...transactions,
      { id: Date.now(), desc, amount: parseFloat(amount), type },
    ]);
    setDesc("");
    setAmount("");
  }

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA] to-[#E8F0F2]">
      <nav className="flex justify-between items-center px-10 py-5 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-[#028090]">Centsible</h1>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-[#028090] transition-colors">
          Log out
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Income</p>
            <p className="text-2xl font-bold text-green-600">${income.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Expenses</p>
            <p className="text-2xl font-bold text-red-500">${expenses.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-2xl font-bold text-[#028090]">${balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Transaction Form */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold mb-4">Add Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text" placeholder="Description" value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#028090]"
              required
            />
            <input
              type="number" placeholder="Amount" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#028090]"
              required
            />
            <select
              value={type} onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#028090]"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <button type="submit"
              className="bg-[#028090] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#026f7d] transition-colors">
              Add
            </button>
          </div>
        </form>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet — add one above</p>
          ) : (
            <ul>
              {transactions.map((t) => (
                <li key={t.id} className="flex justify-between items-center px-6 py-4 border-b border-gray-50 last:border-b-0">
                  <span className="text-sm">{t.desc}</span>
                  <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
