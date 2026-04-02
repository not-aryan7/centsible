import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Centsi AI Coach API endpoint
      {
        name: 'centsi-ai-api',
        configureServer(server) {
          server.middlewares.use('/api/coach', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const { budget, expenses, score, recentTxs } = JSON.parse(body)

                const apiKey = env.VITE_GEMINI_API_KEY
                if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured. Add it to your .env file.' }))
                  return
                }

                const { GoogleGenAI } = await import('@google/genai')
                const ai = new GoogleGenAI({ apiKey })

                const prompt = `You are Centsi, a witty and slightly sarcastic financial mentor for college students. 
                Analyze this data and either 'Roast' them for bad habits or 'Boast' about their discipline. 
                Keep it short (max 2 sentences), funny, and relatable to a student. 
                Data: 
                - Monthly Budget: $${budget}
                - Total Expenses: $${expenses}
                - Savings Score: ${score}/100
                - Recent Transactions: ${recentTxs}
                Output: A single witty comment.`

                const response = await ai.models.generateContent({
                  model: 'gemini-2.0-flash',
                  contents: prompt,
                })

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ advice: response.text || "I'm speechless... and not in a good way." }))
              } catch (error) {
                console.error('Centsi API error:', error)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Failed to get advice from Centsi.' }))
              }
            })
          })
        }
      }
    ],
  }
})
