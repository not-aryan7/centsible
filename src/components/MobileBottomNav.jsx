import { MaterialIcon } from "../utils/dashboardUtils";

export default function MobileBottomNav({ onAddClick, onBudgetClick, onCoachClick, onLogout }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl flex justify-around items-center h-20 px-4 z-40" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <button className="flex flex-col items-center gap-1 text-[#e8603a]">
        <MaterialIcon name="grid_view" fill /> <span className="text-[10px] font-bold">Home</span>
      </button>
      <button onClick={onBudgetClick} className="flex flex-col items-center gap-1 text-[#5a6063]">
        <MaterialIcon name="account_balance_wallet" /> <span className="text-[10px] font-bold">Budget</span>
      </button>
      <div className="relative -top-8">
        <button onClick={onAddClick} className="w-14 h-14 bg-[#e8603a] text-white rounded-full shadow-lg flex items-center justify-center" style={{ boxShadow: "0 8px 24px rgba(232,96,58,0.3)" }}>
          <MaterialIcon name="add" className="text-3xl" />
        </button>
      </div>
      <button onClick={onCoachClick} className="flex flex-col items-center gap-1 text-[#5a6063]">
        <MaterialIcon name="psychology" /> <span className="text-[10px] font-bold">AI</span>
      </button>
      <button onClick={onLogout} className="flex flex-col items-center gap-1 text-[#5a6063]">
        <MaterialIcon name="logout" /> <span className="text-[10px] font-bold">Logout</span>
      </button>
    </nav>
  );
}
