import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    // Get user info including is_poster
    const userRes = await pool.query(
      'SELECT is_poster FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPoster = userRes.rows[0].is_poster;

    // Total opdrachten
    const totalRes = await pool.query(
      'SELECT COUNT(*) FROM opdrachten WHERE user_id = $1',
      [userId]
    );
    const totalOpdrachten = parseInt(totalRes.rows[0].count);

    // Completed opdrachten
    const completedRes = await pool.query(
      "SELECT COUNT(*) FROM opdrachten WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );
    const completedOpdrachten = parseInt(completedRes.rows[0].count);

    // Upcoming deadlines (next 5)
    const upcomingRes = await pool.query(
      "SELECT id, title, deadline FROM opdrachten WHERE user_id = $1 AND status = 'open' ORDER BY deadline ASC LIMIT 5",
      [userId]
    );
    const upcomingOpdrachten = upcomingRes.rows;

    // Recent opdrachten (last 5)
    const recentRes = await pool.query(
      "SELECT id, title, description, status, deadline FROM opdrachten WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId]
    );
    const recentOpdrachten = recentRes.rows;

    // If user is a poster, fetch bids for each recent opdracht
    let recentOpdrachtenWithBids = recentOpdrachten;
    if (isPoster) {
      recentOpdrachtenWithBids = await Promise.all(
        recentOpdrachten.map(async (opdracht) => {
          const bidsRes = await pool.query(
            `SELECT b.id, b.amount, b.created_at, u.name as user_name
             FROM bids b
             JOIN users u ON b.user_id = u.id
             WHERE b.opdracht_id = $1
             ORDER BY b.created_at DESC`,
            [opdracht.id]
          );
          return {
            ...opdracht,
            bids: bidsRes.rows,
          };
        })
      );
    }

    res.status(200).json({
      totalOpdrachten,
      completedOpdrachten,
      upcomingOpdrachten,
      recentOpdrachten: recentOpdrachtenWithBids,
      isPoster,
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    res.status(500).json({ error: 'Error fetching dashboard data', detail: err.message });
  }
}
