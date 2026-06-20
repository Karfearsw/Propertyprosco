'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProProfile, RealtorProfile, User, UserRole } from '@prisma/client'

interface Props {
  user: User | null
  role: UserRole
  proProfile?: ProProfile | null
  realtorProfile?: RealtorProfile | null
  accentColor?: string
}

const accents: Record<string,string> = { red:'focus:border-pp-red', green:'focus:border-pp-green', gold:'focus:border-pp-gold' }
const btnAccents: Record<string,string> = { red:'bg-pp-red hover:bg-pp-red-dark', green:'bg-pp-green hover:bg-green-700', gold:'bg-pp-gold hover:bg-amber-800' }
const checkboxAccents: Record<string,string> = { red:'accent-pp-red', green:'accent-pp-green', gold:'accent-pp-gold' }

export default function SettingsForm({ user, role, proProfile, realtorProfile, accentColor='red' }: Props) {
  const router   = useRouter()
  const accent   = accents[accentColor] ?? accents.red
  const btnClass = btnAccents[accentColor] ?? btnAccents.red
  const checkboxClass = checkboxAccents[accentColor] ?? checkboxAccents.red
  const deleteSubject = encodeURIComponent(`Account deletion request (${role.toLowerCase()})`)
  const deleteBody = encodeURIComponent(`Please help me delete my Property Pros account.\n\nRole: ${role}\nEmail: ${user?.email ?? ''}`)

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    phone:     user?.phone     ?? '',
    zipCode:   user?.zipCode   ?? '',
    emailNotifications: user?.emailNotifications ?? true,
    smsNotifications: user?.smsNotifications ?? false,
    marketingEmails: user?.marketingEmails ?? false,
    businessName: proProfile?.businessName ?? '',
    serviceArea: (proProfile?.serviceArea ?? []).join(', '),
    licenseNumber: proProfile?.licenseNumber ?? realtorProfile?.licenseNumber ?? '',
    agencyName: realtorProfile?.agencyName ?? '',
  })
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}))
  const setBool = (k: 'emailNotifications' | 'smsNotifications' | 'marketingEmails') => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.checked }))

  async function save(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await fetch('/api/user/profile', {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        ...form,
        serviceArea: form.serviceArea.split(',').map((value) => value.trim()).filter(Boolean),
      }),
    })
    setSaved(true); setLoading(false); setTimeout(()=>setSaved(false),2500); router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <h2 className="text-[15px] font-black text-pp-dark mb-5">Personal Information</h2>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">First name</label><input value={form.firstName} onChange={set('firstName')} className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
            <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Last name</label><input value={form.lastName} onChange={set('lastName')} className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
          </div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Email address</label><input value={user?.email ?? ''} disabled className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] bg-pp-bg text-pp-gray cursor-not-allowed"/></div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Phone number</label><input value={form.phone} onChange={set('phone')} type="tel" className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">ZIP code</label><input value={form.zipCode} onChange={set('zipCode')} className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
          {role === 'PRO' && (
            <>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Business name</label><input value={form.businessName} onChange={set('businessName')} className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Service area</label><input value={form.serviceArea} onChange={set('serviceArea')} placeholder="Providence, Cranston, Warwick" className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">License number</label><input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="RI-12345678" className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
            </>
          )}
          {role === 'REALTOR' && (
            <>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Agency / Brokerage</label><input value={form.agencyName} onChange={set('agencyName')} className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">License number</label><input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="RI-12345678" className={`w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none ${accent}`}/></div>
            </>
          )}
          <div className="rounded-xl border border-pp-border p-4">
            <h3 className="text-[12px] font-black uppercase tracking-[0.8px] text-pp-dark mb-3">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 text-[13px] font-bold text-pp-dark">
                <span>Email updates about quotes, leads, and account activity</span>
                <input checked={form.emailNotifications} onChange={setBool('emailNotifications')} type="checkbox" className={`h-4 w-4 ${checkboxClass}`} />
              </label>
              <label className="flex items-center justify-between gap-3 text-[13px] font-bold text-pp-dark">
                <span>Text messages for time-sensitive activity</span>
                <input checked={form.smsNotifications} onChange={setBool('smsNotifications')} type="checkbox" className={`h-4 w-4 ${checkboxClass}`} />
              </label>
              <label className="flex items-center justify-between gap-3 text-[13px] font-bold text-pp-dark">
                <span>Occasional product tips and promotional announcements</span>
                <input checked={form.marketingEmails} onChange={setBool('marketingEmails')} type="checkbox" className={`h-4 w-4 ${checkboxClass}`} />
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl text-white text-[15px] font-black transition-all disabled:opacity-60 ${btnClass}`}>
            {saved ? '✓ Saved!' : loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <h2 className="text-[15px] font-black text-pp-dark mb-2">Danger Zone</h2>
        <p className="text-[13px] text-pp-gray font-bold mb-4">Account deletion is handled by support so your project, message, and billing history can be reviewed safely.</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:support@propertypros.com?subject=${deleteSubject}&body=${deleteBody}`}
            className="px-4 py-2.5 rounded-xl border-2 border-pp-red text-pp-red text-[13px] font-extrabold hover:bg-pp-red-light transition-all"
          >
            Request Account Deletion
          </a>
          <a href="/terms" className="px-4 py-2.5 rounded-xl border border-pp-border text-[13px] font-extrabold text-pp-dark hover:border-pp-dark hover:text-pp-dark">
            Review Terms
          </a>
        </div>
      </div>
    </div>
  )
}
