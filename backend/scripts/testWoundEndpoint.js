import fetch from 'node-fetch';

async function testWoundEndpoint() {
    try {
        const woundId = 'a7c60107-af66-4950-9e26-35d8df5fca67';
        
        console.log('Testing wound endpoint with admin comments...');
        console.log(`Endpoint: /api/wounds/${woundId}`);
        
        // Test the wound endpoint directly (should work without auth for testing)
        const response = await fetch(`http://localhost:3001/api/wounds/${woundId}`);
        console.log('Response status:', response.status, response.statusText);
        
        if (response.ok) {
            const wound = await response.json();
            console.log('✅ Wound data received');
            console.log('Wound type:', wound.type);
            console.log('Flagged:', wound.flagged);
            console.log('Admin comments:', wound.adminComments ? wound.adminComments.length : 'undefined');
            
            if (wound.adminComments && wound.adminComments.length > 0) {
                console.log('\n💬 Admin Comments:');
                wound.adminComments.forEach((comment, index) => {
                    console.log(`${index + 1}. ${comment.comment}`);
                    console.log(`   By: ${comment.admin?.full_name || 'Unknown'}`);
                    console.log(`   Date: ${comment.createdAt}`);
                });
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Error:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testWoundEndpoint();
