import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA] to-[#E8F0F2]">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-10 py-5 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold tracking-tight text-[#028090]">Centsible</h1>
                <div className="flex gap-4 items-center">
                    <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#028090] transition-colors">
                        Sign In
                    </Link>
                    <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-[#028090] text-white rounded-full hover:bg-[#026f7d] transition-all hover:shadow-lg hover:shadow-[#028090]/25">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="text-center py-24 px-6">
                <p className="text-sm font-semibold text-[#028090] uppercase tracking-widest mb-4">Built for Students</p>
                <h2 className="text-5xl font-extrabold mb-5 leading-tight">
                    Smart Budgeting.<br />
                    <span className="text-[#028090]">Gamified Savings.</span>
                </h2>
                <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                    Track spending, set goals, and earn your Savings Score — all in one place.
                </p>
                <Link to="/register" className="inline-block px-8 py-3.5 bg-[#028090] text-white rounded-full text-lg font-semibold hover:bg-[#026f7d] transition-all hover:shadow-xl hover:shadow-[#028090]/30 hover:-translate-y-0.5">
                    Start for Free →
                </Link>
            </section>

            {/* Features */}
            <section className="max-w-4xl mx-auto px-8 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-[#028090]/10 flex items-center justify-center mb-4">
                        <span className="text-[#028090] font-bold text-lg">$</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Track Spending</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Log income and expenses. See exactly where your money goes.</p>
                </div>
                <div className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-[#028090]/10 flex items-center justify-center mb-4">
                        <span className="text-[#028090] font-bold text-lg">%</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Budget Goals</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Set budgets for categories and track your progress visually.</p>
                </div>
                <div className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-[#028090]/10 flex items-center justify-center mb-4">
                        <span className="text-[#028090] font-bold text-lg">★</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Savings Score</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Earn points for good habits. Unlock badges as you level up.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-200">
                Centsible 2026 — Aryan, Dipekshya & Krish
            </footer>
        </div>
    );
}
