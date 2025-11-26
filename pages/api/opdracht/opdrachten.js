import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await pool.query(`
      SELECT id, user_id, title, description, category, price, deadline, location, created_at, status
      FROM opdrachten
      ORDER BY created_at DESC
    `);

    return res.status(200).json({ opdrachten: result.rows });
  } catch (err) {
    console.error('Error fetching opdrachten:', err);
    return res.status(500).json({ error: 'Kan opdrachten niet ophalen', detail: err.message });
  }
}
