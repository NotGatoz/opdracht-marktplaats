const { pool } = require('../lib/db');
const fs = require('fs');
const path = require('path');

async function createMessagesTable() {
  try {
    console.log('Creating messages table...');

    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Extract the messages table creation SQL
    const messagesTableSQL = schemaSQL.match(/-- Messages table[\s\S]*?CREATE INDEX idx_messages_created_at ON messages\(created_at\);/);

    if (!messagesTableSQL) {
      throw new Error('Could not find messages table SQL in schema.sql');
    }

    // Execute the SQL
    await pool.query(messagesTableSQL[0]);
    console.log('Messages table created successfully!');

  } catch (error) {
    console.error('Error creating messages table:', error);
  } finally {
    process.exit(0);
  }
}

createMessagesTable();
