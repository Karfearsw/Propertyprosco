'use client'

type SocialRole = 'HOMEOWNER' | 'PRO' | 'REALTOR'

interface SocialAuthButtonsProps {
  desiredRole?: SocialRole
  dividerText: string
  onError?: (message: string) => void
}

function buildAuth0Href({
  desiredRole,
  screenHint,
}: {
  desiredRole?: SocialRole
  screenHint?: 'signup'
}) {
  const returnTo = desiredRole ? `/auth/continue?desiredRole=${desiredRole}` : '/auth/continue'
  const params = new URLSearchParams({ returnTo })

  if (screenHint) {
    params.set('screen_hint', screenHint)
  }

  return `/auth/login?${params.toString()}`
}

export function SocialAuthButtons({
  desiredRole,
  dividerText,
}: SocialAuthButtonsProps) {
  const loginHref = buildAuth0Href({ desiredRole })
  const signupHref = buildAuth0Href({ desiredRole, screenHint: 'signup' })

  return (
    <>
      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
        <a
          href={loginHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-pp-border py-3 text-[13px] font-extrabold text-pp-dark transition-all hover:bg-pp-bg"
        >
          <span className="text-base">🔐</span>
          Continue with Auth0
        </a>
        <a
          href={signupHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-pp-border py-3 text-[13px] font-extrabold text-pp-dark transition-all hover:bg-pp-bg"
        >
          <span className="text-base">✨</span>
          Sign up with Auth0
        </a>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-pp-border" />
        <span className="text-[12px] font-bold text-pp-gray">{dividerText}</span>
        <div className="h-px flex-1 bg-pp-border" />
      </div>
    </>
  )
}
