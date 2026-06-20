'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'

const SERVICE_LIST = ['Roofing','Plumbing','Electrical','Painting','Landscaping','Remodeling','HVAC','Windows','Flooring','Masonry','Driveways','Fencing','Deck / Patio','Handyman','Gutters']

const steps = ['Account','Business','Services','Review']

export default function ProSignupPage() {
  const router  = useRouter()
  const [step, setStep]       = useState(0)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'', zipCode:'', password:'',
    businessName:'', yearsExp:'', bio:'',
    services:[] as string[],
    serviceArea:'',
    licenseNumber:'',
    licensed:false,
    insured:false,
    backgroundCheck:false,
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(f=>({...f,[k]:e.target.value}))
  const setBool = (k: 'licensed' | 'insured' | 'backgroundCheck') => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.checked}))
  const toggleSvc = (s: string) => setForm(f=>({ ...f, services: f.services.includes(s) ? f.services.filter(x=>x!==s) : [...f.services, s] }))

  async function submit() {
    setError(''); setLoading(true)
    const serviceArea = form.serviceArea
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        ...form,
        role:'PRO',
        yearsExp: parseInt(form.yearsExp)||0,
        serviceArea,
      }) })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Registration failed'); setLoading(false); return }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/auth/continue?desiredRole=PRO')
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-[42%] bg-pp-dark flex-col p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pp-red/12" />
        <Link href="/" className="flex items-center gap-3 relative z-10 mb-16">
          <div className="w-10 h-10 rounded-[12px] bg-pp-red flex items-center justify-center font-black text-white">PP</div>
          <span className="text-xl font-black text-white"><span className="text-red-400">Property</span> Pros</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-red-400 mb-4">Service Pro Signup</p>
          <h2 className="text-[34px] font-black text-white tracking-tight leading-tight mb-4">Start getting<br />leads today.</h2>
          <div className="bg-pp-green-light border border-green-200 rounded-xl p-3.5 text-[13px] font-bold text-green-800 mb-6">Monthly billing starts after you activate your subscription.</div>
          <div className="space-y-3.5">
            {[['⚡','Unlimited leads in your service area'],['📊','Your own verified business profile'],['💬','Direct messaging with homeowners'],['💰','Flat $9.99/mo — no per-lead fees']].map(([i,t]) => (
              <div key={t} className="flex items-center gap-3 text-[14px] font-bold text-gray-300"><div className="w-9 h-9 rounded-[10px] bg-white/8 flex items-center justify-center shrink-0">{i}</div>{t}</div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[['$9.99','/month'],['$0','Per lead'],['Stripe','Secure billing']].map(([n,l]) => (
            <div key={l} className="bg-white/6 border border-white/8 rounded-xl p-3.5"><div className="text-xl font-black text-white">{n}</div><div className="text-[11px] text-gray-500 font-bold mt-0.5">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Steps */}
          <div className="flex items-center mb-8">
            {steps.map((s,i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${i < step ? 'bg-pp-green text-white' : i === step ? 'bg-pp-red text-white' : 'bg-pp-border text-pp-gray'}`}>
                    {i < step ? <Check size={11}/> : i+1}
                  </div>
                  <span className={`text-[12px] font-black hidden sm:block ${i === step ? 'text-pp-dark' : i < step ? 'text-pp-green' : 'text-pp-gray'}`}>{s}</span>
                </div>
                {i < steps.length-1 && <div className={`flex-1 h-0.5 mx-2 transition-all ${i < step ? 'bg-pp-green' : 'bg-pp-border'}`}/>}
              </div>
            ))}
          </div>

          {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold rounded-xl px-4 py-3 mb-4"><AlertCircle size={14}/>{error}</div>}

          {/* Step 0: Account */}
          {step === 0 && (
            <div>
              <h1 className="text-[22px] font-black text-pp-dark mb-1">Create your account</h1>
              <p className="text-[14px] text-pp-gray mb-6">Already have an account? <Link href="/login" className="text-pp-red font-extrabold hover:underline">Log in</Link></p>
              <SocialAuthButtons
                desiredRole="PRO"
                dividerText="or sign up with email"
                onError={setError}
              />
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">First name</label><input value={form.firstName} onChange={set('firstName')} required placeholder="Kevin" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                  <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Last name</label><input value={form.lastName} onChange={set('lastName')} required placeholder="Harris" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                </div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Email address</label><input value={form.email} onChange={set('email')} type="email" required placeholder="you@example.com" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Phone number</label><input value={form.phone} onChange={set('phone')} type="tel" placeholder="401-555-0100" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Password</label>
                  <div className="relative"><input value={form.password} onChange={set('password')} type={showPw?'text':'password'} required minLength={8} placeholder="Min 8 characters" className="w-full px-3.5 py-3 pr-11 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pp-gray">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
                </div>
                <button onClick={()=>{if(form.firstName&&form.email&&form.password.length>=8)setStep(1)}} className="w-full py-3.5 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all mt-1">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 1: Business */}
          {step === 1 && (
            <div>
              <h1 className="text-[22px] font-black text-pp-dark mb-6">Business information</h1>
              <div className="space-y-3.5">
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Business / Trade name</label><input value={form.businessName} onChange={set('businessName')} placeholder="Harris Home Services" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Service ZIP code</label><input value={form.zipCode} onChange={set('zipCode')} placeholder="02903" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Service area</label><input value={form.serviceArea} onChange={set('serviceArea')} placeholder="Providence, Cranston, Warwick" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Years in business</label><input value={form.yearsExp} onChange={set('yearsExp')} type="number" min="0" placeholder="5" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">License number</label><input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="RI-12345678" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Short bio (optional)</label><textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Tell homeowners about your experience..." className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red resize-none"/></div>
                <div className="grid gap-2 rounded-xl border border-pp-border p-3.5">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-pp-dark"><input checked={form.licensed} onChange={setBool('licensed')} type="checkbox" className="h-4 w-4 accent-pp-red"/>I have an active professional license</label>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-pp-dark"><input checked={form.insured} onChange={setBool('insured')} type="checkbox" className="h-4 w-4 accent-pp-red"/>I carry business insurance</label>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-pp-dark"><input checked={form.backgroundCheck} onChange={setBool('backgroundCheck')} type="checkbox" className="h-4 w-4 accent-pp-red"/>Background check available on request</label>
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>setStep(0)} className="flex-shrink-0 px-5 py-3.5 rounded-xl bg-pp-dark text-white text-[14px] font-bold">← Back</button>
                  <button onClick={()=>setStep(2)} className="flex-1 py-3.5 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all">Continue →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div>
              <h1 className="text-[22px] font-black text-pp-dark mb-2">What services do you offer?</h1>
              <p className="text-[14px] text-pp-gray mb-5">Select all that apply. You can update this later.</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {SERVICE_LIST.map(s => (
                  <button key={s} onClick={()=>toggleSvc(s)}
                    className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-xl text-[13px] font-extrabold transition-all text-left ${form.services.includes(s) ? 'border-pp-red bg-pp-red-light text-pp-red' : 'border-pp-border hover:border-pp-red-dark'}`}>
                    {form.services.includes(s) && <Check size={13} className="shrink-0"/>}{s}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="flex-shrink-0 px-5 py-3.5 rounded-xl bg-pp-dark text-white text-[14px] font-bold">← Back</button>
                <button onClick={()=>setStep(3)} className="flex-1 py-3.5 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div>
              <h1 className="text-[22px] font-black text-pp-dark mb-2">Almost done!</h1>
              <p className="text-[14px] text-pp-gray mb-5">Review your info and create your Pro account.</p>
              <div className="bg-pp-bg border border-pp-border rounded-xl p-4 space-y-2 mb-5 text-[13px] font-bold text-pp-dark-3">
                <div><span className="text-pp-gray">Name:</span> {form.firstName} {form.lastName}</div>
                <div><span className="text-pp-gray">Email:</span> {form.email}</div>
                <div><span className="text-pp-gray">Business:</span> {form.businessName||'—'}</div>
                <div><span className="text-pp-gray">Services:</span> {form.services.length ? form.services.join(', ') : 'None selected'}</div>
                <div><span className="text-pp-gray">Service area:</span> {form.serviceArea||form.zipCode||'—'}</div>
                <div><span className="text-pp-gray">License:</span> {form.licenseNumber||'Not added yet'}</div>
                <div><span className="text-pp-gray">Credentials:</span> {[form.licensed && 'Licensed', form.insured && 'Insured', form.backgroundCheck && 'Background checked'].filter(Boolean).join(', ') || 'Pending setup'}</div>
              </div>
              <div className="bg-pp-green-light border border-green-200 rounded-xl p-3.5 text-[13px] font-bold text-green-800 mb-5">You&apos;ll head to billing next to activate your $9.99/month subscription.</div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="flex-shrink-0 px-5 py-3.5 rounded-xl bg-pp-dark text-white text-[14px] font-bold">← Back</button>
                <button onClick={submit} disabled={loading} className="flex-1 py-3.5 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all disabled:opacity-60">
                  {loading ? 'Creating account…' : 'Create my Pro account →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
