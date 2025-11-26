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
    const result = await pool.query('SELECT id, name, last_name, email, password, created_at FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // don't send password back
    const { password: _pw, ...userSafe } = user;
    res.status(200).json({ message: 'Login successful', user: userSafe });
  } catch (err) {
    console.error('Error during login:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
