import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash helper (Meta requires SHA256)
async function hash(value?: string): Promise<string | undefined> {
    if (!value) return undefined;
    const data = new TextEncoder().encode(value.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return new TextDecoder().decode(encode(new Uint8Array(hashBuffer)));
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
        const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");

        if (!PIXEL_ID || !ACCESS_TOKEN) {
            console.error("Missing Meta credentials");
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = await req.json();
        const {
            event_name,
            event_id,
            event_source_url,
            user_data = {},
            custom_data = {},
        } = body;

        // Build the user data object with hashed values
        const metaUserData = {
            em: await hash(user_data.email),
            ph: await hash(user_data.phone),
            fn: await hash(user_data.firstName),
            ln: await hash(user_data.lastName),
            client_ip_address: req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for"),
            client_user_agent: req.headers.get("user-agent"),
            fbp: user_data.fbp,
            fbc: user_data.fbc,
        };

        const payload = {
            data: [
                {
                    event_name,
                    event_time: Math.floor(Date.now() / 1000),
                    event_id,
                    event_source_url,
                    action_source: "website",
                    user_data: metaUserData,
                    custom_data,
                },
            ],
        };

        // Use test_event_code if provided in env or body for debugging
        const testEventCode = body.test_event_code || Deno.env.get("META_TEST_EVENT_CODE");
        if (testEventCode) {
            (payload as any).test_event_code = testEventCode;
        }

        const response = await fetch(
            `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        const result = await response.json();
        console.log(`[Meta CAPI] Event: ${event_name}, ID: ${event_id}, Result:`, result);

        return new Response(JSON.stringify(result), {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("[Meta CAPI Error]:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
