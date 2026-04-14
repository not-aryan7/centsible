import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
- Use short, punchy sentences`

function buildContext(fc) {
  if (!fc || (!fc.budget && !fc.income)) return ''
  return `\n\n[USER'S CURRENT FINANCIAL SNAPSHOT]
Monthly Budget: $${fc.budget || 'not set'}
Income this month: $${fc.income || 0}
Expenses this month: $${fc.expenses || 0}
Balance: $${fc.balance || 0}
Wellness Score: ${fc.score || 0}/100
Recent transactions: ${fc.recentTransactions || 'none yet'}`
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      // ─── CentsiCoach server-side AI proxy ───
      {
        name: 'centsi-ai-proxy',
        configureServer(server) {
          // Chat endpoint
          server.middlewares.use('/api/coach/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              return res.end(JSON.stringify({ error: 'Method not allowed' }))
            }

            try {
              const { userMessage, financialContext, chatHistory } = await parseBody(req)
              const apiKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY
              if (!apiKey) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured in .env' }))
              }

              const { default: Anthropic } = await import('@anthropic-ai/sdk')
              const client = new Anthropic({ apiKey })

              const context = buildContext(financialContext)

              // Convert chat history
              const messages = (chatHistory || []).map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.text,
              }))

              const fullMessage = messages.length === 0 ? `${context}\n\n${userMessage}` : userMessage
              messages.push({ role: 'user', content: fullMessage })

              const response = await client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 300,
                system: SYSTEM_PROMPT,
                messages,
              })

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ reply: response.content[0].text }))
            } catch (error) {
              console.error('CentsiCoach chat error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to get response from CentsiCoach.' }))
            }
          })

          // Insight endpoint
          server.middlewares.use('/api/coach/insight', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              return res.end(JSON.stringify({ error: 'Method not allowed' }))
            }

            try {
              const { financialContext } = await parseBody(req)
              const apiKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY
              if (!apiKey) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured in .env' }))
              }

              const { default: Anthropic } = await import('@anthropic-ai/sdk')
              const client = new Anthropic({ apiKey })

              const fc = financialContext || {}
              const prompt = `Based on this student's financial snapshot, give ONE brief, personalized insight or tip (2-3 sentences max). Be specific to their numbers. If they have no data yet, encourage them to start logging.

Monthly Budget: $${fc.budget || 'not set'}
Income: $${fc.income || 0}
Expenses: $${fc.expenses || 0}
Balance: $${fc.balance || 0}
Wellness Score: ${fc.score || 0}/100
Recent transactions: ${fc.recentTransactions || 'none yet'}`

              const response = await client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 150,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: prompt }],
              })

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ reply: response.content[0].text }))
            } catch (error) {
              console.error('CentsiCoach insight error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to get insight.' }))
            }
          })
        }
      }
    ],
  }
})
