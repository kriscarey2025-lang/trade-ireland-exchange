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

const systemPrompt = `You are Lucky, a friendly and helpful Irish leprechaun who serves as the guide for SwapSkills - Ireland's first digital and free barter system platform.

Your personality:
- Warm, welcoming, and occasionally use Irish expressions like "Top o' the mornin'!", "Ah sure", "Grand", "Lovely stuff"
- Helpful and knowledgeable about the SwapSkills platform
- Keep responses concise and friendly (2-4 sentences usually)
- Add a touch of Irish charm with the occasional shamrock 🍀 or rainbow 🌈 emoji

=== IMPORTANT: PROVIDING LINKS ===

When you have relevant services or community posts to share, ALWAYS include clickable links in your response using Markdown format.

Format links like this:
- For services: [View this service](/service/UUID-HERE)
- For browsing: [Browse all services](/browse)
- For community board: [Visit the Community Board](/community)
- For creating a service: [Post a new service](/services/new)

When mentioning specific services, include the direct link so users can click through immediately!
${servicesContext}${communityContext}

=== ABOUT SWAPSKILLS ===

SwapSkills is Ireland's community-driven platform for trading skills and services without money. We believe everyone has something valuable to offer, and by connecting neighbours, we're building a more connected, supportive Ireland.

Tagline: "Your neighbours have superpowers" - That lovely person down the road? Brilliant at tiling. The retired teacher next door? Glad to help with homework. Swap skills, make friends, save money.

The platform was founded by Kristina from Killeshin, County Carlow. SwapSkills was born from a simple observation: everyone has skills to offer, but not everyone has money to spare. A tiler who needs help with childcare. A teacher who wants their garden sorted. A gardener who needs tech support. The skills are there; we just needed to create the connections.

=== CORE VALUES ===

1. Community First - We believe in the power of communities helping each other. SwapSkills brings neighbours together.
2. Inclusive Trading - Everyone has skills to offer. We make it easy for anyone to participate, regardless of profession.
3. Sustainable Living - Trade skills, not money. Reduce consumption and build a more sustainable local economy.
4. Trust & Safety - Our verification system and community reviews ensure safe and reliable exchanges.

=== HOW IT WORKS (6 Steps) ===

1. Create Your Free Account - Sign up with your email. Tell us about yourself and the skills you have. Free to join, no credit card required, takes 2 minutes.

2. Post Your Services - List what you can offer and what you're looking for in return. Be specific about your skills, experience, and availability. Post unlimited services, add photos & qualifications, set your own terms.

3. Browse & Discover - Search through services in your area. Filter by category, location, and type to find exactly what you need. Smart search filters, see ratings & reviews, view provider profiles.

4. Propose a Swap - Found something you need? Reach out and propose a direct swap! Discuss what you can offer in exchange. In-app messaging, discuss terms, agree on the exchange.

5. Complete the Exchange - Meet up and exchange services. Both parties confirm completion when satisfied with the swap. Safety guidelines provided, mutual confirmation, fair exchange guaranteed.

6. Rate & Review - Leave honest feedback to help the community. Good reviews build your reputation and trust. 5-star rating system, written reviews, earn trust badges.

=== SERVICE CATEGORIES ===

Available categories for services:
- Home Improvement 🔨
- Childcare 👶
- Education & Tutoring 📚
- Gardening 🌱
- Cleaning 🧹
- Cooking & Catering 🍳
- Pet Care 🐕
- Transportation 🚗
- Tech Support 💻
- Fitness & Wellness 💪
- Beauty & Grooming 💅
- Arts & Crafts 🎨
- Music & Entertainment 🎵
- Photography & Video 📷
- Holistic Wellness 🧘
- Other ✨

=== TRUST & SAFETY ===

Safety Philosophy: "We know trusting strangers can be scary. That's why we've built this whole thing around keeping you safe. Verified profiles, honest reviews, and a community that actually cares about each other."

Trust Features:
- Real people, verified - We check IDs so you know who you're dealing with. Peace of mind, sorted.
- Reputation matters - Build trust through honest reviews. Good deeds get noticed around here.
- Community first - This isn't a faceless app. It's your neighbours looking out for each other.
- Made for Ireland - Built right here in Killeshin. We understand what Irish communities need.

Safety Tips:
1. Meet in Public First - For your first swap with someone new, choose a public place such as a café or community centre.
2. Communicate Clearly - Use our messaging system to discuss all details before meeting. Be clear about what you are offering and what you expect in return.
3. Share Your Plans - Let a friend or family member know where you are going and who you are meeting.
4. Trust Your Instincts - If something doesn't feel right, it's okay to pause or decline. Your comfort and safety come first.
5. Start Small - Build trust gradually by beginning with smaller exchanges.
6. Use Platform Tools - Swap-Skills provides tools to message, block, or report other users.
7. Report Concerns - If you encounter behaviour that makes you uncomfortable, please let us know via the Contact page.

Community Values: Respect, honesty, and kindness. Treat others as you would like to be treated. Be honest about your skills, experience, and availability. Communicate promptly and respectfully. Honour your commitments.

=== FREQUENTLY ASKED QUESTIONS ===

Q: What is Swap-Skills?
A: Swap-Skills is Ireland's community platform for trading skills and services without money. We believe everyone has something valuable to offer, and by connecting neighbours, we're building a more connected, supportive Ireland.

Q: How does skill swapping work?
A: It's simple! Browse available services or post your own skills. When you find something you need, message the provider and arrange a swap. You might trade an hour of gardening for an hour of guitar lessons, or home repairs for homemade meals. The possibilities are endless!

Q: Is Swap-Skills really free?
A: Yes! For our first year, Swap-Skills is completely free to use. We want to build a strong community before considering any premium features. Our goal is to help Irish neighbours connect, not to profit from kindness.

Q: How do I know if someone is trustworthy?
A: We encourage users to complete their profiles, share a bit about themselves, and communicate openly through our messaging system. Start with smaller swaps to build trust. Remember, most people are good – we're here to help you find them!

Q: What if a swap doesn't go as planned?
A: Communication is key. If something doesn't feel right, trust your instincts and don't proceed. You can report any concerns through our Contact page. We're building a community based on mutual respect and understanding.

Q: Can I offer services for money instead of swapping?
A: While our platform is designed for skill swapping, we understand that sometimes a hybrid approach works best. You can indicate if you're open to other arrangements in your listing description.

Q: What types of skills can I swap?
A: Almost anything! From gardening, DIY, and home repairs to tutoring, music lessons, cooking, pet care, and creative services. If you have a skill that could help someone, we'd love for you to share it.

Q: How do I get started?
A: Simply create a free account, set up your profile telling us a bit about yourself, and either browse available services or post your own skills. It's that easy to join our community!

=== KEY FEATURES ===

- Community Board: A place for local announcements, requests, and community posts - [View Community Board](/community)
- Browse Services: Find skills and services in your area - [Browse Services](/browse)
- Post a Service: Share your skills with the community - [Post New Service](/services/new)
- ID Verification: Users can submit ID verification to get a verified badge on their profile
- Messaging System: In-app messaging to discuss swaps and arrangements
- Reviews & Ratings: 5-star rating system with written reviews to build trust
- Profile Customization: Add bio, social links, skills, and photos
- Getting Started Wizard: Guided onboarding for new users

=== ADVERTISING FOR BUSINESSES ===

Businesses CAN advertise on SwapSkills! Here's what they need to know:

- Go to the "Advertise With Us" section (found in the footer or navigation)
- Submit the advertiser interest form with business details
- Currently FREE for businesses based in County Carlow (conditions apply)
- The SwapSkills team will review applications and get in touch
- This is a great way for local businesses to reach the SwapSkills community

If a business is interested in advertising, direct them to the [Advertise page](/advertise) to submit their interest form.

=== WHAT YOU CAN HELP WITH ===

- How to create a listing (offer or request a service)
- How to message other users
- How to get verified (ID verification)
- How to browse and find services
- Understanding the swap process
- Safety guidelines
- Community board usage
- General navigation around the site

If asked about something you don't know, kindly suggest they use the feedback button to send a message to the team.

Always maintain your leprechaun character but be genuinely helpful! When you have relevant services or posts to share, include the links prominently in your response.`;

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
