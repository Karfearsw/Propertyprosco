'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, Mail } from 'lucide-react'

type VerifyState = 'pending' | 'verifying' | 'verified' | 'invalid'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const initialEmail = params.get('email') ?? ''

  const [email, setEmail] = useState(initialEmail)
  const [state, setState] = useState<VerifyState>(token ? 'verifying' : 'pending')
  const [error, setError] = useState('')
  const [message, setMessage] = useState(
    token ? '' : 'We sent a verification link to your inbox. Open it to activate credentials login.'
  )
  const [submitting, setSubmitting] = useState(false)
  const [deliveryMode, setDeliveryMode] = useState<'smtp' | 'console' | null>(null)

  useEffect(() => {
    if (!token) {
      setState('pending')
      return
    }

    let cancelled = false

    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/email-verification?token=${encodeURIComponent(token)}`)
        const json = await res.json()

        if (!res.ok) {
          if (!cancelled) {
            setState('invalid')
            setError(json.error ?? 'This verification link is invalid or has expired.')
          }
          return
        }

        if (!cancelled) {
          setEmail(json.email ?? '')
          setState('verified')
          setMessage(
            json.alreadyVerified
              ? 'This email address was already confirmed. You can log in now.'
              : 'Your email has been verified. You can log in and continue your account setup.'
          )
        }
      } catch {
        if (!cancelled) {
          setState('invalid')
          setError('We could not verify this link. Request a new verification email and try again.')
        }
      }
    }

    void verifyToken()

    return () => {
      cancelled = true
    }
  }, [token])

  const canResend = useMemo(() => email.trim().length > 0, [email])

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!canResend) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/auth/email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Unable to resend verification email right now.')
        setSubmitting(false)
        return
      }

      setState('pending')
      setDeliveryMode(json.delivery ?? null)
      setMessage(
        json.alreadyVerified
          ? 'This email address is already verified. You can log in now.'
          : 'A fresh verification email is on the way. Check your inbox and spam folder.'
      )
    } catch {
      setError('Unable to resend verification email right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-pp-bg px-6 py-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-pp-gray hover:text-pp-dark"
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>

        <div className="rounded-[28px] border border-pp-border bg-white p-8 shadow-sm">
          {state === 'verifying' && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-pp-border bg-pp-bg">
                <LoaderCircle size={26} className="animate-spin text-pp-red" />
              </div>
              <h1 className="text-[24px] font-black text-pp-dark">Verifying your email</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
                Confirming that this verification link is still valid.
              </p>
            </div>
          )}

          {state === 'verified' && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 bg-pp-green-light">
                <CheckCircle2 size={28} className="text-pp-green" />
              </div>
              <h1 className="text-[24px] font-black text-pp-dark">Email confirmed</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
                {message}
              </p>
              {email && (
                <p className="mt-3 text-[13px] font-bold text-pp-dark">
                  Verified account: {email}
                </p>
              )}
              <Link
                href={`/login${email ? `?email=${encodeURIComponent(email)}&verified=1` : '?verified=1'}`}
                className="mt-6 inline-flex rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white"
              >
                Continue to login
              </Link>
            </div>
          )}

          {(state === 'pending' || state === 'invalid') && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-red-50">
                  {state === 'invalid' ? (
                    <AlertCircle size={28} className="text-red-600" />
                  ) : (
                    <Mail size={26} className="text-pp-red" />
                  )}
                </div>
                <h1 className="text-[24px] font-black text-pp-dark">
                  {state === 'invalid' ? 'Verification link unavailable' : 'Check your inbox'}
                </h1>
                <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
                  {state === 'invalid' ? error : message}
                </p>
              </div>

              {error && state !== 'invalid' && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2">
                    Email address
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-pp-border px-3.5 py-3 text-[14px] outline-none transition-all focus:border-pp-red focus:ring-2 focus:ring-pp-red/8"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !canResend}
                  className="w-full rounded-xl bg-pp-red py-3.5 text-[15px] font-black text-white transition-all hover:bg-pp-red-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending verification…' : 'Resend verification email'}
                </button>
              </form>

              <div className="mt-5 rounded-xl border border-pp-border bg-pp-bg px-4 py-3 text-[13px] leading-relaxed text-pp-gray">
                Verification links expire after 24 hours.
                {deliveryMode === 'console' && (
                  <span> Local development fallback is active, so check the server logs for the delivered link.</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
