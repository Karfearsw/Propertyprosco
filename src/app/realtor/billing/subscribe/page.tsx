import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth-guards'
import { getBillingPlan } from '@/lib/billing-config'

export const metadata = { title: 'Activate Realtor Billing' }

export default async function RealtorBillingSubscribePage() {
  await requireRole('REALTOR')
  const plan = getBillingPlan('REALTOR')
  redirect(`${plan.billingPath}#payment-method`)
}
