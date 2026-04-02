import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

// Builds a Date for a given year/month/day + optional hour offset
function d(year, month, day, hour = 10) {
  return new Date(year, month, day, hour);
}

export async function seedDemoData(uid) {
  const txRef = collection(db, "users", uid, "transactions");

  const transactions = [
    // ── January 2026 ──
    { desc: "Monthly Salary",   amount: 3500, type: "income",   category: "Income",         createdAt: d(2026, 0, 1) },
    { desc: "Rent",             amount: 900,  type: "expense",  category: "Bills",          createdAt: d(2026, 0, 3) },
    { desc: "Grocery Run",      amount: 85,   type: "expense",  category: "Food",           createdAt: d(2026, 0, 5) },
    { desc: "Uber to campus",   amount: 12,   type: "expense",  category: "Transport",      createdAt: d(2026, 0, 7) },
    { desc: "Netflix",          amount: 18,   type: "expense",  category: "Entertainment",  createdAt: d(2026, 0, 8) },
    { desc: "Electricity Bill", amount: 65,   type: "expense",  category: "Bills",          createdAt: d(2026, 0, 10) },
    { desc: "Chipotle",         amount: 14,   type: "expense",  category: "Food",           createdAt: d(2026, 0, 12) },
    { desc: "Campus Bus Pass",  amount: 40,   type: "expense",  category: "Transport",      createdAt: d(2026, 0, 14) },
    { desc: "Textbooks",        amount: 120,  type: "expense",  category: "Education",      createdAt: d(2026, 0, 15) },
    { desc: "Coffee & snacks",  amount: 28,   type: "expense",  category: "Food",           createdAt: d(2026, 0, 18) },
    { desc: "Movie night",      amount: 24,   type: "expense",  category: "Entertainment",  createdAt: d(2026, 0, 20) },
    { desc: "Amazon order",     amount: 47,   type: "expense",  category: "Shopping",       createdAt: d(2026, 0, 22) },
    { desc: "Freelance work",   amount: 400,  type: "income",   category: "Income",         createdAt: d(2026, 0, 25) },
    { desc: "Trader Joe's",     amount: 62,   type: "expense",  category: "Food",           createdAt: d(2026, 0, 27) },
    { desc: "Phone Bill",       amount: 45,   type: "expense",  category: "Bills",          createdAt: d(2026, 0, 29) },

    // ── February 2026 ──
    { desc: "Monthly Salary",   amount: 3500, type: "income",   category: "Income",         createdAt: d(2026, 1, 1) },
    { desc: "Rent",             amount: 900,  type: "expense",  category: "Bills",          createdAt: d(2026, 1, 3) },
    { desc: "Whole Foods",      amount: 93,   type: "expense",  category: "Food",           createdAt: d(2026, 1, 5) },
    { desc: "Valentine's dinner",amount: 78,  type: "expense",  category: "Food",           createdAt: d(2026, 1, 14) },
    { desc: "Spotify",          amount: 11,   type: "expense",  category: "Entertainment",  createdAt: d(2026, 1, 8) },
    { desc: "Lyft rides",       amount: 22,   type: "expense",  category: "Transport",      createdAt: d(2026, 1, 10) },
    { desc: "Electricity Bill", amount: 58,   type: "expense",  category: "Bills",          createdAt: d(2026, 1, 11) },
    { desc: "Online course",    amount: 29,   type: "expense",  category: "Education",      createdAt: d(2026, 1, 13) },
    { desc: "New sneakers",     amount: 89,   type: "expense",  category: "Shopping",       createdAt: d(2026, 1, 16) },
    { desc: "Chipotle + Starbucks",amount: 31,type: "expense",  category: "Food",           createdAt: d(2026, 1, 19) },
    { desc: "Cinema tickets",   amount: 32,   type: "expense",  category: "Entertainment",  createdAt: d(2026, 1, 21) },
    { desc: "Campus Bus Pass",  amount: 40,   type: "expense",  category: "Transport",      createdAt: d(2026, 1, 23) },
    { desc: "Tutoring income",  amount: 250,  type: "income",   category: "Income",         createdAt: d(2026, 1, 26) },
    { desc: "Phone Bill",       amount: 45,   type: "expense",  category: "Bills",          createdAt: d(2026, 1, 28) },

    // ── March 2026 ──
    { desc: "Monthly Salary",   amount: 3500, type: "income",   category: "Income",         createdAt: d(2026, 2, 1) },
    { desc: "Freelance project",amount: 650,  type: "income",   category: "Income",         createdAt: d(2026, 2, 3) },
    { desc: "Rent",             amount: 900,  type: "expense",  category: "Bills",          createdAt: d(2026, 2, 3) },
    { desc: "Spring break groceries",amount: 110,type:"expense",category: "Food",           createdAt: d(2026, 2, 6) },
    { desc: "Electricity Bill", amount: 52,   type: "expense",  category: "Bills",          createdAt: d(2026, 2, 8) },
    { desc: "Flight home",      amount: 180,  type: "expense",  category: "Transport",      createdAt: d(2026, 2, 10) },
    { desc: "Netflix + Disney+",amount: 28,   type: "expense",  category: "Entertainment",  createdAt: d(2026, 2, 12) },
    { desc: "Target haul",      amount: 65,   type: "expense",  category: "Shopping",       createdAt: d(2026, 2, 15) },
    { desc: "Study materials",  amount: 42,   type: "expense",  category: "Education",      createdAt: d(2026, 2, 17) },
    { desc: "Campus Bus Pass",  amount: 40,   type: "expense",  category: "Transport",      createdAt: d(2026, 2, 20) },
    { desc: "Restaurant dinner",amount: 55,   type: "expense",  category: "Food",           createdAt: d(2026, 2, 22) },
    { desc: "Gym membership",   amount: 30,   type: "expense",  category: "Bills",          createdAt: d(2026, 2, 24) },
    { desc: "Amazon Prime",     amount: 139,  type: "expense",  category: "Shopping",       createdAt: d(2026, 2, 26) },
    { desc: "Phone Bill",       amount: 45,   type: "expense",  category: "Bills",          createdAt: d(2026, 2, 29) },
  ];

  for (const tx of transactions) {
    await addDoc(txRef, tx);
  }

  // Set budget
  await setDoc(doc(db, "users", uid, "settings", "budget"), { amount: 2000 });
}
