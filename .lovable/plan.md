

## Plan: 3-Step Guided Post Wizard with AI Generation

The user wants a streamlined 3-step form that captures what users are good at and what they need, then uses AI to generate a ready-to-post listing with a direct "Post This" button. This builds on the existing `BrainstormSection` and `brainstorm-skills` edge function but replaces the current 2-textarea + 4-idea-cards flow with a more guided, step-by-step wizard that produces a single polished post.

### What Changes

**1. New component: `src/components/brainstorm/QuickPostWizard.tsx`**
A 3-step inline wizard (not a dialog):
- **Step 1**: "Name things you're good at, love doing, or things others usually pay for that you can do yourself" — single textarea with friendly placeholder
- **Step 2**: "Name everyday services you usually pay for, can't do, or don't like doing" — single textarea
- **Step 3**: AI generates a single polished post preview ("I can offer X and I'm looking for Y") with title, description, category auto-detected. Shows a "Post This" button and an "Edit before posting" option.

The wizard will have a progress indicator (step dots), smooth transitions, and a warm, conversational tone. Each step has a "Next" button.

**2. Update `brainstorm-skills` edge function**
Add a `mode: "quick_post"` parameter. When set, the AI returns a single ready-to-post object `{ title, description, category, offerSummary, needSummary }` instead of 4 idea cards. Reuses the same edge function to avoid duplication.

**3. Integration into Browse page**
Replace or supplement the existing `BrainstormSection` on Browse with the new `QuickPostWizard` for logged-in users who have 0 posts (the biggest drop-off group). For users who already have posts or aren't logged in, keep showing the existing brainstorm card.

**4. Direct posting from wizard**
Step 3's "Post This" button will insert directly into the `services` table (reusing the same validation/moderation logic from `NewService.tsx`) without navigating away. On success, confetti + toast + the new post appears in the feed.

### Technical Details

- The wizard detects category from the AI response and maps it to the existing `ServiceCategory` enum
- Location is pre-filled from the user's profile
- Post type defaults to `skill_swap`
- Content moderation runs before insert (reuse `useContentModeration`)
- Non-logged-in users hitting "Post This" get redirected to auth with wizard state saved in localStorage
- The edge function prompt for `quick_post` mode generates Irish/British English, warm tone, specific to the user's inputs

