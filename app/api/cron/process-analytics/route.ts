import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'
import { desc } from 'drizzle-orm'
import { detectAllPatterns } from '@/lib/pattern-detection'
import { invalidateCache } from '@/lib/redis'

// Cron job to process analytics and refresh caches
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch recent health records
    const recentData = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date))
      .limit(100)

    if (recentData.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No data to process'
      })
    }

    // Run pattern detection
    const patterns = detectAllPatterns(recentData)

    // Invalidate caches to force refresh
    await invalidateCache('analytics:patterns')
    await invalidateCache('analytics:predictions:all:14')

    return NextResponse.json({ 
      success: true,
      recordsProcessed: recentData.length,
      patternsDetected: patterns.length,
      message: 'Analytics processing completed'
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ 
      error: 'Failed to process analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
