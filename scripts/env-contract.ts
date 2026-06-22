export type ValidationTarget = 'local' | 'production'

export type EnvValidationReport = {
  errors: string[]
  warnings: string[]
}

type EnvMap = Record<string, string | undefined>

const CORE_REQUIRED_VARS = ['DATABASE_URL'] as const
const PRODUCTION_REQUIRED_VARS = ['NEXTAUTH_URL'] as const
const AUTH0_REQUIRED_VARS = [
  'APP_BASE_URL',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_SECRET',
] as const
const GOOGLE_AUTH_VARS = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const
const APPLE_AUTH_VARS = ['APPLE_CLIENT_ID', 'APPLE_CLIENT_SECRET'] as const
const SMTP_REQUIRED_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM'] as const
const SMTP_AUTH_VARS = ['SMTP_USER', 'SMTP_PASS'] as const
const STRIPE_REQUIRED_VARS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_REALTOR_PRICE_ID',
  'STRIPE_PRO_UPSELL_STARTER_PRICE_ID',
  'STRIPE_PRO_UPSELL_PRO_PRICE_ID',
  'STRIPE_PRO_UPSELL_ELITE_PRICE_ID',
] as const

function readEnvValue(input: EnvMap, name: string) {
  const value = input[name]
  return value && value.trim().length > 0 ? value.trim() : undefined
}

function findMissing(input: EnvMap, names: readonly string[]) {
  return names.filter((name) => !readEnvValue(input, name))
}

function hasAny(input: EnvMap, names: readonly string[]) {
  return names.some((name) => Boolean(readEnvValue(input, name)))
}

function hasAll(input: EnvMap, names: readonly string[]) {
  return names.every((name) => Boolean(readEnvValue(input, name)))
}

function pushGroupError(
  report: EnvValidationReport,
  groupName: string,
  names: readonly string[],
  input: EnvMap,
) {
  const present = names.filter((name) => Boolean(readEnvValue(input, name)))
  if (present.length === 0 || present.length === names.length) {
    return
  }

  const missing = names.filter((name) => !present.includes(name))
  report.errors.push(
    `${groupName} must be configured as a complete set. Missing: ${missing.join(', ')}.`,
  )
}

function validateBooleanLike(report: EnvValidationReport, input: EnvMap, name: string) {
  const value = readEnvValue(input, name)
  if (!value) return

  const normalized = value.toLowerCase()
  if (normalized === 'true' || normalized === 'false' || normalized === '1' || normalized === '0') {
    return
  }

  report.errors.push(`${name} must be one of: true, false, 1, 0.`)
}

function validateNumberLike(report: EnvValidationReport, input: EnvMap, name: string) {
  const value = readEnvValue(input, name)
  if (!value) return

  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    return
  }

  report.errors.push(`${name} must be a valid number.`)
}

function validatePrefix(report: EnvValidationReport, input: EnvMap, name: string, prefix: string) {
  const value = readEnvValue(input, name)
  if (!value || value.startsWith(prefix)) {
    return
  }

  report.errors.push(`${name} must start with ${prefix}.`)
}

function validateUrlLike(report: EnvValidationReport, input: EnvMap, name: string) {
  const value = readEnvValue(input, name)
  if (!value) return

  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('unsupported protocol')
    }
  } catch {
    report.errors.push(`${name} must be a valid absolute URL.`)
  }
}

function validateStripeFormats(report: EnvValidationReport, input: EnvMap) {
  validatePrefix(report, input, 'STRIPE_SECRET_KEY', 'sk_')
  validatePrefix(report, input, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_')
  validatePrefix(report, input, 'STRIPE_WEBHOOK_SECRET', 'whsec_')
  validatePrefix(report, input, 'STRIPE_PRO_PRICE_ID', 'price_')
  validatePrefix(report, input, 'STRIPE_REALTOR_PRICE_ID', 'price_')
  validatePrefix(report, input, 'STRIPE_PRO_UPSELL_STARTER_PRICE_ID', 'price_')
  validatePrefix(report, input, 'STRIPE_PRO_UPSELL_PRO_PRICE_ID', 'price_')
  validatePrefix(report, input, 'STRIPE_PRO_UPSELL_ELITE_PRICE_ID', 'price_')
}

function validateStripeMode(report: EnvValidationReport, input: EnvMap, target: ValidationTarget) {
  if (target !== 'production') return

  const stripeSecretKey = readEnvValue(input, 'STRIPE_SECRET_KEY')
  const stripePublishableKey = readEnvValue(input, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')

  if (stripeSecretKey?.startsWith('sk_test_')) {
    report.errors.push('STRIPE_SECRET_KEY must be a live key in production, not a test key.')
  }

  if (stripePublishableKey?.startsWith('pk_test_')) {
    report.errors.push(
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a live key in production, not a test key.',
    )
  }
}

export function validateEnvContract(
  input: EnvMap,
  target: ValidationTarget = 'local',
): EnvValidationReport {
  const report: EnvValidationReport = {
    errors: [],
    warnings: [],
  }

  const missingCore: string[] = findMissing(input, CORE_REQUIRED_VARS)
  const hasAuthSecret = Boolean(
    readEnvValue(input, 'AUTH_SECRET') || readEnvValue(input, 'NEXTAUTH_SECRET'),
  )
  if (!hasAuthSecret) {
    missingCore.push('AUTH_SECRET (or NEXTAUTH_SECRET)')
  }
  if (missingCore.length > 0) {
    report.errors.push(`Missing required variables: ${missingCore.join(', ')}.`)
  }

  if (target === 'production') {
    const missingProduction = findMissing(input, PRODUCTION_REQUIRED_VARS)
    if (missingProduction.length > 0) {
      report.errors.push(
        `Missing production-required variables: ${missingProduction.join(', ')}.`,
      )
    }
  }

  pushGroupError(report, 'Google OAuth', GOOGLE_AUTH_VARS, input)
  pushGroupError(report, 'Apple OAuth', APPLE_AUTH_VARS, input)
  pushGroupError(report, 'SMTP authentication', SMTP_AUTH_VARS, input)

  const hasAnyAuth0 = hasAny(input, AUTH0_REQUIRED_VARS)
  if (hasAnyAuth0 && !hasAll(input, AUTH0_REQUIRED_VARS)) {
    const missingAuth0 = findMissing(input, AUTH0_REQUIRED_VARS)
    report.errors.push(`Auth0 requires: ${missingAuth0.join(', ')}.`)
  }

  validateUrlLike(report, input, 'APP_BASE_URL')
  const hasAnySmtp = hasAny(input, [...SMTP_REQUIRED_VARS, ...SMTP_AUTH_VARS, 'SMTP_SECURE'])
  const hasCompleteSmtp = hasAll(input, SMTP_REQUIRED_VARS) && hasAll(input, SMTP_AUTH_VARS)
  const hasAnonymousSmtp = hasAll(input, SMTP_REQUIRED_VARS) && !hasAny(input, SMTP_AUTH_VARS)

  if (hasAnySmtp && !hasAll(input, SMTP_REQUIRED_VARS)) {
    const missingSmtp = findMissing(input, SMTP_REQUIRED_VARS)
    report.errors.push(`SMTP requires: ${missingSmtp.join(', ')}.`)
  }

  validateNumberLike(report, input, 'SMTP_PORT')
  validateBooleanLike(report, input, 'SMTP_SECURE')

  const hasAnyStripe = hasAny(input, [...STRIPE_REQUIRED_VARS, 'STRIPE_BILLING_PORTAL_RETURN_URL'])
  if (hasAnyStripe && !hasAll(input, STRIPE_REQUIRED_VARS)) {
    const missingStripe = findMissing(input, STRIPE_REQUIRED_VARS)
    report.errors.push(`Stripe billing requires: ${missingStripe.join(', ')}.`)
  }

  validateStripeMode(report, input, target)
  validateStripeFormats(report, input)

  if (target === 'production' && !hasCompleteSmtp && !hasAnonymousSmtp) {
    report.warnings.push(
      'SMTP is not fully configured. Verification and password reset emails require SMTP outside local development.',
    )
  }

  if (target === 'production' && !hasAll(input, STRIPE_REQUIRED_VARS)) {
    report.warnings.push(
      'Stripe billing is not fully configured. Paid Pro and Realtor billing flows will stay unavailable until all Stripe variables are set.',
    )
  }

  return report
}
