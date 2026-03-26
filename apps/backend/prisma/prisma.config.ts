import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

// Get DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the adapter with the database URL
export const adapter = new PrismaNeon(
  new Pool({ connectionString: databaseUrl })
)
