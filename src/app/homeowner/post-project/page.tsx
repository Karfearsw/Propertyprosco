'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'

const CATEGORIES = ['Roofing','Plumbing','Electrical','Painting','Landscaping','Remodeling','HVAC','Windows','Flooring','Masonry','Driveways','Fencing','Deck / Patio','Handyman','Gutters','Other']
const BUDGETS    = ['Under $500','$500–$1,000','$1,000–$5,000','$5,000–$15,000','$15,000–$50,000','$50,000+','Not sure yet']

export default function PostProjectPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title:'', description:'', category:'', budget:'', zipCode:'', urgent: false })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const res  = await fetch('/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to post project'); setLoading(false); return }
    router.push('/homeowner/projects')
  }

  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-1">Post a Project</h1>
      <p className="text-[14px] font-bold text-pp-gray mb-6">Free forever. Get quotes from verified local pros.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold rounded-xl px-4 py-3 mb-5">{error}</div>}

      <form onSubmit={submit} className="space-y-4">
        <div className="bg-white border border-pp-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Project title *</label>
            <input value={form.title} onChange={set('title')} required placeholder="e.g. Replace roof shingles on 3-bedroom house" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green"/>
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Category *</label>
            <select value={form.category} onChange={set('category')} required className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green bg-white">
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the work needed, the size of the job, any special requirements, and when you'd like it done…" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green resize-none"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Budget</label>
              <select value={form.budget} onChange={set('budget')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green bg-white">
                <option value="">Select a range…</option>
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">ZIP code</label>
              <input value={form.zipCode} onChange={set('zipCode')} placeholder="02903" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green"/>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.urgent} onChange={e=>setForm(f=>({...f,urgent:e.target.checked}))} className="w-4 h-4"/>
            <span className="text-[13px] font-bold text-pp-dark">⚡ This is urgent — I need help ASAP</span>
          </label>
        </div>

        <div className="bg-pp-green-light border border-green-200 rounded-xl p-4 text-[13px] font-bold text-green-800">
          ✓ Posting is free. You&apos;ll receive quotes directly from verified pros. No obligation.
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-pp-green text-white text-[15px] font-black hover:bg-green-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          <PlusCircle size={18}/>{loading ? 'Posting…' : 'Post Project Free'}
        </button>
      </form>
    </div>
  )
}
