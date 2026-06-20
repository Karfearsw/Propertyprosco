import 'server-only'
import { SubscriptionStatus, type ProProfile, type RealtorProfile } from '@prisma/client'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getBillingPlan, isBillingRole, type BillingRole } from '@/lib/billing-config'
import { hasPaidAccess } from '@/lib/billing-state'

type PaidProfile = ProProfile | RealtorProfile

export type PaidAccessContext = {
  role: BillingRole
  plan: ReturnType<typeof getBillingPlan>
  profile: PaidProfile | null
  effectiveStatus: SubscriptionStatus
  hasFullAccess: boolean
}

export async function getPaidAccessContext() {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return null
  }

  const role = session.user.role
  const profile =
    role === 'PRO'
      ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
      : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

  const effectiveStatus = profile?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING

  return {
    role,
    plan: getBillingPlan(role),
    profile,
    effectiveStatus,
    hasFullAccess: hasPaidAccess(effectiveStatus),
  } satisfies PaidAccessContext
}

export async function requirePaidAccess(options?: {
  redirectTo?: string
}) {
  const context = await getPaidAccessContext()

  if (!context) {
    redirect(options?.redirectTo ?? '/login')
  }

  if (context.effectiveStatus !== SubscriptionStatus.ACTIVE) {
    redirect(context.plan.billingPath)
  }

  return context
}
