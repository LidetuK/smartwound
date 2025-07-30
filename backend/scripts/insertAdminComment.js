import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../api/db/postgres.js';

async function insertAdminComment() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Get admin user and flagged wound
        console.log('Finding admin user and flagged wound...');
        
        const [adminResults] = await sequelize.query(`
            SELECT id, full_name, email FROM users WHERE role = 'admin' LIMIT 1
        `);
        
        const [woundResults] = await sequelize.query(`
            SELECT id, type, user_id FROM wounds WHERE flagged = true LIMIT 1
        `);
        
        if (adminResults.length === 0) {
            console.log('❌ No admin user found');
            console.log('Creating admin user...');
            
            // Create admin user
            await sequelize.query(`
                INSERT INTO users (id, email, password, full_name, role, created_at) 
                VALUES (gen_random_uuid(), 'admin@smartwound.com', '$2b$10$hashedpassword', 'Dr. Medical Admin', 'admin', NOW())
            `);
            
            const [newAdminResults] = await sequelize.query(`
                SELECT id, full_name, email FROM users WHERE role = 'admin' LIMIT 1
            `);
            
            if (newAdminResults.length > 0) {
                console.log('✅ Admin user created:', newAdminResults[0].full_name);
            }
        } else {
            console.log('✅ Admin user found:', adminResults[0].full_name, `(${adminResults[0].email})`);
        }
        
        if (woundResults.length === 0) {
            console.log('❌ No flagged wounds found');
            return;
        }
        
        const admin = adminResults[0] || (await sequelize.query(`SELECT id, full_name FROM users WHERE role = 'admin' LIMIT 1`))[0][0];
        const wound = woundResults[0];
        
        console.log('✅ Flagged wound found:', wound.type, `(ID: ${wound.id})`);
        
        // Check existing comments
        const [existingComments] = await sequelize.query(`
            SELECT id, comment FROM wound_comments WHERE wound_id = '${wound.id}'
        `);
        
        console.log(`📝 Existing comments: ${existingComments.length}`);
        
        if (existingComments.length > 0) {
            console.log('Comments already exist for this wound:');
            existingComments.forEach((comment, index) => {
                console.log(`${index + 1}. ${comment.comment.substring(0, 60)}...`);
            });
            return;
        }
        
        // Insert admin comments
        console.log('Adding admin comments...');
        
        const comments = [
            `This ${wound.type} shows concerning signs that require immediate medical attention. The wound characteristics indicate potential complications that need professional evaluation. Please monitor closely for signs of infection including increased redness, swelling, warmth, or unusual discharge.`,
            `Medical Recommendation: Clean the wound gently with sterile saline solution twice daily. Apply prescribed antibiotic ointment if available. Keep the wound covered with sterile gauze. Seek immediate medical care if you notice red streaking, fever, or worsening symptoms. Do not delay professional treatment.`
        ];
        
        for (let i = 0; i < comments.length; i++) {
            await sequelize.query(`
                INSERT INTO wound_comments (id, wound_id, admin_id, comment, created_at) 
                VALUES (gen_random_uuid(), '${wound.id}', '${admin.id}', $1, NOW())
            `, {
                bind: [comments[i]]
            });
            console.log(`✅ Added comment ${i + 1}`);
        }
        
        // Verify comments were added
        const [verifyComments] = await sequelize.query(`
            SELECT wc.comment, wc.created_at, u.full_name 
            FROM wound_comments wc 
            JOIN users u ON wc.admin_id = u.id 
            WHERE wc.wound_id = '${wound.id}'
            ORDER BY wc.created_at ASC
        `);
        
        console.log(`\n🎉 Successfully added ${verifyComments.length} admin comments!`);
        verifyComments.forEach((comment, index) => {
            console.log(`${index + 1}. "${comment.comment.substring(0, 80)}..." - by ${comment.full_name}`);
        });
        
        console.log('\n✅ Admin comments are now ready to display in the frontend!');
        console.log('🔄 Refresh the wound detail page to see the comments.');
        
    } catch (error) {
        console.error('❌ Error inserting admin comments:', error);
    } finally {
        await sequelize.close();
        console.log('\n🔌 Database connection closed.');
    }
}

insertAdminComment();
