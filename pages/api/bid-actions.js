import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, bidId, opdrachtId } = req.body;
    if (!action || !bidId || !opdrachtId) {
      return res.status(400).json({ error: 'action, bidId, and opdrachtId are required' });
    }

    try {
      if (action === 'accept') {
        // Get the user_id from the bid
        const bidResult = await pool.query('SELECT user_id FROM bids WHERE id = $1', [bidId]);
        if (bidResult.rows.length === 0) {
          return res.status(404).json({ error: 'Bid not found' });
        }
        const userId = bidResult.rows[0].user_id;

        // Update the opdracht to accept the bid
        await pool.query('UPDATE opdrachten SET accepted_bid_user_id = $1 WHERE id = $2', [userId, opdrachtId]);

        res.status(200).json({ message: 'Bid accepted' });
      } else if (action === 'ignore') {
        // Delete the bid
        await pool.query('DELETE FROM bids WHERE id = $1', [bidId]);
        res.status(200).json({ message: 'Bid ignored' });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } catch (err) {
      console.error('Error handling bid action:', err);
      res.status(500).json({ error: 'Action failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
