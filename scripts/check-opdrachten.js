const { pool } = require('../lib/db');

async function checkOpdrachten() {
  try {
    const result = await pool.query('SELECT * FROM opdrachten');
    console.log('Opdrachten in database:', result.rows);
    console.log('Number of opdrachten:', result.rows.length);
  } catch (err) {
    console.error('Error checking opdrachten:', err);
  } finally {
    pool.end();
  }
}

checkOpdrachten();
