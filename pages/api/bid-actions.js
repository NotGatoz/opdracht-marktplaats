import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, bidId, opdrachtId, userId } = req.body;

    try {
      if (action === 'accept') {
        if (!bidId || !opdrachtId) {
          return res.status(400).json({ error: 'bidId and opdrachtId are required for accept action' });
        }
        // Get the user_id from the bid
        const bidResult = await pool.query('SELECT user_id FROM bids WHERE id = $1', [bidId]);
        if (bidResult.rows.length === 0) {
          return res.status(404).json({ error: 'Bid not found' });
        }
        const bidUserId = bidResult.rows[0].user_id;

        // Update the opdracht to accept the bid
        await pool.query('UPDATE opdrachten SET accepted_bid_user_id = $1 WHERE id = $2', [bidUserId, opdrachtId]);

        res.status(200).json({ message: 'Bid accepted' });
      } else if (action === 'ignore') {
        if (!userId || !opdrachtId) {
          return res.status(400).json({ error: 'userId and opdrachtId are required for ignore action' });
        }
        // Delete the user's bid for this opdracht
        const deleteResult = await pool.query('DELETE FROM bids WHERE user_id = $1 AND opdracht_id = $2', [userId, opdrachtId]);
        if (deleteResult.rowCount === 0) {
          return res.status(404).json({ error: 'No bid found to delete' });
        }
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
