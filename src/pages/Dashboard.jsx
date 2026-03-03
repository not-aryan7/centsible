import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-[#F5F7FA]">
            <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
                <h1 className="text-xl font-bold text-[#028090]">Centsible</h1>
                <Link to="/" className="text-sm text-gray-500 hover:text-[#028090]">
                    Log out
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto px-8 py-8">
                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Income</p>
                        <p className="text-2xl font-bold text-green-600">$0.00</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Expenses</p>
                        <p className="text-2xl font-bold text-red-500">$0.00</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-2xl font-bold text-[#028090]">$0.00</p>
                    </div>
                </div>

                <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                    <p className="text-gray-400 text-lg">No transactions yet</p>
                    <p className="text-gray-300 text-sm mt-1">Transactions and charts coming in Sprint 2</p>
                </div>
            </div>
        </div>
    );
}
