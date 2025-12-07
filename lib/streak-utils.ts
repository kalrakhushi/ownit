import { db } from './db'
import { healthRecords, streaks } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

/**
 * Calculate streaks based on health records
 * Returns current streak, longest streak, and dates
 */
export async function calculateStreaks() {
  // Get all health records, ordered by date
  const records = await db.select().from(healthRecords).orderBy(healthRecords.date)
  
  if (records.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakStartDate: null,
    }
  }

  // Get unique dates (normalize to YYYY-MM-DD format)
  const activeDates = new Set<string>()
  records.forEach(record => {
    const dateStr = record.date.split('T')[0] // Extract YYYY-MM-DD
    activeDates.add(dateStr)
  })

  const sortedDates = Array.from(activeDates).sort()
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate current streak (working backwards from today)
  let currentStreak = 0
  let streakStartDate: string | null = null
  let lastActiveDate: string | null = sortedDates[sortedDates.length - 1] || null
  
  // Check if today or yesterday has activity
  const checkDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  // Start from today and work backwards
  let currentDate = new Date()
  let consecutiveDays = 0
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    
    if (activeDates.has(dateStr)) {
      consecutiveDays++
      if (streakStartDate === null) {
        streakStartDate = dateStr
      }
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // If we haven't started counting yet and today has no data, check yesterday
      if (consecutiveDays === 0 && dateStr === today) {
        currentDate.setDate(currentDate.getDate() - 1)
        continue
      }
      // Streak broken
      break
    }
    
    // Safety check to prevent infinite loop
    if (consecutiveDays > 10000) break
  }
  
  currentStreak = consecutiveDays

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = checkDate(sortedDates[i - 1])
      const currDate = checkDate(sortedDates[i])
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        // Consecutive day
        tempStreak++
      } else {
        // Gap found, reset streak
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
    streakStartDate: currentStreak > 0 ? streakStartDate : null,
  }
}

/**
 * Update or create streak record in database
 */
export async function updateStreaks() {
  const streakData = await calculateStreaks()
  
  // Check if streak record exists
  const existingStreak = await db.select().from(streaks).limit(1)
  
  if (existingStreak.length > 0) {
    // Update existing streak
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
    // Create new streak record
    await db.insert(streaks).values({
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastActiveDate: streakData.lastActiveDate,
      streakStartDate: streakData.streakStartDate,
    })
  }
  
  return streakData
}
