import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, index } = req.query;

  if (!id || index === undefined) {
    return res.status(400).json({ error: 'Missing id or index' });
  }

  try {
    const result = await pool.query('SELECT pdfs FROM opdrachten WHERE id = $1', [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Opdracht not found' });
    }

    const pdfs = result.rows[0].pdfs;

    if (!pdfs || !Array.isArray(pdfs) || index >= pdfs.length) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdfBase64 = pdfs[index];

    // Decode base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="opdracht-${id}-pdf-${index + 1}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error serving PDF:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
