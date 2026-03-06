

## Update Event RSVP to Formal Registration + Send Confirmation Email

Three workstreams: (1) database changes, (2) UI updates, (3) new edge function for confirmation emails.

### 1. Database Migration

Add a `registration_status` column to `event_rsvps` to track formal confirmations:

```sql
ALTER TABLE public.event_rsvps 
  ADD COLUMN registration_status text NOT NULL DEFAULT 'interest';
-- Values: 'interest' (old RSVPs), 'confirmed', 'cancelled'

-- Allow updates so people can confirm/cancel via a link
CREATE POLICY "Anyone can update their own RSVP by email" 
  ON public.event_rsvps FOR UPDATE 
  USING (true) 
  WITH CHECK (true);
```

> We keep it simple -- the confirmation/cancellation will happen via an edge function (not direct client update) so the permissive UPDATE policy is acceptable. Alternatively, we can handle it entirely through a security-definer edge function using the service role key.

### 2. Update EventRSVP Page (`src/pages/EventRSVP.tsx`)

Convert from "interest form" to **formal registration form**:

- **Info cards**: Replace TBC placeholders with confirmed details:
  - Location: "Enterprise House, O'Brien's Road, Carlow"
  - Date: "Friday 17th April 2026, 6–8 PM"
  - Who: "Places limited · Light refreshments provided"
- **Header text**: Update to "Register for the Carlow Meet-Up" instead of "Express Your Interest"
- **Remove time_preference field** (no longer needed -- date/time confirmed)
- **Update form title**: "Register Your Place" instead of "Express Your Interest"
- **Update submit button**: "Register My Place 🎉" instead of "Submit My Interest"
- **Update success message**: Confirm the date/time/venue, mention limited places and light refreshments
- **Add URL param handling**: Support `?action=confirm&email=...` and `?action=cancel&email=...` for the email links -- show a confirmation/cancellation UI instead of the registration form
- **Set `registration_status: 'confirmed'`** for new registrations

### 3. New Edge Function: `send-event-confirmation-request`

A new edge function (triggered by admin from the Events admin page) that emails all existing RSVPs who said "yes" or "maybe", asking them to formally confirm or cancel:

- **Subject**: "🤝 Carlow Meet-Up Confirmed — Please Confirm Your Place!"
- **Body**: Announces the confirmed date/time/venue, mentions limited places and light refreshments, includes two CTA buttons:
  - "Confirm My Place →" links to `/event/carlow?action=confirm&email={email}&token={id}`
  - "Cancel My RSVP" links to `/event/carlow?action=cancel&email={email}&token={id}`
- **Branded HTML**: Same warm cream/orange/green design as other emails
- **Rate limiting**: 800ms delay between sends
- **Dedup**: Track via `event_invites_sent` table with a new event slug like `carlow-april-2026-confirm`
- **Excludes**: Users who opted out (weekly_digest_enabled = false) and those who already said "no"

### 4. Update Admin Events Page

- Add a new "Send Confirmation Requests" button alongside existing "Send Invites"
- Show `registration_status` in the RSVP table (confirmed / cancelled / pending)
- Update stats cards to show confirmed vs pending counts

### 5. Update `EventRSVPSection` admin component

Same changes as AdminEvents -- show registration status column and confirmed count.

### Files to create/modify

- **Create**: `supabase/functions/send-event-confirmation-request/index.ts`
- **Modify**: `src/pages/EventRSVP.tsx` -- new registration form + confirm/cancel URL handling
- **Modify**: `src/pages/AdminEvents.tsx` -- new button + status column
- **Modify**: `src/components/admin/EventRSVPSection.tsx` -- same
- **Migration**: Add `registration_status` column to `event_rsvps`

