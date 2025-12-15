import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, phone } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate phone number format (basic validation)
    if (phone && !/^[0-9\s\-\+\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Telefoonnummer heeft ongeldig formaat' });
    }

    // Update phone in database
    const result = await pool.query(
      'UPDATE users SET phone = $1 WHERE id = $2 RETURNING *',
      [phone || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    const user = result.rows[0];
    
    res.status(200).json({
      message: 'Telefoonnummer succesvol bijgewerkt',
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        is_admin: user.is_admin,
        is_poster: user.is_poster,
      },
    });
  } catch (err) {
    console.error('Phone update error:', err);
    res.status(500).json({ error: 'Fout bij opslaan telefoonnummer' });
  }
}
