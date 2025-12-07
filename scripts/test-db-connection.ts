#!/usr/bin/env tsx

/**
 * Test Supabase Database Connection
 * Verifies that the database connection is working correctly
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { db, getPostgresClient } from '../lib/db'
import { healthRecords } from '../drizzle/schema.postgres'
import { sql } from 'drizzle-orm'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

async function testConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n')

  // Check environment variable
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  // Mask password in URL for display
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
  console.log(`📋 Connection String: ${maskedUrl}`)
  console.log('')

  try {
    // Test 1: Simple query to check connection using raw SQL
    console.log('1️⃣  Testing basic connection...')
    const client = getPostgresClient()
    const testQuery = await client`SELECT NOW() as current_time`
    console.log('   ✅ Database connection successful!')
    console.log(`   📅 Server time: ${testQuery[0]?.current_time || 'N/A'}`)
    console.log('')

    // Test 2: Check if HealthRecord table exists
    console.log('2️⃣  Checking HealthRecord table...')
    try {
      const tableCheck = await client`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'HealthRecord'
        ) as exists
      `
      
      const exists = tableCheck[0]?.exists
      if (exists) {
        console.log('   ✅ HealthRecord table exists')
        
        // Get table info using Drizzle
        const countResult = await db.select().from(healthRecords).limit(1)
        const totalResult = await client`SELECT COUNT(*) as count FROM "HealthRecord"`
        const total = (totalResult[0] as any)?.count || 0
        console.log(`   📊 Total records: ${total}`)
      } else {
        console.log('   ⚠️  HealthRecord table does not exist')
        console.log('   💡 Run: npm run drizzle:push')
      }
    } catch (error: any) {
      console.log(`   ⚠️  Could not check table: ${error.message}`)
    }
    console.log('')

    // Test 3: Test insert (if table exists)
    console.log('3️⃣  Testing insert operation...')
    try {
      const testDate = new Date().toISOString().split('T')[0]
      const testRecord = await db.insert(healthRecords).values({
        date: testDate,
        weight: 70.5,
        steps: 5000,
      }).returning()
      
      if (testRecord && testRecord.length > 0) {
        console.log('   ✅ Insert operation successful!')
        console.log(`   📝 Created test record ID: ${testRecord[0].id}`)
        
        // Clean up test record
        await db.delete(healthRecords).where(sql`id = ${testRecord[0].id}`)
        console.log('   🧹 Test record cleaned up')
      }
    } catch (error: any) {
      console.log(`   ⚠️  Insert test failed: ${error.message}`)
      if (error.message.includes('does not exist')) {
        console.log('   💡 Run: npm run drizzle:push')
      }
    }
    console.log('')

    // Test 4: Check other tables
    console.log('4️⃣  Checking other tables...')
    const tables = ['Streak', 'MoodEntry', 'Challenge', 'WearableSample']
    for (const table of tables) {
      try {
        const result = await client`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          ) as exists
        `
        const exists = result[0]?.exists
        console.log(`   ${exists ? '✅' : '❌'} ${table}: ${exists ? 'exists' : 'missing'}`)
      } catch (error) {
        console.log(`   ❌ ${table}: error checking`)
      }
    }
    console.log('')

    console.log('✅ Database connection test completed!\n')
    console.log('📝 Summary:')
    console.log('   - Connection: ✅ Working')
    console.log('   - Database: Supabase PostgreSQL')
    console.log('   - Status: Ready to use\n')

  } catch (error: any) {
    console.error('\n❌ Database connection failed!\n')
    console.error('Error details:')
    console.error(`   Message: ${error.message}`)
    console.error(`   Code: ${error.code || 'N/A'}`)
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 Possible issues:')
      console.error('   - Network connectivity')
      console.error('   - Firewall blocking connection')
      console.error('   - Supabase project paused (free tier)')
    } else if (error.message.includes('password') || error.message.includes('authentication')) {
      console.error('\n💡 Possible issues:')
      console.error('   - Incorrect database password')
      console.error('   - Check DATABASE_URL in .env.local')
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Possible issues:')
      console.error('   - Database not found')
      console.error('   - Check DATABASE_URL connection string')
    }
    
    process.exit(1)
  }
}

testConnection().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
