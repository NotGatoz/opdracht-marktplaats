import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is vereist' });
  }

  try {
    const query = `
      SELECT profile_photo
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0 || !result.rows[0].profile_photo) {
      return res.status(404).json({ error: 'Profielfoto niet gevonden' });
    }

    const profilePhoto = result.rows[0].profile_photo;
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(profilePhoto);
  } catch (err) {
    console.error('Get profile photo error:', err);
    return res.status(500).json({ error: 'Serverfout bij ophalen profielfoto' });
  }
}
