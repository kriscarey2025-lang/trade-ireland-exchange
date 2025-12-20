import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Category icons as simple SVG paths
const categoryIcons: Record<string, string> = {
  home_garden: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z",
  technology: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  education: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  creative: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  health_wellness: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  automotive: "M13 10V3L4 14h7v7l9-11h-7z",
  professional: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  events: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  childcare: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  transport: "M8 17h8M8 17v4h8v-4M8 17H6a2 2 0 01-2-2V7a4 4 0 014-4h8a4 4 0 014 4v8a2 2 0 01-2 2h-2M7 11h.01M17 11h.01",
  other: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
};

const categoryLabels: Record<string, string> = {
  home_garden: "Home & Garden",
  technology: "Technology",
  education: "Education",
  creative: "Creative",
  health_wellness: "Health & Wellness",
  automotive: "Automotive",
  professional: "Professional",
  events: "Events",
  childcare: "Childcare",
  transport: "Transport",
  other: "Other",
};

function generateSVG(title: string, category: string, location: string, type: string): string {
  const categoryLabel = categoryLabels[category] || "Skill Swap";
  const iconPath = categoryIcons[category] || categoryIcons.other;
  const displayLocation = location || "Ireland";
  
  // Truncate title if too long
  const maxTitleLength = 60;
  const displayTitle = title.length > maxTitleLength 
    ? title.substring(0, maxTitleLength) + "..." 
    : title;

  // Type badge text and color
  const typeText = type === "skill_swap" ? "SKILL SWAP" : type === "free_offer" ? "FREE OFFER" : "LOOKING FOR";
  const typeBgColor = type === "skill_swap" ? "#10b981" : type === "free_offer" ? "#8b5cf6" : "#f59e0b";

  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      <rect width="1200" height="630" fill="url(#dots)"/>
      
      <!-- Decorative elements -->
      <circle cx="1100" cy="100" r="200" fill="rgba(16, 185, 129, 0.1)"/>
      <circle cx="100" cy="530" r="150" fill="rgba(16, 185, 129, 0.08)"/>
      
      <!-- Top accent bar -->
      <rect x="0" y="0" width="1200" height="8" fill="url(#accentGradient)"/>
      
      <!-- Logo area -->
      <g transform="translate(60, 50)">
        <text x="0" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="#10b981">Swap</text>
        <text x="85" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="white">Skills</text>
      </g>
      
      <!-- Type badge -->
      <g transform="translate(60, 120)">
        <rect x="0" y="0" width="${typeText.length * 14 + 40}" height="40" rx="20" fill="${typeBgColor}"/>
        <text x="20" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="white" letter-spacing="1">${typeText}</text>
      </g>
      
      <!-- Category icon -->
      <g transform="translate(60, 200)">
        <rect x="0" y="0" width="80" height="80" rx="16" fill="rgba(16, 185, 129, 0.2)"/>
        <g transform="translate(20, 20) scale(1.7)">
          <path d="${iconPath}" fill="#10b981" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
      </g>
      
      <!-- Category label -->
      <text x="160" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#10b981" font-weight="600">${categoryLabel}</text>
      
      <!-- Main title -->
      <text x="60" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="white">
        <tspan x="60" dy="0">${displayTitle.substring(0, 35)}</tspan>
        ${displayTitle.length > 35 ? `<tspan x="60" dy="60">${displayTitle.substring(35)}</tspan>` : ''}
      </text>
      
      <!-- Location -->
      <g transform="translate(60, 520)">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" fill="none" stroke="#94a3b8" stroke-width="2"/>
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" fill="none" stroke="#94a3b8" stroke-width="2"/>
        <text x="35" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#94a3b8">${displayLocation}</text>
      </g>
      
      <!-- CTA text -->
      <text x="60" y="590" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#64748b">swap-skills.com • Trade Skills, Not Money</text>
      
      <!-- Shamrock decoration -->
      <g transform="translate(1050, 520) scale(0.8)">
        <path d="M60 80 C60 60, 40 40, 60 40 C80 40, 60 60, 60 80" fill="#10b981" opacity="0.3"/>
        <path d="M60 80 C40 80, 20 60, 40 60 C60 60, 40 80, 60 80" fill="#10b981" opacity="0.3"/>
        <path d="M60 80 C80 80, 100 60, 80 60 C60 60, 80 80, 60 80" fill="#10b981" opacity="0.3"/>
        <path d="M60 80 L60 110" stroke="#10b981" stroke-width="4" opacity="0.3"/>
      </g>
    </svg>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || 'Skill Swap';
    const category = url.searchParams.get('category') || 'other';
    const location = url.searchParams.get('location') || 'Ireland';
    const type = url.searchParams.get('type') || 'skill_swap';

    console.log(`Generating OG image for: ${title}, ${category}, ${location}, ${type}`);

    const svg = generateSVG(title, category, location, type);

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: unknown) {
    console.error('Error generating OG image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
