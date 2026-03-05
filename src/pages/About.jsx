import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F7FA" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}>
        <Link to="/" style={{ fontSize: "24px", fontWeight: 800, color: "#028090", textDecoration: "none", letterSpacing: "-0.5px" }}>
          Centsible
        </Link>
        <Link to="/" style={{ fontSize: "14px", color: "#666", textDecoration: "none", fontWeight: 500 }}>
          ← Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <section style={{
        padding: "80px 24px 60px", textAlign: "center",
        background: "linear-gradient(180deg, #F5F7FA 0%, #E0F2F1 100%)"
      }}>
        <span style={{
          fontSize: "12px", fontWeight: 700, color: "#028090",
          textTransform: "uppercase", letterSpacing: "3px"
        }}>About</span>
        <h2 style={{ fontSize: "42px", fontWeight: 900, marginTop: "16px", marginBottom: "20px", color: "#1A1A2E" }}>
          What is Centsible?
        </h2>
        <p style={{ fontSize: "18px", color: "#777", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
          A budgeting web app built for students who want to take control of their finances.
          Track spending, set savings goals, and build better money habits — with a gamified
          experience that keeps you motivated.
        </p>
      </section>

      {/* Mission */}
      <section style={{ padding: "80px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "40px" }}>
            Why We Built This
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            <div style={{
              padding: "28px", borderRadius: "16px", backgroundColor: "#F8FAFB",
              border: "1px solid #eee"
            }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>Students struggle with money</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                Most students don't track spending or have a budget. We wanted to make it easy.
              </p>
            </div>
            <div style={{
              padding: "28px", borderRadius: "16px", backgroundColor: "#F8FAFB",
              border: "1px solid #eee"
            }}>
              <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>Budgeting apps are boring</h4>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                Gamification makes saving fun. Earn points, unlock badges, and compete with friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(180deg, #F5F7FA 0%, #E8F0F2 100%)"
      }}>
        <h3 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "48px" }}>
          Meet the Team
        </h3>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px",
          maxWidth: "700px", margin: "0 auto"
        }}>
          {[
            { initial: "A", name: "Aryan", role: "Frontend & Setup" },
            { initial: "D", name: "Dipekshya", role: "Routing & Auth" },
            { initial: "K", name: "Krish", role: "UI Components" },
          ].map((member) => (
            <div key={member.initial} style={{
              backgroundColor: "white", padding: "36px 24px", borderRadius: "20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #eee",
              textAlign: "center"
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                backgroundColor: "rgba(2,128,144,0.08)", display: "flex",
                alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                fontSize: "20px", fontWeight: 700, color: "#028090"
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