import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-5 sm:px-10 py-5 bg-white/90 backdrop-blur-md sticky top-0 z-10" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <Link to="/" className="text-xl sm:text-2xl font-extrabold text-[#e8603a] no-underline tracking-tight">
          Centsible
        </Link>
        <Link to="/" className="text-sm text-[#666] no-underline font-medium hover:text-[#2e3336] transition-colors">
          ← Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-20 px-6 text-center" style={{ background: "linear-gradient(180deg, #f5f5f7 0%, #fff0e8 100%)" }}>
        <span className="text-xs font-bold text-[#e8603a] uppercase tracking-[3px]">About</span>
        <h2 className="text-3xl sm:text-[42px] font-black mt-4 mb-5 text-[#2e3336]">
          What is Centsible?
        </h2>
        <p className="text-base sm:text-lg text-[#777] max-w-[560px] mx-auto leading-relaxed">
          A gamified budgeting web app built for students who want to take control of their finances.
          Track spending, set savings goals, earn your Savings Score, and build better money habits.
        </p>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-6 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h3 className="text-2xl sm:text-[28px] font-extrabold text-center mb-10">
            What Can You Do?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: "🏆", title: "Savings Score", desc: "Set a monthly budget and get a score from 0–100 based on how well you stay under it. The higher your score, the better your habits." },
              { icon: "🎖️", title: "Earn Badges", desc: "Unlock badges like Budget Beginner, Penny Pincher, Budget Pro, and Savings Master as your score improves." },
              { icon: "💰", title: "Track Transactions", desc: "Log income and expenses with categories like Food, Transport, and Entertainment. All data saves to the cloud." },
              { icon: "📊", title: "Spending Charts", desc: "See where your money goes with a visual pie chart that breaks down spending by category." },
            ].map((f) => (
              <div key={f.title} className="p-7 rounded-2xl bg-[#f9f5f3] border border-[#eee]">
                <h4 className="font-bold text-base mb-2">{f.icon} {f.title}</h4>
                <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section className="py-16 sm:py-20 px-6 bg-[#f9f5f3]">
        <div className="max-w-[800px] mx-auto">
          <h3 className="text-2xl sm:text-[28px] font-extrabold text-center mb-10">
            Why We Built This
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-7 rounded-2xl bg-white border border-[#eee]">
              <h4 className="font-bold text-base mb-2">Students struggle with money</h4>
              <p className="text-[#888] text-sm leading-relaxed">
                Most students don't track spending or have a budget. We wanted to make it easy.
              </p>
            </div>
            <div className="p-7 rounded-2xl bg-white border border-[#eee]">
              <h4 className="font-bold text-base mb-2">Budgeting apps are boring</h4>
              <p className="text-[#888] text-sm leading-relaxed">
                Gamification makes saving fun. Earn your Savings Score, unlock badges, and see your progress grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-20 px-6" style={{ background: "linear-gradient(180deg, #f5f5f7 0%, #fef3ee 100%)" }}>
        <h3 className="text-2xl sm:text-[28px] font-extrabold text-center mb-12">
          Meet the Team
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[700px] mx-auto">
          {[
            { initial: "A", name: "Aryan", role: "Full-Stack & Project Lead" },
            { initial: "D", name: "Dipekshya", role: "Frontend & Auth" },
            { initial: "K", name: "Krish", role: "UI & Landing Page" },
          ].map((member) => (
            <div key={member.initial} className="bg-white py-9 px-6 rounded-2xl text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #eee" }}>
              <div className="w-14 h-14 rounded-full bg-[#e8603a]/8 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-[#e8603a]">
                {member.initial}
              </div>
              <p className="font-bold text-base mb-1">{member.name}</p>
              <p className="text-[#aaa] text-[13px]">{member.role}</p>
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