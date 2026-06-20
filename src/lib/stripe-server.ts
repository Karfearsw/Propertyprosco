import 'server-only'
import Stripe from 'stripe'
import { requireStripeBillingEnv } from '@/lib/env'

const STRIPE_API_VERSION = '2026-05-27.dahlia'

const globalForStripe = globalThis as typeof globalThis & {
  __propertyProsStripe?: Stripe
}

export function getStripeServer() {
  if (globalForStripe.__propertyProsStripe) {
    return globalForStripe.__propertyProsStripe
  }

  const { stripeSecretKey } = requireStripeBillingEnv()

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: {
      name: 'Property Pros',
      version: '0.1.0',
    },
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForStripe.__propertyProsStripe = stripe
  }

  return stripe
}
