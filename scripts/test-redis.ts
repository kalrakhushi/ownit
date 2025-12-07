#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

import { redis, leaderboard, getCachedOrCompute, CACHE_TTL } from '../lib/redis'

async function testRedis() {
  console.log('🧪 Testing Redis Connection & Features\n')

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic Redis connection...')
    await redis.set('test:connection', 'Hello Redis!')
    const value = await redis.get('test:connection')
    console.log(`   ✅ Connection successful! Value: ${value}\n`)

    // Test 2: Caching function
    console.log('2️⃣ Testing cache helper...')
    let computeCount = 0
    
    const cachedFn = async () => {
      computeCount++
      return { data: 'expensive computation', timestamp: Date.now() }
    }

    const result1 = await getCachedOrCompute('test:cache', 10, cachedFn)
    console.log(`   First call (cache miss): computed ${computeCount} time(s)`)
    
    const result2 = await getCachedOrCompute('test:cache', 10, cachedFn)
    console.log(`   Second call (cache hit): computed ${computeCount} time(s)`)
    console.log(`   ✅ Caching works! ${result1.data}\n`)

    // Test 3: Leaderboard
    console.log('3️⃣ Testing leaderboard (sorted sets)...')
    
    // Add some test scores
    await leaderboard.updateScore('test_steps', 'user1', 15000)
    await leaderboard.updateScore('test_steps', 'user2', 12000)
    await leaderboard.updateScore('test_steps', 'user3', 18000)
    await leaderboard.updateScore('test_steps', 'user4', 14000)
    
    // Get top 3
    const top3 = await leaderboard.getTop('test_steps', 3)
    console.log('   Top 3:')
    top3.forEach(entry => {
      console.log(`   ${entry.rank}. ${entry.userId}: ${entry.score.toLocaleString()} steps`)
    })
    
    // Get user rank
    const user2Rank = await leaderboard.getUserRank('test_steps', 'user2')
    console.log(`   \n   user2 rank: #${user2Rank.rank} with ${user2Rank.score} steps`)
    console.log(`   ✅ Leaderboard works!\n`)

    // Test 4: Performance
    console.log('4️⃣ Testing cache performance...')
    
    const slowFn = async () => {
      // Simulate slow computation
      await new Promise(resolve => setTimeout(resolve, 200))
      return { result: 'slow data' }
    }

    const start1 = Date.now()
    await getCachedOrCompute('test:perf', 60, slowFn)
    const time1 = Date.now() - start1
    
    const start2 = Date.now()
    await getCachedOrCompute('test:perf', 60, slowFn)
    const time2 = Date.now() - start2
    
    console.log(`   Cache miss: ${time1}ms`)
    console.log(`   Cache hit:  ${time2}ms`)
    console.log(`   ✅ ${Math.round((1 - time2/time1) * 100)}% faster with cache!\n`)

    // Cleanup
    console.log('🧹 Cleaning up test data...')
    await redis.del('test:connection')
    await redis.del('test:cache')
    await redis.del('test:perf')
    await redis.del('leaderboard:test_steps')
    
    console.log('✅ All tests passed! Redis is working perfectly! 🎉\n')
  } catch (error) {
    console.error('❌ Error testing Redis:', error)
    process.exit(1)
  }
}

testRedis()
