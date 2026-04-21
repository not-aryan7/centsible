import { format } from "date-fns";

// ─── Constants ───

export const CATEGORIES = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Education", "Other"];

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const CATEGORY_MATERIAL_ICONS = {
  Food: "restaurant",
  Transport: "directions_car",
  Entertainment: "movie",
  Shopping: "shopping_cart",
  Bills: "receipt_long",
  Education: "school",
  Other: "more_horiz",
  Income: "payments",
};

export const BADGES = [
  { icon: "workspace_premium", name: "Saver Pro", desc: "7 Day Streak", bgColor: "bg-[#60fcc7]", textColor: "text-[#005e45]", condition: (b) => b > 0 },
  { icon: "local_fire_department", name: "Budget King", desc: "Under Limit", bgColor: "bg-[#ffd0b8]", textColor: "text-[#7a2e10]", condition: (_, s) => s >= 50 },
  { icon: "school", name: "Scholar", desc: "Applied 5x", bgColor: "bg-[#e4e7fe]", textColor: "text-[#505467]", condition: (_, s) => s >= 80 },
  { icon: "lock", name: "Investment", desc: "Locked", bgColor: "bg-[#dee3e7]", textColor: "text-[#5a6063]/40", condition: (_, s) => s >= 100 },
];

export const CATEGORY_COLORS = {
  Food: "#e8603a",
  Transport: "#f59e0b",
  Entertainment: "#8b5cf6",
  Shopping: "#06b6d4",
  Bills: "#ef4444",
  Education: "#10b981",
  Other: "#6b7280",
};

// ─── Helpers ───

export function formatDate(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `Today • ${format(date, "h:mm a")}`;
  if (days < 2) return `Yesterday • ${format(date, "h:mm a")}`;
  return `${format(date, "d MMM")} • ${format(date, "h:mm a")}`;
}

export function getMonthYear(ts) {
  if (!ts) return null;
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return { month: date.getMonth(), year: date.getFullYear() };
}

export function downloadCSV(transactions, monthName) {
  const headers = ["Date", "Description", "Type", "Category", "Amount"];
  const rows = transactions.map((t) => {
    const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
    return [
      format(date, "yyyy-MM-dd HH:mm"),
      `"${t.desc.replace(/"/g, '""')}"`,
      t.type,
      t.category || "",
      t.amount.toFixed(2),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `centsible_${monthName.toLowerCase()}_transactions.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Shared MaterialIcon Component ───

export function MaterialIcon({ name, className = "", fill = false, style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: fill ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400", ...style }}
    >
      {name}
    </span>
  );
}
