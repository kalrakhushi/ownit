import { NextRequest, NextResponse } from 'next/server'
import Letta from "@letta-ai/letta-client"
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'
import { desc } from 'drizzle-orm'

// GET - Retrieve message history from Letta agent
export async function GET(request: NextRequest) {
  try {
    const agentId = process.env.LETTA_AGENT_ID
    const apiKey = process.env.LETTA_API_KEY
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'LETTA_AGENT_ID not configured' },
        { status: 500 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LETTA_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Initialize Letta client
    const client = new Letta({ apiKey })

    // Retrieve message history from Letta
    const response = await client.agents.messages.list(agentId, {
      limit: 100, // Get last 100 messages
    })

    // Letta returns items in a paginated response (newest first)
    const items = response.items || response.messages || []
    
    // Convert Letta messages to our format
    const messages = items
      .filter((msg: any) => 
        msg.message_type === "user_message" || 
        msg.message_type === "assistant_message"
      )
      .map((msg: any) => {
        if (msg.message_type === "user_message") {
          return {
            role: 'user' as const,
            content: msg.content || "",
            timestamp: msg.created_at || new Date().toISOString(),
          }
        } else if (msg.message_type === "assistant_message") {
          return {
            role: 'assistant' as const,
            content: msg.content || "",
            timestamp: msg.created_at || new Date().toISOString(),
          }
        }
        return null
      })
      .filter((msg: any) => msg !== null)
      
    // Letta returns newest first (index 0 = newest message)
    // Reverse to get chronological order (oldest first) for chat UI
    const reversedMessages = messages.reverse()
    
    console.log('Message order check:', reversedMessages.slice(0, 3).map(m => ({
      role: m.role,
      preview: m.content.substring(0, 30)
    })))

    return NextResponse.json({ messages: reversedMessages })
  } catch (error: any) {
    console.error('Error fetching message history:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch message history' },
      { status: 500 }
    )
  }
}

// POST - Handle chat messages with Letta agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const agentId = process.env.LETTA_AGENT_ID
    const apiKey = process.env.LETTA_API_KEY
    
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'LETTA_AGENT_ID not configured. Please run the init script first.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'LETTA_API_KEY not configured.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Letta client
    const client = new Letta({ apiKey })

    // Fetch user's health records for context
    let healthContext = ""
    try {
      const records = await db.select().from(healthRecords).orderBy(desc(healthRecords.date))
      
      // Fetch streak data
      let streakData = { currentStreak: 0, longestStreak: 0 }
      try {
        const streakResponse = await fetch(`${request.nextUrl.origin}/api/streaks`)
        if (streakResponse.ok) {
          const streakResult = await streakResponse.json()
          streakData = {
            currentStreak: streakResult.currentStreak || 0,
            longestStreak: streakResult.longestStreak || 0,
          }
        }
      } catch (error) {
        console.error('Error fetching streak data:', error)
      }

      // Build health data context
      if (records.length > 0) {
        const recentRecords = records.slice(0, 10) // Last 10 records
        const avgWeight = records.reduce((sum, r) => sum + (r.weight || 0), 0) / records.length
        const avgSteps = records.reduce((sum, r) => sum + (r.steps || 0), 0) / records.length
        const avgSleep = records.reduce((sum, r) => sum + (r.sleep || 0), 0) / records.length
        
        healthContext = `\n\nUser's Health Data Context:
- Total records: ${records.length}
- Current streak: ${streakData.currentStreak} days
- Longest streak: ${streakData.longestStreak} days
- Average weight: ${avgWeight.toFixed(1)} kg
- Average steps: ${Math.round(avgSteps)} steps/day
- Average sleep: ${avgSleep.toFixed(1)} hours/night
- Recent records: ${recentRecords.map(r => `${r.date}: weight ${r.weight}kg, steps ${r.steps}, sleep ${r.sleep}h`).join('; ')}`
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
      // Continue without health context if there's an error
    }

    // Build the full message with context if available
    const fullMessage = healthContext 
      ? `${message}${healthContext}`
      : message

    // Get response from Letta agent (non-streaming)
    // IMPORTANT: Only send the new message, Letta maintains conversation history
    const response = await client.agents.messages.create(agentId, {
      messages: [{ role: "user", content: fullMessage }],
    })

    // Extract the assistant's response
    let assistantMessage = ""
    for (const msg of response.messages) {
      if (msg.message_type === "assistant_message") {
        assistantMessage = msg.content || ""
        break
      }
    }

    return NextResponse.json({ 
      message: assistantMessage,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error in chat API:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
