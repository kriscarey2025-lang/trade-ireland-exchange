

## Make the Posting Flow More Fun and Exciting

Keep Skill Swap as the default. Instead of changing the post type order, add excitement and delight to the flow itself.

### Changes

**1. Move Boost upsell out of the main form (lines 351-379)**
- Remove the Boost toggle from the middle of the form -- it creates a "this costs money" impression before users even fill in their details
- The `BoostOfferCard` already shows after submission; the boost checkout logic already handles it post-submit
- This alone makes the form feel lighter and less transactional

**2. Add confetti celebration on successful post (line 210)**
- Fire `fireConfetti()` (already exists in `src/hooks/useConfetti.ts`) when the post is successfully created
- Instant dopamine hit -- makes posting feel rewarding

**3. Add an encouraging progress indicator**
- Replace the plain numbered sections (1, 2) with a lightweight step progress bar at the top of the form
- Shows "Step 1 of 2" (or "1 of 3" for skill_swap) with a colourful progress fill
- Makes the form feel shorter and gives a sense of momentum

**4. Add an AI "Help me write this" button next to the description field**
- Small sparkle button that calls the existing `generate-service-post` edge function
- User types a few words, AI fills in a polished title + description
- Reduces blank-page anxiety significantly

**5. Add a motivational micro-copy banner at the top of the form**
- Rotating encouraging messages like "You're 2 minutes away from your first swap!" or "30 people swapped skills this month -- join them!"
- Light, friendly tone with an emoji

### Files to modify
- `src/pages/NewService.tsx` -- all changes above

### What stays the same
- Skill Swap remains the default post type
- Post type order stays: Free Offer, Help Request, Skill Swap (current order in the radio group)
- Onboarding flow unchanged
- No database changes needed

