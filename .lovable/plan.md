

# Premium Listings: Valuable, Effortless, Non-Intrusive

## The Problem
Currently all listings look the same. There's no way for users to stand out, and no monetisation path tied to the core product (posting a service).

## The Strategy: "Boost" Model

Rather than gating features behind a paywall, we use a **freemium boost** approach -- everyone posts for free as usual, and at the very end of the post form, we offer an optional one-tap "Boost" upgrade. Think of it like Facebook Marketplace's "Boost" or Gumtree's "Featured Ad".

---

## A) What Makes Premium Worth It

Premium ("Boosted") listings get **4 concrete advantages**:

1. **Highlighted card** -- A subtle golden/gradient border and a small "Boosted" badge on the service card so it catches the eye in browse results
2. **Pinned to top** -- Boosted posts appear first in browse results (above regular posts, sorted by boost date)
3. **Larger card format** -- Boosted cards show the full description + image even in compact/list views
4. **Weekly stats email** -- Boosted users get a summary of views and interest clicks on their listing

**Pricing**: One-off payment of EUR 5 per listing, valid for 30 days. Simple, low friction, no subscription.

---

## B) Making It Effortless

The boost is offered in **two places**, both one-tap:

1. **Post-creation success screen** -- After clicking "Post", a celebratory confirmation appears with a soft upsell card: "Want more eyes on this? Boost for EUR 5" with a single button that goes to Stripe Checkout. If they skip, the post goes live as normal.

2. **Existing listing management** -- On the Profile > My Listings card, each listing gets a small "Boost" button (if not already boosted). One tap to Stripe Checkout.

No forms. No extra steps in the posting flow itself. The core post form stays untouched.

---

## C) Non-Intrusive Integration

- The post form (`NewService.tsx`) remains **exactly as-is** -- no new fields, no premium toggles, no friction
- The boost offer only appears **after** the post is successfully created, as a soft suggestion
- It uses cheerful, no-pressure language: "Your post is live! Want to give it a boost?" with a clear "No thanks, I'm good" option
- The boosted badge on cards is subtle (small sparkle icon + thin gold border), not flashy or alienating to free users

---

## Technical Plan

### 1. Database Changes

New `boosted_listings` table:

```text
boosted_listings
  id              uuid (PK, default gen_random_uuid())
  service_id      uuid (FK to services.id, unique)
  user_id         uuid (not null)
  stripe_session_id text
  boosted_at      timestamptz (default now())
  expires_at      timestamptz (not null)
  status          text (default 'active')
  created_at      timestamptz (default now())
```

RLS policies:
- Anyone can SELECT active boosts (needed to render the badge)
- Users can INSERT their own boosts
- Users can view their own boosts

### 2. Stripe Product + Price

Create a new Stripe product "Listing Boost" with a one-off price of EUR 5.00 (500 cents).

### 3. New Edge Function: `create-boost-checkout`

- Receives `serviceId` and authenticated user
- Creates a Stripe Checkout session in `mode: "payment"` for the boost price
- Sets `success_url` to `/services/{serviceId}?boosted=true`
- On success page, insert into `boosted_listings` table (or use a verify-boost function)

### 4. New Edge Function: `verify-boost`

- Called from the success redirect
- Takes the Stripe session ID, verifies payment succeeded
- Inserts into `boosted_listings` with `expires_at = now() + 30 days`

### 5. UI Changes

**Post-creation boost offer** (new component: `BoostOfferCard.tsx`):
- Shown in the success flow after `PostCreationMatchDialog` closes, or inline on the success toast
- Simple card: sparkle icon, "Boost this listing for EUR 5", description of benefits, two buttons: "Boost" and "No thanks"

**Service card visual treatment**:
- Query `boosted_listings` alongside services
- If boosted and not expired: add gold border class + small "Boosted" sparkle badge in the banner area
- Sort boosted listings first in browse results

**My Listings boost button**:
- In `UserListings.tsx`, add a small "Boost" button next to Edit/Delete for non-boosted listings

### 6. Browse Page Sorting

Modify the `get_public_services` database function (or the frontend query) to sort boosted listings first by joining with `boosted_listings` where `status = 'active'` and `expires_at > now()`.

---

## File Changes Summary

| File | Change |
|------|--------|
| New migration | Create `boosted_listings` table with RLS |
| `supabase/functions/create-boost-checkout/index.ts` | New edge function for Stripe one-off payment |
| `supabase/functions/verify-boost/index.ts` | New edge function to confirm payment and activate boost |
| `src/components/services/BoostOfferCard.tsx` | New post-creation upsell component |
| `src/components/services/ServiceCard.tsx` | Add boosted visual styling (gold border + badge) |
| `src/components/profile/UserListings.tsx` | Add "Boost" button per listing |
| `src/pages/NewService.tsx` | Show BoostOfferCard after successful post |
| `src/hooks/useServices.ts` | Include boost status in service queries |
| `src/pages/ServiceDetail.tsx` | Handle `?boosted=true` redirect and call verify-boost |

