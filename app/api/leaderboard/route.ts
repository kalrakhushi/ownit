import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'
import { desc, sql } from 'drizzle-orm'
import { leaderboard, getCachedOrCompute, CACHE_TTL } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || 'steps'
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')

    // Cache leaderboard for 10 minutes
    const result = await getCachedOrCompute(
      `leaderboard:${type}:${limit}`,
      CACHE_TTL.LEADERBOARD,
      async () => {
        // Get leaderboard from Redis
        const topUsers = await leaderboard.getTop(type, limit)
        
        // If leaderboard is empty, populate it from database
        if (topUsers.length === 0) {
          await populateLeaderboard(type)
          // Get it again after populating
          return await leaderboard.getTop(type, limit)
        }
        
        return topUsers
      }
    )

    return NextResponse.json({
      type,
      leaderboard: result,
      total: result.length,
    })
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

// Helper function to populate leaderboard from database
async function populateLeaderboard(type: string) {
  try {
    // For now, we'll use a single user "user"
    // In a multi-user app, you'd loop through all users
    const records = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date))
      .limit(30)

    if (records.length === 0) return

    let score = 0
    
    switch (type) {
      case 'steps':
        // Total steps in last 30 days
        score = records.reduce((sum, r) => sum + (r.steps || 0), 0)
        break
      
      case 'sleep':
        // Average sleep hours
        const avgSleep = records.reduce((sum, r) => sum + (r.sleep || 0), 0) / records.length
        score = Math.round(avgSleep * 100) // Store as integer (sleep * 100)
        break
      
      case 'calories':
        // Total calories burned in last 30 days
        score = records.reduce((sum, r) => sum + (r.calories || 0), 0)
        break
      
      case 'weight-loss':
        // Weight lost (first - last)
        if (records.length >= 2) {
          const firstWeight = records[records.length - 1].weight || 0
          const lastWeight = records[0].weight || 0
          score = Math.round((firstWeight - lastWeight) * 100) // Store as integer
        }
        break
      
      default:
        score = 0
    }

    // Update leaderboard
    await leaderboard.updateScore(type, 'user', score)
  } catch (error) {
    console.error('Error populating leaderboard:', error)
  }
}

// POST - Update user's leaderboard score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId = 'user', score } = body

    if (!type || score === undefined) {
      return NextResponse.json(
        { error: 'type and score are required' },
        { status: 400 }
      )
    }

    // Update leaderboard
    await leaderboard.updateScore(type, userId, score)

    // Get user's new rank
    const userRank = await leaderboard.getUserRank(type, userId)

    return NextResponse.json({
      success: true,
      userId,
      type,
      score,
      rank: userRank.rank,
    })
  } catch (error: any) {
    console.error('Error updating leaderboard:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update leaderboard' },
      { status: 500 }
    )
  }
}
