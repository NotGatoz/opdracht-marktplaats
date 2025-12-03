import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Opdracht ID is vereist' });
  }

  try {
    // First check if the opdracht exists and belongs to the user
    const checkQuery = 'SELECT user_id FROM opdrachten WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Opdracht niet gevonden' });
    }

    // Delete related bids first
    await pool.query('DELETE FROM bids WHERE opdracht_id = $1', [id]);

    // Delete the opdracht
    const deleteQuery = 'DELETE FROM opdrachten WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    return res.status(200).json({ message: 'Opdracht succesvol verwijderd' });
  } catch (err) {
    console.error('Error deleting opdracht:', err);
    return res.status(500).json({
      error: 'Fout bij het verwijderen van de opdracht',
      detail: err.message,
    });
  }
}
