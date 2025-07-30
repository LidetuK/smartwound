import fetch from 'node-fetch';

async function testAdminAPI() {
    try {
        // First, login as admin to get token
        console.log('Logging in as admin...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@smartwound.com', // Replace with actual admin email
                password: 'admin123' // Replace with actual admin password
            })
        });
        
        if (!loginResponse.ok) {
            console.log('Login failed. Trying alternative admin credentials...');
            // Try with different credentials
            const altLoginResponse = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@example.com',
                    password: 'password'
                })
            });
            
            if (!altLoginResponse.ok) {
                console.error('Admin login failed with both credential sets');
                return;
            }
            
            const altLoginData = await altLoginResponse.json();
            console.log('Admin login successful with alternative credentials');
            console.log('Token:', altLoginData.token.substring(0, 20) + '...');
            
            await testWithToken(altLoginData.token);
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('Admin login successful');
        console.log('Token:', loginData.token.substring(0, 20) + '...');
        
        await testWithToken(loginData.token);
        
    } catch (error) {
        console.error('Error testing admin API:', error);
    }
}

async function testWithToken(token) {
    try {
        // Get flagged wounds
        console.log('\nFetching flagged wounds...');
        const woundsResponse = await fetch('http://localhost:3001/api/admin/wounds', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cookie': `token=${token}`
            }
        });
        
        if (!woundsResponse.ok) {
            console.error('Failed to fetch wounds:', woundsResponse.status, woundsResponse.statusText);
            return;
        }
        
        const wounds = await woundsResponse.json();
        const flaggedWounds = wounds.filter(w => w.flagged);
        console.log(`Found ${flaggedWounds.length} flagged wounds`);
        
        if (flaggedWounds.length === 0) {
            console.log('No flagged wounds found');
            return;
        }
        
        const wound = flaggedWounds[0];
        console.log(`Testing with wound: ${wound.id} (${wound.type})`);
        
        // Check existing comments
        console.log('\nChecking existing comments...');
        const commentsResponse = await fetch(`http://localhost:3001/api/admin/wounds/${wound.id}/comments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cookie': `token=${token}`
            }
        });
        
        if (commentsResponse.ok) {
            const existingComments = await commentsResponse.json();
            console.log(`Existing comments: ${existingComments.length}`);
            
            if (existingComments.length > 0) {
                console.log('Comments already exist:');
                existingComments.forEach((comment, index) => {
                    console.log(`${index + 1}. ${comment.comment.substring(0, 50)}...`);
                });
                return;
            }
        }
        
        // Add admin comment
        console.log('\nAdding admin comment...');
        const addCommentResponse = await fetch(`http://localhost:3001/api/admin/wounds/${wound.id}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cookie': `token=${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comment: `This ${wound.type} shows signs that require medical attention. The wound appears to have concerning characteristics that warrant professional evaluation. Please monitor for signs of infection including increased redness, swelling, warmth, or discharge. Consider consulting with a healthcare professional for proper assessment and treatment recommendations.`
            })
        });
        
        if (addCommentResponse.ok) {
            const newComment = await addCommentResponse.json();
            console.log('Admin comment added successfully!');
            console.log('Comment ID:', newComment.id);
            console.log('Comment:', newComment.comment.substring(0, 50) + '...');
        } else {
            console.error('Failed to add comment:', addCommentResponse.status, addCommentResponse.statusText);
            const errorText = await addCommentResponse.text();
            console.error('Error details:', errorText);
        }
        
    } catch (error) {
        console.error('Error in testWithToken:', error);
    }
}

testAdminAPI();
