import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getBillingPlan, getBillingPriceId, isBillingRole } from '@/lib/billing-config'
import { normalizeStripeSubscriptionStatus } from '@/lib/billing-state'
import { env, requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

const schema = z.object({
  paymentMethodId: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles can activate a subscription.' }, { status: 403 })
  }

  try {
    const { paymentMethodId } = schema.parse(await req.json())
    requireStripeBillingEnv()
    const stripe = getStripeServer()
    const plan = getBillingPlan(session.user.role)
    const priceId = getBillingPriceId(session.user.role, {
      stripeProPriceId: env.stripeProPriceId,
      stripeRealtorPriceId: env.stripeRealtorPriceId,
    })

    if (!priceId) {
      return NextResponse.json({ error: 'Billing is not configured for this plan yet.' }, { status: 500 })
    }

    const profile =
      session.user.role === 'PRO'
        ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
        : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

    if (!profile?.stripeCustomerId) {
      return NextResponse.json({ error: 'Start payment setup before activating billing.' }, { status: 400 })
    }

    if (
      profile.subscriptionStatus === SubscriptionStatus.ACTIVE &&
      profile.stripeSubscriptionId
    ) {
      return NextResponse.json({ error: 'An active subscription already exists.' }, { status: 409 })
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: profile.stripeCustomerId,
    })

    await stripe.customers.update(profile.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    const subscription = await stripe.subscriptions.create({
      customer: profile.stripeCustomerId,
      items: [{ price: priceId }],
      metadata: {
        userId: session.user.id,
        role: session.user.role,
        planName: plan.planName,
      },
      default_payment_method: paymentMethodId,
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['items.data.price.product'],
    })

    const firstItem = subscription.items.data[0]
    const product = firstItem?.price?.product
    const nextStatus = normalizeStripeSubscriptionStatus(subscription.status)

    const profileUpdate = {
      subscriptionStatus: nextStatus,
      stripeSubscriptionId: subscription.id,
      stripePriceId: firstItem?.price?.id ?? priceId,
      stripeProductId: typeof product === 'string' ? product : product?.id,
      subscriptionCurrentPeriodEnd: firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000)
        : null,
      subscriptionCanceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      billingActivatedAt: new Date(),
    }

    if (session.user.role === 'PRO') {
      await db.proProfile.update({
        where: { userId: session.user.id },
        data: profileUpdate,
      })
    } else {
      await db.realtorProfile.update({
        where: { userId: session.user.id },
        data: profileUpdate,
      })
    }

    return NextResponse.json({
      ok: true,
      status: nextStatus,
      subscriptionId: subscription.id,
      redirectTo: plan.billingPath,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Unable to activate subscription.' }, { status: 500 })
  }
}
