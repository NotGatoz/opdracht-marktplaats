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

-- Indexes for better performance
CREATE INDEX idx_opdrachten_user_id ON opdrachten(user_id);
CREATE INDEX idx_opdrachten_status ON opdrachten(status);
CREATE INDEX idx_opdrachten_deadline ON opdrachten(deadline);
CREATE INDEX idx_bids_opdracht_id ON bids(opdracht_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_users_email ON users(email);
