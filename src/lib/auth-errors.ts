export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'auth0_bridge_failed'
  | 'email_already_in_use'
  | 'account_locked'
  | 'rate_limited'
  | 'verification_token_missing'
  | 'verification_token_invalid'
  | 'verification_code_invalid'
  | 'password_reset_token_missing'
  | 'password_reset_token_invalid'
  | 'validation_error'
  | 'auth_email_delivery_unavailable'
  | 'registration_unavailable'
  | 'auth_configuration_error'
  | 'internal_error'

export type AuthErrorPayload = {
  error: string
  code: AuthErrorCode
}

export function authError(code: AuthErrorCode, error: string): AuthErrorPayload {
  return { code, error }
}

export function isAuthEmailDeliveryError(error: unknown) {
  const message = error instanceof Error ? error.message : ''

  return (
    message.includes('SMTP mailer configuration is incomplete') ||
    message.includes('SMTP mailer configuration is required') ||
    message.includes('Complete the SMTP settings before sending auth emails')
  )
}

export function getLoginErrorMessage(code?: string | null, fallback?: string | null) {
  switch (code) {
    case 'email_not_verified':
      return 'Verify your email address before logging in. Use the link or 6-digit code from your inbox.'
    case 'auth0_bridge_failed':
      return 'Your secure social sign-in session expired or was interrupted. Continue with Google or Apple again.'
    case 'account_locked':
      return 'Your account is temporarily locked after too many failed login attempts. Try again shortly.'
    case 'rate_limited':
      return 'Too many login attempts right now. Wait a moment, then try again.'
    case 'auth_configuration_error':
      return 'Authentication is temporarily unavailable. Please try again shortly.'
    case 'invalid_credentials':
      return 'Invalid email or password.'
    default:
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'We could not sign you in. Please try again.'
  }
}

export function getSignupErrorMessage(code?: string | null, fallback?: string | null) {
  switch (code) {
    case 'email_already_in_use':
      return 'An account already exists for that email. Log in or verify your email to continue.'
    case 'rate_limited':
      return 'Too many signup attempts right now. Wait a moment, then try again.'
    case 'auth_email_delivery_unavailable':
      return 'Registration is temporarily unavailable because verification email delivery is not configured correctly yet.'
    case 'registration_unavailable':
      return 'Registration is temporarily unavailable while we finish a database update. Please try again in a few minutes.'
    case 'validation_error':
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'Check the highlighted signup details and try again.'
    default:
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'We could not create your account right now. Please try again in a few minutes.'
  }
}

export function getVerificationErrorMessage(code?: string | null, fallback?: string | null) {
  switch (code) {
    case 'verification_token_missing':
      return 'This verification link is missing its token.'
    case 'verification_token_invalid':
      return 'This verification link is invalid or has expired.'
    case 'verification_code_invalid':
      return 'This verification code is invalid or has expired.'
    case 'auth_email_delivery_unavailable':
      return 'Unable to resend verification email right now.'
    case 'validation_error':
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'Check the verification details and try again.'
    default:
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'Unable to verify your email right now.'
  }
}

export function getPasswordResetErrorMessage(code?: string | null, fallback?: string | null) {
  switch (code) {
    case 'password_reset_token_missing':
      return 'This password reset link is missing its token.'
    case 'password_reset_token_invalid':
      return 'This password reset link is invalid or has expired.'
    case 'auth_email_delivery_unavailable':
      return 'Unable to send reset instructions right now.'
    case 'validation_error':
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'Choose a stronger password that meets all requirements.'
    default:
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'Unable to process password reset.'
  }
}
