import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    console.log('   Falling back to direct postgres connection test...')
    return false
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection by querying a system table
    const { data, error } = await supabase.rpc('version')
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error: any) {
    console.error('❌ Supabase connection error:', error.message)
    return false
  }
}

// Try direct postgres connection as fallback
async function testDirectPostgres() {
  const connectionString = process.env.DATABASE_URL!
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set')
    return false
  }

  console.log('🔌 Testing direct PostgreSQL connection...')
  console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'))
  
  try {
    const postgres = (await import('postgres')).default
    const client = postgres(connectionString, {
      max: 1,
      connect_timeout: 10,
    })
    
    const result = await client`SELECT version()`
    console.log('✅ PostgreSQL connection successful!')
    console.log('PostgreSQL version:', result[0].version)
    
    await client.end()
    return true
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    console.error('Error code:', error.code)
    
    if (error.code === 'SASL_SIGNATURE_MISMATCH') {
      console.log('\n💡 Authentication error - possible solutions:')
      console.log('   1. Verify password in Supabase Dashboard → Settings → Database')
      console.log('   2. Try resetting database password')
      console.log('   3. Check if connection pooling requires different format')
    }
    
    return false
  }
}

async function main() {
  console.log('🧪 Testing Supabase/PostgreSQL connection...\n')
  
  // Try Supabase client first
  const supabaseSuccess = await testSupabaseConnection()
  
  if (!supabaseSuccess) {
    // Fallback to direct postgres
    await testDirectPostgres()
  }
}

main()
