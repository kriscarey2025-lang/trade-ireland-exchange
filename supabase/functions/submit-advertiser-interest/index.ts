import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdvertiserInterestRequest {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  location: string;
  website?: string;
  message?: string;
}

// Simple hash function for IP addresses (for privacy)
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(0, 16));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers
    const clientIP = 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';
    
    console.log('Processing advertiser interest submission from IP:', clientIP.slice(0, 10) + '***');

    const body: AdvertiserInterestRequest = await req.json();

    // Validate required fields
    if (!body.businessName || !body.contactName || !body.email || !body.location) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate field lengths
    if (body.businessName.length > 100 || body.contactName.length > 100 || 
        body.email.length > 255 || body.location.length > 100 ||
        (body.website && body.website.length > 500) ||
        (body.message && body.message.length > 1000)) {
      console.error('Field length validation failed');
      return new Response(
        JSON.stringify({ error: 'One or more fields exceed maximum length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      console.error('Invalid email format');
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash the IP for privacy
    const ipHash = await hashIP(clientIP);

    // Check rate limit (3 submissions per hour)
    const { data: isAllowed, error: rateLimitError } = await supabase
      .rpc('check_advertiser_rate_limit', { 
        _ip_hash: ipHash,
        _max_requests: 3,
        _window_minutes: 60
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(
        JSON.stringify({ error: 'Failed to check rate limit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAllowed) {
      console.log('Rate limit exceeded for IP hash:', ipHash.slice(0, 8) + '***');
      return new Response(
        JSON.stringify({ 
          error: 'Too many submissions. Please try again later.',
          rateLimited: true 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the advertiser interest using the SECURITY DEFINER function
    const { data: newId, error: insertError } = await supabase
      .rpc('insert_advertiser_interest', {
        _business_name: body.businessName.trim(),
        _contact_name: body.contactName.trim(),
        _email: body.email.trim().toLowerCase(),
        _phone: body.phone?.trim() || null,
        _location: body.location.trim(),
        _website: body.website?.trim() || null,
        _message: body.message?.trim() || null
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit interest' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully submitted advertiser interest:', newId);

    return new Response(
      JSON.stringify({ success: true, id: newId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-advertiser-interest:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
