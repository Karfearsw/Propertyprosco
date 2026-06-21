import { getBillingPlan } from '@/lib/billing-config'
import SignupBillingStep from '@/components/auth/SignupBillingStep'

export const metadata = { title: 'Pro Signup Billing' }

type ProSignupBillingPageProps = {
  searchParams?: Promise<{
    token?: string | string[]
  }>
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export default async function ProSignupBillingPage({ searchParams }: ProSignupBillingPageProps) {
  const params = (await searchParams) ?? {}
  return <SignupBillingStep plan={getBillingPlan('PRO')} token={readParam(params.token)} />
}
