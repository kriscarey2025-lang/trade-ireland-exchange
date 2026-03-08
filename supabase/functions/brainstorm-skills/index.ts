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
    const { strengths, needs, mode } = await req.json();

    if (!strengths || !needs) {
      return new Response(
        JSON.stringify({ error: 'Both strengths and needs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('API key not configured');
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === 'quick_post') {
      systemPrompt = `You are a friendly skill-swap post writer for a community platform in Ireland called Swap Skills.
Your job is to generate a single, ready-to-post listing based on what someone can offer and what they need.

The post should sound warm, personal, and approachable — like a real person writing on a community board.
Use British/Irish English spelling.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "A catchy, specific title (max 80 chars) that mentions both the offer and the need",
  "description": "A friendly 3-4 sentence description. Start with what you can offer, then what you're looking for in return. End with something inviting like 'Drop me a message if interested!'",
  "category": "The best matching category from this list: home_improvement, childcare, education, gardening, cleaning, cooking, pet_care, transportation, tech_support, fitness, beauty, barbering, crafts, music, photography, holistic_wellness, coaching_mentoring, local_goods, other",
  "offerSummary": "One line summary of what they offer",
  "needSummary": "One line summary of what they need"
}

Pick the category based on the PRIMARY skill being offered. Make the title engaging and specific.`;

      userPrompt = `Write a skill swap post for someone with these details:

WHAT THEY'RE GOOD AT / CAN OFFER:
${strengths}

WHAT THEY NEED HELP WITH / LOOKING FOR:
${needs}

Generate one polished, ready-to-post listing.`;
    } else {
      systemPrompt = `You are a creative skill-swap matchmaker for a community platform in Ireland. 
Your job is to generate practical, creative skill swap ideas based on what someone is good at and what they need help with.

Generate exactly 4 skill swap post ideas. Each idea should be a realistic, practical swap that someone could post on a local community board.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Short, catchy title for the skill swap post",
    "description": "2-3 sentence description explaining the swap opportunity",
    "yourOffer": "Brief summary of what they'd offer (based on their strengths)",
    "yourNeed": "Brief summary of what they'd get in return (based on their needs)"
  }
]

Make the titles engaging and the descriptions specific. Focus on practical, local community swaps.`;

      userPrompt = `Generate skill swap ideas for someone with these characteristics:

WHAT THEY'RE GOOD AT / LOVE DOING:
${strengths}

WHAT THEY NEED HELP WITH / NOT GOOD AT:
${needs}

Generate 4 creative and practical skill swap post ideas.`;
    }

    console.log(`Calling Lovable AI for ${mode === 'quick_post' ? 'quick post' : 'brainstorm ideas'}...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Failed to generate ideas');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response:', content);

    if (mode === 'quick_post') {
      let post;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          post = JSON.parse(jsonMatch[0]);
        } else {
          post = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        post = {
          title: "Skill Swap Opportunity",
          description: "Looking to swap skills with someone in the community. Let's help each other out!",
          category: "other",
          offerSummary: strengths.substring(0, 100),
          needSummary: needs.substring(0, 100)
        };
      }

      return new Response(
        JSON.stringify({ post }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      let ideas;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          ideas = JSON.parse(jsonMatch[0]);
        } else {
          ideas = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        ideas = [
          {
            title: "Skills Exchange Opportunity",
            description: "Looking to swap skills with someone in the community. Let's help each other out!",
            yourOffer: "Based on your strengths",
            yourNeed: "Help with your needs"
          }
        ];
      }

      return new Response(
        JSON.stringify({ ideas }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in brainstorm-skills function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
