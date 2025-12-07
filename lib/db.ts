import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../drizzle/schema.postgres'

// Use connection pooling for better performance
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create postgres client with connection pooling
// For Supabase connection pooling, SSL is handled automatically
const client = postgres(connectionString, {
  max: 10, // Max connections in pool
  idle_timeout: 20,
  connect_timeout: 10,
  // SSL is automatically enabled for Supabase connections
})

export const db = drizzle(client, { schema })

// Export client for raw queries if needed
export { client as postgresClient }
