export default async function handler(req, res) {
  // Placeholder: returns null (not logged in)
  // TODO: Implement session management with JWT or cookies
  // For now, no user is "logged in" by default
  res.status(200).json({ user: null });
}
