/**
 * Database connection using Replit's PostgreSQL integration
 * 
 * TODO: DATABASE-SCHEMA-CHECK
 * ---------------------------
 * Issue: Verifieer dat alle V2 tabellen aanwezig zijn
 * Status: Done (januari 2026)
 * 
 * Vereiste tabellen voor V2 engine:
 * - users (id, username, password)
 * - v2_sessions (id, user_id, technique_id, mode, phase, context_data, etc.)
 * - technique_sessions (id, user_id, technique_id, context, timestamps)
 * - user_context (id, user_id, product, klant_type, sector, setting)
 * - turns (id, session_id, role, mode, text, technique_id, meta)
 * - technique_mastery (user_id, technique_id, scores, etc.)
 * - user_training_profile (user_id, struggle_patterns, etc.)
 * 
 * Verificatie:
 * 1. Check schema: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
 * 2. Run migrations: npm run db:push
 * 3. Vergelijk met shared/schema.ts
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
