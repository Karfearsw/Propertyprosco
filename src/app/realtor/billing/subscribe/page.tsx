import Link from 'next/link'
import { requireRole } from '@/lib/auth-guards'
import PaymentMethodForm from '@/components/billing/PaymentMethodForm'
import { getBillingPlan } from '@/lib/billing-config'

export const metadata = { title: 'Activate Realtor Billing' }

export default async function RealtorBillingSubscribePage() {
  await requireRole('REALTOR')
  const plan = getBillingPlan('REALTOR')

  return (
    <div className="p-5 lg:p-6 max-w-2xl space-y-5">
      <div>
        <p className={`text-[11px] font-black uppercase tracking-[2px] mb-2 ${plan.accentClassName}`}>{plan.subscribeEyebrow}</p>
        <h1 className="text-[24px] font-black text-pp-dark tracking-tight">{plan.subscribeHeading}</h1>
        <p className="mt-2 text-[13px] font-bold text-pp-gray">
          {plan.subscribeIntro}
        </p>
      </div>

      <div className="rounded-2xl border border-pp-border bg-pp-bg p-5">
        <div className="text-[14px] font-black text-pp-dark mb-2">What you keep</div>
        <div className="space-y-2 text-[13px] font-bold text-pp-gray">
          {plan.features.slice(0, 3).map((feature) => (
            <div key={feature}>{feature}</div>
          ))}
        </div>
      </div>

      <PaymentMethodForm
        plan={plan}
      />

      <Link href={plan.billingPath} className={`inline-flex text-[13px] font-black hover:underline ${plan.accentClassName}`}>
        Back to billing
      </Link>
    </div>
  )
}
