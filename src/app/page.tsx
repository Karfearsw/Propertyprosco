import Link from 'next/link'
import { Search, MapPin, Star, Shield, Zap, Users, Home, Hammer, Briefcase, ChevronRight, CheckCircle } from 'lucide-react'
import MarketingShell from '@/components/layout/MarketingShell'
import ServiceIcon from '@/components/brand/ServiceIcon'
import TrustBadge from '@/components/brand/TrustBadge'
import DiscoverySearchForm from '@/components/find-a-pro/DiscoverySearchForm'

const services = [
  { name: 'Roofing',      count: '2,400+ pros' },
  { name: 'Plumbing',     count: '1,800+ pros' },
  { name: 'Electrical',   count: '1,600+ pros' },
  { name: 'Painting',     count: '3,100+ pros' },
  { name: 'Landscaping',  count: '2,200+ pros' },
  { name: 'Remodeling',   count: '1,900+ pros' },
  { name: 'HVAC',         count: '1,400+ pros' },
  { name: 'Windows',      count: '1,200+ pros' },
]

const steps = [
  { n:'1', title:'Post Your Project', body:'Describe your project for free. No account needed to browse — sign up takes 2 minutes.', color:'text-pp-red' },
  { n:'2', title:'Get Quotes Fast',   body:'Verified local pros send you competitive quotes. Average first quote in under 2 hours.', color:'text-pp-green' },
  { n:'3', title:'Hire with Confidence', body:'Compare ratings, reviews, licenses, and insurance. Message pros directly — no middleman.', color:'text-pp-gold' },
]

const featuredPros = [
  { initials:'KH', color:'bg-pp-red',   name:'Kevin H.',   trade:'General Contractor', rating:'4.9', jobs:'143', verified:true },
  { initials:'MS', color:'bg-pp-blue',  name:'Maria S.',   trade:'Electrician',         rating:'5.0', jobs:'98',  verified:true },
  { initials:'TJ', color:'bg-pp-green', name:'Tom J.',     trade:'Plumber',             rating:'4.8', jobs:'211', verified:true },
  { initials:'AL', color:'bg-pp-gold',  name:'Amy L.',     trade:'Interior Designer',   rating:'4.9', jobs:'76',  verified:true },
]

export default function HomePage() {
  return (
    <MarketingShell>

      {/* HERO */}
      <section className="bg-pp-dark relative overflow-hidden pt-20 pb-0">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(220,38,38,0.12) 0%, transparent 65%)' }} />

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_420px] gap-14 items-end relative z-10">
          <div className="pb-20">
            <div className="inline-flex items-center gap-2 text-[11px] font-black tracking-[2px] uppercase text-red-400 mb-5 px-4 py-1.5 rounded-full border border-red-400/20 bg-pp-red/8">
              <ServiceIcon name="Roofing" className="h-4 w-4 text-red-400" />
              America&apos;s Trusted Home Services Marketplace
            </div>
            <h1 className="font-display text-[56px] lg:text-[64px] font-black text-white leading-[1.05] tracking-[-2px] mb-5">
              Find the right pro.<br /><span className="text-red-400">Get it done right.</span>
            </h1>
            <p className="text-[17px] text-gray-400 leading-[1.8] max-w-lg mb-8">
              Connect with verified, rated, and insured local professionals for any home project — from roof replacements to driveways to full remodels.
            </p>

            <DiscoverySearchForm className="mb-5 max-w-2xl" submitLabel="Find pros" />

            <div className="flex gap-2 flex-wrap mb-7">
              {['Roofing','Driveways','Remodeling','Masonry','Painting','Landscaping','+ More'].map(s => (
                <Link
                  key={s}
                  href={s === '+ More' ? '/find-a-pro' : `/find-a-pro?category=${encodeURIComponent(s)}`}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-bold border border-white/12 text-gray-400 hover:text-white hover:border-white/30 transition-all"
                >
                  {s}
                </Link>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              <TrustBadge type="verified" />
              <TrustBadge type="insured" />
              <TrustBadge type="licensed" />
            </div>
          </div>

          {/* Hero card */}
          <div className="bg-white rounded-t-2xl p-5 shadow-[-0px_-24px_60px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] font-black text-pp-dark">Top Pros Near You</span>
              <span className="text-[10px] font-black bg-pp-green-light text-green-800 px-2.5 py-0.5 rounded-full">4 Available</span>
            </div>
            {featuredPros.slice(0,3).map(p => (
              <div key={p.name} className="flex items-center gap-2.5 py-3 border-b border-pp-border last:border-0 last:pb-0">
                <div className={`relative w-9 h-9 rounded-[10px] ${p.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>
                  {p.initials}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-black text-pp-dark">{p.name}</div>
                  <div className="text-[11px] text-pp-gray font-bold">{p.trade}</div>
                  <div className="text-[11px] text-pp-amber font-black">{'★'.repeat(5)} {p.rating}</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-black text-pp-dark">{p.jobs} jobs</div>
                  <div className="text-[10px] font-black text-pp-green">✓ Verified</div>
                </div>
              </div>
            ))}
            <div className="mt-3.5 bg-pp-dark rounded-xl p-3 flex gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1" />
              <div>
                <div className="text-[12px] font-bold text-gray-300">New lead in your area: Roof replacement, 02903</div>
                <div className="text-[10px] font-bold text-gray-600 mt-0.5">2 mins ago</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="bg-pp-red py-5 flex items-center justify-center gap-12 lg:gap-16 flex-wrap">
        {[['10,000+','Verified Pros'],['50,000+','Projects Complete'],['4.8★','Avg Rating'],['$0','To Join (Owners)']].map(([n,l]) => (
          <div key={l} className="text-center">
            <div className="text-3xl font-black text-white tracking-tight leading-none">{n}</div>
            <div className="text-[11px] font-bold text-red-200 mt-1 uppercase tracking-widest">{l}</div>
          </div>
        ))}
      </div>

      {/* USER TYPES */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-pp-red text-center mb-3">Who We Serve</p>
          <h2 className="font-display text-[40px] font-black tracking-tight text-pp-dark text-center mb-4 leading-tight">Built for three types of users</h2>
          <p className="text-[16px] text-pp-gray text-center max-w-lg mx-auto mb-14 leading-relaxed">Homeowners, service professionals, and real estate agents each get tools built exactly for them.</p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { type:'homeowner', icon:<Home size={32}/>, badge:'Property Owner', title:'Post Projects Free', price:'Always free',  priceColor:'text-pp-green', borderColor:'border-green-200', bg:'bg-pp-green-light', btnBg:'bg-pp-green hover:bg-green-700', features:['Post unlimited projects','Compare quotes side-by-side','Verified licensed pros only','Free forever — no credit card'], href:'/signup/homeowner' },
              { type:'pro',       icon:<Hammer size={32}/>, badge:'Service Pro',  title:'Get Unlimited Leads', price:'$9.99/month', priceColor:'text-pp-red',   borderColor:'border-red-200',   bg:'bg-pp-red-light',   btnBg:'bg-pp-red hover:bg-pp-red-dark',   features:['Unlimited leads in your area','Send quotes directly to owners','Build your verified profile','Monthly plan with no per-lead fees'], href:'/signup/pro' },
              { type:'realtor',   icon:<Briefcase size={32}/>, badge:'Realtor',  title:'Manage Clients & Pros', price:'$24.99/month', priceColor:'text-pp-gold', borderColor:'border-amber-200', bg:'bg-pp-gold-light',  btnBg:'bg-pp-gold hover:bg-amber-800',    features:['Manage all your clients','Assign contractors per listing','Track deadlines & inspections','Monthly plan with cancel-anytime billing'], href:'/signup/realtor' },
            ].map(u => (
              <div key={u.type} className={`rounded-3xl p-8 ${u.bg} border ${u.borderColor} hover:-translate-y-1 transition-transform`}>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center mb-3 opacity-80">{u.icon}</div>
                  <div className={`text-[10px] font-black tracking-[2px] uppercase mb-2 ${u.priceColor}`}>{u.badge}</div>
                  <div className="text-[22px] font-black text-pp-dark mb-1">{u.title}</div>
                  <div className={`text-[14px] font-black ${u.priceColor}`}>{u.price}</div>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {u.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[13px] font-bold text-pp-dark-3">
                      <CheckCircle size={15} className={`shrink-0 mt-0.5 ${u.priceColor}`} />{f}
                    </li>
                  ))}
                </ul>
                <Link href={u.href} className={`block w-full text-center py-3 rounded-xl text-[13px] font-black text-white ${u.btnBg} transition-all`}>Get Started →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-pp-bg py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-pp-red text-center mb-3">100+ Categories</p>
          <h2 className="font-display text-[36px] font-black tracking-tight text-pp-dark text-center mb-14 leading-tight">Whatever the job, we have the pro</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map(s => (
              <Link key={s.name} href={`/find-a-pro?category=${encodeURIComponent(s.name)}`}
                className="bg-white border border-pp-border rounded-2xl p-6 text-center hover:border-pp-red hover:shadow-md transition-all group">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pp-red-light">
                  <ServiceIcon name={s.name} className="h-7 w-7 text-pp-red" />
                </div>
                <div className="text-[14px] font-black text-pp-dark mb-1 group-hover:text-pp-red transition-colors">{s.name}</div>
                <div className="text-[11px] font-bold text-pp-gray">{s.count}</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/find-a-pro" className="inline-flex items-center gap-2 text-pp-red font-extrabold hover:underline">View all categories <ChevronRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-black tracking-[2px] uppercase text-pp-red text-center mb-3">Simple Process</p>
          <h2 className="font-display text-[36px] font-black tracking-tight text-pp-dark text-center mb-16 leading-tight">Get it done in 3 easy steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s,i) => (
              <div key={s.n} className="text-center">
                <div className={`w-14 h-14 rounded-full bg-pp-bg border-2 border-pp-border flex items-center justify-center text-2xl font-black ${s.color} mx-auto mb-5`}>{s.n}</div>
                <h3 className="text-[18px] font-black text-pp-dark mb-3">{s.title}</h3>
                <p className="text-[14px] text-pp-gray leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROS */}
      <section className="bg-pp-bg py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[11px] font-black tracking-[2px] uppercase text-pp-red mb-2">Top Rated</p>
              <h2 className="font-display text-[32px] font-black tracking-tight text-pp-dark">Featured professionals</h2>
            </div>
            <Link href="/find-a-pro" className="hidden sm:flex items-center gap-1.5 text-pp-red font-extrabold hover:underline">See all <ChevronRight size={15}/></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPros.map(p => (
              <div key={p.name} className="bg-white border border-pp-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center text-base font-black text-white mb-3`}>{p.initials}</div>
                <div className="text-[14px] font-black text-pp-dark">{p.name}</div>
                <div className="text-[12px] text-pp-gray font-bold mb-2">{p.trade}</div>
                <div className="text-[12px] text-pp-amber font-black mb-1">★★★★★ {p.rating}</div>
                <div className="text-[11px] text-pp-gray font-bold">{p.jobs} jobs completed</div>
                {p.verified && <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-pp-green bg-pp-green-light px-2 py-0.5 rounded-full"><Shield size={9}/>Verified</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pp-dark py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-display text-[44px] font-black text-white tracking-tight mb-5 leading-tight">Ready to find your next trusted pro?</h2>
          <p className="text-[16px] text-gray-400 leading-relaxed mb-10">Join thousands of homeowners who found the right contractor the first time — no headaches, no surprises.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup/homeowner" className="px-8 py-4 rounded-2xl bg-pp-red text-white font-extrabold text-[15px] hover:bg-pp-red-dark transition-all">Post a Project Free</Link>
            <Link href="/signup/pro" className="px-8 py-4 rounded-2xl border border-white/20 text-white font-extrabold text-[15px] hover:bg-white/8 transition-all">Join as a Pro →</Link>
          </div>
        </div>
      </section>

    </MarketingShell>
  )
}
