import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'
import { desc, gte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Generate weekly reports
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    // Fetch data from last 7 days
    const recentData = await db
      .select()
      .from(healthRecords)
      .where(gte(healthRecords.date, weekAgoStr))
      .orderBy(desc(healthRecords.date))

    // Calculate weekly stats
    const weeklyStats = {
      totalSteps: recentData.reduce((sum, r) => sum + (r.steps || 0), 0),
      avgSleep: recentData.length > 0 
        ? recentData.reduce((sum, r) => sum + (r.sleep || 0), 0) / recentData.length 
        : 0,
      totalCalories: recentData.reduce((sum, r) => sum + (r.calories || 0), 0),
      recordsCount: recentData.length,
    }

    // TODO: Send email/notification to users with weekly report
    // await sendWeeklyReport(userId, weeklyStats)

    return NextResponse.json({ 
      success: true,
      stats: weeklyStats,
      message: 'Weekly reports generated successfully'
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate weekly reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
