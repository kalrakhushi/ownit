import { pgTable, serial, integer, real, text, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const healthRecords = pgTable('HealthRecord', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  weight: real('weight'),
  steps: integer('steps'),
  sleep: real('sleep'),
  calories: integer('calories'),
  protein: real('protein'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const wearableSamples = pgTable(
  'WearableSample',
  {
    id: serial('id').primaryKey(),
    source: text('source').notNull(),
    type: text('type').notNull(),
    startTime: text('startTime').notNull(),
    endTime: text('endTime').notNull(),
    value: real('value').notNull(),
    unit: text('unit'),
    metadata: text('metadata'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => ({
    uniqueSample: uniqueIndex('wearable_sample_unique').on(
      table.source,
      table.type,
      table.startTime,
      table.endTime,
    ),
  }),
)

export const streaks = pgTable('Streak', {
  id: serial('id').primaryKey(),
  currentStreak: integer('currentStreak').default(0).notNull(),
  longestStreak: integer('longestStreak').default(0).notNull(),
  lastActiveDate: text('lastActiveDate'),
  streakStartDate: text('streakStartDate'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const calendar = pgTable('Calendar', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  title: text('title'),
  description: text('description'),
  eventType: text('eventType'),
  color: text('color'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const moodEntries = pgTable('MoodEntry', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  mood: integer('mood').notNull(),
  energy: integer('energy'),
  stress: integer('stress'),
  reflection: text('reflection'),
  tags: text('tags'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const challenges = pgTable('Challenge', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(),
  targetValue: real('targetValue').notNull(),
  duration: integer('duration').notNull(),
  rewardPoints: integer('rewardPoints').default(0).notNull(),
  rewardBadge: text('rewardBadge'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const challengeProgress = pgTable('ChallengeProgress', {
  id: serial('id').primaryKey(),
  challengeId: integer('challengeId').notNull(),
  startDate: text('startDate').notNull(),
  currentProgress: real('currentProgress').default(0).notNull(),
  targetValue: real('targetValue').notNull(),
  isCompleted: boolean('isCompleted').default(false).notNull(),
  completedDate: text('completedDate'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const rewards = pgTable('Reward', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  points: integer('points').default(0).notNull(),
  challengeId: integer('challengeId'),
  earnedDate: timestamp('earnedDate').defaultNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

// Export types
export type HealthRecord = typeof healthRecords.$inferSelect
export type NewHealthRecord = typeof healthRecords.$inferInsert
export type WearableSample = typeof wearableSamples.$inferSelect
export type NewWearableSample = typeof wearableSamples.$inferInsert
export type Streak = typeof streaks.$inferSelect
export type NewStreak = typeof streaks.$inferInsert
export type Calendar = typeof calendar.$inferSelect
export type NewCalendar = typeof calendar.$inferInsert
export type MoodEntry = typeof moodEntries.$inferSelect
export type NewMoodEntry = typeof moodEntries.$inferInsert
export type Challenge = typeof challenges.$inferSelect
export type NewChallenge = typeof challenges.$inferInsert
export type ChallengeProgress = typeof challengeProgress.$inferSelect
export type NewChallengeProgress = typeof challengeProgress.$inferInsert
export type Reward = typeof rewards.$inferSelect
export type NewReward = typeof rewards.$inferInsert
