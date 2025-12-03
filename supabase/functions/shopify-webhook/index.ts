import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify Shopify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(payload, "utf8");
  const computedSignature = hmac.digest("base64");
  
  // Compare signatures securely
  if (signature.length !== computedSignature.length) {
    return false;
  }
  
  return signature === computedSignature;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-shopify-hmac-sha256");

    if (!signature) {
      console.error("Missing webhook signature");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderData = JSON.parse(rawBody);
    console.log("Received Shopify order webhook:", orderData.id);

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", orderData.email)
      .single();

    if (userError || !userData) {
      console.log("No user found for email:", orderData.email, "- storing order without user association");
    }

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("shopify_order_id", String(orderData.id))
      .single();

    if (existingOrder) {
      console.log("Order already exists:", orderData.id);
      return new Response(JSON.stringify({ message: "Order already exists" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare order data
    const orderRecord = {
      shopify_order_id: String(orderData.id),
      shopify_order_number: String(orderData.order_number || orderData.name),
      email: orderData.email,
      user_id: userData?.id || null,
      status: mapShopifyStatus(orderData.fulfillment_status, orderData.financial_status),
      financial_status: orderData.financial_status,
      fulfillment_status: orderData.fulfillment_status,
      total_price: parseFloat(orderData.total_price || "0"),
      subtotal_price: parseFloat(orderData.subtotal_price || "0"),
      total_tax: parseFloat(orderData.total_tax || "0"),
      total_shipping: parseFloat(orderData.total_shipping_price_set?.shop_money?.amount || "0"),
      currency_code: orderData.currency || "USD",
      customer_name: orderData.customer?.first_name 
        ? `${orderData.customer.first_name} ${orderData.customer.last_name || ""}`.trim()
        : null,
      shipping_address: orderData.shipping_address || null,
      billing_address: orderData.billing_address || null,
    };

    // Insert order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert(orderRecord)
      .select("id")
      .single();

    if (orderError) {
      console.error("Error inserting order:", orderError);
      return new Response(JSON.stringify({ error: "Failed to insert order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Created order:", newOrder.id);

    // Insert order items
    if (orderData.line_items && orderData.line_items.length > 0) {
      const orderItems = orderData.line_items.map((item: any) => ({
        order_id: newOrder.id,
        shopify_product_id: String(item.product_id || ""),
        shopify_variant_id: String(item.variant_id || ""),
        product_title: item.title || "Unknown Product",
        variant_title: item.variant_title || null,
        quantity: item.quantity || 1,
        price: parseFloat(item.price || "0"),
        total: parseFloat(item.price || "0") * (item.quantity || 1),
        image_url: item.image?.src || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error inserting order items:", itemsError);
      } else {
        console.log("Created", orderItems.length, "order items");
      }
    }

    // Send order confirmation email
    try {
      const emailPayload = {
        type: "confirmation",
        email: orderData.email,
        customerName: orderRecord.customer_name || "Customer",
        orderNumber: orderRecord.shopify_order_number,
        items: orderData.line_items?.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price || "0"),
        })) || [],
        totalPrice: orderRecord.total_price,
        currencyCode: orderRecord.currency_code,
        shippingAddress: orderData.shipping_address,
      };

      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify(emailPayload),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send confirmation email:", await emailResponse.text());
      } else {
        console.log("Confirmation email sent successfully");
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return new Response(JSON.stringify({ success: true, orderId: newOrder.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Map Shopify statuses to our order_status enum
function mapShopifyStatus(fulfillmentStatus: string | null, financialStatus: string | null): string {
  if (fulfillmentStatus === "fulfilled") return "delivered";
  if (fulfillmentStatus === "partial") return "shipped";
  if (fulfillmentStatus === "in_transit") return "shipped";
  if (financialStatus === "paid") return "confirmed";
  if (financialStatus === "pending") return "pending";
  if (financialStatus === "refunded") return "cancelled";
  return "pending";
}
