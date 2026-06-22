import assert from 'node:assert/strict'
import test from 'node:test'
import { validateEnvContract } from '../scripts/env-contract'

test('accepts the minimum local environment', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
  })

  assert.deepEqual(report.errors, [])
})

test('accepts NEXTAUTH_SECRET as an AUTH_SECRET alias', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    NEXTAUTH_SECRET: 'local-secret',
  })

  assert.deepEqual(report.errors, [])
})

test('requires NEXTAUTH_URL for production validation', () => {
  const report = validateEnvContract(
    {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
      AUTH_SECRET: 'production-secret',
    },
    'production',
  )

  assert.equal(report.errors[0], 'Missing production-required variables: NEXTAUTH_URL.')
})

test('rejects partial Auth0 configuration', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
    AUTH0_DOMAIN: 'dev-viz41cje0o6t1h2d.us.auth0.com',
  })

  assert.ok(
    report.errors.includes(
      'Auth0 requires: APP_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET.',
    ),
  )
})

test('rejects invalid APP_BASE_URL when Auth0 is configured', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
    APP_BASE_URL: 'localhost:5000',
    AUTH0_DOMAIN: 'dev-viz41cje0o6t1h2d.us.auth0.com',
    AUTH0_CLIENT_ID: 'client-id',
    AUTH0_CLIENT_SECRET: 'client-secret',
    AUTH0_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  })

  assert.ok(report.errors.includes('APP_BASE_URL must be a valid absolute URL.'))
})

test('rejects partial SMTP configuration', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
    SMTP_HOST: 'smtp.example.com',
  })

  assert.ok(report.errors.includes('SMTP requires: SMTP_PORT, SMTP_FROM.'))
})

test('rejects invalid SMTP value formats', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 'not-a-number',
    SMTP_FROM: 'noreply@example.com',
    SMTP_SECURE: 'maybe',
  })

  assert.ok(report.errors.includes('SMTP_PORT must be a valid number.'))
  assert.ok(report.errors.includes('SMTP_SECURE must be one of: true, false, 1, 0.'))
})

test('rejects partial Stripe billing configuration', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
    STRIPE_SECRET_KEY: 'sk_test_123',
  })

  assert.ok(
    report.errors.includes(
      'Stripe billing requires: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_REALTOR_PRICE_ID, STRIPE_PRO_UPSELL_STARTER_PRICE_ID, STRIPE_PRO_UPSELL_PRO_PRICE_ID, STRIPE_PRO_UPSELL_ELITE_PRICE_ID.',
    ),
  )
})

test('rejects test Stripe keys in production validation', () => {
  const report = validateEnvContract(
    {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
      AUTH_SECRET: 'production-secret',
      NEXTAUTH_URL: 'https://app.example.com',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_FROM: 'Property Pros <noreply@example.com>',
      SMTP_USER: 'smtp-user',
      SMTP_PASS: 'smtp-pass',
      STRIPE_SECRET_KEY: 'sk_test_123',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_123',
      STRIPE_PRO_PRICE_ID: 'price_pro_123',
      STRIPE_REALTOR_PRICE_ID: 'price_realtor_123',
      STRIPE_PRO_UPSELL_STARTER_PRICE_ID: 'price_pro_starter_123',
      STRIPE_PRO_UPSELL_PRO_PRICE_ID: 'price_pro_growth_123',
      STRIPE_PRO_UPSELL_ELITE_PRICE_ID: 'price_pro_elite_123',
    },
    'production',
  )

  assert.ok(
    report.errors.includes('STRIPE_SECRET_KEY must be a live key in production, not a test key.'),
  )
  assert.ok(
    report.errors.includes(
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a live key in production, not a test key.',
    ),
  )
})

test('rejects malformed Stripe identifier prefixes', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
    STRIPE_SECRET_KEY: 'secret_123',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'publishable_123',
    STRIPE_WEBHOOK_SECRET: 'webhook_123',
    STRIPE_PRO_PRICE_ID: 'pro_123',
    STRIPE_REALTOR_PRICE_ID: 'realtor_123',
    STRIPE_PRO_UPSELL_STARTER_PRICE_ID: 'starter_123',
    STRIPE_PRO_UPSELL_PRO_PRICE_ID: 'growth_123',
    STRIPE_PRO_UPSELL_ELITE_PRICE_ID: 'elite_123',
  })

  assert.ok(report.errors.includes('STRIPE_SECRET_KEY must start with sk_.'))
  assert.ok(
    report.errors.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_.'),
  )
  assert.ok(report.errors.includes('STRIPE_WEBHOOK_SECRET must start with whsec_.'))
  assert.ok(report.errors.includes('STRIPE_PRO_PRICE_ID must start with price_.'))
  assert.ok(report.errors.includes('STRIPE_REALTOR_PRICE_ID must start with price_.'))
  assert.ok(report.errors.includes('STRIPE_PRO_UPSELL_STARTER_PRICE_ID must start with price_.'))
  assert.ok(report.errors.includes('STRIPE_PRO_UPSELL_PRO_PRICE_ID must start with price_.'))
  assert.ok(report.errors.includes('STRIPE_PRO_UPSELL_ELITE_PRICE_ID must start with price_.'))
})

test('accepts a complete production-ready contract', () => {
  const report = validateEnvContract(
    {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
      AUTH_SECRET: 'production-secret',
      NEXTAUTH_URL: 'https://app.example.com',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_FROM: 'Property Pros <noreply@example.com>',
      SMTP_USER: 'smtp-user',
      SMTP_PASS: 'smtp-pass',
      STRIPE_SECRET_KEY: 'sk_live_123',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_live_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_123',
      STRIPE_PRO_PRICE_ID: 'price_pro_123',
      STRIPE_REALTOR_PRICE_ID: 'price_realtor_123',
      STRIPE_PRO_UPSELL_STARTER_PRICE_ID: 'price_pro_starter_123',
      STRIPE_PRO_UPSELL_PRO_PRICE_ID: 'price_pro_growth_123',
      STRIPE_PRO_UPSELL_ELITE_PRICE_ID: 'price_pro_elite_123',
    },
    'production',
  )

  assert.deepEqual(report.errors, [])
})

test('accepts a complete local Auth0 contract', () => {
  const report = validateEnvContract({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/property_pros',
    AUTH_SECRET: 'local-secret',
    APP_BASE_URL: 'http://localhost:5000',
    AUTH0_DOMAIN: 'dev-viz41cje0o6t1h2d.us.auth0.com',
    AUTH0_CLIENT_ID: 'client-id',
    AUTH0_CLIENT_SECRET: 'client-secret',
    AUTH0_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  })

  assert.deepEqual(report.errors, [])
})
