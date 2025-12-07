import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../drizzle/schema.postgres'

// Lazy initialization - only connect when actually used (at runtime, not build time)
let client: ReturnType<typeof postgres> | null = null
let dbInstance: ReturnType<typeof drizzle> | null = null

function getClient() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    // Create postgres client with connection pooling
    // For Supabase connection pooling, SSL is handled automatically
    client = postgres(connectionString, {
      max: 10, // Max connections in pool
      idle_timeout: 20,
      connect_timeout: 10,
      // SSL is automatically enabled for Supabase connections
    })
  }
  return client
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getClient(), { schema })
  }
  return dbInstance
}

// Export lazy getters - only initialize when actually called
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>]
  }
})

// Export client getter for raw queries if needed
export function getPostgresClient() {
  return getClient()
}
