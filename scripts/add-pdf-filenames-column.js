const { pool } = require('../lib/db');

async function addPdfFilenamesColumn() {
  try {
    console.log('Adding pdf_filenames column to opdrachten table...');

    await pool.query(`
      ALTER TABLE opdrachten
      ADD COLUMN IF NOT EXISTS pdf_filenames TEXT[];
    `);

    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await pool.end();
  }
}

addPdfFilenamesColumn();
