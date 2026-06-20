import Link from 'next/link'
import { requireRole } from '@/lib/auth-guards'
import PaymentMethodForm from '@/components/billing/PaymentMethodForm'

export const metadata = { title: 'Activate Pro Billing' }

export default async function ProBillingSubscribePage() {
  await requireRole('PRO')

  return (
    <div className="p-5 lg:p-6 max-w-2xl space-y-5">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[2px] text-pp-red mb-2">Secure Billing</p>
        <h1 className="text-[24px] font-black text-pp-dark tracking-tight">Activate your Pro subscription</h1>
        <p className="mt-2 text-[13px] font-bold text-pp-gray">
          Save a payment method securely with Stripe to start your Pro subscription right away.
        </p>
      </div>

      <div className="rounded-2xl border border-pp-border bg-pp-bg p-5">
        <div className="text-[14px] font-black text-pp-dark mb-2">What you keep</div>
        <div className="space-y-2 text-[13px] font-bold text-pp-gray">
          <div>Unlimited leads in your area</div>
          <div>Unlimited quotes and direct messaging</div>
          <div>Verified profile and billing management through Stripe</div>
        </div>
      </div>

      <PaymentMethodForm
        planName="Pro Plan"
        amountLabel="$9.99 / month"
        billingPath="/pro/billing"
      />

      <Link href="/pro/billing" className="inline-flex text-[13px] font-black text-pp-red hover:underline">
        Back to billing
      </Link>
    </div>
  )
}
