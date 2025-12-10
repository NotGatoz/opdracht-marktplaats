-- Performance optimization migration script
-- Run this script to add performance indexes to existing database

-- Additional indexes for opdrachten table
CREATE INDEX IF NOT EXISTS idx_opdrachten_created_at ON opdrachten(created_at);
CREATE INDEX IF NOT EXISTS idx_opdrachten_category ON opdrachten(category);
CREATE INDEX IF NOT EXISTS idx_opdrachten_location_city ON opdrachten(location_city);
CREATE INDEX IF NOT EXISTS idx_opdrachten_accepted_bid_user_id ON opdrachten(accepted_bid_user_id);

-- Additional indexes for bids table
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

-- Additional indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_is_poster ON users(is_poster);

-- Additional indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_opdrachten_status_deadline ON opdrachten(status, deadline);
CREATE INDEX IF NOT EXISTS idx_opdrachten_user_status ON opdrachten(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bids_opdracht_user ON bids(opdracht_id, user_id);
CREATE INDEX IF NOT EXISTS idx_messages_opdracht_created ON messages(opdracht_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_opdracht_user_read ON messages(opdracht_id, user_id, is_read);

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_opdrachten_open_status ON opdrachten(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_opdrachten_accepted_status ON opdrachten(status) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_pending ON users(status) WHERE status = 'pending';

-- Add is_read column to messages table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'is_read') THEN
        ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
