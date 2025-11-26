import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId, action } = req.query;

  if (!userId || !action) {
    return res.status(400).json({ error: 'Missing userId or action' });
  }

  try {
    if (req.method === 'PATCH') {
      // Approve registration
      if (action === 'approve') {
        await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['approved', userId]);
        return res.status(200).json({ message: 'User approved' });
      }

      // Reject registration
      if (action === 'reject') {
        await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['rejected', userId]);
        return res.status(200).json({ message: 'User rejected' });
      }

      // Change role (admin toggle)
      if (action === 'toggle-admin') {
        const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        const newAdminStatus = !result.rows[0].is_admin;
        await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2', [newAdminStatus, userId]);
        return res.status(200).json({ message: 'Admin status toggled', is_admin: newAdminStatus });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    if (req.method === 'DELETE') {
      // Delete user
      if (action === 'delete') {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return res.status(200).json({ message: 'User deleted' });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error managing user:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
