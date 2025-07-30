import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../api/db/postgres.js';
import { User, Wound, WoundComment } from '../api/models/index.js';

async function addSampleComments() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Find an admin user
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        if (!adminUser) {
            console.log('No admin user found. Creating one...');
            const newAdmin = await User.create({
                email: 'admin@smartwound.com',
                password: '$2b$10$hashedpassword', // This would be properly hashed in real app
                full_name: 'Dr. Medical Admin',
                role: 'admin'
            });
            console.log('Admin user created:', newAdmin.full_name);
        }
        
        // Find flagged wounds
        const flaggedWounds = await Wound.findAll({ where: { flagged: true } });
        console.log(`Found ${flaggedWounds.length} flagged wounds`);
        
        if (flaggedWounds.length === 0) {
            console.log('No flagged wounds found. Creating a sample flagged wound...');
            // You would need to create a flagged wound here if none exist
            return;
        }
        
        // Add admin comments to each flagged wound
        for (const wound of flaggedWounds) {
            console.log(`Adding admin comments to wound ${wound.id} (${wound.type})`);
            
            // Check if comments already exist
            const existingComments = await WoundComment.findAll({ where: { wound_id: wound.id } });
            if (existingComments.length > 0) {
                console.log(`Wound ${wound.id} already has ${existingComments.length} comments`);
                continue;
            }
            
            // Add sample admin comments
            const comments = [
                {
                    wound_id: wound.id,
                    admin_id: adminUser.id,
                    comment: `This ${wound.type} shows signs of potential infection. The redness and swelling around the wound area are concerning. Please monitor for increased pain, warmth, or discharge. Consider consulting with a healthcare professional for proper antibiotic treatment if symptoms worsen.`
                },
                {
                    wound_id: wound.id,
                    admin_id: adminUser.id,
                    comment: `Recommendation: Clean the wound gently with saline solution twice daily. Apply antibiotic ointment as directed. Keep the wound covered with a sterile bandage. Seek immediate medical attention if you notice red streaking, fever, or increased drainage.`
                }
            ];
            
            for (const commentData of comments) {
                await WoundComment.create(commentData);
                console.log(`Added comment to wound ${wound.id}`);
            }
        }
        
        console.log('Sample admin comments added successfully!');
        
    } catch (error) {
        console.error('Error adding sample comments:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

addSampleComments();
