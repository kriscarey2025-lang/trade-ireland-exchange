

## SEO Audit and Sitemap Fix

### Problem
The static sitemap (`public/sitemap.xml`) is outdated and has several issues:
- Only 28 of 30 active services are listed (2 missing)
- Service URLs use raw UUIDs instead of SEO-friendly title-based slugs
- The file goes stale whenever new listings are created
- Contains a fragment URL (`/stories#swap-skills-faq`) that Google ignores
- Includes `/getting-started` which is an auth-gated redirect page

### Plan

**1. Regenerate the static sitemap now**
- Call the `sitemap` edge function to produce a fresh, correct sitemap with all 30 services using proper title-based slugs
- Save the output to `public/sitemap.xml`

**2. Fix the sitemap edge function**
- Remove the fragment URL (`/stories#swap-skills-faq`)
- Remove `/getting-started` (auth-gated, causes soft 404s for crawlers)
- Add the `/event/carlow` campaign page (currently your top-visited page at 179 views this week)
- Ensure the static sitemap script (`scripts/generate-sitemap.ts`) matches the edge function

**3. Fix the static sitemap to use slugs**
- The committed `public/sitemap.xml` uses raw UUIDs, but the edge function already generates slug-based URLs -- the static file simply hasn't been regenerated since the slug feature was added
- Regenerate it with the updated edge function output

**4. Additional SEO improvements to consider (future)**
- **Auto-refresh sitemap**: Set up a scheduled task to regenerate the static sitemap weekly, or serve the dynamic edge function URL in `robots.txt` instead
- **Bounce rate (84%)**: Very high -- consider adding more internal links and related listings on service detail pages
- **Mobile-first**: 57% of traffic is mobile; verify service detail pages render well on small screens
- **ChatGPT referrals**: You're already getting traffic from `chatgpt.com` -- the JSON-LD and AEO work is paying off

### Technical Details

Files to modify:
- `public/sitemap.xml` -- regenerate with all 30 services using slug URLs
- `supabase/functions/sitemap/index.ts` -- remove fragment URL, remove `/getting-started`, add `/event/carlow`
- `scripts/generate-sitemap.ts` -- same fixes to keep in sync

Total URL count after fix: ~76 URLs (16 static + 1 event + 18 skill guides + 27 counties + 1 county index + 1 skills index + ~30 services) -- but the number will grow dynamically as new services are posted.

