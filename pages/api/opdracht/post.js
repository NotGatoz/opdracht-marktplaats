import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, category, price, deadline, location, userId } = req.body;

  // Validation
  if (!title || !description || !price || !deadline || !userId) {
    return res.status(400).json({ error: 'Alle verplichte velden zijn vereist' });
  }

  try {
    const query = `
      INSERT INTO opdrachten (user_id, title, description, category, price, deadline, location, created_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'open')
      RETURNING id, user_id, title, description, category, price, deadline, location, created_at, status
    `;

    const values = [userId, title, description, category || null, price, deadline, location || null];

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
