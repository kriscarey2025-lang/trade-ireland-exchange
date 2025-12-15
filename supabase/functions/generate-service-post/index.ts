import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratePostRequest {
  goal: "share_skill" | "find_help" | "both";
  experienceLevel: "beginner" | "intermediate" | "expert";
  engagementType?: "one_off" | "short_term" | "long_term";
  skillCategory: string;
  skillDetails: string;
  location: string;
  whatTheyWant?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GeneratePostRequest = await req.json();
    const { goal, experienceLevel, engagementType, skillCategory, skillDetails, location, whatTheyWant } = body;

    console.log("Generating service post with params:", { goal, experienceLevel, engagementType, skillCategory, location });

    const isOffer = goal === "share_skill" || goal === "both";
    const experienceText = {
      beginner: "a beginner",
      intermediate: "intermediate level",
      expert: "an expert",
    }[experienceLevel];

    const engagementText = engagementType ? {
      one_off: "a one-off transaction",
      short_term: "short-term project or occasional help",
      long_term: "a long-term connection or ongoing arrangement",
    }[engagementType] : null;

    const systemPrompt = `You are a helpful assistant creating service listings for a community skill-swapping platform in Ireland. 
Create warm, friendly, and authentic-sounding posts that would appeal to local neighbours.
Always be genuine and approachable - no corporate speak.
Keep the Irish/British spelling conventions (neighbour, favourite, etc.).`;

    const userPrompt = `Create a service ${isOffer ? "offer" : "request"} post for someone who:
- Is ${experienceText} at: ${skillCategory}
- Their skill/service details: ${skillDetails}
- Located in: ${location}
${engagementText ? `- Looking for: ${engagementText}` : ""}
${whatTheyWant ? `- Wants in return: ${whatTheyWant}` : ""}

Generate a JSON response with these fields:
- title: A catchy but natural title (max 80 chars) that describes the skill/service
- description: A friendly, detailed description (150-250 words) that:
  1. Introduces the skill/service warmly
  2. Mentions experience level naturally
  3. Describes what they can offer or need
  4. Ends with an inviting call to connect
  
Make it sound like a real person wrote it, not AI. Be specific but approachable.

Respond ONLY with valid JSON, no markdown formatting.`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response:", content);

    // Parse the JSON from the response
    let parsed;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      // Fallback to a generated post
      parsed = {
        title: `${skillCategory} - ${location}`,
        description: `I'm looking to ${isOffer ? "offer" : "find"} ${skillCategory} services. ${skillDetails}. Feel free to reach out if you're interested in connecting!`,
      };
    }

    return new Response(JSON.stringify({
      title: parsed.title || `${skillCategory} - ${location}`,
      description: parsed.description || skillDetails,
      type: isOffer ? "offer" : "request",
      category: skillCategory,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-service-post:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate post";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
