import { pool } from '../../lib/db';

function maskDatabaseUrl(url) {
  if (!url) return null;
  // remove credentials: postgres://user:pass@host:port/db -> postgres://****:****@host:port/db
  return url.replace(/:\/\/([^:@]+):([^@]+)@/, '://****:****@');
}

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT NOW()');
    return res.status(200).json({ success: true, now: result.rows[0] });
  } catch (err) {
    // Log full error (including non-enumerable props) for debugging
    console.error('Connection error (full):', Object.getOwnPropertyNames(err).reduce((acc, k) => { acc[k] = err[k]; return acc; }, {}));
    console.error(err.stack || err);

    // Prepare a safe diagnostic payload to send to client
    const payload = {
      success: false,
      error: err && err.message ? err.message : String(err),
      code: err && err.code ? err.code : undefined,
      detail: err && err.detail ? err.detail : undefined,
      routine: err && err.routine ? err.routine : undefined,
      db: maskDatabaseUrl(process.env.DATABASE_URL),
    };

    return res.status(500).json(payload);
  }
}
