import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    title,
    description,
    category,
    deadline,
    location_city,
    location_address,
    location_postcode,
    opbouw_date,
    opbouw_time,
    hard_opbouw,
    opbouw_dagen_amount,
    opbouw_men_needed,
    planning_afbouw_date,
    planning_afbouw_time,
    hard_afbouw,
    afbouw_dagen_amount,
    afbouw_men_needed,
    opbouw_transport_type,
    opbouw_transport_amount,
    afbouw_transport_type,
    afbouw_transport_amount,
    opbouw_hoogwerkers_type,
    opbouw_hoogwerkers_amount,
    afbouw_hoogwerkers_type,
    afbouw_hoogwerkers_amount,
    magazijnbon_link,
    project_map_opbouw_link,
    project_map_afbouw_link,
    storageplace_adres,
    userId
  } = req.body;

  // Validation
  if (!title || !description || !deadline || !userId) {
    return res.status(400).json({ error: 'Alle verplichte velden zijn vereist' });
  }

  try {
    const query = `
      INSERT INTO opdrachten (
        user_id, title, description, category, deadline,
        location_city, location_address, location_postcode,
        verwachtte_opbouw_tijd_datums, verwachtte_opbouw_tijd_uren,
        hard_opbouw, opbouw_dagen_amount, opbouw_men_needed, voorkeur_opbouw,
        planning_afbouw_date, planning_afbouw_time,
        hard_afbouw, afbouw_dagen_amount, afbouw_men_needed,
        opbouw_transport_type, opbouw_transport_amount,
        afbouw_transport_type, afbouw_transport_amount,
        opbouw_hoogwerkers_type, opbouw_hoogwerkers_amount,
        afbouw_hoogwerkers_type, afbouw_hoogwerkers_amount,
        magazijnbon_link, project_map_opbouw_link, project_map_afbouw_link, storageplace_adres,
        created_at, status
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10,
        $11, $12, $13, $14,
        $15, $16,
        $17, $18, $19,
        $20, $21,
        $22, $23,
        $24, $25,
        $26, $27,
        $28, $29, $30, $31,
        NOW(), 'open'
      )
      RETURNING id, user_id, title, description, category, deadline,
        location_city, location_address, location_postcode,
        verwachtte_opbouw_tijd_datums, verwachtte_opbouw_tijd_uren,
        hard_opbouw, opbouw_dagen_amount, opbouw_men_needed, voorkeur_opbouw,
        planning_afbouw_date, planning_afbouw_time,
        hard_afbouw, afbouw_dagen_amount, afbouw_men_needed,
        opbouw_transport_type, opbouw_transport_amount,
        afbouw_transport_type, afbouw_transport_amount,
        opbouw_hoogwerkers_type, opbouw_hoogwerkers_amount,
        afbouw_hoogwerkers_type, afbouw_hoogwerkers_amount,
        magazijnbon_link, project_map_opbouw_link, project_map_afbouw_link, storageplace_adres,
        created_at, status
    `;

    const values = [
      userId, title, description, category || null, deadline,
      location_city || null, location_address || null, location_postcode || null,
      verwachtte_opbouw_tijd_datums || null, verwachtte_opbouw_tijd_uren || null,
      hard_opbouw || null, opbouw_dagen_amount || null, opbouw_men_needed || null, voorkeur_opbouw || null,
      planning_afbouw_date || null, planning_afbouw_time || null,
      hard_afbouw || null, afbouw_dagen_amount || null, afbouw_men_needed || null,
      opbouw_transport_type || null, opbouw_transport_amount || null,
      afbouw_transport_type || null, afbouw_transport_amount || null,
      opbouw_hoogwerkers_type || null, opbouw_hoogwerkers_amount || null,
      afbouw_hoogwerkers_type || null, afbouw_hoogwerkers_amount || null,
      magazijnbon_link || null, project_map_opbouw_link || null, project_map_afbouw_link || null, storageplace_adres || null
    ];

    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(500).json({ error: 'Opdracht kan niet worden aangemaakt' });
    }

    return res.status(201).json({
      message: 'Opdracht succesvol geplaatst',
      opdracht: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating opdracht:', err);
    return res.status(500).json({
      error: 'Fout bij het plaatsen van de opdracht',
      detail: err.message,
    });
  }
}
