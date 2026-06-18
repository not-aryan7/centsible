import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-5 sm:px-10 py-5 bg-white/90 backdrop-blur-md sticky top-0 z-10" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <Link to="/" className="text-xl sm:text-2xl font-extrabold text-[#e8603a] no-underline tracking-tight">
          Centsible
        </Link>
        <div className="flex gap-3 sm:gap-4 items-center">
          <Link to="/about" className="hidden sm:inline text-sm text-[#666] no-underline hover:text-[#2e3336] transition-colors">
            About
          </Link>
          <Link to="/login" className="text-sm text-[#666] no-underline hover:text-[#2e3336] transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="text-sm px-5 py-2.5 bg-[#e8603a] text-white rounded-full no-underline font-semibold hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[calc(100vh-70px)] flex flex-col justify-center items-center text-center px-6" style={{ background: "linear-gradient(180deg, #f5f5f7 0%, #fff0e8 50%, #f5f5f7 100%)" }}>
        <span className="text-xs font-bold text-[#e8603a] uppercase tracking-[3px] mb-6">
          Built for Students
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-[56px] font-black leading-[1.1] mb-6 text-[#2e3336]">
          Smart Budgeting.<br />
          <span className="text-[#e8603a]">Gamified Savings.</span>
        </h2>
        <p className="text-base sm:text-lg text-[#777] max-w-[480px] leading-relaxed mb-10">
          Track spending, set goals, and earn your Savings Score — all in one place.
        </p>
        <Link to="/register" className="text-lg px-10 py-4 bg-[#e8603a] text-white rounded-full no-underline font-bold hover:opacity-90 transition-opacity" style={{ boxShadow: "0 8px 30px rgba(232,96,58,0.3)" }}>
          Start for Free →
        </Link>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 px-6 bg-white">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12 sm:mb-16">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12 max-w-[900px] mx-auto">
          {[
            { num: "1", title: "Sign Up", desc: "Create your free account with email. Secure login powered by Firebase." },
            { num: "2", title: "Track & Budget", desc: "Log income and expenses, pick categories, and set a monthly budget to stay on track." },
            { num: "3", title: "Earn Your Score", desc: "Get a Savings Score from 0–100 and unlock badges as you build better spending habits." },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#e8603a] text-white flex items-center justify-center mx-auto mb-5 text-xl font-extrabold" style={{ boxShadow: "0 6px 20px rgba(232,96,58,0.25)" }}>
                {step.num}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-[#888] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 px-6" style={{ background: "linear-gradient(180deg, #f5f5f7 0%, #fef3ee 100%)" }}>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12 sm:mb-16">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[900px] mx-auto">
          {[
            { icon: "🏆", title: "Savings Score", desc: "Set a monthly budget and get a score from 0–100. Stay under budget to max out your score." },
            { icon: "🎖️", title: "Badges & Rewards", desc: "Unlock badges like Penny Pincher, Budget Pro, and Savings Master as your score grows." },
            { icon: "🏷️", title: "Budget Categories", desc: "Organize expenses into categories like Food, Transport, Entertainment, and more." },
            { icon: "📊", title: "Spending Charts", desc: "Visualize where your money goes with interactive pie charts broken down by category." },
            { icon: "🔐", title: "Secure & Private", desc: "Your data is protected with Firebase Authentication. Only you can see your transactions." },
            { icon: "☁️", title: "Cloud Storage", desc: "Transactions save to Firestore automatically. Access your data from any device." },
          ].map((f) => (
            <div key={f.title} className="bg-white p-7 sm:p-8 rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #eee" }}>
              <div className="w-12 h-12 rounded-xl bg-[#e8603a]/8 flex items-center justify-center mb-5">
                <span className="text-2xl">{f.icon}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-[#aaa] text-sm bg-white" style={{ borderTop: "1px solid #e5e5e5" }}>
        Centsible 2026 — Aryan, Dipekshya & Krish
      </footer>
    </div>
  );
}