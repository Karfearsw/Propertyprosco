import 'server-only'

import { db } from '@/lib/db'

const LOGIN_EMAIL_SCOPE = 'login-email'
const LOGIN_IP_SCOPE = 'login-ip'
const SIGNUP_EMAIL_SCOPE = 'signup-email'
const SIGNUP_IP_SCOPE = 'signup-ip'

const LOGIN_IP_WINDOW_MS = 10 * 60 * 1000
const LOGIN_IP_MAX_ATTEMPTS = 12
const LOGIN_EMAIL_WINDOW_MS = 15 * 60 * 1000
const LOGIN_EMAIL_MAX_FAILURES = 5
const LOGIN_EMAIL_LOCKOUT_MS = 15 * 60 * 1000

const SIGNUP_IP_WINDOW_MS = 30 * 60 * 1000
const SIGNUP_IP_MAX_ATTEMPTS = 8
const SIGNUP_EMAIL_WINDOW_MS = 30 * 60 * 1000
const SIGNUP_EMAIL_MAX_ATTEMPTS = 3

type GuardResult =
  | { ok: true }
  | {
      ok: false
      code: 'account_locked' | 'rate_limited'
      error: string
    }

function bestEffortIpAddress(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const [first] = forwardedFor.split(',')
    if (first?.trim()) return first.trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp?.trim()) return realIp.trim()

  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp?.trim()) return cfIp.trim()

  return 'unknown'
}

function isWindowExpired(firstFailureAt: Date | null, windowMs: number, now: Date) {
  if (!firstFailureAt) return true
  return now.getTime() - firstFailureAt.getTime() > windowMs
}

async function consumeWindowRateLimit(input: {
  scope: string
  key: string
  maxAttempts: number
  windowMs: number
  error: string
}): Promise<GuardResult> {
  const now = new Date()
  const record = await db.authThrottle.findUnique({
    where: {
      scope_key: {
        scope: input.scope,
        key: input.key,
      },
    },
  })

  if (!record || isWindowExpired(record.firstFailureAt, input.windowMs, now)) {
    await db.authThrottle.upsert({
      where: {
        scope_key: {
          scope: input.scope,
          key: input.key,
        },
      },
      update: {
        failureCount: 1,
        firstFailureAt: now,
        lastFailureAt: now,
        lockedUntil: null,
      },
      create: {
        scope: input.scope,
        key: input.key,
        failureCount: 1,
        firstFailureAt: now,
        lastFailureAt: now,
      },
    })

    return { ok: true }
  }

  if (record.failureCount >= input.maxAttempts) {
    return {
      ok: false,
      code: 'rate_limited',
      error: input.error,
    }
  }

  await db.authThrottle.update({
    where: {
      scope_key: {
        scope: input.scope,
        key: input.key,
      },
    },
    data: {
      failureCount: { increment: 1 },
      lastFailureAt: now,
    },
  })

  return { ok: true }
}

export async function guardLoginAttempt(email: string, request: Request): Promise<GuardResult> {
  const ipAddress = bestEffortIpAddress(request)

  const ipRateLimit = await consumeWindowRateLimit({
    scope: LOGIN_IP_SCOPE,
    key: ipAddress,
    maxAttempts: LOGIN_IP_MAX_ATTEMPTS,
    windowMs: LOGIN_IP_WINDOW_MS,
    error: 'Too many login attempts right now. Wait a moment, then try again.',
  })

  if (!ipRateLimit.ok) {
    return ipRateLimit
  }

  const record = await db.authThrottle.findUnique({
    where: {
      scope_key: {
        scope: LOGIN_EMAIL_SCOPE,
        key: email,
      },
    },
  })

  if (record?.lockedUntil && record.lockedUntil > new Date()) {
    return {
      ok: false,
      code: 'account_locked',
      error: 'Your account is temporarily locked after too many failed login attempts. Try again shortly.',
    }
  }

  return { ok: true }
}

export async function recordFailedLogin(email: string): Promise<GuardResult> {
  const now = new Date()
  const record = await db.authThrottle.findUnique({
    where: {
      scope_key: {
        scope: LOGIN_EMAIL_SCOPE,
        key: email,
      },
    },
  })

  if (!record || isWindowExpired(record.firstFailureAt, LOGIN_EMAIL_WINDOW_MS, now)) {
    await db.authThrottle.upsert({
      where: {
        scope_key: {
          scope: LOGIN_EMAIL_SCOPE,
          key: email,
        },
      },
      update: {
        failureCount: 1,
        firstFailureAt: now,
        lastFailureAt: now,
        lockedUntil: null,
      },
      create: {
        scope: LOGIN_EMAIL_SCOPE,
        key: email,
        failureCount: 1,
        firstFailureAt: now,
        lastFailureAt: now,
      },
    })

    return { ok: true }
  }

  const nextFailureCount = record.failureCount + 1
  const shouldLock = nextFailureCount >= LOGIN_EMAIL_MAX_FAILURES

  await db.authThrottle.update({
    where: {
      scope_key: {
        scope: LOGIN_EMAIL_SCOPE,
        key: email,
      },
    },
    data: {
      failureCount: nextFailureCount,
      lastFailureAt: now,
      lockedUntil: shouldLock ? new Date(now.getTime() + LOGIN_EMAIL_LOCKOUT_MS) : null,
    },
  })

  if (shouldLock) {
    return {
      ok: false,
      code: 'account_locked',
      error: 'Your account is temporarily locked after too many failed login attempts. Try again shortly.',
    }
  }

  return { ok: true }
}

export async function clearFailedLoginState(email: string) {
  await db.authThrottle.deleteMany({
    where: {
      scope: LOGIN_EMAIL_SCOPE,
      key: email,
    },
  })
}

export async function guardSignupAttempt(email: string, request: Request): Promise<GuardResult> {
  const ipAddress = bestEffortIpAddress(request)

  const ipRateLimit = await consumeWindowRateLimit({
    scope: SIGNUP_IP_SCOPE,
    key: ipAddress,
    maxAttempts: SIGNUP_IP_MAX_ATTEMPTS,
    windowMs: SIGNUP_IP_WINDOW_MS,
    error: 'Too many signup attempts right now. Wait a moment, then try again.',
  })

  if (!ipRateLimit.ok) {
    return ipRateLimit
  }

  return consumeWindowRateLimit({
    scope: SIGNUP_EMAIL_SCOPE,
    key: email,
    maxAttempts: SIGNUP_EMAIL_MAX_ATTEMPTS,
    windowMs: SIGNUP_EMAIL_WINDOW_MS,
    error: 'Too many signup attempts right now. Wait a moment, then try again.',
  })
}
