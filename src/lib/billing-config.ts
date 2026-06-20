export type BillingRole = 'PRO' | 'REALTOR'

export type BillingPlan = {
  role: BillingRole
  planName: string
  amountCents: number
  intervalLabel: string
  priceIdEnv: 'STRIPE_PRO_PRICE_ID' | 'STRIPE_REALTOR_PRICE_ID'
  billingPath: string
  subscribePath: string
}

export const billingPlans: Record<BillingRole, BillingPlan> = {
  PRO: {
    role: 'PRO',
    planName: 'Pro Plan',
    amountCents: 999,
    intervalLabel: 'month',
    priceIdEnv: 'STRIPE_PRO_PRICE_ID',
    billingPath: '/pro/billing',
    subscribePath: '/pro/billing/subscribe',
  },
  REALTOR: {
    role: 'REALTOR',
    planName: 'Realtor Plan',
    amountCents: 2499,
    intervalLabel: 'month',
    priceIdEnv: 'STRIPE_REALTOR_PRICE_ID',
    billingPath: '/realtor/billing',
    subscribePath: '/realtor/billing/subscribe',
  },
}

export function isBillingRole(role?: string | null): role is BillingRole {
  return role === 'PRO' || role === 'REALTOR'
}

export function getBillingPlan(role: BillingRole) {
  return billingPlans[role]
}
