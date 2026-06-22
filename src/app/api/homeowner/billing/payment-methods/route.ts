import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

const schema = z.object({
  paymentMethodId: z.string().min(1),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'HOMEOWNER') {
    return NextResponse.json({ error: 'Only homeowners can add a payment method.' }, { status: 403 })
  }

  try {
    const { paymentMethodId } = schema.parse(await request.json())
    requireStripeBillingEnv()
    const stripe = getStripeServer()

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        homeownerStripeCustomerId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    if (!user.homeownerStripeCustomerId) {
      return NextResponse.json({ error: 'Start card setup before saving a payment method.' }, { status: 400 })
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.homeownerStripeCustomerId,
    })

    await stripe.customers.update(user.homeownerStripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    await db.user.update({
      where: { id: user.id },
      data: {
        homeownerStripeDefaultPaymentMethodId: paymentMethodId,
        homeownerStripePaymentMethodAddedAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Unable to save payment method.' }, { status: 500 })
  }
}

