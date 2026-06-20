import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { isBillingRole } from '@/lib/billing-config'
import { requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

export async function POST() {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles can start billing setup.' }, { status: 403 })
  }

  requireStripeBillingEnv()
  const stripe = getStripeServer()

  let customerId: string | null = null

  if (session.user.role === 'PRO') {
    const profile = await db.proProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Billing profile not found.' }, { status: 404 })
    }

    customerId = profile.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.user.email,
        name: profile.businessName ?? profile.user.name ?? undefined,
        metadata: {
          userId: session.user.id,
          role: session.user.role,
        },
      })

      customerId = customer.id

      await db.proProfile.update({
        where: { userId: session.user.id },
        data: { stripeCustomerId: customerId },
      })
    }
  } else {
    const profile = await db.realtorProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Billing profile not found.' }, { status: 404 })
    }

    customerId = profile.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.user.email,
        name: profile.agencyName ?? profile.user.name ?? undefined,
        metadata: {
          userId: session.user.id,
          role: session.user.role,
        },
      })

      customerId = customer.id

      await db.realtorProfile.update({
        where: { userId: session.user.id },
        data: { stripeCustomerId: customerId },
      })
    }
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    metadata: {
      userId: session.user.id,
      role: session.user.role,
    },
    usage: 'off_session',
  })
  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
    customerId,
  })
}
