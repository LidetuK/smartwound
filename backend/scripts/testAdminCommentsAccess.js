import fetch from 'node-fetch';

async function testAdminCommentsAccess() {
    try {
        const woundId = 'a7c60107-af66-4950-9e26-35d8df5fca67';
        
        console.log('Testing admin comments access for users...');
        console.log(`Endpoint: /api/admin/wounds/${woundId}/comments`);
        
        // Test without authentication
        const response1 = await fetch(`http://localhost:3001/api/admin/wounds/${woundId}/comments`);
        console.log('Without auth:', response1.status, response1.statusText);
        
        // Test with admin credentials
        console.log('\nTesting with admin credentials...');
        const adminLoginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin'
            })
        });
        
        if (adminLoginResponse.ok) {
            const adminLoginData = await adminLoginResponse.json();
            console.log('✅ Admin login successful');
            
            const adminResponse = await fetch(`http://localhost:3001/api/admin/wounds/${woundId}/comments`, {
                headers: { 'Authorization': `Bearer ${adminLoginData.token}` }
            });
            
            console.log('Admin access:', adminResponse.status, adminResponse.statusText);
            
            if (adminResponse.ok) {
                const comments = await adminResponse.json();
                console.log(`✅ Admin can see ${comments.length} comments:`);
                comments.forEach((comment, index) => {
                    console.log(`${index + 1}. ${comment.comment.substring(0, 60)}...`);
                    console.log(`   By: ${comment.admin?.full_name || 'Unknown'}`);
                });
            }
        } else {
            console.log('❌ Admin login failed');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testAdminCommentsAccess();
