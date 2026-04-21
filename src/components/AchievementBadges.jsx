import { MaterialIcon, BADGES } from "../utils/dashboardUtils";

export default function AchievementBadges({ monthlyBudget, savingsScore }) {
  return (
    <div className="bg-white rounded-3xl p-7" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold font-headline">Achievements</h3>
        <button className="text-[#e8603a] text-[10px] font-bold uppercase tracking-wider hover:underline">View All</button>
      </div>
      <div className="relative h-52">
        {BADGES.map((badge, i) => {
          const earned = badge.condition(monthlyBudget, savingsScore);
          const configs = [
            { size: 110, left: 0,   top: 80,  opacity: 0.25 },
            { size: 90,  left: 95,  top: 20,  opacity: 0.2  },
            { size: 70,  left: 30,  top: 10,  opacity: 0.15 },
            { size: 58,  left: 140, top: 115, opacity: 0.12 },
          ];
          const c = configs[i];
          return (
            <div key={badge.name} className="absolute rounded-full flex flex-col items-center justify-center text-center cursor-pointer group transition-transform hover:scale-105"
              style={{ width: c.size, height: c.size, left: c.left, top: c.top, background: earned ? undefined : `rgba(0,0,0,${c.opacity * 0.3})` }}
            >
              {earned && <div className="absolute inset-0 rounded-full" style={{ background: `rgba(0,0,0,0.04)` }} />}
              <div className={`absolute inset-0 rounded-full ${earned ? badge.bgColor + "/25" : ""}`} />
              <div className="relative z-10 flex flex-col items-center">
                <MaterialIcon name={badge.icon} className={`text-lg mb-0.5 ${earned ? badge.textColor : "text-[#5a6063]/40"}`} fill={earned} />
                <p className={`text-[9px] font-bold leading-tight ${earned ? "" : "text-[#5a6063]/60"}`}>{badge.name}</p>
                <p className="text-[7px] text-[#5a6063]/60">{badge.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
