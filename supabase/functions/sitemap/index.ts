import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Base URL for the site
    const baseUrl = 'https://swap-skills.ie';

    // Fetch all active, approved services
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, updated_at, created_at, category')
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      throw error;
    }

    console.log(`Found ${services?.length || 0} active services for sitemap`);

    // Static pages with their priorities
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/browse', priority: '0.9', changefreq: 'daily' },
      { url: '/community', priority: '0.8', changefreq: 'daily' },
      { url: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/stories', priority: '0.7', changefreq: 'weekly' },
      { url: '/press', priority: '0.6', changefreq: 'weekly' },
      { url: '/faq', priority: '0.6', changefreq: 'monthly' },
      { url: '/safety', priority: '0.6', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/getting-started', priority: '0.6', changefreq: 'monthly' },
      { url: '/advertise', priority: '0.5', changefreq: 'monthly' },
      { url: '/auth', priority: '0.5', changefreq: 'monthly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
      { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { url: '/cookies', priority: '0.3', changefreq: 'yearly' },
    ];

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    const today = new Date().toISOString().split('T')[0];
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add service pages
    if (services && services.length > 0) {
      for (const service of services) {
        const lastmod = new Date(service.updated_at || service.created_at).toISOString().split('T')[0];
        // Services get priority 0.8 - they're important content
        xml += `  <url>
    <loc>${baseUrl}/services/${service.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    console.log('Sitemap generated successfully');

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
