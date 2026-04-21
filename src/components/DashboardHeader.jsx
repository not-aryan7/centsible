import { useRef } from "react";
import { MaterialIcon } from "../utils/dashboardUtils";

export default function DashboardHeader({
  user,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  onAddClick,
  onMenuClick,
}) {
  const searchInputRef = useRef(null);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 lg:px-10 h-16 bg-white/80 backdrop-blur-xl" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <MaterialIcon name="menu" className="text-xl" />
          </button>
          <div className="w-10 h-10 bg-[#2e3336] rounded-full flex items-center justify-center text-white font-black text-sm font-headline">C</div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-[#2e3336] font-headline leading-tight">Centsible</h1>
            <p className="text-[10px] text-[#5a6063] font-medium">Financial Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onAddClick} className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10 hover:bg-[#f5f5f7] transition-colors">
            <MaterialIcon name="add" className="text-lg" />
          </button>
          <div className="flex items-center gap-2.5 ml-2 pl-4" style={{ borderLeft: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#e8603a] to-[#c94e2a] flex items-center justify-center text-white font-bold text-xs">
                  {user?.displayName?.[0] || "U"}
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold leading-tight">{user?.displayName || "User"}</p>
              <p className="text-[10px] text-[#5a6063]">Student</p>
            </div>
          </div>
          {/* Search toggle */}
          <button onClick={() => setSearchOpen(!searchOpen)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <MaterialIcon name={searchOpen ? "close" : "search"} className="text-[#5a6063] text-xl" />
          </button>
          {/* Search input (expandable, desktop) */}
          {searchOpen ? (
            <div className="hidden lg:flex items-center bg-[#f5f5f7] rounded-full px-4 py-2 text-sm min-w-[220px] transition-all">
              <MaterialIcon name="search" className="text-[#adb3b6] text-lg mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="bg-transparent outline-none text-sm text-[#2e3336] w-full placeholder:text-[#adb3b6]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="ml-1">
                  <MaterialIcon name="close" className="text-sm text-[#adb3b6]" />
                </button>
              )}
            </div>
          ) : (
            <div onClick={() => setSearchOpen(true)} className="hidden lg:flex items-center bg-[#f5f5f7] rounded-full px-4 py-2 text-sm text-[#adb3b6] cursor-text min-w-[180px]">
              Start searching here ...
            </div>
          )}
        </div>
      </header>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="lg:hidden px-5 py-3 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center bg-[#f5f5f7] rounded-full px-4 py-2.5">
            <MaterialIcon name="search" className="text-[#adb3b6] text-lg mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="bg-transparent outline-none text-sm text-[#2e3336] w-full placeholder:text-[#adb3b6]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <MaterialIcon name="close" className="text-sm text-[#adb3b6]" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
