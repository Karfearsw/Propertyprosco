import { SubscriptionStatus } from '@prisma/client'
import { BarChart3, CreditCard, Download, Receipt } from 'lucide-react'
import { requireRole } from '@/lib/auth-guards'
import BillingStatusBanner from '@/components/billing/BillingStatusBanner'
import BillingActivationSection from '@/components/billing/BillingActivationSection'
import { getBillingStatusLabel } from '@/lib/billing-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import BillingPortalButton from '@/components/billing/BillingPortalButton'
import BillingMutationButton from '@/components/billing/BillingMutationButton'
import AddPaymentMethodForm from '@/components/billing/AddPaymentMethodForm'
import { getProBillingDashboardData } from '@/lib/pro-billing-dashboard'
import { proUpsellTiers } from '@/lib/billing-config'
import { hasStripeBilling } from '@/lib/env'

export const metadata = { title: 'Billing' }

export default async function ProBillingPage() {
  const user = await requireRole('PRO')
  if (!hasStripeBilling()) {
    return (
      <div className="max-w-3xl p-5 lg:p-6">
        <h1 className="text-[28px] font-black tracking-tight text-pp-dark">Billing is temporarily unavailable</h1>
        <p className="mt-3 text-[13px] font-bold text-pp-gray">
          Stripe billing is not configured for this environment. Add the required Stripe environment variables in Vercel to enable Pro subscriptions and plan management.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/pro/dashboard"
            className="rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white transition-all hover:bg-pp-dark-2"
          >
            Back to dashboard
          </a>
          <a
            href="/contact"
            className="rounded-xl border border-pp-border px-5 py-3 text-[14px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
          >
            Contact support
          </a>
        </div>
      </div>
    )
  }
  const data = await getProBillingDashboardData(user.id)
  const maxRevenue = Math.max(...data.revenueSeries.map((item) => item.totalEarned), 1)

  return (
    <div className="max-w-7xl p-5 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
            Billing & Subscription
          </p>
          <h1 className="text-[28px] font-black tracking-tight text-pp-dark">
            Manage your plan, payment methods, invoices, and earnings.
          </h1>
        </div>
        {data.stripeCustomerId ? (
          <BillingPortalButton
            label="Open Billing Portal"
            className="rounded-xl border border-pp-border px-5 py-3 text-[14px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
          />
        ) : null}
      </div>

      {data.status !== SubscriptionStatus.ACTIVE ? (
        <div className="mb-4">
          <BillingStatusBanner
            body="Your Pro tools stay locked until you add a payment method and activate your subscription."
            billingHref="#payment-method"
            accentClassName="bg-pp-gold-light border border-amber-200 rounded-xl p-4 text-pp-gold"
          />
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-pp-border bg-white p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
                Current plan
              </div>
              <h2 className="text-[28px] font-black tracking-tight text-pp-dark">
                {data.currentUpsellTier?.name ?? data.plan.planName}
              </h2>
              <div className="mt-2 text-[17px] font-black text-pp-dark">
                {data.currentUpsellTier?.amountLabel ?? data.plan.amountLabel}
              </div>
              <div className="mt-2 text-[13px] font-bold text-pp-gray">
                {data.currentPeriodEnd
                  ? `Renews on ${formatDate(data.currentPeriodEnd)}`
                  : 'Billing starts as soon as your Stripe subscription activates.'}
                {data.cancelAtPeriodEnd && data.cancelAt
                  ? ` · Canceling on ${formatDate(data.cancelAt)}`
                  : ' · Auto-renew on'}
              </div>
            </div>
            <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[12px] font-black text-green-700">
              {getBillingStatusLabel(data.status)}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Unlimited lead access',
              'Verified pro badge',
              'Priority in search results',
              'Quote tracking & analytics',
            ].map((feature) => (
              <div key={feature} className="rounded-2xl border border-pp-border bg-pp-bg px-4 py-3 text-[13px] font-bold text-pp-dark">
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#plan-catalog"
              className="rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white transition-all hover:bg-pp-dark-2"
            >
              Change plan
            </a>
            {data.stripeCustomerId ? (
              <BillingPortalButton
                label="Manage in Stripe"
                className="rounded-xl border border-pp-border px-5 py-3 text-[14px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
              />
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-pp-border bg-white p-5">
            <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
              Total spent
            </div>
            <div className="mt-3 text-[30px] font-black tracking-tight text-pp-dark">
              {formatCurrency(data.totalSpentCents / 100)}
            </div>
            <div className="mt-1 text-[12px] font-bold text-pp-gray">
              {data.invoices.filter((invoice) => invoice.status === 'paid').length} paid invoices on
              Property Pros
            </div>
          </div>

          <div className="rounded-3xl border border-pp-border bg-white p-5">
            <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
              Next invoice
            </div>
            <div className="mt-3 text-[30px] font-black tracking-tight text-pp-dark">
              {data.nextInvoiceAmountCents !== null
                ? formatCurrency(data.nextInvoiceAmountCents / 100)
                : 'Not scheduled'}
            </div>
            <div className="mt-1 text-[12px] font-bold text-pp-gray">
              {data.nextInvoiceDate ? `Due ${formatDate(data.nextInvoiceDate)}` : 'No upcoming invoice yet.'}
            </div>
          </div>

          <div className="rounded-3xl border border-pp-border bg-white p-5">
            <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
              Est. revenue from leads
            </div>
            <div className="mt-3 text-[30px] font-black tracking-tight text-pp-dark">
              {formatCurrency(data.totalEarned)}
            </div>
            <div className="mt-1 text-[12px] font-bold text-pp-gray">
              {data.jobsWon > 0 ? `${data.jobsWon} accepted jobs won` : 'No accepted jobs yet.'}
            </div>
          </div>
        </section>
      </div>

      <section id="plan-catalog" className="mb-6 rounded-3xl border border-pp-border bg-white p-6">
        <div className="mb-5">
          <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
            Change your plan
          </div>
          <h2 className="mt-2 text-[24px] font-black tracking-tight text-pp-dark">
            Pro tier upgrades
          </h2>
          <p className="mt-2 text-[13px] font-bold text-pp-gray">
            All plans are billed monthly. Cancel anytime. No contracts or hidden fees.
          </p>
        </div>

        {data.proUpsellEnabled ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {proUpsellTiers.map((tier) => {
              const isCurrentTier = data.currentUpsellTier?.key === tier.key
              const currentTierAmount = data.currentUpsellTier?.amountCents ?? 0
              const isDowngrade = data.currentUpsellTier ? tier.amountCents < currentTierAmount : false
              const actionLabel = isCurrentTier
                ? 'Current plan'
                : isDowngrade
                  ? 'Downgrade'
                  : tier.key === 'ELITE'
                    ? 'Upgrade to Elite'
                    : `Switch to ${tier.name}`

              return (
                <div key={tier.key} className="rounded-3xl border border-pp-border bg-pp-bg p-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[22px] font-black tracking-tight text-pp-dark">{tier.name}</div>
                      <div className="mt-2 text-[18px] font-black text-pp-dark">{tier.amountLabel}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {tier.badge ? (
                        <div className="rounded-full bg-pp-red px-3 py-1 text-[11px] font-black uppercase tracking-[1.5px] text-white">
                          {tier.badge}
                        </div>
                      ) : null}
                      {isCurrentTier ? (
                        <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[1.5px] text-green-700">
                          Current plan
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <p className="mb-4 text-[13px] font-bold text-pp-gray">{tier.description}</p>

                  <div className="space-y-2">
                    {tier.features.map((feature) => (
                      <div key={feature} className="text-[13px] font-bold text-pp-dark">
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    {isCurrentTier ? (
                      <div className="rounded-xl border border-pp-border px-4 py-3 text-center text-[13px] font-black text-pp-dark">
                        Current plan
                      </div>
                    ) : (
                      <BillingMutationButton
                        endpoint="/api/billing/change-plan"
                        body={{ tierKey: tier.key }}
                        label={actionLabel}
                        pendingLabel="Updating plan..."
                        className="w-full rounded-xl bg-pp-dark px-4 py-3 text-[13px] font-black text-white transition-all hover:bg-pp-dark-2"
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-pp-border bg-pp-bg p-5 text-[13px] font-bold text-pp-gray">
            Optional Pro tier upgrades are not configured in this environment yet. Core billing,
            cards, invoices, and your active subscription remain available.
          </div>
        )}
      </section>

      {data.status !== SubscriptionStatus.ACTIVE ? (
        <div className="mb-4">
          <BillingActivationSection plan={data.plan} />
        </div>
      ) : null}

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-pp-border bg-white p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
                Earnings overview
              </div>
              <h2 className="mt-2 flex items-center gap-2 text-[22px] font-black tracking-tight text-pp-dark">
                <BarChart3 size={22} className="text-pp-red" />
                Revenue from jobs won via Property Pros leads
              </h2>
            </div>
            <div className="text-[12px] font-bold text-pp-gray">Last 6 months</div>
          </div>

          {data.jobsWon === 0 ? (
            <div className="rounded-2xl border border-dashed border-pp-border bg-pp-bg p-6 text-[13px] font-bold text-pp-gray">
              No accepted jobs yet. Revenue and ROI will appear here once homeowners accept your quotes.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-3">
                {data.revenueSeries.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-3">
                    <div className="flex h-44 w-full items-end rounded-2xl bg-pp-bg px-2 pb-2">
                      <div
                        className="w-full rounded-xl bg-pp-red"
                        style={{
                          height: `${Math.max((item.totalEarned / maxRevenue) * 100, item.totalEarned > 0 ? 12 : 0)}%`,
                        }}
                      />
                    </div>
                    <div className="text-[12px] font-black text-pp-gray">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-pp-border bg-pp-bg p-4">
                  <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">Total earned</div>
                  <div className="mt-2 text-[24px] font-black text-pp-dark">{formatCurrency(data.totalEarned)}</div>
                </div>
                <div className="rounded-2xl border border-pp-border bg-pp-bg p-4">
                  <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">Jobs won</div>
                  <div className="mt-2 text-[24px] font-black text-pp-dark">{data.jobsWon}</div>
                </div>
                <div className="rounded-2xl border border-pp-border bg-pp-bg p-4">
                  <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">Avg. job value</div>
                  <div className="mt-2 text-[24px] font-black text-pp-dark">{formatCurrency(data.averageJobValue)}</div>
                </div>
                <div className="rounded-2xl border border-pp-border bg-pp-bg p-4">
                  <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">ROI on subscription</div>
                  <div className="mt-2 text-[24px] font-black text-pp-dark">
                    {data.roiMultiplier ? `${data.roiMultiplier.toFixed(1)}x` : 'N/A'}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-pp-border bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
                  Payment methods
                </div>
                <h2 className="mt-2 flex items-center gap-2 text-[22px] font-black tracking-tight text-pp-dark">
                  <CreditCard size={22} className="text-pp-red" />
                  Cards on file
                </h2>
              </div>
              {data.status === SubscriptionStatus.ACTIVE ? <AddPaymentMethodForm /> : null}
            </div>

            {data.paymentMethods.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-pp-border bg-pp-bg p-5 text-[13px] font-bold text-pp-gray">
                No saved cards yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.paymentMethods.map((card) => (
                  <div key={card.id} className="rounded-2xl border border-pp-border bg-pp-bg p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[14px] font-black text-pp-dark">
                          {(card.brand ?? 'Card').toUpperCase()} ending in {card.last4 ?? '0000'}
                          {card.isDefault ? ' Default' : ''}
                        </div>
                        <div className="mt-1 text-[12px] font-bold text-pp-gray">
                          Expires {String(card.expMonth ?? '').padStart(2, '0')} / {card.expYear ?? '----'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!card.isDefault ? (
                          <BillingMutationButton
                            endpoint={`/api/billing/payment-methods/${card.id}`}
                            method="PATCH"
                            label="Set default"
                            pendingLabel="Updating..."
                            className="rounded-xl border border-pp-border px-4 py-2 text-[12px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
                          />
                        ) : null}
                        <BillingMutationButton
                          endpoint={`/api/billing/payment-methods/${card.id}`}
                          method="DELETE"
                          label="Remove"
                          pendingLabel="Removing..."
                          confirmMessage="Remove this payment method?"
                          className="rounded-xl border border-pp-border px-4 py-2 text-[12px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-pp-border bg-white p-6">
            <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
              Cancel subscription
            </div>
            <h2 className="mt-2 text-[22px] font-black tracking-tight text-pp-dark">
              Manage renewal
            </h2>
            <p className="mt-3 text-[13px] font-bold text-pp-gray">
              {data.cancelAtPeriodEnd && data.cancelAt
                ? `Your plan will stay active until ${formatDate(data.cancelAt)}.`
                : data.currentPeriodEnd
                  ? `If you cancel, your plan stays active until ${formatDate(data.currentPeriodEnd)}.`
                  : 'You can cancel once your active Stripe subscription is available.'}
            </p>

            <div className="mt-5">
              {data.stripeSubscriptionId ? (
                data.cancelAtPeriodEnd ? (
                  <BillingMutationButton
                    endpoint="/api/billing/cancel"
                    body={{ resume: true }}
                    label="Resume subscription"
                    pendingLabel="Resuming..."
                    className="rounded-xl border border-pp-border px-5 py-3 text-[14px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
                  />
                ) : (
                  <BillingMutationButton
                    endpoint="/api/billing/cancel"
                    label="Cancel my subscription"
                    pendingLabel="Canceling..."
                    confirmMessage="Cancel this subscription at period end?"
                    className="rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white transition-all hover:bg-pp-dark-2"
                  />
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-pp-border bg-pp-bg p-4 text-[13px] font-bold text-pp-gray">
                  No active Stripe subscription is attached yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-pp-border bg-white p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
              Invoice history
            </div>
            <h2 className="mt-2 flex items-center gap-2 text-[22px] font-black tracking-tight text-pp-dark">
              <Receipt size={22} className="text-pp-red" />
              Download invoices for your records
            </h2>
          </div>
        </div>

        {data.invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-pp-border bg-pp-bg p-5 text-[13px] font-bold text-pp-gray">
            No invoices yet. Your billing history will appear after Stripe starts billing this account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-pp-border text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
                  <th className="px-3 py-3">Invoice</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-pp-border text-[13px] font-bold text-pp-dark">
                    <td className="px-3 py-4">{invoice.number ?? invoice.id}</td>
                    <td className="px-3 py-4">{formatDate(invoice.createdAt)}</td>
                    <td className="px-3 py-4 capitalize">{invoice.status ?? 'Unknown'}</td>
                    <td className="px-3 py-4">{formatCurrency(invoice.amountPaidCents / 100)}</td>
                    <td className="px-3 py-4">
                      {invoice.invoicePdf || invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.invoicePdf ?? invoice.hostedInvoiceUrl ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-pp-border px-3 py-2 text-[12px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
                        >
                          <Download size={14} />
                          PDF
                        </a>
                      ) : (
                        <span className="text-pp-gray">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
