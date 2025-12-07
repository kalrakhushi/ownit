import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { challenges, challengeProgress, rewards, healthRecords } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  calculateChallengeProgress,
  getDaysRemaining,
  getDefaultChallenges,
  updateChallengeProgress,
} from '@/lib/challenge-utils';

// GET - Fetch all challenges with progress
export async function GET(request: NextRequest) {
  try {
    const includeCompleted = request.nextUrl.searchParams.get('includeCompleted') === 'true';

    // Get all active challenges
    let allChallenges = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(desc(challenges.createdAt));

    // If no challenges exist, create default ones
    if (allChallenges.length === 0) {
      const defaultChallenges = getDefaultChallenges();
      await db.insert(challenges).values(defaultChallenges);
      allChallenges = await db
        .select()
        .from(challenges)
        .where(eq(challenges.isActive, true))
        .orderBy(desc(challenges.createdAt));
    }

    // Get health data for progress calculation
    const healthData = await db
      .select()
      .from(healthRecords)
      .orderBy(desc(healthRecords.date));

    // Get all progress records
    const allProgress = await db
      .select()
      .from(challengeProgress)
      .orderBy(desc(challengeProgress.startDate));

    // Get all rewards
    const allRewards = await db
      .select()
      .from(rewards)
      .orderBy(desc(rewards.earnedDate));

    // Calculate total points
    const totalPoints = allRewards.reduce((sum, r) => sum + (r.points || 0), 0);

    // Build challenge list with progress
    const challengesWithProgress = allChallenges.map((challenge) => {
      // Find active progress for this challenge
      const progress = allProgress.find(
        (p) => p.challengeId === challenge.id && !p.isCompleted
      );

      // Find completed progress
      const completedProgress = allProgress.find(
        (p) => p.challengeId === challenge.id && p.isCompleted
      );

      // Find reward for this challenge
      const reward = allRewards.find((r) => r.challengeId === challenge.id);

      let progressPercent = 0;
      let daysRemaining = challenge.duration;
      let currentProgress = 0;

      if (progress) {
        // Update progress based on current health data
        currentProgress = calculateChallengeProgress(
          challenge,
          healthData,
          progress.startDate
        );
        progressPercent = Math.min(100, (currentProgress / progress.targetValue) * 100);
        daysRemaining = getDaysRemaining(progress.startDate, challenge.duration);

        // Update progress in database
        updateChallengeProgress(challenge.id, healthData);
      } else if (completedProgress) {
        progressPercent = 100;
        daysRemaining = 0;
        currentProgress = completedProgress.currentProgress;
      }

      return {
        challenge,
        progress: progress || completedProgress || null,
        currentProgress,
        progressPercent: Math.round(progressPercent),
        daysRemaining,
        isCompleted: !!completedProgress,
        reward: reward || null,
      };
    });

    // Filter out completed challenges if not requested
    const filteredChallenges = includeCompleted
      ? challengesWithProgress
      : challengesWithProgress.filter((c) => !c.isCompleted || c.progress === null);

    return NextResponse.json({
      challenges: filteredChallenges,
      totalPoints,
      rewards: allRewards,
    });
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

// POST - Start a new challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    // Get challenge
    const challenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (challenge.length === 0) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if already in progress
    const existingProgress = await db
      .select()
      .from(challengeProgress)
      .where(
        and(
          eq(challengeProgress.challengeId, challengeId),
          eq(challengeProgress.isCompleted, false)
        )
      )
      .limit(1);

    if (existingProgress.length > 0) {
      return NextResponse.json(
        { error: 'Challenge already in progress', progress: existingProgress[0] },
        { status: 400 }
      );
    }

    // Create new progress
    const today = new Date().toISOString().split('T')[0];
    const [progress] = await db
      .insert(challengeProgress)
      .values({
        challengeId,
        startDate: today,
        currentProgress: 0,
        targetValue: challenge[0].targetValue,
        isCompleted: false,
      })
      .returning();

    return NextResponse.json(progress, { status: 201 });
  } catch (error: any) {
    console.error('Error starting challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start challenge' },
      { status: 500 }
    );
  }
}
