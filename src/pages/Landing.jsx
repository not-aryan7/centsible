import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F7FA" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#028090",
            letterSpacing: "-0.5px",
          }}
        >
          Centsible
        </h1>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            to="/about"
            style={{ fontSize: "14px", color: "#666", textDecoration: "none" }}
          >
            About
          </Link>

          <Link
            to="/login"
            style={{ fontSize: "14px", color: "#666", textDecoration: "none" }}
          >
            Sign In
          </Link>

          <Link
            to="/register"
            style={{
              fontSize: "14px",
              padding: "10px 24px",
              backgroundColor: "#028090",
              color: "white",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section
        style={{
          minHeight: "calc(100vh - 70px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 24px",
          background: "linear-gradient(180deg, #F5F7FA 0%, #E0F2F1 50%, #F5F7FA 100%)",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#028090",
            textTransform: "uppercase",
            letterSpacing: "3px",
            marginBottom: "24px",
          }}
        >
          Built for Students
        </span>

        <h2
          style={{
            fontSize: "56px",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "24px",
            color: "#1A1A2E",
          }}
        >
          Smart Budgeting.
          <br />
          <span style={{ color: "#028090" }}>Gamified Savings.</span>
        </h2>

        <p
          style={{
            fontSize: "18px",
            color: "#777",
            maxWidth: "480px",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}
        >
          Track spending, set goals, and earn your Savings Score — all in one place.
        </p>

        <Link
          to="/register"
          style={{
            fontSize: "18px",
            padding: "16px 40px",
            backgroundColor: "#028090",
            color: "white",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: 700,
            boxShadow: "0 8px 30px rgba(2,128,144,0.3)",
          }}
        >
          Start for Free →
        </Link>
      </section>

      <section style={{ padding: "100px 24px", backgroundColor: "white" }}>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: "60px",
          }}
        >
          How It Works
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "48px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {[
            {
              num: "1",
              title: "Sign Up",
              desc: "Create your free account with email or Google. Secure login powered by Firebase.",
            },
            {
              num: "2",
              title: "Track Your Money",
              desc: "Add income and expenses with categories. Your data saves to the cloud automatically.",
            },
            {
              num: "3",
              title: "See Insights",
              desc: "View spending charts and track your balance. Know exactly where your money goes.",
            },
          ].map((step) => (
            <div key={step.num} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#028090",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "22px",
                  fontWeight: 800,
                  boxShadow: "0 6px 20px rgba(2,128,144,0.25)",
                }}
              >
                {step.num}
              </div>

              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "18px",
                  marginBottom: "8px",
                }}
              >
                {step.title}
              </h3>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "100px 24px",
          background: "linear-gradient(180deg, #F5F7FA 0%, #E8F0F2 100%)",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: "60px",
          }}
        >
          Features
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {[
            {
              icon: "📊",
              title: "Spending Charts",
              desc: "Visualize where your money goes with interactive pie charts broken down by category.",
            },
            {
              icon: "🏷️",
              title: "Budget Categories",
              desc: "Organize expenses into categories like Food, Transport, Entertainment, and more.",
            },
            {
              icon: "🔐",
              title: "Secure & Private",
              desc: "Your data is protected with Firebase Authentication. Only you can see your transactions.",
            },
            {
              icon: "☁️",
              title: "Cloud Storage",
              desc: "Transactions save to Firestore automatically. Access your data from any device.",
            },
            {
              icon: "⚡",
              title: "Real-Time Updates",
              desc: "Add or delete transactions and see your dashboard update instantly.",
            },
            {
              icon: "🎯",
              title: "Savings Score",
              desc: "Coming soon — earn points for smart spending and staying under budget.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                border: "1px solid #eee",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(2,128,144,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <span style={{ fontSize: "22px" }}>{f.icon}</span>
              </div>

              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "18px",
                  marginBottom: "10px",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "32px",
          color: "#aaa",
          fontSize: "14px",
          borderTop: "1px solid #e5e5e5",
          backgroundColor: "white",
        }}
      >
        Centsible 2026 — Aryan, Dipekshya & Krish
      </footer>
    </div>
  );
}