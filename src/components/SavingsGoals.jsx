import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, updateDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { MaterialIcon } from "../utils/dashboardUtils";

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [addAmount, setAddAmount] = useState({});
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "goals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name || !target || !user) return;
    await addDoc(collection(db, "users", user.uid, "goals"), {
      name,
      target: parseFloat(target),
      saved: 0,
      createdAt: new Date(),
    });
    setName("");
    setTarget("");
    setShowForm(false);
  }

  async function handleAddSavings(goalId, currentSaved) {
    const amt = parseFloat(addAmount[goalId]);
    if (!amt || !user) return;
    await updateDoc(doc(db, "users", user.uid, "goals", goalId), {
      saved: currentSaved + amt,
    });
    setAddAmount((prev) => ({ ...prev, [goalId]: "" }));
  }

  async function handleDelete(goalId) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "goals", goalId));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold font-headline">Savings Goals</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[10px] text-[#e8603a] font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
        >
          <MaterialIcon name={showForm ? "close" : "add"} className="text-sm" />
          {showForm ? "Cancel" : "New Goal"}
        </button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 space-y-3">
          <input
            type="text"
            placeholder="Goal name (e.g., Textbooks)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#f5f5f7] rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all"
            required
          />
          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Target amount"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="flex-1 bg-[#f5f5f7] rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#e8603a] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      {goals.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-3">
            <MaterialIcon name="savings" className="text-2xl text-[#adb3b6]" />
          </div>
          <p className="text-sm text-[#5a6063] mb-1">No savings goals yet</p>
          <p className="text-[10px] text-[#adb3b6]">Set a goal to start tracking your progress!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
            const completed = pct >= 100;
            return (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border transition-all ${
                  completed ? "bg-[#e0faf1] border-[#006d50]/20" : "bg-[#f5f5f7] border-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MaterialIcon
                      name={completed ? "check_circle" : "flag"}
                      className={`text-sm ${completed ? "text-[#006d50]" : "text-[#e8603a]"}`}
                      fill={completed}
                    />
                    <span className="text-sm font-bold">{goal.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      completed ? "bg-[#006d50]/10 text-[#006d50]" : "bg-[#e8603a]/10 text-[#e8603a]"
                    }`}>
                      {pct}%
                    </span>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 text-[#adb3b6] hover:text-[#ac3434] rounded transition-colors"
                    >
                      <MaterialIcon name="delete" className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: completed
                        ? "linear-gradient(90deg, #006d50, #10b981)"
                        : "linear-gradient(90deg, #e8603a, #f59e0b)",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#5a6063]">
                    ${goal.saved.toFixed(2)} / ${goal.target.toFixed(2)}
                  </span>
                  {!completed && (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="+ $"
                        value={addAmount[goal.id] || ""}
                        onChange={(e) => setAddAmount((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                        className="w-20 bg-white rounded-full px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-[#e8603a]/30"
                      />
                      <button
                        onClick={() => handleAddSavings(goal.id, goal.saved)}
                        className="px-3 py-1.5 bg-[#e8603a] text-white rounded-full text-[10px] font-bold hover:opacity-90 transition-opacity"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
