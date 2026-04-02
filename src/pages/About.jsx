import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f7" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}>
        <Link to="/" style={{ fontSize: "24px", fontWeight: 800, color: "#e8603a", textDecoration: "none", letterSpacing: "-0.5px" }}>
          Centsible
        </Link>
        <Link to="/" style={{ fontSize: "14px", color: "#666", textDecoration: "none", fontWeight: 500 }}>
          ← Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <section style={{
        padding: "80px 24px 60px", textAlign: "center",
        background: "linear-gradient(180deg, #f5f5f7 0%, #fff0e8 100%)"
      }}>
        <span style={{
          fontSize: "12px", fontWeight: 700, color: "#e8603a",
          textTransform: "uppercase", letterSpacing: "3px"
        }}>About</span>
        <h2 style={{ fontSize: "42px", fontWeight: 900, marginTop: "16px", marginBottom: "20px", color: "#2e3336" }}>
          What is Centsible?
        </h2>
        <p style={{ fontSize: "18px", color: "#777", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
          A gamified budgeting web app built for students who want to take control of their finances.
          Track spending, set savings goals, earn your Savings Score, and build better money habits.
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "40px" }}>
            What Can You Do?
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            <div style={{ padding: "28px", borderRadius: "16px", backgroundColor: "#f9f5f3", border: "1px solid #eee" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>🏆 Savings Score</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                Set a monthly budget and get a score from 0–100 based on how well you stay under it. The higher your score, the better your habits.
              </p>
            </div>
            <div style={{ padding: "28px", borderRadius: "16px", backgroundColor: "#f9f5f3", border: "1px solid #eee" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>🎖️ Earn Badges</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                Unlock badges like Budget Beginner, Penny Pincher, Budget Pro, and Savings Master as your score improves.
              </p>
            </div>
            <div style={{ padding: "28px", borderRadius: "16px", backgroundColor: "#f9f5f3", border: "1px solid #eee" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>💰 Track Transactions</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                Log income and expenses with categories like Food, Transport, and Entertainment. All data saves to the cloud.
              </p>
            </div>
            <div style={{ padding: "28px", borderRadius: "16px", backgroundColor: "#f9f5f3", border: "1px solid #eee" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>📊 Spending Charts</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                See where your money goes with a visual pie chart that breaks down spending by category.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section style={{ padding: "80px 24px", background: "#f9f5f3" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "40px" }}>
            Why We Built This
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            <div style={{ padding: "28px", borderRadius: "16px", backgroundColor: "white", border: "1px solid #eee" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>Students struggle with money</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                Most students don't track spending or have a budget. We wanted to make it easy.
              </p>
            </div>
            <div style={{ padding: "28px", borderRadius: "16px", backgroundColor: "white", border: "1px solid #eee" }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>Budgeting apps are boring</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                Gamification makes saving fun. Earn your Savings Score, unlock badges, and see your progress grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(180deg, #f5f5f7 0%, #fef3ee 100%)"
      }}>
        <h3 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "48px" }}>
          Meet the Team
        </h3>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px",
          maxWidth: "700px", margin: "0 auto"
        }}>
          {[
            { initial: "A", name: "Aryan", role: "Full-Stack & Project Lead" },
            { initial: "D", name: "Dipekshya", role: "Frontend & Auth" },
            { initial: "K", name: "Krish", role: "UI & Landing Page" },
          ].map((member) => (
            <div key={member.initial} style={{
              backgroundColor: "white", padding: "36px 24px", borderRadius: "20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #eee",
              textAlign: "center"
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                backgroundColor: "rgba(232,96,58,0.08)", display: "flex",
                alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                fontSize: "20px", fontWeight: 700, color: "#e8603a"
              }}>
                {member.initial}
              </div>
              <p style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{member.name}</p>
              <p style={{ color: "#aaa", fontSize: "13px" }}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "32px", color: "#aaa", fontSize: "14px",
        borderTop: "1px solid #e5e5e5", backgroundColor: "white"
      }}>
        Centsible 2026 — Aryan, Dipekshya & Krish
      </footer>
    </div>
  );
}