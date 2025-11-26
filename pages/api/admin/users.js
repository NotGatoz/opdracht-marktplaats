import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to fetch with status column; if it fails, fetch without it
    let result;
    try {
      result = await pool.query(
        'SELECT id, name, last_name, email, is_admin, status, created_at FROM users ORDER BY created_at DESC'
      );
    } catch (err) {
      // If status column doesn't exist, fetch without it and set default
      if (err.message && err.message.includes('does not exist')) {
        result = await pool.query(
          'SELECT id, name, last_name, email, is_admin, created_at FROM users ORDER BY created_at DESC'
        );
        // Add default status to all users
        result.rows = result.rows.map(u => ({ ...u, status: 'pending' }));
      } else {
        throw err;
      }
    }
    res.status(200).json({ users: result.rows });
  } catch (err) {
    console.error('Error fetching users:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
