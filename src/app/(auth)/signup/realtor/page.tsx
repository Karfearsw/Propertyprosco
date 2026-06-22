'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { getBillingPlan } from '@/lib/billing-config'

const plan = getBillingPlan('REALTOR')

export default function RealtorSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',phone:'',password:'',agencyName:'',licenseNumber:'' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, role:'REALTOR'}) })
    const json = await res.json()
    if (!res.ok && !json.requiresEmailVerification) {
      setError(json.error ?? 'We could not create your account right now. Please try again in a few minutes.')
      setLoading(false)
      return
    }

    router.push(json.nextStep ?? `/verify-email?email=${encodeURIComponent(json.email ?? form.email)}`)
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-[42%] bg-pp-dark flex-col p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pp-gold/12" />
        <Link href="/" className="flex items-center gap-3 relative z-10 mb-16">
          <div className="w-10 h-10 rounded-[12px] bg-pp-red flex items-center justify-center font-black text-white">PP</div>
          <span className="text-xl font-black text-white"><span className="text-red-400">Property</span> Pros</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-yellow-500 mb-4">Realtor Signup</p>
          <h2 className="text-[34px] font-black text-white tracking-tight leading-tight mb-4">Manage your clients<br />like a pro.</h2>
          <p className="text-[15px] text-gray-400 leading-relaxed mb-6">One dashboard for all your clients, contractors, and deadlines. Close faster. Stress less.</p>
          <div className="bg-pp-gold-light border border-amber-200 rounded-xl p-3.5 text-[13px] font-bold text-amber-800 mb-6">Stripe billing is collected during signup, and access unlocks after payment plus email verification.</div>
          <div className="space-y-3.5">
            {plan.features.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-[14px] font-bold text-gray-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/8">OK</div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <h1 className="text-[24px] font-black text-pp-dark tracking-tight mb-1.5">Create your realtor account</h1>
          <p className="text-[14px] text-pp-gray mb-5">Already have an account? <Link href="/login" className="text-pp-red font-extrabold hover:underline">Log in</Link></p>
          <div className="bg-pp-gold-light border border-amber-200 rounded-xl p-3.5 text-[13px] font-bold text-amber-800 mb-5">Next step: add your payment method and complete secure Stripe billing for {plan.amountLabel}.</div>

          {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold rounded-xl px-4 py-3 mb-4"><AlertCircle size={14}/>{error}</div>}

          <SocialAuthButtons
            desiredRole="REALTOR"
            dividerText="or sign up with email"
            onError={setError}
          />

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">First name</label><input value={form.firstName} onChange={set('firstName')} required placeholder="Amy" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Last name</label><input value={form.lastName} onChange={set('lastName')} required placeholder="Lee" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
            </div>
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Email address</label><input value={form.email} onChange={set('email')} type="email" required placeholder="you@realty.com" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Phone number</label><input value={form.phone} onChange={set('phone')} type="tel" placeholder="401-555-0100" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Agency / Brokerage</label><input value={form.agencyName} onChange={set('agencyName')} placeholder="Century 21, Coldwell Banker…" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">RE License # (optional)</label><input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="RI-12345678" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Password</label>
              <div className="relative"><input value={form.password} onChange={set('password')} type={showPw?'text':'password'} required minLength={8} placeholder="Min 8 characters" className="w-full px-3.5 py-3 pr-11 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pp-gray">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-pp-gold text-white text-[15px] font-black hover:bg-amber-800 transition-all disabled:opacity-60 mt-1">
              {loading ? 'Creating account…' : 'Create my Realtor account →'}
            </button>
          </form>
          <p className="text-[11px] text-pp-gray text-center mt-5">By signing up you agree to our <Link href="/terms" className="text-pp-red font-bold">Terms</Link> and <Link href="/privacy" className="text-pp-red font-bold">Privacy Policy</Link>.<br/><br/><Link href="/signup" className="text-pp-gray hover:underline">← Choose a different account type</Link></p>
        </div>
      </div>
    </div>
  )
}
