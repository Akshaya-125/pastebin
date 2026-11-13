import { Pool } from 'pg';

const globalForPg = globalThis;

function getPool() {
  if (!globalForPg.__pgPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    globalForPg.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl: process.env.DATABASE_URL.includes('localhost')
        ? undefined
        : { rejectUnauthorized: false },
    });
  }
  return globalForPg.__pgPool;
}

let schemaReady;
export async function query(text, params) {
  const pool = getPool();
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS pastes (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          expires_at BIGINT,
          max_views INTEGER,
          view_count INTEGER NOT NULL DEFAULT 0
        )`
      )
      .catch((e) => {
        schemaReady = undefined;
        throw e;
      });
  }
  await schemaReady;
  return pool.query(text, params);
}

export async function ping() {
  const pool = getPool();
  await pool.query('SELECT 1');
}
