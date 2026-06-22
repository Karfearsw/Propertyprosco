'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { getSignupErrorMessage } from '@/lib/auth-errors'

export default function HomeownerSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',phone:'',zipCode:'',password:'' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({...f, [k]: e.target.value}))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, role:'HOMEOWNER'}) })
    const json = await res.json()
    if (!res.ok && !json.requiresEmailVerification) {
      setError(getSignupErrorMessage(json.code, json.error))
      setLoading(false)
      return
    }

    const email = encodeURIComponent(json.email ?? form.email)
    router.push(`/verify-email?email=${email}`)
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-[42%] bg-pp-dark flex-col p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pp-green/12" />
        <Link href="/" className="flex items-center gap-3 relative z-10 mb-16">
          <div className="w-10 h-10 rounded-[12px] bg-pp-red flex items-center justify-center font-black text-white">PP</div>
          <span className="text-xl font-black text-white"><span className="text-red-400">Property</span> Pros</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-green-400 mb-4">Property Owner Signup</p>
          <h2 className="text-[34px] font-black text-white tracking-tight leading-tight mb-4">Find your next<br />trusted pro.</h2>
          <p className="text-[15px] text-gray-400 leading-relaxed mb-8">Create your free account in under 2 minutes. Post your first project and start receiving quotes from verified local contractors.</p>
          <div className="space-y-3.5">
            {[['📋','Post unlimited projects for free'],['💬','Compare quotes and message pros directly'],['⭐','Read real verified ratings from completed jobs']].map(([i,t]) => (
              <div key={t} className="flex items-center gap-3 text-[14px] font-bold text-gray-300">
                <div className="w-9 h-9 rounded-[10px] bg-white/8 flex items-center justify-center shrink-0">{i}</div>{t}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[['$0','Cost to join'],['2 hrs','Avg. first quote'],['4.8★','Avg pro rating']].map(([n,l]) => (
            <div key={l} className="bg-white/6 border border-white/8 rounded-xl p-3.5"><div className="text-xl font-black text-white">{n}</div><div className="text-[11px] text-gray-500 font-bold mt-0.5">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <h1 className="text-[24px] font-black text-pp-dark tracking-tight mb-1.5">Create your free account</h1>
          <p className="text-[14px] text-pp-gray mb-5">Already have an account? <Link href="/login" className="text-pp-red font-extrabold hover:underline">Log in</Link></p>

          <div className="bg-pp-green-light border border-green-200 rounded-xl p-3.5 text-[13px] font-bold text-green-800 mb-5">🏠 Homeowner accounts are always free. No subscription, no catch. You can sign up, post projects, and compare quotes while we finish a homeowner billing upgrade.</div>

          {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold rounded-xl px-4 py-3 mb-4"><AlertCircle size={14}/>{error}</div>}

          <SocialAuthButtons
            desiredRole="HOMEOWNER"
            dividerText="or sign up with email"
            onError={setError}
          />

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">First name</label><input value={form.firstName} onChange={set('firstName')} required placeholder="Maria" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green focus:ring-2 focus:ring-pp-green/8"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Last name</label><input value={form.lastName} onChange={set('lastName')} required placeholder="Santos" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green focus:ring-2 focus:ring-pp-green/8"/></div>
            </div>
            {[['Email address','email','email','you@example.com'],['Phone number','phone','tel','401-555-0100'],['ZIP code','zipCode','text','02903']].map(([label, key, type, ph]) => (
              <div key={key}><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">{label}</label><input value={(form as Record<string, string>)[key]} onChange={set(key)} type={type} required={key==='email'} placeholder={ph} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green focus:ring-2 focus:ring-pp-green/8"/></div>
            ))}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Password</label>
              <div className="relative">
                <input value={form.password} onChange={set('password')} type={showPw?'text':'password'} required placeholder="Min 8 characters" minLength={8} className="w-full px-3.5 py-3 pr-11 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green focus:ring-2 focus:ring-pp-green/8"/>
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pp-gray">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-pp-green text-white text-[15px] font-black hover:bg-green-700 transition-all disabled:opacity-60 mt-1">
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>
          </form>
          <p className="text-[11px] text-pp-gray text-center mt-5">By signing up you agree to our <Link href="/terms" className="text-pp-red font-bold">Terms</Link> and <Link href="/privacy" className="text-pp-red font-bold">Privacy Policy</Link>.<br/><br/><Link href="/signup" className="text-pp-gray hover:underline">← Choose a different account type</Link></p>
        </div>
      </div>
    </div>
  )
}
