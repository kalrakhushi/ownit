import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local before importing
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import postgres from 'postgres'

async function testConnection() {
  const connectionString = process.env.DATABASE_URL!
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set')
    process.exit(1)
  }

  console.log('🔌 Testing connection string:', connectionString.replace(/:[^:@]+@/, ':****@'))
  
  try {
    // Try with minimal config
    const client = postgres(connectionString, {
      max: 1,
      connect_timeout: 10,
    })
    
    const result = await client`SELECT version()`
    console.log('✅ Connection successful!')
    console.log('PostgreSQL version:', result[0].version)
    
    await client.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    console.error('Error code:', error.code)
    
    if (error.code === 'SASL_SIGNATURE_MISMATCH') {
      console.log('\n💡 This usually means:')
      console.log('   1. Password is incorrect')
      console.log('   2. Try using direct connection string instead of pooling')
      console.log('   3. Verify credentials in Supabase dashboard')
    }
    
    process.exit(1)
  }
}

testConnection()
