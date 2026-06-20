function readEnv(name: string) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : undefined
}

function readNumberEnv(name: string) {
  const value = readEnv(name)
  if (!value) return undefined

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`)
  }

  return parsed
}

function readBooleanEnv(name: string) {
  const value = readEnv(name)
  if (!value) return undefined

  const normalized = value.toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false

  throw new Error(`Environment variable ${name} must be a boolean-like value`)
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
  smtpHost: readEnv('SMTP_HOST'),
  smtpPort: readNumberEnv('SMTP_PORT'),
  smtpUser: readEnv('SMTP_USER'),
  smtpPass: readEnv('SMTP_PASS'),
  smtpFrom: readEnv('SMTP_FROM'),
  smtpSecure: readBooleanEnv('SMTP_SECURE'),
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

export function hasSmtpMailer() {
  const hasAuthPair =
    (env.smtpUser && env.smtpPass) ||
    (!env.smtpUser && !env.smtpPass)

  return Boolean(
    env.smtpHost &&
      env.smtpPort &&
      env.smtpFrom &&
      hasAuthPair,
  )
}

export function hasPartialSmtpMailerConfig() {
  const hasAnySmtpValue = Boolean(
    env.smtpHost ||
      env.smtpPort ||
      env.smtpUser ||
      env.smtpPass ||
      env.smtpFrom,
  )

  return hasAnySmtpValue && !hasSmtpMailer()
}

export function requireSmtpMailerEnv() {
  if (hasPartialSmtpMailerConfig()) {
    throw new Error(
      'Incomplete SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_FROM, and either both SMTP_USER/SMTP_PASS or neither.',
    )
  }

  if (!hasSmtpMailer()) {
    throw new Error(
      'SMTP mailer is not configured. Set SMTP_HOST, SMTP_PORT, and SMTP_FROM to enable production email delivery.',
    )
  }

  return {
    smtpHost: env.smtpHost!,
    smtpPort: env.smtpPort!,
    smtpUser: env.smtpUser,
    smtpPass: env.smtpPass,
    smtpFrom: env.smtpFrom!,
    smtpSecure: env.smtpSecure ?? env.smtpPort === 465,
  }
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
