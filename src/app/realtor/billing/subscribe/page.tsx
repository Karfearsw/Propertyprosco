import Link from 'next/link'
import { requireRole } from '@/lib/auth-guards'
import PaymentMethodForm from '@/components/billing/PaymentMethodForm'

export const metadata = { title: 'Activate Realtor Billing' }

export default async function RealtorBillingSubscribePage() {
  await requireRole('REALTOR')

  return (
    <div className="p-5 lg:p-6 max-w-2xl space-y-5">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[2px] text-pp-gold mb-2">Secure Billing</p>
        <h1 className="text-[24px] font-black text-pp-dark tracking-tight">Activate your Realtor subscription</h1>
        <p className="mt-2 text-[13px] font-bold text-pp-gray">
          Save a payment method securely with Stripe to start your Realtor subscription right away.
        </p>
      </div>

      <div className="rounded-2xl border border-pp-border bg-pp-bg p-5">
        <div className="text-[14px] font-black text-pp-dark mb-2">What you keep</div>
        <div className="space-y-2 text-[13px] font-bold text-pp-gray">
          <div>Unlimited clients and project coordination</div>
          <div>Referral tracking and billing self-service in Stripe</div>
          <div>Brokerage-ready account management without manual email support</div>
        </div>
      </div>

      <PaymentMethodForm
        planName="Realtor Plan"
        amountLabel="$24.99 / month"
        billingPath="/realtor/billing"
      />

      <Link href="/realtor/billing" className="inline-flex text-[13px] font-black text-pp-gold hover:underline">
        Back to billing
      </Link>
    </div>
  )
}
