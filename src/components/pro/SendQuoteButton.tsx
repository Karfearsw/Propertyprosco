'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SendQuoteButton({ projectId, proId }: { projectId: string; proId: string }) {
  const router  = useRouter()
  const [open, setOpen]     = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMsg]   = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!amount) return
    setLoading(true)
    await fetch('/api/quotes', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ projectId, amount: parseFloat(amount), message }) })
    setLoading(false); setOpen(false); router.refresh()
  }

  if (!open) return (
    <button onClick={()=>setOpen(true)} className="px-3 py-1.5 rounded-lg bg-pp-red text-white text-[12px] font-extrabold hover:bg-pp-red-dark transition-all">Send Quote</button>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setOpen(false)}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-[18px] font-black text-pp-dark mb-4">Send a Quote</h3>
        <div className="mb-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Your Quote ($)</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="1500" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/>
        </div>
        <div className="mb-5">
          <label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Message (optional)</label>
          <textarea value={message} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="Tell the homeowner about your experience…" className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red resize-none"/>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setOpen(false)} className="flex-1 py-3 rounded-xl border border-pp-border text-[14px] font-bold hover:bg-pp-bg">Cancel</button>
          <button onClick={send} disabled={!amount||loading} className="flex-1 py-3 rounded-xl bg-pp-red text-white text-[14px] font-black disabled:opacity-50">{loading?'Sending…':'Send Quote'}</button>
        </div>
      </div>
    </div>
  )
}
