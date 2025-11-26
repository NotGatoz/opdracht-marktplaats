export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Placeholder: just returns success
  // TODO: Implement session clearing (delete JWT cookie, session, etc.)
  res.status(200).json({ message: 'Logged out' });
}
