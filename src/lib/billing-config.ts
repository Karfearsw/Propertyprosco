export type BillingRole = 'PRO' | 'REALTOR'

export type BillingPlan = {
  role: BillingRole
  planName: string
  marketingName: string
  amountCents: number
  intervalLabel: string
  amountLabel: string
  priceIdEnv: 'STRIPE_PRO_PRICE_ID' | 'STRIPE_REALTOR_PRICE_ID'
  billingPath: string
  subscribePath: string
  signupPath: string
  accentClassName: string
  accentButtonClassName: string
  manageButtonHoverClassName: string
  summary: string
  subscribeHeading: string
  subscribeEyebrow: string
  subscribeIntro: string
  features: string[]
  stripeSourceReference: string
  stripeHostedCheckoutReference?: string
  stripeBuyButtonIdReference?: string
}

export const billingPlans: Record<BillingRole, BillingPlan> = {
  PRO: {
    role: 'PRO',
    planName: 'Pro Plan',
    marketingName: 'Service Pro',
    amountCents: 999,
    intervalLabel: 'month',
    amountLabel: '$9.99 / month',
    priceIdEnv: 'STRIPE_PRO_PRICE_ID',
    billingPath: '/pro/billing',
    subscribePath: '/pro/billing/subscribe',
    signupPath: '/signup/pro',
    accentClassName: 'text-pp-red',
    accentButtonClassName: 'bg-pp-red hover:bg-pp-red-dark',
    manageButtonHoverClassName: 'hover:border-pp-red hover:text-pp-red',
    summary: 'Use Stripe to activate your monthly subscription securely and manage cancellation or card updates without contacting support.',
    subscribeHeading: 'Activate your Pro subscription',
    subscribeEyebrow: 'Secure Billing',
    subscribeIntro: 'Save a payment method securely with Stripe to start your Pro subscription right away.',
    features: [
      'Unlimited leads in your area',
      'Send unlimited quotes',
      'Verified business profile',
      'License & insurance badge',
      'Direct messaging',
      'Schedule management',
      'Saved leads',
      'Priority listing in search',
      'Flat monthly pricing — no per-lead fees',
    ],
    stripeSourceReference: 'Second supplied Stripe source',
    stripeHostedCheckoutReference: 'https://buy.stripe.com/test_4gMeVfbps9NdaZrgJccZa01',
    stripeBuyButtonIdReference: 'buy_btn_1TkXaoRylOVvbFnluPHGZAMS',
  },
  REALTOR: {
    role: 'REALTOR',
    planName: 'Realtor Plan',
    marketingName: 'Realtor',
    amountCents: 2499,
    intervalLabel: 'month',
    amountLabel: '$24.99 / month',
    priceIdEnv: 'STRIPE_REALTOR_PRICE_ID',
    billingPath: '/realtor/billing',
    subscribePath: '/realtor/billing/subscribe',
    signupPath: '/signup/realtor',
    accentClassName: 'text-pp-gold',
    accentButtonClassName: 'bg-pp-gold hover:bg-amber-800',
    manageButtonHoverClassName: 'hover:border-pp-gold hover:text-pp-gold',
    summary: 'Use Stripe to activate your monthly subscription and manage cancellation or card updates without a support email loop.',
    subscribeHeading: 'Activate your Realtor subscription',
    subscribeEyebrow: 'Secure Billing',
    subscribeIntro: 'Save a payment method securely with Stripe to start your Realtor subscription right away.',
    features: [
      'Unlimited client management',
      'Post projects on behalf of clients',
      'Assign pros to listings',
      'Track deadlines & inspections',
      'Direct messaging with contractors',
      'Referral program access',
      'Priority support',
      'Flat monthly pricing — cancel anytime',
    ],
    stripeSourceReference: 'First supplied Stripe source',
    stripeHostedCheckoutReference: 'https://buy.stripe.com/test_dRm8wRgJM8J91oRcsWcZa00',
    stripeBuyButtonIdReference: 'buy_btn_1TkXXTRylOVvbFnlcVf8liaU',
  },
}

export function isBillingRole(role?: string | null): role is BillingRole {
  return role === 'PRO' || role === 'REALTOR'
}

export function getBillingPlan(role: BillingRole) {
  return billingPlans[role]
}

export function formatBillingAmount(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`
}

export function getBillingPriceId(role: BillingRole, input: {
  stripeProPriceId?: string
  stripeRealtorPriceId?: string
}) {
  return role === 'PRO' ? input.stripeProPriceId : input.stripeRealtorPriceId
}
