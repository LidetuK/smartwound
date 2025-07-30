import fetch from 'node-fetch';

async function testNewEndpoint() {
    try {
        const woundId = 'a7c60107-af66-4950-9e26-35d8df5fca67';
        
        console.log('Testing new user-accessible admin comments endpoint...');
        console.log(`Endpoint: /api/wounds/${woundId}/admin-comments`);
        
        // Test without authentication
        const response1 = await fetch(`http://localhost:3001/api/wounds/${woundId}/admin-comments`);
        console.log('Without auth:', response1.status, response1.statusText);
        
        // Try to login as user (we need to find the correct credentials)
        console.log('\nTrying to login as user...');
        
        // Test with different user credentials
        const userCredentials = [
            { email: 'mikiyanmaw@gmail.com', password: 'password' },
            { email: 'user@example.com', password: 'password' },
            { email: 'test@test.com', password: 'password' }
        ];
        
        for (const creds of userCredentials) {
            const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds)
            });
            
            if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                console.log(`✅ Login successful with ${creds.email}`);
                
                // Test the new endpoint
                const response2 = await fetch(`http://localhost:3001/api/wounds/${woundId}/admin-comments`, {
                    headers: { 'Authorization': `Bearer ${loginData.token}` }
                });
                
                console.log('With user token:', response2.status, response2.statusText);
                
                if (response2.ok) {
                    const comments = await response2.json();
                    console.log(`✅ Comments received: ${comments.length}`);
                    comments.forEach((c, i) => console.log(`${i + 1}. ${c.comment.substring(0, 60)}...`));
                } else {
                    const errorText = await response2.text();
                    console.log('❌ Error response:', errorText);
                }
                break;
            } else {
                console.log(`❌ Login failed for ${creds.email}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testNewEndpoint();
