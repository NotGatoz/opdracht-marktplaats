// pages/api/admin/user-action.js
import { pool } from '../../../lib/db'; // adjust to your DB connection

export default async function handler(req, res) {
  const userId = req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // PATCH requests: approve/reject/toggle-admin OR changePosterRole
    if (req.method === 'PATCH') {
      // Body-based action: change poster role
      const { action: bodyAction, isPoster } = req.body;
      if (bodyAction === 'changePosterRole') {
        if (typeof isPoster !== 'boolean') {
          return res.status(400).json({ error: 'isPoster must be boolean' });
        }
        const result = await pool.query('UPDATE users SET is_poster = $1 WHERE id = $2 RETURNING *', [isPoster, userId]);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ message: 'Poster role updated', user: result.rows[0] });
      }

      // Query-based actions: approve/reject/toggle-admin
      const action = req.query.action;
      if (!action) return res.status(400).json({ error: 'Missing action' });

      if (action === 'approve') {
        const result = await pool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', ['approved', userId]);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ message: 'User approved', user: result.rows[0] });
      }

      if (action === 'reject') {
        const result = await pool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', ['rejected', userId]);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ message: 'User rejected', user: result.rows[0] });
      }

      if (action === 'toggle-admin') {
        const { rows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        const newAdminStatus = !rows[0].is_admin;
        const result = await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING *', [newAdminStatus, userId]);
        return res.status(200).json({ message: 'Admin status updated', user: result.rows[0] });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    // DELETE request: remove user
    if (req.method === 'DELETE') {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
      if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ message: 'User deleted', user: result.rows[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
