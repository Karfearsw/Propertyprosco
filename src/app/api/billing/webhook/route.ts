import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import type Stripe from 'stripe'
import { db } from '@/lib/db'
import { normalizeStripeSubscriptionStatus } from '@/lib/billing-state'
import { requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

function getCustomerId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  return typeof value === 'string' ? value : value?.id ?? null
}

async function findProfile(customerId: string | null, userId?: string | null, role?: string | null) {
  if (customerId) {
    const pro = await db.proProfile.findFirst({ where: { stripeCustomerId: customerId } })
    if (pro) return { role: 'PRO' as const, profile: pro }

    const realtor = await db.realtorProfile.findFirst({ where: { stripeCustomerId: customerId } })
    if (realtor) return { role: 'REALTOR' as const, profile: realtor }
  }

  if (userId && role === 'PRO') {
    const pro = await db.proProfile.findUnique({ where: { userId } })
    if (pro) return { role: 'PRO' as const, profile: pro }
  }

  if (userId && role === 'REALTOR') {
    const realtor = await db.realtorProfile.findUnique({ where: { userId } })
    if (realtor) return { role: 'REALTOR' as const, profile: realtor }
  }

  return null
}

async function updateProfile(
  target: Awaited<ReturnType<typeof findProfile>>,
  data: Record<string, unknown>,
) {
  if (!target) return

  if (target.role === 'PRO') {
    await db.proProfile.update({
      where: { id: target.profile.id },
      data,
    })
    return
  }

  await db.realtorProfile.update({
    where: { id: target.profile.id },
    data,
  })
}

function getSubscriptionUpdate(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0]
  const product = firstItem?.price?.product

  return {
    stripeCustomerId: getCustomerId(subscription.customer),
    stripeSubscriptionId: subscription.id,
    stripePriceId: firstItem?.price?.id ?? null,
    stripeProductId: typeof product === 'string' ? product : product?.id ?? null,
    subscriptionStatus: normalizeStripeSubscriptionStatus(subscription.status),
    billingActivatedAt: new Date(),
    subscriptionCurrentPeriodEnd: firstItem?.current_period_end
      ? new Date(firstItem.current_period_end * 1000)
      : null,
    subscriptionCanceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
  }
}

export async function POST(req: Request) {
  const { stripeWebhookSecret } = requireStripeBillingEnv()
  const stripe = getStripeServer()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 })
  }

  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        const userId = customer.metadata.userId
        const role = customer.metadata.role
        const target = await findProfile(customer.id, userId, role)
        await updateProfile(target, { stripeCustomerId: customer.id })
        break
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const role = session.metadata?.role
        const target = await findProfile(getCustomerId(session.customer), userId, role)
        await updateProfile(target, {
          stripeCustomerId: getCustomerId(session.customer),
          subscriptionStatus: SubscriptionStatus.CHECKOUT_PENDING,
        })
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const target = await findProfile(
          getCustomerId(subscription.customer),
          subscription.metadata.userId,
          subscription.metadata.role,
        )
        await updateProfile(target, getSubscriptionUpdate(subscription))
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          invoice.parent?.subscription_details?.subscription && typeof invoice.parent.subscription_details.subscription === 'string'
            ? invoice.parent.subscription_details.subscription
            : null
        const target = await findProfile(
          getCustomerId(invoice.customer),
          invoice.parent?.subscription_details?.metadata?.userId ?? null,
          invoice.parent?.subscription_details?.metadata?.role ?? null,
        )

        await updateProfile(target, {
          stripeCustomerId: getCustomerId(invoice.customer),
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          billingActivatedAt: new Date(),
          subscriptionCurrentPeriodEnd: invoice.period_end
            ? new Date(invoice.period_end * 1000)
            : null,
        })
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          invoice.parent?.subscription_details?.subscription && typeof invoice.parent.subscription_details.subscription === 'string'
            ? invoice.parent.subscription_details.subscription
            : null
        const target = await findProfile(
          getCustomerId(invoice.customer),
          invoice.parent?.subscription_details?.metadata?.userId ?? null,
          invoice.parent?.subscription_details?.metadata?.role ?? null,
        )

        await updateProfile(target, {
          stripeCustomerId: getCustomerId(invoice.customer),
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: SubscriptionStatus.PAST_DUE,
        })
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Webhook handling failed.' }, { status: 500 })
  }
}
