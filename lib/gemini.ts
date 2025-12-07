import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Build health data context for the chatbot
 */
export function buildHealthDataContext(healthRecords: any[], streakData: any) {
  if (healthRecords.length === 0) {
    return "The user has no health records yet."
  }

  // Calculate averages
  const recordsWithData = healthRecords.filter(r => 
    r.weight || r.steps || r.sleep || r.calories || r.protein
  )

  const averages = {
    weight: recordsWithData.filter(r => r.weight).reduce((sum, r) => sum + r.weight, 0) / recordsWithData.filter(r => r.weight).length || null,
    steps: recordsWithData.filter(r => r.steps).reduce((sum, r) => sum + r.steps, 0) / recordsWithData.filter(r => r.steps).length || null,
    sleep: recordsWithData.filter(r => r.sleep).reduce((sum, r) => sum + r.sleep, 0) / recordsWithData.filter(r => r.sleep).length || null,
    calories: recordsWithData.filter(r => r.calories).reduce((sum, r) => sum + r.calories, 0) / recordsWithData.filter(r => r.calories).length || null,
    protein: recordsWithData.filter(r => r.protein).reduce((sum, r) => sum + r.protein, 0) / recordsWithData.filter(r => r.protein).length || null,
  }

  // Get date range
  const dates = healthRecords.map(r => r.date).sort()
  const dateRange = dates.length > 0 
    ? `${dates[0]} to ${dates[dates.length - 1]}`
    : "No date range"

  // Get recent records (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentRecords = healthRecords.filter(r => new Date(r.date) >= sevenDaysAgo)

  // Build context string
  let context = `User's Health Data Summary:
- Total Records: ${healthRecords.length}
- Date Range: ${dateRange}
- Current Streak: ${streakData?.currentStreak || 0} days
- Longest Streak: ${streakData?.longestStreak || 0} days

Averages:
${averages.weight ? `- Weight: ${averages.weight.toFixed(1)} kg` : ''}
${averages.steps ? `- Steps: ${Math.round(averages.steps)} steps/day` : ''}
${averages.sleep ? `- Sleep: ${averages.sleep.toFixed(1)} hours/night` : ''}
${averages.calories ? `- Calories: ${Math.round(averages.calories)} cal/day` : ''}
${averages.protein ? `- Protein: ${averages.protein.toFixed(1)} g/day` : ''}

Recent Activity (Last 7 days): ${recentRecords.length} records
`

  // Add recent records details
  if (recentRecords.length > 0) {
    context += "\nRecent Records:\n"
    recentRecords.slice(-5).forEach(record => {
      const parts = []
      if (record.weight) parts.push(`Weight: ${record.weight}kg`)
      if (record.steps) parts.push(`Steps: ${record.steps}`)
      if (record.sleep) parts.push(`Sleep: ${record.sleep}h`)
      if (record.calories) parts.push(`Calories: ${record.calories}`)
      if (record.protein) parts.push(`Protein: ${record.protein}g`)
      if (parts.length > 0) {
        context += `- ${record.date}: ${parts.join(', ')}\n`
      }
    })
  }

  return context
}

/**
 * Generate chat response using Gemini
 */
export async function generateChatResponse(
  userMessage: string,
  healthDataContext: string,
  conversationHistory: Array<{ role: 'user' | 'model'; parts: string }> = []
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    // Build system prompt with health data context
    const systemPrompt = `You are a friendly, supportive personal health coach named OwnIt Coach. You have access to the user's health data and are here to help them understand their health patterns, answer questions, and provide encouragement.

Your personality:
- Supportive and encouraging, never judgmental
- Data-driven but warm and friendly
- Helpful in explaining health metrics
- Motivating and positive
- Clear and concise in your explanations

User's Health Data:
${healthDataContext}

Guidelines:
- Use the user's actual data in your responses
- Reference specific numbers when relevant
- Provide insights based on patterns you see
- Give practical, actionable advice
- Celebrate their achievements (like streaks)
- Be empathetic if they're struggling
- If asked about something not in the data, say you don't have that information but can help with what you do know

Remember: You're here to help them understand and improve their health journey.`

    // Build full prompt with conversation history
    let fullPrompt = systemPrompt + '\n\n'
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      fullPrompt += 'Previous conversation:\n'
      conversationHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Coach'
        fullPrompt += `${role}: ${msg.parts}\n\n`
      })
    }
    
    fullPrompt += `User: ${userMessage}\nCoach:`

    // Generate response
    const result = await model.generateContent(fullPrompt)

    const response = result.response
    const text = response.text()

    return text
  } catch (error: any) {
    console.error('Error generating chat response:', error)
    throw new Error(`Failed to generate response: ${error.message}`)
  }
}
