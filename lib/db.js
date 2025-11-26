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
