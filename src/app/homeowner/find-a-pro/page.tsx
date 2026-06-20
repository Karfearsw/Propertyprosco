import { db } from '@/lib/db'
import Link from 'next/link'
import { Shield, Star } from 'lucide-react'

export const metadata = { title: 'Find a Pro' }

export default async function FindAProPage({ searchParams }: { searchParams: Promise<{ category?: string; zip?: string; q?: string }> }) {
  const sp       = await searchParams
  const category = sp.category
  const zipCode  = sp.zip
  const q        = sp.q

  const users = await db.user.findMany({
    where: {
      role: 'PRO',
      proProfile: {
        ...(category ? { services: { has: category } } : {}),
      },
      ...(zipCode ? { zipCode: { contains: zipCode } } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode:'insensitive' } }, { proProfile: { businessName: { contains: q, mode:'insensitive' } } }] } : {}),
    },
    take: 30,
    include: { proProfile: true },
  })

  return (
    <div className="p-5 lg:p-6">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-5">Find a Pro</h1>

      {/* Search bar */}
      <form className="bg-white border border-pp-border rounded-2xl p-4 mb-5 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Search by name or service…" className="flex-1 min-w-[180px] px-3.5 py-2.5 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green"/>
        <input name="zip" defaultValue={zipCode} placeholder="ZIP code" className="w-28 px-3.5 py-2.5 border border-pp-border rounded-xl text-[14px] outline-none focus:border-pp-green"/>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-pp-green text-white text-[13px] font-black hover:bg-green-700 transition-all">Search</button>
      </form>

      <p className="text-[13px] font-bold text-pp-gray mb-4">{users.length} pro{users.length!==1?'s':''} found{category ? ` in ${category}` : ''}</p>

      {users.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-10 text-center">
          <p className="text-[14px] font-bold text-pp-gray">No pros found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="bg-white border border-pp-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-pp-red flex items-center justify-center text-base font-black text-white shrink-0">
                  {(u.name ?? 'PP').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-black text-pp-dark">{u.name}</div>
                  <div className="text-[12px] font-bold text-pp-gray truncate">{u.proProfile?.businessName ?? 'Independent Pro'}</div>
                  {u.zipCode && <div className="text-[11px] font-bold text-pp-gray">{u.zipCode}</div>}
                </div>
              </div>
              {(u.proProfile?.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] font-black text-pp-amber mb-2">
                  <Star size={12} fill="currentColor"/>
                  {u.proProfile?.rating} ({u.proProfile?.reviewCount} reviews)
                </div>
              )}
              {(u.proProfile?.services?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {u.proProfile!.services.slice(0,3).map(s => (
                    <span key={s} className="text-[10px] font-bold bg-pp-bg px-2 py-0.5 rounded-full text-pp-gray">{s}</span>
                  ))}
                  {(u.proProfile!.services.length ?? 0) > 3 && <span className="text-[10px] font-bold text-pp-gray">+{u.proProfile!.services.length-3}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                {u.proProfile?.insured && <span className="flex items-center gap-1 text-[10px] font-black text-pp-green"><Shield size={9}/>Insured</span>}
                {u.proProfile?.licensed && <span className="flex items-center gap-1 text-[10px] font-black text-pp-blue">✓ Licensed</span>}
                {(u.proProfile?.yearsExp ?? 0) > 0 && <span className="text-[10px] font-bold text-pp-gray">{u.proProfile?.yearsExp}y exp</span>}
              </div>
              <Link href={`/homeowner/messages?to=${u.id}`} className="block w-full text-center py-2.5 rounded-xl bg-pp-green text-white text-[13px] font-black hover:bg-green-700 transition-all">Contact Pro</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
