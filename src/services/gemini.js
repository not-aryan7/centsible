import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are CentsiCoach — a friendly, witty AI financial advisor built into the Centsible budgeting app for college students.

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

/**
 * Send a message to CentsiCoach with financial context
 * @param {string} userMessage - The user's message
 * @param {object} financialContext - User's financial data for context
 * @param {Array} chatHistory - Previous messages for conversation continuity
 * @returns {Promise<string>} - The AI response
 */
export async function askCentsiCoach(userMessage, financialContext = {}, chatHistory = []) {
  const contextBlock = financialContext.budget || financialContext.income
    ? `\n\n[USER'S CURRENT FINANCIAL SNAPSHOT]
Monthly Budget: $${financialContext.budget || "not set"}
Income this month: $${financialContext.income || 0}
Expenses this month: $${financialContext.expenses || 0}
Balance: $${financialContext.balance || 0}
Wellness Score: ${financialContext.score || 0}/100
Recent transactions: ${financialContext.recentTransactions || "none yet"}`
    : "";

  // Build conversation history for multi-turn
  const contents = chatHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  // Add the new user message with context (context only on first message or when data changes)
  const fullMessage = contents.length === 0
    ? `${contextBlock}\n\n${userMessage}`
    : userMessage;

  contents.push({
    role: "user",
    parts: [{ text: fullMessage }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.8,
      maxOutputTokens: 300,
    },
  });

  return response.text;
}

/**
 * Get an auto-generated insight based on financial data (no user prompt needed)
 */
export async function getAutoInsight(financialContext) {
  const prompt = `Based on this student's financial snapshot, give ONE brief, personalized insight or tip (2-3 sentences max). Be specific to their numbers. If they have no data yet, encourage them to start logging.

Monthly Budget: $${financialContext.budget || "not set"}
Income: $${financialContext.income || 0}
Expenses: $${financialContext.expenses || 0}  
Balance: $${financialContext.balance || 0}
Wellness Score: ${financialContext.score || 0}/100
Recent transactions: ${financialContext.recentTransactions || "none yet"}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
      maxOutputTokens: 150,
    },
  });

  return response.text;
}
