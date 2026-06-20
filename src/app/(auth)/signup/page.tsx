'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Hammer, Briefcase } from 'lucide-react'

const roles = [
  { id: 'homeowner', icon: <Home size={26}/>, name: 'Property Owner', desc: 'I need a trusted pro for my home', price: '✓ Free forever', priceColor: 'text-pp-green', selClass:'border-pp-green bg-pp-green-light' },
  { id: 'pro',       icon: <Hammer size={26}/>, name: 'Service Pro', desc: 'I offer home improvement services', price: '$9.99 / month', priceColor: 'text-pp-red',  selClass:'border-pp-red bg-pp-red-light' },
  { id: 'realtor',   icon: <Briefcase size={26}/>, name: 'Realtor', desc: 'I manage contractors for clients', price: '$29.99 / month', priceColor: 'text-pp-gold', selClass:'border-pp-gold bg-pp-gold-light' },
]

export default function SignupPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function goNext() {
    if (!selected) return
    router.push(`/signup/${selected}`)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT */}
      <div className="hidden lg:flex w-[42%] bg-pp-dark flex-col p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pp-red/12" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-pp-red/7" />
        <Link href="/" className="flex items-center gap-3 relative z-10 mb-16">
          <div className="w-10 h-10 rounded-[12px] bg-pp-red flex items-center justify-center font-black text-[15px] text-white">PP</div>
          <span className="text-xl font-black text-white"><span className="text-red-400">Property</span> Pros</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-red-400 mb-4">Get started</p>
          <h2 className="text-[34px] font-black text-white tracking-tight leading-tight mb-4">Choose how you use<br />Property Pros.</h2>
          <p className="text-[15px] text-gray-400 leading-relaxed mb-8 max-w-sm">Three types of accounts — each built for a different role in the home services world.</p>
          <div className="space-y-3.5">
            {[['🏠','Property Owners post projects free — always'],['🔨','Service pros get unlimited leads for $9.99/mo'],['💼','Realtors manage clients & contractors for $24.99/mo']].map(([icon,text]) => (
              <div key={text} className="flex items-center gap-3 text-[14px] font-bold text-gray-300">
                <div className="w-9 h-9 rounded-[10px] bg-white/8 flex items-center justify-center text-base shrink-0">{icon}</div>{text}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[['Free','Property Owners'],['$9.99','Pros / mo'],['$24.99','Realtors / mo']].map(([n,l]) => (
            <div key={l} className="bg-white/6 border border-white/8 rounded-xl p-3.5">
              <div className="text-xl font-black text-white">{n}</div>
              <div className="text-[11px] text-gray-500 font-bold mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[440px]">
          <h1 className="text-[24px] font-black text-pp-dark tracking-tight mb-1.5">Who are you signing up as?</h1>
          <p className="text-[14px] text-pp-gray mb-7">Already have an account? <Link href="/login" className="text-pp-red font-extrabold hover:underline">Log in</Link></p>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {roles.map(r => (
              <button key={r.id} onClick={() => setSelected(r.id)}
                className={`w-full flex items-center gap-4 p-4 border-2 rounded-2xl transition-all text-left ${selected === r.id ? r.selClass : 'border-pp-border hover:border-pp-dark-3'}`}>
                <div className="shrink-0 opacity-70">{r.icon}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-black text-pp-dark">{r.name}</div>
                  <div className="text-[12px] font-bold text-pp-gray mt-0.5">{r.desc}</div>
                </div>
                <div className={`text-[13px] font-black ${r.priceColor} whitespace-nowrap`}>{r.price}</div>
              </button>
            ))}
          </div>

          <button onClick={goNext} disabled={!selected}
            className="w-full py-3.5 rounded-xl bg-pp-dark text-white text-[15px] font-black disabled:opacity-40 hover:bg-pp-dark-2 transition-all">
            Continue →
          </button>
          <p className="text-[11px] text-pp-gray text-center mt-5 leading-relaxed">
            By continuing you agree to our <Link href="/terms" className="text-pp-red font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-pp-red font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
