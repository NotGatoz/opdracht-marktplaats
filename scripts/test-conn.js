import { Pool } from 'pg';

(async () => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const res = await pool.query('SELECT NOW()');
    console.log('Connected — now:', res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error('Connection test failed:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
