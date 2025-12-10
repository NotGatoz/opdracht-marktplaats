import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { opdrachtId, userId, message } = req.body;

  if (!opdrachtId || !userId || !message) {
    return res.status(400).json({ error: 'Missing required fields: opdrachtId, userId, message' });
  }

  try {
    const query = `
      INSERT INTO messages (opdracht_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, opdracht_id, user_id, message, created_at
    `;

    const result = await pool.query(query, [opdrachtId, userId, message.trim()]);
    return res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('Error sending message:', err);
    return res.status(500).json({ error: 'Kan bericht niet verzenden', detail: err.message });
  }
}
