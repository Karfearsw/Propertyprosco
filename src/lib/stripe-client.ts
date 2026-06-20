import { loadStripe } from '@stripe/stripe-js'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export const stripeClientPromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null)
