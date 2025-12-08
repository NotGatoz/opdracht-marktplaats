const { pool } = require('../lib/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT 1');
    console.log('Connection successful:', result.rows);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();
