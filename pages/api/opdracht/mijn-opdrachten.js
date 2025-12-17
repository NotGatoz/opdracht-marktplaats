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
    const result = await pool.query(`
      SELECT o.id, o.user_id, o.title, o.description, o.category, o.deadline,
        o.location_city, o.location_address, o.location_postcode,
        o.opbouw_date, o.opbouw_time,
        o.hard_opbouw, o.opbouw_dagen_amount, o.opbouw_men_needed,
        o.planning_afbouw_date, o.planning_afbouw_time,
        o.hard_afbouw, o.afbouw_dagen_amount, o.afbouw_men_needed,
        o.opbouw_transport_type, o.opbouw_transport_amount,
        o.afbouw_transport_type, o.afbouw_transport_amount,
        o.opbouw_hoogwerkers_type, o.opbouw_hoogwerkers_amount,
        o.afbouw_hoogwerkers_type, o.afbouw_hoogwerkers_amount,
        o.magazijnbon_link, o.project_map_opbouw_link, o.project_map_afbouw_link, o.storageplace_adres,
        o.created_at, o.status, o.images, o.pdfs, o.pdf_filenames,
        COALESCE(COUNT(b.id), 0) as total_bid_count
      FROM opdrachten o
      LEFT JOIN bids b ON o.id = b.opdracht_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    return res.status(200).json({ opdrachten: result.rows });
  } catch (err) {
    console.error('Error fetching mijn opdrachten:', err);
    return res.status(500).json({ error: 'Kan mijn opdrachten niet ophalen', detail: err.message });
  }
}
