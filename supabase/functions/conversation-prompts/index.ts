import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { serviceTitle, serviceCategory, serviceType } = await req.json();

    console.log("Generating conversation prompts for:", { serviceTitle, serviceCategory, serviceType });

    const systemPrompt = `You are a helpful assistant that generates conversation starter prompts for a skill-swapping platform. 
Users are connecting to discuss trading services/skills with each other.
Generate exactly 4 short, helpful conversation prompts that help users:
1. Verify the other person's experience/qualifications
2. Clarify expectations and scope
3. Discuss availability and timeline
4. Agree on exchange terms

Keep each prompt under 60 characters. Be friendly but professional.
Return ONLY a JSON array of 4 strings, nothing else.`;

    const userPrompt = serviceTitle 
      ? `Generate 4 conversation prompts for discussing a ${serviceType === 'offer' ? 'service offer' : 'service request'} about: "${serviceTitle}" in the ${serviceCategory} category.`
      : `Generate 4 general conversation prompts for discussing a skill swap arrangement.`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      // Return fallback prompts if AI fails
      return new Response(JSON.stringify({
        prompts: [
          "What experience do you have with this?",
          "What's your availability like?",
          "What would you expect in exchange?",
          "Can you share examples of your work?"
        ]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response:", content);

    let prompts: string[];
    try {
      // Try to parse the JSON array from the response
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      prompts = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response, using fallback:", parseError);
      prompts = [
        "What experience do you have with this?",
        "What's your availability like?",
        "What would you expect in exchange?",
        "Can you share examples of your work?"
      ];
    }

    return new Response(JSON.stringify({ prompts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating prompts:", error);
    
    // Return fallback prompts on any error
    return new Response(JSON.stringify({
      prompts: [
        "What experience do you have with this?",
        "What's your availability like?",
        "What would you expect in exchange?",
        "Can you share examples of your work?"
      ]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
