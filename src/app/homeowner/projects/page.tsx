import { auth } from '@/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'

export const metadata = { title: 'My Projects' }

export default async function HomeownerProjectsPage() {
  const session  = await auth()
  const projects = await db.project.findMany({
    where: { ownerId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select:{ quotes:true } }, quotes: { orderBy:{ createdAt:'desc' }, take:3, include:{ pro:{ select:{ id:true, name:true, image:true } } } } },
  })

  const statusColor: Record<string,string> = { OPEN:'bg-pp-blue-light text-pp-blue', IN_PROGRESS:'bg-pp-gold-light text-pp-gold', COMPLETED:'bg-pp-green-light text-pp-green', CANCELLED:'bg-red-100 text-pp-red' }

  return (
    <div className="p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-black text-pp-dark tracking-tight">My Projects</h1>
        <Link href="/homeowner/post-project" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pp-green text-white text-[13px] font-black hover:bg-green-700 transition-all"><PlusCircle size={15}/>Post Project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-12 text-center">
          <p className="text-[15px] font-bold text-pp-gray mb-4">You haven&apos;t posted any projects yet.</p>
          <Link href="/homeowner/post-project" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pp-green text-white text-[14px] font-black hover:bg-green-700"><PlusCircle size={16}/>Post Your First Project</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-[16px] font-black text-pp-dark mb-1">{p.title}</h2>
                    <p className="text-[12px] font-bold text-pp-gray">{p.category} · Posted {formatDate(p.createdAt)}{p.zipCode ? ` · ${p.zipCode}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.budget && <span className="text-[14px] font-black text-pp-dark">{p.budget}</span>}
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor[p.status]}`}>{p.status.replace('_',' ')}</span>
                  </div>
                </div>
                {p.description && <p className="text-[13px] text-pp-dark-3 font-semibold leading-relaxed mb-3">{p.description}</p>}
                <div className="flex items-center gap-4 text-[12px] font-black">
                  <span className="text-pp-dark">{p._count.quotes} quote{p._count.quotes!==1?'s':''} received</span>
                  {p.urgent && <span className="text-pp-red">⚡ Urgent</span>}
                </div>
              </div>

              {p.quotes.length > 0 && (
                <div className="border-t border-pp-border bg-pp-bg/50 px-5 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[1px] text-pp-gray mb-2">Recent Quotes</p>
                  <div className="space-y-2">
                    {p.quotes.map(q => (
                      <div key={q.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-pp-red flex items-center justify-center text-[10px] font-black text-white shrink-0">
                          {q.pro.name?.slice(0,2).toUpperCase() ?? 'PP'}
                        </div>
                        <span className="text-[13px] font-black text-pp-dark flex-1">{q.pro.name}</span>
                        <span className="text-[13px] font-black text-pp-dark">{formatCurrency(q.amount)}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${q.status==='ACCEPTED'?'bg-pp-green-light text-pp-green':q.status==='VIEWED'?'bg-pp-blue-light text-pp-blue':'bg-pp-gold-light text-pp-gold'}`}>{q.status.charAt(0)+q.status.slice(1).toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
