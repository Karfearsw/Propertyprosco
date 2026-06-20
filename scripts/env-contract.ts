export type ValidationTarget = 'local' | 'production'

export type EnvValidationReport = {
  errors: string[]
  warnings: string[]
}

type EnvMap = Record<string, string | undefined>

const CORE_REQUIRED_VARS = ['DATABASE_URL', 'AUTH_SECRET'] as const
const PRODUCTION_REQUIRED_VARS = ['NEXTAUTH_URL'] as const
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

export function validateEnvContract(
  input: EnvMap,
  target: ValidationTarget = 'local',
): EnvValidationReport {
  const report: EnvValidationReport = {
    errors: [],
    warnings: [],
  }

  const missingCore = findMissing(input, CORE_REQUIRED_VARS)
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
