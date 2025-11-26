// This file documents the database schema needed for opdrachten (tasks)
// Run this SQL in your Supabase database to create the opdrachten table:

/*
CREATE TABLE opdrachten (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  deadline DATE NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_opdrachten_user_id ON opdrachten(user_id);
CREATE INDEX idx_opdrachten_status ON opdrachten(status);
CREATE INDEX idx_opdrachten_created_at ON opdrachten(created_at);
*/
