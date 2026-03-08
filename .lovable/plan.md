

## Customer Journey Analysis & Improvement Plan

### Key Funnel Data (from your database)

```text
FUNNEL BREAKDOWN (113 total users)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Signed up                 113  (100%)
Completed profile          92  ( 81%)
Completed onboarding       78  ( 69%)
Posted a service           26  ( 23%)  ← BIGGEST DROP
Started a conversation     19  ( 17%)
Both parties replied       13  ( 12%)
Completed a swap            9  (  8%)
Left a review               8  (  7%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL GAPS:
• 54 users completed onboarding but NEVER posted  (69% drop-off)
• 15 of 41 conversations are one-sided (37% no-reply rate)
• 12 interests expressed never converted to a conversation
• 87 users total have zero services posted (77% dormant)
• Avg 82 hours from signup to first post (3.4 days!)
```

### Top 5 Journey Problems & Proposed Fixes

---

#### 1. The "Onboarding to First Post" Cliff (54 users lost)

**Problem**: Users complete onboarding, land on Browse, and don't know what to do next. The onboarding flow collects preferences but doesn't guide toward posting.

**Fix**: After onboarding completion, redirect to a guided "Create Your First Post" page instead of the homepage. Pre-fill category from their onboarding preferences. Show a simplified, 2-field version of the post form (title + description) with the rest auto-filled.

- Modify `OnboardingQuestionnaire.tsx` final redirect: go to `/new-service?first=true` instead of `/`
- In `NewService.tsx`, detect `?first=true` and show a streamlined UI with pre-filled category/location from `user_preferences`
- Add a persistent "Post your first skill" banner on Browse for users with 0 services (you already have `FirstPostCTA` but it's subtle)

---

#### 2. One-Sided Conversations (37% no-reply rate)

**Problem**: 15 out of 41 conversations have messages from only one side. The other person never replies, killing engagement for the initiator.

**Fix**: 
- Create a `send-reply-reminder` edge function that emails users 48 hours after receiving an unread message
- Add an in-app nudge on the Messages page: "You have X unanswered messages"
- Show "Typically replies within X hours" on profiles (based on historical response data)

---

#### 3. Interest-to-Conversation Gap (12 lost opportunities)

**Problem**: Users click "I'm interested" but never start a conversation. The interest button feels like a final action rather than a first step.

**Fix**:
- After clicking "Interested", immediately show a pre-filled message dialog: "Hi! I'm interested in your [service]. I can offer [their skill from preferences]..."
- Change button label from "I'm Interested" to "Message & Swap"
- Send the service owner an email when someone expresses interest, with a direct "Reply to [name]" CTA

---

#### 4. Slow Time-to-First-Post (avg 82 hours / 3.4 days)

**Problem**: Users sign up, browse around, leave, and some come back days later to post. Many never come back at all.

**Fix**:
- Send a "What can you offer?" email 24 hours after signup if no service posted (already have `send-activation-cta` function -- verify it's active and well-timed)
- On first login after signup, show a modal: "Most popular skills in [their county]: Gardening, Tutoring, DIY... Post yours in 60 seconds"
- Pre-generate a post draft based on their onboarding skill preferences

---

#### 5. Browse Page Doesn't Convert Visitors

**Problem**: Homepage (`/`) is Browse with 2,984 tracked sessions but only 30 total services. With 54% bounce rate, visitors see limited content and leave.

**Fix**:
- Show "What people are looking for" section alongside existing offers (display `skill_swap_request` type posts prominently)
- Add a "Can you help?" CTA next to request posts: "Someone in Carlow needs gardening help -- can you help?"
- For non-logged-in visitors, show a "See what your neighbours need" section that highlights demand, creating urgency to sign up

---

### Implementation Priority

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 1 | Post-onboarding redirect to guided first post | Small | High (54 users) |
| 2 | Interest button opens message dialog | Small | Medium (12 opportunities) |
| 3 | Reply reminder email (48hr) | Medium | High (15 conversations) |
| 4 | "What people need" section on Browse | Medium | High (bounce rate) |
| 5 | 24hr activation email check | Small | Medium (dormant users) |

### No Code Changes Needed Now

This is a research-only analysis. Let me know which improvements you'd like to implement first, or if you want me to tackle them in priority order.

