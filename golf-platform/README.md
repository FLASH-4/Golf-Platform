# GolfDraw Platform

GolfDraw is a subscription-driven web platform that combines:

- Stableford-style score tracking
- Monthly draw-based prize pools
- Charity contribution allocation
- Admin-led winner verification and payout tracking

The app is built with Next.js App Router, Supabase, Stripe, and Resend.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (Auth, Postgres, Storage)
- Stripe (Checkout + webhooks)
- Resend (email notifications)

## Key Features

- User signup/login and protected dashboard
- Monthly/yearly subscription checkout
- Score management with rolling window constraints
- Draw engine (random and weighted modes)
- Charity selection with contribution percentage
- Winner proof upload and admin verification flow
- Admin panel for users, draws, charities, and analytics
- Responsive UI for desktop and mobile

## Project Structure

- `app/` pages and API routes
- `components/` shared UI components
- `lib/supabase/` Supabase server/client/admin helpers
- `lib/draw-engine/` draw and prize logic
- `lib/scalability/` multi-country, account model, campaign scaffolding

## Environment Variables

Copy `.env.example` to `.env.local` and fill values.

Required for core flows:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`

Optional:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `STRIPE_MONTHLY_PRICE_ID_US`
- `STRIPE_YEARLY_PRICE_ID_US`
- `STRIPE_MONTHLY_PRICE_ID_EU`
- `STRIPE_YEARLY_PRICE_ID_EU`
- `NEXT_PUBLIC_ENABLE_CAMPAIGNS`

## Local Development

Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production build check:

```bash
npm run build
```

## Supabase Setup

Use a new Supabase project for final delivery.

If you encounter signup/auth policy issues in a fresh project, apply equivalent SQL fixes directly in Supabase SQL Editor for:

- resilient auth-to-profile trigger handling
- non-recursive `profiles` RLS policies

Keep schema and RLS policies aligned with project requirements before production launch.

## Stripe Webhooks

### Local testing

Forward Stripe events to local API route:

```powershell
& "C:\Users\<your-user>\scoop\apps\stripe\current\stripe.exe" listen --forward-to http://localhost:3000/api/webhooks/stripe
```

If `stripe` is not recognized, use the absolute executable path above or add Scoop shims to PATH.

### Production

Create a Stripe webhook endpoint in dashboard:

`https://<your-domain>/api/webhooks/stripe`

Use the endpoint signing secret as production `STRIPE_WEBHOOK_SECRET`.

Subscribe to events:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.deleted`

## Deploying to Vercel

1. Create a new Vercel project.
2. Set all required environment variables.
3. Deploy.
4. Configure Stripe production webhook endpoint to deployed URL.
5. Run an end-to-end smoke test (signup, checkout, webhook activation, dashboard status, admin verification).

## Deployment Checklist

Final release checklist:

1. Deploy to new Vercel project/account.
2. Use a new Supabase project with schema + policies applied.
3. Configure all production environment variables.
4. Configure Stripe webhook endpoint to deployed `/api/webhooks/stripe` URL.
5. Verify webhook events return 2xx for subscription lifecycle events.
6. Run full smoke test: signup/login, checkout, active subscription in dashboard, admin actions.

## Scalability Foundations Included

- Region/currency-aware checkout support (`lib/scalability/config.ts`)
- Team/corporate account domain scaffolding (`lib/scalability/accounts.ts`)
- Campaign module scaffold + feature flag (`lib/scalability/campaigns.ts`, `app/api/campaigns/route.ts`)

## Notes for Contributors

- Keep feature flags and environment handling explicit.
- Do not commit secrets or private keys.
- Validate with `npm run build` before merging.
