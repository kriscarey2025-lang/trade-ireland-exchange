import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationRequest {
  title: string;
  description: string;
}

interface ModerationResult {
  approved: boolean;
  reason: string | null;
  categories: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description }: ModerationRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contentToCheck = `Title: ${title}\n\nDescription: ${description || ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a content moderation system for a community skill-sharing platform in Ireland. Your job is to flag inappropriate content that violates community guidelines.

Flag content that contains:
- Hate speech, racism, xenophobia, or discrimination
- Content that could harm children or vulnerable people
- Sexual content or solicitation
- Violence or threats
- Profanity or offensive language
- Scams or misleading offers
- Personal attacks or harassment
- Illegal activities

DO NOT flag content that is:
- Normal service offerings (gardening, tutoring, repairs, etc.)
- Polite requests for help
- Skill swaps between community members

Respond ONLY with a JSON object in this exact format:
{
  "approved": true/false,
  "reason": "Brief explanation if not approved, null if approved",
  "categories": ["category1", "category2"] // empty array if approved
}

Categories can be: "hate_speech", "child_safety", "profanity", "violence", "sexual", "scam", "harassment", "illegal"`
          },
          {
            role: "user",
            content: contentToCheck
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderate_content",
              description: "Return moderation decision for the content",
              parameters: {
                type: "object",
                properties: {
                  approved: { 
                    type: "boolean",
                    description: "Whether the content is approved (true) or flagged (false)"
                  },
                  reason: { 
                    type: "string",
                    nullable: true,
                    description: "Explanation if content is flagged, null if approved"
                  },
                  categories: { 
                    type: "array",
                    items: { type: "string" },
                    description: "Categories of violations detected, empty if approved"
                  }
                },
                required: ["approved", "reason", "categories"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "moderate_content" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      // Default to approved if AI fails - don't block users
      return new Response(
        JSON.stringify({ approved: true, reason: null, categories: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data));

    let result: ModerationResult = { approved: true, reason: null, categories: [] };

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error("Failed to parse tool response:", parseError);
      }
    }

    console.log("Moderation result:", JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Moderation error:", error);
    // Default to approved on error - don't block users due to system issues
    return new Response(
      JSON.stringify({ approved: true, reason: null, categories: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
