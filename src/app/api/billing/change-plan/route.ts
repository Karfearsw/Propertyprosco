import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { auth } from '@/auth'
import {
  getProUpsellTierPriceId,
  type ProUpsellTierKey,
} from '@/lib/billing-config'
import { db } from '@/lib/db'
import { requireStripeBillingEnv } from '@/lib/env'
import { normalizeStripeSubscriptionStatus } from '@/lib/billing-state'
import { getStripeServer } from '@/lib/stripe-server'

type ChangePlanPayload = {
  tierKey?: ProUpsellTierKey
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'PRO') {
    return NextResponse.json({ error: 'Only pros can change plan tiers.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as ChangePlanPayload
  if (!body.tierKey || !['STARTER', 'PRO', 'ELITE'].includes(body.tierKey)) {
    return NextResponse.json({ error: 'Choose a valid Pro tier.' }, { status: 400 })
  }

  const pro = await db.proProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!pro?.stripeSubscriptionId || !pro.stripeCustomerId) {
    return NextResponse.json(
      { error: 'You need an active billing profile before changing plans.' },
      { status: 400 },
    )
  }

  const env = requireStripeBillingEnv()
  const priceId = getProUpsellTierPriceId(body.tierKey, {
    stripeProUpsellStarterPriceId: env.stripeProUpsellStarterPriceId,
    stripeProUpsellProPriceId: env.stripeProUpsellProPriceId,
    stripeProUpsellElitePriceId: env.stripeProUpsellElitePriceId,
  })

  if (!priceId) {
    return NextResponse.json({ error: 'This Pro tier is not configured yet.' }, { status: 500 })
  }

  const stripe = getStripeServer()
  const subscription = await stripe.subscriptions.retrieve(pro.stripeSubscriptionId, {
    expand: ['items.data.price.product'],
  })

  const currentItem = subscription.items.data[0]
  if (!currentItem) {
    return NextResponse.json({ error: 'No active subscription item was found.' }, { status: 400 })
  }

  const updated = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false,
    items: [{ id: currentItem.id, price: priceId }],
    proration_behavior: 'create_prorations',
    metadata: {
      ...subscription.metadata,
      userId: session.user.id,
      role: session.user.role,
      proUpsellTier: body.tierKey,
    },
    expand: ['items.data.price.product'],
  })

  const firstItem = updated.items.data[0]
  const product = firstItem?.price?.product

  await db.proProfile.update({
    where: { userId: session.user.id },
    data: {
      stripeCustomerId: typeof updated.customer === 'string' ? updated.customer : updated.customer?.id,
      stripeSubscriptionId: updated.id,
      stripePriceId: firstItem?.price?.id ?? priceId,
      stripeProductId: typeof product === 'string' ? product : product?.id ?? null,
      subscriptionStatus:
        normalizeStripeSubscriptionStatus(updated.status) ?? SubscriptionStatus.CHECKOUT_PENDING,
      billingActivatedAt: new Date(),
      subscriptionCurrentPeriodEnd: firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000)
        : null,
      subscriptionCanceledAt: updated.canceled_at ? new Date(updated.canceled_at * 1000) : null,
    },
  })

  return NextResponse.json({ ok: true })
}
