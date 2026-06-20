'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from 'lucide-react'

type VerifyState = 'pending' | 'verifying' | 'verified' | 'invalid'

type VerifyEmailClientProps = {
  initialEmail?: string
  initialToken?: string
}

function normalizeCode(value: string) {
  return value.replace(/\D/g, '').slice(0, 6)
}

export function VerifyEmailClient({
  initialEmail = '',
  initialToken = '',
}: VerifyEmailClientProps) {
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [state, setState] = useState<VerifyState>(initialToken ? 'verifying' : 'pending')
  const [error, setError] = useState('')
  const [message, setMessage] = useState(
    initialToken
      ? ''
      : 'We sent a verification email with both a secure link and a 6-digit code. Use either option to confirm your account.'
  )
  const [submittingCode, setSubmittingCode] = useState(false)
  const [submittingResend, setSubmittingResend] = useState(false)
  const [deliveryMode, setDeliveryMode] = useState<'smtp' | 'console' | null>(null)

  useEffect(() => {
    if (!initialToken) {
      setState('pending')
      return
    }

    let cancelled = false

    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/email-verification?token=${encodeURIComponent(initialToken)}`)
        const json = await res.json()

        if (!res.ok) {
          if (!cancelled) {
            setState('invalid')
            setError(json.error ?? 'This verification link is invalid or has expired.')
            setMessage(
              'This link is no longer available. Enter the 6-digit code from your email or request a fresh verification message.'
            )
          }
          return
        }

        if (!cancelled) {
          setEmail(json.email ?? initialEmail)
          setState('verified')
          setMessage(
            json.alreadyVerified
              ? 'This email address was already confirmed. You can log in now.'
              : 'Your email has been verified. You can log in and continue your account setup.'
          )
          setError('')
        }
      } catch {
        if (!cancelled) {
          setState('invalid')
          setError('We could not verify this link right now. Enter your code below or request a new email.')
          setMessage(
            'The manual code fallback is still available. Enter the 6-digit code from your inbox or resend verification.'
          )
        }
      }
    }

    void verifyToken()

    return () => {
      cancelled = true
    }
  }, [initialEmail, initialToken])

  const canSubmitCode = useMemo(
    () => email.trim().length > 0 && code.trim().length === 6,
    [code, email]
  )
  const canResend = useMemo(() => email.trim().length > 0, [email])

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmitCode) return

    setSubmittingCode(true)
    setError('')

    try {
      const res = await fetch('/api/auth/email-verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Unable to verify that code right now.')
        return
      }

      setEmail(json.email ?? email)
      setState('verified')
      setMessage(
        json.alreadyVerified
          ? 'This email address was already confirmed. You can log in now.'
          : 'Your email has been verified. You can log in and continue your account setup.'
      )
      setCode('')
      setDeliveryMode(null)
    } catch {
      setError('Unable to verify that code right now.')
    } finally {
      setSubmittingCode(false)
    }
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!canResend) return

    setSubmittingResend(true)
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
        return
      }

      setState(json.alreadyVerified ? 'verified' : 'pending')
      setDeliveryMode(json.delivery ?? null)
      setMessage(
        json.alreadyVerified
          ? 'This email address is already verified. You can log in now.'
          : 'A fresh verification email is on the way. Check your inbox for both the secure link and the 6-digit code.'
      )
      setCode('')
    } catch {
      setError('Unable to resend verification email right now.')
    } finally {
      setSubmittingResend(false)
    }
  }

  return (
    <div className="min-h-dvh bg-pp-bg px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-lg">
        <Link
          href="/login"
          className="mb-5 inline-flex min-h-10 items-center gap-1.5 rounded-full px-1 text-[13px] font-bold text-pp-gray transition-colors hover:text-pp-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pp-red/30"
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>

        <div className="overflow-hidden rounded-[28px] border border-pp-border bg-white shadow-sm">
          {state === 'verifying' && (
            <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-pp-border bg-pp-bg">
                <LoaderCircle size={26} className="animate-spin text-pp-red" />
              </div>
              <h1 className="text-[24px] font-black tracking-tight text-pp-dark">Verifying your email</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
                Confirming that this verification link is still valid.
              </p>
            </div>
          )}

          {state === 'verified' && (
            <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 bg-pp-green-light">
                <CheckCircle2 size={28} className="text-pp-green" />
              </div>
              <h1 className="text-[24px] font-black tracking-tight text-pp-dark">Email confirmed</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">{message}</p>
              {email && (
                <p className="mt-3 break-words text-[13px] font-bold text-pp-dark">
                  Verified account: {email}
                </p>
              )}
              <Link
                href={`/login${email ? `?email=${encodeURIComponent(email)}&verified=1` : '?verified=1'}`}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white transition-colors hover:bg-pp-dark-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pp-dark/20"
              >
                Continue to login
              </Link>
            </div>
          )}

          {(state === 'pending' || state === 'invalid') && (
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-red-50">
                  {state === 'invalid' ? (
                    <AlertCircle size={28} className="text-red-600" />
                  ) : (
                    <Mail size={26} className="text-pp-red" />
                  )}
                </div>
                <h1 className="text-[24px] font-black tracking-tight text-pp-dark">
                  {state === 'invalid' ? 'Finish verifying your email' : 'Check your inbox'}
                </h1>
                <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">{message}</p>
              </div>

              {error && (
                <div className="mt-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <form
                  onSubmit={handleCodeSubmit}
                  className="rounded-3xl border border-pp-border bg-pp-bg/70 p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-pp-red shadow-sm">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-black text-pp-dark">Enter your 6-digit code</h2>
                      <p className="text-[12px] font-bold leading-relaxed text-pp-gray">
                        Use the manual fallback from your email. Codes expire in 15 minutes.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                        className="w-full rounded-xl border border-pp-border bg-white px-3.5 py-3 text-[14px] outline-none transition-all focus:border-pp-red focus:ring-2 focus:ring-pp-red/8"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2">
                        Verification code
                      </label>
                      <input
                        value={code}
                        onChange={(e) => setCode(normalizeCode(e.target.value))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                        placeholder="123456"
                        className="w-full rounded-xl border border-pp-border bg-white px-3.5 py-3 text-[18px] font-black tracking-[0.3em] outline-none transition-all focus:border-pp-red focus:ring-2 focus:ring-pp-red/8"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingCode || !canSubmitCode}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-pp-red px-5 py-3 text-[15px] font-black text-white transition-all hover:bg-pp-red-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingCode ? 'Confirming code…' : 'Confirm email with code'}
                    </button>
                  </div>
                </form>

                <form onSubmit={handleResend} className="rounded-3xl border border-pp-border bg-white p-5">
                  <h2 className="text-[15px] font-black text-pp-dark">Need a fresh email?</h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-pp-gray">
                    Request a new verification message if the link expired or the code is no longer valid.
                  </p>

                  <div className="mt-4">
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
                    disabled={submittingResend || !canResend}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white transition-colors hover:bg-pp-dark-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingResend ? 'Sending verification…' : 'Resend verification email'}
                  </button>

                  <div className="mt-4 rounded-2xl border border-pp-border bg-pp-bg px-4 py-3 text-[12px] leading-relaxed text-pp-gray">
                    Links expire in 24 hours. Codes expire in 15 minutes.
                    {deliveryMode === 'console' && (
                      <span> Local development fallback is active, so check the server logs for the delivered link and code.</span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
