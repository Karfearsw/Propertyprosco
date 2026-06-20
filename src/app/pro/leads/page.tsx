import { db } from '@/lib/db'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import SendQuoteButton from '@/components/pro/SendQuoteButton'
import { requireRole } from '@/lib/auth-guards'
import { getPaidAccessContext } from '@/lib/require-paid-access'
import { getBillingStatusLabel } from '@/lib/billing-state'

export const metadata = { title: 'Leads' }

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams
  const user = await requireRole('PRO')
  const billing = await getPaidAccessContext()
  const userId = user.id
  const page = parseInt(sp.page ?? '1')
  const limit = 20

  if (!billing || billing.role !== 'PRO') {
    return null
  }

  const projects = billing.hasFullAccess
    ? await db.project.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { owner: { select: { name: true, zipCode: true } }, _count: { select: { quotes: true } } },
      })
    : []

  const total = billing.hasFullAccess ? await db.project.count({ where: { status: 'OPEN' } }) : 0

  const myQuotedIds =
    billing.profile
      ? (
          await db.quote.findMany({
            where: { proId: userId },
            select: { projectId: true },
          })
        ).map((q) => q.projectId)
      : []

  return (
    <div className="p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-black text-pp-dark tracking-tight flex items-center gap-2"><Zap size={22} className="text-pp-red"/>Available Leads</h1>
          <p className="text-[13px] text-pp-gray font-bold mt-1">{total} open projects in your area</p>
        </div>
      </div>

      {!billing.hasFullAccess && (
        <div className="bg-pp-red-light border border-red-200 rounded-xl p-4 mb-5">
          <p className="text-[13px] font-extrabold text-pp-red">
            ⚠️ Your lead access is currently {getBillingStatusLabel(billing.effectiveStatus).toLowerCase()}.{' '}
            <Link href="/pro/billing" className="underline">
              Update billing to restore full access
            </Link>.
          </p>
        </div>
      )}

      {billing.hasFullAccess ? <div className="space-y-3">
        {projects.map(p => (
          <div key={p.id} className="bg-white border border-pp-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0 mt-0.5">🏠</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-black text-pp-dark truncate">{p.title}</h3>
                  {p.urgent && <span className="text-[10px] font-black bg-pp-red-light text-pp-red px-2 py-0.5 rounded-full shrink-0">Urgent</span>}
                  <span className="text-[10px] font-black bg-pp-blue-light text-pp-blue px-2 py-0.5 rounded-full shrink-0">New</span>
                </div>
                <p className="text-[13px] text-pp-gray font-bold mb-2">{p.category} · {p.owner.zipCode ?? 'Nearby'} · {p._count.quotes} quote{p._count.quotes!==1?'s':''}</p>
                {p.description && <p className="text-[13px] text-pp-dark-3 font-semibold line-clamp-2">{p.description}</p>}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="text-[14px] font-black text-pp-dark">{p.budget ?? 'Open'}</span>
                {myQuotedIds.includes(p.id) ? (
                  <span className="text-[11px] font-black text-pp-green bg-pp-green-light px-3 py-1.5 rounded-lg">✓ Quote Sent</span>
                ) : (
                  <SendQuoteButton projectId={p.id} proId={userId} />
                )}
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="bg-white border border-pp-border rounded-2xl p-10 text-center text-[14px] font-bold text-pp-gray">No open leads right now. Check back soon!</div>}
      </div> : (
        <div className="bg-white border border-pp-border rounded-2xl p-10 text-center">
          <h2 className="text-[18px] font-black text-pp-dark mb-2">Lead access is paused</h2>
          <p className="text-[13px] font-bold text-pp-gray max-w-md mx-auto">
            Your subscription needs attention before you can browse or quote new homeowner projects again.
          </p>
          <Link href="/pro/billing" className="mt-5 inline-flex rounded-xl bg-pp-red px-5 py-3 text-[13px] font-black text-white hover:bg-pp-red-dark transition-all">
            Open Billing
          </Link>
        </div>
      )}

      {billing.hasFullAccess && total > limit && (
        <div className="flex justify-center gap-3 mt-6">
          {page > 1 && <Link href={`?page=${page-1}`} className="px-4 py-2 rounded-xl border border-pp-border font-bold text-[13px] hover:bg-pp-bg">← Prev</Link>}
          <span className="px-4 py-2 text-[13px] font-bold text-pp-gray">Page {page} of {Math.ceil(total/limit)}</span>
          {page < Math.ceil(total/limit) && <Link href={`?page=${page+1}`} className="px-4 py-2 rounded-xl border border-pp-border font-bold text-[13px] hover:bg-pp-bg">Next →</Link>}
        </div>
      )}
    </div>
  )
}
