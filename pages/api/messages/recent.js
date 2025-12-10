import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    // Get user info
    const userQuery = `SELECT is_poster, is_admin FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { is_poster, is_admin } = userResult.rows[0];

    // Posters & admins: see ALL chatrooms where a worker messaged them
    if (is_poster || is_admin) {
      const query = `
        SELECT DISTINCT ON (o.id)
          o.id as opdracht_id, o.title as opdracht_title,
          m.id as latest_message_id, m.message as latest_message, m.created_at as latest_message_time,
          u.name, u.last_name,
          (SELECT COUNT(*) 
           FROM messages 
           WHERE opdracht_id = o.id 
           AND user_id != $1 
           AND is_read = false) as unread_count
        FROM messages m
        JOIN users u ON m.user_id = u.id
        JOIN opdrachten o ON m.opdracht_id = o.id
        WHERE o.id IN (
          SELECT DISTINCT opdracht_id 
          FROM messages 
        )
        ORDER BY o.id, m.created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      return res.status(200).json({ chatrooms: result.rows });
    }

    // Worker: see chatrooms ONLY if poster/admin already replied
    const workerQuery = `
      SELECT DISTINCT ON (o.id)
        o.id as opdracht_id, o.title as opdracht_title,
        m.id as latest_message_id, m.message as latest_message, m.created_at as latest_message_time,
        u.name, u.last_name,
        (SELECT COUNT(*) 
         FROM messages 
         WHERE opdracht_id = o.id 
         AND user_id != $1 
         AND is_read = false) as unread_count
      FROM messages m
      JOIN users u ON m.user_id = u.id
      JOIN opdrachten o ON m.opdracht_id = o.id
      WHERE o.id IN (
        -- Chatrooms where someone ELSE replied to the worker
        SELECT DISTINCT opdracht_id
        FROM messages
        WHERE user_id != $1
      )
      ORDER BY o.id, m.created_at DESC
    `;

    const workerResult = await pool.query(workerQuery, [userId]);
    return res.status(200).json({ chatrooms: workerResult.rows });

  } catch (err) {
    console.error('Error fetching chatrooms:', err);
    return res.status(500).json({ error: 'Kan chatrooms niet ophalen', detail: err.message });
  }
}
