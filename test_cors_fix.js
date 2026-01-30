// Quick test to verify CORS is fixed
const testCORS = async () => {
    console.log('🧪 Testing CORS fix...\n');

    const url = 'https://jnunreauvcqvekcuzseg.supabase.co/functions/v1/meta-conversions';

    // Test 1: OPTIONS request (CORS preflight)
    console.log('1️⃣ Testing OPTIONS request (CORS preflight)...');
    try {
        const optionsResponse = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://www.aibazar.pk',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'content-type'
            }
        });

        console.log(`   Status: ${optionsResponse.status}`);
        console.log(`   CORS Headers:`);
        console.log(`   - Access-Control-Allow-Origin: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
        console.log(`   - Access-Control-Allow-Methods: ${optionsResponse.headers.get('Access-Control-Allow-Methods')}`);

        if (optionsResponse.status === 200) {
            console.log('   ✅ OPTIONS request successful!\n');
        } else {
            console.log('   ❌ OPTIONS request failed!\n');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Test 2: Actual POST request
    console.log('2️⃣ Testing POST request (actual event)...');
    try {
        const postResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://www.aibazar.pk'
            },
            body: JSON.stringify({
                event_name: 'PageView',
                event_id: 'test_' + Date.now(),
                event_source_url: 'https://www.aibazar.pk/test',
                user_data: {},
                custom_data: {}
            })
        });

        console.log(`   Status: ${postResponse.status}`);
        const result = await postResponse.json();
        console.log(`   Response:`, result);

        if (postResponse.ok) {
            console.log('   ✅ POST request successful!\n');
        } else {
            console.log('   ❌ POST request failed!\n');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    console.log('✨ Test complete! If both tests passed, CORS is fixed.');
};

testCORS();
