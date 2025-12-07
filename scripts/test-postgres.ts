import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local before importing db
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '../lib/db'
import { healthRecords } from '../drizzle/schema.postgres'
import { eq } from 'drizzle-orm'

async function test() {
  try {
    console.log('🔌 Testing PostgreSQL connection...')
    
    const result = await db.select().from(healthRecords).limit(1)
    console.log('✅ PostgreSQL connection successful!')
    console.log('Sample record:', result)
    
    // Test insert
    const testRecord = await db.insert(healthRecords).values({
      date: new Date().toISOString().split('T')[0],
      steps: 10000,
    }).returning()
    
    console.log('✅ Insert test successful:', testRecord)
    
    // Cleanup
    await db.delete(healthRecords).where(eq(healthRecords.id, testRecord[0].id))
    console.log('✅ Cleanup successful')
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

test()
