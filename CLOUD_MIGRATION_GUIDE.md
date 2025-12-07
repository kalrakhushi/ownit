# 🚀 Cloud Architecture Migration Guide

Complete guide to migrate OwnIt from SQLite to a full cloud architecture with Supabase, Redis, Background Workers, and Vercel Edge Functions.

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up Supabase/PostgreSQL](#step-1-supabase-postgresql)
3. [Step 2: Set Up Redis](#step-2-redis)
4. [Step 3: Configure Background Workers](#step-3-background-workers)
5. [Step 4: Set Up Vercel Edge Functions](#step-4-vercel-edge-functions)
6. [Step 5: Configure Vercel Cron Jobs](#step-5-vercel-cron-jobs)
7. [Step 6: Migration Script](#step-6-migration-script)
8. [Step 7: Environment Variables](#step-7-environment-variables)
9. [Step 8: Testing](#step-8-testing)
10. [Step 9: Deployment](#step-9-deployment)

---

## 🔧 **Prerequisites**

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ A Supabase account (free tier works)
- ✅ A Redis account (Upstash Redis recommended for serverless)
- ✅ A Vercel account
- ✅ Git repository set up

---

## 🟦 **Step 1: Set Up Supabase/PostgreSQL**

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `ownit`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 1.2 Get Connection String

1. In Supabase Dashboard → **Settings** → **Database**
2. Copy the **Connection String** (URI format)
3. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 1.3 Install PostgreSQL Dependencies

```bash
npm install @supabase/supabase-js postgres
npm install -D @types/pg
```

### 1.4 Update Drizzle Schema for PostgreSQL

Your current schema uses SQLite types. We need to convert it to PostgreSQL-compatible types.

**Create:** `drizzle/schema.postgres.ts` (new file)

```typescript
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
    metadata: text('metadata'), // JSON stored as text, or use jsonb
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
```

### 1.5 Update Database Connection

**Update:** `lib/db.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../drizzle/schema.postgres'

// Use connection pooling for better performance
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create postgres client with connection pooling
const client = postgres(connectionString, {
  max: 10, // Max connections in pool
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(client, { schema })

// Export client for raw queries if needed
export { client as postgresClient }
```

### 1.6 Update Drizzle Config

**Update:** `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './drizzle/schema.postgres.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### 1.7 Generate and Run Migrations

```bash
# Generate migration files
npm run drizzle:generate

# Push schema to Supabase (or use migrations)
npm run drizzle:push
```

---

## 🟩 **Step 2: Set Up Redis**

### 2.1 Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com)
2. Click "Create Database"
3. Choose:
   - **Name**: `ownit-redis`
   - **Type**: Regional (or Global for better latency)
   - **Region**: Same as Supabase
4. Copy the **REST API URL** and **REST API Token**

### 2.2 Install Redis Dependencies

```bash
npm install @upstash/redis @upstash/qstash
npm install ioredis  # Alternative client
```

### 2.3 Create Redis Client

**Create:** `lib/redis.ts`

```typescript
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Helper functions for common operations
export const cache = {
  // Cache health records with TTL
  async setHealthRecords(userId: string, data: any[], ttl: number = 300) {
    const key = `health:records:${userId}`
    await redis.setex(key, ttl, JSON.stringify(data))
  },

  async getHealthRecords(userId: string) {
    const key = `health:records:${userId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data as string) : null
  },

  // Cache analytics/insights
  async setAnalytics(key: string, data: any, ttl: number = 600) {
    await redis.setex(`analytics:${key}`, ttl, JSON.stringify(data))
  },

  async getAnalytics(key: string) {
    const data = await redis.get(`analytics:${key}`)
    return data ? JSON.parse(data as string) : null
  },

  // Cache streaks
  async setStreak(userId: string, streak: any, ttl: number = 3600) {
    await redis.setex(`streak:${userId}`, ttl, JSON.stringify(streak))
  },

  async getStreak(userId: string) {
    const data = await redis.get(`streak:${userId}`)
    return data ? JSON.parse(data as string) : null
  },

  // Leaderboard operations
  async addToLeaderboard(userId: string, score: number) {
    await redis.zadd('leaderboard', score, userId)
  },

  async getLeaderboard(limit: number = 10) {
    return redis.zrevrange('leaderboard', 0, limit - 1, { withScores: true })
  },

  // Invalidate cache
  async invalidate(pattern: string) {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },
}
```

### 2.4 Update API Routes to Use Redis

**Example:** Update `app/api/health-records/route.ts`

```typescript
import { cache } from '@/lib/redis'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = 'default' // Replace with actual user ID from auth
    
    // Try cache first
    const cached = await cache.getHealthRecords(userId)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch from database
    const records = await db.select().from(healthRecords).orderBy(desc(healthRecords.date))
    
    // Cache for 5 minutes
    await cache.setHealthRecords(userId, records, 300)
    
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching health records:', error)
    return NextResponse.json({ error: 'Failed to fetch health records' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // ... existing code ...
    
    // Invalidate cache after insert
    await cache.invalidate('health:records:*')
    
    return NextResponse.json(createdRecords, { status: 201 })
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 🟥 **Step 3: Configure Background Workers**

### 3.1 Install BullMQ Dependencies

```bash
npm install bullmq @upstash/qstash
```

### 3.2 Create Queue Configuration

**Create:** `lib/queue.ts`

```typescript
import { Queue, Worker } from 'bullmq'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create queues
export const analyticsQueue = new Queue('analytics', {
  connection: {
    host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '').split('.')[0] || '',
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
})

export const mlQueue = new Queue('ml-processing', {
  connection: {
    host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '').split('.')[0] || '',
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
})

export const summaryQueue = new Queue('daily-summaries', {
  connection: {
    host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '').split('.')[0] || '',
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
})

// Worker for analytics processing
export const analyticsWorker = new Worker(
  'analytics',
  async (job) => {
    const { userId, data } = job.data
    
    // Process analytics asynchronously
    // This runs in background, doesn't block API response
    console.log(`Processing analytics for user ${userId}`)
    
    // Your analytics processing logic here
    // e.g., pattern detection, risk analysis
    
    return { success: true }
  },
  {
    connection: {
      host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '').split('.')[0] || '',
      port: 6379,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
  }
)

// Worker for ML processing
export const mlWorker = new Worker(
  'ml-processing',
  async (job) => {
    const { userId, metric } = job.data
    
    // Run ML predictions asynchronously
    console.log(`Running ML predictions for ${metric}`)
    
    // Your ML processing logic here
    
    return { success: true }
  },
  {
    connection: {
      host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '').split('.')[0] || '',
      port: 6379,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
  }
)
```

### 3.3 Create Worker API Route

**Create:** `app/api/workers/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { analyticsQueue, mlQueue, summaryQueue } from '@/lib/queue'

// This endpoint is called by Vercel Cron or QStash
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case 'daily-summary':
        await summaryQueue.add('generate-summary', {
          userId: data.userId,
          date: new Date().toISOString(),
        })
        break

      case 'process-analytics':
        await analyticsQueue.add('analyze', {
          userId: data.userId,
          data: data.healthData,
        })
        break

      case 'ml-prediction':
        await mlQueue.add('predict', {
          userId: data.userId,
          metric: data.metric,
        })
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Worker error:', error)
    return NextResponse.json({ error: 'Failed to queue job' }, { status: 500 })
  }
}
```

### 3.4 Create Daily Summary Worker

**Create:** `lib/workers/daily-summary.ts`

```typescript
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'
import { cache } from '@/lib/redis'

export async function generateDailySummary(userId: string, date: string) {
  // Fetch today's data
  const todayData = await db
    .select()
    .from(healthRecords)
    .where(eq(healthRecords.date, date))

  // Calculate summary
  const summary = {
    date,
    totalSteps: todayData.reduce((sum, r) => sum + (r.steps || 0), 0),
    avgSleep: todayData.reduce((sum, r) => sum + (r.sleep || 0), 0) / todayData.length,
    totalCalories: todayData.reduce((sum, r) => sum + (r.calories || 0), 0),
    // ... more calculations
  }

  // Cache summary
  await cache.setAnalytics(`summary:${userId}:${date}`, summary, 86400)

  // Optionally send notification/email
  // await sendNotification(userId, summary)

  return summary
}
```

---

## 🟨 **Step 4: Set Up Vercel Edge Functions**

### 4.1 Create Edge Function for Fast API Responses

**Create:** `app/api/health-records/route.ts` (update existing)

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge' // Enable Edge Runtime

export async function GET(request: NextRequest) {
  // Edge functions run closer to users for faster responses
  // Use Redis cache for instant responses
  
  const userId = request.headers.get('x-user-id') || 'default'
  const cached = await cache.getHealthRecords(userId)
  
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=300',
      },
    })
  }

  // Fallback to database if cache miss
  // Note: Edge functions have limited Node.js APIs
  // For complex DB queries, use regular API routes
  return NextResponse.json({ message: 'Use regular API route for DB queries' })
}
```

### 4.2 Create Edge Function for Analytics

**Create:** `app/api/analytics/edge/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { cache } from '@/lib/redis'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') || 'default'
  
  // Fast Redis lookup from edge
  const analytics = await cache.getAnalytics(key)
  
  if (analytics) {
    return new Response(JSON.stringify(analytics), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=600',
      },
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

---

## ⏰ **Step 5: Configure Vercel Cron Jobs**

### 5.1 Create Vercel Cron Configuration

**Create:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-summary",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/process-analytics",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/update-streaks",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 5.2 Create Cron Job Handlers

**Create:** `app/api/cron/daily-summary/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { summaryQueue } from '@/lib/queue'

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Queue daily summaries for all active users
    // In production, fetch user list from database
    const users = ['user1', 'user2'] // Replace with actual user fetch

    for (const userId of users) {
      await summaryQueue.add('generate-summary', {
        userId,
        date: new Date().toISOString().split('T')[0],
      })
    }

    return NextResponse.json({ 
      success: true, 
      queued: users.length 
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

**Create:** `app/api/cron/weekly-report/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthRecords } from '@/drizzle/schema.postgres'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Generate weekly reports
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Fetch data and generate reports
    // Send emails/notifications to users
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

**Create:** `app/api/cron/update-streaks/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { updateStreaks } from '@/lib/streak-utils'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await updateStreaks()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## 📦 **Step 6: Migration Script**

**Create:** `scripts/migrate-to-postgres.ts`

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as sqliteSchema from '../drizzle/schema'
import * as pgSchema from '../drizzle/schema.postgres'

async function migrate() {
  console.log('🚀 Starting migration...')

  // Connect to SQLite
  const sqlite = new Database('./dev.db')
  const sqliteDb = drizzle(sqlite, { schema: sqliteSchema })

  // Connect to PostgreSQL
  const pgClient = postgres(process.env.DATABASE_URL!)
  const pgDb = drizzlePg(pgClient, { schema: pgSchema })

  try {
    // Migrate HealthRecords
    console.log('📊 Migrating health records...')
    const healthRecords = await sqliteDb.select().from(sqliteSchema.healthRecords)
    if (healthRecords.length > 0) {
      await pgDb.insert(pgSchema.healthRecords).values(healthRecords)
      console.log(`✅ Migrated ${healthRecords.length} health records`)
    }

    // Migrate other tables similarly...
    // (Repeat for each table)

    console.log('✅ Migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    sqlite.close()
    await pgClient.end()
  }
}

migrate()
```

---

## 🔐 **Step 7: Environment Variables**

**Update:** `.env.local` (add these)

```bash
# Supabase/PostgreSQL
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://[YOUR-REDIS-URL].upstash.io
UPSTASH_REDIS_REST_TOKEN=[YOUR-REDIS-TOKEN]

# Vercel Cron Secret (generate random string)
CRON_SECRET=your-random-secret-string-here

# Keep existing vars
GOOGLE_GENERATIVE_AI_API_KEY=...
```

**Update:** `.env.example`

```bash
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CRON_SECRET=
GOOGLE_GENERATIVE_AI_API_KEY=
```

---

## 🧪 **Step 8: Testing**

### 8.1 Test Database Connection

**Create:** `scripts/test-postgres.ts`

```typescript
import { db } from '../lib/db'
import { healthRecords } from '../drizzle/schema.postgres'

async function test() {
  try {
    const result = await db.select().from(healthRecords).limit(1)
    console.log('✅ PostgreSQL connection successful!')
    console.log('Sample record:', result)
  } catch (error) {
    console.error('❌ Connection failed:', error)
  }
}

test()
```

### 8.2 Test Redis Connection

**Create:** `scripts/test-redis.ts`

```typescript
import { redis } from '../lib/redis'

async function test() {
  try {
    await redis.set('test', 'hello')
    const value = await redis.get('test')
    console.log('✅ Redis connection successful!')
    console.log('Test value:', value)
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
  }
}

test()
```

---

## 🚀 **Step 9: Deployment**

### 9.1 Update package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "migrate": "tsx scripts/migrate-to-postgres.ts",
    "test:db": "tsx scripts/test-postgres.ts",
    "test:redis": "tsx scripts/test-redis.ts"
  }
}
```

### 9.2 Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Migrate to cloud architecture"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `DATABASE_URL`
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `CRON_SECRET`
     - `GOOGLE_GENERATIVE_AI_API_KEY`

3. **Deploy**
   - Vercel will automatically deploy
   - Cron jobs will be set up automatically from `vercel.json`

### 9.3 Verify Deployment

- ✅ Check API routes work
- ✅ Verify Redis caching
- ✅ Test cron jobs (check Vercel logs)
- ✅ Monitor Edge Function performance

---

## 📝 **Next Steps**

1. **Add Authentication** - Supabase Auth for user management
2. **Set Up Monitoring** - Vercel Analytics + Sentry
3. **Optimize Queries** - Add database indexes
4. **Scale Workers** - Add more worker types as needed
5. **Add Rate Limiting** - Protect APIs with Upstash Rate Limit

---

## 🆘 **Troubleshooting**

### Database Connection Issues
- Check `DATABASE_URL` format
- Verify Supabase project is active
- Check IP allowlist in Supabase

### Redis Connection Issues
- Verify `UPSTASH_REDIS_REST_URL` and token
- Check Upstash dashboard for status

### Cron Jobs Not Running
- Verify `vercel.json` is in root
- Check `CRON_SECRET` matches
- View Vercel function logs

### Edge Functions Limitations
- Some Node.js APIs not available
- Use regular API routes for complex operations
- Edge functions best for simple Redis lookups

---

**🎉 You're now running on a full cloud architecture!**
