import { NextRequest, NextResponse } from 'next/server'
import { analyticsQueue } from '@/lib/queue'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch users who need analytics processing
    // For now, process for all users with recent data
    const recentData = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date))
      .limit(100)

    // Group by user (when you have user IDs)
    const userIds = ['default'] // TODO: Replace with actual user IDs

    for (const userId of userIds) {
      await analyticsQueue.add('analyze', {
        userId,
        data: recentData,
      })
    }

    return NextResponse.json({ 
      success: true,
      queued: userIds.length,
      message: 'Analytics processing queued successfully'
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ 
      error: 'Failed to queue analytics processing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
