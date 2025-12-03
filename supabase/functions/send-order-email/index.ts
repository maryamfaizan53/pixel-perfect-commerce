import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  type: "confirmation" | "shipped" | "delivered";
  email: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  currencyCode: string;
  shippingAddress?: {
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  trackingUrl?: string;
}

function generateOrderConfirmationEmail(data: OrderEmailRequest): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${data.currencyCode} ${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const shippingAddressHtml = data.shippingAddress
    ? `
    <div style="margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
      <h3 style="margin: 0 0 12px 0; color: #333;">Shipping Address</h3>
      <p style="margin: 0; color: #666; line-height: 1.5;">
        ${data.shippingAddress.address1 || ""}<br>
        ${data.shippingAddress.city || ""}, ${data.shippingAddress.province || ""} ${data.shippingAddress.zip || ""}<br>
        ${data.shippingAddress.country || ""}
      </p>
    </div>
  `
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Order Confirmed!</h1>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Hi ${data.customerName || "there"},
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Thank you for your order! We're getting it ready to be shipped. We'll notify you when it's on its way.
            </p>
            
            <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong style="color: #333;">Order Number:</strong> #${data.orderNumber}
              </p>
            </div>
            
            <h2 style="color: #333; font-size: 18px; margin: 24px 0 16px 0;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; color: #666; font-weight: 600;">Item</th>
                  <th style="padding: 12px; text-align: center; color: #666; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #666; font-weight: 600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: 600; color: #333;">Total</td>
                  <td style="padding: 16px 12px; text-align: right; font-weight: 600; color: #333; font-size: 18px;">${data.currencyCode} ${data.totalPrice.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            ${shippingAddressHtml}
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">View Order</a>
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 24px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              If you have any questions, reply to this email or contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateShippedEmail(data: OrderEmailRequest): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Your Order Has Shipped! 📦</h1>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Hi ${data.customerName || "there"},
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Great news! Your order #${data.orderNumber} is on its way.
            </p>
            
            ${data.trackingUrl ? `
              <div style="margin: 24px 0; text-align: center;">
                <a href="${data.trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">Track Your Package</a>
              </div>
            ` : ""}
          </div>
          
          <div style="background: #f5f5f5; padding: 24px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              Thank you for shopping with us!
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateDeliveredEmail(data: OrderEmailRequest): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Your Order Has Arrived! 🎉</h1>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Hi ${data.customerName || "there"},
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Your order #${data.orderNumber} has been delivered. We hope you love it!
            </p>
            
            <div style="margin: 24px 0; text-align: center;">
              <p style="color: #666; font-size: 14px;">Enjoying your purchase? Leave us a review!</p>
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 24px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              Thank you for shopping with us!
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderEmailRequest = await req.json();
    console.log("Sending order email:", data.type, "to:", data.email);

    let html: string;
    let subject: string;

    switch (data.type) {
      case "confirmation":
        html = generateOrderConfirmationEmail(data);
        subject = `Order Confirmed - #${data.orderNumber}`;
        break;
      case "shipped":
        html = generateShippedEmail(data);
        subject = `Your Order Has Shipped - #${data.orderNumber}`;
        break;
      case "delivered":
        html = generateDeliveredEmail(data);
        subject = `Your Order Has Arrived - #${data.orderNumber}`;
        break;
      default:
        throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "Orders <onboarding@resend.dev>",
      to: [data.email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
