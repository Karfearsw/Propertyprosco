import { auth } from '@/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import SendQuoteButton from '@/components/pro/SendQuoteButton'

export const metadata = { title: 'Saved Leads' }

export default async function SavedLeadsPage() {
  const session = await auth()
  const pro = await db.proProfile.findUnique({ where: { userId: session!.user.id } })
  const leads = pro ? await db.proLead.findMany({
    where: { proId: pro.id, saved: true },
    orderBy: { createdAt: 'desc' },
    include: { project: { include: { owner: { select:{ name:true, zipCode:true } }, _count: { select:{ quotes:true } } } } },
  }) : []

  return (
    <div className="p-5 lg:p-6">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight flex items-center gap-2 mb-5"><Bookmark size={22} className="text-pp-red"/>Saved Leads</h1>
      {leads.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-10 text-center">
          <Bookmark size={32} className="text-pp-gray mx-auto mb-3"/>
          <p className="text-[14px] font-bold text-pp-gray mb-2">No saved leads yet.</p>
          <Link href="/pro/leads" className="text-pp-red font-extrabold hover:underline">Browse leads →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(l => (
            <div key={l.id} className="bg-white border border-pp-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏠</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-black text-pp-dark">{l.project.title}</h3>
                  <p className="text-[12px] font-bold text-pp-gray mt-0.5">{l.project.category} · {l.project.owner.zipCode} · {l.project._count.quotes} quotes</p>
                  {l.project.description && <p className="text-[13px] text-pp-dark-3 font-semibold mt-1 line-clamp-2">{l.project.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[14px] font-black text-pp-dark">{l.project.budget ?? 'Open'}</div>
                  <div className="mt-2">
                    <SendQuoteButton projectId={l.project.id} proId={session!.user.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
