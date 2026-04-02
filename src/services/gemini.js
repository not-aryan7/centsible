import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are CentsiCoach — a friendly, witty AI financial advisor built into the Centsible budgeting app for college students.

Your personality:
- Warm, encouraging, and slightly sarcastic (like a cool older sibling who's good with money)
- Use occasional emojis but don't overdo it
- Keep responses concise (2-4 sentences for quick insights, up to a short paragraph for detailed advice)
- Reference their actual financial data when available
- Give actionable, specific advice — not generic platitudes
- Celebrate wins and gently call out overspending

You help students with:
- Budget planning and tracking
- Spending habit analysis
- Savings strategies for students
- Understanding where their money goes
- Setting realistic financial goals
- Tips for student-specific financial situations (textbooks, meal plans, etc.)

Rules:
- Never give investment advice or recommend specific financial products
- Always be supportive, never judgmental about spending
- If asked about non-financial topics, gently redirect to finances with humor
- Format currency amounts with $ signs
- Use short, punchy sentences`;

function buildContext(financialContext) {
  if (!financialContext.budget && !financialContext.income) return "";
  return `\n\n[USER'S CURRENT FINANCIAL SNAPSHOT]
Monthly Budget: $${financialContext.budget || "not set"}
Income this month: $${financialContext.income || 0}
Expenses this month: $${financialContext.expenses || 0}
Balance: $${financialContext.balance || 0}
Wellness Score: ${financialContext.score || 0}/100
Recent transactions: ${financialContext.recentTransactions || "none yet"}`;
}

/**
 * Send a message to CentsiCoach with financial context
 */
export async function askCentsiCoach(userMessage, financialContext = {}, chatHistory = []) {
  const context = buildContext(financialContext);

  // Convert chat history — Gemini uses "model", Anthropic uses "assistant"
  const messages = chatHistory.map((msg) => ({
    role: msg.role === "model" ? "assistant" : "user",
    content: msg.text,
  }));

  // Inject context on the first message only
  const fullMessage = messages.length === 0 ? `${context}\n\n${userMessage}` : userMessage;
  messages.push({ role: "user", content: fullMessage });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages,
  });

  return response.content[0].text;
}

/**
 * Get an auto-generated insight based on financial data
 */
export async function getAutoInsight(financialContext) {
  const prompt = `Based on this student's financial snapshot, give ONE brief, personalized insight or tip (2-3 sentences max). Be specific to their numbers. If they have no data yet, encourage them to start logging.

Monthly Budget: $${financialContext.budget || "not set"}
Income: $${financialContext.income || 0}
Expenses: $${financialContext.expenses || 0}
Balance: $${financialContext.balance || 0}
Wellness Score: ${financialContext.score || 0}/100
Recent transactions: ${financialContext.recentTransactions || "none yet"}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 150,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}
