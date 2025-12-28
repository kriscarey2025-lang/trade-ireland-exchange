import type { Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://lporltdxjhouspwmmrjd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s';
const BASE_URL = 'https://swap-skills.com';

interface Service {
  id: string;
  updated_at: string;
  created_at: string;
}

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/browse', priority: '0.9', changefreq: 'daily' },
  { url: '/community', priority: '0.8', changefreq: 'daily' },
  { url: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/stories', priority: '0.7', changefreq: 'weekly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/safety', priority: '0.6', changefreq: 'monthly' },
  { url: '/contact', priority: '0.6', changefreq: 'monthly' },
  { url: '/getting-started', priority: '0.6', changefreq: 'monthly' },
  { url: '/advertise', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { url: '/cookies', priority: '0.3', changefreq: 'yearly' },
  { url: '/auth', priority: '0.5', changefreq: 'monthly' },
];

async function generateSitemap(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  
  console.log('🗺️  Generating sitemap...');
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Fetch active services
  let services: Service[] = [];
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id, updated_at, created_at')
      .eq('status', 'active')
      .eq('moderation_status', 'approved');
    
    if (error) {
      console.error('Error fetching services:', error);
    } else {
      services = data || [];
      console.log(`📦 Found ${services.length} active services`);
    }
  } catch (err) {
    console.error('Failed to fetch services:', err);
  }
  
  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages - Generated at build time: ${new Date().toISOString()} -->
`;

  // Add static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Add service pages
  if (services.length > 0) {
    xml += `
  <!-- Service Pages (${services.length} active services) -->
`;
    for (const service of services) {
      const lastmod = new Date(service.updated_at || service.created_at).toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/service/${service.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
  }

  xml += `</urlset>`;
  
  console.log(`✅ Sitemap generated with ${staticPages.length + services.length} URLs`);
  
  return xml;
}

export function sitemapPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    async closeBundle() {
      try {
        const xml = await generateSitemap();
        const outputPath = path.resolve(process.cwd(), 'dist/sitemap.xml');
        fs.writeFileSync(outputPath, xml, 'utf-8');
        console.log(`📄 Sitemap written to dist/sitemap.xml`);
      } catch (error) {
        console.error('Failed to generate sitemap:', error);
      }
    }
  };
}
