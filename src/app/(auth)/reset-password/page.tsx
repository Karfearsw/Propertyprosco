'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle } from 'lucide-react'

type TokenState = 'loading' | 'valid' | 'invalid'

const requirements = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
  { label: 'One special character', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [tokenState, setTokenState] = useState<TokenState>('loading')
  const [tokenError, setTokenError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const metRequirements = useMemo(
    () => requirements.map((requirement) => requirement.test(password)),
    [password],
  )

  const allRequirementsMet = metRequirements.every(Boolean)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    let cancelled = false

    async function validateToken() {
      if (!token) {
        setTokenState('invalid')
        setTokenError('This password reset link is missing its token.')
        return
      }

      try {
        const res = await fetch(`/api/auth/password-reset?token=${encodeURIComponent(token)}`)
        const json = await res.json()

        if (!res.ok || !json.valid) {
          if (!cancelled) {
            setTokenState('invalid')
            setTokenError(json.error ?? 'This password reset link is invalid or has expired.')
          }
          return
        }

        if (!cancelled) {
          setEmail(json.email ?? '')
          setTokenState('valid')
        }
      } catch {
        if (!cancelled) {
          setTokenState('invalid')
          setTokenError('We could not validate this reset link. Please request a new one.')
        }
      }
    }

    void validateToken()

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!success) return

    const interval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          router.push('/login')
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [router, success])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!allRequirementsMet) {
      setError('Choose a stronger password that meets all requirements.')
      return
    }

    if (!passwordsMatch) {
      setError('Your password confirmation does not match.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Unable to update your password.')
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Unable to update your password.')
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
          {tokenState === 'loading' && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-pp-border bg-pp-bg">
                <LoaderCircle size={26} className="animate-spin text-pp-red" />
              </div>
              <h1 className="text-[24px] font-black text-pp-dark">Checking your reset link</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
                Verifying that this password recovery token is still valid.
              </p>
            </div>
          )}

          {tokenState === 'invalid' && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-red-50">
                <AlertCircle size={28} className="text-red-600" />
              </div>
              <h1 className="text-[24px] font-black text-pp-dark">Reset link unavailable</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">{tokenError}</p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-flex rounded-xl bg-pp-red px-5 py-3 text-[14px] font-black text-white"
              >
                Request a new reset link
              </Link>
            </div>
          )}

          {tokenState === 'valid' && !success && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 text-3xl">
                  🔑
                </div>
                <h1 className="text-[24px] font-black text-pp-dark">Set a new password</h1>
                <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
                  Create a fresh password for <strong>{email}</strong>. We&apos;ll sign out any
                  older sessions after the reset completes.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-pp-border px-3.5 py-3 pr-11 text-[14px] outline-none transition-all focus:border-pp-red focus:ring-2 focus:ring-pp-red/8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pp-gray"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-pp-border bg-pp-bg p-4">
                  <div className="mb-3 text-[11px] font-black uppercase tracking-[0.8px] text-pp-gray">
                    Password requirements
                  </div>
                  <div className="space-y-2">
                    {requirements.map((requirement, index) => (
                      <div
                        key={requirement.label}
                        className={`flex items-center gap-2 text-[13px] font-bold ${
                          metRequirements[index] ? 'text-green-700' : 'text-pp-gray'
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${
                            metRequirements[index]
                              ? 'border-green-600 bg-pp-green text-white'
                              : 'border-pp-border bg-white'
                          }`}
                        >
                          {metRequirements[index] ? '✓' : ''}
                        </div>
                        {requirement.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      className="w-full rounded-xl border border-pp-border px-3.5 py-3 pr-11 text-[14px] outline-none transition-all focus:border-pp-red focus:ring-2 focus:ring-pp-red/8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pp-gray"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-2 text-[12px] font-bold text-red-700">
                      Passwords must match exactly.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !allRequirementsMet || !passwordsMatch}
                  className="w-full rounded-xl bg-pp-red py-3.5 text-[15px] font-black text-white transition-all hover:bg-pp-red-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Updating password…' : 'Set new password'}
                </button>
              </form>
            </>
          )}

          {success && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 bg-pp-green-light">
                <CheckCircle2 size={28} className="text-pp-green" />
              </div>
              <h1 className="text-[24px] font-black text-pp-dark">Password updated</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-pp-gray">
                Your password has been reset successfully. Redirecting you to login in{' '}
                <strong>{countdown}</strong> seconds.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white"
              >
                Go to login now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
