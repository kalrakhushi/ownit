import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'

// GET - Fetch all health records
export async function GET() {
  try {
    const records = await db.select().from(healthRecords).orderBy(desc(healthRecords.date))
    
    // Convert to format expected by frontend
    const formattedRecords = records.map(record => ({
      id: record.id,
      date: record.date, // Already stored as ISO string
      weight: record.weight,
      steps: record.steps,
      sleep: record.sleep,
      calories: record.calories,
      protein: record.protein,
    }))
    
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
    const recordsToInsert = records.map((record: any) => ({
      date: record.date, // Store as ISO string
      weight: parseFloatSafe(record.weight),
      steps: parseIntSafe(record.steps),
      sleep: parseFloatSafe(record.sleep),
      calories: parseIntSafe(record.calories),
      protein: parseFloatSafe(record.protein),
    }))
    
    // Insert records
    const createdRecords = await db.insert(healthRecords).values(recordsToInsert).returning()
    
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
  } catch (error) {
    console.error('Error creating health records:', error)
    return NextResponse.json(
      { error: 'Failed to create health records' },
      { status: 500 }
    )
  }
}
