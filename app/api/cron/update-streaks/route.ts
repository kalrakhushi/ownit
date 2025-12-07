import { NextRequest, NextResponse } from 'next/server'
import { updateStreaks } from '@/lib/streak-utils'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await updateStreaks()
    return NextResponse.json({ 
      success: true,
      message: 'Streaks updated successfully'
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ 
      error: 'Failed to update streaks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
