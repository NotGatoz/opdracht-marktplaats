import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, opdrachtId } = req.body;

  if (!userId || !opdrachtId) {
    return res.status(400).json({ error: 'Missing required fields: userId, opdrachtId' });
  }

  try {
    const query = `
      UPDATE messages
      SET is_read = true
      WHERE user_id = $1 AND opdracht_id = $2 AND is_read = false
    `;
    await pool.query(query, [userId, opdrachtId]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    return res.status(500).json({ error: 'Kan berichten niet als gelezen markeren', detail: err.message });
  }
}
