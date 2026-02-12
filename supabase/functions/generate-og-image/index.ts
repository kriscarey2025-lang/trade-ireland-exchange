import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length > 2) {
    lines.length = 2;
    lines[1] = lines[1].substring(0, maxChars - 3) + '...';
  }

  return lines;
}

function generateSVG(title: string, category: string, location: string, type: string): string {
  const categoryLabel = categoryLabels[category] || "Skill Swap";
  const displayLocation = escapeXml(location || "Ireland");
  
  const typeText = type === "skill_swap" ? "SKILL SWAP" : type === "free_offer" ? "FREE OFFER" : "LOOKING FOR";
  const typeBgColor = type === "skill_swap" ? "#10b981" : type === "free_offer" ? "#8b5cf6" : "#f59e0b";

  const titleLines = wrapText(title, 30).map(line => escapeXml(line));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="50%" stop-color="#16213e"/>
      <stop offset="100%" stop-color="#0f3460"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1100" cy="80" r="180" fill="#10b981" opacity="0.1"/>
  <circle cx="80" cy="550" r="140" fill="#10b981" opacity="0.08"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>
  
  <text x="60" y="75" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="bold" fill="#10b981">Swap</text>
  <text x="175" y="75" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="bold" fill="white">Skills</text>
  
  <g transform="translate(310, 45)">
    <circle cx="12" cy="8" r="8" fill="#10b981"/>
    <circle cx="4" cy="18" r="8" fill="#10b981"/>
    <circle cx="20" cy="18" r="8" fill="#10b981"/>
    <path d="M12 18 L12 32" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
  </g>
  
  <rect x="60" y="110" rx="20" ry="20" width="${typeText.length * 13 + 40}" height="40" fill="${typeBgColor}"/>
  <text x="80" y="138" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="white" letter-spacing="1">${typeText}</text>
  
  <rect x="60" y="175" rx="25" ry="25" width="${categoryLabel.length * 14 + 50}" height="50" fill="#10b981" opacity="0.2"/>
  <text x="85" y="208" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#10b981">${escapeXml(categoryLabel)}</text>
  
  <text x="60" y="${titleLines.length === 1 ? 340 : 310}" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="bold" fill="white">${titleLines[0] || ''}</text>
  ${titleLines[1] ? `<text x="60" y="380" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="bold" fill="white">${titleLines[1]}</text>` : ''}
  
  <g transform="translate(60, ${titleLines.length === 1 ? 400 : 440})">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="12" cy="9" r="2.5" fill="none" stroke="#94a3b8" stroke-width="2"/>
    <text x="32" y="16" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#94a3b8">${displayLocation}</text>
  </g>
  
  <rect x="60" y="540" width="300" height="2" fill="#10b981" opacity="0.3"/>
  <text x="60" y="585" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#64748b">swap-skills.ie</text>
  <text x="240" y="585" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#475569">•</text>
  <text x="260" y="585" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#64748b">Trade Skills, Not Money</text>
  
  <g transform="translate(1000, 280)">
    <rect x="0" y="0" width="140" height="140" rx="20" fill="#10b981" opacity="0.1"/>
    <path d="M40 50 L100 50 M85 35 L100 50 L85 65" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M100 90 L40 90 M55 75 L40 90 L55 105" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

// Convert SVG to PNG using canvas API (if available) or external service
async function svgToPng(svg: string): Promise<Uint8Array> {
  // Use quickchart.io as a fallback SVG to PNG converter
  const encodedSvg = encodeURIComponent(svg);
  const converterUrl = `https://quickchart.io/chart?bkg=transparent&c=${encodedSvg}`;
  
  // Alternative: Use svg2png.com API
  const response = await fetch('https://svg2png.com/api/v1/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      svg: svg,
      width: 1200,
      height: 630,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`SVG conversion failed: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = decodeURIComponent(url.searchParams.get('title') || 'Skill Swap');
    const category = url.searchParams.get('category') || 'other';
    const location = decodeURIComponent(url.searchParams.get('location') || 'Ireland');
    const type = url.searchParams.get('type') || 'skill_swap';

    console.log(`Generating OG image for: "${title}", category: ${category}, location: ${location}, type: ${type}`);

    const svg = generateSVG(title, category, location, type);
    
    // For now, return SVG with proper headers
    // Note: Many social platforms now support SVG, but Facebook may cache the fallback
    // The SEO component should use og:image:type to specify the format
    
    console.log("SVG generated successfully");

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=604800, immutable',
        // Add headers that might help with social media crawlers
        'X-Content-Type-Options': 'nosniff',
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
