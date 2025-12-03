import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, type } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    let query;
    let params = [userId];

    if (type === 'geboden') {
      // Fetch opdrachten where the user has placed bids but not accepted
      query = `
        SELECT DISTINCT o.*
        FROM opdrachten o
        INNER JOIN bids b ON o.id = b.opdracht_id
        WHERE b.user_id = $1
        AND NOT (o.accepted_bid_user_id = $1 AND o.status = 'aangenomen')
      `;
    } else {
      // Fetch opdrachten where the user has accepted bids (aangenomen)
      query = `
        SELECT DISTINCT o.*
        FROM opdrachten o
        WHERE o.accepted_bid_user_id = $1 AND o.status = 'aangenomen'
      `;
    }

    const result = await pool.query(query, params);

    res.status(200).json({ opdrachten: result.rows });
  } catch (error) {
    console.error('Error fetching opdrachten:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
