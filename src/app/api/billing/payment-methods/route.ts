import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { isBillingRole } from '@/lib/billing-config'
import { getStripeServer } from '@/lib/stripe-server'

type PaymentMethodPayload = {
  paymentMethodId?: string
  makeDefault?: boolean
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles can manage payment methods.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as PaymentMethodPayload
  if (!body.paymentMethodId) {
    return NextResponse.json({ error: 'Missing payment method.' }, { status: 400 })
  }

  const profile =
    session.user.role === 'PRO'
      ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
      : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe billing profile found.' }, { status: 400 })
  }

  const stripe = getStripeServer()
  const customer = await stripe.customers.retrieve(profile.stripeCustomerId)
  const defaultPaymentMethodId =
    !('deleted' in customer) && typeof customer.invoice_settings.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : null

  const shouldSetDefault = body.makeDefault ?? !defaultPaymentMethodId

  if (shouldSetDefault) {
    await stripe.customers.update(profile.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: body.paymentMethodId,
      },
    })

    if (profile.stripeSubscriptionId) {
      await stripe.subscriptions.update(profile.stripeSubscriptionId, {
        default_payment_method: body.paymentMethodId,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
