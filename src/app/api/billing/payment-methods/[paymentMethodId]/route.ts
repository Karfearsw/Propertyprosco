import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { isBillingRole } from '@/lib/billing-config'
import { getStripeServer } from '@/lib/stripe-server'

type RouteContext = {
  params: Promise<{
    paymentMethodId: string
  }>
}

export async function PATCH(_: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles can manage payment methods.' }, { status: 403 })
  }

  const { paymentMethodId } = await context.params
  const profile =
    session.user.role === 'PRO'
      ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
      : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe billing profile found.' }, { status: 400 })
  }

  const stripe = getStripeServer()
  await stripe.customers.update(profile.stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  if (profile.stripeSubscriptionId) {
    await stripe.subscriptions.update(profile.stripeSubscriptionId, {
      default_payment_method: paymentMethodId,
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles can manage payment methods.' }, { status: 403 })
  }

  const { paymentMethodId } = await context.params
  const profile =
    session.user.role === 'PRO'
      ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
      : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe billing profile found.' }, { status: 400 })
  }

  const stripe = getStripeServer()
  const [customer, methods] = await Promise.all([
    stripe.customers.retrieve(profile.stripeCustomerId),
    stripe.paymentMethods.list({
      customer: profile.stripeCustomerId,
      type: 'card',
    }),
  ])

  const defaultPaymentMethodId =
    !('deleted' in customer) && typeof customer.invoice_settings.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : null

  const otherMethod = methods.data.find((method) => method.id !== paymentMethodId)
  const isProtectedDefault =
    defaultPaymentMethodId === paymentMethodId &&
    profile.subscriptionStatus === SubscriptionStatus.ACTIVE &&
    !otherMethod

  if (isProtectedDefault) {
    return NextResponse.json(
      { error: 'Add another card before removing the current default payment method.' },
      { status: 400 },
    )
  }

  if (defaultPaymentMethodId === paymentMethodId && otherMethod) {
    await stripe.customers.update(profile.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: otherMethod.id,
      },
    })

    if (profile.stripeSubscriptionId) {
      await stripe.subscriptions.update(profile.stripeSubscriptionId, {
        default_payment_method: otherMethod.id,
      })
    }
  }

  await stripe.paymentMethods.detach(paymentMethodId)
  return NextResponse.json({ ok: true })
}
