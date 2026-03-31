import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CATEGORIES = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Education", "Other"];
const CATEGORY_ICONS = { Food: "F", Transport: "T", Entertainment: "E", Shopping: "S", Bills: "B", Education: "Ed", Other: "O", Income: "$" };
const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF"];

const BADGES = [
  { icon: "🥉", name: "Budget Beginner", desc: "Set your first budget" },
  { icon: "🥈", name: "Penny Pincher", desc: "Score above 50" },
  { icon: "🥇", name: "Budget Pro", desc: "Score above 80" },
  { icon: "💎", name: "Savings Master", desc: "Perfect score of 100" },
];

function ScoreRing({ score }) {
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <svg width="140" height="140" style={{ display: "block", margin: "0 auto" }}>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
      <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1A1A2E">{score}</text>
      <text x="70" y="86" textAnchor="middle" fontSize="11" fill="#999">out of 100</text>
    </svg>
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
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("createdAt", "desc")
    );
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

  function handleLogout() {
    signOut(auth).then(() => navigate("/"));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!desc || !amount || !user) return;
    await addDoc(collection(db, "users", user.uid, "transactions"), {
      desc,
      amount: parseFloat(amount),
      type,
      category: type === "expense" ? category : "Income",
      createdAt: new Date(),
    });
    setDesc("");
    setAmount("");
  }

  async function handleDelete(id) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  }

  async function handleSaveBudget(e) {
    e.preventDefault();
    if (!user || !budgetInput) return;
    const amt = parseFloat(budgetInput);
    await setDoc(doc(db, "users", user.uid, "settings", "budget"), { amount: amt });
    setMonthlyBudget(amt);
    setBudgetInput("");
    setEditingBudget(false);
  }

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  const savingsScore = monthlyBudget > 0
    ? Math.max(0, Math.min(100, Math.round(((monthlyBudget - expenses) / monthlyBudget) * 100)))
    : null;

  const earnedBadges = [];
  if (monthlyBudget > 0) earnedBadges.push(BADGES[0]);
  if (savingsScore !== null && savingsScore >= 50) earnedBadges.push(BADGES[1]);
  if (savingsScore !== null && savingsScore >= 80) earnedBadges.push(BADGES[2]);
  if (savingsScore !== null && savingsScore === 100) earnedBadges.push(BADGES[3]);

  const categoryData = CATEGORIES.map((cat) => ({
    name: cat,
    value: transactions.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter((d) => d.value > 0);

  /* ── inline styles ── */
  const page = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #F5F7FA 0%, #E8F0F2 100%)",
    fontFamily: "'Inter', -apple-system, sans-serif",
  };
  const nav = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 40px", backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  };
  const container = { maxWidth: "960px", margin: "0 auto", padding: "32px 24px" };
  const card = {
    backgroundColor: "white", borderRadius: "20px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.04)", border: "1px solid #eee",
    padding: "28px", marginBottom: "24px",
  };
  const input = {
    width: "100%", padding: "12px 16px", border: "1px solid #e0e0e0",
    borderRadius: "12px", fontSize: "14px", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
    backgroundColor: "#FAFBFC",
  };
  const btn = {
    padding: "12px 28px", backgroundColor: "#028090", color: "white",
    border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700,
    cursor: "pointer", transition: "background-color 0.2s",
    boxShadow: "0 4px 14px rgba(2,128,144,0.2)",
  };
  const select = { ...input, appearance: "none", cursor: "pointer" };
  const label = { fontSize: "12px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" };

  return (
    <div style={page}>
      {/* Nav */}
      <nav style={nav}>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "#028090", letterSpacing: "-0.5px" }}>Centsible</span>
        <button onClick={handleLogout} style={{
          background: "none", border: "1px solid #e0e0e0", borderRadius: "8px",
          padding: "8px 20px", fontSize: "13px", fontWeight: 600, color: "#777",
          cursor: "pointer", transition: "all 0.2s",
        }}>Log out</button>
      </nav>

      <div style={container}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A2E", marginBottom: "28px" }}>Dashboard</h2>

        {/* ── Summary Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Income", value: income, color: "#10B981", bg: "rgba(16,185,129,0.06)" },
            { label: "Expenses", value: expenses, color: "#EF4444", bg: "rgba(239,68,68,0.06)" },
            { label: "Balance", value: balance, color: "#028090", bg: "rgba(2,128,144,0.06)" },
          ].map((c) => (
            <div key={c.label} style={{
              ...card, marginBottom: 0, padding: "24px",
              background: `linear-gradient(135deg, white 60%, ${c.bg})`,
            }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{c.label}</p>
              <p style={{ fontSize: "28px", fontWeight: 800, color: c.color }}>${c.value.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* ── Savings Score + Budget ── */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A2E" }}>Savings Score</h3>
            {!editingBudget ? (
              <button onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : ""); }}
                style={{
                  background: monthlyBudget > 0 ? "rgba(2,128,144,0.08)" : "#028090",
                  color: monthlyBudget > 0 ? "#028090" : "white",
                  border: "none", borderRadius: "8px", padding: "8px 16px",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}>
                {monthlyBudget > 0 ? `Budget: $${monthlyBudget} · Edit` : "Set Monthly Budget"}
              </button>
            ) : (
              <form onSubmit={handleSaveBudget} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="number" placeholder="e.g. 500" value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  style={{ ...input, width: "120px", padding: "8px 12px" }} required />
                <button type="submit" style={{ ...btn, padding: "8px 16px", fontSize: "12px" }}>Save</button>
                <button type="button" onClick={() => setEditingBudget(false)}
                  style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "18px" }}>✕</button>
              </form>
            )}
          </div>

          {savingsScore !== null ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <ScoreRing score={savingsScore} />
              <p style={{ fontSize: "15px", color: "#555", marginTop: "16px", fontWeight: 500 }}>
                {savingsScore >= 80 ? "🎉 Excellent! You're well under budget."
                  : savingsScore >= 50 ? "👍 Good job — keep it up!"
                  : "⚠️ You're over budget. Try cutting back."}
              </p>
              <p style={{ fontSize: "13px", color: "#aaa", marginTop: "6px" }}>
                ${expenses.toFixed(2)} spent of ${monthlyBudget.toFixed(2)} budget
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>🎯</p>
              <p style={{ color: "#aaa", fontSize: "14px" }}>Set a monthly budget to unlock your Savings Score</p>
            </div>
          )}
        </div>

        {/* ── Badges ── */}
        <div style={card}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A2E", marginBottom: "20px" }}>Badges</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {BADGES.map((badge) => {
              const earned = earnedBadges.includes(badge);
              return (
                <div key={badge.name} style={{
                  textAlign: "center", padding: "20px 12px", borderRadius: "16px",
                  border: earned ? "2px solid rgba(2,128,144,0.3)" : "2px solid #F0F0F0",
                  backgroundColor: earned ? "rgba(2,128,144,0.04)" : "#FAFAFA",
                  opacity: earned ? 1 : 0.4,
                  transition: "all 0.3s ease",
                }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>{badge.icon}</div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: earned ? "#028090" : "#bbb", marginBottom: "4px" }}>{badge.name}</p>
                  <p style={{ fontSize: "11px", color: "#aaa" }}>{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Two-column: Form + Chart ── */}
        <div style={{ display: "grid", gridTemplateColumns: categoryData.length > 0 ? "1fr 1fr" : "1fr", gap: "24px", marginBottom: "24px" }}>

          {/* Add Transaction */}
          <div style={card}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A2E", marginBottom: "20px" }}>Add Transaction</h3>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: "16px" }}>
                <label style={label}>Description</label>
                <input type="text" placeholder="e.g. Groceries" value={desc}
                  onChange={(e) => setDesc(e.target.value)} style={input} required
                  onFocus={(e) => e.target.style.borderColor = "#028090"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={label}>Amount</label>
                  <input type="number" placeholder="0.00" value={amount}
                    onChange={(e) => setAmount(e.target.value)} style={input} required
                    onFocus={(e) => e.target.style.borderColor = "#028090"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
                </div>
                <div>
                  <label style={label}>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={select}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              {type === "expense" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={label}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={select}>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              )}
              <button type="submit" style={{ ...btn, width: "100%" }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#026f7d"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#028090"}>
                Add Transaction
              </button>
            </form>
          </div>

          {/* Spending Chart */}
          {categoryData.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A2E", marginBottom: "20px" }}>Spending by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="45%"
                    outerRadius={80} innerRadius={45}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "#ccc" }}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #eee", fontSize: "13px" }} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(value) => <span style={{ fontSize: "12px", color: "#777" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Transaction List ── */}
        <div style={card}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A2E", marginBottom: "20px" }}>
            Transactions
            {transactions.length > 0 && (
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#aaa", marginLeft: "10px" }}>
                ({transactions.length})
              </span>
            )}
          </h3>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(2,128,144,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "18px", fontWeight: 700, color: "#028090" }}>+</div>
              <p style={{ color: "#aaa", fontSize: "14px" }}>No transactions yet — add one above</p>
            </div>
          ) : (
            <div>
              {transactions.map((t, i) => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 0",
                  borderBottom: i < transactions.length - 1 ? "1px solid #F5F5F5" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "12px",
                      backgroundColor: "rgba(2,128,144,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 700, color: "#028090", letterSpacing: "-0.5px",
                    }}>
                      {CATEGORY_ICONS[t.type === "income" ? "Income" : t.category] || "O"}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A2E", marginBottom: "2px" }}>{t.desc}</p>
                      {t.category && t.type === "expense" && (
                        <p style={{ fontSize: "12px", color: "#aaa" }}>{t.category}</p>
                      )}
                      {t.type === "income" && (
                        <p style={{ fontSize: "12px", color: "#aaa" }}>Income</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{
                      fontSize: "15px", fontWeight: 700,
                      color: t.type === "income" ? "#10B981" : "#EF4444",
                    }}>
                      {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(t.id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#ddd", fontSize: "16px", padding: "4px 8px",
                      borderRadius: "6px", transition: "all 0.2s",
                    }}
                      onMouseEnter={(e) => { e.target.style.color = "#EF4444"; e.target.style.backgroundColor = "rgba(239,68,68,0.06)"; }}
                      onMouseLeave={(e) => { e.target.style.color = "#ddd"; e.target.style.backgroundColor = "transparent"; }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
