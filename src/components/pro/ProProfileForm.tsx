'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProProfile, User } from '@prisma/client'
import { Shield, Award, BadgeCheck } from 'lucide-react'
import { calculateProProfileCompletion } from '@/lib/profile-completion'

type ProWithUser = ProProfile & { user: User }

const SERVICE_LIST = ['Roofing','Plumbing','Electrical','Painting','Landscaping','Remodeling','HVAC','Windows','Flooring','Masonry','Driveways','Fencing','Deck / Patio','Handyman','Gutters']

export default function ProProfileForm({ pro }: { pro: ProWithUser | null }) {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: pro?.user.firstName ?? '',
    lastName: pro?.user.lastName ?? '',
    phone: pro?.user.phone ?? '',
    zipCode: pro?.user.zipCode ?? '',
    businessName: pro?.businessName ?? '',
    bio: pro?.bio ?? '',
    services: pro?.services ?? [] as string[],
    serviceArea: (pro?.serviceArea ?? []).join(', '),
    yearsExp: pro?.yearsExp?.toString() ?? '',
    licenseNumber: pro?.licenseNumber ?? '',
    licensed: pro?.licensed ?? false,
    insured: pro?.insured ?? false,
    backgroundCheck: pro?.backgroundCheck ?? false,
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(f=>({...f,[k]:e.target.value}))
  const setBool = (k: 'licensed' | 'insured' | 'backgroundCheck') => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.checked }))
  const toggleSvc = (s: string) => setForm(f=>({ ...f, services: f.services.includes(s) ? f.services.filter(x=>x!==s) : [...f.services, s] }))

  const completionPreview = calculateProProfileCompletion({
    firstName: form.firstName,
    lastName: form.lastName,
    businessName: form.businessName,
    bio: form.bio,
    services: form.services,
    serviceArea: form.serviceArea.split(',').map((value) => value.trim()).filter(Boolean),
    yearsExp: parseInt(form.yearsExp) || 0,
    licenseNumber: form.licenseNumber,
    licensed: form.licensed,
    insured: form.insured,
  })

  async function save(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await fetch('/api/user/profile', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        ...form,
        serviceArea: form.serviceArea.split(',').map((value) => value.trim()).filter(Boolean),
        yearsExp: parseInt(form.yearsExp)||undefined,
      }) })
    setSaved(true); setLoading(false); setTimeout(()=>setSaved(false),2500); router.refresh()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <h2 className="text-[15px] font-black text-pp-dark mb-4">Business Info</h2>
        <div className="space-y-3.5">
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Business name</label><input value={form.businessName} onChange={set('businessName')} placeholder="Harris Home Services" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">First name</label><input value={form.firstName} onChange={set('firstName')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Last name</label><input value={form.lastName} onChange={set('lastName')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
          </div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Phone</label><input value={form.phone} onChange={set('phone')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Service ZIP</label><input value={form.zipCode} onChange={set('zipCode')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Service area</label><input value={form.serviceArea} onChange={set('serviceArea')} placeholder="Providence, Cranston, Warwick" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Years in business</label><input value={form.yearsExp} onChange={set('yearsExp')} type="number" min="0" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Bio</label><textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Tell homeowners about your experience, specialties, and approach…" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red resize-none"/></div>
        </div>
      </div>

      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <h2 className="text-[15px] font-black text-pp-dark mb-4">Services Offered</h2>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_LIST.map(s => (
            <button key={s} type="button" onClick={()=>toggleSvc(s)}
              className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-xl text-[13px] font-extrabold transition-all text-left ${form.services.includes(s)?'border-pp-red bg-pp-red-light text-pp-red':'border-pp-border hover:border-pp-red'}`}>
              {form.services.includes(s) && '✓'} {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <h2 className="text-[15px] font-black text-pp-dark mb-4">Credentials</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">License number</label>
            <input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="RI-12345678" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/>
          </div>
          <div className="flex items-center gap-3 p-3.5 border border-pp-border rounded-xl">
            <Shield size={18} className="text-pp-blue shrink-0"/>
            <div className="flex-1"><div className="text-[13px] font-black text-pp-dark">Licensed</div><div className="text-[11px] text-pp-gray font-bold">{form.licenseNumber ? 'License number ready for review' : 'Add your license details to build trust'}</div></div>
            <label className="inline-flex items-center gap-2 text-[12px] font-black text-pp-dark">
              <input checked={form.licensed} onChange={setBool('licensed')} type="checkbox" className="h-4 w-4 accent-pp-red"/>
              Verified
            </label>
          </div>
          <div className="flex items-center gap-3 p-3.5 border border-pp-border rounded-xl">
            <Award size={18} className="text-pp-gold shrink-0"/>
            <div className="flex-1"><div className="text-[13px] font-black text-pp-dark">Insured</div><div className="text-[11px] text-pp-gray font-bold">{form.insured ? 'Insurance is included on your profile' : 'Add insurance status to reassure homeowners'}</div></div>
            <label className="inline-flex items-center gap-2 text-[12px] font-black text-pp-dark">
              <input checked={form.insured} onChange={setBool('insured')} type="checkbox" className="h-4 w-4 accent-pp-red"/>
              Active
            </label>
          </div>
          <div className="flex items-center gap-3 p-3.5 border border-pp-border rounded-xl">
            <BadgeCheck size={18} className="text-pp-green shrink-0"/>
            <div className="flex-1"><div className="text-[13px] font-black text-pp-dark">Background check</div><div className="text-[11px] text-pp-gray font-bold">Show homeowners that you are ready for higher-trust projects.</div></div>
            <label className="inline-flex items-center gap-2 text-[12px] font-black text-pp-dark">
              <input checked={form.backgroundCheck} onChange={setBool('backgroundCheck')} type="checkbox" className="h-4 w-4 accent-pp-red"/>
              Complete
            </label>
          </div>
        </div>
        <p className="text-[12px] text-pp-gray font-bold mt-3">Keep your service area, license, and insurance current so lead matching and profile trust stay accurate.</p>
      </div>

      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-black text-pp-dark">Profile completion</h2>
          <span className="text-[13px] font-black text-pp-red">{completionPreview}%</span>
        </div>
        <div className="h-2 rounded-full bg-pp-border overflow-hidden mb-3">
          <div className="h-full rounded-full bg-gradient-to-r from-pp-red to-red-400" style={{ width: `${completionPreview}%` }} />
        </div>
        <div className="grid gap-1.5 text-[12px] font-bold">
          {[
            ['Business info added', Boolean(form.businessName && form.firstName && form.lastName)],
            ['Bio written', Boolean(form.bio.trim())],
            ['Services selected', form.services.length > 0],
            ['Service area added', Boolean(form.serviceArea.trim())],
            ['Experience included', Boolean(parseInt(form.yearsExp) > 0)],
            ['License confirmed', Boolean(form.licensed && form.licenseNumber.trim())],
            ['Insurance confirmed', form.insured],
          ].map(([label, done]) => (
            <div key={label as string} className={done ? 'text-pp-green' : 'text-pp-dark-3'}>
              {done ? '✓' : '○'} {label as string}
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all disabled:opacity-60">
        {saved ? '✓ Profile Saved!' : loading ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}
