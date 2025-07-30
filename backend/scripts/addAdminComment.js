import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../api/db/postgres.js';

async function addAdminComment() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Get the first admin user and first flagged wound
        const adminQuery = `SELECT id, full_name FROM users WHERE role = 'admin' LIMIT 1`;
        const woundQuery = `SELECT id, type FROM wounds WHERE flagged = true LIMIT 1`;
        
        const [adminResults] = await sequelize.query(adminQuery);
        const [woundResults] = await sequelize.query(woundQuery);
        
        if (adminResults.length === 0) {
            console.log('No admin user found');
            return;
        }
        
        if (woundResults.length === 0) {
            console.log('No flagged wounds found');
            return;
        }
        
        const admin = adminResults[0];
        const wound = woundResults[0];
        
        console.log(`Admin: ${admin.full_name} (${admin.id})`);
        console.log(`Wound: ${wound.type} (${wound.id})`);
        
        // Check if comments already exist
        const existingQuery = `SELECT COUNT(*) as count FROM wound_comments WHERE wound_id = '${wound.id}'`;
        const [existingResults] = await sequelize.query(existingQuery);
        const existingCount = existingResults[0].count;
        
        console.log(`Existing comments: ${existingCount}`);
        
        if (existingCount > 0) {
            console.log('Comments already exist for this wound');
            return;
        }
        
        // Insert admin comments
        const insertQuery = `
            INSERT INTO wound_comments (wound_id, admin_id, comment, created_at) VALUES 
            ('${wound.id}', '${admin.id}', 'This ${wound.type} shows signs of potential infection. The redness and swelling around the wound area are concerning. Please monitor for increased pain, warmth, or discharge. Consider consulting with a healthcare professional for proper antibiotic treatment if symptoms worsen.', NOW()),
            ('${wound.id}', '${admin.id}', 'Recommendation: Clean the wound gently with saline solution twice daily. Apply antibiotic ointment as directed. Keep the wound covered with a sterile bandage. Seek immediate medical attention if you notice red streaking, fever, or increased drainage.', NOW())
        `;
        
        await sequelize.query(insertQuery);
        console.log('Admin comments added successfully!');
        
        // Verify the comments were added
        const verifyQuery = `
            SELECT wc.comment, wc.created_at, u.full_name 
            FROM wound_comments wc 
            JOIN users u ON wc.admin_id = u.id 
            WHERE wc.wound_id = '${wound.id}'
            ORDER BY wc.created_at ASC
        `;
        const [verifyResults] = await sequelize.query(verifyQuery);
        
        console.log(`\nAdded ${verifyResults.length} comments:`);
        verifyResults.forEach((comment, index) => {
            console.log(`${index + 1}. ${comment.comment.substring(0, 50)}... - by ${comment.full_name}`);
        });
        
    } catch (error) {
        console.error('Error adding admin comments:', error);
    } finally {
        await sequelize.close();
        console.log('\nDatabase connection closed.');
    }
}

addAdminComment();
