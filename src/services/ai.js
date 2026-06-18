/**
 * CentsiCoach AI Service
 * Calls the server-side proxy (/api/coach/*) so the API key is never exposed to the browser.
 */

/**
 * Send a message to CentsiCoach with financial context
 */
export async function askCentsiCoach(userMessage, financialContext = {}, chatHistory = []) {
  const res = await fetch("/api/coach/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage, financialContext, chatHistory }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to get response");
  }

  const data = await res.json();
  return data.reply;
}

/**
 * Get an auto-generated insight based on financial data
 */
export async function getAutoInsight(financialContext) {
  const res = await fetch("/api/coach/insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ financialContext }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to get insight");
  }

  const data = await res.json();
  return data.reply;
}

/**
 * Get AI-generated spending forecast warning
 */
export async function getSpendingForecast(forecastContext) {
  const res = await fetch("/api/coach/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forecastContext }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to get forecast");
  }

  const data = await res.json();
  return data.reply;
}

/**
 * Scan a receipt image using Gemini Vision
 */
export async function scanReceipt(imageBase64) {
  const res = await fetch("/api/receipt/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to scan receipt");
  }

  const data = await res.json();
  return data.result;
}
