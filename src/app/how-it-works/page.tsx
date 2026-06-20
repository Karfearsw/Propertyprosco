import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = { title: 'How It Works' }

export default function HowItWorksPage() {
  return (
    <>
      <PublicHeader />
      <div className="bg-pp-dark py-20 px-6 text-center">
        <p className="text-[11px] font-black tracking-[2px] uppercase text-red-400 mb-3">Simple Process</p>
        <h1 className="font-display text-[48px] font-black text-white tracking-tight mb-4">How Property Pros works</h1>
        <p className="text-[17px] text-gray-400 max-w-xl mx-auto leading-relaxed">Post your project, get competing quotes from verified pros, and hire with total confidence.</p>
      </div>

      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="font-display text-[28px] font-black text-pp-dark text-center mb-12">For Property Owners</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { n:'1', title:'Post your project', body:'Describe the job, your budget, and your location. It\'s free and takes less than 2 minutes. No account required to browse.', color:'border-pp-green text-pp-green' },
            { n:'2', title:'Receive quotes',     body:'Verified local pros see your project and send you competitive quotes — usually within a few hours.', color:'border-pp-blue text-pp-blue' },
            { n:'3', title:'Hire with confidence', body:'Compare quotes, read verified reviews, check licenses and insurance, then message your chosen pro directly.', color:'border-pp-red text-pp-red' },
          ].map(s => (
            <div key={s.n} className="text-center">
              <div className={`w-14 h-14 rounded-full border-2 ${s.color} flex items-center justify-center text-2xl font-black mx-auto mb-5`}>{s.n}</div>
              <h3 className="text-[18px] font-black text-pp-dark mb-3">{s.title}</h3>
              <p className="text-[14px] text-pp-gray leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="bg-pp-red-light border border-red-200 rounded-3xl p-8 mb-12">
          <h2 className="font-display text-[28px] font-black text-pp-dark mb-8 text-center">For Service Pros</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n:'1', title:'Create your profile',    body:'Sign up, list your services and service area, add your license and insurance details. It takes 5 minutes.' },
              { n:'2', title:'Browse open leads',      body:'See projects posted by homeowners in your area. Filter by category, budget, and location.' },
              { n:'3', title:'Send quotes & win jobs', body:'Send competitive quotes and messages directly. Get hired, get paid, and earn reviews.' },
            ].map(s => (
              <div key={s.n}>
                <div className="text-[28px] font-black text-pp-red mb-2">{s.n}</div>
                <h3 className="text-[15px] font-black text-pp-dark mb-2">{s.title}</h3>
                <p className="text-[13px] text-pp-gray leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-display text-[28px] font-black text-pp-dark mb-4">Ready to get started?</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup/homeowner" className="px-7 py-4 rounded-2xl bg-pp-red text-white font-extrabold hover:bg-pp-red-dark transition-all">Post a Free Project</Link>
            <Link href="/signup/pro"       className="px-7 py-4 rounded-2xl border-2 border-pp-dark text-pp-dark font-extrabold hover:bg-pp-bg transition-all">Join as a Pro</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
