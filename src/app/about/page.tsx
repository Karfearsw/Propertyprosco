import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = { title: 'About Property Pros' }

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <div className="bg-pp-dark py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-red-400 mb-3">Our Story</p>
          <h1 className="font-display text-[48px] font-black text-white tracking-tight mb-4">About Property Pros</h1>
          <p className="text-[17px] text-gray-400 leading-relaxed">We&apos;re on a mission to make home improvement trustworthy, transparent, and accessible for everyone.</p>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="font-display text-[32px] font-black text-pp-dark tracking-tight mb-4">We started because hiring a contractor shouldn't feel like a gamble.</h2>
            <p className="text-[15px] text-pp-gray leading-relaxed mb-4">Founded in 2022, Property Pros was born out of frustration. Our founders got burned by unverified contractors — wasted money, terrible work, and zero accountability.</p>
            <p className="text-[15px] text-pp-gray leading-relaxed">We built the platform we wished existed: one where every pro is verified, every review is real, and homeowners always have the upper hand.</p>
          </div>
          <div className="bg-pp-dark rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-pp-red/10"/>
            <div className="text-[56px] font-black text-white tracking-tight mb-1">2022</div>
            <div className="text-[14px] font-bold text-gray-400 mb-8">Year Founded</div>
            <div className="grid grid-cols-2 gap-4">
              {[['50k+','Projects done'],['10k+','Verified pros'],['4.8★','Avg rating'],['49','States covered']].map(([n,l]) => (
                <div key={l} className="bg-white/6 border border-white/8 rounded-xl p-3">
                  <div className="text-[20px] font-black text-white">{n}</div>
                  <div className="text-[11px] text-gray-500 font-bold mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="font-display text-[32px] font-black text-pp-dark tracking-tight text-center mb-10">Our values</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { emoji:'🛡️', title:'Trust first',      body:'Every pro is screened. License & insurance verified. Reviews are two-way and unedited.' },
              { emoji:'🔍', title:'Full transparency', body:'No hidden fees. No per-lead charges. No price surprises. What you see is what you get.' },
              { emoji:'🤝', title:'Community driven',  body:'We reinvest 5% of subscription revenue into a local contractor training fund.' },
            ].map(v => (
              <div key={v.title} className="bg-pp-bg border border-pp-border rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{v.emoji}</div>
                <h3 className="text-[16px] font-black text-pp-dark mb-2">{v.title}</h3>
                <p className="text-[13px] text-pp-gray leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-display text-[32px] font-black text-pp-dark mb-4">Ready to get started?</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup/homeowner" className="px-7 py-4 rounded-2xl bg-pp-red text-white font-extrabold hover:bg-pp-red-dark transition-all">Post a Free Project</Link>
            <Link href="/signup/pro"       className="px-7 py-4 rounded-2xl border-2 border-pp-dark text-pp-dark font-extrabold hover:bg-pp-bg transition-all">Join as a Pro →</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
