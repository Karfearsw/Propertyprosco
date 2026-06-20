import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const metadata = { title: 'Pricing' }

const plans = [
  {
    name: 'Property Owner',
    price: '$0',
    period: 'Forever free',
    color: 'text-pp-green',
    border: 'border-green-200',
    bg: 'bg-pp-green-light',
    btn: 'bg-pp-green hover:bg-green-700',
    href: '/signup/homeowner',
    cta: 'Get started free',
    features: ['Post unlimited projects','Receive unlimited quotes','Message pros directly','Two-way verified ratings','Save & manage favorite pros','Project history & tracking','Always free — no credit card ever'],
  },
  {
    name: 'Service Pro',
    price: '$9.99',
    period: '/month',
    color: 'text-pp-red',
    border: 'border-red-200',
    bg: 'bg-pp-red-light',
    btn: 'bg-pp-red hover:bg-pp-red-dark',
    href: '/signup/pro',
    cta: 'Start Pro account',
    popular: true,
    features: ['Unlimited leads in your area','Send unlimited quotes','Verified business profile','License & insurance badge','Direct messaging','Schedule management','Saved leads','Priority listing in search','Flat monthly pricing — no per-lead fees'],
  },
  {
    name: 'Realtor',
    price: '$24.99',
    period: '/month',
    color: 'text-pp-gold',
    border: 'border-amber-200',
    bg: 'bg-pp-gold-light',
    btn: 'bg-pp-gold hover:bg-amber-800',
    href: '/signup/realtor',
    cta: 'Start Realtor account',
    features: ['Unlimited client management','Post projects on behalf of clients','Assign pros to listings','Track deadlines & inspections','Direct messaging with contractors','Referral program access','Priority support','Flat monthly pricing — cancel anytime'],
  },
]

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <section className="bg-pp-dark py-20 px-6 text-center">
        <p className="text-[11px] font-black tracking-[2px] uppercase text-red-400 mb-3">Simple Pricing</p>
        <h1 className="font-display text-[48px] font-black text-white tracking-tight mb-4">Fair pricing. No surprises.</h1>
        <p className="text-[17px] text-gray-400 max-w-xl mx-auto leading-relaxed">Owners always free. Pros and Realtors on a flat monthly plan — no per-lead fees, no commissions, no gotchas.</p>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.name} className={`relative rounded-3xl p-8 border-2 ${p.bg} ${p.border} ${p.popular ? 'ring-2 ring-pp-red' : ''}`}>
              {p.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pp-red text-white text-[11px] font-black px-4 py-1.5 rounded-full">Most Popular</div>}
              <div className="text-center mb-7">
                <div className={`text-[12px] font-black tracking-[1.5px] uppercase mb-2 ${p.color}`}>{p.name}</div>
                <div className="text-[40px] font-black text-pp-dark tracking-tight">{p.price}</div>
                <div className={`text-[12px] font-bold ${p.color} mt-0.5`}>{p.period}</div>
              </div>
              <ul className="space-y-3 mb-7">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px] font-bold text-pp-dark-3">
                    <CheckCircle size={15} className={`${p.color} shrink-0 mt-0.5`}/>{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`block w-full text-center py-3.5 rounded-2xl text-[14px] font-black text-white ${p.btn} transition-all`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-pp-bg">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-[28px] font-black text-pp-dark text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              ['Is it really free for homeowners?', 'Yes, 100% free. Always. No credit card and no hidden fees. We make money from Pro and Realtor subscriptions.'],
              ['Are there per-lead or per-quote fees?', 'No. Pros pay one flat monthly fee and get unlimited leads and unlimited quotes. No surprises.'],
              ['When does billing start for paid roles?', 'Billing starts once a Pro or Realtor adds a payment method and activates their subscription from the billing flow. Homeowners stay free.'],
              ['Can I cancel anytime?', 'Yes. After activation, manage or cancel your plan from the Stripe billing portal linked from your billing page.'],
              ['Is my payment information secure?', 'Yes. We use Stripe for payment processing — the same system used by Amazon and millions of other businesses.'],
            ].map(([q,a]) => (
              <div key={q} className="bg-white border border-pp-border rounded-2xl p-5">
                <div className="text-[14px] font-black text-pp-dark mb-1.5">{q}</div>
                <div className="text-[13px] text-pp-gray font-bold leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
