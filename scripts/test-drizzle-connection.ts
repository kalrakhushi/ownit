import { db } from '../lib/db'
import { healthRecords } from '../drizzle/schema'
import { desc } from 'drizzle-orm'

async function testConnection() {
  try {
    console.log('🔌 Testing Drizzle database connection...')
    
    // Test 1: Count records
    const count = await db.select().from(healthRecords)
    console.log(`✅ Database connection successful!`)
    console.log(`   Found ${count.length} health record(s)`)
    
    // Test 2: Try to fetch records
    if (count.length > 0) {
      const records = await db.select().from(healthRecords).orderBy(desc(healthRecords.date)).limit(5)
      console.log('✅ Sample records:', records.map(r => ({ id: r.id, date: r.date })))
    }
    
    console.log('\n🎉 All Drizzle tests passed!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testConnection()
