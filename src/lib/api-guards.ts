import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { auth } from '@/auth'
import { getBillingPlan, isBillingRole, type BillingRole } from '@/lib/billing-config'

export type ApiSessionUser = {
  id: string
  role: string
  billingStatus?: SubscriptionStatus | null
}

export async function getApiSessionUser() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return {
    user: session.user as ApiSessionUser,
    response: null,
  }
}

export function jsonForbidden(error: string, status = 403) {
  return NextResponse.json({ error }, { status })
}

export function jsonBillingRequired(role: BillingRole, status?: SubscriptionStatus | null) {
  const plan = getBillingPlan(role)

  return NextResponse.json(
    {
      error: 'Active billing is required for this action',
      billingPath: plan.billingPath,
      billingStatus: status ?? SubscriptionStatus.CHECKOUT_PENDING,
    },
    { status: 402 },
  )
}

export function requirePaidApiRole(user: ApiSessionUser, role?: BillingRole) {
  if (!isBillingRole(user.role)) {
    return jsonForbidden('Forbidden')
  }

  if (role && user.role !== role) {
    return jsonForbidden('Forbidden')
  }

  if (user.billingStatus !== SubscriptionStatus.ACTIVE) {
    return jsonBillingRequired(role ?? user.role, user.billingStatus)
  }

  return null
}
