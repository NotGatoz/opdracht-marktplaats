// This file documents the database schema needed for opdrachten (tasks)
// Run this SQL in your Supabase database to create the opdrachten table:

/*
CREATE TABLE opdrachten (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  deadline DATE NOT NULL,
  location_city VARCHAR(255),
  location_address VARCHAR(255),
  location_postcode VARCHAR(10),
  verwachtte_opbouw_tijd_datums TEXT,
  verwachtte_opbouw_tijd_uren TEXT,
  hard_opbouw VARCHAR(3), -- Ja/Nee
  opbouw_dagen_amount INTEGER,
  opbouw_men_needed INTEGER,
  voorkeur_opbouw TEXT,
  planning_afbouw_date DATE,
  planning_afbouw_time TIME,
  hard_afbouw VARCHAR(3), -- Ja/Nee
  afbouw_dagen_amount INTEGER,
  afbouw_men_needed INTEGER,
  opbouw_transport_type VARCHAR(255),
  opbouw_transport_amount INTEGER,
  afbouw_transport_type VARCHAR(255),
  afbouw_transport_amount INTEGER,
  opbouw_hoogwerkers_type VARCHAR(255),
  opbouw_hoogwerkers_amount INTEGER,
  afbouw_hoogwerkers_type VARCHAR(255),
  afbouw_hoogwerkers_amount INTEGER,
  magazijnbon_link TEXT,
  project_map_opbouw_link TEXT,
  project_map_afbouw_link TEXT,
  storageplace_adres TEXT,
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
