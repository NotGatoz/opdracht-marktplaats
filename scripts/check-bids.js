const { pool } = require('../lib/db');

async function checkBids() {
  try {
    const result = await pool.query('SELECT * FROM bids');
    console.log('Bids in database:', result.rows);
    console.log('Number of bids:', result.rows.length);
  } catch (err) {
    console.error('Error checking bids:', err);
  } finally {
    pool.end();
  }
}

checkBids();
