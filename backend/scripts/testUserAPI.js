import fetch from 'node-fetch';

async function testUserAPI() {
    try {
        // Login as regular user (not admin)
        console.log('Testing user access to admin comments...');
        
        // Test the admin comments endpoint directly
        const woundId = 'a7c60107-af66-4950-9e26-35d8df5fca67';
        
        console.log(`Testing endpoint: /api/admin/wounds/${woundId}/comments`);
        
        // Try without authentication first
        const response1 = await fetch(`http://localhost:3001/api/admin/wounds/${woundId}/comments`);
        console.log('Without auth:', response1.status, response1.statusText);
        
        // Try to login as a regular user first
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'mikiyanmaw@gmail.com', // Use the user email from screenshot
                password: 'password' // Try common password
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('User login successful');
            
            // Test with user token
            const response2 = await fetch(`http://localhost:3001/api/admin/wounds/${woundId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            
            console.log('With user token:', response2.status, response2.statusText);
            
            if (response2.ok) {
                const comments = await response2.json();
                console.log('Comments received:', comments.length);
                comments.forEach(c => console.log(`- ${c.comment}`));
            } else {
                const errorText = await response2.text();
                console.log('Error response:', errorText);
            }
        } else {
            console.log('User login failed');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testUserAPI();
