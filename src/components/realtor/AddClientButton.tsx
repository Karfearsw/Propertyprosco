'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function AddClientButton({ realtorId: _realtorId }: { realtorId: string }) {
  const router  = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm]     = useState({ name:'', email:'', phone:'', address:'', notes:'', status:'active' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}))

  async function save() {
    if (!form.name) return
    setLoading(true)
    await fetch('/api/realtor/clients', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setLoading(false); setOpen(false); router.refresh()
  }

  return (
    <>
      <button onClick={()=>setOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pp-gold text-white text-[13px] font-black hover:bg-amber-800 transition-all"><Plus size={15}/>Add Client</button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-[18px] font-black text-pp-dark mb-4">Add New Client</h3>
            <div className="space-y-3">
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Full name *</label><input value={form.name} onChange={set('name')} placeholder="Jane Smith" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Email</label><input value={form.email} onChange={set('email')} type="email" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Phone</label><input value={form.phone} onChange={set('phone')} type="tel" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Property address</label><input value={form.address} onChange={set('address')} placeholder="123 Main St, Providence RI" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Status</label>
                <select value={form.status} onChange={set('status')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold bg-white">
                  <option value="active">Active</option><option value="pending">Pending</option><option value="closed">Closed</option>
                </select>
              </div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Notes</label><textarea value={form.notes} onChange={set('notes')} rows={2} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-gold resize-none"/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setOpen(false)} className="flex-1 py-3 rounded-xl border border-pp-border text-[14px] font-bold">Cancel</button>
              <button onClick={save} disabled={!form.name||loading} className="flex-1 py-3 rounded-xl bg-pp-gold text-white text-[14px] font-black disabled:opacity-50">{loading?'Saving…':'Add Client'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
