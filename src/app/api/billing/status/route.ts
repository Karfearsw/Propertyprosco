import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { auth } from '@/auth'
import { getBillingPlan, isBillingRole } from '@/lib/billing-config'
import {
  getBillingStatusLabel,
  hasPaidAccess,
  needsBillingAction,
} from '@/lib/billing-state'
import { hasStripeBilling } from '@/lib/env'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles have billing status.' }, { status: 403 })
  }

  const plan = getBillingPlan(session.user.role)
  const profile =
    session.user.role === 'PRO'
      ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
      : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

  const status = profile?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING

  return NextResponse.json({
    enabled: hasStripeBilling(),
    role: session.user.role,
    plan,
    status,
    statusLabel: getBillingStatusLabel(status),
    hasFullAccess: hasPaidAccess(status),
    needsBillingAction: needsBillingAction(status),
    stripeCustomerId: profile?.stripeCustomerId ?? null,
    stripeSubscriptionId: profile?.stripeSubscriptionId ?? null,
  })
}
