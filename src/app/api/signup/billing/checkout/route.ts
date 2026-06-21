import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getBillingPlan, getBillingPriceId } from '@/lib/billing-config'
import { env, requireStripeBillingEnv } from '@/lib/env'
import { normalizeStripeSubscriptionStatus } from '@/lib/billing-state'
import { getStripeServer } from '@/lib/stripe-server'
import { verifySignupBillingToken } from '@/lib/signup-billing'

const schema = z.object({
  token: z.string().min(1),
  paymentMethodId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const { token, paymentMethodId } = schema.parse(await request.json())
    const payload = verifySignupBillingToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'This signup billing session is invalid or expired.' }, { status: 401 })
    }

    requireStripeBillingEnv()
    const stripe = getStripeServer()
    const plan = getBillingPlan(payload.role)
    const priceId = getBillingPriceId(payload.role, {
      stripeProPriceId: env.stripeProPriceId,
      stripeRealtorPriceId: env.stripeRealtorPriceId,
    })

    if (!priceId) {
      return NextResponse.json({ error: 'Billing is not configured for this plan yet.' }, { status: 500 })
    }

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

    const profile = payload.role === 'PRO' ? user.proProfile : user.realtorProfile
    if (!profile?.stripeCustomerId) {
      return NextResponse.json({ error: 'Start payment setup before activating billing.' }, { status: 400 })
    }

    if (
      profile.subscriptionStatus === SubscriptionStatus.ACTIVE &&
      profile.stripeSubscriptionId
    ) {
      return NextResponse.json({ error: 'An active subscription already exists.' }, { status: 409 })
    }

    await stripe.customers.update(profile.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    const subscription = await stripe.subscriptions.create({
      customer: profile.stripeCustomerId,
      items: [{ price: priceId }],
      metadata: {
        userId: user.id,
        role: payload.role,
        planName: plan.planName,
        source: 'signup-billing',
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

    if (payload.role === 'PRO') {
      await db.proProfile.update({
        where: { userId: user.id },
        data: profileUpdate,
      })
    } else {
      await db.realtorProfile.update({
        where: { userId: user.id },
        data: profileUpdate,
      })
    }

    return NextResponse.json({
      ok: true,
      status: nextStatus,
      subscriptionId: subscription.id,
      redirectTo: `/verify-email?email=${encodeURIComponent(user.email)}&billing=1`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Unable to activate subscription during signup.' }, { status: 500 })
  }
}
