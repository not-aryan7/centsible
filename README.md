# Centsible

A budgeting web app for college students. Track your spending, set savings goals, and try not to blow your entire paycheck at Chipotle.

## Team

- **Aryan Rajbhandari** — Project setup, Landing page, Dashboard, AI Coach
- **Dipekshya Shakya** — App routing, Login page
- **Krish Bista** — Register page

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase (Auth + Firestore)
- Recharts
- Anthropic Claude (AI coach)

## Getting Started

```bash
git clone https://github.com/not-aryan7/centsible.git
cd centsible
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

You'll need a `.env` file with your API keys:

```
ANTHROPIC_API_KEY=your_key_here
```

## Features

- **Auth** — Email/password and Google sign-in via Firebase
- **Dashboard** — Balance, income, expenses at a glance with a bento grid layout
- **Transactions** — Add, edit, delete. Categorized (Food, Transport, Bills, etc.)
- **Monthly budget** — Set a spending limit and track how you're doing
- **Savings Score** — 0–100 wellness score based on budget adherence, savings rate, and category spread
- **Category chart** — Donut chart showing where your money actually goes
- **Savings goals** — Set targets (textbooks, new laptop, whatever), track progress with a visual bar
- **CentsiCoach** — AI chatbot that knows your financial data and gives personalized tips
- **Search & filters** — Find transactions by name, filter by category or type
- **CSV export** — Download your transactions as a spreadsheet
- **Badges** — Gamification. Unlock achievements as your score improves
- **Mobile friendly** — Bottom nav bar, responsive layout, works on phones

## Project Structure

```
src/
├── components/
│   ├── CentsiCoach.jsx     # AI chatbot
│   ├── CategoryChart.jsx   # Recharts donut chart
│   └── SavingsGoals.jsx    # Goal tracking
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── About.jsx
│   └── Dashboard.jsx       # Main app
├── services/
│   └── ai.js               # AI service (calls server proxy)
├── utils/
│   └── seedDemoData.js     # Demo data for testing
├── firebase.js
├── PrivateRoute.jsx
└── App.jsx
```
