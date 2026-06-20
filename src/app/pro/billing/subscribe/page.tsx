import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth-guards'
import { getBillingPlan } from '@/lib/billing-config'

export const metadata = { title: 'Activate Pro Billing' }

export default async function ProBillingSubscribePage() {
  await requireRole('PRO')
  const plan = getBillingPlan('PRO')
  redirect(`${plan.billingPath}#payment-method`)
}
