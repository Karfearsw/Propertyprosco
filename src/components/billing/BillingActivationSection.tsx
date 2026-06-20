'use client'

import type { BillingPlan } from '@/lib/billing-config'
import PaymentMethodForm from '@/components/billing/PaymentMethodForm'

type BillingActivationSectionProps = {
  plan: BillingPlan
}

export default function BillingActivationSection({
  plan,
}: BillingActivationSectionProps) {
  return (
    <section
      id="payment-method"
      className="rounded-2xl border border-pp-border bg-white p-5 lg:p-6"
    >
      <div>
        <p
          className={`mb-2 text-[11px] font-black uppercase tracking-[2px] ${plan.accentClassName}`}
        >
          {plan.subscribeEyebrow}
        </p>
        <h2 className="text-[24px] font-black tracking-tight text-pp-dark">
          {plan.subscribeHeading}
        </h2>
        <p className="mt-2 text-[13px] font-bold text-pp-gray">
          {plan.subscribeIntro}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-pp-border bg-pp-bg p-5">
        <div className="mb-2 text-[14px] font-black text-pp-dark">What you keep</div>
        <div className="space-y-2 text-[13px] font-bold text-pp-gray">
          {plan.features.slice(0, 3).map((feature) => (
            <div key={feature}>{feature}</div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <PaymentMethodForm plan={plan} />
      </div>
    </section>
  )
}
