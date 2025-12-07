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

export type HealthRecord = typeof healthRecords.$inferSelect
export type NewHealthRecord = typeof healthRecords.$inferInsert
