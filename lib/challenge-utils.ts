/**
 * Challenge utilities for tracking progress and completion
 */

import { db } from '@/lib/db';
import { challenges, challengeProgress, rewards } from '@/drizzle/schema.postgres';
import { eq, and, desc } from 'drizzle-orm';

export interface ChallengeWithProgress {
  challenge: any;
  progress: any | null;
  progressPercent: number;
  daysRemaining: number;
  isCompleted: boolean;
}

/**
 * Calculate progress for a challenge based on health data
 */
export function calculateChallengeProgress(
  challenge: any,
  healthData: any[],
  startDate: string
): number {
  const start = new Date(startDate);
  const relevantData = healthData.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= start;
  });

  let totalProgress = 0;

  switch (challenge.type) {
    case 'steps':
      totalProgress = relevantData
        .filter((d) => d.steps)
        .reduce((sum, d) => sum + (parseInt(d.steps) || 0), 0);
      break;
    case 'sleep':
      const sleepDays = relevantData.filter((d) => d.sleep && d.sleep > 0).length;
      totalProgress = sleepDays > 0
        ? relevantData
            .filter((d) => d.sleep)
            .reduce((sum, d) => sum + (parseFloat(d.sleep) || 0), 0) / sleepDays
        : 0;
      break;
    case 'calories':
      totalProgress = relevantData
        .filter((d) => d.calories)
        .reduce((sum, d) => sum + (parseInt(d.calories) || 0), 0);
      break;
    case 'protein':
      const proteinDays = relevantData.filter((d) => d.protein && d.protein > 0).length;
      totalProgress = proteinDays > 0
        ? relevantData
            .filter((d) => d.protein)
            .reduce((sum, d) => sum + (parseFloat(d.protein) || 0), 0) / proteinDays
        : 0;
      break;
    case 'streak':
      // For streak challenges, count consecutive days
      const sortedDates = relevantData
        .map((d) => new Date(d.date).toISOString().split('T')[0])
        .sort()
        .filter((date, index, arr) => index === 0 || date !== arr[index - 1]);
      
      let maxStreak = 0;
      let currentStreak = 0;
      let lastDate: string | null = null;

      for (const date of sortedDates) {
        if (lastDate) {
          const daysDiff = Math.floor(
            (new Date(date).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        lastDate = date;
      }
      totalProgress = Math.max(maxStreak, currentStreak);
      break;
    case 'consistency':
      // Count days with at least one health metric logged
      totalProgress = relevantData.length;
      break;
    default:
      totalProgress = 0;
  }

  return totalProgress;
}

/**
 * Check if a challenge is completed
 */
export function isChallengeCompleted(progress: number, target: number, type: string): boolean {
  if (type === 'sleep' || type === 'protein') {
    // For averages, check if average meets target
    return progress >= target;
  }
  // For totals, check if total meets target
  return progress >= target;
}

/**
 * Get days remaining in challenge
 */
export function getDaysRemaining(startDate: string, duration: number): number {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + duration);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const remaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
}

/**
 * Award reward for completing a challenge
 */
export async function awardReward(challenge: any, progressId: number) {
  try {
    // Check if reward already exists
    const existingRewards = await db
      .select()
      .from(rewards)
      .where(eq(rewards.challengeId, challenge.id));

    if (existingRewards.length > 0) {
      return existingRewards[0]; // Reward already awarded
    }

    // Create reward
    const [reward] = await db
      .insert(rewards)
      .values({
        type: challenge.rewardBadge ? 'badge' : 'points',
        title: challenge.rewardBadge || `${challenge.rewardPoints} Points`,
        description: `Completed: ${challenge.title}`,
        icon: challenge.rewardBadge || '🏆',
        points: challenge.rewardPoints || 0,
        challengeId: challenge.id,
      })
      .returning();

    return reward;
  } catch (error) {
    console.error('Error awarding reward:', error);
    return null;
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  challengeId: number,
  healthData: any[]
): Promise<void> {
  try {
    // Get active progress for this challenge
    const progressRecords = await db
      .select()
      .from(challengeProgress)
      .where(
        and(
          eq(challengeProgress.challengeId, challengeId),
          eq(challengeProgress.isCompleted, false)
        )
      )
      .orderBy(desc(challengeProgress.startDate))
      .limit(1);

    if (progressRecords.length === 0) {
      return; // No active progress
    }

    const progress = progressRecords[0];
    const challenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (challenge.length === 0) {
      return;
    }

    // Calculate current progress
    const currentProgress = calculateChallengeProgress(
      challenge[0],
      healthData,
      progress.startDate
    );

    // Check if completed
    const completed = isChallengeCompleted(
      currentProgress,
      progress.targetValue,
      challenge[0].type
    );

    // Update progress
    await db
      .update(challengeProgress)
      .set({
        currentProgress,
        isCompleted: completed,
        completedDate: completed ? new Date().toISOString().split('T')[0] : null,
        updatedAt: new Date(),
      })
      .where(eq(challengeProgress.id, progress.id));

    // Award reward if completed
    if (completed && !progress.isCompleted) {
      await awardReward(challenge[0], progress.id);
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
  }
}

/**
 * Get default challenges
 */
export function getDefaultChallenges() {
  return [
    {
      title: '10K Steps Daily',
      description: 'Walk 10,000 steps every day for 7 days',
      type: 'steps',
      targetValue: 70000, // 10k * 7 days
      duration: 7,
      rewardPoints: 100,
      rewardBadge: '🚶',
      isActive: true,
    },
    {
      title: 'Sleep Champion',
      description: 'Get 7+ hours of sleep for 5 consecutive days',
      type: 'sleep',
      targetValue: 7,
      duration: 5,
      rewardPoints: 75,
      rewardBadge: '😴',
      isActive: true,
    },
    {
      title: 'Protein Power',
      description: 'Eat 100g+ protein daily for 7 days',
      type: 'protein',
      targetValue: 100,
      duration: 7,
      rewardPoints: 125,
      rewardBadge: '💪',
      isActive: true,
    },
    {
      title: 'Consistency King',
      description: 'Log health data for 14 consecutive days',
      type: 'consistency',
      targetValue: 14,
      duration: 14,
      rewardPoints: 150,
      rewardBadge: '👑',
      isActive: true,
    },
    {
      title: 'Calorie Counter',
      description: 'Track calories for 7 days straight',
      type: 'calories',
      targetValue: 7, // 7 days of tracking
      duration: 7,
      rewardPoints: 50,
      rewardBadge: '📊',
      isActive: true,
    },
  ];
}
