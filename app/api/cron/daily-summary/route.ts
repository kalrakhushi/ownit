import { NextRequest, NextResponse } from 'next/server'
import { summaryQueue } from '@/lib/queue'

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Queue daily summaries for all active users
    // In production, fetch user list from database
    const users = ['user1', 'user2'] // TODO: Replace with actual user fetch from DB

    for (const userId of users) {
      await summaryQueue.add('generate-summary', {
        userId,
        date: new Date().toISOString().split('T')[0],
      })
    }

    return NextResponse.json({ 
      success: true, 
      queued: users.length,
      message: 'Daily summaries queued successfully'
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ 
      error: 'Failed to queue daily summaries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
