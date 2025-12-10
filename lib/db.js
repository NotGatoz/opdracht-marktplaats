import { Pool } from "pg";

// If DATABASE_URL is not set, provide a lightweight in-memory fallback
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0);

let pool;
if (hasDatabaseUrl) {
  // Only enable SSL when connecting to remote hosts (not localhost)
  const useSSL = !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
    // Add connection pool configuration for better stability
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    acquireTimeoutMillis: 60000, // Return an error after 60 seconds if connection could not be acquired
  });

  // Handle pool errors
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
  });

  // log for easier debugging
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
} else {
  console.warn("No DATABASE_URL found — using fallback in-memory pool for development.");

  // Minimal fake pool with compatible `query` signature used by the app
  pool = {
    query: async (sql) => {
      // support SELECT NOW() used by test endpoints
      if (/SELECT\s+NOW\(\)/i.test(sql)) {
        return { rows: [{ now: new Date().toISOString() }] };
      }
      // Generic fallback
      return { rows: [] };
    },
  };
}

export { pool };

// Retry wrapper for database queries
export async function queryWithRetry(sql, params = [], retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error(`Database query failed (attempt ${i + 1}/${retries}):`, err.message);
      if (i === retries - 1) throw err;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

export async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database connected at:", res.rows[0].now);
    return res.rows[0];
  } catch (err) {
    console.error("Database connection failed:", err && err.message ? err.message : err);
    throw err;
  }
}
