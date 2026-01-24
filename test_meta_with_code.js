
const SB_URL = "https://jnunreauvcqvekcuzseg.supabase.co/functions/v1/meta-conversions";
const SB_ANON_KEY = "sb_publishable_CFXB86HMxZDE_X0kEcqQXw_SUXKs1Ac";
const TEST_CODE = "TEST441";

async function runLiveTest() {
    console.log(`🚀 Sending LIVE Test Event to Meta using code: ${TEST_CODE}...`);

    const payload = {
        event_name: 'ViewContent',
        event_id: 'live_test_' + Date.now(),
        event_source_url: 'https://www.aibazar.pk/verification-done',
        test_event_code: TEST_CODE, // THIS MAKES IT SHOW UP IN TEST EVENTS
        user_data: {
            email: 'test-admin@aibazar.pk',
            firstName: 'AI',
            lastName: 'Bazar'
        },
        custom_data: {
            content_name: 'Verified Tracking System',
            value: 100,
            currency: 'PKR'
        }
    };

    try {
        const response = await fetch(SB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SB_ANON_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ SUCCESS: Event sent to Supabase and Meta Cloud.");
            console.log("Meta Response Trace ID:", result.fbtrace_id);
            console.log("✨ GO CHECK YOUR FACEBOOK EVENTS MANAGER NOW!");
        } else {
            console.log("❌ FAILED:", result);
        }
    } catch (error) {
        console.error("❗ Network Error:", error.message);
    }
}

runLiveTest();
