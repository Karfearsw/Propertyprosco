'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RealtorClient } from '@prisma/client'

const CATEGORIES = ['Roofing','Plumbing','Electrical','Painting','Landscaping','Remodeling','HVAC','Windows','Flooring','Masonry','Driveways','Fencing','Deck / Patio','Handyman','Gutters','Other']

export default function RealtorPostProjectForm({ clients }: { clients: RealtorClient[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ title:'', description:'', category:'', budget:'', zipCode:'', address:'', urgent:false })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res  = await fetch('/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed'); setLoading(false); return }
    router.push('/realtor/dashboard')
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold rounded-xl px-4 py-3">{error}</div>}
      <div className="bg-white border border-pp-border rounded-2xl p-6 space-y-4">
        {clients.length > 0 && (
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">For client (optional)</label>
            <select className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold bg-white">
              <option value="">Posting for myself / general</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Project title *</label><input value={form.title} onChange={set('title')} required placeholder="Replace roof shingles" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
        <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Category *</label>
          <select value={form.category} onChange={set('category')} required className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold bg-white">
            <option value="">Select…</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Property address</label><input value={form.address} onChange={set('address')} placeholder="123 Main St, Providence RI" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
        <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Description</label><textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the work needed…" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold resize-none"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Budget</label><input value={form.budget} onChange={set('budget')} placeholder="e.g. $5,000–$10,000" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
          <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">ZIP code</label><input value={form.zipCode} onChange={set('zipCode')} placeholder="02903" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.urgent} onChange={e=>setForm(f=>({...f,urgent:e.target.checked}))} className="w-4 h-4"/><span className="text-[13px] font-bold">⚡ Urgent — needs quick turnaround</span></label>
      </div>
      <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-pp-gold text-white text-[15px] font-black hover:bg-amber-800 transition-all disabled:opacity-60">{loading?'Posting…':'Post Project'}</button>
    </form>
  )
}
