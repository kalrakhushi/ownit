import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords } from '@/drizzle/schema.postgres';
import { desc } from 'drizzle-orm';
import { compareAllMetrics } from '@/lib/comparison-utils';

export async function GET(request: NextRequest) {
  try {
    const days = parseInt(request.nextUrl.searchParams.get('days') || '7');
    
    // Fetch health records
    const records = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date))
      .limit(days * 2 + 7); // Get enough data for both periods

    if (records.length < days * 2) {
      return NextResponse.json({
        comparisons: [],
        message: `Need at least ${days * 2} days of data for comparison`,
        dataPoints: records.length,
      });
    }

    // Compare all metrics
    const comparisons = compareAllMetrics(records, days);

    return NextResponse.json({
      comparisons,
      dataPoints: records.length,
      period: `${days} days`,
    });
  } catch (error: any) {
    console.error('Error generating comparison:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}
