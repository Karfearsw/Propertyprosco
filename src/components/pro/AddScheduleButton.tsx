'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function AddScheduleButton({ proId }: { proId: string }) {
  const router  = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm]     = useState({ title:'', client:'', address:'', date:'', duration:'120', notes:'', status:'confirmed' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}))

  async function save() {
    if (!form.title || !form.date) return
    setLoading(true)
    await fetch('/api/schedule', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, proId, duration: parseInt(form.duration)||undefined, date: new Date(form.date).toISOString() }) })
    setLoading(false); setOpen(false); router.refresh()
  }

  return (
    <>
      <button onClick={()=>setOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pp-red text-white text-[13px] font-black hover:bg-pp-red-dark transition-all"><Plus size={15}/>Add Job</button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-[18px] font-black text-pp-dark mb-4">Add Scheduled Job</h3>
            <div className="space-y-3">
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Job title *</label><input value={form.title} onChange={set('title')} placeholder="Roof inspection" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Client name</label><input value={form.client} onChange={set('client')} placeholder="John Smith" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Address</label><input value={form.address} onChange={set('address')} placeholder="123 Main St, Providence RI" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Date & time *</label><input type="datetime-local" value={form.date} onChange={set('date')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Duration (minutes)</label><input type="number" value={form.duration} onChange={set('duration')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Notes</label><textarea value={form.notes} onChange={set('notes')} rows={2} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red resize-none"/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setOpen(false)} className="flex-1 py-3 rounded-xl border border-pp-border text-[14px] font-bold">Cancel</button>
              <button onClick={save} disabled={!form.title||!form.date||loading} className="flex-1 py-3 rounded-xl bg-pp-red text-white text-[14px] font-black disabled:opacity-50">{loading?'Saving…':'Add Job'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
