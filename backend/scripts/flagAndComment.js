import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../api/db/postgres.js';

async function flagAndComment() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');
        
        // Get first wound and admin user
        const [wounds] = await sequelize.query('SELECT id, type FROM wounds LIMIT 1');
        const [admins] = await sequelize.query('SELECT id FROM users WHERE role = \'admin\' LIMIT 1');
        
        if (wounds.length === 0 || admins.length === 0) {
            console.log('❌ No wounds or admin found');
            return;
        }
        
        const woundId = wounds[0].id;
        const adminId = admins[0].id;
        
        console.log(`🎯 Wound: ${wounds[0].type} (${woundId.substring(0, 8)}...)`);
        
        // Flag the wound
        await sequelize.query(`UPDATE wounds SET flagged = true WHERE id = '${woundId}'`);
        console.log('🚩 Wound flagged');
        
        // Add admin comment
        await sequelize.query(`
            INSERT INTO wound_comments (id, wound_id, admin_id, comment, created_at) 
            VALUES (gen_random_uuid(), '${woundId}', '${adminId}', 'This wound requires medical attention. Please consult a healthcare professional.', NOW())
        `);
        console.log('💬 Admin comment added');
        
        console.log(`\n🔗 View at: http://localhost:3000/wounds/${woundId}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

flagAndComment();
