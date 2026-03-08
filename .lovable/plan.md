

## Plan: Jenny's Success Story Card + Wizard for All Users

### Change 1: Jenny's Success Story Inline Card on Homepage/Browse

Create `src/components/home/SuccessStoryCard.tsx` — a compact, eye-catching card featuring Jenny's story:
- Photo placeholder with her name, role ("Reiki Practitioner, Carlow")
- One-liner: "3 swaps in 1 month — a website, balayage, and a facial. All through skill swapping."
- Quote: "These aren't just transactions — they're relationships."
- "Read her story →" link to `/stories#jenny-3-swaps`
- Warm styling with a subtle gradient border, consistent with existing card design

Add it to `src/pages/Browse.tsx` — placed after the DemandSection and before the QuickPostWizard, as social proof to inspire posting.

### Change 2: Show QuickPostWizard to All Users (Not Just Logged-In)

In `src/pages/Browse.tsx` line 200, remove the `{user && (` wrapper so the wizard renders for everyone.

The wizard component already handles the non-authenticated case — when a guest clicks "Post This Now", it saves state to localStorage, shows "Sign In to Post" on the button, and redirects to `/auth?redirect=/browse`. On return, the saved wizard state is restored and they can publish. No changes needed to the wizard component itself.

### Files Changed

| File | Change |
|------|--------|
| `src/components/home/SuccessStoryCard.tsx` | New component — Jenny's inline success story card |
| `src/pages/Browse.tsx` | Add SuccessStoryCard, remove `user &&` guard from QuickPostWizard |

