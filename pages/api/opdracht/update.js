import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    id,
    title,
    description,
    category,
    deadline,
    location_address,
    location_city,
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
    images,
    pdfs,
    pdf_filenames,
  } = req.body;

  // Validate required fields
  if (!id || !title || !description || !deadline) {
    return res.status(400).json({ error: 'Verplichte velden ontbreken (id, title, description, deadline)' });
  }

  try {
    // Check if opdracht exists and get the user_id to verify ownership
    const checkRes = await pool.query('SELECT user_id FROM opdrachten WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Opdracht niet gevonden' });
    }

    const query = `
      UPDATE opdrachten
      SET
        title = $1,
        description = $2,
        category = $3,
        deadline = $4,
        location_address = $5,
        location_city = $6,
        location_postcode = $7,
        opbouw_date = $8,
        opbouw_time = $9,
        hard_opbouw = $10,
        opbouw_dagen_amount = $11,
        opbouw_men_needed = $12,
        planning_afbouw_date = $13,
        planning_afbouw_time = $14,
        hard_afbouw = $15,
        afbouw_dagen_amount = $16,
        afbouw_men_needed = $17,
        opbouw_transport_type = $18,
        opbouw_transport_amount = $19,
        afbouw_transport_type = $20,
        afbouw_transport_amount = $21,
        opbouw_hoogwerkers_type = $22,
        opbouw_hoogwerkers_amount = $23,
        afbouw_hoogwerkers_type = $24,
        afbouw_hoogwerkers_amount = $25,
        magazijnbon_link = $26,
        project_map_opbouw_link = $27,
        project_map_afbouw_link = $28,
        storageplace_adres = $29,
        images = $30,
        pdfs = $31,
        pdf_filenames = $32,
        updated_at = NOW()
      WHERE id = $33
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      description,
      category || null,
      deadline,
      location_address || null,
      location_city || null,
      location_postcode || null,
      opbouw_date || null,
      opbouw_time || null,
      hard_opbouw || null,
      opbouw_dagen_amount || null,
      opbouw_men_needed || null,
      planning_afbouw_date || null,
      planning_afbouw_time || null,
      hard_afbouw || null,
      afbouw_dagen_amount || null,
      afbouw_men_needed || null,
      opbouw_transport_type || null,
      opbouw_transport_amount || null,
      afbouw_transport_type || null,
      afbouw_transport_amount || null,
      opbouw_hoogwerkers_type || null,
      opbouw_hoogwerkers_amount || null,
      afbouw_hoogwerkers_type || null,
      afbouw_hoogwerkers_amount || null,
      magazijnbon_link || null,
      project_map_opbouw_link || null,
      project_map_afbouw_link || null,
      storageplace_adres || null,
      images || [],
      pdfs || [],
      pdf_filenames || [],
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Opdracht kon niet worden bijgewerkt' });
    }

    return res.status(200).json({
      message: 'Opdracht succesvol bijgewerkt',
      opdracht: result.rows[0],
    });
  } catch (err) {
    console.error('Update opdracht error:', err);
    return res.status(500).json({ error: 'Serverfout bij bijwerken opdracht' });
  }
}
