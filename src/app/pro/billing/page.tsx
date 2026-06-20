import { SubscriptionStatus } from '@prisma/client'
import { db } from '@/lib/db'
import { CreditCard } from 'lucide-react'
import { requireRole } from '@/lib/auth-guards'
import SubscribeCard from '@/components/billing/SubscribeCard'
import BillingStatusBanner from '@/components/billing/BillingStatusBanner'
import { getBillingStatusLabel } from '@/lib/billing-state'
import { getBillingPlan } from '@/lib/billing-config'

export const metadata = { title: 'Billing' }

export default async function ProBillingPage() {
  const user = await requireRole('PRO')
  const plan = getBillingPlan('PRO')
  const pro = await db.proProfile.findUnique({
    where: { userId: user.id },
    include: { user: true },
  })

  const status = pro?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING
  const canManageBilling = Boolean(pro?.stripeCustomerId)

  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-6">Billing</h1>

      {status !== SubscriptionStatus.ACTIVE ? (
        <div className="mb-4">
          <BillingStatusBanner
            body="Your Pro tools stay locked until you add a payment method and activate your subscription."
            billingHref="/pro/billing"
            accentClassName="bg-pp-gold-light border border-amber-200 rounded-xl p-4 text-pp-gold"
          />
        </div>
      ) : null}

      <div className="mb-4 rounded-2xl border border-pp-border bg-white p-4">
        <div className="text-[12px] font-black uppercase tracking-[1.5px] text-pp-gray mb-1">Current status</div>
        <div className="text-[22px] font-black text-pp-dark">{getBillingStatusLabel(status)}</div>
        <div className="mt-1 text-[12px] font-bold text-pp-gray">
          {pro?.stripeCustomerId
            ? 'Your Stripe billing profile is connected and ready for self-service management.'
            : 'No payment method is on file yet. Add one to unlock lead access and keep billing self-serve.'}
        </div>
      </div>

      <div className="mb-4">
        <SubscribeCard
          title={plan.planName}
          amountLabel={plan.amountLabel}
          description={plan.summary}
          features={plan.features.slice(0, 6)}
          status={status}
          subscribeHref={plan.subscribePath}
          manageEnabled={canManageBilling}
          manageLabel="Open Billing Portal"
          accentButtonClassName={plan.accentButtonClassName}
          manageButtonClassName={`w-full rounded-xl border border-pp-border px-5 py-3 text-[14px] font-black text-pp-dark transition-all ${plan.manageButtonHoverClassName}`}
          icon={<CreditCard size={24} className="text-pp-red" />}
        />
      </div>

      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <h2 className="text-[15px] font-black text-pp-dark mb-4">Billing Details</h2>
        <div className="rounded-xl border border-pp-border bg-pp-bg p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
              <CreditCard size={24} className="text-pp-red" />
            </div>
            <div>
              <div className="text-[14px] font-black text-pp-dark">{pro?.stripeCustomerId ? 'Stripe billing profile on file' : 'No payment method on file yet'}</div>
              <div className="text-[12px] font-bold text-pp-gray">
                {pro?.stripeCustomerId
                  ? 'Use the billing portal to update cards, review invoices, or cancel.'
                  : 'Start with the secure Stripe form to activate your subscription and unlock paid workspace access.'}
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-[12px] font-bold text-pp-gray">
            <div className="rounded-xl bg-white px-4 py-3">
              <div className="text-[11px] uppercase tracking-[1px] text-pp-gray mb-1">Account email</div>
              <div className="text-[13px] font-black text-pp-dark">{pro?.user.email ?? user.email ?? 'Not available'}</div>
            </div>
            <div className="rounded-xl bg-white px-4 py-3">
              <div className="text-[11px] uppercase tracking-[1px] text-pp-gray mb-1">Business</div>
              <div className="text-[13px] font-black text-pp-dark">{pro?.businessName ?? 'Complete your profile'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
