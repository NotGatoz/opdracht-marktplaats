import { Pool } from "pg";

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase remote DB
});

export { pool };

export async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database connected at:", res.rows[0].now);
    return res.rows[0];
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}
