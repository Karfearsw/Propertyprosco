import { auth } from '@/auth'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { getProjectWorkflowLabel, quoteStatusClasses, quoteStatusLabel } from '@/lib/quote-workflow'

export const metadata = { title: 'My Quotes' }

export default async function ProQuotesPage() {
  const session = await auth()
  const quotes  = await db.quote.findMany({
    where: { proId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    include: { project: { include: { owner: { select:{ name:true, zipCode:true } } } } },
  })

  const stats = {
    sent:     quotes.length,
    pending:  quotes.filter(q=>q.status==='PENDING').length,
    viewed:   quotes.filter(q=>q.status==='VIEWED').length,
    accepted: quotes.filter(q=>q.status==='ACCEPTED').length,
    declined: quotes.filter(q=>q.status==='DECLINED').length,
    total:    quotes.reduce((s,q)=>s+q.amount,0),
  }

  return (
    <div className="p-5 lg:p-6">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-5">My Quotes</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[['Quotes Sent',stats.sent,'text-pp-dark'],['Pending',stats.pending,'text-pp-gold'],['Viewed',stats.viewed,'text-pp-blue'],['Accepted',stats.accepted,'text-pp-green'],['Declined',stats.declined,'text-pp-red']].map(([l,v,c]) => (
          <div key={l as string} className="bg-white border border-pp-border rounded-2xl p-4">
            <div className={`text-[24px] font-black ${c}`}>{v}</div>
            <div className="text-[11px] font-bold text-pp-gray mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-pp-border flex items-center justify-between">
          <h2 className="text-[14px] font-black text-pp-dark">All Quotes</h2>
          <span className="text-[12px] font-bold text-pp-gray">Total value: {formatCurrency(stats.total)}</span>
        </div>
        {quotes.length === 0 ? (
          <div className="p-10 text-center"><p className="text-[14px] font-bold text-pp-gray mb-3">No quotes sent yet.</p><Link href="/pro/leads" className="text-pp-red font-extrabold hover:underline">Browse leads →</Link></div>
        ) : quotes.map(q => (
          <div key={q.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-black text-pp-dark truncate">{q.project.title}</div>
              <div className="text-[11px] font-bold text-pp-gray">{q.project.category} · {q.project.owner.zipCode} · {formatDate(q.createdAt)}</div>
              <div className="mt-1 text-[11px] font-bold text-pp-gray">{getProjectWorkflowLabel(q.project.status)}</div>
              {q.message && <div className="text-[12px] text-pp-dark-3 font-semibold mt-1 line-clamp-1">{q.message}</div>}
            </div>
            <span className="text-[14px] font-black text-pp-dark shrink-0">{formatCurrency(q.amount)}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${quoteStatusClasses[q.status]}`}>{quoteStatusLabel[q.status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
