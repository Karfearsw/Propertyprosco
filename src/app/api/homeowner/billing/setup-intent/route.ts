import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'HOMEOWNER') {
    return NextResponse.json({ error: 'Only homeowners can add a payment method.' }, { status: 403 })
  }

  try {
    requireStripeBillingEnv()
    const stripe = getStripeServer()

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        homeownerStripeCustomerId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    let customerId = user.homeownerStripeCustomerId ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
          role: 'HOMEOWNER',
          source: 'homeowner-card',
        },
      })

      customerId = customer.id

      await db.user.update({
        where: { id: user.id },
        data: { homeownerStripeCustomerId: customerId },
      })
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      metadata: {
        userId: user.id,
        role: 'HOMEOWNER',
        source: 'homeowner-card',
      },
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to initialize card setup.' }, { status: 500 })
  }
}

