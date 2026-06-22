import 'server-only'
import bcrypt from 'bcryptjs'
import { SubscriptionStatus } from '@prisma/client'
import { createHash, randomBytes, randomInt } from 'crypto'
import { authError } from '@/lib/auth-errors'
import { db } from '@/lib/db'

export type AppRole = 'HOMEOWNER' | 'PRO' | 'REALTOR' | 'ADMIN'

export const supportedRoles = ['HOMEOWNER', 'PRO', 'REALTOR'] as const

const dashboardByRole: Record<AppRole, string> = {
  HOMEOWNER: '/homeowner/dashboard',
  PRO: '/pro/dashboard',
  REALTOR: '/realtor/dashboard',
  ADMIN: '/homeowner/dashboard',
}

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000
const EMAIL_VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000
const PASSWORD_RESET_PREFIX = 'password-reset:'
const EMAIL_VERIFICATION_PREFIX = 'verify-email:'
const EMAIL_VERIFICATION_CODE_PREFIX = 'verify-email-code:'

type PersistedUser = {
  id: string
  email: string
  role: AppRole
  password: string | null
  phone: string | null
  zipCode: string | null
  proProfile: { id: string } | null
  realtorProfile: { id: string } | null
  accounts: { provider: string }[]
}

function isSupportedRole(value?: string | null): value is (typeof supportedRoles)[number] {
  return supportedRoles.includes(value as (typeof supportedRoles)[number])
}

function resetIdentifier(email: string) {
  return `${PASSWORD_RESET_PREFIX}${normalizeEmail(email)}`
}

function verificationIdentifier(email: string) {
  return `${EMAIL_VERIFICATION_PREFIX}${normalizeEmail(email)}`
}

function verificationCodeIdentifier(email: string) {
  return `${EMAIL_VERIFICATION_CODE_PREFIX}${normalizeEmail(email)}`
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function hashScopedToken(identifier: string, token: string) {
  return createHash('sha256').update(`${identifier}:${token}`).digest('hex')
}

function generateVerificationCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function roleLabel(role: AppRole) {
  switch (role) {
    case 'PRO':
      return 'Service Pro'
    case 'REALTOR':
      return 'Realtor'
    case 'ADMIN':
      return 'Admin'
    default:
      return 'Homeowner'
  }
}

export function roleHomeForRole(role?: AppRole) {
  if (!role) return '/login'
  return dashboardByRole[role] ?? '/login'
}

export function inferUserRole(user: Pick<PersistedUser, 'role' | 'proProfile' | 'realtorProfile'>): AppRole {
  if (user.proProfile) return 'PRO'
  if (user.realtorProfile) return 'REALTOR'
  return user.role
}

export function needsSocialRoleSelection(user: PersistedUser) {
  return (
    !user.password &&
    user.accounts.length > 0 &&
    !user.proProfile &&
    !user.realtorProfile &&
    !user.phone &&
    !user.zipCode &&
    user.role === 'HOMEOWNER'
  )
}

export async function getAuthFlowUser(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
      phone: true,
      zipCode: true,
      proProfile: { select: { id: true } },
      realtorProfile: { select: { id: true } },
      accounts: { select: { provider: true } },
    },
  })
}

function welcomeCopy(role: AppRole) {
  switch (role) {
    case 'PRO':
      return {
        body: 'Your Pro account is ready. Complete billing to unlock leads and messaging.',
        link: '/pro/billing',
      }
    case 'REALTOR':
      return {
        body: 'Your Realtor account is ready. Complete billing to unlock client coordination tools.',
        link: '/realtor/billing',
      }
    default:
      return {
        body: 'Your account is ready. Post your first project to start receiving quotes.',
        link: '/homeowner/dashboard',
      }
  }
}

export async function ensureRoleOnboardingState(userId: string, role: AppRole) {
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role },
    })

    if (role === 'PRO') {
      await tx.proProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          services: [],
          serviceArea: [],
          subscriptionStatus: SubscriptionStatus.CHECKOUT_PENDING,
        },
      })
    }

    if (role === 'REALTOR') {
      await tx.realtorProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          subscriptionStatus: SubscriptionStatus.CHECKOUT_PENDING,
        },
      })
    }

    const existingWelcome = await tx.notification.findFirst({
      where: {
        userId,
        type: 'welcome',
      },
      select: { id: true },
    })

    if (!existingWelcome) {
      const copy = welcomeCopy(role)
      await tx.notification.create({
        data: {
          userId,
          type: 'welcome',
          title: 'Welcome to Property Pros!',
          body: copy.body,
          link: copy.link,
        },
      })
    }
  })

  if (role === 'PRO') return '/pro/billing'
  if (role === 'REALTOR') return '/realtor/billing'
  return roleHomeForRole(role)
}

export function parseDesiredRole(value?: string | null) {
  return isSupportedRole(value) ? value : undefined
}

export async function issuePasswordResetToken(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      email: true,
      password: true,
    },
  })

  if (!user?.password) {
    return {
      email: normalizedEmail,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      issued: false,
      rawToken: null as string | null,
    }
  }

  const rawToken = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

  await db.verificationToken.deleteMany({
    where: { identifier: resetIdentifier(normalizedEmail) },
  })

  await db.verificationToken.create({
    data: {
      identifier: resetIdentifier(normalizedEmail),
      token: hashToken(rawToken),
      expires: expiresAt,
    },
  })

  return {
    email: normalizedEmail,
    expiresAt,
    issued: true,
    rawToken,
  }
}

export async function issueEmailVerificationToken(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      email: true,
      password: true,
      emailVerified: true,
    },
  })

  if (!user?.password || user.emailVerified) {
    return {
      email: normalizedEmail,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      issued: false,
      rawToken: null as string | null,
      alreadyVerified: Boolean(user?.emailVerified),
    }
  }

  const rawToken = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS)

  await db.verificationToken.deleteMany({
    where: { identifier: verificationIdentifier(normalizedEmail) },
  })

  await db.verificationToken.create({
    data: {
      identifier: verificationIdentifier(normalizedEmail),
      token: hashToken(rawToken),
      expires: expiresAt,
    },
  })

  return {
    email: normalizedEmail,
    expiresAt,
    issued: true,
    rawToken,
    alreadyVerified: false,
  }
}

export async function issueEmailVerificationCode(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      email: true,
      password: true,
      emailVerified: true,
    },
  })

  if (!user?.password || user.emailVerified) {
    return {
      email: normalizedEmail,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_CODE_TTL_MS),
      issued: false,
      code: null as string | null,
      alreadyVerified: Boolean(user?.emailVerified),
    }
  }

  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_CODE_TTL_MS)
  const identifier = verificationCodeIdentifier(normalizedEmail)

  await db.verificationToken.deleteMany({
    where: { identifier },
  })

  await db.verificationToken.create({
    data: {
      identifier,
      token: hashScopedToken(identifier, code),
      expires: expiresAt,
    },
  })

  return {
    email: normalizedEmail,
    expiresAt,
    issued: true,
    code,
    alreadyVerified: false,
  }
}

export async function issueEmailVerificationChallenge(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      email: true,
      password: true,
      emailVerified: true,
    },
  })

  if (!user?.password || user.emailVerified) {
    return {
      email: normalizedEmail,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      issued: false,
      rawToken: null as string | null,
      code: null as string | null,
      alreadyVerified: Boolean(user?.emailVerified),
    }
  }

  await db.verificationToken.deleteMany({
    where: {
      OR: [
        { identifier: verificationIdentifier(normalizedEmail) },
        { identifier: verificationCodeIdentifier(normalizedEmail) },
      ],
    },
  })

  const tokenState = await issueEmailVerificationToken(normalizedEmail)
  const codeState = await issueEmailVerificationCode(normalizedEmail)

  return {
    email: normalizedEmail,
    expiresAt: tokenState.expiresAt,
    issued: tokenState.issued && codeState.issued,
    rawToken: tokenState.rawToken,
    code: codeState.code,
    alreadyVerified: false,
  }
}

export async function validatePasswordResetToken(rawToken: string) {
  const token = rawToken.trim()
  if (!token) return null

  const record = await db.verificationToken.findUnique({
    where: { token: hashToken(token) },
  })

  if (!record || !record.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
    return null
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token: record.token } })
    return null
  }

  const email = record.identifier.slice(PASSWORD_RESET_PREFIX.length)
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true },
  })

  if (!user?.password) {
    await db.verificationToken.delete({ where: { token: record.token } })
    return null
  }

  return {
    email,
    expiresAt: record.expires,
    hashedToken: record.token,
    userId: user.id,
  }
}

export async function validateEmailVerificationToken(rawToken: string) {
  const token = rawToken.trim()
  if (!token) return null

  const record = await db.verificationToken.findUnique({
    where: { token: hashToken(token) },
  })

  if (!record || !record.identifier.startsWith(EMAIL_VERIFICATION_PREFIX)) {
    return null
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token: record.token } })
    return null
  }

  return {
    email: record.identifier.slice(EMAIL_VERIFICATION_PREFIX.length),
    expiresAt: record.expires,
    hashedToken: record.token,
  }
}

export async function validateEmailVerificationCode(email: string, rawCode: string) {
  const normalizedEmail = normalizeEmail(email)
  const code = rawCode.trim()
  if (!code) return null

  const identifier = verificationCodeIdentifier(normalizedEmail)
  const record = await db.verificationToken.findFirst({
    where: {
      identifier,
      token: hashScopedToken(identifier, code),
    },
  })

  if (!record) {
    return null
  }

  if (record.expires < new Date()) {
    await db.verificationToken.deleteMany({ where: { identifier } })
    return null
  }

  return {
    email: normalizedEmail,
    expiresAt: record.expires,
    hashedToken: record.token,
  }
}

export async function verifyEmailWithToken(rawToken: string) {
  const tokenState = await validateEmailVerificationToken(rawToken)
  if (!tokenState) {
    return {
      ok: false as const,
      ...authError('verification_token_invalid', 'This email verification link is invalid or has expired.'),
    }
  }

  const user = await db.user.findUnique({
    where: { email: tokenState.email },
    select: {
      id: true,
      email: true,
      password: true,
      emailVerified: true,
    },
  })

  if (!user?.password) {
    await db.verificationToken.deleteMany({
      where: { identifier: verificationIdentifier(tokenState.email) },
    })
    return {
      ok: false as const,
      ...authError('verification_token_invalid', 'This email verification link is no longer valid.'),
    }
  }

  if (user.emailVerified) {
    await db.verificationToken.deleteMany({
      where: { identifier: verificationIdentifier(tokenState.email) },
    })

    return {
      ok: true as const,
      email: user.email,
      alreadyVerified: true,
    }
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.deleteMany({
      where: { identifier: verificationIdentifier(tokenState.email) },
    }),
  ])

  return {
    ok: true as const,
    email: user.email,
    alreadyVerified: false,
  }
}

export async function verifyEmailWithCode(email: string, rawCode: string) {
  const codeState = await validateEmailVerificationCode(email, rawCode)
  if (!codeState) {
    return {
      ok: false as const,
      ...authError('verification_code_invalid', 'This verification code is invalid or has expired.'),
    }
  }

  const user = await db.user.findUnique({
    where: { email: codeState.email },
    select: {
      id: true,
      email: true,
      password: true,
      emailVerified: true,
    },
  })

  if (!user?.password) {
    await db.verificationToken.deleteMany({
      where: {
        OR: [
          { identifier: verificationIdentifier(codeState.email) },
          { identifier: verificationCodeIdentifier(codeState.email) },
        ],
      },
    })
    return {
      ok: false as const,
      ...authError('verification_code_invalid', 'This verification code is no longer valid.'),
    }
  }

  if (user.emailVerified) {
    await db.verificationToken.deleteMany({
      where: {
        OR: [
          { identifier: verificationIdentifier(codeState.email) },
          { identifier: verificationCodeIdentifier(codeState.email) },
        ],
      },
    })

    return {
      ok: true as const,
      email: user.email,
      alreadyVerified: true,
    }
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.deleteMany({
      where: {
        OR: [
          { identifier: verificationIdentifier(codeState.email) },
          { identifier: verificationCodeIdentifier(codeState.email) },
        ],
      },
    }),
  ])

  return {
    ok: true as const,
    email: user.email,
    alreadyVerified: false,
  }
}

export async function resetPasswordWithToken(rawToken: string, password: string) {
  const tokenState = await validatePasswordResetToken(rawToken)
  if (!tokenState) {
    return {
      ok: false as const,
      ...authError('password_reset_token_invalid', 'This password reset link is invalid or has expired.'),
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.$transaction([
    db.user.update({
      where: { id: tokenState.userId },
      data: { password: hashedPassword },
    }),
    db.session.deleteMany({ where: { userId: tokenState.userId } }),
    db.verificationToken.deleteMany({
      where: { identifier: resetIdentifier(tokenState.email) },
    }),
  ])

  return { ok: true as const, email: tokenState.email }
}
