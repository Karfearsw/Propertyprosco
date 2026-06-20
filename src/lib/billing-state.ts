import type Stripe from 'stripe'
import { SubscriptionStatus } from '@prisma/client'

export type BillingProfileSnapshot = {
  subscriptionStatus: SubscriptionStatus
  subscriptionCurrentPeriodEnd: Date | null
  subscriptionCanceledAt: Date | null
}

export function normalizeStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case 'active':
      return SubscriptionStatus.ACTIVE
    case 'past_due':
      return SubscriptionStatus.PAST_DUE
    case 'canceled':
    case 'unpaid':
      return SubscriptionStatus.CANCELED
    case 'incomplete':
    case 'incomplete_expired':
      return SubscriptionStatus.INCOMPLETE
    case 'trialing':
      return SubscriptionStatus.ACTIVE
    default:
      return SubscriptionStatus.CHECKOUT_PENDING
  }
}

export function hasPaidAccess(status?: SubscriptionStatus | null) {
  return status === SubscriptionStatus.ACTIVE
}

export function needsBillingAction(status?: SubscriptionStatus | null) {
  switch (status) {
    case SubscriptionStatus.PAST_DUE:
    case SubscriptionStatus.CANCELED:
    case SubscriptionStatus.INCOMPLETE:
    case SubscriptionStatus.CHECKOUT_PENDING:
      return true
    default:
      return false
  }
}

export function getBillingStatusLabel(status?: SubscriptionStatus | null) {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'Active'
    case SubscriptionStatus.PAST_DUE:
      return 'Past due'
    case SubscriptionStatus.CANCELED:
      return 'Canceled'
    case SubscriptionStatus.CHECKOUT_PENDING:
      return 'Payment setup pending'
    case SubscriptionStatus.INCOMPLETE:
      return 'Incomplete'
    default:
      return 'Checkout pending'
  }
}
