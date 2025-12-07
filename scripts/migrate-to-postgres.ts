import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as sqliteSchema from '../drizzle/schema'
import * as pgSchema from '../drizzle/schema.postgres'

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...')

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('Please set DATABASE_URL to your PostgreSQL connection string')
    process.exit(1)
  }

  // Connect to SQLite
  const sqlite = new Database('./dev.db')
  const sqliteDb = drizzle(sqlite, { schema: sqliteSchema })

  // Connect to PostgreSQL
  const pgClient = postgres(process.env.DATABASE_URL)
  const pgDb = drizzlePg(pgClient, { schema: pgSchema })

  try {
    console.log('📊 Migrating health records...')
    const healthRecordsData = await sqliteDb.select().from(sqliteSchema.healthRecords)
    if (healthRecordsData.length > 0) {
      // Convert SQLite timestamps to PostgreSQL format
      const convertedRecords = healthRecordsData.map(record => ({
        ...record,
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.healthRecords).values(convertedRecords)
      console.log(`✅ Migrated ${healthRecordsData.length} health records`)
    } else {
      console.log('ℹ️  No health records to migrate')
    }

    console.log('📊 Migrating wearable samples...')
    const wearableData = await sqliteDb.select().from(sqliteSchema.wearableSamples)
    if (wearableData.length > 0) {
      const convertedWearables = wearableData.map(record => ({
        ...record,
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.wearableSamples).values(convertedWearables)
      console.log(`✅ Migrated ${wearableData.length} wearable samples`)
    } else {
      console.log('ℹ️  No wearable samples to migrate')
    }

    console.log('📊 Migrating streaks...')
    const streaksData = await sqliteDb.select().from(sqliteSchema.streaks)
    if (streaksData.length > 0) {
      const convertedStreaks = streaksData.map(record => ({
        ...record,
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.streaks).values(convertedStreaks)
      console.log(`✅ Migrated ${streaksData.length} streak records`)
    } else {
      console.log('ℹ️  No streaks to migrate')
    }

    console.log('📊 Migrating calendar entries...')
    const calendarData = await sqliteDb.select().from(sqliteSchema.calendar)
    if (calendarData.length > 0) {
      const convertedCalendar = calendarData.map(record => ({
        ...record,
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.calendar).values(convertedCalendar)
      console.log(`✅ Migrated ${calendarData.length} calendar entries`)
    } else {
      console.log('ℹ️  No calendar entries to migrate')
    }

    console.log('📊 Migrating mood entries...')
    const moodData = await sqliteDb.select().from(sqliteSchema.moodEntries)
    if (moodData.length > 0) {
      const convertedMood = moodData.map(record => ({
        ...record,
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.moodEntries).values(convertedMood)
      console.log(`✅ Migrated ${moodData.length} mood entries`)
    } else {
      console.log('ℹ️  No mood entries to migrate')
    }

    console.log('📊 Migrating challenges...')
    const challengesData = await sqliteDb.select().from(sqliteSchema.challenges)
    if (challengesData.length > 0) {
      const convertedChallenges = challengesData.map(record => ({
        ...record,
        isActive: Boolean(record.isActive),
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.challenges).values(convertedChallenges)
      console.log(`✅ Migrated ${challengesData.length} challenges`)
    } else {
      console.log('ℹ️  No challenges to migrate')
    }

    console.log('📊 Migrating challenge progress...')
    const progressData = await sqliteDb.select().from(sqliteSchema.challengeProgress)
    if (progressData.length > 0) {
      const convertedProgress = progressData.map(record => ({
        ...record,
        isCompleted: Boolean(record.isCompleted),
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.challengeProgress).values(convertedProgress)
      console.log(`✅ Migrated ${progressData.length} challenge progress records`)
    } else {
      console.log('ℹ️  No challenge progress to migrate')
    }

    console.log('📊 Migrating rewards...')
    const rewardsData = await sqliteDb.select().from(sqliteSchema.rewards)
    if (rewardsData.length > 0) {
      const convertedRewards = rewardsData.map(record => ({
        ...record,
        earnedDate: record.earnedDate ? new Date(record.earnedDate) : new Date(),
        createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
      }))
      await pgDb.insert(pgSchema.rewards).values(convertedRewards)
      console.log(`✅ Migrated ${rewardsData.length} rewards`)
    } else {
      console.log('ℹ️  No rewards to migrate')
    }

    console.log('\n✅ Migration complete!')
    console.log('🎉 All data has been migrated to PostgreSQL')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    sqlite.close()
    await pgClient.end()
  }
}

migrate()
  .then(() => {
    console.log('Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })
