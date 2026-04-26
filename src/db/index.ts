import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM with the connection pool and generated schema
export const db = drizzle(pool, { schema });

// Export the schema for easy access elsewhere in the app
export { schema };
