import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/dashboard"))
      .catch((err) => setError(err.message));
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(180deg, #f5f5f7 0%, #fff0e8 50%, #f5f5f7 100%)"
    }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}>
        <Link to="/" style={{ fontSize: "24px", fontWeight: 800, color: "#e8603a", textDecoration: "none", letterSpacing: "-0.5px" }}>
          Centsible
        </Link>
        <Link to="/register" style={{ fontSize: "14px", color: "#666", textDecoration: "none" }}>
          Don't have an account? <span style={{ color: "#e8603a", fontWeight: 600 }}>Register</span>
        </Link>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{
          backgroundColor: "white", padding: "48px", borderRadius: "24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)", width: "100%", maxWidth: "420px",
          border: "1px solid #eee"
        }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "8px", color: "#2e3336" }}>
            Welcome back
          </h2>
          <p style={{ fontSize: "14px", color: "#999", textAlign: "center", marginBottom: "32px" }}>
            Sign in to your Centsible account
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: "#e74c3c", fontSize: "13px", textAlign: "center", marginBottom: "16px", padding: "10px", backgroundColor: "#fdf0ef", borderRadius: "8px" }}>
                {error}
              </p>
            )}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                Email
              </label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" required
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #e0e0e0",
                  borderRadius: "12px", fontSize: "14px", outline: "none",
                  transition: "border-color 0.2s", boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#e8603a"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #e0e0e0",
                  borderRadius: "12px", fontSize: "14px", outline: "none",
                  transition: "border-color 0.2s", boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#e8603a"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <button type="submit" style={{
              width: "100%", padding: "14px", backgroundColor: "#e8603a",
              color: "white", border: "none", borderRadius: "12px", fontSize: "15px",
              fontWeight: 700, cursor: "pointer", transition: "background-color 0.2s",
              boxShadow: "0 4px 16px rgba(232,96,58,0.25)"
            }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#c94e2a"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#e8603a"}
            >
              Sign In
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#aaa", marginTop: "24px" }}>
            No account?{" "}
            <Link to="/register" style={{ color: "#e8603a", textDecoration: "none", fontWeight: 600 }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
