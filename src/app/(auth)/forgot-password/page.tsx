'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import { getPasswordResetErrorMessage } from '@/lib/auth-errors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<'smtp' | 'console' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDeliveryMode(null)

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(getPasswordResetErrorMessage(json.code, json.error))
        setLoading(false)
        return
      }

      setDeliveryMode(json.delivery ?? null)
      setSent(true)
    } catch {
      setError('Unable to send reset instructions right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pp-bg flex items-center justify-center p-6">
      <div className="bg-white border border-pp-border rounded-3xl p-10 w-full max-w-md shadow-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-pp-gray hover:text-pp-dark mb-8"><ArrowLeft size={14}/> Back to login</Link>

        {!sent ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-pp-red/10 flex items-center justify-center mb-5"><Mail size={24} className="text-pp-red"/></div>
            <h1 className="text-[24px] font-black text-pp-dark tracking-tight mb-2">Forgot your password?</h1>
            <p className="text-[14px] text-pp-gray mb-7 leading-relaxed">Enter your email address and we&apos;ll send you a link to reset your password.</p>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Email address</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="you@example.com"
                  className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red focus:ring-2 focus:ring-pp-red/8"/>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all disabled:opacity-60">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <div className="mt-5 rounded-xl border border-pp-border bg-pp-bg px-4 py-3 text-[13px] leading-relaxed text-pp-gray">
              For security, the app returns the same success state whether or not that email has a credentials account.
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-pp-green-light border-2 border-green-200 flex items-center justify-center text-3xl mx-auto mb-5">✉️</div>
            <h2 className="text-[22px] font-black text-pp-dark mb-3">Check your inbox</h2>
            <p className="text-[14px] text-pp-gray leading-relaxed mb-6">We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.</p>
            <div className="mb-5 rounded-2xl border border-pp-border bg-pp-bg p-4 text-left text-[13px] leading-relaxed text-pp-gray">
              For security, the reset link is delivered by email instead of being exposed in the browser.
              {deliveryMode === 'console' && (
                <span> Local development fallback is active, so check the server logs for the delivered link.</span>
              )}
            </div>
            <Link href="/login" className="inline-block px-6 py-3 rounded-xl bg-pp-dark text-white text-[14px] font-black">Return to login</Link>
          </div>
        )}
      </div>
    </div>
  )
}
