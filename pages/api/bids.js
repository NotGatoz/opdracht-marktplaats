import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { opdrachtId } = req.query;
    if (!opdrachtId) return res.status(400).json({ error: 'opdrachtId is required' });

    try {
      const result = await pool.query(
        `SELECT b.id, b.amount, b.created_at, b.comment, u.name as user_name, b.user_id, o.accepted_bid_user_id
         FROM bids b
         JOIN users u ON b.user_id = u.id
         JOIN opdrachten o ON b.opdracht_id = o.id
         WHERE b.opdracht_id = $1
         ORDER BY b.created_at DESC`,
        [opdrachtId]
      );
      res.status(200).json({ bids: result.rows });
    } catch (err) {
      console.error('Error fetching bids:', err);
      res.status(500).json({ error: 'Kan biedingen niet ophalen' });
    }
  } else if (req.method === 'POST') {
    const { opdrachtId, userId, amount, comment } = req.body;
    if (!opdrachtId || !userId || !amount) {
      return res.status(400).json({ error: 'opdrachtId, userId and amount are required' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO bids (opdracht_id, user_id, amount, comment, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [opdrachtId, userId, amount, comment || null]
      );
      res.status(201).json({ bid: result.rows[0] });
    } catch (err) {
      console.error('Error creating bid:', err);
      res.status(500).json({ error: 'Bieden mislukt' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
