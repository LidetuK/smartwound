import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../api/db/postgres.js';

// SQL to create the wound_comments table
const createWoundCommentsTable = `
CREATE TABLE IF NOT EXISTS wound_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wound_id UUID NOT NULL,
    admin_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (wound_id) REFERENCES wounds(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wound_comments_wound_id ON wound_comments(wound_id);
CREATE INDEX IF NOT EXISTS idx_wound_comments_admin_id ON wound_comments(admin_id);
`;

async function createTable() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        console.log('Creating wound_comments table...');
        await sequelize.query(createWoundCommentsTable);
        console.log('wound_comments table created successfully!');
        
        // Also sync all models to ensure everything is up to date
        console.log('Syncing all models...');
        await sequelize.sync({ alter: true });
        console.log('All models synced successfully!');
        
    } catch (error) {
        console.error('Error creating wound_comments table:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

createTable();
