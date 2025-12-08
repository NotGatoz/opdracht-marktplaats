const { pool } = require('../lib/db');

async function checkPdfFilenames() {
  try {
    console.log('Checking pdf_filenames in database...');

    const result = await pool.query(`
      SELECT id, title, pdf_filenames
      FROM opdrachten
      WHERE pdf_filenames IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('Opdrachten with pdf_filenames:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Filenames: ${JSON.stringify(row.pdf_filenames)}`);
    });

    if (result.rows.length === 0) {
      console.log('No opdrachten found with pdf_filenames. Let me check all opdrachten:');

      const allResult = await pool.query(`
        SELECT id, title, pdfs IS NOT NULL as has_pdfs, pdf_filenames IS NOT NULL as has_filenames
        FROM opdrachten
        ORDER BY created_at DESC
        LIMIT 5
      `);

      allResult.rows.forEach(row => {
        console.log(`ID: ${row.id}, Title: ${row.title}, Has PDFs: ${row.has_pdfs}, Has Filenames: ${row.has_filenames}`);
      });
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

checkPdfFilenames();
