import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'
import { desc } from 'drizzle-orm'

// Cron job to generate daily health summaries
export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch today's health records
    const todaysRecords = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date))
      .limit(1)

    if (todaysRecords.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No data for today'
      })
    }

    // Generate summary (in production, you might send emails/notifications here)
    const record = todaysRecords[0]
    const summary = {
      date: today,
      weight: record.weight,
      steps: record.steps,
      sleep: record.sleep,
      calories: record.calories,
      protein: record.protein,
    }

    console.log('Daily summary generated:', summary)

    return NextResponse.json({ 
      success: true, 
      summary,
      message: 'Daily summary generated successfully'
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate daily summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
