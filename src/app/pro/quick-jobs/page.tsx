import { auth } from '@/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import SendQuoteButton from '@/components/pro/SendQuoteButton'

export const metadata = { title: 'Quick Jobs' }

export default async function QuickJobsProPage() {
  const session = await auth()
  const quickProjects = await db.project.findMany({
    where: { status:'OPEN', urgent: true },
    orderBy: { createdAt:'desc' },
    take: 20,
    include: { owner: { select:{ name:true, zipCode:true } }, _count: { select:{ quotes:true } } },
  })

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-5">
        <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-1">⚡ Quick Jobs</h1>
        <p className="text-[13px] font-bold text-pp-gray">Urgent projects needing fast turnaround — respond quickly to win the job.</p>
      </div>

      {quickProjects.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-10 text-center">
          <p className="text-[14px] font-bold text-pp-gray mb-2">No urgent jobs right now.</p>
          <Link href="/pro/leads" className="text-pp-red font-extrabold hover:underline">Browse all leads →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quickProjects.map(p => (
            <div key={p.id} className="bg-white border-2 border-pp-red-light rounded-2xl p-4 hover:border-pp-red transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-black text-pp-dark">{p.title}</h3>
                    <span className="text-[10px] font-black bg-pp-red text-white px-2 py-0.5 rounded-full shrink-0">Urgent</span>
                  </div>
                  <p className="text-[12px] font-bold text-pp-gray">{p.category} · {p.owner.zipCode} · {p._count.quotes} quotes</p>
                  {p.description && <p className="text-[13px] text-pp-dark-3 font-semibold mt-1 line-clamp-2">{p.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[14px] font-black text-pp-dark mb-2">{p.budget ?? 'Open'}</div>
                  <SendQuoteButton projectId={p.id} proId={session!.user.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
