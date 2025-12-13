import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Finding matches for user:', user.id);

    // Get user's services
    const { data: userServices, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (servicesError) {
      console.error('Error fetching user services:', servicesError);
      throw servicesError;
    }

    if (!userServices || userServices.length === 0) {
      return new Response(JSON.stringify({ 
        matches: [],
        message: 'Create some services first to get AI-powered matches!' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all other users' active services
    const { data: otherServices, error: otherError } = await supabase
      .from('services')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          location,
          verification_status
        )
      `)
      .neq('user_id', user.id)
      .eq('status', 'active')
      .limit(50);

    if (otherError) {
      console.error('Error fetching other services:', otherError);
      throw otherError;
    }

    if (!otherServices || otherServices.length === 0) {
      return new Response(JSON.stringify({ 
        matches: [],
        message: 'No other services available yet.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for AI analysis
    const userOffers = userServices.filter(s => s.type === 'offer');
    const userRequests = userServices.filter(s => s.type === 'request');

    const prompt = `You are a skill matching assistant for a skill-swap platform in Ireland. Analyze the following data and find the best matches.

USER'S SERVICES:
Offers (what they can provide):
${userOffers.map(s => `- ${s.title} (${s.category}): ${s.description || 'No description'}`).join('\n') || 'None'}

Requests (what they need):
${userRequests.map(s => `- ${s.title} (${s.category}): ${s.description || 'No description'}`).join('\n') || 'None'}

AVAILABLE SERVICES FROM OTHER USERS:
${otherServices.map(s => `- ID: ${s.id}, Type: ${s.type}, Title: ${s.title}, Category: ${s.category}, Description: ${s.description || 'None'}, Location: ${s.location || 'Not specified'}, User: ${s.profiles?.full_name || 'Anonymous'}`).join('\n')}

Find up to 5 best matches considering:
1. Direct matches: Their offers match user's requests, or their requests match user's offers
2. Complementary skills that could lead to good swaps
3. Location proximity when possible
4. Potential for mutually beneficial exchanges

Return a JSON array with this exact format (no markdown, just raw JSON):
[
  {
    "service_id": "the service id",
    "match_score": 85,
    "match_reason": "Brief explanation of why this is a good match",
    "swap_potential": "What the user could offer in return"
  }
]

Only return the JSON array, nothing else.`;

    console.log('Calling Lovable AI for matching...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful skill matching assistant. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '[]';
    
    console.log('AI response:', aiContent);

    // Parse AI response
    let matchResults;
    try {
      // Clean up the response in case it has markdown
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      matchResults = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      matchResults = [];
    }

    // Enrich matches with full service data
    const enrichedMatches = matchResults.map((match: any) => {
      const service = otherServices.find(s => s.id === match.service_id);
      if (!service) return null;
      
      return {
        ...match,
        service: {
          id: service.id,
          title: service.title,
          description: service.description,
          category: service.category,
          type: service.type,
          location: service.location,
          images: service.images,
          price: service.price,
          price_type: service.price_type,
        },
        provider: service.profiles,
      };
    }).filter(Boolean);

    console.log('Returning', enrichedMatches.length, 'matches');

    return new Response(JSON.stringify({ matches: enrichedMatches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in skill-match function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
