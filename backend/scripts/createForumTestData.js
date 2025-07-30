import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../api/db/postgres.js';
import { User, ForumPost, ForumComment } from '../api/models/index.js';

async function createForumTestData() {
    try {
        console.log('🔗 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Find or create a test user
        let testUser = await User.findOne({ where: { email: 'test@example.com' } });
        if (!testUser) {
            testUser = await User.create({
                email: 'test@example.com',
                password: '$2b$10$hashedpassword',
                full_name: 'Test User',
                role: 'user'
            });
            console.log('👤 Created test user');
        } else {
            console.log('👤 Found existing test user');
        }
        
        // Create forum posts
        const posts = [
            {
                user_id: testUser.id,
                wound_type: 'Cut',
                content: 'I have a deep cut on my finger from cooking. It\'s been bleeding for a while. What should I do?',
                flagged: false
            },
            {
                user_id: testUser.id,
                wound_type: 'Burn',
                content: 'Got burned by hot oil while cooking. The skin is red and blistering. Should I be worried?',
                flagged: true
            },
            {
                user_id: testUser.id,
                wound_type: 'Scrape',
                content: 'Fell off my bike and scraped my knee badly. There\'s gravel stuck in it. How do I clean it?',
                flagged: false
            }
        ];
        
        console.log('📝 Creating forum posts...');
        const createdPosts = [];
        for (const postData of posts) {
            const post = await ForumPost.create(postData);
            createdPosts.push(post);
            console.log(`✅ Created post: ${post.content.substring(0, 50)}...`);
        }
        
        // Create forum comments
        const comments = [
            {
                post_id: createdPosts[0].id,
                user_id: testUser.id,
                content: 'You should clean it with antiseptic and apply pressure to stop bleeding.',
                flagged: false
            },
            {
                post_id: createdPosts[0].id,
                user_id: testUser.id,
                content: 'If it\'s deep, you might need stitches. Consider seeing a doctor.',
                flagged: false
            },
            {
                post_id: createdPosts[1].id,
                user_id: testUser.id,
                content: 'This looks serious! You should go to the ER immediately!',
                flagged: true
            },
            {
                post_id: createdPosts[2].id,
                user_id: testUser.id,
                content: 'Remove the gravel carefully with tweezers and clean with saline solution.',
                flagged: false
            }
        ];
        
        console.log('💬 Creating forum comments...');
        for (const commentData of comments) {
            const comment = await ForumComment.create(commentData);
            console.log(`✅ Created comment: ${comment.content.substring(0, 50)}...`);
        }
        
        console.log('🎉 Forum test data created successfully!');
        console.log(`📊 Created ${createdPosts.length} posts and ${comments.length} comments`);
        
    } catch (error) {
        console.error('❌ Error creating forum test data:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed.');
    }
}

createForumTestData();
