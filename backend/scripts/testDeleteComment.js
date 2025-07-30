import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function testDeleteComment() {
    try {
        console.log('🧪 Testing delete wound comment functionality...');
        
        // First, login as admin to get token
        console.log('🔐 Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@smartwound.com',
            password: 'admin123'
        }, {
            withCredentials: true
        });
        
        console.log('✅ Login successful');
        
        // Get wound comments to find a comment ID
        console.log('📋 Fetching wound comments...');
        const commentsResponse = await axios.get('http://localhost:3001/api/admin/wounds', {
            withCredentials: true
        });
        
        console.log('📊 Found', commentsResponse.data.length, 'wounds');
        
        // Find a flagged wound with comments
        let testCommentId = null;
        for (const wound of commentsResponse.data) {
            if (wound.flagged) {
                console.log('🔍 Checking wound:', wound.id);
                try {
                    const woundCommentsResponse = await axios.get(`http://localhost:3001/api/admin/wounds/${wound.id}/comments`, {
                        withCredentials: true
                    });
                    
                    if (woundCommentsResponse.data.length > 0) {
                        testCommentId = woundCommentsResponse.data[0].id;
                        console.log('💬 Found comment to test:', testCommentId);
                        break;
                    }
                } catch (error) {
                    console.log('⚠️ Could not fetch comments for wound:', wound.id);
                }
            }
        }
        
        if (!testCommentId) {
            console.log('❌ No comments found to test deletion');
            return;
        }
        
        // Test delete comment
        console.log('🗑️ Testing delete comment:', testCommentId);
        const deleteResponse = await axios.delete(`http://localhost:3001/api/admin/wound-comments/${testCommentId}`, {
            withCredentials: true
        });
        
        console.log('✅ Delete response:', deleteResponse.data);
        console.log('🎉 Delete test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('📊 Status:', error.response.status);
        }
    }
}

testDeleteComment();
