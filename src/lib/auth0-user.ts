import 'server-only'

import { createHash, randomBytes } from 'crypto'
import type { SessionData, User as Auth0User } from '@auth0/nextjs-auth0/types'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/lib/auth-flows'

const AUTH0_BRIDGE_PREFIX = 'auth0-bridge:'
const AUTH0_BRIDGE_TTL_MS = 10 * 60 * 1000

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function auth0BridgeIdentifier(userId: string) {
  return `${AUTH0_BRIDGE_PREFIX}${userId}`
}

type Auth0Profile = Pick<
  Auth0User,
  'sub' | 'email' | 'email_verified' | 'name' | 'given_name' | 'family_name' | 'picture'
>

export async function ensureAuth0LinkedUser(session: SessionData | null) {
  const auth0User = session?.user as Auth0Profile | undefined

  if (!auth0User?.sub || !auth0User.email || auth0User.email_verified !== true) {
    return null
  }

  const email = normalizeEmail(auth0User.email)
  const existingUser = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
    },
  })

  const linkedUser =
    existingUser ??
    (await db.user.create({
      data: {
        email,
        emailVerified: new Date(),
        name:
          auth0User.name ??
          ([auth0User.given_name, auth0User.family_name].filter(Boolean).join(' ') || null),
        firstName: auth0User.given_name ?? null,
        lastName: auth0User.family_name ?? null,
        image: auth0User.picture ?? null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    }))

  await db.user.update({
    where: { id: linkedUser.id },
    data: {
      emailVerified: new Date(),
      name: auth0User.name ?? undefined,
      firstName: auth0User.given_name ?? undefined,
      lastName: auth0User.family_name ?? undefined,
      image: auth0User.picture ?? undefined,
    },
  })

  await db.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'auth0',
        providerAccountId: auth0User.sub,
      },
    },
    update: {
      userId: linkedUser.id,
      type: 'oidc',
    },
    create: {
      userId: linkedUser.id,
      type: 'oidc',
      provider: 'auth0',
      providerAccountId: auth0User.sub,
    },
  })

  return linkedUser
}

export async function issueAuth0BridgeToken(userId: string) {
  const rawToken = randomBytes(32).toString('hex')
  const identifier = auth0BridgeIdentifier(userId)
  const expiresAt = new Date(Date.now() + AUTH0_BRIDGE_TTL_MS)

  await db.verificationToken.deleteMany({
    where: { identifier },
  })

  await db.verificationToken.create({
    data: {
      identifier,
      token: hashToken(rawToken),
      expires: expiresAt,
    },
  })

  return rawToken
}

export async function consumeAuth0BridgeToken(rawToken: string) {
  const token = rawToken.trim()
  if (!token) return null

  const hashedToken = hashToken(token)
  const record = await db.verificationToken.findUnique({
    where: { token: hashedToken },
  })

  if (!record || !record.identifier.startsWith(AUTH0_BRIDGE_PREFIX)) {
    return null
  }

  if (record.expires < new Date()) {
    await db.verificationToken.deleteMany({
      where: { token: hashedToken },
    })
    return null
  }

  const userId = record.identifier.slice(AUTH0_BRIDGE_PREFIX.length)
  return db.user.findUnique({
    where: { id: userId },
  })
}
