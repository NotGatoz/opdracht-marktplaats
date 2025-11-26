import { pool } from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Include is_poster in the SELECT
    const result = await pool.query(
      'SELECT id, name, last_name, email, password, is_admin, is_poster, status, created_at FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Your account is pending admin approval. Please wait.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password before sending back
    const { password: _pw, ...userSafe } = user;

    // Now userSafe includes is_poster
    res.status(200).json({ message: 'Login successful', user: userSafe });
  } catch (err) {
    console.error('Error during login:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
