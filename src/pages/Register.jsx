import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/dashboard"))
      .catch((err) => setError(err.message));
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #f5f5f7 0%, #fff0e8 50%, #f5f5f7 100%)" }}>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-5 sm:px-10 py-5 bg-white/90 backdrop-blur-md" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <Link to="/" className="text-xl sm:text-2xl font-extrabold text-[#e8603a] no-underline tracking-tight">
          Centsible
        </Link>
        <Link to="/login" className="text-xs sm:text-sm text-[#666] no-underline">
          <span className="hidden sm:inline">Already have an account? </span>
          <span className="text-[#e8603a] font-semibold">Sign In</span>
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="bg-white p-8 sm:p-12 rounded-3xl w-full max-w-[420px]" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
          <h2 className="text-2xl sm:text-[28px] font-extrabold text-center mb-2 text-[#2e3336]">
            Create Account
          </h2>
          <p className="text-sm text-[#999] text-center mb-8">
            Join Centsible and start saving smarter
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <p className="text-[#e74c3c] text-[13px] text-center mb-4 p-2.5 bg-[#fdf0ef] rounded-lg">
                {error}
              </p>
            )}
            <div className="mb-5">
              <label className="text-[13px] font-semibold text-[#555] block mb-1.5">
                Name
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" required
                className="w-full p-3 border border-[#e0e0e0] rounded-xl text-sm outline-none transition-colors focus:border-[#e8603a]"
              />
            </div>

            <div className="mb-5">
              <label className="text-[13px] font-semibold text-[#555] block mb-1.5">
                Email
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" required
                className="w-full p-3 border border-[#e0e0e0] rounded-xl text-sm outline-none transition-colors focus:border-[#e8603a]"
              />
            </div>

            <div className="mb-7">
              <label className="text-[13px] font-semibold text-[#555] block mb-1.5">
                Password
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full p-3 border border-[#e0e0e0] rounded-xl text-sm outline-none transition-colors focus:border-[#e8603a]"
              />
            </div>

            <button type="submit" className="w-full py-3.5 bg-[#e8603a] text-white border-none rounded-xl text-[15px] font-bold cursor-pointer hover:bg-[#c94e2a] transition-colors" style={{ boxShadow: "0 4px 16px rgba(232,96,58,0.25)" }}>
              Create Account
            </button>
          </form>

          <p className="text-center text-[13px] text-[#aaa] mt-6">
            Have an account?{" "}
            <Link to="/login" className="text-[#e8603a] no-underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}