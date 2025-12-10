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
    // Get chatrooms (opdrachten with messages) for the current user
    // This query gets opdrachten where the user has messages, with the latest message info
    const query = `
      SELECT DISTINCT ON (o.id)
        o.id as opdracht_id, o.title as opdracht_title,
        m.id as latest_message_id, m.message as latest_message, m.created_at as latest_message_time,
        u.name, u.last_name,
        (SELECT COUNT(*) FROM messages WHERE opdracht_id = o.id AND user_id = $1 AND is_read = false) as unread_count
      FROM messages m
      JOIN users u ON m.user_id = u.id
      JOIN opdrachten o ON m.opdracht_id = o.id
      WHERE m.opdracht_id IN (
        SELECT DISTINCT opdracht_id FROM messages WHERE user_id = $1
      )
      ORDER BY o.id, m.created_at DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [userId]);

    return res.status(200).json({ chatrooms: result.rows });
  } catch (err) {
    console.error('Error fetching chatrooms:', err);
    return res.status(500).json({ error: 'Kan chatrooms niet ophalen', detail: err.message });
  }
}
