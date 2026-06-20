import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { SubscriptionStatus } from '@prisma/client'
import type { Provider } from 'next-auth/providers'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/lib/auth-flows'
import { env, hasAppleAuth, hasGoogleAuth } from '@/lib/env'

const providers: Provider[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email:    { label: 'Email',    type: 'email'    },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      const email = normalizeEmail(credentials.email as string)

      const user = await db.user.findUnique({
        where: { email },
      })
      if (!user || !user.password) return null

      const valid = await bcrypt.compare(
        credentials.password as string,
        user.password,
      )
      if (!valid) return null

      return user
    },
  }),
]

if (hasGoogleAuth()) {
  providers.unshift(
    GoogleProvider({
      clientId: env.googleClientId!,
      clientSecret: env.googleClientSecret!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  )
}

if (hasAppleAuth()) {
  providers.unshift(
    AppleProvider({
      clientId: env.appleClientId!,
      clientSecret: env.appleClientSecret!,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers,
  secret: env.authSecret,
  callbacks: {
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
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.billingStatus = (token.billingStatus as SubscriptionStatus | null | undefined) ?? null
      }
      return session
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
        if (existing) return true
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
})
