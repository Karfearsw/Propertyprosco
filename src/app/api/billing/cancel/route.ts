import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { isBillingRole } from '@/lib/billing-config'
import { normalizeStripeSubscriptionStatus } from '@/lib/billing-state'
import { getStripeServer } from '@/lib/stripe-server'

type CancelPayload = {
  resume?: boolean
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles can manage billing.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as CancelPayload
  const profile =
    session.user.role === 'PRO'
      ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
      : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No Stripe subscription was found.' }, { status: 400 })
  }

  const stripe = getStripeServer()
  const updated = await stripe.subscriptions.update(profile.stripeSubscriptionId, {
    cancel_at_period_end: !body.resume,
  })

  const currentPeriodEnd =
    updated.items.data[0]?.current_period_end ? new Date(updated.items.data[0].current_period_end * 1000) : null

  const data = {
    subscriptionStatus: normalizeStripeSubscriptionStatus(updated.status),
    subscriptionCurrentPeriodEnd: currentPeriodEnd,
    subscriptionCanceledAt: updated.cancel_at ? new Date(updated.cancel_at * 1000) : null,
  }

  if (session.user.role === 'PRO') {
    await db.proProfile.update({
      where: { userId: session.user.id },
      data,
    })
  } else {
    await db.realtorProfile.update({
      where: { userId: session.user.id },
      data,
    })
  }

  return NextResponse.json({ ok: true })
}
