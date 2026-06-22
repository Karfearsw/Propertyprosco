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

class AuthConfigurationError extends CredentialsSignin {
  code = 'auth_configuration_error'
}

function redactEmail(email: string) {
  const [localPart, domainPart] = email.split('@')
  const visibleLocal = localPart ? localPart.slice(0, 2) : 'u'
  const maskedLocal = `${visibleLocal}${localPart && localPart.length > 2 ? '***' : ''}`

  return domainPart ? `${maskedLocal}@${domainPart}` : maskedLocal
}

function logCredentialsEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, unknown>,
) {
  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info
  logger(`[auth][credentials] ${message}`, metadata ?? {})
}

async function handleInvalidCredentials(email: string): Promise<null> {
  try {
    const failure = await recordFailedLogin(email)

    if (!failure.ok) {
      logCredentialsEvent('warn', 'login failure escalated', {
        email: redactEmail(email),
        code: failure.code,
      })

      if (failure.code === 'account_locked') {
        throw new AccountLockedError()
      }
    }
  } catch (error) {
    if (error instanceof AccountLockedError) {
      throw error
    }

    logCredentialsEvent('error', 'failed to persist login failure state', {
      email: redactEmail(email),
      error: error instanceof Error ? error.message : 'unknown_error',
    })
  }

  return null
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
      const emailInput = typeof credentials?.email === 'string' ? credentials.email : ''
      const password = typeof credentials?.password === 'string' ? credentials.password : ''
      const email = normalizeEmail(emailInput)

      if (!email || !password) {
        logCredentialsEvent('warn', 'missing email or password')
        throw new InvalidCredentialsError()
      }

      if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
        logCredentialsEvent('error', 'missing auth secret for credentials provider')
        throw new AuthConfigurationError()
      }

      let gate
      try {
        gate = await guardLoginAttempt(email, request)
      } catch (error) {
        logCredentialsEvent('error', 'failed to evaluate login throttle state', {
          email: redactEmail(email),
          error: error instanceof Error ? error.message : 'unknown_error',
        })
        throw new AuthConfigurationError()
      }

      if (!gate.ok) {
        logCredentialsEvent('warn', 'credentials attempt denied by throttle guard', {
          email: redactEmail(email),
          code: gate.code,
        })

        if (gate.code === 'account_locked') {
          throw new AccountLockedError()
        }

        throw new RateLimitedSigninError()
      }

      let user
      try {
        user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true,
            emailVerified: true,
          },
        })
      } catch (error) {
        logCredentialsEvent('error', 'database lookup failed during credentials signin', {
          email: redactEmail(email),
          error: error instanceof Error ? error.message : 'unknown_error',
        })
        throw new AuthConfigurationError()
      }

      if (!user || !user.password) {
        logCredentialsEvent('warn', 'credentials user not found or password missing', {
          email: redactEmail(email),
          userFound: Boolean(user),
        })
        return handleInvalidCredentials(email)
      }

      const loginUser = user as {
        id: string
        email: string
        name: string | null
        role: string
        password: string
        emailVerified: Date | null
      }

      if (!loginUser.emailVerified) {
        logCredentialsEvent('warn', 'credentials signin blocked because email is not verified', {
          email: redactEmail(email),
        })
        throw new EmailNotVerifiedError()
      }

      let valid = false
      try {
        valid = await bcrypt.compare(password, loginUser.password)
      } catch (error) {
        logCredentialsEvent('error', 'password comparison failed', {
          email: redactEmail(email),
          error: error instanceof Error ? error.message : 'unknown_error',
        })
        throw new AuthConfigurationError()
      }

      if (!valid) {
        logCredentialsEvent('warn', 'credentials password mismatch', {
          email: redactEmail(email),
        })
        return handleInvalidCredentials(email)
      }

      try {
        await clearFailedLoginState(email)
      } catch (error) {
        logCredentialsEvent('error', 'failed to clear login failure state after success', {
          email: redactEmail(email),
          error: error instanceof Error ? error.message : 'unknown_error',
        })
        throw new AuthConfigurationError()
      }

      logCredentialsEvent('info', 'credentials signin succeeded', {
        email: redactEmail(email),
        userId: loginUser.id,
      })

      return {
        id: loginUser.id,
        email: loginUser.email,
        name: loginUser.name,
        role: loginUser.role,
        billingStatus: null,
      }
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
