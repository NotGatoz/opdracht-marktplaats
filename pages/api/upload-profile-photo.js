import { pool } from '../../lib/db';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'Fout bij verwerken van formulier' });
    }

    try {
      // Handle formidable file array/object
      let file = files.profilePhoto;
      if (Array.isArray(file)) {
        file = file[0];
      }

      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

      if (!userId || !file) {
        return res.status(400).json({ error: 'User ID en afbeelding zijn vereist' });
      }

      // Read the file
      const fileBuffer = fs.readFileSync(file.filepath);

      // Update user profile photo
      const query = `
        UPDATE users
        SET profile_photo = $1
        WHERE id = $2
        RETURNING id, name, last_name, email, is_admin, is_poster
      `;

      const result = await pool.query(query, [fileBuffer, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Gebruiker niet gevonden' });
      }

      // Clean up temp file
      try {
        fs.unlinkSync(file.filepath);
      } catch (e) {
        console.error('Error cleaning up temp file:', e);
      }

      return res.status(200).json({
        message: 'Profielfoto succesvol geüpload',
        user: result.rows[0],
      });
    } catch (err) {
      console.error('Upload profile photo error:', err);
      return res.status(500).json({ error: 'Serverfout bij uploaden profielfoto' });
    }
  });
}
