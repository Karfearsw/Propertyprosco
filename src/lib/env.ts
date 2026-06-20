function readEnv(name: string) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : undefined
}

function requireEnv(name: string) {
  const value = readEnv(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  databaseUrl: requireEnv('DATABASE_URL'),
  authSecret: requireEnv('AUTH_SECRET'),
  nextAuthUrl: readEnv('NEXTAUTH_URL'),
  googleClientId: readEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: readEnv('GOOGLE_CLIENT_SECRET'),
  appleClientId: readEnv('APPLE_CLIENT_ID'),
  appleClientSecret: readEnv('APPLE_CLIENT_SECRET'),
  stripeSecretKey: readEnv('STRIPE_SECRET_KEY'),
  stripePublishableKey: readEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  stripeWebhookSecret: readEnv('STRIPE_WEBHOOK_SECRET'),
  stripeProPriceId: readEnv('STRIPE_PRO_PRICE_ID'),
  stripeRealtorPriceId: readEnv('STRIPE_REALTOR_PRICE_ID'),
  stripeBillingPortalReturnUrl: readEnv('STRIPE_BILLING_PORTAL_RETURN_URL'),
}

export function hasGoogleAuth() {
  return Boolean(env.googleClientId && env.googleClientSecret)
}

export function hasAppleAuth() {
  return Boolean(env.appleClientId && env.appleClientSecret)
}

export function hasStripeBilling() {
  return Boolean(
    env.stripeSecretKey &&
      env.stripePublishableKey &&
      env.stripeWebhookSecret &&
      env.stripeProPriceId &&
      env.stripeRealtorPriceId,
  )
}

export function requireStripeBillingEnv() {
  return {
    stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
    stripePublishableKey: requireEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
    stripeProPriceId: requireEnv('STRIPE_PRO_PRICE_ID'),
    stripeRealtorPriceId: requireEnv('STRIPE_REALTOR_PRICE_ID'),
    stripeBillingPortalReturnUrl: readEnv('STRIPE_BILLING_PORTAL_RETURN_URL'),
  }
}
