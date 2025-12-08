import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    let query = `
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
        o.created_at, o.status, o.images, o.pdfs, o.pdf_filenames
    `;

    query += `,
      COALESCE(COUNT(b.id), 0) as total_bid_count,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', b.id,
          'user_id', b.user_id,
          'amount', b.amount,
          'created_at', b.created_at,
          'comment', b.comment
        )
      ) FILTER (WHERE b.id IS NOT NULL) as bids
    `;

    if (userId) {
      query += `,
        CASE WHEN EXISTS (
          SELECT 1 FROM bids b WHERE b.opdracht_id = o.id AND b.user_id = $1
        ) THEN (
          SELECT COUNT(*) FROM bids b WHERE b.opdracht_id = o.id AND b.user_id = $1
        ) ELSE 0 END as user_bid_count
      `;
    }

    query += `
      FROM opdrachten o
      LEFT JOIN bids b ON o.id = b.opdracht_id
    `;

    query += `
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const result = userId
      ? await pool.query(query, [userId])
      : await pool.query(query);

    return res.status(200).json({ opdrachten: result.rows });
  } catch (err) {
    console.error('Error fetching opdrachten:', err);
    return res.status(500).json({ error: 'Kan opdrachten niet ophalen', detail: err.message });
  }
}
