import { sqliteTable, integer, real, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const healthRecords = sqliteTable('HealthRecord', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // Store as ISO string for easier handling
  weight: real('weight'),
  steps: integer('steps'),
  sleep: real('sleep'),
  calories: integer('calories'),
  protein: real('protein'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

export const wearableSamples = sqliteTable(
  'WearableSample',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    source: text('source').notNull(), // e.g., apple_health, fitbit
    type: text('type').notNull(), // e.g., steps, calories, sleep, heart_rate
    startTime: text('startTime').notNull(), // ISO string
    endTime: text('endTime').notNull(), // ISO string
    value: real('value').notNull(),
    unit: text('unit'),
    metadata: text('metadata'), // JSON string for extra attributes (e.g., device name)
    createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
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

export const streaks = sqliteTable('Streak', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  currentStreak: integer('currentStreak').default(0).notNull(),
  longestStreak: integer('longestStreak').default(0).notNull(),
  lastActiveDate: text('lastActiveDate'), // ISO date string
  streakStartDate: text('streakStartDate'), // ISO date string - when current streak started
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

export const calendar = sqliteTable('Calendar', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD format)
  title: text('title'),
  description: text('description'),
  eventType: text('eventType'), // e.g., 'goal', 'reminder', 'milestone', 'custom'
  color: text('color'), // Optional color for UI display (hex code or color name)
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

export const moodEntries = sqliteTable('MoodEntry', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD format)
  mood: integer('mood').notNull(), // 1-10 scale (1 = very low, 10 = very high)
  energy: integer('energy'), // 1-10 scale (optional)
  stress: integer('stress'), // 1-10 scale (optional)
  reflection: text('reflection'), // Free-form text reflection
  tags: text('tags'), // Comma-separated tags (e.g., "happy,productive,exercise")
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

export const challenges = sqliteTable('Challenge', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'steps', 'sleep', 'calories', 'protein', 'streak', 'consistency'
  targetValue: real('targetValue').notNull(), // Target value to achieve
  duration: integer('duration').notNull(), // Duration in days
  rewardPoints: integer('rewardPoints').default(0).notNull(), // Points awarded on completion
  rewardBadge: text('rewardBadge'), // Badge name/icon
  isActive: integer('isActive', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

export const challengeProgress = sqliteTable('ChallengeProgress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  challengeId: integer('challengeId').notNull(), // References Challenge.id
  startDate: text('startDate').notNull(), // ISO date string
  currentProgress: real('currentProgress').default(0).notNull(), // Current progress toward target
  targetValue: real('targetValue').notNull(), // Target value (copied from challenge)
  isCompleted: integer('isCompleted', { mode: 'boolean' }).default(false).notNull(),
  completedDate: text('completedDate'), // ISO date string when completed
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

export const rewards = sqliteTable('Reward', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // 'badge', 'points', 'achievement'
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'), // Icon name or emoji
  points: integer('points').default(0).notNull(), // Points awarded
  challengeId: integer('challengeId'), // Optional: linked to challenge
  earnedDate: integer('earnedDate', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

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
