import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'
import { desc } from 'drizzle-orm'
import { updateStreaks } from '@/lib/streak-utils'
import { getCachedOrCompute, cacheKeys, CACHE_TTL, invalidateCache } from '@/lib/redis'

// GET - Fetch all health records
export async function GET() {
  try {
    // Cache health records for 30 seconds
    const formattedRecords = await getCachedOrCompute(
      cacheKeys.healthRecords(),
      CACHE_TTL.HEALTH_RECORDS,
      async () => {
        const records = await db.select().from(healthRecords).orderBy(desc(healthRecords.date))
        
        // Convert to format expected by frontend
        return records.map(record => ({
          id: record.id,
          date: record.date, // Already stored as ISO string
          weight: record.weight,
          steps: record.steps,
          sleep: record.sleep,
          calories: record.calories,
          protein: record.protein,
        }))
      }
    )
    
    return NextResponse.json(formattedRecords)
  } catch (error) {
    console.error('Error fetching health records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health records' },
      { status: 500 }
    )
  }
}

// POST - Create one or more health records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both single record and array of records
    const records = Array.isArray(body) ? body : [body]
    
    // Helper function to safely parse numbers
    const parseFloatSafe = (val: any): number | null => {
      if (val === null || val === undefined || val === '') return null
      const parsed = typeof val === 'number' ? val : parseFloat(val)
      return isNaN(parsed) ? null : parsed
    }
    
    const parseIntSafe = (val: any): number | null => {
      if (val === null || val === undefined || val === '') return null
      const parsed = typeof val === 'number' ? val : parseInt(val)
      return isNaN(parsed) ? null : parsed
    }
    
    // Prepare data for insertion
    const recordsToInsert = records.map((record: any) => {
      // Validate and format date
      let dateValue = record.date
      if (!dateValue) {
        throw new Error('Date is required for all health records')
      }
      
      // Ensure date is in YYYY-MM-DD format (ISO date string)
      // If date comes in different format, try to parse it
      if (typeof dateValue === 'string') {
        // Check if it's already in ISO format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          // Try to parse other formats
          const parsedDate = new Date(dateValue)
          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid date format: ${dateValue}. Expected YYYY-MM-DD format.`)
          }
          dateValue = parsedDate.toISOString().split('T')[0]
        }
      }
      
      return {
        date: dateValue,
        weight: parseFloatSafe(record.weight),
        steps: parseIntSafe(record.steps),
        sleep: parseFloatSafe(record.sleep),
        calories: parseIntSafe(record.calories),
        protein: parseFloatSafe(record.protein),
      }
    })
    
    // Insert records
    const createdRecords = await db.insert(healthRecords).values(recordsToInsert).returning()
    
    // Update streaks after adding new records (don't fail if this errors)
    try {
      await updateStreaks()
    } catch (streakError: any) {
      console.error('Error updating streaks (non-critical):', streakError?.message)
      // Continue even if streak update fails
    }
    
    // Invalidate relevant caches when new data is added (don't fail if this errors)
    try {
      await Promise.all([
        invalidateCache(cacheKeys.healthRecords()),
        invalidateCache('analytics:patterns'),
        invalidateCache(cacheKeys.streaks()),
        // Invalidate all prediction caches (they have dynamic keys)
        invalidateCache('analytics:predictions:all:14'),
        invalidateCache('analytics:predictions:steps:14'),
        invalidateCache('analytics:predictions:sleep:14'),
        invalidateCache('analytics:predictions:calories:14'),
        invalidateCache('analytics:predictions:weight:14'),
      ])
    } catch (cacheError: any) {
      console.error('Error invalidating cache (non-critical):', cacheError?.message)
      // Continue even if cache invalidation fails
    }
    
    // Track analytics event (on server, we'll use a marker in response)
    // Client will track the actual event
    console.log('[Analytics] Health records added:', {
      count: createdRecords.length,
      hasWeight: recordsToInsert.some(r => r.weight !== null),
      hasSteps: recordsToInsert.some(r => r.steps !== null),
      hasSleep: recordsToInsert.some(r => r.sleep !== null),
      hasCalories: recordsToInsert.some(r => r.calories !== null),
    })
    
    // Format response
    const formattedRecords = createdRecords.map((record) => ({
      id: record.id,
      date: record.date,
      weight: record.weight,
      steps: record.steps,
      sleep: record.sleep,
      calories: record.calories,
      protein: record.protein,
    }))
    
    return NextResponse.json(
      Array.isArray(body) ? formattedRecords : formattedRecords[0],
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating health records:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      detail: error?.detail,
    })
    
    // Provide helpful error message without exposing sensitive details
    let errorMessage = 'Failed to create health records'
    if (error?.message) {
      // Show user-friendly error messages
      if (error.message.includes('Date is required')) {
        errorMessage = 'Date is required for all health records'
      } else if (error.message.includes('Invalid date format')) {
        errorMessage = error.message
      } else if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'Database connection error. Please check configuration.'
      } else if (process.env.NODE_ENV === 'development') {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
