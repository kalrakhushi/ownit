import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords } from '@/drizzle/schema.postgres';
import { desc } from 'drizzle-orm';
import {
  predictSteps,
  predictSleep,
  predictCaloriesFromSleep,
  predictWeightChange,
} from '@/lib/prediction-utils';
import { getCachedOrCompute, CACHE_TTL } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const metric = request.nextUrl.searchParams.get('metric') || 'all';
    const days = parseInt(request.nextUrl.searchParams.get('days') || '14');

    // Cache predictions with metric in key
    const result = await getCachedOrCompute(
      `analytics:predictions:${metric}:${days}`,
      CACHE_TTL.ANALYTICS,
      async () => {
        // Fetch health records
        const records = await db
          .select()
          .from(healthRecords)
          .orderBy(desc(healthRecords.date))
          .limit(30); // Get last 30 days

        if (records.length === 0) {
          return {
            error: 'No health data available',
            predictions: [],
          };
        }

        const predictions: any = {};

        if (metric === 'all' || metric === 'steps') {
          predictions.steps = predictSteps(records);
        }

        if (metric === 'all' || metric === 'sleep') {
          predictions.sleep = predictSleep(records);
        }

        if (metric === 'all' || metric === 'calories') {
          const caloriesPrediction = predictCaloriesFromSleep(records);
          if (caloriesPrediction) {
            predictions.calories = caloriesPrediction;
          }
        }

        if (metric === 'all' || metric === 'weight') {
          const weightPrediction = predictWeightChange(records);
          if (weightPrediction) {
            predictions.weight = weightPrediction;
          }
        }

        return {
          predictions,
          dataPoints: records.length,
        };
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
