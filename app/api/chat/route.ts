import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'
import { generateChatResponse, buildHealthDataContext } from '@/lib/gemini'

// POST - Handle chat messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Fetch user's health records
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
    const healthDataContext = buildHealthDataContext(records, streakData)

    // Generate response using Gemini
    const response = await generateChatResponse(
      message,
      healthDataContext,
      conversationHistory
    )

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
