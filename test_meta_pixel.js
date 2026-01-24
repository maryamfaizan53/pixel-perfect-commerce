
const PIXEL_ID = "911345104701060";
const ACCESS_TOKEN = "EAAcHkJi6efoBQuSrZC3ZCZCY60maINHdVMZBuYj64LUKao6wOrpdyejNs8A9sozatPZB9h6GOM7QnHar0qbx3dbLpvZAZBU1bIwI5yy2FvqOq3zdqGq9nonVoo3NN6zL68wzAuiovgLw4oNDecYZCEv1SZCqiZAkhgRypjFRAunX8COny1OVk7FCDjydviSrcZCadOoBQZDZD";

async function testMetaCAPI() {
    console.log("🚀 Starting Meta CAPI Test...");

    const payload = {
        data: [
            {
                event_name: 'PageView',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                event_source_url: 'https://www.aibazar.pk/test-verification',
                user_data: {
                    client_ip_address: '127.0.0.1',
                    client_user_agent: 'Antigravity Verification Agent'
                },
                custom_data: {
                    test_mode: true
                }
            }
        ]
    };

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        if (result.fbtrace_id) {
            console.log("✅ SUCCESS: Meta accepted the event!");
            console.log("Trace ID:", result.fbtrace_id);
            console.log("Events Received:", result.events_received);
        } else {
            console.log("❌ FAILED: Meta rejected the event.");
            console.log("Error Details:", result);
        }
    } catch (error) {
        console.error("❗ Network Error:", error.message);
    }
}

testMetaCAPI();
