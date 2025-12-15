import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Opdracht ID is vereist' });
  }

  try {
    // Mark opdracht as completed
    const query = `
      UPDATE opdrachten
      SET status = 'voltooid'
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opdracht niet gevonden' });
    }

    return res.status(200).json({
      message: 'Opdracht succesvol voltooid',
      opdracht: result.rows[0],
    });
  } catch (err) {
    console.error('Complete opdracht error:', err);
    return res.status(500).json({ error: 'Serverfout bij voltooien opdracht' });
  }
}
