import { Redis } from '@upstash/redis'

// Lazy initialization - only connect when actually used (at runtime, not build time)
let redisInstance: Redis | null = null

function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (!url || !token) {
      console.warn('Redis environment variables not set. Caching will be disabled.')
      // Create a mock Redis instance that fails gracefully
      redisInstance = new Redis({
        url: '',
        token: '',
      })
    } else {
      redisInstance = new Redis({
        url,
        token,
      })
    }
  }
  return redisInstance
}

// Export lazy getter
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    return getRedis()[prop as keyof Redis]
  }
})

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  ANALYTICS: 60, // 1 minute - analytics change frequently
  STREAKS: 300, // 5 minutes - recalculate streaks less often
  LEADERBOARD: 600, // 10 minutes - leaderboard can be slightly stale
  HEALTH_RECORDS: 30, // 30 seconds - recent health data
} as const

// Cache key generators
export const cacheKeys = {
  analytics: (userId?: string) => `analytics:${userId || 'global'}`,
  streaks: (userId?: string) => `streaks:${userId || 'user'}`,
  leaderboard: (type: string) => `leaderboard:${type}`,
  healthRecords: (userId?: string, limit?: number) => 
    `health:${userId || 'user'}:${limit || 10}`,
} as const

// Helper function to get cached data or compute if missing
export async function getCachedOrCompute<T>(
  key: string,
  ttl: number,
  computeFn: () => Promise<T>
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get<T>(key)
    if (cached !== null) {
      console.log(`Cache hit: ${key}`)
      return cached
    }

    console.log(`Cache miss: ${key}`)
    // Compute the value
    const value = await computeFn()
    
    // Store in cache
    await redis.setex(key, ttl, value)
    
    return value
  } catch (error) {
    console.error('Redis error, falling back to compute:', error)
    // If Redis fails, just compute without caching
    return computeFn()
  }
}

// Invalidate cache helper
export async function invalidateCache(pattern: string) {
  try {
    // For Upstash REST API, we'll use a simple delete
    // In production, you might want to use SCAN for pattern matching
    await redis.del(pattern)
    console.log(`Cache invalidated: ${pattern}`)
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}

// Leaderboard helpers using Redis Sorted Sets
export const leaderboard = {
  // Add/update user score
  async updateScore(type: string, userId: string, score: number) {
    const key = `leaderboard:${type}`
    await redis.zadd(key, { score, member: userId })
  },

  // Get top N users
  async getTop(type: string, limit: number = 10) {
    const key = `leaderboard:${type}`
    // ZREVRANGE returns highest scores first
    const results = await redis.zrange(key, 0, limit - 1, { 
      rev: true, 
      withScores: true 
    })
    
    // Format results
    const leaderboard: Array<{ userId: string; score: number; rank: number }> = []
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i] as string,
        score: results[i + 1] as number,
        rank: i / 2 + 1,
      })
    }
    return leaderboard
  },

  // Get user rank
  async getUserRank(type: string, userId: string) {
    const key = `leaderboard:${type}`
    const rank = await redis.zrevrank(key, userId)
    const score = await redis.zscore(key, userId)
    
    return {
      rank: rank !== null ? rank + 1 : null, // Convert 0-based to 1-based
      score: score,
    }
  },

  // Increment user score (e.g., for daily steps)
  async incrementScore(type: string, userId: string, increment: number) {
    const key = `leaderboard:${type}`
    await redis.zincrby(key, increment, userId)
  },
}
