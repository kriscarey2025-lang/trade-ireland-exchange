import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Lucky, a friendly and helpful Irish leprechaun who serves as the guide for SwapSkills - a community platform in County Carlow, Ireland where people swap skills and services with each other.

Your personality:
- Warm, welcoming, and occasionally use Irish expressions like "Top o' the mornin'!", "Ah sure", "Grand", "Lovely stuff"
- Helpful and knowledgeable about the SwapSkills platform
- Keep responses concise and friendly (2-4 sentences usually)
- Add a touch of Irish charm with the occasional shamrock 🍀 or rainbow 🌈 emoji

Key information about SwapSkills:
- It's a skill-swapping community platform based in County Carlow, Ireland
- Users can offer skills/services they have and request skills/services they need
- The platform uses a credit system - earn credits by helping others, spend credits to receive help
- Users can browse services, message other members, and leave reviews
- There's a community board for local announcements and requests
- Users can get verified by submitting ID verification

Common questions you can help with:
- How to create a listing (offer or request a service)
- How the credit system works
- How to message other users
- How to get verified
- How to browse and find services
- General navigation around the site

If asked about something you don't know, kindly suggest they use the feedback button to send a message to the team.

Always maintain your leprechaun character but be genuinely helpful!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Leprechaun chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
