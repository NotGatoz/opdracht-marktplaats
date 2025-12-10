-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending',
    is_poster BOOLEAN DEFAULT FALSE,
    login_count INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Opdrachten table
CREATE TABLE opdrachten (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255),
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_city VARCHAR(255),
    location_address VARCHAR(255),
    location_postcode VARCHAR(255),
    opbouw_date DATE,
    opbouw_time TIME,
    hard_opbouw VARCHAR(10),
    opbouw_dagen_amount INTEGER,
    opbouw_men_needed INTEGER,
    planning_afbouw_date DATE,
    planning_afbouw_time TIME,
    hard_afbouw VARCHAR(10),
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
    magazijnbon_link VARCHAR(500),
    project_map_opbouw_link VARCHAR(500),
    project_map_afbouw_link VARCHAR(500),
    storageplace_adres VARCHAR(255),
    images TEXT[], -- Array of base64 encoded images
    pdfs TEXT[],   -- Array of base64 encoded PDFs
    pdf_filenames TEXT[], -- Array of PDF filenames
    accepted_bid_user_id INTEGER REFERENCES users(id)
);

-- Bids table
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    opdracht_id INTEGER REFERENCES opdrachten(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    comment TEXT
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    opdracht_id INTEGER REFERENCES opdrachten(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Indexes for better performance
CREATE INDEX idx_opdrachten_user_id ON opdrachten(user_id);
CREATE INDEX idx_opdrachten_status ON opdrachten(status);
CREATE INDEX idx_opdrachten_deadline ON opdrachten(deadline);
CREATE INDEX idx_opdrachten_created_at ON opdrachten(created_at);
CREATE INDEX idx_opdrachten_category ON opdrachten(category);
CREATE INDEX idx_opdrachten_location_city ON opdrachten(location_city);
CREATE INDEX idx_opdrachten_accepted_bid_user_id ON opdrachten(accepted_bid_user_id);
CREATE INDEX idx_bids_opdracht_id ON bids(opdracht_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_created_at ON bids(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_is_admin ON users(is_admin);
CREATE INDEX idx_users_is_poster ON users(is_poster);
CREATE INDEX idx_messages_opdracht_id ON messages(opdracht_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Composite indexes for common query patterns
CREATE INDEX idx_opdrachten_status_deadline ON opdrachten(status, deadline);
CREATE INDEX idx_opdrachten_user_status ON opdrachten(user_id, status);
CREATE INDEX idx_bids_opdracht_user ON bids(opdracht_id, user_id);
CREATE INDEX idx_messages_opdracht_created ON messages(opdracht_id, created_at DESC);
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_opdracht_user_read ON messages(opdracht_id, user_id, is_read);

-- Partial indexes for better performance on filtered queries
CREATE INDEX idx_opdrachten_open_status ON opdrachten(status) WHERE status = 'open';
CREATE INDEX idx_opdrachten_accepted_status ON opdrachten(status) WHERE status = 'accepted';
CREATE INDEX idx_messages_unread ON messages(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_users_active ON users(status) WHERE status = 'active';
CREATE INDEX idx_users_pending ON users(status) WHERE status = 'pending';
