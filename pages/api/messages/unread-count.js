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
    // Get count of unread messages for the user
    const result = await pool.query(
      'SELECT COUNT(*) as unread_count FROM messages WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.status(200).json({ unreadCount: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
