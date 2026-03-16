

## Plan: Declutter the Homepage

### Problem
Between the hero and the actual service listings, there are five intermediate sections that push the core content down:
1. Sponsorship CTA banner (line 281)
2. ReviewsBanner (line 291)
3. SuccessStoryCard (line 294)
4. SwapStatsSection (line 299)
5. FirstPostCTA (line 301)
6. Auth prompt banner inside listings area (line 344)
7. Sticky mobile CTA bar (line 485)

Users must scroll past all of these before seeing a single listing.

### What changes

**File: `src/pages/Index.tsx`**

**Remove from above the listings (lines 280–303):**
- Remove the Sponsorship CTA banner entirely — low-value interruption; the `/advertise` page is already linked in the header/footer
- Remove ReviewsBanner — social proof is already in the hero ("25+ neighbours")
- Remove SuccessStoryCard — nice but not worth the scroll cost; can live on `/about` or `/stories`
- Remove SwapStatsSection — same rationale; move to footer or about page

**Keep:**
- ActionRequiredBanner (line 130) — this is functional, not decorative
- FirstPostCTA (line 301) — but move it **below** the listings grid, not above
- Auth prompt banner (line 344) — keep but simplify to a single-line bar instead of a large card
- Sticky mobile CTA bar (line 485) — keep, it drives signups

**Relocate SuccessStoryCard + SwapStatsSection:**
- Move both **below** the service listings grid (after the InlineAd), so the core content comes first and social proof reinforces after browsing

**Result — new section order:**
1. Header
2. ActionRequiredBanner
3. Hero (compact mobile / full desktop)
4. **Service listings** (search, filters, grid) — immediately after hero
5. InlineAd
6. SuccessStoryCard + SwapStatsSection (moved here)
7. FirstPostCTA (moved here)
8. Brainstorm CTA
9. Footer

### What stays the same
- Hero content and CTAs unchanged
- Service card design unchanged
- Mobile bottom nav unchanged
- All filter/search functionality unchanged
- No database changes

### Impact
- Users reach listings 3–4 scroll-lengths sooner
- Sign-up CTAs remain prominent (hero + sticky bar + auth prompt)
- Social proof still exists, just after the user has seen real value first

