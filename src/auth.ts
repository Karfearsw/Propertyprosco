import NextAuth from 'next-auth'
import { CredentialsSignin } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { SubscriptionStatus } from '@prisma/client'
import type { Provider } from 'next-auth/providers'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import authConfig from '@/auth.config'
import { clearFailedLoginState, guardLoginAttempt, recordFailedLogin } from '@/lib/auth-guard'
import { consumeAuth0BridgeToken } from '@/lib/auth0-user'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/lib/auth-flows'
import { requireAuthSecret } from '@/lib/env'

class EmailNotVerifiedError extends CredentialsSignin {
  code = 'email_not_verified'
}

class InvalidCredentialsError extends CredentialsSignin {
  code = 'invalid_credentials'
}

class Auth0BridgeSigninError extends CredentialsSignin {
  code = 'auth0_bridge_failed'
}

class AccountLockedError extends CredentialsSignin {
  code = 'account_locked'
}

class RateLimitedSigninError extends CredentialsSignin {
  code = 'rate_limited'
}

const providers: Provider[] = [
  ...((authConfig.providers as Provider[] | undefined) ?? []),
  CredentialsProvider({
    id: 'auth0-bridge',
    name: 'auth0-bridge',
    credentials: {
      token: { label: 'Bridge token', type: 'text' },
    },
    async authorize(credentials) {
      const token = typeof credentials?.token === 'string' ? credentials.token : ''
      if (!token) {
        throw new Auth0BridgeSigninError()
      }

      const user = await consumeAuth0BridgeToken(token)
      if (!user) {
        throw new Auth0BridgeSigninError()
      }

      return user
    },
  }),
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email:    { label: 'Email',    type: 'email'    },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials, request) {
      if (!credentials?.email || !credentials?.password) {
        throw new InvalidCredentialsError()
      }

      const email = normalizeEmail(credentials.email as string)

      const gate = await guardLoginAttempt(email, request)
      if (!gate.ok) {
        if (gate.code === 'account_locked') {
          throw new AccountLockedError()
        }

        throw new RateLimitedSigninError()
      }

      const user = await db.user.findUnique({
        where: { email },
      })
      if (!user || !user.password) {
        const failure = await recordFailedLogin(email)
        if (!failure.ok && failure.code === 'account_locked') {
          throw new AccountLockedError()
        }

        throw new InvalidCredentialsError()
      }

      if (!user.emailVerified) {
        throw new EmailNotVerifiedError()
      }

      const valid = await bcrypt.compare(
        credentials.password as string,
        user.password,
      )
      if (!valid) {
        const failure = await recordFailedLogin(email)
        if (!failure.ok && failure.code === 'account_locked') {
          throw new AccountLockedError()
        }

        throw new InvalidCredentialsError()
      }

      await clearFailedLoginState(email)

      return user
    },
  }),
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
  secret: requireAuthSecret(),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.id   = user.id
      }

      if (token.id) {
        const latestUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            proProfile: { select: { subscriptionStatus: true } },
            realtorProfile: { select: { subscriptionStatus: true } },
          },
        })

        if (latestUser) {
          token.role = latestUser.role
          token.billingStatus =
            latestUser.role === 'PRO'
              ? latestUser.proProfile?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING
              : latestUser.role === 'REALTOR'
                ? latestUser.realtorProfile?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING
                : null
        }
      }

      if (trigger === 'update' && session?.role) {
        token.role = session.role
      }
      return token
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const googleProfile = profile as { email_verified?: boolean | null; verified_email?: boolean | null } | undefined
        const verified =
          googleProfile?.email_verified === true ||
          googleProfile?.verified_email === true

        if (!verified) {
          return false
        }
      }

      if (account?.provider === 'apple') {
        const appleProfile = profile as { email_verified?: boolean | null } | undefined
        const verified = appleProfile?.email_verified === true

        if (appleProfile?.email_verified !== undefined && !verified) {
          return false
        }
      }

      if ((account?.provider === 'google' || account?.provider === 'apple') && user.email) {
        const existing = await db.user.findUnique({ where: { email: user.email } })
        if (existing && !existing.emailVerified) {
          await db.user.update({
            where: { id: existing.id },
            data: { emailVerified: new Date() },
          })
        }

        if (existing) return true
      }
      return true
    },
  },
})
