import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Opdrachten over time (last 12 months)
    const opdrachtenOverTime = await pool.query(`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM opdrachten
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    // Bids over time (last 12 months)
    const bidsOverTime = await pool.query(`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM bids
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    // Opdrachten status distribution
    const statusDistribution = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM opdrachten
      GROUP BY status
    `);

    // Average bid amount per opdracht
    const avgBidPerOpdracht = await pool.query(`
      SELECT
        o.title,
        AVG(b.amount) as avg_amount,
        COUNT(b.id) as bid_count
      FROM opdrachten o
      LEFT JOIN bids b ON o.id = b.opdracht_id
      GROUP BY o.id, o.title
      HAVING COUNT(b.id) > 0
      ORDER BY avg_amount DESC
      LIMIT 10
    `);

    // User registrations over time (last 12 months)
    const userRegistrationsOverTime = await pool.query(`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    // User status distribution
    const userStatusDistribution = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM users
      GROUP BY status
    `);

    // User logins over time (last 12 months) - based on last_login timestamps
    const userLoginsOverTime = await pool.query(`
      SELECT
        DATE_TRUNC('month', last_login) as month,
        COUNT(*) as count
      FROM users
      WHERE last_login IS NOT NULL
      AND last_login >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', last_login)
      ORDER BY month
    `);

    // Total stats
    const totalStats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM opdrachten) as total_opdrachten,
        (SELECT COUNT(*) FROM bids) as total_bids,
        (SELECT COUNT(*) FROM users WHERE is_poster = true) as total_posters,
        (SELECT AVG(amount) FROM bids) as avg_bid_amount
    `);

    res.status(200).json({
      opdrachtenOverTime: opdrachtenOverTime.rows,
      bidsOverTime: bidsOverTime.rows,
      statusDistribution: statusDistribution.rows,
      avgBidPerOpdracht: avgBidPerOpdracht.rows,
      userRegistrationsOverTime: userRegistrationsOverTime.rows,
      userStatusDistribution: userStatusDistribution.rows,
      userLoginsOverTime: userLoginsOverTime.rows,
      totalStats: totalStats.rows[0]
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Kan statistieken niet ophalen', detail: err.message });
  }
}
