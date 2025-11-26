import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let result;
    try {
      result = await pool.query(
        `SELECT id, name, last_name, email, is_admin, status, is_poster, created_at
         FROM users
         ORDER BY created_at DESC`
      );
    } catch (err) {
      // If columns don't exist, set defaults
      if (err.message && err.message.includes('does not exist')) {
        result = await pool.query(
          `SELECT id, name, last_name, email, is_admin, created_at
           FROM users
           ORDER BY created_at DESC`
        );
        result.rows = result.rows.map(u => ({
          ...u,
          status: 'pending',
          is_poster: false, // default value
        }));
      } else {
        throw err;
      }
    }

    // Ensure all rows have is_poster
    const users = result.rows.map(u => ({ ...u, is_poster: u.is_poster || false }));

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err?.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
