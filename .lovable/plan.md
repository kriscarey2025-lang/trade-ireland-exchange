

# Plan: Cancel Event, Notify Users, Clean Up

## Summary
Remove all Carlow event traces from the website, send a farewell/transition email to all subscribed users (staggered over 2 days in two segments), and draft a social post.

---

## 1. Remove Event Banner from Browse Page
**File:** `src/pages/Browse.tsx` (lines 201-209)
Remove the "In-Person Event" banner block entirely.

## 2. Remove Event Routes from App
**File:** `src/App.tsx`
- Remove the eager `import EventRSVP` (line 64)
- Remove the `/event/carlow` route (line 149)
- Remove the `/carlow/event` redirect route (line 150)
- Remove the `AdminEvents` lazy import and `/admin/events` route (lines 65, 151)

## 3. Remove Event Section from Admin Dashboard
**File:** `src/pages/AdminPlatformHealth.tsx`
- Remove the `EventRSVPSection` import (line 25)
- Remove the event RSVPs section block (lines 368-371)

## 4. Remove "Events" Link from Admin Header
**File:** `src/components/layout/Header.tsx`
- Remove the Events entry from `adminLinks` (line 133)

## 5. Remove Event Sitemap Entry
**File:** `public/sitemap.xml`
- Remove the `/event/carlow` URL entry (lines 333-337)

## 6. Update Announcement Email for Farewell Message
**File:** `supabase/functions/send-announcement/index.ts`
Rewrite the edge function to:
- Accept a `segment` parameter (1 or 2) to split ~124 subscribers into two batches
- **Segment 1**: First half of subscribers (alphabetically or by created_at) — send on day 1
- **Segment 2**: Second half — send on day 2
- New subject: `"A message from SwapSkills - Thank you"`
- New email content:
  - Thank the community for being part of SwapSkills
  - Explain that active promotion is stopping, but the platform remains fully live — users can still post, message, and connect
  - Mention the Carlow event is cancelled
  - Warm, honest, grateful tone (no misleading language per brand guidelines)
  - Keep existing branded styling (cream background, orange primary, handshake emoji in body, no emojis in subject)
  - Include unsubscribe link

## 7. Draft Social Post
I'll include a ready-to-copy social media post in my response when implementing. Tone: grateful, honest, encouraging continued use. Something like:

> After months of building SwapSkills, I've decided to step back from actively promoting the platform. The website will remain fully live — you can still post skills, message people, and make connections across Ireland.
>
> Thank you to everyone who signed up, swapped skills, and believed in the idea of neighbours helping neighbours. That spirit doesn't need a marketing budget.
>
> SwapSkills will stay online at swap-skills.ie — use it whenever you need it.
>
> — Kris

---

## Technical Notes
- ~124 subscribed users will be split into two segments of ~62 each
- Rate limiting (600ms-1.2s delays) and 100 daily email cap will be respected per segment
- The event pages (`EventRSVP.tsx`, `AdminEvents.tsx`, `EventRSVPSection.tsx`) can optionally be deleted as dead code, or left in place since the routes are removed — I'll remove them for cleanliness
- Edge function will be redeployed after update; you'll trigger each segment manually on consecutive days

