import { getBillingPlan } from '@/lib/billing-config'
import SignupBillingStep from '@/components/auth/SignupBillingStep'

export const metadata = { title: 'Realtor Signup Billing' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

type RealtorSignupBillingPageProps = {
  searchParams?: Promise<{
    token?: string | string[]
  }>
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export default async function RealtorSignupBillingPage({
  searchParams,
}: RealtorSignupBillingPageProps) {
  const params = (await searchParams) ?? {}
  return <SignupBillingStep plan={getBillingPlan('REALTOR')} token={readParam(params.token)} />
}
