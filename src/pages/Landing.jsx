import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#F5F7FA]">
            <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
                <h1 className="text-xl font-bold text-[#028090]">Centsible</h1>
                <div className="flex gap-3">
                    <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-[#028090]">
                        Sign In
                    </Link>
                    <Link to="/register" className="px-4 py-2 text-sm bg-[#028090] text-white rounded-lg hover:bg-[#026f7d]">
                        Get Started
                    </Link>
                </div>
            </nav>

            <section className="text-center py-20 px-4">
                <h2 className="text-4xl font-bold mb-4">
                    Smart Budgeting. <span className="text-[#028090]">Gamified Savings.</span>
                </h2>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                    Track spending, set goals, and earn your Savings Score. Built for students.
                </p>
                <Link to="/register" className="px-6 py-3 bg-[#028090] text-white rounded-lg text-lg hover:bg-[#026f7d]">
                    Start for Free
                </Link>
            </section>

            <section className="max-w-4xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Track Spending</h3>
                    <p className="text-gray-500 text-sm">Log income and expenses. See where your money goes.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Budget Goals</h3>
                    <p className="text-gray-500 text-sm">Set budgets for categories and track your progress.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-2">Savings Score</h3>
                    <p className="text-gray-500 text-sm">Earn points for good habits. Unlock badges as you go.</p>
                </div>
            </section>

            <footer className="text-center py-6 text-gray-400 text-sm border-t">
                Centsible 2026 — Aryan, Dipekshya & Krish
            </footer>
        </div>
    );
}
