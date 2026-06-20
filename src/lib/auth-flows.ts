import 'server-only'
import bcrypt from 'bcryptjs'
import { SubscriptionStatus } from '@prisma/client'
import { createHash, randomBytes } from 'crypto'
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
const PASSWORD_RESET_PREFIX = 'password-reset:'

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

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
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
      resetUrl: null as string | null,
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
    resetUrl: `/reset-password?token=${rawToken}`,
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

export async function resetPasswordWithToken(rawToken: string, password: string) {
  const tokenState = await validatePasswordResetToken(rawToken)
  if (!tokenState) {
    return { ok: false as const, error: 'This password reset link is invalid or has expired.' }
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
