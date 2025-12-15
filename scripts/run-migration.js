const fs = require('fs');
const { pool } = require('../lib/db');

async function runMigration() {
  try {
    // Run user fields migration
    const userFieldsSql = fs.readFileSync('./scripts/add-user-fields.sql', 'utf-8');
    await pool.query(userFieldsSql);
    console.log('✓ User fields migration completed');

    // Run bid status migration
    const bidStatusSql = fs.readFileSync('./scripts/add-bid-status.sql', 'utf-8');
    await pool.query(bidStatusSql);
    console.log('✓ Bid status migration completed');

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigration();
