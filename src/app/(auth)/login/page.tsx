'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'

function authErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    case 'OAuthAccountNotLinked':
      return 'This email is already associated with another sign-in method. Use your existing method to log in first.'
    case 'AccessDenied':
      return 'Your social sign-in could not be verified. Try a different provider or continue with email.'
    case 'Configuration':
      return 'Authentication is temporarily unavailable. Please try again shortly.'
    case 'CredentialsSignin':
      return 'Invalid email or password.'
    default:
      return errorCode ? 'We could not sign you in. Please try again.' : ''
  }
}

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackError = params.get('error')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState(authErrorMessage(callbackError))
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (!res?.ok) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/auth/continue')
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[42%] bg-pp-dark flex-col p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pp-red/12" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-pp-red/7" />
        <Link href="/" className="flex items-center gap-3 relative z-10 mb-16">
          <div className="w-10 h-10 rounded-[12px] bg-pp-red flex items-center justify-center font-black text-[15px] text-white">PP</div>
          <span className="text-xl font-black text-white"><span className="text-red-400">Property</span> Pros</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-red-400 mb-4">Welcome back</p>
          <h2 className="text-[34px] font-black text-white tracking-tight leading-tight mb-4">Your next job<br />is waiting.</h2>
          <p className="text-[15px] text-gray-400 leading-relaxed mb-8 max-w-sm">Log in to manage your leads, messages, clients, and schedule — all in one place.</p>
          <div className="space-y-3.5">
            {[['🏠','New leads in your area today'],['💬','Messages waiting for your reply'],['📅','Jobs scheduled this week']].map(([icon,text]) => (
              <div key={text} className="flex items-center gap-3 text-[14px] font-bold text-gray-300">
                <div className="w-9 h-9 rounded-[10px] bg-white/8 flex items-center justify-center text-base shrink-0">{icon}</div>{text}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[['100%','Vetted pros'],['2-way','Reviews'],['$0','For owners']].map(([n,l]) => (
            <div key={l} className="bg-white/6 border border-white/8 rounded-xl p-3.5">
              <div className="text-xl font-black text-white">{n}</div>
              <div className="text-[11px] text-gray-500 font-bold mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <h1 className="text-[24px] font-black text-pp-dark tracking-tight mb-1.5">Log in to your account</h1>
          <p className="text-[14px] text-pp-gray mb-6">New here? <Link href="/signup" className="text-pp-red font-extrabold hover:underline">Create a free account</Link></p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="shrink-0"/>{error}
            </div>
          )}

          <SocialAuthButtons
            dividerText="or continue with email"
            onError={setError}
          />

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@example.com"
                className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] font-body text-pp-dark outline-none focus:border-pp-red focus:ring-2 focus:ring-pp-red/8 transition-all" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2">Password</label>
                <Link href="/forgot-password" className="text-[12px] font-extrabold text-pp-red hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                  className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] font-body text-pp-dark outline-none focus:border-pp-red focus:ring-2 focus:ring-pp-red/8 transition-all pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pp-gray hover:text-pp-dark">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all disabled:opacity-60 mt-1">
              {loading ? 'Logging in…' : 'Log in →'}
            </button>
          </form>
          <p className="text-[11px] text-pp-gray text-center mt-5 leading-relaxed">
            By logging in you agree to our <Link href="/terms" className="text-pp-red font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-pp-red font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
