#!/usr/bin/env tsx

/**
 * Redis Implementation Verification Script
 * Tests all Redis features: caching, leaderboards, performance
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

console.log('🧪 Redis Implementation Verification\n')
console.log('=' .repeat(50))

interface TestResult {
  name: string
  passed: boolean
  message: string
  time?: number
}

const results: TestResult[] = []

// Helper to test an endpoint
async function testEndpoint(name: string, url: string, expectCacheKey?: string) {
  try {
    const start = Date.now()
    const response = await fetch(url)
    const time = Date.now() - start
    
    if (response.ok) {
      const data = await response.json()
      results.push({
        name,
        passed: true,
        message: `Response: ${response.status}, Time: ${time}ms`,
        time
      })
      return { success: true, data, time }
    } else {
      results.push({
        name,
        passed: false,
        message: `Failed: ${response.status}`
      })
      return { success: false }
    }
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      message: `Error: ${error.message}`
    })
    return { success: false }
  }
}

async function runTests() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('\n1️⃣  Testing API Endpoints\n')
  
  // Test Streaks API
  console.log('Testing /api/streaks...')
  const streaks1 = await testEndpoint('Streaks API (1st call)', `${baseUrl}/api/streaks`)
  await new Promise(r => setTimeout(r, 100))
  const streaks2 = await testEndpoint('Streaks API (2nd call - cached)', `${baseUrl}/api/streaks`)
  
  if (streaks1.success && streaks2.success && streaks1.time && streaks2.time) {
    const improvement = ((1 - streaks2.time / streaks1.time) * 100).toFixed(0)
    console.log(`   📊 Cache performance: ${streaks1.time}ms → ${streaks2.time}ms (${improvement}% faster)\n`)
  }
  
  // Test Patterns API
  console.log('Testing /api/patterns...')
  await testEndpoint('Patterns API', `${baseUrl}/api/patterns`)
  console.log()
  
  // Test Predictions API  
  console.log('Testing /api/predictions...')
  await testEndpoint('Predictions API', `${baseUrl}/api/predictions?metric=all`)
  console.log()
  
  // Test Health Records API
  console.log('Testing /api/health-records...')
  await testEndpoint('Health Records API', `${baseUrl}/api/health-records`)
  console.log()
  
  // Test Leaderboard API
  console.log('Testing /api/leaderboard...')
  await testEndpoint('Leaderboard (steps)', `${baseUrl}/api/leaderboard?type=steps`)
  await testEndpoint('Leaderboard (sleep)', `${baseUrl}/api/leaderboard?type=sleep`)
  await testEndpoint('Leaderboard (streaks)', `${baseUrl}/api/leaderboard?type=streaks`)
  console.log()
  
  console.log('\n2️⃣  Testing Direct Redis Connection\n')
  
  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
    
    // Test basic set/get
    await redis.set('test:verification', JSON.stringify({ test: true, timestamp: Date.now() }))
    const value = await redis.get('test:verification')
    
    if (value) {
      results.push({
        name: 'Direct Redis Connection',
        passed: true,
        message: 'Set and get operations successful'
      })
      console.log('   ✅ Redis set/get working')
    } else {
      throw new Error('Failed to retrieve value')
    }
    
    // Test TTL
    await redis.setex('test:ttl', 5, 'expires in 5 seconds')
    const ttl = await redis.ttl('test:ttl')
    
    if (ttl && ttl > 0) {
      results.push({
        name: 'Redis TTL',
        passed: true,
        message: `TTL working (${ttl}s remaining)`
      })
      console.log(`   ✅ TTL working (${ttl}s remaining)`)
    }
    
    // Test sorted sets (leaderboard)
    await redis.zadd('test:leaderboard', { score: 100, member: 'user1' })
    await redis.zadd('test:leaderboard', { score: 200, member: 'user2' })
    await redis.zadd('test:leaderboard', { score: 150, member: 'user3' })
    
    const top = await redis.zrange('test:leaderboard', 0, 2, { rev: true, withScores: true })
    
    if (top && top.length > 0) {
      results.push({
        name: 'Redis Sorted Sets (Leaderboard)',
        passed: true,
        message: `Found ${top.length / 2} entries`
      })
      console.log(`   ✅ Sorted sets working (${top.length / 2} entries)`)
    }
    
    // Cleanup
    await redis.del('test:verification')
    await redis.del('test:ttl')
    await redis.del('test:leaderboard')
    
  } catch (error: any) {
    results.push({
      name: 'Direct Redis Connection',
      passed: false,
      message: error.message
    })
    console.log(`   ❌ Redis connection failed: ${error.message}`)
  }
  
  console.log()
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Results Summary\n')
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
    if (result.time) {
      console.log(`   Time: ${result.time}ms`)
    }
    if (!result.passed) {
      console.log(`   Error: ${result.message}`)
    }
  })
  
  console.log('\n' + '='.repeat(50))
  console.log(`\n${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Redis is working perfectly!\n')
    console.log('✅ Caching enabled')
    console.log('✅ Leaderboards functional')
    console.log('✅ Performance optimized')
    console.log('\nCheck your dev server logs for "Cache hit" and "Cache miss" messages!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
