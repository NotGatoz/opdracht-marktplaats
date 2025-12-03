import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Fetch opdrachten where the user has bid on or accepted bids
    const query = `
      SELECT DISTINCT o.*
      FROM opdrachten o
      LEFT JOIN bids b ON o.id = b.opdracht_id
      WHERE (b.user_id = $1 OR o.accepted_bid_user_id = $1)
    `;
    const result = await pool.query(query, [userId]);

    res.status(200).json({ opdrachten: result.rows });
  } catch (error) {
    console.error('Error fetching aangenomen opdrachten:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
