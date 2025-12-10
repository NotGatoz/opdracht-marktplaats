const { pool } = require('../lib/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Starting performance optimization migration...');

    // Read the SQL migration file
    const sqlFilePath = path.join(__dirname, 'add-performance-indexes.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the migration
    await pool.query(sqlContent);

    console.log('✅ Performance optimization migration completed successfully!');
    console.log('Added comprehensive indexes for better query performance.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
