import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { detectAllRisks } from '@/lib/risk-detection';

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '30');
    
    // Fetch health records
    const records = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date))
      .limit(limit);

    // Detect all risks
    const alerts = detectAllRisks(records);

    return NextResponse.json({
      alerts,
      dataPoints: records.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error detecting risks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to detect risks' },
      { status: 500 }
    );
  }
}
