
const SB_URL = "https://jnunreauvcqvekcuzseg.supabase.co/functions/v1/meta-conversions";
const SB_ANON_KEY = "sb_publishable_CFXB86HMxZDE_X0kEcqQXw_SUXKs1Ac";

async function testSupabaseCAPI() {
    console.log("🚀 Testing Supabase -> Meta Pipeline...");

    const payload = {
        event_name: 'ViewContent',
        event_id: 'test_event_' + Date.now(),
        event_source_url: 'https://www.aibazar.pk/verification',
        user_data: {
            email: 'customer@example.com',
            fbp: 'fb.1.123456789'
        },
        custom_data: {
            content_name: 'Verification Test Product',
            value: 999,
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
            console.log("✅ SUCCESS: Supabase accepted and forwarded the event!");
            console.log("Meta Response:", JSON.stringify(result));
        } else {
            console.log("❌ FAILED: Supabase rejected the request.");
            console.log("Status:", response.status);
            console.log("Error:", result);
        }
    } catch (error) {
        console.error("❗ Network Error:", error.message);
    }
}

testSupabaseCAPI();
