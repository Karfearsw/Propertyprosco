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
      'Stripe billing requires: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_REALTOR_PRICE_ID.',
    ),
  )
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
      STRIPE_SECRET_KEY: 'sk_test_123',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_123',
      STRIPE_PRO_PRICE_ID: 'price_pro_123',
      STRIPE_REALTOR_PRICE_ID: 'price_realtor_123',
    },
    'production',
  )

  assert.deepEqual(report.errors, [])
})
