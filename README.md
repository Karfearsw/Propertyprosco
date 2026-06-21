# Property Pros

Property Pros is a Next.js 15 marketplace app for homeowners, Pros, and Realtors. The app uses Prisma with PostgreSQL, NextAuth, email-based account recovery, and Stripe-backed billing.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in `DATABASE_URL` and `AUTH_SECRET` for all environments.
3. Set `NEXTAUTH_URL=http://localhost:5000` for local work.
4. Add SMTP values when you want to exercise real verification and password reset delivery.
5. Add Stripe values when you want to exercise paid Pro and Realtor billing flows.
6. Install dependencies with `npm ci`.
7. Apply migrations with `npm run db:migrate:dev`.
8. Seed local data if needed with `npm run db:seed`.
9. Start the app with `npm run dev`.

Run `npm run validate:env` before booting a new environment. Run `npm run validate:env:production` for deploy-target validation.

## Environment Variables

### Required In Every Environment

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `AUTH_SECRET`: secret used by NextAuth session and token handling.

### Auth0 Regular Web App

Auth0 is configured in this repo as an additional hosted login/signup path for local development on port `5000`.

- `APP_BASE_URL`: local app origin for Auth0 routes. Use `http://localhost:5000`.
- `AUTH0_DOMAIN`: your Auth0 tenant domain.
- `AUTH0_CLIENT_ID`: the Auth0 application client ID.
- `AUTH0_CLIENT_SECRET`: the Auth0 application client secret.
- `AUTH0_SECRET`: 64-character hex secret used to encrypt Auth0 cookies.

For the current tenant and app shape, configure your Auth0 application with:

- Allowed Callback URLs: `http://localhost:5000/auth/callback`
- Allowed Logout URLs: `http://localhost:5000`
- Application Type: `Regular Web Application`
- Token Endpoint Authentication Method: `client_secret_post`

Important Auth0 note:

- Login and logout will fail with callback or logout mismatch errors until those URLs are saved in the Auth0 dashboard.

### Required In Production

- `NEXTAUTH_URL`: canonical public app origin used for auth callbacks and email links.

### Optional Provider Pairs

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: enable Google sign-in.
- `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET`: enable Apple sign-in.

Set both values for a provider or leave both blank.

### SMTP Email Delivery

Verification and password reset flows require SMTP anywhere outside local development.

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_FROM`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`

`SMTP_USER` and `SMTP_PASS` must be set together or omitted together. `SMTP_SECURE` must be `true`, `false`, `1`, or `0` when provided.

### Stripe Billing

Paid Pro and Realtor billing requires the following values:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_REALTOR_PRICE_ID`
- `STRIPE_BILLING_PORTAL_RETURN_URL` optional override for the billing portal return path

Production billing guidance:

- Use live Stripe keys for production. Test keys are valid for local and test-mode work only.
- Use correctly formatted Stripe identifiers:
  - `STRIPE_SECRET_KEY` -> `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` -> `pk_live_...`
  - `STRIPE_WEBHOOK_SECRET` -> `whsec_...`
  - `STRIPE_PRO_PRICE_ID` and `STRIPE_REALTOR_PRICE_ID` -> `price_...`
- The app keeps role-based mapping server-side:
  - `STRIPE_REALTOR_PRICE_ID` powers the Realtor plan
  - `STRIPE_PRO_PRICE_ID` powers the Pro plan
- Stripe Buy Button IDs or hosted test checkout URLs can be used as product references during setup, but the authenticated app billing flow still runs through Stripe Elements, setup intents, server-side subscription creation, and webhooks.
- On Vercel, set these as encrypted project env vars for Preview and Production separately, then confirm the webhook destination matches the deployed app origin before turning on live billing.

## Validation Scripts

- `npm run prisma:validate`: validates Prisma schema configuration.
- `npm run typecheck`: runs TypeScript in no-emit mode.
- `npm test`: runs focused repository tests.
- `npm run validate:env`: validates the local env contract.
- `npm run validate:env:production`: validates production-required env coverage.
- `npm run verify`: runs Prisma validation, typecheck, and tests together.

## Auth0 SDK Setup

Use this sequence to enable Auth0 in the current project without changing the existing email/password flow:

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Fill in:
   - `APP_BASE_URL=http://localhost:5000`
   - `AUTH0_DOMAIN=dev-viz41cje0o6t1h2d.us.auth0.com`
   - `AUTH0_CLIENT_ID=j6lD2b54P9Lj3exlh9azR1QrdmrBIcef`
   - `AUTH0_CLIENT_SECRET=<your-secret>`
   - `AUTH0_SECRET=<64-char-hex-secret>`
4. In the Auth0 dashboard, add:
   - `http://localhost:5000/auth/callback` to Allowed Callback URLs
   - `http://localhost:5000` to Allowed Logout URLs
5. Start the app with `npm run dev`.
6. Open `http://localhost:5000/login` and use the Auth0 buttons to test hosted login/signup.

Implementation notes for this repo:

- The custom login form still supports the existing credentials flow.
- Auth0 login/signup uses the SDK-managed routes under `/auth/*`.
- New Auth0 users are linked into the existing local user table and then routed through `/auth/continue` for role selection.

## Database Workflow

Use Prisma migrations as the source of truth for shared and production environments.

- Use `npm run db:migrate:dev` when developing schema changes locally.
- Commit the generated `prisma/migrations/*` directory with every schema change.
- Use `npm run db:migrate:status` to inspect migration state before release work.
- Use `npm run db:migrate:deploy` in staging and production to apply committed migrations.
- Use `npm run db:push:local` only for disposable local experiments, never for shared, staging, or production databases.

## Production Deploy Guidance

Use this release sequence for staging and production:

1. Confirm env coverage with `npm run validate:env:production`.
2. Run core validation with `npm run verify`.
3. Apply committed migrations with `npm run db:migrate:deploy`.
4. Build the app with `npm run build`.
5. Start the server with `npm run start`.

Recommended deployment notes:

- Run migrations before shifting live traffic to a new build.
- Keep Stripe webhook signing secrets and SMTP credentials in your host secret manager, not in source control.
- Verify `NEXTAUTH_URL`, Stripe products and prices, and SMTP sender identity per environment before release.
