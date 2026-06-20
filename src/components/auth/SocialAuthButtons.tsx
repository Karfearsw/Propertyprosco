'use client'

import { useEffect, useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'
import { LoaderCircle } from 'lucide-react'

type SocialRole = 'HOMEOWNER' | 'PRO' | 'REALTOR'

type SupportedProvider = {
  id: string
  name: string
}

interface SocialAuthButtonsProps {
  desiredRole?: SocialRole
  dividerText: string
  onError?: (message: string) => void
}

const providerIcons: Record<string, string> = {
  apple: '🍎',
  google: '🌐',
}

function providerLabel(providerId: string) {
  switch (providerId) {
    case 'apple':
      return 'Apple'
    case 'google':
      return 'Google'
    default:
      return providerId
  }
}

export function SocialAuthButtons({
  desiredRole,
  dividerText,
  onError,
}: SocialAuthButtonsProps) {
  const [providers, setProviders] = useState<SupportedProvider[]>([])
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProviders() {
      try {
        const res = await fetch('/api/auth/providers')
        if (!res.ok) return

        const data = (await res.json()) as Record<string, { id: string; name: string }>
        const available = Object.values(data).filter((provider) =>
          provider.id === 'google' || provider.id === 'apple',
        )

        if (!cancelled) {
          setProviders(available)
        }
      } catch {
        if (!cancelled) {
          setProviders([])
        }
      }
    }

    void loadProviders()

    return () => {
      cancelled = true
    }
  }, [])

  const callbackUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (desiredRole) {
      params.set('desiredRole', desiredRole)
    }

    const suffix = params.toString()
    return suffix ? `/auth/continue?${suffix}` : '/auth/continue'
  }, [desiredRole])

  if (providers.length === 0) {
    return null
  }

  async function handleSocial(providerId: string) {
    try {
      setLoadingProvider(providerId)
      await signIn(providerId, { callbackUrl })
    } catch {
      onError?.(`${providerLabel(providerId)} sign-in is temporarily unavailable.`)
      setLoadingProvider(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
        {providers.map((provider) => {
          const loading = provider.id === loadingProvider
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleSocial(provider.id)}
              disabled={Boolean(loadingProvider)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-pp-border py-3 text-[13px] font-extrabold text-pp-dark transition-all hover:bg-pp-bg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <span className="text-base">{providerIcons[provider.id] ?? '→'}</span>
              )}
              Continue with {providerLabel(provider.id) || provider.name}
            </button>
          )
        })}
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-pp-border" />
        <span className="text-[12px] font-bold text-pp-gray">{dividerText}</span>
        <div className="h-px flex-1 bg-pp-border" />
      </div>
    </>
  )
}
