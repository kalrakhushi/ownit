import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords } from '@/drizzle/schema.postgres';
import { desc } from 'drizzle-orm';
import { detectAllPatterns } from '@/lib/pattern-detection';
import { getCachedOrCompute, CACHE_TTL } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    // Cache patterns for 1 minute
    const result = await getCachedOrCompute(
      'analytics:patterns',
      CACHE_TTL.ANALYTICS,
      async () => {
        // Fetch all health records
        const records = await db
          .select()
          .from(healthRecords)
          .orderBy(desc(healthRecords.date))
          .limit(100); // Get last 100 records for pattern detection

        if (records.length < 5) {
          return {
            patterns: [],
            message: 'Need at least 5 data points to detect patterns',
          };
        }

        // Detect all patterns
        const patterns = detectAllPatterns(records);

        return {
          patterns,
          dataPoints: records.length,
        };
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error detecting patterns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to detect patterns' },
      { status: 500 }
    );
  }
}
