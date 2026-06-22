import 'server-only'

import { QuoteStatus, SubscriptionStatus } from '@prisma/client'
import { db } from '@/lib/db'
import {
  getBillingPlan,
  getProUpsellTierByPriceId,
  proUpsellTiers,
  type ProUpsellTierKey,
} from '@/lib/billing-config'
import { getProUpsellBillingEnv, requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

type BillingMonth = {
  label: string
  totalEarned: number
}

type BillingCard = {
  id: string
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
}

type BillingInvoice = {
  id: string
  number: string | null
  createdAt: Date
  status: string | null
  amountPaidCents: number
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

export type ProBillingDashboardData = {
  plan: ReturnType<typeof getBillingPlan>
  currentUpsellTier: ReturnType<typeof getProUpsellTierByPriceId>
  status: SubscriptionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  cancelAt: Date | null
  nextInvoiceAmountCents: number | null
  nextInvoiceDate: Date | null
  totalSpentCents: number
  invoices: BillingInvoice[]
  paymentMethods: BillingCard[]
  acceptedCards: string[]
  totalEarned: number
  jobsWon: number
  averageJobValue: number
  roiMultiplier: number | null
  revenueSeries: BillingMonth[]
  activeTierKeys: ProUpsellTierKey[]
  proUpsellEnabled: boolean
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
}

function fromUnix(seconds: number | null | undefined) {
  return seconds ? new Date(seconds * 1000) : null
}

export async function getProBillingDashboardData(userId: string): Promise<ProBillingDashboardData> {
  const plan = getBillingPlan('PRO')
  requireStripeBillingEnv()
  const proUpsellEnv = getProUpsellBillingEnv()

  const pro = await db.proProfile.findUnique({
    where: { userId },
    include: { user: true },
  })

  if (!pro) {
    throw new Error('Pro profile not found.')
  }

  const status = pro.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING
  const revenueStart = addMonths(startOfMonth(new Date()), -5)

  const acceptedQuotes = await db.quote.findMany({
    where: {
      proId: userId,
      status: QuoteStatus.ACCEPTED,
      updatedAt: {
        gte: revenueStart,
      },
    },
    select: {
      id: true,
      amount: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'asc' },
  })

  const totalEarned = acceptedQuotes.reduce((sum, quote) => sum + quote.amount, 0)
  const jobsWon = acceptedQuotes.length
  const averageJobValue = jobsWon > 0 ? totalEarned / jobsWon : 0

  const monthMap = new Map<string, BillingMonth>()
  for (let index = 0; index < 6; index += 1) {
    const month = addMonths(revenueStart, index)
    monthMap.set(month.toISOString().slice(0, 7), {
      label: monthLabel(month),
      totalEarned: 0,
    })
  }

  for (const quote of acceptedQuotes) {
    const key = quote.updatedAt.toISOString().slice(0, 7)
    const entry = monthMap.get(key)
    if (entry) {
      entry.totalEarned += quote.amount
    }
  }

  const revenueSeries = [...monthMap.values()]
  const stripe = getStripeServer()

  let invoices: BillingInvoice[] = []
  let paymentMethods: BillingCard[] = []
  let nextInvoiceAmountCents: number | null = null
  let nextInvoiceDate: Date | null = null
  let totalSpentCents = 0
  let currentPeriodEnd: Date | null = pro.subscriptionCurrentPeriodEnd ?? null
  let cancelAtPeriodEnd = Boolean(pro.subscriptionCanceledAt)
  let cancelAt: Date | null = pro.subscriptionCanceledAt ?? null

  if (pro.stripeCustomerId) {
    const [customer, invoiceList, methodList] = await Promise.all([
      stripe.customers.retrieve(pro.stripeCustomerId),
      stripe.invoices.list({
        customer: pro.stripeCustomerId,
        limit: 12,
      }),
      stripe.paymentMethods.list({
        customer: pro.stripeCustomerId,
        type: 'card',
      }),
    ])

    const defaultPaymentMethodId =
      !('deleted' in customer) && typeof customer.invoice_settings.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : null

    invoices = invoiceList.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      createdAt: fromUnix(invoice.created) ?? new Date(),
      status: invoice.status,
      amountPaidCents: invoice.amount_paid,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      invoicePdf: invoice.invoice_pdf ?? null,
    }))

    totalSpentCents = invoices
      .filter((invoice) => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amountPaidCents, 0)

    paymentMethods = methodList.data.map((method) => ({
      id: method.id,
      brand: method.card?.brand ?? null,
      last4: method.card?.last4 ?? null,
      expMonth: method.card?.exp_month ?? null,
      expYear: method.card?.exp_year ?? null,
      isDefault: method.id === defaultPaymentMethodId,
    }))

    if (pro.stripeSubscriptionId) {
      try {
        const upcoming = await stripe.invoices.createPreview({
          customer: pro.stripeCustomerId,
          subscription: pro.stripeSubscriptionId,
        })

        nextInvoiceAmountCents = upcoming.amount_due ?? null
        nextInvoiceDate = fromUnix(upcoming.period_end)
      } catch {
        nextInvoiceAmountCents = null
        nextInvoiceDate = null
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(pro.stripeSubscriptionId)
        currentPeriodEnd = fromUnix(subscription.items.data[0]?.current_period_end) ?? currentPeriodEnd
        cancelAtPeriodEnd = subscription.cancel_at_period_end
        cancelAt = fromUnix(subscription.cancel_at) ?? cancelAt
      } catch {
        // Fall back to persisted DB values when Stripe retrieval fails.
      }
    }
  }

  const currentUpsellTier = proUpsellEnv
    ? getProUpsellTierByPriceId(pro.stripePriceId, {
        stripeProUpsellStarterPriceId: proUpsellEnv.stripeProUpsellStarterPriceId,
        stripeProUpsellProPriceId: proUpsellEnv.stripeProUpsellProPriceId,
        stripeProUpsellElitePriceId: proUpsellEnv.stripeProUpsellElitePriceId,
      })
    : null

  return {
    plan,
    currentUpsellTier,
    status,
    stripeCustomerId: pro.stripeCustomerId ?? null,
    stripeSubscriptionId: pro.stripeSubscriptionId ?? null,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    cancelAt,
    nextInvoiceAmountCents,
    nextInvoiceDate,
    totalSpentCents,
    invoices,
    paymentMethods,
    acceptedCards: ['visa', 'mastercard', 'amex'],
    totalEarned,
    jobsWon,
    averageJobValue,
    roiMultiplier: totalSpentCents > 0 ? totalEarned / (totalSpentCents / 100) : null,
    revenueSeries,
    activeTierKeys: proUpsellEnv ? proUpsellTiers.map((tier) => tier.key) : [],
    proUpsellEnabled: Boolean(proUpsellEnv),
  }
}
