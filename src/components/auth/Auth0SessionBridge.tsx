'use client'

import { useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'

interface Auth0SessionBridgeProps {
  callbackUrl: string
  email: string
  token: string
}

export function Auth0SessionBridge({ callbackUrl, email, token }: Auth0SessionBridgeProps) {
  const hasStarted = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    void (async () => {
      try {
        const result = await signIn('auth0-bridge', {
          token,
          callbackUrl,
          redirect: false,
        })

        if (!result?.ok || result.error) {
          setError('Your secure sign-in session expired or was interrupted. Start your sign-in again.')
          return
        }

        window.location.href = result.url ?? callbackUrl
      } catch {
        setError('Your secure sign-in session expired or was interrupted. Start your sign-in again.')
      }
    })()
  }, [callbackUrl, token])

  if (error) {
    return (
      <div className="min-h-screen bg-pp-bg px-6 py-10">
        <div className="mx-auto max-w-xl rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-[26px] font-black tracking-tight text-pp-dark">
            Sign-in needs one more try
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">{error}</p>
          <p className="mt-2 text-[13px] font-bold text-pp-gray">{email}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-pp-red px-5 py-3 text-[14px] font-black text-white transition-all hover:bg-pp-red-dark"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pp-bg px-6 py-10">
      <div className="mx-auto max-w-xl rounded-[28px] border border-pp-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pp-red-light text-pp-red">
          <LoaderCircle size={24} className="animate-spin" />
        </div>
        <h1 className="mt-5 text-[26px] font-black tracking-tight text-pp-dark">
          Finishing your secure sign-in
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
          We verified your Auth0 session and are connecting it to your Property Pros workspace.
        </p>
        <p className="mt-2 text-[13px] font-bold text-pp-gray">{email}</p>
      </div>
    </div>
  )
}
