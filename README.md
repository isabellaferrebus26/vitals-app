# Vitals — App Starter

The real, deployable Vitals app — migrated from the original Claude artifact
prototype to a production stack: **Next.js 16 + Supabase + Stripe**, deployed
on **Vercel**.

## What's built here

- Supabase schema (shared question bank with 18 seed questions, per-user
  spaced-repetition progress, study plans, test attempts, subscriptions), with
  row-level security — `supabase/schema.sql`
- Auth via Supabase magic link (no passwords to manage) — `app/page.tsx`
- AI question generation as a secure server-side route — `app/api/generate-questions`
- AI tutor with 4 explanation styles (simple, analogy, step-by-step, exam
  trick) — `app/api/explain`, `components/ExplainTutor.tsx`
- Spaced repetition (Leitner box) practice loop — `components/StudyDashboard.tsx`
- Timed practice tests with a countdown clock, auto-submit, and a results
  screen — `components/StudyDashboard.tsx`, `components/ResultsScreen.tsx`
- Predicted composite score, blended from long-run mastery + recent test
  accuracy — `lib/scoring.ts`
- Study plan / exam countdown banner with a suggested daily pace —
  `components/CountdownBanner.tsx`
- Wordle-style shareable results card — `lib/share.ts`
- Stripe Checkout + webhook for subscriptions, plus a pricing page and an
  account page — `app/pricing`, `app/account`, `app/api/stripe/*`
- A small shared design system (`app/globals.css`) with light/dark support

## Setup — do this in order

### 1. Supabase (database + auth)
1. Create a project at [supabase.com](https://supabase.com) (free tier is fine to start).
2. Go to **SQL Editor > New query**, paste the contents of `supabase/schema.sql`, and run it — this creates every table, RLS policy, and the 18 seed questions.
3. Go to **Project Settings > API** and copy: Project URL, `anon` public key, and `service_role` key.
4. Go to **Authentication > Providers** and make sure **Email** is enabled (magic link is on by default).

### 2. Anthropic API key
Get a key at [console.anthropic.com](https://console.anthropic.com) — this powers both
AI question generation and the "explain it differently" tutor.

### 3. Stripe
1. Create an account at [stripe.com](https://stripe.com).
2. Go to **Product catalog** and create two products:
   - "Vitals Plus" — recurring price, $15/month
   - "Vitals Cohort" — recurring price, $29/month
3. Copy each price's ID (starts with `price_...`).
4. Go to **Developers > API keys** and copy the secret key.
5. You'll add the webhook endpoint (`/api/stripe/webhook`) *after* deploying, in step 5.

### 4. Local setup
```bash
cp .env.example .env.local
# fill in every value in .env.local from steps 1-3

npm install
npm run dev
```
Visit `http://localhost:3000` — you should see the Vitals sign-in screen.

### 5. Deploy to Vercel
1. Push this project to a GitHub repo (`.gitignore` already excludes
   `node_modules` and `.env.local` — double-check `git status` before your
   first commit anyway).
2. Go to [vercel.com](https://vercel.com), import the repo.
3. Add all the same environment variables from `.env.local` in Vercel's project settings.
4. Deploy. You'll get a URL like `vitals-app.vercel.app`.
5. Point your domain (`vitalsprep.com`) at it in Vercel's Domains settings.
6. Back in Stripe: **Developers > Webhooks > Add endpoint**, URL =
   `https://vitalsprep.com/api/stripe/webhook`, and select these events:
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.

## Notes on what's here vs. what's a judgment call

- **Seed questions**: `supabase/schema.sql` seeds 18 questions (originally 4
  were stubbed in; 14 more were written to match the same TEAS 7 style and
  difficulty). If you have the original artifact's exact `QUESTION_BANK`
  array and want those verbatim instead, swap the `insert into questions`
  block for your own.
- **Visual design**: `app/globals.css` is a fresh, from-scratch design system
  (color tokens, cards, buttons, timers, share-card styling) rather than a
  port of the original artifact's inline styles, since that file wasn't
  available here. Swap the CSS variables at the top of `globals.css` to
  re-theme it.
- **Predicted score** (`lib/scoring.ts`) blends average Leitner box mastery
  (40%) with accuracy on the last 3 timed tests (60%), falling back to
  whichever signal exists if the other doesn't yet.
- **Timed test mode** defaults to 10 questions at 45 seconds each; both
  constants live at the top of `components/StudyDashboard.tsx`.

## Architecture pattern to keep following

Every feature here follows the same rule: **any call to a third-party secret
API (Anthropic, Stripe) happens in a server-side route under `app/api/`, never
in a client component.** State that used to live in the artifact's
`window.storage` now lives in a Supabase table behind RLS, scoped to
`auth.uid()`. When adding new features, keep splitting along that line.