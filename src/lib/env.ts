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
  get appBaseUrl() {
    return readEnv('APP_BASE_URL')
  },
  get databaseUrl() {
    return requireEnv('DATABASE_URL')
  },
  get authSecret() {
    return readEnv('AUTH_SECRET') ?? readEnv('NEXTAUTH_SECRET')
  },
  get auth0Domain() {
    return readEnv('AUTH0_DOMAIN')
  },
  get auth0ClientId() {
    return readEnv('AUTH0_CLIENT_ID')
  },
  get auth0ClientSecret() {
    return readEnv('AUTH0_CLIENT_SECRET')
  },
  get auth0Secret() {
    return readEnv('AUTH0_SECRET')
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
  get stripeProUpsellStarterPriceId() {
    return readEnv('STRIPE_PRO_UPSELL_STARTER_PRICE_ID')
  },
  get stripeProUpsellProPriceId() {
    return readEnv('STRIPE_PRO_UPSELL_PRO_PRICE_ID')
  },
  get stripeProUpsellElitePriceId() {
    return readEnv('STRIPE_PRO_UPSELL_ELITE_PRICE_ID')
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
  const value = env.authSecret
  if (!value) {
    throw new Error('Missing required environment variable: AUTH_SECRET (or NEXTAUTH_SECRET)')
  }
  return value
}

export function getAppBaseUrl() {
  return env.appBaseUrl
}

export function getNextAuthUrl() {
  return env.nextAuthUrl
}

export function hasAuth0Config() {
  return Boolean(
    env.appBaseUrl &&
      env.auth0Domain &&
      env.auth0ClientId &&
      env.auth0ClientSecret &&
      env.auth0Secret,
  )
}

export function requireAuth0Env() {
  return {
    appBaseUrl: requireEnv('APP_BASE_URL'),
    auth0Domain: requireEnv('AUTH0_DOMAIN'),
    auth0ClientId: requireEnv('AUTH0_CLIENT_ID'),
    auth0ClientSecret: requireEnv('AUTH0_CLIENT_SECRET'),
    auth0Secret: requireEnv('AUTH0_SECRET'),
  }
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
      env.stripeRealtorPriceId &&
      env.stripeProUpsellStarterPriceId &&
      env.stripeProUpsellProPriceId &&
      env.stripeProUpsellElitePriceId,
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
    stripeProUpsellStarterPriceId: requireEnv('STRIPE_PRO_UPSELL_STARTER_PRICE_ID'),
    stripeProUpsellProPriceId: requireEnv('STRIPE_PRO_UPSELL_PRO_PRICE_ID'),
    stripeProUpsellElitePriceId: requireEnv('STRIPE_PRO_UPSELL_ELITE_PRICE_ID'),
    stripeBillingPortalReturnUrl: readEnv('STRIPE_BILLING_PORTAL_RETURN_URL'),
  }
}
