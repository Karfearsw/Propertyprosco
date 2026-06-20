import type { DefaultSession } from 'next-auth'
import type { SubscriptionStatus } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id:   string
      role: string
      billingStatus?: SubscriptionStatus | null
    } & DefaultSession['user']
  }
  interface User {
    role: string
    billingStatus?: SubscriptionStatus | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:   string
    role: string
    billingStatus?: SubscriptionStatus | null
  }
}
