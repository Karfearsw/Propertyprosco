import { VerifyEmailClient } from '@/components/auth/VerifyEmailClient'

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    email?: string | string[]
    billing?: string | string[]
    token?: string | string[]
  }>
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = (await searchParams) ?? {}

  return (
    <VerifyEmailClient
      initialBillingComplete={readParam(params.billing) === '1'}
      initialEmail={readParam(params.email)}
      initialToken={readParam(params.token)}
    />
  )
}
