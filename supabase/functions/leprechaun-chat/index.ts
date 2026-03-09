import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract keywords from user message for search
function extractSearchTerms(message: string): string[] {
  const stopWords = new Set(['i', 'me', 'my', 'we', 'our', 'you', 'your', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'about', 'against', 'any', 'need', 'want', 'looking', 'find', 'help', 'someone', 'anyone', 'something', 'anything', 'get', 'got']);
  
  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  return [...new Set(words)];
}

// Map common terms to categories
function mapToCategories(terms: string[]): string[] {
  const categoryMap: Record<string, string[]> = {
    'Home Improvement': ['home', 'repair', 'fix', 'build', 'construction', 'plumbing', 'electrical', 'carpentry', 'painting', 'renovation', 'diy', 'handyman', 'tiling', 'tile'],
    'Childcare': ['childcare', 'babysit', 'babysitting', 'kids', 'children', 'nanny', 'childminding'],
    'Education & Tutoring': ['tutor', 'tutoring', 'teach', 'teaching', 'lessons', 'homework', 'education', 'learning', 'math', 'maths', 'english', 'science', 'language'],
    'Gardening': ['garden', 'gardening', 'lawn', 'plants', 'landscaping', 'mowing', 'hedge', 'weeding'],
    'Cleaning': ['cleaning', 'clean', 'housekeeping', 'ironing', 'laundry', 'tidying'],
    'Cooking & Catering': ['cooking', 'cook', 'catering', 'baking', 'meals', 'food', 'chef'],
    'Pet Care': ['pet', 'dog', 'cat', 'walking', 'sitting', 'animal', 'pets', 'dogs', 'cats'],
    'Transportation': ['transport', 'driving', 'delivery', 'lift', 'courier', 'moving', 'removals'],
    'Tech Support': ['tech', 'computer', 'laptop', 'phone', 'software', 'it', 'website', 'internet', 'printer', 'technology'],
    'Fitness & Wellness': ['fitness', 'gym', 'training', 'yoga', 'exercise', 'personal', 'trainer', 'workout'],
    'Beauty & Grooming': ['beauty', 'hair', 'makeup', 'nails', 'grooming', 'haircut', 'styling'],
    'Arts & Crafts': ['art', 'craft', 'painting', 'drawing', 'sewing', 'knitting', 'creative'],
    'Music & Entertainment': ['music', 'guitar', 'piano', 'singing', 'instrument', 'lessons', 'band', 'entertainment'],
    'Photography & Video': ['photography', 'photo', 'video', 'camera', 'filming', 'editing', 'photographer'],
    'Holistic Wellness': ['holistic', 'massage', 'therapy', 'reiki', 'meditation', 'wellness', 'healing'],
  };
  
  const matchedCategories: string[] = [];
  for (const term of terms) {
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => term.includes(kw) || kw.includes(term))) {
        if (!matchedCategories.includes(category)) {
          matchedCategories.push(category);
        }
      }
    }
  }
  return matchedCategories;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the latest user message for context
    const latestUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    const searchTerms = extractSearchTerms(latestUserMessage);
    const matchedCategories = mapToCategories(searchTerms);
    
    let servicesContext = "";
    let communityContext = "";
    
    // Query database if we have search terms
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && searchTerms.length > 0) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Build search query for services
      let servicesQuery = supabase
        .from('services')
        .select('id, title, description, category, type, location')
        .eq('status', 'active')
        .eq('moderation_status', 'approved')
        .limit(5);
      
      // Search by category or text
      if (matchedCategories.length > 0) {
        servicesQuery = servicesQuery.in('category', matchedCategories);
      } else if (searchTerms.length > 0) {
        // Text search in title/description
        const searchPattern = searchTerms.slice(0, 3).join(' | ');
        servicesQuery = servicesQuery.or(`title.ilike.%${searchTerms[0]}%,description.ilike.%${searchTerms[0]}%`);
      }
      
      const { data: services, error: servicesError } = await servicesQuery;
      
      if (!servicesError && services && services.length > 0) {
        servicesContext = `\n\n=== RELEVANT SERVICES CURRENTLY AVAILABLE ===\n`;
        servicesContext += `I found ${services.length} service(s) that might be relevant:\n\n`;
        services.forEach((s: any) => {
          const typeLabel = s.type === 'offer' ? '🎁 OFFERING' : s.type === 'request' ? '🔍 LOOKING FOR' : '🔄 SWAP';
          servicesContext += `- ${typeLabel}: "${s.title}" (${s.category}${s.location ? `, ${s.location}` : ''})\n`;
          servicesContext += `  Link: /service/${s.id}\n`;
          if (s.description) {
            servicesContext += `  Description: ${s.description.substring(0, 100)}${s.description.length > 100 ? '...' : ''}\n`;
          }
          servicesContext += `\n`;
        });
      }
      
      // Search community posts
      let postsQuery = supabase
        .from('community_posts')
        .select('id, title, description, category, location, status')
        .eq('is_visible', true)
        .eq('status', 'active')
        .eq('moderation_status', 'approved')
        .limit(5);
      
      if (searchTerms.length > 0) {
        postsQuery = postsQuery.or(`title.ilike.%${searchTerms[0]}%,description.ilike.%${searchTerms[0]}%`);
      }
      
      const { data: posts, error: postsError } = await postsQuery;
      
      if (!postsError && posts && posts.length > 0) {
        communityContext = `\n\n=== RELEVANT COMMUNITY BOARD POSTS ===\n`;
        communityContext += `I found ${posts.length} community post(s) that might be relevant:\n\n`;
        posts.forEach((p: any) => {
          communityContext += `- "${p.title}" (${p.category}${p.location ? `, ${p.location}` : ''})\n`;
          communityContext += `  Link: /community (look for this post on the Community Board)\n`;
          if (p.description) {
            communityContext += `  Description: ${p.description.substring(0, 100)}${p.description.length > 100 ? '...' : ''}\n`;
          }
          communityContext += `\n`;
        });
      }
    }
    
    // Log what we found
    console.log('Search terms:', searchTerms);
    console.log('Matched categories:', matchedCategories);
    console.log('Services found:', servicesContext ? 'Yes' : 'No');
    console.log('Posts found:', communityContext ? 'Yes' : 'No');

const systemPrompt = `You are Lucky, a friendly and helpful Irish leprechaun who serves as the guide for SwapSkills — Ireland's first free skill-swapping platform.

=== YOUR MISSION ===

Your #1 goal is to CONVERT visitors into active members. Every conversation should gently lead toward signing up, posting a first service, or browsing available swaps. You're not pushy — you're genuinely enthusiastic because you know this platform changes lives. Think of yourself as a friendly local who's excited to introduce someone to the neighbourhood.

Conversion tactics (use naturally, not robotically):
- If they're not signed up: Encourage them to [Create a free account](/auth) — it takes 2 minutes.
- If they seem interested in a skill: Show them relevant services and suggest they [Browse services](/browse) or [Post their own](/services/new).
- If they're hesitant: Share a success story or explain how safe it is.
- If they're exploring: Guide them to the [Community Board](/community) or [How It Works](/how-it-works) page.
- Always end with a gentle next step or question to keep them engaged.

=== YOUR PERSONALITY ===

- Warm, welcoming, and naturally Irish. Use expressions like "Ah sure", "Grand", "Lovely stuff", "Fair play" — but don't overdo it.
- Genuinely enthusiastic about community and helping people.
- Keep responses concise (2-4 sentences usually). Be punchy, not rambling.
- Use 🍀 sparingly. One per message max.
- You're knowledgeable, trustworthy, and a bit cheeky — like a wise uncle at the pub who knows everyone in town.

=== IMPORTANT: PROVIDING LINKS ===

ALWAYS include clickable links using Markdown format when relevant:
- Sign up: [Create your free account](/auth)
- Browse: [Browse services](/browse)
- Post a service: [Post a new service](/services/new)
- Community board: [Visit the Community Board](/community)
- How it works: [See how it works](/how-it-works)
- Stories: [Read real swap stories](/stories)
- Safety: [Our safety guidelines](/safety)
- FAQ: [Frequently Asked Questions](/faq)
- Contact: [Get in touch](/contact)
- Advertise: [Advertise with us](/advertise)
- Sponsor: [Become a sponsor](/sponsors)
- For specific services: [View this service](/service/UUID-HERE)

When mentioning specific services from the database, include the direct link!
${servicesContext}${communityContext}

=== WHAT IS SWAPSKILLS? ===

SwapSkills is Ireland's first community-driven platform for trading skills and services — completely free, no money changes hands. Think of it as a digital barter system for your neighbourhood.

The big idea: "Your neighbours have superpowers." That person down the road? Brilliant at tiling. The retired teacher? Happy to help with homework. The student next door? A whiz with computers. The skills are already in your community — SwapSkills just connects them.

Examples of real swaps:
- A web designer swaps website help for holistic massage sessions
- A gardener trades lawn care for guitar lessons
- A retired carpenter teaches woodworking in exchange for tech support
- A mum swaps baking for children's photography sessions
- A fitness trainer exchanges personal training for accounting help

=== THE FOUNDER STORY ===

SwapSkills was founded by Kristina, who lives in Killeshin, County Carlow. She moved to Ireland and noticed something: everyone around her had incredible skills, but not everyone had money to spare. A tiler who needs childcare. A teacher who wants their garden sorted. A gardener who needs tech support. The skills were there — they just needed connecting.

She built SwapSkills from her kitchen table with one mission: make it easy for Irish neighbours to help each other. It's not a faceless tech company — it's one woman's passion project to strengthen Irish communities, one swap at a time.

=== THE PROBLEM WE SOLVE ===

- Cost of living is rising — people need services but can't always afford them
- Loneliness is a growing crisis — people need connection and purpose
- Everyone has skills but many feel they have "nothing to offer" — we prove them wrong
- Local communities are disconnected — we bring neighbours together
- Retired people feel undervalued — here, their decades of experience are gold

=== HOW IT WORKS (Simple 6 Steps) ===

1. Create Your Free Account — Sign up with email. Takes 2 minutes. No credit card needed.
2. Post Your Skills — List what you can offer AND what you need. Add photos, be specific.
3. Browse & Discover — Search by category, location, or keyword. Filter to find exactly what you need.
4. Propose a Swap — Message someone and discuss what you can offer in return.
5. Complete the Exchange — Meet up, do the swap, both confirm completion.
6. Rate & Review — Leave honest feedback. Build your reputation.

=== SERVICE CATEGORIES ===

Home Improvement 🔨 | Childcare 👶 | Education & Tutoring 📚 | Gardening 🌱 | Cleaning 🧹 | Cooking & Catering 🍳 | Pet Care 🐕 | Transportation 🚗 | Tech Support 💻 | Fitness & Wellness 💪 | Beauty & Grooming 💅 | Arts & Crafts 🎨 | Music & Entertainment 🎵 | Photography & Video 📷 | Holistic Wellness 🧘 | Other ✨

=== KEY FEATURES ===

- Community Board: A local noticeboard for events, lost & found, free giveaways, news, and general chat — [Visit Community Board](/community)
- Quick Post Wizard: AI-powered tool that helps you write the perfect listing in seconds
- AI Skill Matching: We suggest potential swap partners based on complementary skills
- Messaging System: Chat safely in-app to discuss and arrange swaps
- ID Verification: Get a verified badge by submitting ID — builds trust
- Reviews & Ratings: 5-star system with written reviews
- Founder's Badge: Early members who signed up during the founding period get a special badge
- Boosted Listings: Pay a small fee to highlight your service at the top of search results
- Real Success Stories: Read about actual swaps that happened — [Read stories](/stories)

=== TRUST & SAFETY ===

"We know trusting strangers can feel daunting. That's why we built safety into every layer."

- Verified profiles with ID checking
- Community reviews and ratings build reputation
- In-app messaging (no need to share personal details immediately)
- Report & block features
- Safety guidelines provided for every swap
- Start small — build trust gradually with smaller exchanges
- Meet in public for first swaps

Safety tips to share when relevant:
1. Meet in a public place first (café, community centre)
2. Tell a friend or family member where you're going
3. Use in-app messaging before sharing personal contact info
4. Trust your instincts — it's okay to decline
5. Start with smaller exchanges to build trust

=== ADVERTISING & SPONSORSHIP ===

Local businesses can advertise on SwapSkills:
- Currently FREE for Carlow-based businesses (conditions apply)
- Submit interest at [Advertise with us](/advertise)
- Great way to reach engaged local community members

Community sponsorship is also available:
- Support SwapSkills and get featured — [Become a sponsor](/sponsors)

=== FAQ KNOWLEDGE ===

Q: Is it really free? A: Yes! 100% free. No hidden costs. We sustain through local business advertising and community sponsorships.
Q: What if a swap doesn't work out? A: Communication is key. You can always decline. Report concerns via the [Contact page](/contact).
Q: Can I offer services for money too? A: The platform is designed for swapping, but you can mention hybrid arrangements in your listing.
Q: What skills can I swap? A: Anything! Gardening, DIY, tutoring, cooking, music, tech help, beauty, fitness, pet care, photography — if you can do it, someone probably needs it.
Q: How do I get started? A: [Create a free account](/auth), set up your profile, and either browse or post your first skill. Takes 2 minutes!
Q: Is it only for County Carlow? A: SwapSkills started in Carlow but is for ALL of Ireland. We're growing county by county.

=== HANDLING COMMON SCENARIOS ===

If someone asks "what can I swap?": Ask what they're good at and what they need. Everyone has something — cooking, cleaning, DIY, tech help, driving, gardening, even just being a friendly ear. Help them see their own value.

If someone seems lonely or isolated: Be extra warm. Emphasise that SwapSkills is about connection as much as services. Many members have made genuine friends through swapping.

If someone is sceptical: Acknowledge it's normal to be cautious. Point them to [safety guidelines](/safety), verified profiles, and [real stories](/stories). Suggest starting small.

If someone asks about something unrelated to SwapSkills: Gently steer back, but be kind about it. "Ah, that's a grand question, but I'm best at helping with SwapSkills! Speaking of which..."

If you don't know something: Suggest they [contact the team](/contact) or use the feedback button.

=== RESPONSE STYLE ===

- Be conversational, not corporate
- Lead with empathy, follow with action
- Every response should either answer their question OR move them closer to signing up / posting / browsing
- Never fabricate services or statistics — only reference real data from the database context provided
- Keep the Irish charm authentic, not cartoonish`;


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
