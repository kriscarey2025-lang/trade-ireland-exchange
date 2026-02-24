

# In-Person Swap Event: RSVP Form + Admin Dashboard

## Overview

Build a public RSVP form for the Carlow in-person SwapSkills event, plus an admin page to view responses. Also create an edge function to send the invitation email to all registered users in Carlow, Kilkenny, Kildare, and Laois (~67 users).

## What gets built

### 1. Database table: `event_rsvps`

New table to capture interest responses with these columns:
- `id` (uuid, primary key)
- `full_name` (text, required)
- `email` (text, required)
- `is_registered_user` (boolean -- "Already registered with SwapSkills?")
- `user_id` (uuid, nullable -- link to profile if logged in)
- `attendance` (text -- "yes" / "maybe" / "no")
- `time_preference` (text -- "daytime" / "weekend" / "either" / "no_preference")
- `created_at` (timestamp)

RLS: Public INSERT (anyone can submit), admin SELECT for viewing responses.

### 2. Public RSVP page: `/event/carlow`

A simple, branded form page (no login required) with:
- Event header with title, brief description of the in-person swap event
- **Name** (text input)
- **Email** (text input)
- **Already a SwapSkills member?** (Yes / No radio)
- **Would you attend?** (Yes / Maybe / No radio)
- **Time preference** (Daytime weekday / Weekend / Either works)
- Success confirmation with confetti

### 3. Admin page: `/admin/events`

Admin-only page (follows existing admin pattern) showing:
- Total responses with breakdown (Yes / Maybe / No)
- Time preference summary
- Table of all RSVP submissions with name, email, member status, attendance, preference, date
- Export-friendly layout

### 4. Edge function: `send-event-invite`

Branded email (matching existing SwapSkills email style) sent to users in the target counties:
- Queries profiles where location matches Carlow, Kilkenny, Kildare, or Laois
- Includes link to `/event/carlow` RSVP form
- Uses sequential delays to respect Resend rate limits (per existing pattern)
- Triggered manually by admin via the admin events page (a "Send Invites" button)

### 5. Routing

Add two new routes in `App.tsx`:
- `/event/carlow` -- public RSVP form
- `/admin/events` -- admin responses dashboard

## Technical Details

**Files to create:**
- `src/pages/EventRSVP.tsx` -- public form page
- `src/pages/AdminEvents.tsx` -- admin dashboard
- `supabase/functions/send-event-invite/index.ts` -- email sending function

**Files to modify:**
- `src/App.tsx` -- add routes

**Database migration:**
- Create `event_rsvps` table with RLS policies

The form will use existing UI components (Input, Button, Card, RadioGroup, Label) and follow the existing page layout pattern (Header + Footer). The admin page follows the same pattern as `AdminFeedback.tsx` with role checking via `has_role` RPC.

