'use client'
import { useState } from 'react'
import MarketingShell from '@/components/layout/MarketingShell'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true); setLoading(false)
  }

  return (
    <MarketingShell>
      <div className="bg-pp-dark py-20 px-6 text-center">
        <h1 className="font-display text-[44px] font-black text-white tracking-tight mb-3">Contact Us</h1>
        <p className="text-[16px] text-gray-400 max-w-md mx-auto">Have a question or need help? We respond to all inquiries within one business day.</p>
      </div>

      <section className="py-20 px-6 max-w-5xl mx-auto grid md:grid-cols-[1fr_340px] gap-12">
        <div>
          {sent ? (
            <div className="bg-pp-green-light border border-green-200 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="text-[22px] font-black text-pp-dark mb-2">Message sent!</h2>
              <p className="text-[14px] font-bold text-green-700">We&apos;ll get back to you within one business day.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Name</label><input value={form.name} onChange={set('name')} required className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
                <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Email</label><input value={form.email} onChange={set('email')} type="email" required className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red"/></div>
              </div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Subject</label>
                <select value={form.subject} onChange={set('subject')} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red bg-white">
                  <option value="">Choose a topic…</option>
                  <option>General question</option><option>Pro account help</option><option>Homeowner support</option><option>Billing issue</option><option>Report a problem</option>
                </select>
              </div>
              <div><label className="block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2 mb-1.5">Message</label><textarea value={form.message} onChange={set('message')} required rows={5} className="w-full px-3.5 py-3 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-red resize-none"/></div>
              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-pp-red text-white text-[15px] font-black hover:bg-pp-red-dark transition-all disabled:opacity-60">{loading?'Sending…':'Send Message'}</button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {[{ icon:<Mail size={20}/>, label:'Email', value:'support@propertypros.com', color:'text-pp-red' },{ icon:<Phone size={20}/>, label:'Phone', value:'1-800-PRO-PROS', color:'text-pp-green' },{ icon:<MapPin size={20}/>, label:'Address', value:'Providence, RI 02903', color:'text-pp-blue' }].map(c => (
            <div key={c.label} className="bg-white border border-pp-border rounded-2xl p-5 flex gap-4">
              <div className={`w-10 h-10 rounded-xl bg-pp-bg flex items-center justify-center shrink-0 ${c.color}`}>{c.icon}</div>
              <div><div className="text-[12px] font-black uppercase tracking-[1px] text-pp-gray mb-0.5">{c.label}</div><div className="text-[14px] font-bold text-pp-dark">{c.value}</div></div>
            </div>
          ))}
          <div className="bg-pp-bg border border-pp-border rounded-2xl p-5">
            <h3 className="text-[14px] font-black text-pp-dark mb-1">Support hours</h3>
            <p className="text-[13px] font-bold text-pp-gray leading-relaxed">Monday – Friday: 8am – 8pm ET<br/>Saturday: 10am – 5pm ET<br/>Sunday: Email only</p>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
