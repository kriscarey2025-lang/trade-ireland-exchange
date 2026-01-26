import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SAVE-SPONSOR-PREFERENCES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { 
      sessionId, 
      isPublic, 
      displayName, 
      websiteUrl, 
      message 
    } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }
    logStep("Request parsed", { sessionId, isPublic });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
    logStep("Checkout session retrieved", { 
      customerId: session.customer, 
      subscriptionId: session.subscription 
    });

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;
    
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    const customerEmail = session.customer_details?.email || 
      (typeof session.customer !== 'string' ? session.customer?.email : null);

    if (!customerId || !customerEmail) {
      throw new Error("Customer information not found");
    }

    // Determine tier from the subscription
    let tier = 'bronze';
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price?.id;
      
      // Map price IDs to tiers
      const priceToTier: Record<string, string> = {
        'price_1SturrRnrCLBBVkPwQdZ06uw': 'advertising',
        'price_1Stus6RnrCLBBVkPnJZR4PD2': 'bronze',
        'price_1StusJRnrCLBBVkPyi7fKg0p': 'silver',
        'price_1StusWRnrCLBBVkPL44EKf0d': 'gold',
      };
      tier = priceToTier[priceId] || 'bronze';
      logStep("Determined tier", { priceId, tier });
    }

    // Save to database using service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if sponsor already exists (upsert)
    const { data: existingSponsor } = await supabaseClient
      .from('sponsors')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (existingSponsor) {
      // Update existing
      const { error: updateError } = await supabaseClient
        .from('sponsors')
        .update({
          stripe_subscription_id: subscriptionId,
          tier,
          is_public: isPublic,
          display_name: isPublic ? displayName : null,
          website_url: isPublic ? websiteUrl : null,
          message: isPublic ? message : null,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSponsor.id);

      if (updateError) throw updateError;
      logStep("Updated existing sponsor", { sponsorId: existingSponsor.id });
    } else {
      // Insert new
      const { error: insertError } = await supabaseClient
        .from('sponsors')
        .insert({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          email: customerEmail,
          tier,
          is_public: isPublic,
          display_name: isPublic ? displayName : null,
          website_url: isPublic ? websiteUrl : null,
          message: isPublic ? message : null,
          status: 'active',
        });

      if (insertError) throw insertError;
      logStep("Created new sponsor record");
    }

    return new Response(JSON.stringify({ success: true, tier }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
