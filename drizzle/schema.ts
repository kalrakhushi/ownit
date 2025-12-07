import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core'
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

export const streaks = sqliteTable('Streak', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  currentStreak: integer('currentStreak').default(0).notNull(),
  longestStreak: integer('longestStreak').default(0).notNull(),
  lastActiveDate: text('lastActiveDate'), // ISO date string
  streakStartDate: text('streakStartDate'), // ISO date string - when current streak started
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

export type HealthRecord = typeof healthRecords.$inferSelect
export type NewHealthRecord = typeof healthRecords.$inferInsert
export type Streak = typeof streaks.$inferSelect
export type NewStreak = typeof streaks.$inferInsert
