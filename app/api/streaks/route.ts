import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { streaks } from '@/drizzle/schema.postgres'
import { updateStreaks, calculateStreaks } from '@/lib/streak-utils'
import { healthRecords } from '@/drizzle/schema.postgres'
import { eq } from 'drizzle-orm'
import { getCachedOrCompute, cacheKeys, CACHE_TTL, leaderboard } from '@/lib/redis'

// GET - Fetch current streak data
export async function GET() {
  try {
    // Use Redis cache for streaks (5 min TTL)
    const result = await getCachedOrCompute(
      cacheKeys.streaks(),
      CACHE_TTL.STREAKS,
      async () => {
        // Get existing streak record
        const existingStreak = await db.select().from(streaks).limit(1)
        
        // Also get all health records to build calendar
        const records = await db.select().from(healthRecords).orderBy(healthRecords.date)
        
        // Get unique dates for calendar
        const activeDates = new Set<string>()
        records.forEach(record => {
          const dateStr = record.date.split('T')[0]
          activeDates.add(dateStr)
        })
        
        // Recalculate streaks to ensure accuracy
        const streakData = await calculateStreaks()
        
        // Update database if needed
        if (existingStreak.length > 0) {
          await db
            .update(streaks)
            .set({
              currentStreak: streakData.currentStreak,
              longestStreak: Math.max(existingStreak[0].longestStreak, streakData.longestStreak),
              lastActiveDate: streakData.lastActiveDate,
              streakStartDate: streakData.streakStartDate,
              updatedAt: new Date(),
            })
            .where(eq(streaks.id, existingStreak[0].id))
        } else {
          await db.insert(streaks).values({
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            lastActiveDate: streakData.lastActiveDate,
            streakStartDate: streakData.streakStartDate,
          })
        }
        
        // Update leaderboard with current streak
        await leaderboard.updateScore('streaks', 'user', streakData.currentStreak)
        
        // Build calendar data (last 90 days)
        const calendar: Array<{ date: string; active: boolean }> = []
        const today = new Date()
        
        for (let i = 89; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          calendar.push({
            date: dateStr,
            active: activeDates.has(dateStr),
          })
        }
        
        return {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActiveDate: streakData.lastActiveDate,
          streakStartDate: streakData.streakStartDate,
          calendar,
        }
      }
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching streaks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streaks' },
      { status: 500 }
    )
  }
}
