import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'
import { verifySignupBillingToken } from '@/lib/signup-billing'

const schema = z.object({
  token: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const { token } = schema.parse(await request.json())
    const payload = verifySignupBillingToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'This signup billing session is invalid or expired.' }, { status: 401 })
    }

    requireStripeBillingEnv()
    const stripe = getStripeServer()
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        proProfile: true,
        realtorProfile: true,
      },
    })

    if (!user || user.email !== payload.email || user.role !== payload.role) {
      return NextResponse.json({ error: 'This signup billing session is no longer valid.' }, { status: 404 })
    }

    let customerId =
      payload.role === 'PRO' ? user.proProfile?.stripeCustomerId ?? null : user.realtorProfile?.stripeCustomerId ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name:
          payload.role === 'PRO'
            ? user.proProfile?.businessName ?? user.name ?? undefined
            : user.realtorProfile?.agencyName ?? user.name ?? undefined,
        metadata: {
          userId: user.id,
          role: payload.role,
          source: 'signup-billing',
        },
      })

      customerId = customer.id

      if (payload.role === 'PRO') {
        await db.proProfile.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        })
      } else {
        await db.realtorProfile.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        })
      }
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      metadata: {
        userId: user.id,
        role: payload.role,
        source: 'signup-billing',
      },
      usage: 'off_session',
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Unable to initialize signup billing.' }, { status: 500 })
  }
}
