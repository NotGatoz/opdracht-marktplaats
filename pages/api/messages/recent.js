import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user from session or localStorage (assuming middleware sets it)
  // For now, we'll assume the user ID is passed or we need to get it from auth
  // This is a simplified version - you might need to adjust based on your auth system

  try {
    // Get recent messages for the current user
    // This query gets the latest message from each opdracht where the user has messages
    const query = `
      SELECT DISTINCT ON (m.opdracht_id)
        m.id, m.opdracht_id, m.user_id, m.message, m.created_at,
        u.name, u.last_name,
        o.title as opdracht_title
      FROM messages m
      JOIN users u ON m.user_id = u.id
      JOIN opdrachten o ON m.opdracht_id = o.id
      WHERE m.opdracht_id IN (
        SELECT DISTINCT opdracht_id FROM messages WHERE user_id = (
          SELECT id FROM users WHERE email = $1 LIMIT 1
        )
      )
      ORDER BY m.opdracht_id, m.created_at DESC
      LIMIT 10
    `;

    // For now, we'll use a placeholder user ID - you need to implement proper user authentication
    const userEmail = req.headers['user-email'] || 'test@example.com'; // This should come from your auth system

    const result = await pool.query(query, [userEmail]);

    return res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('Error fetching recent messages:', err);
    return res.status(500).json({ error: 'Kan recente berichten niet ophalen', detail: err.message });
  }
}
