# Centsible

A smart, AI-powered budgeting web app built for college students. Track your spending, scan receipts with AI, get spending predictions, and chat with your personal financial coach — all in one place.

## Team

- **Aryan Rajbhandari** — Full-Stack & Project Lead. Built CentsiCoach AI, Receipt Scanner, server-side proxy architecture, dashboard system, activity manager, monthly summary reports.
- **Dipekshya Karki** — Frontend, Auth & Documentation Lead. Built Login/Register with Firebase Auth, route protection, AI Spending Predictions, dashboard refactoring, landing page redesign, all sprint presentations and documentation.
- **Krish Bista** — UI & Design. Built Landing page, Financial Cards, Category Chart, Achievement Badges, Savings Goals, mobile bottom nav, full mobile responsiveness.

## Tech Stack

- React 18 + Vite
- Tailwind CSS (Stitch design system)
- Firebase Authentication (email/password)
- Cloud Firestore (real-time NoSQL database)
- Anthropic Claude API (CentsiCoach, Receipt Scanner, Spending Forecast)
- Recharts (data visualization)
- Server-side proxy (secure API key management via Vite middleware)

## Getting Started

```bash
git clone https://github.com/not-aryan7/centsible.git
cd centsible
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

You'll need a `.env` file with your API key:

```
ANTHROPIC_API_KEY=your_key_here
```

## Features

### Core
- **Authentication** — Email/password sign-in via Firebase Auth with route protection
- **Dashboard** — Bento grid layout showing balance, income, expenses, budget, and financial wellness score
- **Transactions** — Add, edit, delete. Categorized (Food, Transport, Bills, Entertainment, Shopping, Education, Other)
- **Monthly budget** — Set a spending limit and track adherence with visual progress
- **Savings Score** — 0–100 financial wellness score based on budget adherence
- **Category chart** — Donut chart breaking down spending by category
- **Savings goals** — Set targets, track progress with visual bars
- **Search & filters** — Find transactions by name, filter by category or type
- **CSV export** — Download transactions as a spreadsheet
- **Badges** — Gamification. Unlock achievements as your score improves
- **Mobile responsive** — Bottom nav bar, responsive layout, works on phones and tablets

### AI Features (powered by Anthropic Claude)
- **CentsiCoach** — Personal AI financial advisor that analyzes your real spending data and gives personalized advice via chat
- **Receipt Scanner** — Upload or photograph a receipt, Claude's vision API reads it and auto-fills merchant, amount, date, and category
- **Spending Forecast** — Projects end-of-month spending per category based on daily burn rate, flags anomalies against 3-month averages, generates AI warnings

## Architecture

```
Browser (React SPA)
    ├── Firebase Auth → login/register/session
    ├── Cloud Firestore → real-time transaction CRUD (onSnapshot)
    └── Server Proxy (Vite middleware) → Anthropic Claude API
            ├── /api/coach/chat      (CentsiCoach conversations)
            ├── /api/coach/forecast   (Spending predictions)
            └── /api/receipt/scan     (Receipt OCR with vision)
```

All AI API calls go through server-side proxy endpoints defined in `vite.config.js`. API keys never reach the browser.

## Firebase Integration

| File | Firebase Usage |
|---|---|
| `src/firebase.js` | App initialization, exports `auth` and `db` |
| `src/pages/Login.jsx` | `signInWithEmailAndPassword` |
| `src/pages/Register.jsx` | `createUserWithEmailAndPassword` |
| `src/PrivateRoute.jsx` | `onAuthStateChanged` for route protection |
| `src/pages/Dashboard.jsx` | `onSnapshot` (real-time listener), `addDoc`, `deleteDoc`, `updateDoc`, `setDoc`, `getDoc` |
| `src/utils/seedDemoData.js` | `addDoc` + `setDoc` for demo data seeding |

## Project Structure

```
src/
├── components/
│   ├── AchievementBadges.jsx    # Gamification badges
│   ├── ActivityManager.jsx      # Transaction list with filters & CSV export
│   ├── CategoryChart.jsx        # Recharts donut chart
│   ├── CentsiCoach.jsx          # AI chatbot with financial context
│   ├── DashboardHeader.jsx      # Top bar with search, date, add button
│   ├── FinancialCards.jsx       # Balance, income, expenses, budget cards
│   ├── MobileBottomNav.jsx      # Responsive mobile navigation
│   ├── MonthlySummary.jsx       # Monthly report modal with AI insights
│   ├── ReceiptScanner.jsx       # AI receipt scanning (camera + upload)
│   ├── SavingsGoals.jsx         # Goal tracking with progress bars
│   ├── SidebarMenu.jsx          # Desktop sidebar navigation
│   ├── SpendingForecast.jsx     # AI spending predictions & anomaly detection
│   └── TransactionModals.jsx    # Add/Edit/View all transaction modals
├── pages/
│   ├── Landing.jsx              # Public landing page
│   ├── Login.jsx                # Firebase Auth login
│   ├── Register.jsx             # Firebase Auth registration
│   ├── About.jsx                # Team & project info
│   └── Dashboard.jsx            # Main dashboard (state, Firestore, routing)
├── services/
│   └── ai.js                    # AI service layer (proxy calls to Claude)
├── utils/
│   ├── dashboardUtils.jsx       # Shared constants, helpers, icons
│   └── seedDemoData.js          # Demo transaction data for testing
├── firebase.js                  # Firebase app config
├── PrivateRoute.jsx             # Auth route guard
├── App.jsx                      # React Router setup
├── main.jsx                     # App entry point
└── index.css                    # Global styles & Stitch design tokens
```
