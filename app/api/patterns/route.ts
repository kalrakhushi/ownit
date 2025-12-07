import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { detectAllPatterns } from '@/lib/pattern-detection';

export async function GET(request: NextRequest) {
  try {
    // Fetch all health records
    const records = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date))
      .limit(100); // Get last 100 records for pattern detection

    if (records.length < 5) {
      return NextResponse.json({
        patterns: [],
        message: 'Need at least 5 data points to detect patterns',
      });
    }

    // Detect all patterns
    const patterns = detectAllPatterns(records);

    return NextResponse.json({
      patterns,
      dataPoints: records.length,
    });
  } catch (error: any) {
    console.error('Error detecting patterns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to detect patterns' },
      { status: 500 }
    );
  }
}
