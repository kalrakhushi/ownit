import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../drizzle/schema'

const databaseUrl = process.env.DATABASE_URL?.replace('file:', '') || './dev.db'
const sqlite = new Database(databaseUrl)

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })
