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
  get databaseUrl() {
    return requireEnv('DATABASE_URL')
  },
  get authSecret() {
    return requireEnv('AUTH_SECRET')
  },
  get nextAuthUrl() {
    return readEnv('NEXTAUTH_URL')
  },
  get googleClientId() {
    return readEnv('GOOGLE_CLIENT_ID')
  },
  get googleClientSecret() {
    return readEnv('GOOGLE_CLIENT_SECRET')
  },
  get appleClientId() {
    return readEnv('APPLE_CLIENT_ID')
  },
  get appleClientSecret() {
    return readEnv('APPLE_CLIENT_SECRET')
  },
  get stripeSecretKey() {
    return readEnv('STRIPE_SECRET_KEY')
  },
  get stripePublishableKey() {
    return readEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
  },
  get stripeWebhookSecret() {
    return readEnv('STRIPE_WEBHOOK_SECRET')
  },
  get stripeProPriceId() {
    return readEnv('STRIPE_PRO_PRICE_ID')
  },
  get stripeRealtorPriceId() {
    return readEnv('STRIPE_REALTOR_PRICE_ID')
  },
  get stripeBillingPortalReturnUrl() {
    return readEnv('STRIPE_BILLING_PORTAL_RETURN_URL')
  },
  get smtpHost() {
    return readEnv('SMTP_HOST')
  },
  get smtpPort() {
    return readNumberEnv('SMTP_PORT')
  },
  get smtpUser() {
    return readEnv('SMTP_USER')
  },
  get smtpPass() {
    return readEnv('SMTP_PASS')
  },
  get smtpFrom() {
    return readEnv('SMTP_FROM')
  },
  get smtpSecure() {
    return readBooleanEnv('SMTP_SECURE')
  },
}

export function requireDatabaseUrl() {
  return env.databaseUrl
}

export function requireAuthSecret() {
  return env.authSecret
}

export function getNextAuthUrl() {
  return env.nextAuthUrl
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
