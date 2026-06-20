import { CheckCircle } from 'lucide-react'

export const metadata = { title: 'Billing' }

export default function HomeownerBillingPage() {
  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-6">Billing</h1>
      <div className="bg-pp-green-light border border-green-200 rounded-2xl p-8 text-center mb-4">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-[22px] font-black text-pp-dark mb-2">Your account is free forever</h2>
        <p className="text-[14px] font-bold text-green-700 leading-relaxed">Property Owner accounts on Property Pros are always 100% free. No subscription, no per-project fees, no catch.</p>
      </div>
      <div className="bg-white border border-pp-border rounded-2xl p-6">
        <h2 className="text-[15px] font-black text-pp-dark mb-4">What&apos;s included — free forever</h2>
        <div className="space-y-3">
          {['Post unlimited projects','Receive unlimited quotes','Message pros directly','Read verified reviews & ratings','Save your favorite pros','Project management tools'].map(f => (
            <div key={f} className="flex items-center gap-2.5 text-[13px] font-bold text-pp-dark-3">
              <CheckCircle size={16} className="text-pp-green shrink-0"/>{f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
