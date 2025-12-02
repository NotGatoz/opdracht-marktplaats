import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await pool.query(`
      SELECT id, user_id, title, description, category, deadline,
        location_city, location_address, location_postcode,
        opbouw_date, opbouw_time,
        hard_opbouw, opbouw_dagen_amount, opbouw_men_needed,
        planning_afbouw_date, planning_afbouw_time,
        hard_afbouw, afbouw_dagen_amount, afbouw_men_needed,
        opbouw_transport_type, opbouw_transport_amount,
        afbouw_transport_type, afbouw_transport_amount,
        opbouw_hoogwerkers_type, opbouw_hoogwerkers_amount,
        afbouw_hoogwerkers_type, afbouw_hoogwerkers_amount,
        magazijnbon_link, project_map_opbouw_link, project_map_afbouw_link, storageplace_adres,
        created_at, status
      FROM opdrachten
      ORDER BY created_at DESC
    `);

    return res.status(200).json({ opdrachten: result.rows });
  } catch (err) {
    console.error('Error fetching opdrachten:', err);
    return res.status(500).json({ error: 'Kan opdrachten niet ophalen', detail: err.message });
  }
}
