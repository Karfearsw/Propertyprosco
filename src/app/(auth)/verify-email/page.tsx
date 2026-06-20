import { VerifyEmailClient } from '@/components/auth/VerifyEmailClient'

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    email?: string | string[]
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
      initialEmail={readParam(params.email)}
      initialToken={readParam(params.token)}
    />
  )
}
