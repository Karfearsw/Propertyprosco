import { db } from '@/lib/db'
import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Star } from 'lucide-react'
import TrustBadge from '@/components/brand/TrustBadge'
import EmptyState from '@/components/brand/EmptyState'

export const metadata = { title: 'Find a Pro' }

export default async function PublicFindAProPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; zip?: string }> }) {
  const sp       = await searchParams
  const category = sp.category
  const q        = sp.q
  const zip      = sp.zip

  const pros = await db.proProfile.findMany({
    where: {
      ...(category ? { services: { has: category } } : {}),
      ...(q
        ? {
            OR: [
              { businessName: { contains: q, mode: 'insensitive' } },
              { user: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(zip ? { user: { zipCode: { contains: zip } } } : {}),
    },
    take: 30,
    include: { user: true },
  })

  return (
    <>
      <PublicHeader />
      <div className="bg-pp-dark py-16 px-6">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="font-display text-[40px] font-black text-white tracking-tight mb-3">Find a Verified Pro</h1>
          <p className="text-[15px] text-gray-400">All pros are screened, licensed, and reviewed.</p>
        </div>
        <form className="max-w-2xl mx-auto flex flex-wrap gap-2">
          <input name="q" defaultValue={q} placeholder="Search by trade or name…" className="flex-1 min-w-[180px] px-4 py-3 rounded-xl text-[14px] bg-white/10 border border-white/15 text-white placeholder-gray-500 outline-none focus:border-pp-red"/>
          <input name="zip" defaultValue={zip} placeholder="ZIP code" className="w-28 px-4 py-3 rounded-xl text-[14px] bg-white/10 border border-white/15 text-white placeholder-gray-500 outline-none focus:border-pp-red"/>
          <button type="submit" className="px-6 py-3 rounded-xl bg-pp-red text-white text-[14px] font-black hover:bg-pp-red-dark transition-all">Search</button>
        </form>
      </div>

      <section className="py-12 px-6 max-w-5xl mx-auto">
        <p className="text-[13px] font-bold text-pp-gray mb-5">{pros.length} verified pro{pros.length!==1?'s':''} found</p>
        {pros.length === 0 ? (
          <EmptyState title="No pros found" body="Try a different search, category, or ZIP code to broaden your results." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pros.map((pro) => (
              <div key={pro.id} className="bg-white border border-pp-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pp-red flex items-center justify-center text-base font-black text-white shrink-0">{(pro.user.name ?? 'PP').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-black text-pp-dark">{pro.user.name}</div>
                    <div className="text-[12px] font-bold text-pp-gray truncate">{pro.businessName ?? 'Independent Pro'}</div>
                    {pro.user.zipCode && <div className="text-[11px] font-bold text-pp-gray">📍 {pro.user.zipCode}</div>}
                  </div>
                </div>
                {(pro.rating ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] font-black text-pp-amber mb-3"><Star size={12} fill="currentColor"/>{pro.rating} ({pro.reviewCount} reviews)</div>
                )}
                {(pro.services?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">{pro.services.slice(0,4).map((service) => <span key={service} className="text-[10px] font-bold bg-pp-bg px-2 py-0.5 rounded-full text-pp-gray">{service}</span>)}</div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  {pro.insured && <TrustBadge type="insured" />}
                  {pro.licensed && <TrustBadge type="licensed" />}
                  {(pro.yearsExp ?? 0) > 0 && <span className="text-[10px] font-bold text-pp-gray">{pro.yearsExp}y exp</span>}
                </div>
                <Link href="/signup/homeowner" className="block w-full text-center py-2.5 rounded-xl bg-pp-red text-white text-[13px] font-black hover:bg-pp-red-dark transition-all">Contact Pro</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-pp-bg border-y border-pp-border py-12 px-6 text-center">
        <h2 className="font-display text-[28px] font-black text-pp-dark mb-3">Can&apos;t find the right pro?</h2>
        <p className="text-[14px] font-bold text-pp-gray mb-6">Post your project free and let verified pros come to you with competitive quotes.</p>
        <Link href="/signup/homeowner" className="inline-block px-8 py-4 rounded-2xl bg-pp-red text-white font-extrabold hover:bg-pp-red-dark transition-all">Post a Free Project</Link>
      </div>
      <Footer />
    </>
  )
}
