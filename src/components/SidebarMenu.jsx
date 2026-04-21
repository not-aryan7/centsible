import { MaterialIcon } from "../utils/dashboardUtils";

export default function SidebarMenu({ user, open, onClose, onEditBudget, onShowCoach, onLogout, navigate }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col animate-slideIn">
        <div className="p-6 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#e8603a]/20">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#e8603a] to-[#c94e2a] flex items-center justify-center text-white font-bold text-lg">
                  {user?.displayName?.[0] || "U"}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-sm">{user?.displayName || "User"}</p>
              <p className="text-[10px] text-[#5a6063]">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: "grid_view", label: "Dashboard", action: onClose },
            { icon: "account_balance_wallet", label: "Set Budget", action: () => { onEditBudget(); onClose(); } },
            { icon: "psychology", label: "AI Coach", action: () => { onShowCoach(); onClose(); } },
            { icon: "savings", label: "Savings Goals", action: onClose },
            { icon: "info", label: "About", action: () => navigate("/about") },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#2e3336] hover:bg-[#f5f5f7] transition-colors"
            >
              <MaterialIcon name={item.icon} className="text-lg text-[#5a6063]" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#ac3434] hover:bg-red-50 transition-colors"
          >
            <MaterialIcon name="logout" className="text-lg" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
