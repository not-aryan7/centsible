import { useState, useEffect, useRef } from "react";
import { askCentsiCoach, getAutoInsight } from "../services/gemini";

export default function CentsiCoach({ totals, budget, score, transactions, stitch }) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const financialContext = {
    budget,
    income: totals.income,
    expenses: totals.expenses,
    balance: totals.balance,
    score,
    recentTransactions: transactions
      .slice(0, 5)
      .map((t) => `${t.desc} ($${t.amount})`)
      .join(", ") || "none yet",
  };

  // Auto-insight on load
  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      try {
        const insight = await getAutoInsight(financialContext);
        setAdvice(insight);
      } catch (err) {
        console.error("CentsiCoach auto-insight error:", err);
        setAdvice("Ready to help with your finances! Ask me anything about budgeting, saving, or your spending habits. 💡");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchInsight, 800);
    return () => clearTimeout(timer);
  }, [totals.expenses, budget, score]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setSending(true);

    try {
      const response = await askCentsiCoach(userMsg, financialContext, messages);
      setMessages([...newMessages, { role: "model", text: response }]);
    } catch (err) {
      console.error("CentsiCoach chat error:", err);
      setMessages([
        ...newMessages,
        { role: "model", text: "Hmm, my brain just glitched. Try asking again? 🧠" },
      ]);
    } finally {
      setSending(false);
    }
  }

  const quickPrompts = [
    "How can I save more?",
    "Am I overspending?",
    "Tips for this month",
  ];

  // ─── Stitch-style inline rendering ───
  if (stitch) {
    return (
      <div>
        <h2 className="text-3xl font-bold font-headline text-[#2e3336] mb-4">
          Hey, Need help? Just ask me anything!
        </h2>
        <div className="min-h-[60px] mb-8">
          {loading ? (
            <BouncingDots color="#e8603a" />
          ) : (
            <p className="text-[#5a6063] text-lg leading-relaxed">
              <HighlightMoney text={advice} />
            </p>
          )}
        </div>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setChatOpen(true)}
            className="px-8 py-4 bg-[#e8603a] text-white rounded-full font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            style={{ boxShadow: "0 8px 24px rgba(232,96,58,0.2)" }}
          >
            Chat with CentsiCoach
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const insight = await getAutoInsight(financialContext);
                setAdvice(insight);
              } catch { setAdvice("Something went wrong. Try again!"); }
              finally { setLoading(false); }
            }}
            className="px-8 py-4 bg-[#dee3e7]/50 text-[#5a6063] rounded-full font-semibold hover:bg-[#e5e9ec] transition-colors"
          >
            New Insight
          </button>
        </div>

        {/* ─── Chat Modal ─── */}
        {chatOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setChatOpen(false)}
          >
            <div
              className="bg-white w-full sm:w-[480px] sm:max-w-lg h-[85vh] sm:h-[600px] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e8603a] to-[#c94e2a] text-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <div>
                    <h3 className="font-bold font-headline text-sm">CentsiCoach</h3>
                    <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">AI Financial Advisor</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "thin" }}>
                {/* Welcome message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#ffd0b8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[#7a2e10] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <div className="bg-[#f2f4f6] rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-[#2e3336] leading-relaxed">
                      Hey! 👋 I'm CentsiCoach, your AI financial advisor. Ask me anything about your budget, spending, or saving — I've got your financial snapshot loaded up!
                    </p>
                  </div>
                </div>

                {/* Messages */}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "model" && (
                      <div className="w-8 h-8 bg-[#ffd0b8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[#7a2e10] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-[#e8603a] text-white rounded-tr-md"
                          : "bg-[#f2f4f6] text-[#2e3336] rounded-tl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {sending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#ffd0b8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[#7a2e10] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    </div>
                    <div className="bg-[#f2f4f6] rounded-2xl rounded-tl-md px-4 py-3">
                      <BouncingDots color="#e8603a" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts (only when no messages) */}
              {messages.length === 0 && (
                <div className="px-5 pb-2 flex gap-2 flex-wrap">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                        setTimeout(() => inputRef.current?.form?.requestSubmit(), 50);
                      }}
                      className="text-xs bg-[#f2f4f6] text-[#5a6063] px-4 py-2 rounded-full hover:bg-[#e5e9ec] hover:text-[#2e3336] transition-colors font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-3 p-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your finances..."
                  className="flex-1 bg-[#f2f4f6] rounded-full px-5 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 bg-[#e8603a] text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Legacy dark-card style ───
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
        padding: "28px", borderRadius: "20px", color: "white",
        boxShadow: "0 8px 32px rgba(26, 26, 46, 0.25)",
        position: "relative", overflow: "hidden", marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{
          width: "40px", height: "40px", background: "linear-gradient(135deg, #e8603a, #c94e2a)",
          borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: "18px",
        }}>C</div>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>CentsiCoach</h3>
          <p style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.5px", margin: 0 }}>AI Financial Advisor</p>
        </div>
      </div>
      <div style={{ minHeight: "40px" }}>
        {loading ? (
          <BouncingDots color="#e8603a" />
        ) : (
          <p style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.7, fontStyle: "italic", color: "rgba(255,255,255,0.85)", margin: 0 }}>
            &ldquo;{advice}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Helper Components ───

function BouncingDots({ color = "#e8603a" }) {
  return (
    <div className="flex gap-2 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: color,
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
  );
}

function HighlightMoney({ text }) {
  if (!text) return null;
  if (!text.includes("$")) return <>{text}</>;
  return (
    <>
      {text.split(/(\$\d[\d,.]*)/g).map((part, i) =>
        part.match(/^\$\d/) ? (
          <span key={i} className="font-bold text-[#006d50]">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
