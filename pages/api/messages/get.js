import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { opdrachtId } = req.query;

  if (!opdrachtId) {
    return res.status(400).json({ error: 'Missing opdrachtId' });
  }

  try {
    const query = `
      SELECT m.id, m.opdracht_id, m.user_id, m.message, m.created_at,
             u.name, u.last_name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.opdracht_id = $1
      ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [opdrachtId]);

    return res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: 'Kan berichten niet ophalen', detail: err.message });
  }
}
