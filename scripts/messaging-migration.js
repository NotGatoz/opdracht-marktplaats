const { pool } = require('../lib/db');

async function runMessagingMigration() {
  try {
    console.log('🚀 Starting comprehensive messaging migration...');

    // Step 1: Create messages table
    console.log('📝 Creating messages table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        opdracht_id INTEGER REFERENCES opdrachten(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_read BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('✅ Messages table created');

    // Step 2: Add basic indexes for messages
    console.log('🔍 Adding basic message indexes...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_opdracht_id ON messages(opdracht_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);`);
    console.log('✅ Basic message indexes added');

    // Step 3: Add composite indexes for messages
    console.log('🔗 Adding composite message indexes...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_opdracht_created ON messages(opdracht_id, created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_opdracht_user_read ON messages(opdracht_id, user_id, is_read);`);
    console.log('✅ Composite message indexes added');

    // Step 4: Add partial indexes for messages
    console.log('🎯 Adding partial message indexes...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(user_id, is_read) WHERE is_read = FALSE;`);
    console.log('✅ Partial message indexes added');

    // Step 5: Add performance indexes for other tables
    console.log('⚡ Adding performance indexes for other tables...');

    // Opdrachten indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_created_at ON opdrachten(created_at);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_category ON opdrachten(category);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_location_city ON opdrachten(location_city);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_accepted_bid_user_id ON opdrachten(accepted_bid_user_id);`);

    // Bids indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);`);

    // Users indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_is_poster ON users(is_poster);`);

    // Composite indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_status_deadline ON opdrachten(status, deadline);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_user_status ON opdrachten(user_id, status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bids_opdracht_user ON bids(opdracht_id, user_id);`);

    // Partial indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_open_status ON opdrachten(status) WHERE status = 'open';`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_opdrachten_accepted_status ON opdrachten(status) WHERE status = 'accepted';`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_active ON users(status) WHERE status = 'active';`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_pending ON users(status) WHERE status = 'pending';`);

    console.log('✅ Performance indexes added');

    console.log('🎉 Messaging migration completed successfully!');
    console.log('');
    console.log('📋 Summary of changes:');
    console.log('   • Created messages table with is_read column');
    console.log('   • Added 4 basic message indexes');
    console.log('   • Added 3 composite message indexes');
    console.log('   • Added 1 partial message index');
    console.log('   • Added 15 performance indexes for other tables');
    console.log('');
    console.log('🚀 Your messaging system is now optimized for performance!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMessagingMigration();
