import type { NextAuthConfig } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import GoogleProvider from 'next-auth/providers/google'
import { env, hasAppleAuth, hasGoogleAuth } from '@/lib/env'

const providers: NextAuthConfig['providers'] = []

if (hasGoogleAuth()) {
  providers.push(
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
  providers.push(
    AppleProvider({
      clientId: env.appleClientId!,
      clientSecret: env.appleClientSecret!,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

const authConfig = {
  session: { strategy: 'jwt' },
  providers,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.billingStatus = (token.billingStatus as typeof session.user.billingStatus) ?? null
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
} satisfies NextAuthConfig

export default authConfig
