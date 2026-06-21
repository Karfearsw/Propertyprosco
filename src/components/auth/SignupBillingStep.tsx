'use client'

import Link from 'next/link'
import { AlertCircle, CreditCard, ShieldCheck } from 'lucide-react'
import type { BillingPlan } from '@/lib/billing-config'
import PaymentMethodForm from '@/components/billing/PaymentMethodForm'

type SignupBillingStepProps = {
  plan: BillingPlan
  token: string
}

export default function SignupBillingStep({ plan, token }: SignupBillingStepProps) {
  if (!token) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-pp-border bg-white p-8 shadow-sm">
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <div className="text-[15px] font-black">Billing session expired</div>
            <p className="mt-1 text-[13px] font-bold">
              Start signup again to continue your secure Stripe billing setup.
            </p>
          </div>
        </div>
        <Link
          href={plan.signupPath}
          className="mt-6 inline-flex rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white"
        >
          Back to signup
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-8">
      <div className="mb-6 rounded-3xl border border-pp-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pp-bg">
            <CreditCard size={22} className={plan.accentClassName} />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[2px] text-pp-gray">
              Signup billing
            </div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-pp-dark">
              Add your payment method to finish signup
            </h1>
            <p className="mt-2 text-[14px] font-bold text-pp-gray">
              Your card is collected and charged through Stripe during account creation. You still
              need to verify your email before workspace access unlocks.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-pp-border bg-pp-bg p-4">
            <div className="text-[12px] font-black uppercase tracking-[2px] text-pp-gray">
              Plan
            </div>
            <div className="mt-2 text-[20px] font-black text-pp-dark">{plan.planName}</div>
            <div className="mt-1 text-[14px] font-black text-pp-dark">{plan.amountLabel}</div>
          </div>
          <div className="rounded-2xl border border-pp-border bg-pp-bg p-4">
            <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[2px] text-pp-gray">
              <ShieldCheck size={14} />
              Secure Stripe billing
            </div>
            <div className="mt-2 text-[13px] font-bold text-pp-gray">
              Your payment info is encrypted by Stripe and never stored directly on Property Pros
              servers.
            </div>
          </div>
        </div>
      </div>

      <PaymentMethodForm
        plan={plan}
        setupIntentPath="/api/signup/billing/setup-intent"
        setupIntentBody={{ token }}
        submitPath="/api/signup/billing/checkout"
        submitBody={{ token }}
        submitButtonLabel="Pay and continue to email verification"
        submitPendingLabel="Processing secure signup billing..."
      />
    </div>
  )
}
