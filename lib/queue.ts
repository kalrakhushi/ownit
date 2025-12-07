import { Queue, Worker } from 'bullmq'

// Note: For serverless environments, consider using QStash instead of BullMQ
// BullMQ requires a persistent Redis connection which may not work in serverless
// This is a basic setup - adjust based on your deployment model

const redisConfig = {
  host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '').split('.')[0] || '',
  port: 6379,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
}

// Create queues
export const analyticsQueue = new Queue('analytics', {
  connection: redisConfig,
})

export const mlQueue = new Queue('ml-processing', {
  connection: redisConfig,
})

export const summaryQueue = new Queue('daily-summaries', {
  connection: redisConfig,
})

// Worker for analytics processing
// Note: Workers need to run in a separate process/container
// For Vercel serverless, use QStash or Vercel Cron + API routes instead
export const analyticsWorker = new Worker(
  'analytics',
  async (job) => {
    const { userId, data } = job.data
    
    console.log(`Processing analytics for user ${userId}`)
    
    // Your analytics processing logic here
    // e.g., pattern detection, risk analysis
    
    return { success: true }
  },
  {
    connection: redisConfig,
  }
)

// Worker for ML processing
export const mlWorker = new Worker(
  'ml-processing',
  async (job) => {
    const { userId, metric } = job.data
    
    console.log(`Running ML predictions for ${metric}`)
    
    // Your ML processing logic here
    
    return { success: true }
  },
  {
    connection: redisConfig,
  }
)

// For serverless/Vercel: Use API routes + QStash instead
// See app/api/workers/route.ts for serverless approach
